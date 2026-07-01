import { useState } from "react";
import { Chessboard } from "react-chessboard";

export default function ChessBoard({ fen, playerColor, onMove, status, turn }) {
  const [moveFrom, setMoveFrom] = useState("");

  const getPieceType = (piece) => {
    if (!piece) return null;
    if (typeof piece === "string") return piece;
    return piece.pieceType || null;
  };

  const processMove = (sourceSquare, targetSquare, piece) => {
    const pieceType = getPieceType(piece);
    const pieceColor = pieceType ? (pieceType[0] === "w" ? "white" : "black") : null;
    const turnColor = turn === "w" ? "white" : "black";

    if (!sourceSquare || !targetSquare) return false;
    if (status !== "playing") return false;
    
    // For click moves, we might not have the piece string, so we trust the server validation
    // or we check turnColor
    if (turnColor !== playerColor) return false;
    if (pieceColor && pieceColor !== playerColor) return false;

    const isPawnPromotion = pieceType
      ? pieceType.toLowerCase().includes("p") && (targetSquare[1] === "8" || targetSquare[1] === "1")
      : false;
    // Simple fallback: if we don't know the piece, we just assume promotion to queen if rank 1/8
    const promotion = isPawnPromotion || targetSquare[1] === "8" || targetSquare[1] === "1" ? "q" : undefined;
    
    onMove(sourceSquare, targetSquare, promotion);
    return true;
  };

  const onPieceDrop = ({ sourceSquare, targetSquare, piece }) => {
    setMoveFrom(""); // Reset click selection
    return processMove(sourceSquare, targetSquare, piece);
  };

  const onSquareClick = ({ square }) => {
    if (status !== "playing") return;
    
    if (!moveFrom) {
      // First click: select piece
      setMoveFrom(square);
      return;
    }
    
    // Second click: attempt move
    if (moveFrom === square) {
      setMoveFrom(""); // Deselect if clicking same square
      return;
    }
    
    processMove(moveFrom, square, null);
    setMoveFrom(""); // Reset after move attempt
  };

  const boardOrientation = playerColor === "black" ? "black" : "white";

  // Highlight the selected square
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
    <div className="w-full max-w-[600px] aspect-square rounded-lg shadow-xl overflow-hidden border-4 border-accent/20">
      <Chessboard options={chessboardOptions} />
    </div>
  );
}
