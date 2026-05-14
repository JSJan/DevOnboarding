# Architecture Document

## Developer Onboarding Setup App

**Version:** 1.0  
**Date:** 14 May 2026  
**Status:** Draft

---

## 1. System Architecture

### 1.1 Architecture Style

The system follows a **client-agent architecture** with three distinct layers:

```
┌──────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Web App (SPA)                                  │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐  │  │
│  │  │ Software │  │  OS Picker   │  │  Progress Dashboard │  │  │
│  │  │ Selector │  │              │  │  (Real-time)        │  │  │
│  │  └──────────┘  └──────────────┘  └─────────────────────┘  │  │
│  └───────────────────────┬────────────────────────────────────┘  │
└──────────────────────────┼───────────────────────────────────────┘
                           │ HTTP / WebSocket
┌──────────────────────────▼───────────────────────────────────────┐
│                      Backend API Server                           │
│  ┌─────────────┐  ┌───────────────┐  ┌───────────────────────┐  │
│  │  REST API   │  │  WebSocket    │  │  License Service      │  │
│  │  Controller │  │  Gateway      │  │                       │  │
│  └──────┬──────┘  └───────┬───────┘  └───────────┬───────────┘  │
│         │                  │                      │              │
│  ┌──────▼──────────────────▼──────────────────────▼───────────┐  │
│  │              Orchestration Engine                           │  │
│  │  - Dependency graph resolution                             │  │
│  │  - Task queue & scheduling                                 │  │
│  │  - State machine per installation                          │  │
│  └──────────────────────────┬─────────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────────┘
                              │ Commands / Status
┌─────────────────────────────▼────────────────────────────────────┐
│                    Local Installation Agent                       │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ Script Runner  │  │ Platform Adapter │  │ Status Reporter │  │
│  │ (Shell/PS)     │  │ (Win/Mac/Linux)  │  │                 │  │
│  └────────────────┘  └──────────────────┘  └─────────────────┘  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Software Plugin Registry                       │  │
│  │  node.yaml | angular.yaml | docker.yaml | postgres.yaml    │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                    External Data Stores                           │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐  │
│  │  SQLite (Local)  │  │  License Registry (API/Config)      │  │
│  │  - Install state │  │  - Approved software list            │  │
│  │  - Audit log     │  │  - License keys/entitlements         │  │
│  └──────────────────┘  └─────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| Web App (SPA) | User interface for selection, configuration, and progress monitoring |
| Backend API Server | Orchestrates workflows, validates licenses, emits progress events |
| Local Installation Agent | Executes platform-specific install commands, reports results |
| Software Plugin Registry | Declarative definitions (YAML/JSON) for each installable package |
| Data Store | Persists installation state, audit trail, and configuration |

---

## 2. Communication Patterns

| Path | Protocol | Purpose |
|------|----------|---------|
| Frontend ↔ Backend | REST (HTTP/2) | CRUD for selections, config, trigger install |
| Frontend ↔ Backend | WebSocket | Real-time progress events, log streaming |
| Backend ↔ Agent | gRPC or HTTP long-poll | Command dispatch, status heartbeats |
| Agent ↔ OS | Shell subprocess | Execute install scripts |

---

## 3. Tech Stack Trade-Off Analysis

### 3.1 Frontend

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Angular** | Strong typing, built-in DI, enterprise-grade, RxJS for real-time streams | Steeper learning curve, larger bundle, verbose boilerplate | ✅ **Selected** — aligns with team ecosystem (Angular is in the install catalog) |
| React | Large ecosystem, flexible, fast iteration | Needs additional state management, no built-in opinions | Good alternative |
| Vue | Easy to learn, small bundle, good DX | Smaller enterprise adoption, fewer typed patterns | Not ideal for this scale |

**Decision:** Angular with Angular Material for UI components. RxJS integrates naturally with WebSocket-based progress streaming.

### 3.2 Backend API Server

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Node.js (Express/Fastify)** | Same language as frontend, excellent WebSocket support (Socket.IO/ws), non-blocking I/O, fast prototyping | Single-threaded (need clustering for CPU tasks), less type safety without TS | ✅ **Selected** |
| .NET (ASP.NET Core) | High performance, strong typing, SignalR for WebSocket | Heavier runtime, team may not have C# expertise | Strong contender |
| Go (Gin/Fiber) | Extremely fast, great concurrency, single binary | Smaller web ecosystem, less rapid iteration | Better suited for agent |
| Python (FastAPI) | Quick to build, good async support | GIL limits concurrency, slower runtime | Not ideal |

**Decision:** Node.js with TypeScript + Fastify for the API layer. Socket.IO for WebSocket real-time events. TypeScript gives type safety across the full stack.

### 3.3 Local Installation Agent

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Go** | Cross-compiles to single binary (no runtime dependency), excellent OS-level exec, fast startup | Separate language from backend | ✅ **Selected** |
| Node.js | Same stack, child_process module works | Requires Node.js pre-installed (chicken-and-egg for Node install) | Circular dependency |
| Rust | Maximum performance, single binary | Steep learning curve, slower development | Over-engineered |
| Python | Easy scripting, good OS support | Requires Python pre-installed | Circular dependency |
| Shell scripts only | Zero dependencies | Hard to maintain, no cross-platform, poor error handling | Fragile |

**Decision:** Go for the agent. Compiles to a standalone binary per OS — no runtime needed on a fresh machine. Calls platform-native package managers (brew, apt, choco/winget) via `os/exec`.

### 3.4 Real-Time Communication

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **WebSocket (Socket.IO)** | Bi-directional, low latency, auto-reconnect, fallback to polling | Slightly more complex than SSE | ✅ **Selected** |
| Server-Sent Events (SSE) | Simpler, HTTP-native, sufficient for one-way | No bi-directional, limited browser connections | Viable but limited |
| Polling | Simplest to implement | High latency, wasted requests | Not suitable |
| gRPC-Web | Typed, efficient | Requires proxy (Envoy), browser support limited | Over-complex for frontend |

**Decision:** Socket.IO for frontend-to-backend progress. Consider gRPC between backend and agent for structured command/response if the system scales.

### 3.5 Data Storage

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **SQLite** | Zero config, file-based, ships with agent, fast for local ops | Not suitable for multi-user server | ✅ **Selected** (agent-side) |
| PostgreSQL | Robust, relational, good for audit | Requires installation — ironic for an installer app | For future multi-tenant version |
| JSON/YAML files | Simplest, human-readable | No queries, no concurrency safety | Only for plugin definitions |

**Decision:** SQLite embedded in the agent for state tracking. YAML files for software catalog definitions. PostgreSQL as optional backend store if the system evolves to support centralized team dashboards.

### 3.6 Configuration & Plugin Format

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **YAML** | Human-readable, widely used in DevOps tooling, supports comments | Indentation-sensitive | ✅ **Selected** |
| JSON | Native to JS/TS, strict parsing | No comments, verbose | Secondary format |
| TOML | Clean syntax | Less ecosystem support | Not needed |

---

## 4. Software Plugin Schema (Example)

```yaml
# plugins/node.yaml
name: node
displayName: Node.js
category: runtime
version: "20.x"
dependencies: []
platforms:
  macos:
    manager: brew
    command: "brew install node@20"
    verify: "node --version"
  linux:
    manager: apt
    command: "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    verify: "node --version"
  windows:
    manager: winget
    command: "winget install OpenJS.NodeJS.LTS"
    verify: "node --version"
license:
  type: open-source
  spdx: MIT
```

---

## 5. Dependency Graph

The orchestration engine resolves install order using a DAG:

```
Node.js ──► npm ──► Angular CLI
PostgreSQL ──► pgAdmin
(independent) ──► Python, Go, Docker, VS Code, AWS CLI
```

Parallel installation is permitted for packages with no shared dependencies.

---

## 6. Deployment Model

```
┌─────────────────────────────────────────────────┐
│              Distribution Package                │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Agent Binary (per OS)                   │   │
│  │  - onboard-agent-darwin-arm64            │   │
│  │  - onboard-agent-linux-amd64             │   │
│  │  - onboard-agent-windows-amd64.exe       │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Embedded Web Server + SPA               │   │
│  │  (Bundled into agent binary)             │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Plugin Definitions (YAML)               │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Single binary deployment:** The Go agent embeds the compiled Angular SPA and serves it locally. User downloads one file, runs it, and opens `http://localhost:3000` in their browser.

---

## 7. Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Privilege escalation | Agent requests sudo/admin only for specific install commands, not globally |
| Supply chain attacks | Verify checksums/signatures for downloaded installers |
| License key exposure | Keys stored in OS credential store, never in logs |
| Network security | HTTPS for any external API calls; local traffic stays on loopback |
| Script injection | Plugin YAML is validated against a strict schema before execution |

---

## 8. Final Tech Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | Angular 18 + Angular Material | Enterprise-grade, RxJS for streams, typed |
| Backend/API | Node.js + TypeScript + Fastify | Full-stack TS, fast, excellent WebSocket |
| Real-time | Socket.IO | Bi-directional, reliable, auto-reconnect |
| Agent | Go 1.22 | Single binary, cross-platform, no runtime deps |
| Data (local) | SQLite | Zero-config, embedded, fast |
| Config/Plugins | YAML | Readable, extensible, DevOps-friendly |
| Build/Bundle | esbuild + Go embed | Fast builds, single artifact output |
| Testing | Jest (frontend/backend) + Go test | Native to each stack |

---

## 9. Trade-Off Summary Matrix

| Decision | Chosen | Runner-Up | Key Trade-Off |
|----------|--------|-----------|---------------|
| Frontend framework | Angular | React | Opinionated structure vs. flexibility |
| Backend runtime | Node.js/TS | .NET | JS ecosystem unity vs. raw performance |
| Agent language | Go | Rust | Productivity + deploy simplicity vs. max perf |
| Real-time protocol | WebSocket | SSE | Bi-directional vs. simplicity |
| Storage | SQLite | PostgreSQL | Zero-dependency local vs. multi-tenant scale |
| Plugin format | YAML | JSON | Readability vs. strict parsing |
| Deployment | Single binary | Docker container | Zero prerequisites vs. isolation |
