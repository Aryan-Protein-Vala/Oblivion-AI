import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOblivionAgent, type AgentMessage } from "./hooks/useOblivionAgent";

/* ─── Message Bubble ─── */
function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className="max-w-[85%] px-4 py-2.5 rounded-sm text-sm font-light leading-relaxed"
        style={{
          background: isUser
            ? "#111111"
            : isSystem
              ? "transparent"
              : "#0a0a0a",
          border: isSystem ? "none" : "1px solid #1a1a1a",
          color: isSystem
            ? "#404040"
            : isUser
              ? "#e5e5e5"
              : "#a3a3a3",
          fontSize: isSystem ? "11px" : "13px",
          fontStyle: isSystem ? "italic" : "normal",
        }}
      >
        {/* Role label */}
        {!isSystem && (
          <div
            className="text-[9px] uppercase tracking-[0.2em] mb-1.5 font-light"
            style={{ color: "#525252" }}
          >
            {isUser ? "You" : "Oblivion"}
          </div>
        )}

        {/* Message text */}
        <div className="whitespace-pre-wrap break-words">{message.text}</div>

        {/* Streaming indicator */}
        {message.state === "streaming" && (
          <motion.span
            className="inline-block ml-1"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ color: "#525252" }}
          >
            ▍
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Main App ─── */
function App() {
  const { connectionState, messages, serverVersion, sendMessage } =
    useOblivionAgent();
  const [input, setInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll on new messages */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* Hide welcome when first message arrives */
  useEffect(() => {
    if (messages.length > 0 && messages.some((m) => m.role !== "system")) {
      setShowWelcome(false);
    }
  }, [messages]);

  /* Focus input on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* Cmd+K to focus */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* Connection indicator */
  const connectionDot = {
    disconnected: "#333333",
    connecting: "#525252",
    connected: "#fafafa",
  }[connectionState];

  const connectionLabel = {
    disconnected: "Offline",
    connecting: "Connecting…",
    connected: serverVersion ? `v${serverVersion}` : "Online",
  }[connectionState];

  return (
    <div className="h-full w-full flex flex-col" style={{ background: "#000000" }}>
      {/* ── Title Bar ── */}
      <div
        className="titlebar-drag flex items-center justify-between px-5"
        style={{ height: "44px", borderBottom: "1px solid #0a0a0a" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "#333" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#333" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#333" }} />
        </div>
        <span
          className="text-[10px] uppercase tracking-[0.2em] font-light"
          style={{ color: "#404040" }}
        >
          Oblivion AI
        </span>
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 titlebar-no-drag">
          <div
            className="w-1.5 h-1.5 rounded-full transition-colors duration-500"
            style={{ background: connectionDot }}
          />
          <span
            className="text-[9px] uppercase tracking-[0.15em] font-light"
            style={{ color: "#404040" }}
          >
            {connectionLabel}
          </span>
        </div>
      </div>

      {/* ── Message Thread ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Welcome screen */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-[10px] uppercase tracking-[0.3em] font-light mb-5"
                style={{ color: "#333" }}
              >
                Neural Protocol v0.1
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-3xl font-extralight tracking-tight mb-2"
                style={{ color: "#fafafa" }}
              >
                The Unseen
              </motion.h1>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-2xl font-thin tracking-tight mb-8"
                style={{ color: "#737373" }}
              >
                Co-Founder.
              </motion.span>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-[11px] font-light tracking-wide"
                style={{ color: "#333" }}
              >
                Autonomous execution for the builder class.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {!showWelcome && (
          <div className="max-w-[640px] mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* ── Command Bar ── */}
      <div
        className="px-4 py-3"
        style={{ borderTop: "1px solid #111111" }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 max-w-[640px] mx-auto transition-all duration-300"
          style={{
            border: "1px solid #1a1a1a",
            borderRadius: "6px",
            background: "#000000",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#333333";
            (e.currentTarget as HTMLElement).style.background = "#0a0a0a";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#1a1a1a";
            (e.currentTarget as HTMLElement).style.background = "#000000";
          }}
        >
          {/* Bolt icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#404040"
            strokeWidth="1.5"
            className="flex-shrink-0"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              connectionState === "connected"
                ? "What do you want to build?"
                : "Waiting for gateway…"
            }
            disabled={connectionState !== "connected"}
            className="flex-1 text-sm font-light placeholder-[#333] disabled:opacity-30"
            style={{ color: "#fafafa" }}
          />

          {/* Send / Shortcut badge */}
          {input.trim() ? (
            <button
              onClick={handleSend}
              className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-light transition-colors duration-200 titlebar-no-drag"
              style={{
                border: "1px solid #333",
                color: "#a3a3a3",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#525252";
                (e.currentTarget as HTMLElement).style.color = "#fafafa";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#333";
                (e.currentTarget as HTMLElement).style.color = "#a3a3a3";
              }}
            >
              Send ↵
            </button>
          ) : (
            <div
              className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-light"
              style={{
                border: "1px solid #1a1a1a",
                color: "#333",
              }}
            >
              ⌘K
            </div>
          )}
        </div>
      </div>

      {/* ── Status Bar ── */}
      <div
        className="flex items-center justify-between px-5 py-2"
        style={{ borderTop: "1px solid #0a0a0a" }}
      >
        <div className="flex items-center gap-4">
          {[
            { label: "Engine", alive: connectionState === "connected" },
            { label: "Memory", alive: false },
            { label: "Context", alive: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-1 h-1 rounded-full transition-colors duration-500"
                style={{ background: item.alive ? "#fafafa" : "#262626" }}
              />
              <span
                className="text-[9px] uppercase tracking-[0.15em] font-light"
                style={{ color: "#333" }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div
          className="text-[9px] font-light tracking-wide font-mono"
          style={{ color: "#262626" }}
        >
          ws://localhost:18789
        </div>
      </div>
    </div>
  );
}

export default App;
