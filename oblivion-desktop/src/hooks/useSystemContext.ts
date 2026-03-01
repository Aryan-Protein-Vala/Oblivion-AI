import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Types ─── */
export interface ActiveWindow {
    app_name: string;
    window_title: string;
}

export interface GitContext {
    is_git_repo: boolean;
    branch: string;
    status: string;
    repo_root: string;
}

export interface SystemContext {
    activeWindow: ActiveWindow | null;
    gitContext: GitContext | null;
    lastUpdated: number;
}

/* ─── Config ─── */
const POLL_INTERVAL_MS = 2500;

/**
 * Polls the native Tauri commands for system context:
 * - Active foreground window (app name + title)
 * - Git repo state (branch, status, repo root)
 *
 * Falls back gracefully in browser (non-Tauri) environments.
 */
export function useSystemContext(): SystemContext {
    const [activeWindow, setActiveWindow] = useState<ActiveWindow | null>(null);
    const [gitContext, setGitContext] = useState<GitContext | null>(null);
    const [lastUpdated, setLastUpdated] = useState(0);
    const invokeRef = useRef<((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null>(null);

    /* Dynamically import Tauri invoke (only available in Tauri runtime) */
    useEffect(() => {
        let cancelled = false;

        async function loadInvoke() {
            try {
                const mod = await import("@tauri-apps/api/core");
                if (!cancelled) {
                    invokeRef.current = mod.invoke;
                }
            } catch {
                // Not running in Tauri — browser dev mode
                invokeRef.current = null;
            }
        }

        loadInvoke();
        return () => { cancelled = true; };
    }, []);

    /* Poll active window */
    const pollActiveWindow = useCallback(async () => {
        const invoke = invokeRef.current;
        if (!invoke) return;

        try {
            const result = await invoke("get_active_window") as ActiveWindow;
            setActiveWindow(result);
            setLastUpdated(Date.now());
        } catch {
            // Silently fail — non-critical
        }
    }, []);

    /* Poll git context (based on detected workspace or home dir) */
    const pollGitContext = useCallback(async () => {
        const invoke = invokeRef.current;
        if (!invoke) return;

        try {
            // Try to infer workspace path from active window title
            // Many editors show the project path in their title
            const path = activeWindow?.window_title
                ? extractPathFromTitle(activeWindow.window_title)
                : "";

            const result = await invoke("get_git_context", { path }) as GitContext;
            setGitContext(result);
        } catch {
            // Silently fail — non-critical
        }
    }, [activeWindow]);

    /* Polling interval */
    useEffect(() => {
        // Initial poll
        pollActiveWindow();

        const interval = setInterval(() => {
            pollActiveWindow();
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [pollActiveWindow]);

    /* Poll git context less frequently (every other cycle) */
    useEffect(() => {
        pollGitContext();

        const interval = setInterval(() => {
            pollGitContext();
        }, POLL_INTERVAL_MS * 2);

        return () => clearInterval(interval);
    }, [pollGitContext]);

    return { activeWindow, gitContext, lastUpdated };
}

/**
 * Format the system context into a compact string for prompt injection.
 */
export function formatContextForPrompt(ctx: SystemContext): string {
    const parts: string[] = [];

    if (ctx.activeWindow?.app_name) {
        const win = ctx.activeWindow;
        const title = win.window_title ? ` — ${win.window_title}` : "";
        parts.push(`[Window] ${win.app_name}${title}`);
    }

    if (ctx.gitContext?.is_git_repo) {
        const git = ctx.gitContext;
        const repoName = git.repo_root.split("/").pop() || git.repo_root;
        parts.push(`[Git] ${repoName} (${git.branch}) [${git.status}]`);
    }

    return parts.length > 0
        ? `\n---\nFounder Context:\n${parts.join("\n")}\n---`
        : "";
}

/** Try to extract a file/directory path from a window title */
function extractPathFromTitle(title: string): string {
    // Common patterns:
    // "filename.ts — ProjectName" (VS Code)
    // "ProjectName [~/path/to/project]" (Terminal)
    // "~/path/to/file" (direct path)

    // Check for ~ or / paths
    const pathMatch = title.match(/(~?\/[\w./-]+)/);
    if (pathMatch) {
        return pathMatch[1].replace("~", "");
    }

    return "";
}
