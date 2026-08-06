/**
 * VoiceController.js
 * Orchestrator for the Voice Move pipeline:
 * SpeechRecognizer -> SpeechNormalizer -> CoordinateMapper -> MoveParser -> MoveResolver -> makeMove() -> SpeechFeedback
 * Contains no move-parsing logic itself; strictly coordinates modules.
 */

import { normalizeSpeech } from "./SpeechNormalizer.js";
import { mapCoordinatesInText } from "./CoordinateMapper.js";
import { parseMove } from "./MoveParser.js";
import { resolveMove } from "./MoveResolver.js";
import speechFeedback from "./SpeechFeedback.js";

export class VoiceController {
  /**
   * Processes a raw transcript string, resolves the move against chess state,
   * invokes makeMove on success, and triggers spoken feedback.
   *
   * @param {string} rawTranscript Raw text from speech recognition
   * @param {Chess|string} chessInstance Current chess.js instance or FEN
   * @param {Function} makeMoveCallback Function `(from, to, promotion) => void`
   * @returns {Object} { success: boolean, move?: Object, ambiguous?: boolean, error?: string, rawText: string }
   */
  static processCommand(rawTranscript, chessInstance, makeMoveCallback) {
    if (!rawTranscript || typeof rawTranscript !== "string") {
      speechFeedback.speak("Please repeat your move.");
      return { success: false, error: "Empty transcript.", rawText: "" };
    }

    // 1. Normalize speech (convert synonyms, strip filler words)
    const normalizedText = normalizeSpeech(rawTranscript);

    // 2. Map phonetic coordinates ("eff three" -> "f3", "e for" -> "e4")
    const textWithCoordinates = mapCoordinatesInText(normalizedText);

    // 3. Parse intent (extract piece, destination, capture, castle, promotion)
    const parsedIntent = parseMove(textWithCoordinates);

    // 4. Resolve move against current legal moves in chess.js
    const resolution = resolveMove(chessInstance, parsedIntent);

    // 5. Handle Errors
    if (resolution.error && !resolution.ambiguous) {
      speechFeedback.speak(resolution.error);
      return {
        success: false,
        error: resolution.error,
        rawText: rawTranscript,
        parsedIntent,
      };
    }

    // 6. Handle Ambiguity
    if (resolution.ambiguous) {
      const ambigMsg = `I found multiple possible ${parsedIntent.piece || "piece"} moves. Please specify the starting square.`;
      speechFeedback.speak(ambigMsg);
      return {
        success: false,
        ambiguous: true,
        options: resolution.options,
        error: ambigMsg,
        rawText: rawTranscript,
        parsedIntent,
      };
    }

    // 7. Success: Execute move via standard makeMove callback
    if (resolution.from && resolution.to) {
      if (typeof makeMoveCallback === "function") {
        makeMoveCallback(resolution.from, resolution.to, resolution.promotion);
      }

      const moveSan = resolution.san || `${resolution.from} to ${resolution.to}`;
      speechFeedback.speak(`Move played, ${moveSan}.`);

      return {
        success: true,
        move: {
          from: resolution.from,
          to: resolution.to,
          promotion: resolution.promotion,
          san: resolution.san,
        },
        rawText: rawTranscript,
        parsedIntent,
      };
    }

    speechFeedback.speak("Illegal move.");
    return {
      success: false,
      error: "Illegal move.",
      rawText: rawTranscript,
      parsedIntent,
    };
  }
}

export default VoiceController;
