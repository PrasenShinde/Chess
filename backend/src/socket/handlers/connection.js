import onlineUsers from "../../services/OnlineUsers.js";

/**
 * Handles logic when a new socket connection is established
 * @param {import("socket.io").Server} io - The main Socket.io server instance
 * @param {import("socket.io").Socket} socket - The connected socket
 */
export const handleConnection = (io, socket) => {
  const user = socket.user; // Attached by the auth middleware

  // Add user to the online users tracking service
  onlineUsers.addUser(user.id, socket.id);

  console.log(`User Connected: ${user.username} (${socket.id})`);

  // Broadcast the updated list of online users to all connected clients
  io.emit("online-users", onlineUsers.getAllOnlineUsers());
};
