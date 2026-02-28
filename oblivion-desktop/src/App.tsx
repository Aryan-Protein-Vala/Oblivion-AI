import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Status Items ── */
const statusItems = [
  { label: "Engine", status: "Standby", alive: false },
  { label: "Memory", status: "Offline", alive: false },
  { label: "Context", status: "Idle", alive: false },
];

/* ── Suggestion Items ── */
const suggestions = [
  { icon: "⌘", label: "Connect to Gateway", shortcut: "⌘K" },
  { icon: "◎", label: "Scan Workspace", shortcut: "⌘S" },
  { icon: "◈", label: "Open Memory", shortcut: "⌘M" },
  { icon: "▷", label: "Execute Task", shortcut: "⌘E" },
];

function App() {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-focus on mount */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* Keyboard shortcut: Cmd+K or Ctrl+K to focus */
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

  return (
    <div className="h-full w-full flex flex-col" style={{ background: "#000000" }}>
      {/* ── Title Bar (Draggable) ── */}
      <div
        className="titlebar-drag flex items-center justify-between px-5 pt-4 pb-2"
        style={{ height: "40px" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "#333" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#333" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#333" }} />
        </div>
        <span
          className="text-[10px] uppercase tracking-[0.2em] font-light"
          style={{ color: "#525252" }}
        >
          Oblivion AI
        </span>
        <div className="w-12" />
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[10px] uppercase tracking-[0.3em] font-light mb-6"
            style={{ color: "#525252" }}
          >
            Neural Protocol v0.1
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-4xl font-extralight tracking-tight leading-tight"
            style={{ color: "#fafafa" }}
          >
            The Unseen
            <br />
            <span style={{ color: "#a3a3a3" }} className="font-thin">
              Co-Founder.
            </span>
          </motion.h1>
        </motion.div>

        {/* ── Command Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="w-full max-w-[560px]"
        >
          <div
            className="relative transition-all duration-500"
            style={{
              border: `1px solid ${isFocused ? "#404040" : "#1a1a1a"}`,
              borderRadius: "8px",
              background: isFocused ? "#0a0a0a" : "transparent",
            }}
          >
            {/* Input Row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isFocused ? "#737373" : "#404040"}
                strokeWidth="1.5"
                className="flex-shrink-0 transition-colors duration-300"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                placeholder="What do you want to build?"
                className="flex-1 text-sm font-light placeholder-[#404040]"
                style={{ color: "#fafafa" }}
              />
              <div
                className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-light"
                style={{
                  border: "1px solid #262626",
                  color: "#525252",
                }}
              >
                ⌘K
              </div>
            </div>

            {/* ── Dropdown Suggestions ── */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div style={{ borderTop: "1px solid #1a1a1a" }}>
                    {suggestions
                      .filter(
                        (s) =>
                          !input ||
                          s.label
                            .toLowerCase()
                            .includes(input.toLowerCase())
                      )
                      .map((item, i) => (
                        <button
                          key={item.label}
                          className="w-full flex items-center justify-between px-4 py-2.5 transition-colors duration-200 text-left titlebar-no-drag"
                          style={{
                            color: "#a3a3a3",
                            background: "transparent",
                          }}
                          onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "#111111")
                          }
                          onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "transparent")
                          }
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="text-xs"
                              style={{ color: "#525252" }}
                            >
                              {item.icon}
                            </span>
                            <span className="text-sm font-light">
                              {item.label}
                            </span>
                          </div>
                          <span
                            className="text-[10px] font-light"
                            style={{ color: "#404040" }}
                          >
                            {item.shortcut}
                          </span>
                        </button>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Subtext ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-6 text-[11px] font-light tracking-wide"
          style={{ color: "#404040" }}
        >
          Autonomous execution for the builder class.
        </motion.p>
      </div>

      {/* ── Status Bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid #111111" }}
      >
        <div className="flex items-center gap-4">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: item.alive ? "#fafafa" : "#333",
                }}
              />
              <span
                className="text-[10px] uppercase tracking-[0.15em] font-light"
                style={{ color: "#404040" }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div
          className="text-[10px] font-light tracking-wide"
          style={{ color: "#333" }}
        >
          ws://localhost:18789
        </div>
      </motion.div>
    </div>
  );
}

export default App;
