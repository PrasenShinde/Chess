/**
 * CoordinateMapper.js
 * Maps homophones, phonetic spelling, and spoken words to standard chess board square coordinates (a1 - h8).
 */

const FILE_MAP = {
  a: "a", hay: "a", eh: "a", ey: "a", alpha: "a", hey: "a",
  b: "b", be: "b", bee: "b", bravo: "b",
  c: "c", see: "c", sea: "c", charlie: "c", si: "c",
  d: "d", dee: "d", delta: "d",
  e: "e", ee: "e", echo: "e",
  f: "f", ef: "f", eff: "f", foxtrot: "f",
  g: "g", gee: "g", golf: "g", je: "g",
  h: "h", age: "h", aitch: "h", hotel: "h",
};

const RANK_MAP = {
  1: "1", one: "1", won: "1",
  2: "2", two: "2", to: "2", too: "2",
  3: "3", three: "3", free: "3", tree: "3",
  4: "4", four: "4", for: "4", fore: "4",
  5: "5", five: "5", hive: "5",
  6: "6", six: "6", sex: "6",
  7: "7", seven: "7",
  8: "8", eight: "8", ate: "8",
};

/**
 * Maps a single word to a valid file letter ('a'-'h') or null if not a file.
 * @param {string} word
 * @returns {string|null}
 */
export function mapWordToFile(word) {
  if (!word) return null;
  const clean = word.toLowerCase().trim();
  return FILE_MAP[clean] || (clean.length === 1 && clean >= "a" && clean <= "h" ? clean : null);
}

/**
 * Maps a single word to a valid rank number ('1'-'8') or null if not a rank.
 * @param {string} word
 * @returns {string|null}
 */
export function mapWordToRank(word) {
  if (!word) return null;
  const clean = word.toLowerCase().trim();
  return RANK_MAP[clean] || (clean.length === 1 && clean >= "1" && clean <= "8" ? clean : null);
}

/**
 * Extracts valid square coordinates (e.g. "e4", "f3") from tokens or string.
 * @param {string} squareStr
 * @returns {string|null} valid square like "e4" or null
 */
export function parseSquare(squareStr) {
  if (!squareStr) return null;
  const clean = squareStr.toLowerCase().trim().replace(/\s+/g, "");

  // Direct match like "e4"
  if (/^[a-h][1-8]$/.test(clean)) {
    return clean;
  }

  // Tokenized match like "eff three" or "e four"
  const tokens = squareStr.toLowerCase().trim().split(/\s+/);
  if (tokens.length === 2) {
    const f = mapWordToFile(tokens[0]);
    const r = mapWordToRank(tokens[1]);
    if (f && r) {
      return `${f}${r}`;
    }
  }

  return null;
}

/**
 * Scans a normalized spoken text and replaces phonetic square coordinates with standardized notation.
 * Example: "knight eff three" -> "knight f3"
 * Example: "pawn to e for" -> "pawn e4"
 * @param {string} text
 * @returns {string}
 */
export function mapCoordinatesInText(text) {
  if (!text) return "";
  let words = text.toLowerCase().trim().split(/\s+/);
  const result = [];

  let i = 0;
  while (i < words.length) {
    const current = words[i];
    const next = words[i + 1];

    // Already a square like "e4", "f3"
    if (/^[a-h][1-8]$/.test(current)) {
      result.push(current);
      i++;
      continue;
    }

    // Try pairing current and next as file + rank
    if (next) {
      const file = mapWordToFile(current);
      const rank = mapWordToRank(next);

      if (file && rank) {
        result.push(`${file}${rank}`);
        i += 2;
        continue;
      }
    }

    // If current token alone is a word like "to" before a rank, handle intelligently
    result.push(current);
    i++;
  }

  return result.join(" ");
}

export default {
  mapWordToFile,
  mapWordToRank,
  parseSquare,
  mapCoordinatesInText,
};
