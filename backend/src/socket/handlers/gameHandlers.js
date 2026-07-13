import gameManager from "../../game/GameManager.js";
import roomManager from "../../services/RoomManager.js";
import { socketRateLimit } from "../../middleware/socketRateLimit.middleware.js";

const buildPlayersPayload = (room) => ({
  white: {
    id: room.whitePlayerId,
    username: room.whitePlayerUsername || "White",
  },
  black: {
    id: room.blackPlayerId,
    username: room.blackPlayerUsername || "Black",
  },
});

const emitGameOver = async (io, roomId, room, outcome) => {
  io.to(roomId).emit("game-over", {
    winner: outcome.winner,
    winnerId: outcome.winnerId,
    winnerUsername: outcome.winnerUsername,
    reason: outcome.reason,
  });

  await gameManager.endGame(roomId);
  roomManager.removeRoom(roomId);
};

const isSquare = (value) => /^[a-h][1-8]$/.test(value);

export const registerGameHandlers = (io, socket) => {
  const user = socket.user;
  const limitMove = socketRateLimit("move", { max: 120 });
  const limitControl = socketRateLimit("game-control", { max: 20 });

  socket.on("move", async ({ roomId, from, to, promotion }) => {
    try {
      if (!roomId || !isSquare(from) || !isSquare(to)) {
        socket.emit("move-error", { message: "Invalid move payload" });
        return;
      }

      const result = await gameManager.makeMove(roomId, user.id, from, to, promotion);
      const { room, moveResult, isGameOver, winner, winnerId, winnerUsername, reason } = result;

      io.to(roomId).emit("move-made", {
        roomId,
        fen: room.getFen(),
        move: {
          from,
          to,
          san: moveResult.san,
        },
        turn: room.getCurrentTurn(),
        whiteTimeMs: Math.round(room.whiteTimeMs),
        blackTimeMs: Math.round(room.blackTimeMs),
      });

      if (isGameOver) {
        await emitGameOver(io, roomId, room, {
          winner,
          winnerId,
          winnerUsername,
          reason,
        });
      }
    } catch (error) {
      console.error("[Move Error]", error.message);
      socket.emit("move-error", { message: error.message });
    }
  });

  socket.on("resign", limitControl(socket, async ({ roomId }) => {
    try {
      if (!roomId) {
        socket.emit("move-error", { message: "Room ID required" });
        return;
      }

      const result = await gameManager.resignGame(roomId, user.id);
      await emitGameOver(io, roomId, result.room, result);
    } catch (error) {
      socket.emit("move-error", { message: error.message });
    }
  }));

  socket.on("offer-draw", limitControl(socket, async ({ roomId }) => {
    try {
      if (!roomId) {
        socket.emit("move-error", { message: "Room ID required" });
        return;
      }

      const { drawOfferBy } = await gameManager.offerDraw(roomId, user.id);
      socket.to(roomId).emit("draw-offered", { roomId, offeredBy: drawOfferBy });
    } catch (error) {
      socket.emit("move-error", { message: error.message });
    }
  }));

  socket.on("accept-draw", limitControl(socket, async ({ roomId }) => {
    try {
      if (!roomId) {
        socket.emit("move-error", { message: "Room ID required" });
        return;
      }

      const result = await gameManager.acceptDraw(roomId, user.id);
      await emitGameOver(io, roomId, result.room, result);
    } catch (error) {
      socket.emit("move-error", { message: error.message });
    }
  }));

  socket.on("decline-draw", limitControl(socket, async ({ roomId }) => {
    try {
      if (!roomId) {
        socket.emit("move-error", { message: "Room ID required" });
        return;
      }

      await gameManager.declineDraw(roomId, user.id);
      io.to(roomId).emit("draw-declined", { roomId, declinedBy: user.id });
    } catch (error) {
      socket.emit("move-error", { message: error.message });
    }
  }));

  socket.on("rematch", limitControl(socket, async ({ roomId }) => {
    try {
      if (!roomId) {
        socket.emit("move-error", { message: "Room ID required" });
        return;
      }

      const result = await gameManager.rematchGame(roomId, user.id);
      const newRoom = result.newRoom;

      const initiatorNewColor = result.players.black.id === user.id ? "black" : "white";
      const opponentNewColor = initiatorNewColor === "white" ? "black" : "white";

      socket.join(result.newRoomId);
      socket.to(roomId).emit("rematch-started", {
        newRoomId: result.newRoomId,
        color: opponentNewColor,
        players: result.players,
      });

      socket.emit("rematch-started", {
        newRoomId: result.newRoomId,
        color: initiatorNewColor,
        players: result.players,
      });

      gameManager.startTimer(result.newRoomId);
    } catch (error) {
      socket.emit("move-error", { message: error.message });
    }
  }));

  socket.on("resume-game", async ({ roomId, expectedColor }) => {
    try {
      const room = await gameManager.getGame(roomId);
      if (!room) {
        socket.emit("move-error", { message: "Game session not found" });
        return;
      }

      if (user.id !== room.whitePlayerId && user.id !== room.blackPlayerId) {
        socket.emit("move-error", { message: "You are not a player in this room" });
        return;
      }

      socket.join(roomId);

      let playerColor = user.id === room.whitePlayerId ? "white" : "black";

      if (room.whitePlayerId === room.blackPlayerId && expectedColor) {
        playerColor = expectedColor;
      }

      const winnerColor = gameManager.getWinnerColor(room);
      const players = buildPlayersPayload(room);

      if (room.status === "playing") {
        gameManager.startTimer(roomId);
      }

      socket.emit("resume-game", {
        roomId: room.roomId,
        fen: room.getFen(),
        moves: room.getMoves(),
        turn: room.getCurrentTurn(),
        status: room.status,
        playerColor,
        players,
        drawOfferBy: room.drawOfferBy,
        winner: winnerColor,
        winnerUsername: winnerColor ? players[winnerColor].username : null,
        reason:
          room.endReason ||
          (room.status === "game_over" ? room.getGameOverReason() : null),
        timeControl: room.timeControl,
        initialTimeMs: room.initialTimeMs,
        whiteTimeMs: Math.round(room.whiteTimeMs),
        blackTimeMs: Math.round(room.blackTimeMs),
      });
    } catch (error) {
      console.error("[Resume Game Error]", error);
      socket.emit("move-error", { message: "Failed to resume game" });
    }
  });
};
