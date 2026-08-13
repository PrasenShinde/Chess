import { useState } from "react";
import { Chessboard } from "react-chessboard";
import ChessPieceSVG from "./ChessPieceSVG.jsx";

const PROMOTION_PIECES = [
  { code: "q", name: "Queen" },
  { code: "r", name: "Rook" },
  { code: "n", name: "Knight" },
  { code: "b", name: "Bishop" },
];

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

  const handlePromotionSelect = (pieceCode) => {
    if (!pendingPromotion) return;
    const { sourceSquare, targetSquare, piece: pieceInfo } = pendingPromotion;
    processMove(sourceSquare, targetSquare, pieceInfo, pieceCode);
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

  const currentColorPrefix = playerColor === "black" ? "b" : "w";

  return (
    <div className="w-full max-w-[600px] relative">
      <div className="aspect-square rounded-lg shadow-xl overflow-hidden border-4 border-accent/20">
        <Chessboard options={chessboardOptions} />
      </div>

      {/* 2x2 Pawn Promotion Dialog Modal */}
      {pendingPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-accent/20 max-w-xs w-full text-center mx-4">
            <h3 className="text-xl font-bold text-ink mb-1">Pawn Promotion</h3>
            <p className="text-xs text-ink/60 mb-5">Select a piece to promote your pawn to:</p>
            
            {/* 2x2 Grid for Queen, Rook, Knight, Bishop */}
            <div className="grid grid-cols-2 gap-3.5 max-w-[220px] mx-auto mb-4">
              {PROMOTION_PIECES.map(({ code, name }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handlePromotionSelect(code)}
                  className="group relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-cream/40 border-2 border-accent/30 hover:border-primary hover:bg-primary/10 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <ChessPieceSVG code={`${currentColorPrefix}${code}`} className="w-14 h-14 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold text-ink/80 mt-1">{name}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPendingPromotion(null)}
              className="text-xs text-ink/50 hover:text-ink transition-colors font-medium"
            >
              Cancel Promotion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
