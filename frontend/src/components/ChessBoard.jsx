import { useState } from "react";
import { Chessboard } from "react-chessboard";

export default function ChessBoard({ fen, playerColor, onMove, status, turn }) {
  const [moveFrom, setMoveFrom] = useState("");

  const processMove = (sourceSquare, targetSquare, piece) => {
    const pieceColor = piece ? (piece[0] === "w" ? "white" : "black") : null;
    const turnColor = turn === "w" ? "white" : "black";

    if (status !== "playing") return false;
    
    // For click moves, we might not have the piece string, so we trust the server validation
    // or we check turnColor
    if (turnColor !== playerColor) return false;
    if (pieceColor && pieceColor !== playerColor) return false;

    const isPawnPromotion = piece ? (piece.toLowerCase().includes('p') && (targetSquare[1] === '8' || targetSquare[1] === '1')) : false;
    // Simple fallback: if we don't know the piece, we just assume promotion to queen if rank 1/8
    const promotion = isPawnPromotion || targetSquare[1] === '8' || targetSquare[1] === '1' ? "q" : undefined;
    
    onMove(sourceSquare, targetSquare, promotion);
    return true;
  };

  const onPieceDrop = (sourceSquare, targetSquare, piece) => {
    setMoveFrom(""); // Reset click selection
    return processMove(sourceSquare, targetSquare, piece);
  };

  const onSquareClick = (square) => {
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

  return (
    <div className="w-full max-w-[600px] aspect-square rounded-lg shadow-xl overflow-hidden border-4 border-accent/20">
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        boardOrientation={boardOrientation}
        arePiecesDraggable={status === "playing"}
        customDarkSquareStyle={{ backgroundColor: "#779556" }}
        customLightSquareStyle={{ backgroundColor: "#ebecd0" }}
        customSquareStyles={customSquareStyles}
        animationDuration={200}
      />
    </div>
  );
}
