# 🧠 Oblivion AI

**Autonomous Desktop AI Agent for Startup Founders & Developers**

> This is not a chatbot. This is a Founder Operating System.

## What is Oblivion?

Oblivion AI is a real-time, context-aware desktop agent that:
- **Sees what you see** — screen understanding, active window detection
- **Understands what you're building** — Git repo awareness, file system monitoring
- **Remembers your projects** — persistent structured memory (goals, sprints, tech stack)
- **Suggests and executes tasks** — autonomous workflow execution
- **Acts like a technical co-founder** — not just answers, but actions

## Architecture

```
┌─────────────────────────────────────────┐
│          Tauri Desktop Shell            │
│       (Rust + React + TailwindCSS)      │
├─────────────────────────────────────────┤
│           WebSocket Bridge              │
├─────────────────────────────────────────┤
│         Oblivion Core Engine            │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │  Agent    │  │  Memory  │  │ Tools │ │
│  │  Brain    │  │  Engine  │  │  Exec │ │
│  └──────────┘  └──────────┘  └───────┘ │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │  Config   │  │ Plugins  │  │  LLM  │ │
│  │  System   │  │ System   │  │ Router│ │
│  └──────────┘  └──────────┘  └───────┘ │
├─────────────────────────────────────────┤
│         Rust Native Modules             │
│  Screen Capture │ Input Sim │ Git Watch │
└─────────────────────────────────────────┘
```

## Core Engine (`src/`)

| Directory | Purpose |
|-----------|---------|
| `src/agents/` | AI brain — LLM routing (30+ providers), tool-use, subagent orchestration |
| `src/memory/` | Vector DB (sqlite-vec), hybrid search, embedding providers |
| `src/gateway/` | WebSocket + HTTP server, session management, auth |
| `src/config/` | Structured configuration, YAML parsing, env resolution |
| `src/infra/` | Ports, dotenv, runtime guards, exec infrastructure |
| `src/plugins/` | Plugin loader, registry, hooks |
| `src/security/` | Audit, tool policies, secret detection |
| `src/secrets/` | Credential management |
| `src/cli/` | CLI framework (gateway boot path) |
| `src/commands/` | Command definitions |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the gateway server (dev mode)
pnpm run gateway:dev

# The WebSocket gateway will be available at ws://localhost:18789
```

## Tech Stack

- **Core Engine**: Node.js + TypeScript
- **Desktop Shell**: Tauri v2 (Rust)
- **Frontend**: React + TypeScript + TailwindCSS
- **Memory**: SQLite + sqlite-vec (local vector DB)
- **LLM**: Multi-provider (OpenAI, Anthropic, Gemini, Bedrock, Ollama, etc.)

## License

MIT
