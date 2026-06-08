import { Server } from "socket.io";
import { env } from "../config/env.js";
import { socketAuthMiddleware } from "./socketAuth.js";
import { handleConnection } from "./handlers/connection.js";
import { handleDisconnect } from "./handlers/disconnect.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    // Handle new connection
    handleConnection(io, socket);

    // Handle disconnect
    socket.on("disconnect", () => {
      handleDisconnect(io, socket);
    });
  });

  return io;
};
