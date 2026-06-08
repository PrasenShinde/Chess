import { io } from "socket.io-client";
import { API_URL } from "../services/api";

/**
 * Singleton socket instance
 * autoConnect is false so we can manually connect only when the user visits the Play page
 * withCredentials ensures cookies (JWT) are sent with the handshake
 */
export const socket = io(API_URL.replace('/api', ''), {
  autoConnect: false,
  withCredentials: true,
});
