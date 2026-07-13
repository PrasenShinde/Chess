import { Chess } from "chess.js";

const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const TIME_CONTROLS = {
  bullet: 60000,
  blitz: 180000,
  rapid: 600000,
};

export const getTimeMs = (control) => TIME_CONTROLS[control] || TIME_CONTROLS.rapid;

export class ChessRoom {
  constructor(roomId, whitePlayerId, blackPlayerId, fen = null, moves = [], timeControl = null) {
    this.roomId = roomId;
    this.whitePlayerId = whitePlayerId;
    this.blackPlayerId = blackPlayerId;
    this.createdAt = new Date();

    this.chess = new Chess();

    if (fen) {
      this.chess.load(fen);
    }

    this.moves = moves;

    this.timeControl = timeControl || 'rapid';
    this.initialTimeMs = getTimeMs(this.timeControl);
    this.whiteTimeMs = this.initialTimeMs;
    this.blackTimeMs = this.initialTimeMs;
    this.lastTimerTick = Date.now();
  }

  getCapturedPieces() {
    const initialPieceCounts = {
      p: { w: 8, b: 8 },
      n: { w: 2, b: 2 },
      b: { w: 2, b: 2 },
      r: { w: 2, b: 2 },
      q: { w: 1, b: 1 },
    };

    const fenParts = this.chess.fen().split(' ')[0];
    const currentPieces = fenParts.replace(/[0-9]/g, (d) => ' '.repeat(parseInt(d))).replace(/\//g, ' ');

    for (const ch of currentPieces) {
      if (ch === ' ') continue;
      const type = ch.toLowerCase();
      const color = ch === ch.toUpperCase() ? 'w' : 'b';
      if (initialPieceCounts[type]) {
        initialPieceCounts[type][color]--;
      }
    }

    const captured = { white: [], black: [] };
    for (const [type, counts] of Object.entries(initialPieceCounts)) {
      while (counts.w < 0) { captured.white.push(type); counts.w++; }
      while (counts.b < 0) { captured.black.push(type); counts.b++; }
    }

    return {
      white: captured.white.filter(Boolean),
      black: captured.black.filter(Boolean),
    };
  }

  getCaptureScore(color) {
    const captured = this.getCapturedPieces();
    const theirCaptures = color === 'white' ? captured.black : captured.white; // pieces the opponent lost
    return theirCaptures.reduce((sum, p) => sum + (PIECE_VALUES[p] || 0), 0);
  }

  getCaptureAdvantage(playerColor) {
    const myScore = this.getCaptureScore(playerColor);
    const oppScore = playerColor === 'white' ? this.getCaptureScore('black') : this.getCaptureScore('white');
    return myScore - oppScore;
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
    return this.chess.turn();
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
      createdAt: this.createdAt,
      timeControl: this.timeControl,
      initialTimeMs: this.initialTimeMs,
      whiteTimeMs: this.whiteTimeMs,
      blackTimeMs: this.blackTimeMs,
      lastTimerTick: this.lastTimerTick,
    };
  }
}
