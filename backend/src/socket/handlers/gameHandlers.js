import gameManager from "../../game/GameManager.js";

export const registerGameHandlers = (io, socket) => {
  const user = socket.user;

  // Handle player making a move
  socket.on("move", async ({ roomId, from, to, promotion }) => {
    try {
      console.log(`[Move Request] Room: ${roomId}, Player: ${user.username}, Move: ${from} -> ${to}`);
      
      const result = await gameManager.makeMove(roomId, user.id, from, to, promotion);
      const { room, moveResult, isGameOver, winner, reason } = result;

      // Broadcast move to everyone in the room
      io.to(roomId).emit("move-made", {
        roomId,
        fen: room.getFen(),
        move: {
          from,
          to,
          san: moveResult.san
        },
        turn: room.getCurrentTurn()
      });

      // If game is over, broadcast game-over event
      if (isGameOver) {
        let winnerName = null;
        if (winner === "white") {
          winnerName = room.whitePlayerUsername || "White";
        } else if (winner === "black") {
          winnerName = room.blackPlayerUsername || "Black";
        }

        io.to(roomId).emit("game-over", {
          winner: winnerName,
          reason
        });

        // Clean up the game in Redis
        await gameManager.endGame(roomId);
      }

    } catch (error) {
      console.error("[Move Error]", error.message);
      socket.emit("move-error", { message: error.message });
    }
  });

  // Handle player reconnecting / requesting game state resume
  socket.on("resume-game", async ({ roomId }) => {
    try {
      const room = await gameManager.getGame(roomId);
      if (!room) {
        socket.emit("move-error", { message: "Game session not found" });
        return;
      }

      // Verify player belongs to room
      if (user.id !== room.whitePlayerId && user.id !== room.blackPlayerId) {
        socket.emit("move-error", { message: "You are not a player in this room" });
        return;
      }

      // Join the socket to the room room ID
      socket.join(roomId);
      console.log(`[Resume Game] User ${user.username} rejoined room ${roomId}`);

      // Emit current game state back to the requesting client
      socket.emit("resume-game", {
        roomId: room.roomId,
        fen: room.getFen(),
        moves: room.getMoves(),
        turn: room.getCurrentTurn(),
        status: room.status,
        whitePlayerId: room.whitePlayerId,
        whitePlayerUsername: room.whitePlayerUsername,
        blackPlayerId: room.blackPlayerId,
        blackPlayerUsername: room.blackPlayerUsername,
        winner: room.isGameOver() ? (room.chess.isCheckmate() ? (room.getCurrentTurn() === 'w' ? 'black' : 'white') : null) : null,
        reason: room.isGameOver() ? room.getGameOverReason() : null
      });

    } catch (error) {
      console.error("[Resume Game Error]", error);
      socket.emit("move-error", { message: "Failed to resume game" });
    }
  });
};
