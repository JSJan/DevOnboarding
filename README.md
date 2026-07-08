# Developer Onboarding Setup App

Automated development environment setup tool. Select the software you need, choose your OS, and watch it install — all from a web dashboard.

## Project Structure

```
DevOnboarding/
├── docs/                    # Documentation
│   ├── PRD.md              # Product Requirements
│   └── Architecture.md     # Architecture & Tech Stack
├── backend/                 # Node.js + TypeScript API server
│   ├── src/
│   │   ├── server.ts       # Entry point (Fastify + Socket.IO)
│   │   ├── routes/         # REST API endpoints
│   │   │   ├── catalog.routes.ts
│   │   │   ├── installation.routes.ts
│   │   │   └── license.routes.ts
│   │   ├── services/       # Business logic
│   │   │   ├── catalog.service.ts
│   │   │   ├── installation.service.ts
│   │   │   └── license.service.ts
│   │   ├── websocket/      # Real-time progress events
│   │   │   └── socket.handler.ts
│   │   ├── database/       # SQLite persistence
│   │   │   └── db.ts
│   │   ├── plugins/        # Plugin loader (YAML catalog)
│   │   │   └── plugin.loader.ts
│   │   └── types/          # Shared TypeScript interfaces
│   │       └── index.ts
│   ├── plugins/            # Software definition files (YAML)
│   │   └── node.yaml
│   ├── data/               # SQLite database (auto-created)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Angular 18 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   ├── app.routes.ts
│   │   │   ├── components/
│   │   │   │   └── header/
│   │   │   ├── pages/
│   │   │   │   ├── software-selection/
│   │   │   │   └── progress-dashboard/
│   │   │   ├── services/
│   │   │   │   ├── catalog.service.ts
│   │   │   │   ├── installation.service.ts
│   │   │   │   └── websocket.service.ts
│   │   │   └── models/
│   │   │       └── types.ts
│   │   └── environments/
│   ├── package.json
│   └── tsconfig.json
└── prompt/                  # Original project brief
    └── prompt.md
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18, Angular Material, RxJS, Socket.IO Client |
| Backend | Node.js, TypeScript, Fastify, Socket.IO |
| Database | SQLite (via better-sqlite3) |
| Config | YAML software plugin definitions |

## Prerequisites

- Node.js 20+
- npm 10+

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The API server starts at `http://localhost:3001`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The Angular app starts at `http://localhost:4200`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/catalog` | List all installable software |
| GET | `/api/catalog/platform/:os` | Software filtered by platform |
| POST | `/api/installations` | Create installation session |
| GET | `/api/installations/:id` | Get installation status |
| POST | `/api/installations/:id/start` | Start installing |
| POST | `/api/installations/:id/retry/:taskId` | Retry a failed task |
| GET | `/api/installations/:id/logs` | Get task logs |
| POST | `/api/licenses/validate` | Validate software licenses |

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `join-installation` | Client → Server | `installationId` |
| `progress` | Server → Client | `{ taskId, softwareId, status, progress }` |
| `log` | Server → Client | `{ taskId, softwareId, message, progress }` |
| `installation-complete` | Server → Client | `{ installationId }` |

## Code Flow

### Installation Flow (Backend)

```
1. POST /api/installations
   → InstallationService.create()
   → Resolves dependency order (DAG)
   → Creates tasks in DB (status: pending)

2. POST /api/installations/:id/start
   → InstallationService.start()
   → Executes tasks sequentially
   → For each task:
     a. Update status → in-progress, emit via Socket.IO
     b. Execute platform install command
     c. Emit log events with progress
     d. Update status → completed/failed

3. WebSocket emits progress to all clients in the installation room
```

### User Flow (Frontend)

```
1. /setup page loads
   → CatalogService.getAll() fetches software list
   → User selects platform + software

2. User clicks "Start Installation"
   → InstallationService.create() → gets installationId
   → Navigate to /progress/:installationId

3. Progress page mounts
   → WebSocketService.connect() + joinInstallation()
   → InstallationService.start() triggers backend
   → Real-time progress updates flow via Socket.IO
   → UI updates task cards live

4. Installation completes
   → 'installation-complete' event received
   → Summary shown
```

## Adding New Software

Create a YAML file in `backend/plugins/`:

```yaml
name: terraform
displayName: Terraform
category: Infrastructure
version: "1.7"
id: terraform
dependencies: []
platforms:
  macos:
    manager: brew
    command: "brew install terraform"
    verify: "terraform --version"
  linux:
    manager: apt
    command: "sudo apt-get install -y terraform"
    verify: "terraform --version"
  windows:
    manager: winget
    command: "winget install Hashicorp.Terraform"
    verify: "terraform --version"
license:
  type: open-source
  spdx: MPL-2.0
```

## Development

```bash
# Run backend in watch mode
cd backend && npm run dev

# Run frontend dev server
cd frontend && npm start

# Build for production
cd backend && npm run build
cd frontend && npm run build
```

## License

Internal use only.



Deployment Setup Steps
1. Backend → Render (Free)

Go to render.com → Sign up with GitHub
Click New+ → Blueprint → Select your repo
Render will auto-detect render.yaml and deploy
Copy your Deploy Hook URL from Settings → Add as RENDER_DEPLOY_HOOK_URL GitHub secret
2. Frontend → Vercel (Free)

Go to vercel.com → Import your repo
Set root directory to frontend
Get your token from vercel.com/account/tokens
Add GitHub secrets: VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID


Update API URL
Edit environment.prod.ts:8-9 with your actual Render service URL before deploying frontend.