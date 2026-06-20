import test from "node:test";
import assert from "node:assert/strict";
import { ChessRoom } from "../src/game/ChessRoom.js";
import { hashToken } from "../src/utils/tokens.js";
import { csrfProtection } from "../src/middleware/csrf.middleware.js";
import { checkSocketRateLimit } from "../src/middleware/socketRateLimit.middleware.js";

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
