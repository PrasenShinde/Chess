/**
 * MoveResolver.js
 * Core move resolution engine.
 * Takes current chess.js instance and parsed move intent object.
 * Searches legal moves from chess.moves({ verbose: true }), resolves exact move { from, to, promotion },
 * detects ambiguous moves, and handles errors without guessing illegal moves.
 */

import { Chess } from "chess.js";

const PIECE_CODE_MAP = {
  pawn: "p",
  knight: "n",
  bishop: "b",
  rook: "r",
  queen: "q",
  king: "k",
};

/**
 * Resolves a parsed move intent against the legal moves in the current chess position.
 * @param {Chess|string} chessInstance chess.js instance or FEN string
 * @param {Object} parsedIntent Intent object from MoveParser
 * @returns {Object} { from, to, promotion } | { ambiguous: true, options } | { error: string }
 */
export function resolveMove(chessInstance, parsedIntent) {
  if (!chessInstance || !parsedIntent) {
    return { error: "Invalid parameters provided to MoveResolver." };
  }

  // Ensure we have a valid Chess instance
  let chess = chessInstance;
  if (typeof chessInstance === "string") {
    chess = new Chess(chessInstance);
  }

  const legalMoves = chess.moves({ verbose: true });

  if (!legalMoves || legalMoves.length === 0) {
    return { error: "No legal moves available in current position." };
  }

  // 1. Handle Castling
  if (parsedIntent.castle) {
    const isQueenside = parsedIntent.castle === "queenside" || parsedIntent.castle === "long";

    const castleMove = legalMoves.find((m) =>
      isQueenside
        ? m.san === "O-O-O" || m.flags.includes("q")
        : m.san === "O-O" || m.flags.includes("k")
    );

    if (castleMove) {
      return {
        from: castleMove.from,
        to: castleMove.to,
        promotion: castleMove.promotion || undefined,
        san: castleMove.san,
      };
    }

    return { error: `Castling (${isQueenside ? "Queenside" : "Kingside"}) is illegal in this position.` };
  }

  // Destination square is required for non-castling moves
  if (!parsedIntent.destination) {
    return { error: `Could not determine destination square from "${parsedIntent.rawText}".` };
  }

  const dest = parsedIntent.destination.toLowerCase();
  const targetPieceCode = parsedIntent.piece ? PIECE_CODE_MAP[parsedIntent.piece] : null;

  // Filter legal moves by destination square
  let candidates = legalMoves.filter((m) => m.to.toLowerCase() === dest);

  if (candidates.length === 0) {
    return { error: `No legal move found to square ${dest.toUpperCase()}.` };
  }

  // Filter by piece type if specified
  if (targetPieceCode) {
    const pieceFiltered = candidates.filter((m) => m.piece === targetPieceCode);
    if (pieceFiltered.length > 0) {
      candidates = pieceFiltered;
    } else {
      const pieceName = parsedIntent.piece;
      return { error: `No legal move for ${pieceName} to ${dest.toUpperCase()}.` };
    }
  } else {
    // If no piece specified, prefer pawn moves for simple pawn pushes e.g. "e4"
    const pawnMoves = candidates.filter((m) => m.piece === "p");
    if (pawnMoves.length === 1 && candidates.length > 1) {
      candidates = pawnMoves;
    }
  }

  // Filter by capture requirement if specified
  if (parsedIntent.capture) {
    const captureFiltered = candidates.filter(
      (m) => Boolean(m.captured) || m.flags.includes("c") || m.flags.includes("e")
    );
    if (captureFiltered.length > 0) {
      candidates = captureFiltered;
    } else {
      return { error: `Move to ${dest.toUpperCase()} is not a capture.` };
    }
  }

  // Filter by promotion piece if specified
  if (parsedIntent.promotion) {
    const promoFiltered = candidates.filter(
      (m) => m.promotion && m.promotion.toLowerCase() === parsedIntent.promotion.toLowerCase()
    );
    if (promoFiltered.length > 0) {
      candidates = promoFiltered;
    }
  }

  // Evaluate candidate results
  if (candidates.length === 1) {
    const match = candidates[0];
    return {
      from: match.from,
      to: match.to,
      promotion: match.promotion || parsedIntent.promotion || undefined,
      san: match.san,
    };
  }

  // Handle Ambiguous Moves (multiple pieces of same type can move to destination)
  if (candidates.length > 1) {
    return {
      ambiguous: true,
      options: candidates.map((m) => ({
        from: m.from,
        to: m.to,
        san: m.san,
        piece: m.piece,
      })),
      error: `Ambiguous move. Multiple pieces can move to ${dest.toUpperCase()}.`,
    };
  }

  return { error: `Illegal move: "${parsedIntent.rawText}".` };
}

export default {
  resolveMove,
};
