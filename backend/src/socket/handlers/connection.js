import onlineUsers from "../../services/OnlineUsers.js";
import queue from "../../services/MatchmakingQueue.js";
import socketRegistry from "../../services/SocketRegistry.js";
import { tryMatchmaking } from "../../services/Matchmaker.js";
import { socketRateLimit } from "../../middleware/socketRateLimit.middleware.js";

export const handleConnection = (io, socket) => {
  const user = socket.user;

  onlineUsers.addUser(user.id, socket.id);
  socketRegistry.register(user.id, socket);

  console.log(`User Connected: ${user.username} (${socket.id})`);
  io.emit("online-users", onlineUsers.getAllOnlineUsers());

  const limitMatchmaking = socketRateLimit("matchmaking", { max: 30 });

  socket.on("find-match", limitMatchmaking(socket, async () => {
    await queue.add(user);
    tryMatchmaking();
  }));

  socket.on("cancel-match", limitMatchmaking(socket, async () => {
    await queue.remove(user.id);
    socket.emit("match-cancelled");
  }));
};
