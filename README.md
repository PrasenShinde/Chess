# Chess.AI

A real-time chess platform built with React, Express, Socket.IO, Prisma, PostgreSQL, and Redis.

## Features

- Real-time gameplay with server-side move validation via `chess.js`
- Redis-backed matchmaking queue and Redis distributed move locks
- Random white/black assignment when a match is found
- Cookie-based JWT auth with hashed refresh-token rotation
- CSRF protection for state-changing auth requests
- Protected frontend routes with automatic access-token refresh on `401`
- Game persistence in PostgreSQL (moves, results, ratings, history)
- Resign, draw offers, timeout claims, and disconnect handling
- Socket and auth rate limiting

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Socket.IO client
- Backend: Node.js, Express, Socket.IO
- Database: PostgreSQL with Prisma
- Realtime/cache: Redis
- Chess rules: `chess.js`

## Prerequisites

Install these before running the app:

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### macOS (Homebrew)

```bash
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y postgresql redis-server
sudo systemctl start postgresql
sudo systemctl start redis-server
```

## Database Setup

Create a PostgreSQL database:

```bash
createdb chess
```

Or with `psql`:

```sql
CREATE DATABASE chess;
```

## Environment Variables

### Backend

```bash
cd backend
cp .env.example .env
```

Update `backend/.env` with your secrets and database URL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chess?schema=public
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-long-access-secret
JWT_REFRESH_SECRET=your-long-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

Recommended dev values:

```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:3000
```

The Vite dev server proxies `/api` and `/socket.io` to the backend on port `3000`.

## Install Dependencies

From the repo root:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Run Database Migrations

```bash
cd backend
npx prisma migrate dev
```

This creates the `users`, `refresh_tokens`, and `games` tables. Default user rating is `1200`.

## Start Redis and PostgreSQL

Make sure both services are running:

```bash
redis-cli ping
# expected: PONG

pg_isready
# expected: accepting connections
```

## Run the App

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Backend: `http://localhost:3000`

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`

## Run Tests

### Backend

```bash
cd backend
npm test
```

Covers token hashing, move validation, CSRF checks, and socket rate limiting.

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## How to Play

1. Sign up or log in at `http://localhost:5173`
2. Open **Start Game** from the dashboard
3. Click **Find Match**
4. When matched, one player is assigned **white**, the other **black**
5. Drag pieces to move; use resign/draw/timeout controls as needed

## API Overview

- `GET /api/auth/csrf` — initialize CSRF cookie
- `POST /api/auth/register|login|refresh|logout`
- `GET /api/auth/me`
- `GET /api/games/stats`
- `GET /api/games/recent`

## Socket Events

- `find-match`, `cancel-match`, `match-found`
- `move`, `move-made`, `move-error`
- `resign`, `offer-draw`, `accept-draw`, `claim-timeout`
- `resume-game`, `game-over`

## Project Structure

```text
backend/
  prisma/              Schema and migrations
  src/
    auth/              Google OAuth
    config/            Environment validation
    controllers/       HTTP controllers
    game/              Chess room, Redis store, locks
    middleware/        Auth, CSRF, rate limits
    routes/            Express routes
    services/          Matchmaking, rooms, socket registry
    socket/            Socket.IO handlers
    utils/             JWT, cookies, CSRF, token hashing

frontend/
  src/
    components/        UI and auth guard
    context/           Auth state
    hooks/             Socket/game hooks
    pages/             Routes including /learn
    services/          API client with refresh + CSRF
    socket/            Socket.IO client
```

## Notes

- Refresh tokens are hashed with SHA256 before storage in PostgreSQL.
- Active games live in Redis; completed games remain in PostgreSQL.
- Matchmaking queue is stored in Redis so queue state survives backend restarts.
- For production, set `NODE_ENV=production`, use HTTPS, and configure real OAuth credentials.
