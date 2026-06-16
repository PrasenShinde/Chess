import { Chess } from "chess.js";

export class ChessRoom {
  constructor(roomId, whitePlayerId, blackPlayerId, fen = null, moves = []) {
    this.roomId = roomId;
    this.whitePlayerId = whitePlayerId;
    this.blackPlayerId = blackPlayerId;
    this.createdAt = new Date();
    
    // Initialize Chess.js
    this.chess = new Chess();
    
    // If we have a FEN, load it
    if (fen) {
      this.chess.load(fen);
    }
    
    this.moves = moves;
  }

  makeMove(from, to, promotion = undefined) {
    try {
      const moveObj = this.chess.move({ from, to, promotion });
      if (moveObj) {
        this.moves.push(moveObj.san);
        return moveObj;
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  getFen() {
    return this.chess.fen();
  }

  getPgn() {
    return this.chess.pgn();
  }

  getMoves() {
    return this.moves;
  }

  getCurrentTurn() {
    return this.chess.turn(); // 'w' or 'b'
  }

  isGameOver() {
    return this.chess.isGameOver();
  }
  
  getGameOverReason() {
    if (this.chess.isCheckmate()) return "checkmate";
    if (this.chess.isDraw()) {
      if (this.chess.isStalemate()) return "stalemate";
      if (this.chess.isThreefoldRepetition()) return "repetition";
      if (this.chess.isInsufficientMaterial()) return "insufficient";
      return "draw";
    }
    return null;
  }

  serialize() {
    return {
      roomId: this.roomId,
      whitePlayerId: this.whitePlayerId,
      blackPlayerId: this.blackPlayerId,
      fen: this.getFen(),
      moves: this.moves,
      status: this.isGameOver() ? "game_over" : "playing",
      createdAt: this.createdAt
    };
  }
}
