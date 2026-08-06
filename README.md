

# 📖 Pixel64 (Real-Time Multiplayer Chess)

## 1. Project Overview

A scalable real-time multiplayer chess platform where users can authenticate, enter a matchmaking queue, get paired automatically with another player, and play chess in real time.

The backend is server-authoritative, meaning the server validates every move before broadcasting it to the opponent. This prevents cheating and keeps both players synchronized.

---

# 2. Features

- JWT Authentication
- Real-time Multiplayer
- Matchmaking Queue
- Random Color Assignment
- Chess Rule Validation
- Live Move Synchronization
- Redis Game State
- PostgreSQL Persistent Storage
- Game History
- Reconnection Support
- Scalable Socket Architecture

---

# 3. Tech Stack

## Frontend

- React
- Vite
- React Router
- Socket.IO Client
- React Chessboard
- chess.js

---

## Backend

- Node.js
- Express.js
- Socket.IO
- Redis
- PostgreSQL
- Prisma ORM
- JWT Authentication

---

## DevOps

- Docker
- Nginx
- AWS EC2
- GitHub Actions (optional)

---

# 4. High Level Architecture

```
                 ┌──────────────┐
                 │ React Client │
                 └──────┬───────┘
                        │
                 WebSocket (Socket.IO)
                        │
             ┌──────────▼──────────┐
             │   Node.js Server    │
             │  Express + Socket   │
             └─────┬─────────┬─────┘
                   │         │
          Redis    │         │ PostgreSQL
       Game State  │         │ Permanent Data
                   │         │
             ┌─────▼───┐ ┌───▼─────────┐
             │  Redis  │ │ PostgreSQL  │
             └─────────┘ └─────────────┘
```

---

# 5. System Workflow

## Authentication

```
User Login

↓

JWT Generated

↓

Stored in HTTP-only Cookie

↓

Socket Connection

↓

JWT Verification

↓

Authenticated User
```

---

## Matchmaking

```
User clicks Play

↓

Socket Event

↓

Join Queue

↓

Queue Manager

↓

Find Opponent

↓

Create Game

↓

Assign White/Black

↓

Notify Both Players
```

---

## Gameplay

```
Player Move

↓

Socket Event

↓

Server Receives Move

↓

chess.js Validation

↓

Update Redis

↓

Broadcast Move

↓

Opponent Board Updates
```

---

# 6. Low Level Architecture

```
Client

Board Component
      │
      ▼
Socket Service
      │
      ▼
Socket.IO

      │

Server

Socket Gateway

↓

Game Manager

↓

Chess Engine

↓

Redis

↓

Database
```

---

# 7. Folder Structure

```
client/

src/
    components/
    pages/
    hooks/
    services/
    socket/
    utils/

server/

controllers/
routes/
socket/
middleware/
services/
matchmaking/
game/
redis/
prisma/
utils/
```

---

# 8. Database Schema

### User

```
id
username
email
password
rating
createdAt
```

---

### Game

```
id
whitePlayerId
blackPlayerId
winner
status
fen
createdAt
endedAt
```

---

### Move

```
id
gameId
moveNumber
from
to
piece
fen
timestamp
```

---

# 9. Redis Structure

```
queue

[
 user1,
 user2
]
```

---

```
game:123

{
 white
 black
 fen
 turn
 moves
}
```

---

# 10. Socket Events

## Client → Server

```
joinQueue

leaveQueue

movePiece

resign

offerDraw

acceptDraw

reconnect
```

---

## Server → Client

```
matchFound

gameStarted

moveMade

gameEnded

invalidMove

opponentDisconnected

timerUpdate
```

---

# 11. Why Redis?

Redis is used because game state changes after every move and requires extremely low latency.

It stores:
- Current FEN position
- Move history
- Active players
- Player turn
- Matchmaking queue

Advantages:
- In-memory storage
- Fast reads/writes
- Ideal for transient game state

---

# 12. Why PostgreSQL?

PostgreSQL stores permanent data:

- Users
- Ratings
- Match history
- Completed games
- Analytics

Redis is temporary, while PostgreSQL provides durable persistence.

---

# 13. Authentication Flow

```
Login

↓

JWT Created

↓

Cookie Sent

↓

Socket Handshake

↓

JWT Verification

↓

Socket Connected
```

---

# 14. Move Validation

The server validates every move using `chess.js`:

1. Receive move.
2. Load current board state (FEN) from Redis.
3. Verify it's the correct player's turn.
4. Validate legality of the move.
5. Reject invalid moves.
6. Update the board state.
7. Save new FEN to Redis.
8. Broadcast the move to both clients.
9. If the game ends, persist the final result to PostgreSQL.

This ensures the client cannot cheat by sending illegal moves.

---

# 15. Scalability

The architecture supports horizontal scaling by:

- Keeping servers stateless where possible.
- Storing shared game state in Redis.
- Using Redis Pub/Sub (or Socket.IO Redis Adapter) to synchronize WebSocket events across multiple Node.js instances.
- Running behind an Nginx reverse proxy and load balancer.
- Persisting completed games and user data in PostgreSQL.

---

# 16. Security

- JWT Authentication
- HTTP-only cookies
- Password hashing (bcrypt)
- Input validation
- Server-side move validation
- Rate limiting
- CORS protection
- Environment variables for secrets
- SQL injection protection through Prisma ORM

---

# 17. Future Enhancements

- Elo rating system
- Spectator mode
- Chess clocks (Blitz/Rapid/Bullet)
- In-game chat
- Friend invitations
- Tournament brackets
- Game replay and PGN export
- Puzzle mode
- Stockfish engine integration for analysis
- Mobile-responsive UI
- Notifications and achievements

---

## Interview Questions You Should Be Able to Answer

- Why did you choose WebSockets over REST for gameplay?
- Why store active game state in Redis instead of PostgreSQL?
- How do you prevent cheating or illegal moves?
- How does Socket.IO maintain low-latency communication?
- How would you scale this system to handle thousands of concurrent games?
- What happens if a player disconnects during a game?
- How are matchmaking and game rooms implemented?
- Why use FEN notation for board state?
- What role does `chess.js` play in the application?
- How would you implement timers, Elo ratings, or spectators?

This level of documentation is similar to what you'd see in a production engineering project and will prepare you well for explaining the system during interviews.