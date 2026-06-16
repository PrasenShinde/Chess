import { ChessRoom } from "./ChessRoom.js";
import { RedisGameStore } from "./RedisGameStore.js";

class GameManager {
  constructor() {
    if (!GameManager.instance) {
      GameManager.instance = this;
    }
    return GameManager.instance;
  }

  async createGame(roomId, whitePlayer, blackPlayer) {
    const room = new ChessRoom(roomId, whitePlayer.id, blackPlayer.id);
    
    const gameData = {
      roomId: room.roomId,
      whitePlayerId: room.whitePlayerId,
      whitePlayerUsername: whitePlayer.username,
      blackPlayerId: room.blackPlayerId,
      blackPlayerUsername: blackPlayer.username,
      fen: room.getFen(),
      moves: room.getMoves(),
      status: "playing",
      createdAt: room.createdAt
    };

    await RedisGameStore.saveGame(roomId, gameData);
    return room;
  }

  async getGame(roomId) {
    const gameData = await RedisGameStore.getGame(roomId);
    if (!gameData) return null;

    const room = new ChessRoom(
      gameData.roomId,
      gameData.whitePlayerId,
      gameData.blackPlayerId,
      gameData.fen,
      gameData.moves
    );
    
    room.whitePlayerUsername = gameData.whitePlayerUsername;
    room.blackPlayerUsername = gameData.blackPlayerUsername;
    room.status = gameData.status;
    room.createdAt = gameData.createdAt ? new Date(gameData.createdAt) : new Date();

    return room;
  }

  async makeMove(roomId, playerId, from, to, promotion) {
    const room = await this.getGame(roomId);
    if (!room) {
      throw new Error("Game not found");
    }

    if (playerId !== room.whitePlayerId && playerId !== room.blackPlayerId) {
      throw new Error("Player not in this game");
    }

    const turn = room.getCurrentTurn();
    const isWhitePlayer = playerId === room.whitePlayerId;
    
    if ((turn === 'w' && !isWhitePlayer) || (turn === 'b' && isWhitePlayer)) {
      throw new Error("Not your turn");
    }

    if (room.status !== "playing") {
      throw new Error("Game has already ended");
    }

    const moveResult = room.makeMove(from, to, promotion);
    if (!moveResult) {
      throw new Error("Illegal move");
    }

    const updatedGameData = {
      roomId: room.roomId,
      whitePlayerId: room.whitePlayerId,
      whitePlayerUsername: room.whitePlayerUsername,
      blackPlayerId: room.blackPlayerId,
      blackPlayerUsername: room.blackPlayerUsername,
      fen: room.getFen(),
      moves: room.getMoves(),
      status: room.isGameOver() ? "game_over" : "playing",
      createdAt: room.createdAt
    };

    await RedisGameStore.updateGame(roomId, updatedGameData);

    return {
      room,
      moveResult,
      isGameOver: room.isGameOver(),
      winner: room.isGameOver() ? (room.chess.isCheckmate() ? (room.getCurrentTurn() === 'w' ? 'black' : 'white') : null) : null,
      reason: room.isGameOver() ? room.getGameOverReason() : null
    };
  }

  async endGame(roomId) {
    await RedisGameStore.deleteGame(roomId);
  }
}

const gameManagerInstance = new GameManager();
export default gameManagerInstance;
