import { ChessRoom, getTimeMs } from "./ChessRoom.js";
import { RedisGameStore } from "./RedisGameStore.js";
import { withGameLock } from "./RedisLock.js";
import prisma from "../prisma/client.js";
import crypto from "crypto";

const TIMER_INTERVAL_MS = 200;

class GameManager {
  constructor() {
    if (!GameManager.instance) {
      GameManager.instance = this;
      this.activeTimers = new Map();
      this.io = null;
    }
    return GameManager.instance;
  }

  setIo(io) {
    this.io = io;
  }

  buildGamePayload(room, extras = {}) {
    return {
      roomId: room.roomId,
      whitePlayerId: room.whitePlayerId,
      whitePlayerUsername: room.whitePlayerUsername,
      blackPlayerId: room.blackPlayerId,
      blackPlayerUsername: room.blackPlayerUsername,
      fen: room.getFen(),
      moves: room.getMoves(),
      status: room.status,
      turn: room.getCurrentTurn(),
      drawOfferBy: room.drawOfferBy || null,
      rematchOfferBy: room.rematchOfferBy || null,
      turnStartedAt: room.turnStartedAt || new Date().toISOString(),
      createdAt: room.createdAt,
      timeControl: room.timeControl,
      initialTimeMs: room.initialTimeMs,
      whiteTimeMs: room.whiteTimeMs,
      blackTimeMs: room.blackTimeMs,
      lastTimerTick: Date.now(),
      ...extras,
    };
  }

  hydrateRoom(gameData) {
    const room = new ChessRoom(
      gameData.roomId,
      gameData.whitePlayerId,
      gameData.blackPlayerId,
      gameData.fen,
      gameData.moves,
      gameData.timeControl,
    );

    room.whitePlayerUsername = gameData.whitePlayerUsername;
    room.blackPlayerUsername = gameData.blackPlayerUsername;
    room.status = gameData.status || "playing";
    room.drawOfferBy = gameData.drawOfferBy || null;
    room.rematchOfferBy = gameData.rematchOfferBy || null;
    room.turnStartedAt = gameData.turnStartedAt || new Date().toISOString();
    room.createdAt = gameData.createdAt ? new Date(gameData.createdAt) : new Date();
    room.endReason = gameData.endReason || null;
    room.storedWinnerColor = gameData.winnerColor || null;

    room.whiteTimeMs = gameData.whiteTimeMs ?? room.initialTimeMs;
    room.blackTimeMs = gameData.blackTimeMs ?? room.initialTimeMs;
    room.lastTimerTick = gameData.lastTimerTick || Date.now();

    const elapsed = Date.now() - room.lastTimerTick;
    if (room.status === "playing" && elapsed > 0) {
      const turn = room.getCurrentTurn();
      if (turn === "w") {
        room.whiteTimeMs = Math.max(0, room.whiteTimeMs - elapsed);
      } else {
        room.blackTimeMs = Math.max(0, room.blackTimeMs - elapsed);
      }
      room.lastTimerTick = Date.now();
    }

    return room;
  }

  async loadGameFromDb(roomId) {
    const game = await prisma.game.findUnique({ where: { roomId } });
    if (!game) {
      return null;
    }

    return {
      roomId: game.roomId,
      whitePlayerId: game.whitePlayerId,
      whitePlayerUsername: game.whitePlayerUsername,
      blackPlayerId: game.blackPlayerId,
      blackPlayerUsername: game.blackPlayerUsername,
      fen: game.finalFen || undefined,
      moves: Array.isArray(game.moves) ? game.moves : [],
      status: game.status === "PLAYING" ? "playing" : "game_over",
      drawOfferBy: null,
      turnStartedAt: game.updatedAt.toISOString(),
      createdAt: game.startedAt.toISOString(),
      endReason: game.reason,
      winnerColor:
        game.winnerId === game.whitePlayerId
          ? "white"
          : game.winnerId === game.blackPlayerId
            ? "black"
            : null,
      timeControl: game.timeControl || "rapid",
      initialTimeMs: game.initialTimeMs || getTimeMs("rapid"),
      whiteTimeMs: game.initialTimeMs || getTimeMs("rapid"),
      blackTimeMs: game.initialTimeMs || getTimeMs("rapid"),
      lastTimerTick: Date.now(),
      turn: game.finalFen ? game.finalFen.split(" ")[1] : "w",
    };
  }

  async createGame(roomId, whitePlayer, blackPlayer, timeControl = "rapid") {
    const room = new ChessRoom(roomId, whitePlayer.id, blackPlayer.id, null, [], timeControl);
    room.whitePlayerUsername = whitePlayer.username || "White";
    room.blackPlayerUsername = blackPlayer.username || "Black";
    room.turnStartedAt = new Date().toISOString();

    const gameData = this.buildGamePayload(room);

    await RedisGameStore.saveGame(roomId, gameData);
    await prisma.game.upsert({
      where: { roomId },
      update: {
        whitePlayerId: whitePlayer.id,
        whitePlayerUsername: whitePlayer.username || "White",
        blackPlayerId: blackPlayer.id,
        blackPlayerUsername: blackPlayer.username || "Black",
        status: "PLAYING",
        result: null,
        winnerId: null,
        reason: null,
        finalFen: room.getFen(),
        pgn: room.getPgn(),
        moves: room.getMoves(),
        startedAt: room.createdAt,
        endedAt: null,
        timeControl,
        initialTimeMs: room.initialTimeMs,
      },
      create: {
        roomId,
        whitePlayerId: whitePlayer.id,
        whitePlayerUsername: whitePlayer.username || "White",
        blackPlayerId: blackPlayer.id,
        blackPlayerUsername: blackPlayer.username || "Black",
        status: "PLAYING",
        finalFen: room.getFen(),
        pgn: room.getPgn(),
        moves: room.getMoves(),
        startedAt: room.createdAt,
        timeControl,
        initialTimeMs: room.initialTimeMs,
      },
    });

    return room;
  }

  async getGame(roomId) {
    const gameData = await RedisGameStore.getGame(roomId);
    const resolvedData = gameData || (await this.loadGameFromDb(roomId));

    if (!resolvedData) {
      return null;
    }

    return this.hydrateRoom(resolvedData);
  }

  assertPlayerInRoom(room, playerId) {
    if (playerId !== room.whitePlayerId && playerId !== room.blackPlayerId) {
      throw new Error("Player not in this game");
    }
  }

  assertGameActive(room) {
    if (room.status !== "playing") {
      throw new Error("Game has already ended");
    }
  }

  assertPlayerTurn(room, playerId) {
    if (room.whitePlayerId === room.blackPlayerId && playerId === room.whitePlayerId) {
      return;
    }

    const turn = room.getCurrentTurn();
    const isWhitePlayer = playerId === room.whitePlayerId;

    if ((turn === "w" && !isWhitePlayer) || (turn === "b" && isWhitePlayer)) {
      throw new Error("Not your turn");
    }
  }

  getWinnerColor(room) {
    if (room.storedWinnerColor) {
      return room.storedWinnerColor;
    }

    if (room.pendingWinnerColor) {
      return room.pendingWinnerColor;
    }

    if (!room.isGameOver() || !room.chess.isCheckmate()) {
      return null;
    }

    return room.getCurrentTurn() === "w" ? "black" : "white";
  }

  getResult(room, winnerColor) {
    if (room.status !== "game_over") {
      return null;
    }

    if (winnerColor === "white") return "WHITE_WIN";
    if (winnerColor === "black") return "BLACK_WIN";
    return "DRAW";
  }

  getWinnerUsername(room, winnerColor) {
    if (winnerColor === "white") return room.whitePlayerUsername || "White";
    if (winnerColor === "black") return room.blackPlayerUsername || "Black";
    return null;
  }

  async persistGameState(room, { winnerColor, reason, status }) {
    const result = this.getResult(room, winnerColor);
    const winnerId = winnerColor === "white"
      ? room.whitePlayerId
      : winnerColor === "black"
        ? room.blackPlayerId
        : null;

    const gameData = this.buildGamePayload(room, {
      status: room.status,
    });

    if (winnerColor) {
      room.storedWinnerColor = winnerColor;
      gameData.winnerColor = winnerColor;
    }

    if (reason) {
      room.endReason = reason;
      gameData.endReason = reason;
    }

    if (room.status === "playing") {
      await RedisGameStore.updateGame(room.roomId, gameData);
    } else {
      gameData.status = "game_over";
      await RedisGameStore.updateGame(room.roomId, gameData, 3600);
    }

    await prisma.game.update({
      where: { roomId: room.roomId },
      data: {
        status: status || (room.status === "playing" ? "PLAYING" : "COMPLETED"),
        result,
        winnerId,
        reason,
        finalFen: room.getFen(),
        pgn: room.getPgn(),
        moves: room.getMoves(),
        endedAt: room.status === "game_over" ? new Date() : null,
      },
    });

    if (room.status === "game_over" && winnerId) {
      this.updateRatings(room, winnerColor).catch((error) => {
        console.error("[GameManager] Failed to update ratings", error);
      });
    }

    return {
      winnerColor,
      winnerId,
      winnerUsername: this.getWinnerUsername(room, winnerColor),
      reason,
      result,
    };
  }

  async finalizeGame(room, winnerColor, reason, status = "COMPLETED") {
    room.status = "game_over";
    room.pendingWinnerColor = winnerColor;
    room.drawOfferBy = null;

    return this.persistGameState(room, { winnerColor, reason, status });
  }

  async makeMove(roomId, playerId, from, to, promotion) {
    return withGameLock(roomId, async () => {
      const room = await this.getGame(roomId);
      if (!room) {
        throw new Error("Game not found");
      }

      this.assertPlayerInRoom(room, playerId);
      this.assertGameActive(room);
      this.assertPlayerTurn(room, playerId);

      const moveResult = room.makeMove(from, to, promotion);
      if (!moveResult) {
        throw new Error("Illegal move");
      }

      room.drawOfferBy = null;
      room.turnStartedAt = new Date().toISOString();
      room.lastTimerTick = Date.now();

      if (room.isGameOver()) {
        room.status = "game_over";
        this.stopTimer(roomId);
      }

      const winnerColor = this.getWinnerColor(room);
      const outcome = await this.persistGameState(room, {
        winnerColor,
        reason: room.isGameOver() ? room.getGameOverReason() : null,
      });

      return {
        room,
        moveResult,
        isGameOver: room.status === "game_over",
        winner: outcome.winnerColor,
        winnerId: outcome.winnerId,
        winnerUsername: outcome.winnerUsername,
        reason: outcome.reason,
      };
    });
  }

  async resignGame(roomId, playerId) {
    return withGameLock(roomId, async () => {
      const room = await this.getGame(roomId);
      if (!room) {
        throw new Error("Game not found");
      }

      this.assertPlayerInRoom(room, playerId);
      this.assertGameActive(room);

      const winnerColor = playerId === room.whitePlayerId ? "black" : "white";
      room.pendingWinnerColor = winnerColor;

      this.stopTimer(roomId);

      const outcome = await this.finalizeGame(room, winnerColor, "resign");

      return {
        room,
        isGameOver: true,
        winner: outcome.winnerColor,
        winnerId: outcome.winnerId,
        winnerUsername: outcome.winnerUsername,
        reason: "resign",
      };
    });
  }

  async offerDraw(roomId, playerId) {
    return withGameLock(roomId, async () => {
      const room = await this.getGame(roomId);
      if (!room) {
        throw new Error("Game not found");
      }

      this.assertPlayerInRoom(room, playerId);
      this.assertGameActive(room);

      room.drawOfferBy = playerId;
      await RedisGameStore.updateGame(room.roomId, this.buildGamePayload(room));

      return { room, drawOfferBy: playerId };
    });
  }

  async declineDraw(roomId, playerId) {
    return withGameLock(roomId, async () => {
      const room = await this.getGame(roomId);
      if (!room) {
        throw new Error("Game not found");
      }

      this.assertPlayerInRoom(room, playerId);
      this.assertGameActive(room);

      if (!room.drawOfferBy || room.drawOfferBy === playerId) {
        throw new Error("No draw offer to decline");
      }

      room.drawOfferBy = null;
      await RedisGameStore.updateGame(room.roomId, this.buildGamePayload(room));

      return { room };
    });
  }

  async acceptDraw(roomId, playerId) {
    return withGameLock(roomId, async () => {
      const room = await this.getGame(roomId);
      if (!room) {
        throw new Error("Game not found");
      }

      this.assertPlayerInRoom(room, playerId);
      this.assertGameActive(room);

      if (!room.drawOfferBy || room.drawOfferBy === playerId) {
        throw new Error("No draw offer to accept");
      }

      this.stopTimer(roomId);

      const outcome = await this.finalizeGame(room, null, "draw");

      return {
        room,
        isGameOver: true,
        winner: null,
        winnerId: null,
        winnerUsername: null,
        reason: "draw",
      };
    });
  }

  async endGame(roomId) {
    this.stopTimer(roomId);
    await RedisGameStore.deleteGame(roomId);
  }

  async updateRatings(room, winnerColor) {
    const winnerId = winnerColor === "white" ? room.whitePlayerId : room.blackPlayerId;
    const loserId = winnerColor === "white" ? room.blackPlayerId : room.whitePlayerId;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: winnerId },
        data: { rating: { increment: 8 } },
      }),
      prisma.user.update({
        where: { id: loserId },
        data: { rating: { decrement: 8 } },
      }),
    ]);
  }

  // Timer management
  startTimer(roomId) {
    if (this.activeTimers.has(roomId)) return;
    if (!this.io) return;

    const intervalId = setInterval(async () => {
      try {
        const gameData = await RedisGameStore.getGame(roomId);
        if (!gameData || gameData.status === "game_over") {
          this.stopTimer(roomId);
          return;
        }

        const now = Date.now();
        const turn = gameData.turn || (gameData.fen?.split(" ")[1] || "w");
        let whiteTimeMs = gameData.whiteTimeMs ?? getTimeMs(gameData.timeControl || "rapid");
        let blackTimeMs = gameData.blackTimeMs ?? getTimeMs(gameData.timeControl || "rapid");
        const lastTick = gameData.lastTimerTick || now;
        const delta = now - lastTick;

        if (delta > 0) {
          if (turn === "w") {
            whiteTimeMs = Math.max(0, whiteTimeMs - delta);
          } else {
            blackTimeMs = Math.max(0, blackTimeMs - delta);
          }
        }

        gameData.whiteTimeMs = whiteTimeMs;
        gameData.blackTimeMs = blackTimeMs;
        gameData.lastTimerTick = now;

        this.io.to(roomId).emit("timer-update", {
          whiteTimeMs: Math.round(whiteTimeMs),
          blackTimeMs: Math.round(blackTimeMs),
        });

        let timeoutWinner = null;
        if (whiteTimeMs <= 0) timeoutWinner = "black";
        else if (blackTimeMs <= 0) timeoutWinner = "white";

        if (timeoutWinner && this.activeTimers.has(roomId)) {
          this.stopTimer(roomId);
          gameData.whiteTimeMs = Math.max(0, whiteTimeMs);
          gameData.blackTimeMs = Math.max(0, blackTimeMs);
          gameData.status = "game_over";
          gameData.winnerColor = timeoutWinner;
          gameData.endReason = "timeout";
          await RedisGameStore.updateGame(roomId, gameData, 3600);

          const room = await this.getGame(roomId);
          if (room) {
            const outcome = await this.finalizeGame(room, timeoutWinner, "timeout");
            this.io.to(roomId).emit("game-over", {
              winner: outcome.winnerColor,
              winnerId: outcome.winnerId,
              winnerUsername: outcome.winnerUsername,
              reason: "timeout",
            });
          }
        }
      } catch (err) {
        console.error(`[Timer] Error for room ${roomId}:`, err.message);
      }
    }, TIMER_INTERVAL_MS);

    this.activeTimers.set(roomId, intervalId);
  }

  stopTimer(roomId) {
    if (this.activeTimers.has(roomId)) {
      clearInterval(this.activeTimers.get(roomId));
      this.activeTimers.delete(roomId);
    }
  }

  // Rematch
  async rematchGame(roomId, playerId) {
    return withGameLock(roomId, async () => {
      const room = await this.getGame(roomId);
      if (!room) {
        throw new Error("Game not found");
      }

      this.assertPlayerInRoom(room, playerId);

      const whiteId = room.whitePlayerId;
      const blackId = room.blackPlayerId;
      const whiteUsername = room.whitePlayerUsername;
      const blackUsername = room.blackPlayerUsername;
      const timeControl = room.timeControl;

      const newRoomId = `room_${crypto.randomUUID().slice(0, 8)}`;
      const newRoom = new ChessRoom(newRoomId, blackId, whiteId, null, [], timeControl);
      newRoom.whitePlayerUsername = blackUsername;
      newRoom.blackPlayerUsername = whiteUsername;
      newRoom.turnStartedAt = new Date().toISOString();

      const gameData = this.buildGamePayload(newRoom);
      await RedisGameStore.saveGame(newRoomId, gameData);
      await prisma.game.upsert({
        where: { roomId: newRoomId },
        update: {
          whitePlayerId: blackId,
          whitePlayerUsername: blackUsername,
          blackPlayerId: whiteId,
          blackPlayerUsername: whiteUsername,
          status: "PLAYING",
          result: null,
          winnerId: null,
          reason: null,
          finalFen: newRoom.getFen(),
          pgn: newRoom.getPgn(),
          moves: newRoom.getMoves(),
          startedAt: newRoom.createdAt,
          endedAt: null,
          timeControl,
          initialTimeMs: newRoom.initialTimeMs,
        },
        create: {
          roomId: newRoomId,
          whitePlayerId: blackId,
          whitePlayerUsername: blackUsername,
          blackPlayerId: whiteId,
          blackPlayerUsername: whiteUsername,
          status: "PLAYING",
          finalFen: newRoom.getFen(),
          pgn: newRoom.getPgn(),
          moves: newRoom.getMoves(),
          startedAt: newRoom.createdAt,
          timeControl,
          initialTimeMs: newRoom.initialTimeMs,
        },
      });

      return { newRoomId, newRoom, players: { white: { id: blackId, username: blackUsername }, black: { id: whiteId, username: whiteUsername } } };
    });
  }
}

const gameManagerInstance = new GameManager();
export default gameManagerInstance;
