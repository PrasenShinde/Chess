import { Server } from "socket.io";
import { env } from "../config/env.js";
import { socketAuthMiddleware } from "./socketAuth.js";
import { handleConnection } from "./handlers/connection.js";
import { handleDisconnect } from "./handlers/disconnect.js";
import { registerGameHandlers } from "./handlers/gameHandlers.js";
import { registerRoomHandlers } from "./handlers/roomHandlers.js";
import { registerChallengeHandlers } from "./handlers/challengeHandlers.js";
import { initMatchmaker } from "../services/Matchmaker.js";
import gameManager from "../game/GameManager.js";

export const initializeSocket = (httpServer) => {
  const allowedOrigin = (env.FRONTEND_URL || "http://localhost:5173").trim().replace(/\/+$/, "");

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Initialize Matchmaker logic
  initMatchmaker(io);
  gameManager.setIo(io);

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    // Handle new connection
    handleConnection(io, socket);

    // Register game, room, and challenge handlers
    registerGameHandlers(io, socket);
    registerRoomHandlers(io, socket);
    registerChallengeHandlers(io, socket);

    // Handle disconnect
    socket.on("disconnect", () => {
      handleDisconnect(io, socket);
    });
  });

  return io;
};
