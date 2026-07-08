# Local Setup Guide

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20+ | `node --version` |
| npm | 10+ | `npm --version` |
| Git | any | `git --version` |

### Install Node.js (if not installed)

**macOS:**
```bash
brew install node@20
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
```powershell
winget install OpenJS.NodeJS.LTS
```

---

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd DevOnboarding

# Start backend (terminal 1)
cd backend
npm install
npm run dev

# Start frontend (terminal 2)
cd frontend
npm install
npm start
```

The app will be available at:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

---

## Step-by-Step Setup

### 1. Backend

```bash
cd backend
npm install
```

**Run in development mode (hot-reload):**
```bash
npm run dev
```

**Or build and run production:**
```bash
npm run build
npm start
```

The backend creates a SQLite database at `backend/data/onboarding.db` automatically on first run.

### 2. Frontend

```bash
cd frontend
npm install
```

**Run development server:**
```bash
npm start
# or
ng serve
```

**Build for production:**
```bash
npm run build
```

---

## Environment Configuration

### Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |

Override via environment:
```bash
PORT=8080 npm run dev
```

### Frontend

Edit `frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
  wsUrl: 'http://localhost:3001',
};
```

---

## Verify Setup

1. **Backend health check:**
   ```bash
   curl http://localhost:3001/api/health
   # Expected: {"status":"ok","timestamp":"..."}
   ```

2. **Catalog endpoint:**
   ```bash
   curl http://localhost:3001/api/catalog
   # Expected: JSON array of software items
   ```

3. **Frontend:** Open http://localhost:4200 in your browser.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `EADDRINUSE` port conflict | Kill process on port: `lsof -ti:3001 \| xargs kill` |
| `node_modules` issues | Delete and reinstall: `rm -rf node_modules && npm install` |
| SQLite build errors | Ensure build tools installed: `xcode-select --install` (macOS) |
| CORS errors in browser | Ensure backend is running on port 3001 |
| WebSocket not connecting | Check that both frontend and backend are running |

---

## Project Scripts

### Backend (`backend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot-reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |
| `npm test` | Run tests |
| `npm run lint` | Lint source files |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm start` | Dev server at localhost:4200 |
| `npm run build` | Production build to `dist/` |
| `npm test` | Run unit tests |
| `npm run lint` | Lint source files |


### Open api tools
- Cursor 
- Open source 