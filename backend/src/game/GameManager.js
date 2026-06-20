import { ChessRoom } from "./ChessRoom.js";
import { RedisGameStore } from "./RedisGameStore.js";
import { withGameLock } from "./RedisLock.js";
import prisma from "../prisma/client.js";

const MOVE_TIMEOUT_MS = 10 * 60 * 1000;

class GameManager {
  constructor() {
    if (!GameManager.instance) {
      GameManager.instance = this;
    }
    return GameManager.instance;
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
      drawOfferBy: room.drawOfferBy || null,
      turnStartedAt: room.turnStartedAt || new Date().toISOString(),
      createdAt: room.createdAt,
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
    );

    room.whitePlayerUsername = gameData.whitePlayerUsername;
    room.blackPlayerUsername = gameData.blackPlayerUsername;
    room.status = gameData.status || "playing";
    room.drawOfferBy = gameData.drawOfferBy || null;
    room.turnStartedAt = gameData.turnStartedAt || new Date().toISOString();
    room.createdAt = gameData.createdAt ? new Date(gameData.createdAt) : new Date();
    room.endReason = gameData.endReason || null;
    room.storedWinnerColor = gameData.winnerColor || null;

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
    };
  }

  async createGame(roomId, whitePlayer, blackPlayer) {
    const room = new ChessRoom(roomId, whitePlayer.id, blackPlayer.id);
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

      if (room.isGameOver()) {
        room.status = "game_over";
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

  async claimTimeout(roomId, playerId) {
    return withGameLock(roomId, async () => {
      const room = await this.getGame(roomId);
      if (!room) {
        throw new Error("Game not found");
      }

      this.assertPlayerInRoom(room, playerId);
      this.assertGameActive(room);

      const turn = room.getCurrentTurn();
      const isWhitePlayer = playerId === room.whitePlayerId;

      if ((turn === "w" && isWhitePlayer) || (turn === "b" && !isWhitePlayer)) {
        throw new Error("You cannot claim timeout on your own turn");
      }

      const elapsed = Date.now() - new Date(room.turnStartedAt).getTime();
      if (elapsed < MOVE_TIMEOUT_MS) {
        throw new Error("Opponent still has time on the clock");
      }

      const winnerColor = isWhitePlayer ? "white" : "black";
      room.pendingWinnerColor = winnerColor;

      const outcome = await this.finalizeGame(room, winnerColor, "timeout");

      return {
        room,
        isGameOver: true,
        winner: outcome.winnerColor,
        winnerId: outcome.winnerId,
        winnerUsername: outcome.winnerUsername,
        reason: "timeout",
      };
    });
  }

  async endGame(roomId) {
    await RedisGameStore.deleteGame(roomId);
  }

  async updateRatings(room, winnerColor) {
    const winnerId = winnerColor === "white" ? room.whitePlayerId : room.blackPlayerId;
    const loserId = winnerColor === "white" ? room.blackPlayerId : room.whitePlayerId;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: winnerId },
        data: { rating: { increment: 10 } },
      }),
      prisma.user.update({
        where: { id: loserId },
        data: { rating: { decrement: 10 } },
      }),
    ]);
  }
}

const gameManagerInstance = new GameManager();
export default gameManagerInstance;
