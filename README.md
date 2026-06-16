# Chess.AI 🚀

A real-time, AI-powered chess platform built with React, Express, Socket.io, and TensorFlow.js. Play chess against intelligent bots or real opponents with instant feedback and beautiful visualizations.

## ✨ Features

- ♟️ **Real-Time Gameplay**: Instant move updates with Socket.io for seamless multiplayer action.
- 🤖 **AI Bot Matches**: Play against smart AI bots powered by TensorFlow.js neural networks.
- 💬 **Live Chat**: In-game chat to communicate with your opponent.
- 🎨 **Modern UI**: Clean, responsive interface using Tailwind CSS.
- 🔒 **Secure Authentication**: JWT-based authentication with secure password hashing.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express, Socket.io
- **Database**: SQLite with Prisma
- **AI**: TensorFlow.js

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run database migration (creates database.db)
npx prisma migrate dev --name init

# Start the server
npm run dev
```

The server will start on `http://localhost:3000`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### 3. AI Models

The AI models are automatically downloaded from Google Cloud Storage on the first run. Ensure you have an internet connection during the first launch.

## 🎮 How to Play

1. **Signup/Login**: Create an account or log in.
2. **Dashboard**: Click "Start Game" to begin.
3. **Choose Mode**:
   - **Play Online**: Match with another player.
   - **Play with Bot**: Challenge an AI opponent.
4. **Play**: Drag and drop pieces to move. The interface will show legal moves, threats, and evaluation.

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/        # Environment and configuration
│   ├── socket/        # Socket.io event handlers
│   ├── services/      # Business logic and AI integrations
│   └── prisma/        # Database models and client
└── prisma.schema      # Database schema definition

frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── context/       # Authentication and global state
│   ├── pages/         # Page components
│   ├── services/      # API and AI service functions
│   └── assets/        # Static assets and AI models
└── vite.config.js     # Vite configuration
```

## 🧩 AI Integration Details

The AI functionality is handled by the backend services:

- `services/aiService.js`: Loads pre-trained TensorFlow.js models for move prediction and board evaluation.
- `services/matchmaker.js`: Manages matchmaking logic for online play.

Models are stored in Google Cloud Storage and automatically downloaded to `frontend/src/assets/models/` on first use.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

