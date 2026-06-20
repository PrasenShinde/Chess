import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";

/**
 * Singleton socket instance
 * Connect directly to backend to avoid Vite proxy drops for WebSockets
 */
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});
