import { io } from "socket.io-client";

/**
 * Singleton socket instance
 * Connect directly to backend to avoid Vite proxy drops for WebSockets
 */
export const socket = io("http://localhost:3000", {
  autoConnect: false,
  withCredentials: true,
});
