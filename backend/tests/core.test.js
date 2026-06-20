import test from "node:test";
import assert from "node:assert/strict";
import { ChessRoom } from "../src/game/ChessRoom.js";
import { hashToken } from "../src/utils/tokens.js";
import { csrfProtection } from "../src/middleware/csrf.middleware.js";
import { checkSocketRateLimit } from "../src/middleware/socketRateLimit.middleware.js";
import { assignPlayerColors } from "../src/services/Matchmaker.js";

test("hashToken stores deterministic SHA256 hashes", () => {
  const first = hashToken("sample-refresh-token");
  const second = hashToken("sample-refresh-token");
  assert.equal(first, second);
  assert.notEqual(first, "sample-refresh-token");
});

test("ChessRoom rejects illegal moves and accepts legal ones", () => {
  const room = new ChessRoom("room_test", "white-id", "black-id");

  const legal = room.makeMove("e2", "e4");
  assert.ok(legal);
  assert.equal(room.getCurrentTurn(), "b");

  const illegal = room.makeMove("e2", "e5");
  assert.equal(illegal, null);
});

test("ChessRoom reaches game over on checkmate sequence", () => {
  const room = new ChessRoom("room_mate", "white-id", "black-id");
  assert.ok(room.makeMove("f2", "f3"));
  assert.ok(room.makeMove("e7", "e5"));
  assert.ok(room.makeMove("g2", "g4"));
  assert.ok(room.makeMove("d8", "h4"));
  assert.equal(room.isGameOver(), true);
  assert.equal(room.getGameOverReason(), "checkmate");
});

test("assignPlayerColors gives one white and one black player", () => {
  const player1 = { user: { id: "p1", username: "Alice" }, socket: {} };
  const player2 = { user: { id: "p2", username: "Bob" }, socket: {} };

  const whiteFirst = assignPlayerColors(player1, player2, () => 0.1);
  assert.equal(whiteFirst.white.user.id, "p1");
  assert.equal(whiteFirst.black.user.id, "p2");

  const blackFirst = assignPlayerColors(player1, player2, () => 0.9);
  assert.equal(blackFirst.white.user.id, "p2");
  assert.equal(blackFirst.black.user.id, "p1");
});

test("csrfProtection rejects missing or mismatched tokens", () => {
  const next = () => {
    next.called = true;
  };

  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  csrfProtection(
    { method: "POST", cookies: { csrfToken: "abc" }, headers: {} },
    res,
    next,
  );
  assert.equal(res.statusCode, 403);

  csrfProtection(
    {
      method: "POST",
      cookies: { csrfToken: "abc" },
      headers: { "x-csrf-token": "abc" },
    },
    res,
    next,
  );
  assert.equal(next.called, true);
});

test("checkSocketRateLimit blocks excessive socket events", () => {
  const userId = "user-rate-limit";
  const event = "move";

  for (let i = 0; i < 5; i += 1) {
    assert.equal(checkSocketRateLimit(userId, event, { max: 5, windowMs: 60_000 }), true);
  }

  assert.equal(checkSocketRateLimit(userId, event, { max: 5, windowMs: 60_000 }), false);
});

test("checkSocketRateLimit isolates users and events", () => {
  assert.equal(checkSocketRateLimit("user-a", "find-match", { max: 2, windowMs: 60_000 }), true);
  assert.equal(checkSocketRateLimit("user-b", "find-match", { max: 2, windowMs: 60_000 }), true);
  assert.equal(checkSocketRateLimit("user-a", "move", { max: 2, windowMs: 60_000 }), true);
});
