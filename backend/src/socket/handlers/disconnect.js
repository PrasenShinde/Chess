import onlineUsers from "../../services/OnlineUsers.js";

/**
 * Handles logic when a socket disconnects
 * @param {import("socket.io").Server} io - The main Socket.io server instance
 * @param {import("socket.io").Socket} socket - The disconnecting socket
 */
export const handleDisconnect = (io, socket) => {
  const user = socket.user;

  if (user) {
    // Remove user from the online users tracking service
    onlineUsers.removeUser(user.id);
    
    console.log(`User Disconnected: ${user.username} (${socket.id})`);

    // Broadcast the updated list of online users to all remaining clients
    io.emit("online-users", onlineUsers.getAllOnlineUsers());
  }
};
