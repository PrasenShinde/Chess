/**
 * SpeechNormalizer.js
 * Normalizes raw spoken transcript into standardized chess terminology.
 * Converts synonyms, piece homophones, castling terms, and strips filler words.
 */

/**
 * Maps common chess synonyms and homophones.
 */
const SYNONYMS = [
  // Piece homophones and synonyms
  { pattern: /\b(night|nigh|horse|knights|horses)\b/gi, replacement: "knight" },
  { pattern: /\b(pawns)\b/gi, replacement: "pawn" },
  { pattern: /\b(rooks|rock|rocks)\b/gi, replacement: "rook" },
  { pattern: /\b(bishops)\b/gi, replacement: "bishop" },
  { pattern: /\b(queens)\b/gi, replacement: "queen" },
  { pattern: /\b(kings)\b/gi, replacement: "king" },

  // Castling phrases
  { pattern: /\b(king\s*side|kings\s*side|king's\s*side|short\s*castle|castle\s*short)\b/gi, replacement: "castle kingside" },
  { pattern: /\b(queen\s*side|queens\s*side|queen's\s*side|long\s*castle|castle\s*long)\b/gi, replacement: "castle queenside" },
  { pattern: /\b(castles)\b/gi, replacement: "castle" },

  // Capture synonyms
  { pattern: /\b(capture|captures|capturing|took|kills|eats|takes\s+on|captures\s+on)\b/gi, replacement: "takes" },

  // Promotion phrases
  { pattern: /\b(promote\s+to|promotes\s+to|promotes|into\s+a|into|became)\b/gi, replacement: "promote" },
];

/**
 * Words to strip out if they are filler phrases.
 */
const FILLER_PHRASES = [
  /\bmove\s+the\b/gi,
  /\bcan\s+you\s+move\b/gi,
  /\bi\s+want\s+to\s+move\b/gi,
  /\bplease\s+move\b/gi,
  /\bplease\b/gi,
  /\bcan\s+you\b/gi,
  /\bi\s+want\s+to\b/gi,
  /\bgo\s+to\b/gi,
  /\bmove\b/gi,
  /\bpiece\b/gi,
  /\bsquare\b/gi,
  /\bthe\b/gi,
];

/**
 * Normalizes spoken speech input for chess move parsing.
 * @param {string} text Raw speech recognition output
 * @returns {string} Cleaned, standardized string
 */
export function normalizeSpeech(text) {
  if (!text || typeof text !== "string") return "";

  let cleaned = text.toLowerCase().trim();

  // Apply synonyms
  for (const { pattern, replacement } of SYNONYMS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Remove filler phrases
  for (const filler of FILLER_PHRASES) {
    cleaned = cleaned.replace(filler, " ");
  }

  // Handle "to" when used as filler before a file/square, e.g., "knight to f3" -> "knight f3"
  // But preserve "to" when it's not separating piece and coordinate or if it's rank 2.
  cleaned = cleaned.replace(/\bto\s+([a-h])/gi, "$1");

  // Clean up duplicate spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

export default {
  normalizeSpeech,
};
