import { Chessboard } from "react-chessboard";

export default function ChessBoard({ fen, playerColor, onMove, status, turn }) {
  const onPieceDrop = (sourceSquare, targetSquare, piece) => {
    const pieceColor = piece[0] === "w" ? "white" : "black";
    const turnColor = turn === "w" ? "white" : "black";

    if (status !== "playing" || pieceColor !== playerColor || turnColor !== playerColor) {
      return false;
    }

    // Basic promotion logic: if a pawn reaches the end rank, we default to queen
    const isPawnPromotion = piece.toLowerCase().includes('p') && (targetSquare[1] === '8' || targetSquare[1] === '1');
    const promotion = isPawnPromotion ? "q" : undefined;
    
    onMove(sourceSquare, targetSquare, promotion);
    return true; // Return true so react-chessboard attempts the move visually, it'll snap back if server rejects
  };

  const boardOrientation = playerColor === "black" ? "black" : "white";

  return (
    <div className="w-full max-w-[600px] aspect-square rounded-lg shadow-xl overflow-hidden border-4 border-accent/20">
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        boardOrientation={boardOrientation}
        arePiecesDraggable={status === "playing"}
        customDarkSquareStyle={{ backgroundColor: "#779556" }}
        customLightSquareStyle={{ backgroundColor: "#ebecd0" }}
        animationDuration={200}
      />
    </div>
  );
}
