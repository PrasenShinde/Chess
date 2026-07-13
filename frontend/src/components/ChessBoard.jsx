import { useState } from "react";
import { Chessboard } from "react-chessboard";

const PROMOTION_PIECES = ["q", "r", "b", "n"];
const PIECE_LABELS = { q: "Queen", r: "Rook", b: "Bishop", n: "Knight" };

export default function ChessBoard({ fen, playerColor, onMove, status, turn }) {
  const [moveFrom, setMoveFrom] = useState("");
  const [pendingPromotion, setPendingPromotion] = useState(null);

  const getPieceType = (piece) => {
    if (!piece) return null;
    if (typeof piece === "string") return piece;
    return piece.pieceType || null;
  };

  const processMove = (sourceSquare, targetSquare, piece, promotion = undefined) => {
    const pieceType = getPieceType(piece);
    const pieceColor = pieceType ? (pieceType[0] === "w" ? "white" : "black") : null;
    const turnColor = turn === "w" ? "white" : "black";

    if (!sourceSquare || !targetSquare) return false;
    if (status !== "playing") return false;

    if (turnColor !== playerColor) return false;
    if (pieceColor && pieceColor !== playerColor) return false;

    onMove(sourceSquare, targetSquare, promotion);
    return true;
  };

  const checkPromotion = (sourceSquare, targetSquare, piece) => {
    const pieceType = getPieceType(piece);
    const isPawnPromotion = pieceType
      ? pieceType.toLowerCase().includes("p") && (targetSquare[1] === "8" || targetSquare[1] === "1")
      : targetSquare[1] === "8" || targetSquare[1] === "1";

    if (isPawnPromotion) {
      setPendingPromotion({ sourceSquare, targetSquare, piece });
      return false;
    }

    return processMove(sourceSquare, targetSquare, piece);
  };

  const handlePromotionSelect = (piece) => {
    if (!pendingPromotion) return;
    const { sourceSquare, targetSquare, piece: pieceInfo } = pendingPromotion;
    processMove(sourceSquare, targetSquare, pieceInfo, piece);
    setPendingPromotion(null);
  };

  const onPieceDrop = ({ sourceSquare, targetSquare, piece }) => {
    setMoveFrom("");
    return checkPromotion(sourceSquare, targetSquare, piece);
  };

  const onSquareClick = ({ square }) => {
    if (status !== "playing") return;

    if (!moveFrom) {
      setMoveFrom(square);
      return;
    }

    if (moveFrom === square) {
      setMoveFrom("");
      return;
    }

    const pieceOnSquare = null;
    checkPromotion(moveFrom, square, pieceOnSquare);
    setMoveFrom("");
  };

  const boardOrientation = playerColor === "black" ? "black" : "white";

  const customSquareStyles = moveFrom ? { [moveFrom]: { backgroundColor: "rgba(255, 255, 0, 0.4)" } } : {};
  const chessboardOptions = {
    position: fen,
    onPieceDrop,
    onSquareClick,
    boardOrientation,
    allowDragging: status === "playing",
    darkSquareStyle: { backgroundColor: "#779556" },
    lightSquareStyle: { backgroundColor: "#ebecd0" },
    squareStyles: customSquareStyles,
    animationDurationInMs: 200,
  };

  return (
    <div className="w-full max-w-[600px]">
      <div className="aspect-square rounded-lg shadow-xl overflow-hidden border-4 border-accent/20">
        <Chessboard options={chessboardOptions} />
      </div>

      {pendingPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-accent/20">
            <h3 className="text-lg font-bold text-center mb-4">Promote Pawn</h3>
            <div className="flex gap-4 justify-center">
              {PROMOTION_PIECES.map((piece) => {
                const imageName = playerColor === "white" ? `w${piece}` : `b${piece}`;
                return (
                  <button
                    key={piece}
                    onClick={() => handlePromotionSelect(piece)}
                    className="w-20 h-20 rounded-xl border-2 border-accent/30 hover:border-primary hover:bg-accent/10 flex items-center justify-center transition-all hover:scale-110"
                  >
                    <img
                      src={`/chess-${imageName === "wq" ? "01" : imageName === "wr" ? "04" : imageName === "wb" ? "03" : imageName === "wn" ? "02" : imageName === "bq" ? "05" : imageName === "br" ? "08" : imageName === "bb" ? "07" : "06"}.png`}
                      alt={PIECE_LABELS[piece]}
                      className="w-14 h-14"
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink/50 text-center mt-3">Choose a piece to promote to</p>
          </div>
        </div>
      )}
    </div>
  );
}
