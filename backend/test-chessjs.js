import { Chess } from 'chess.js';
const chess = new Chess();
try {
  chess.move({ from: 'e2', to: 'e4', promotion: undefined });
  console.log("Move success, FEN:", chess.fen());
} catch (e) {
  console.log("Move error:", e.message);
}
