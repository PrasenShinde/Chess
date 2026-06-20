import onlineUsers from "../../services/OnlineUsers.js";
import queue from "../../services/MatchmakingQueue.js";
import socketRegistry from "../../services/SocketRegistry.js";
import roomManager from "../../services/RoomManager.js";
import gameManager from "../../game/GameManager.js";

export const handleDisconnect = (io, socket) => {
  const user = socket.user;

  if (!user) {
    return;
  }

  onlineUsers.removeUser(user.id);
  socketRegistry.unregister(user.id);
  queue.remove(user.id).catch((error) => {
    console.error("[Disconnect] Failed to remove user from queue", error);
  });

  const activeRoom = roomManager.findRoomByUserId(user.id);
  if (activeRoom) {
    gameManager
      .resignGame(activeRoom.roomId, user.id)
      .then((result) => {
        io.to(activeRoom.roomId).emit("game-over", {
          winner: result.winner,
          winnerId: result.winnerId,
          winnerUsername: result.winnerUsername,
          reason: "disconnect",
        });
        return gameManager.endGame(activeRoom.roomId);
      })
      .then(() => {
        roomManager.removeRoom(activeRoom.roomId);
      })
      .catch((error) => {
        console.error("[Disconnect] Failed to resign active game", error);
      });
  }

  console.log(`User Disconnected: ${user.username} (${socket.id})`);
  io.emit("online-users", onlineUsers.getAllOnlineUsers());
};
