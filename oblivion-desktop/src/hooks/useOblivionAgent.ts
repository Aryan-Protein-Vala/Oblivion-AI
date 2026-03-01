import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ─── */
export type ConnectionState = "disconnected" | "connecting" | "connected";

export interface AgentMessage {
  id: string;
  role: "user" | "agent" | "system";
  text: string;
  timestamp: number;
  state?: "streaming" | "done" | "error";
}

/** Gateway protocol frame types */
interface RequestFrame {
  type: "req";
  id: string;
  method: string;
  params?: unknown;
}

interface ResponseFrame {
  type: "res";
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: { code: string; message: string };
}

interface EventFrame {
  type: "event";
  event: string;
  payload?: unknown;
  seq?: number;
}

interface HelloOk {
  type: "hello-ok";
  protocol: number;
  server: { version: string; connId: string };
  features: { methods: string[]; events: string[] };
}

type GatewayFrame = ResponseFrame | EventFrame | HelloOk;

interface ChatEvent {
  runId: string;
  sessionKey: string;
  seq: number;
  state: "delta" | "final" | "aborted" | "error";
  message?: unknown;
  errorMessage?: string;
}

/* ─── Config ─── */
const GATEWAY_PORT = 18789;
const PROTOCOL_VERSION = 1;
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_DELAY_MS = 30000;

/* ─── Hook ─── */
export function useOblivionAgent() {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [serverVersion, setServerVersion] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const requestIdRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(RECONNECT_DELAY_MS);
  const sessionKeyRef = useRef(`oblivion-desktop-${Date.now()}`);
  const streamBufferRef = useRef<Map<string, string>>(new Map());

  /** Generate unique request ID */
  const nextId = useCallback((): string => {
    requestIdRef.current += 1;
    return `req-${requestIdRef.current}-${Date.now()}`;
  }, []);

  /** Send a raw frame to the gateway */
  const sendFrame = useCallback((frame: RequestFrame) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(frame));
    }
  }, []);

  /** Add a system message */
  const addSystemMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "system" as const,
        text,
        timestamp: Date.now(),
        state: "done" as const,
      },
    ]);
  }, []);

  /** Handle incoming ChatEvent */
  const handleChatEvent = useCallback((event: ChatEvent) => {
    const { runId, state } = event;

    if (state === "delta") {
      // Extract text from message payload
      const deltaText = extractTextFromMessage(event.message);
      if (!deltaText) return;

      // Accumulate in stream buffer
      const current = streamBufferRef.current.get(runId) ?? "";
      const updated = current + deltaText;
      streamBufferRef.current.set(runId, updated);

      // Update or create the agent message
      setMessages((prev) => {
        const existingIdx = prev.findIndex((m) => m.id === runId);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            text: updated,
            state: "streaming",
          };
          return next;
        }
        return [
          ...prev,
          {
            id: runId,
            role: "agent",
            text: updated,
            timestamp: Date.now(),
            state: "streaming",
          },
        ];
      });
    } else if (state === "final") {
      const finalText =
        streamBufferRef.current.get(runId) ??
        extractTextFromMessage(event.message) ??
        "";
      streamBufferRef.current.delete(runId);

      setMessages((prev) => {
        const existingIdx = prev.findIndex((m) => m.id === runId);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            text: finalText || next[existingIdx].text,
            state: "done",
          };
          return next;
        }
        if (finalText) {
          return [
            ...prev,
            {
              id: runId,
              role: "agent",
              text: finalText,
              timestamp: Date.now(),
              state: "done",
            },
          ];
        }
        return prev;
      });
    } else if (state === "error") {
      const errorText = event.errorMessage ?? "Unknown error";
      streamBufferRef.current.delete(runId);

      setMessages((prev) => {
        const existingIdx = prev.findIndex((m) => m.id === runId);
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            text: errorText,
            state: "error",
          };
          return next;
        }
        return [
          ...prev,
          {
            id: runId,
            role: "agent",
            text: errorText,
            timestamp: Date.now(),
            state: "error",
          },
        ];
      });
    }
  }, []);

  /** Extract text from various message payload formats */
  function extractTextFromMessage(message: unknown): string | null {
    if (!message) return null;
    if (typeof message === "string") return message;
    if (typeof message === "object" && message !== null) {
      const msg = message as Record<string, unknown>;
      if (typeof msg.text === "string") return msg.text;
      if (typeof msg.content === "string") return msg.content;
      if (Array.isArray(msg.content)) {
        return msg.content
          .map((block: unknown) => {
            if (typeof block === "string") return block;
            if (
              typeof block === "object" &&
              block !== null &&
              "text" in block
            ) {
              return (block as { text: string }).text;
            }
            return "";
          })
          .join("");
      }
    }
    return null;
  }

  /** Connect to the gateway */
  const connect = useCallback(() => {
    // Cleanup existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionState("connecting");
    const url = `ws://localhost:${GATEWAY_PORT}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send connect/handshake frame
        const connectPayload = {
          minProtocol: PROTOCOL_VERSION,
          maxProtocol: PROTOCOL_VERSION,
          client: {
            id: "oblivion-desktop",
            displayName: "Oblivion Desktop",
            version: "0.1.0",
            platform: "desktop",
            mode: "interactive",
          },
        };
        ws.send(JSON.stringify(connectPayload));
      };

      ws.onmessage = (evt) => {
        try {
          const frame = JSON.parse(evt.data as string) as GatewayFrame;

          if ("type" in frame) {
            switch (frame.type) {
              case "hello-ok": {
                const hello = frame as HelloOk;
                setConnectionState("connected");
                setServerVersion(hello.server.version);
                reconnectDelayRef.current = RECONNECT_DELAY_MS;
                addSystemMessage(
                  `Connected to gateway v${hello.server.version}`
                );
                break;
              }
              case "res": {
                const res = frame as ResponseFrame;
                if (!res.ok && res.error) {
                  addSystemMessage(
                    `Error: ${res.error.message} (${res.error.code})`
                  );
                }
                break;
              }
              case "event": {
                const event = frame as EventFrame;
                if (
                  event.event === "agent:chat:delta" ||
                  event.event === "agent:chat:final" ||
                  event.event === "agent:chat:error"
                ) {
                  handleChatEvent(event.payload as ChatEvent);
                }
                break;
              }
            }
          }
        } catch {
          // Ignore parse errors for non-JSON frames
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        setConnectionState("disconnected");

        // Exponential backoff reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(
            reconnectDelayRef.current * 1.5,
            MAX_RECONNECT_DELAY_MS
          );
          connect();
        }, reconnectDelayRef.current);
      };

      ws.onerror = () => {
        // onclose will fire after this, handling cleanup
      };
    } catch {
      setConnectionState("disconnected");
    }
  }, [addSystemMessage, handleChatEvent]);

  /** Send a chat message to the gateway.
   *  Optional `context` is silently prepended to the gateway payload
   *  but NOT shown in the local message thread. */
  const sendMessage = useCallback(
    (text: string, context?: string) => {
      if (!text.trim()) return;

      // Add user message immediately (clean, no context prefix)
      const userMsg: AgentMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "user",
        text: text.trim(),
        timestamp: Date.now(),
        state: "done",
      };
      setMessages((prev) => [...prev, userMsg]);

      // Build the message payload with silent context injection
      const payload = context
        ? `${text.trim()}${context}`
        : text.trim();

      // Send via gateway protocol
      const frame: RequestFrame = {
        type: "req",
        id: nextId(),
        method: "chat.send",
        params: {
          sessionKey: sessionKeyRef.current,
          message: payload,
          idempotencyKey: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        },
      };
      sendFrame(frame);
    },
    [nextId, sendFrame]
  );

  /** Connect on mount */
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    connectionState,
    messages,
    serverVersion,
    sendMessage,
    connect,
  };
}
