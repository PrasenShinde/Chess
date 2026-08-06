/**
 * MoveParser.js
 * Parses normalized text into structured move intent object:
 * { piece, destination, capture, castle, promotion, rawText }
 * Pure parser — no move validation or execution.
 */

const PIECE_NAMES = ["pawn", "knight", "bishop", "rook", "queen", "king"];

const PROMOTION_MAP = {
  queen: "q",
  q: "q",
  rook: "r",
  r: "r",
  knight: "n",
  n: "n",
  bishop: "b",
  b: "b",
};

/**
 * Parses normalized chess move text into a structured intent object.
 * @param {string} text Normalized speech text
 * @returns {Object} Structured intent: { piece, destination, capture, castle, promotion, rawText }
 */
export function parseMove(text) {
  const result = {
    piece: null,
    destination: null,
    capture: false,
    castle: null,
    promotion: null,
    rawText: text || "",
  };

  if (!text || typeof text !== "string") {
    return result;
  }

  const clean = text.toLowerCase().trim();

  // 1. Check for Castling commands
  if (
    clean.includes("castle") ||
    clean.includes("kingside") ||
    clean.includes("queenside") ||
    clean.includes("short") ||
    clean.includes("long")
  ) {
    if (clean.includes("queenside") || clean.includes("long")) {
      result.castle = "queenside";
      return result;
    }
    if (clean.includes("kingside") || clean.includes("short") || clean.includes("castle")) {
      result.castle = "kingside";
      return result;
    }
  }

  // 2. Check for Capture flag
  if (clean.includes("takes") || clean.includes("capture") || clean.includes("x")) {
    result.capture = true;
  }

  // 3. Extract Destination Square (pattern: a1 - h8)
  const squareMatch = clean.match(/\b([a-h][1-8])\b/i);
  if (squareMatch) {
    result.destination = squareMatch[1].toLowerCase();
  }

  // 4. Extract Promotion if present
  // Promotion piece must appear AFTER the destination square or be preceded by "promote"
  const promoteKeywordMatch = clean.match(/promote(?:d)?(?:\s+to)?\s+([a-z]+)/i);
  if (promoteKeywordMatch && PROMOTION_MAP[promoteKeywordMatch[1]]) {
    result.promotion = PROMOTION_MAP[promoteKeywordMatch[1]];
  } else if (result.destination) {
    // Check if text after destination contains a promotion piece name (e.g. "e8 queen" or "pawn e8 rook")
    const destIndex = clean.indexOf(result.destination);
    const afterDest = clean.substring(destIndex + result.destination.length).trim();
    const wordsAfter = afterDest.split(/\s+/);
    for (const w of wordsAfter) {
      if (PROMOTION_MAP[w]) {
        result.promotion = PROMOTION_MAP[w];
        break;
      }
    }
  }

  // 5. Extract Main Piece (must appear BEFORE destination or as main command)
  let textBeforeDest = clean;
  if (result.destination) {
    const destIndex = clean.indexOf(result.destination);
    textBeforeDest = clean.substring(0, destIndex).trim();
  }

  for (const p of PIECE_NAMES) {
    const pieceRegex = new RegExp(`\\b${p}\\b`, "i");
    if (pieceRegex.test(textBeforeDest) || (!result.destination && pieceRegex.test(clean))) {
      result.piece = p;
      break;
    }
  }

  // Default piece to pawn if destination is a rank 1/8 move or no piece named
  if (!result.piece && result.destination) {
    result.piece = null; // Unspecified piece, MoveResolver will default to pawn or available piece
  }

  return result;
}

export default {
  parseMove,
};
