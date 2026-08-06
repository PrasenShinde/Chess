/**
 * VoiceMove.test.js
 * Comprehensive test suite verifying all speech-to-move parsing, coordinate mapping,
 * move resolving, ambiguity detection, castling, promotion, and error handling.
 */

import { Chess } from "chess.js";
import { normalizeSpeech } from "./SpeechNormalizer.js";
import { mapCoordinatesInText } from "./CoordinateMapper.js";
import { parseMove } from "./MoveParser.js";
import { resolveMove } from "./MoveResolver.js";
import VoiceController from "./VoiceController.js";

/**
 * Helper runner to test full pipeline for a given transcript and board position.
 */
function testPipeline(transcript, fen = undefined) {
  const chess = new Chess(fen);
  const normalized = normalizeSpeech(transcript);
  const mapped = mapCoordinatesInText(normalized);
  const parsed = parseMove(mapped);
  const resolved = resolveMove(chess, parsed);
  return { normalized, mapped, parsed, resolved };
}

export function runVoiceMoveTests() {
  const results = [];

  const assert = (description, condition) => {
    results.push({ description, success: Boolean(condition) });
    if (!condition) {
      console.error(`❌ TEST FAILED: ${description}`);
    } else {
      console.log(`✅ TEST PASSED: ${description}`);
    }
  };

  console.log("\n🧪 --- RUNNING VOICE MOVE FEATURE TESTS ---\n");

  // Test 1: Pawn e4 ("Pawn to e4")
  {
    const res = testPipeline("Move the pawn to e4 please");
    assert("1.1 Speech normalization (pawn to e4)", res.normalized === "pawn e4");
    assert("1.2 Move parsing piece=pawn, dest=e4", res.parsed.piece === "pawn" && res.parsed.destination === "e4");
    assert("1.3 Move resolving e2->e4", res.resolved.from === "e2" && res.resolved.to === "e4");
  }

  // Test 2: Knight f3 ("Knight f3" / "horse to f3")
  {
    const res = testPipeline("play horse to f3");
    assert("2.1 Synonym conversion (horse -> knight)", res.normalized.includes("knight"));
    assert("2.2 Move parsing piece=knight, dest=f3", res.parsed.piece === "knight" && res.parsed.destination === "f3");
    assert("2.3 Move resolving g1->f3", res.resolved.from === "g1" && res.resolved.to === "f3");
  }

  // Test 3: Knight takes e5 ("Knight takes e5")
  {
    // Setup position where Knight on f3 can take e5: 1. e4 e5 2. Nf3 Nc6 3. Nxe5
    const chess = new Chess("r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3");
    const parsed = parseMove(mapCoordinatesInText(normalizeSpeech("Knight takes e5")));
    const resolved = resolveMove(chess, parsed);
    assert("3.1 Capture parsing (capture=true)", parsed.capture === true && parsed.destination === "e5");
    assert("3.2 Capture resolution f3->e5", resolved.from === "f3" && resolved.to === "e5");
  }

  // Test 4: Castle Kingside ("Castle Kingside" / "Short Castle")
  {
    // Position where kingside castling is legal for White: 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5
    const chess = new Chess("r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4");
    const parsed = parseMove(mapCoordinatesInText(normalizeSpeech("Castle Kingside")));
    const resolved = resolveMove(chess, parsed);
    assert("4.1 Castle Kingside parsing", parsed.castle === "kingside");
    assert("4.2 Castle Kingside move resolution (e1->g1)", resolved.from === "e1" && resolved.to === "g1");
  }

  // Test 5: Castle Queenside ("Castle Queenside" / "Long Castle")
  {
    // Position where queenside castling is legal for White
    const chess = new Chess("r3k2r/pppq1ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPPQ1PPP/R3K2R w KQkq - 0 1");
    const parsed = parseMove(mapCoordinatesInText(normalizeSpeech("Castle Queenside")));
    const resolved = resolveMove(chess, parsed);
    assert("5.1 Castle Queenside parsing", parsed.castle === "queenside");
    assert("5.2 Castle Queenside move resolution (e1->c1)", resolved.from === "e1" && resolved.to === "c1");
  }

  // Test 6: Promotion ("Pawn e8 promote queen" / "pawn e8 queen")
  {
    // Legal promotion FEN: White pawn on e7, Kings separated safely
    const chess = new Chess("8/4P3/8/8/8/8/k7/4K3 w - - 0 1");
    const parsed = parseMove(mapCoordinatesInText(normalizeSpeech("pawn to e8 promote queen")));
    const resolved = resolveMove(chess, parsed);
    assert("6.1 Promotion parsing (promotion=q)", parsed.promotion === "q" && parsed.destination === "e8");
    assert("6.2 Promotion move resolution (e7->e8, promo=q)", resolved.from === "e7" && resolved.to === "e8" && resolved.promotion === "q");
  }

  // Test 7: Illegal move ("Pawn e5" on turn 1)
  {
    const res = testPipeline("pawn to e5");
    assert("7.1 Illegal move detection (error returned)", Boolean(res.resolved.error));
  }

  // Test 8: Wrong / Invalid square ("Knight to z9")
  {
    const res = testPipeline("knight to z9");
    assert("8.1 Invalid square handling", Boolean(res.resolved.error));
  }

  // Test 9: Ambiguous move (Two knights can move to d2)
  {
    // Legal ambiguous FEN: Knights on b1 and f3, d2 square empty
    const chess = new Chess("rnbqkbnr/pppppppp/8/8/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 0 2");
    const parsed = parseMove(mapCoordinatesInText(normalizeSpeech("knight to d2")));
    const resolved = resolveMove(chess, parsed);
    assert("9.1 Ambiguous move detection", resolved.ambiguous === true && resolved.options.length >= 2);
  }

  // Test 10: Black perspective coordinate resolution (Black playing 1... e5)
  {
    const chess = new Chess("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
    const parsed = parseMove(mapCoordinatesInText(normalizeSpeech("pawn to e5")));
    const resolved = resolveMove(chess, parsed);
    assert("10.1 Black pawn e7->e5 move resolution", resolved.from === "e7" && resolved.to === "e5");
  }

  const passedCount = results.filter((r) => r.success).length;
  console.log(`\n🎉 RESULTS: ${passedCount}/${results.length} tests passed.\n`);
  return { total: results.length, passed: passedCount, results };
}

// Auto-run if executed directly in node
if (typeof process !== "undefined" && process.argv && process.argv[1] && process.argv[1].endsWith("VoiceMove.test.js")) {
  runVoiceMoveTests();
}

export default runVoiceMoveTests;
