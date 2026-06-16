import { useEffect, useState, useCallback } from "react";
import { socket } from "../socket/socket.js";

export const useGameSocket = (roomId) => {
  const [boardFen, setBoardFen] = useState("start");
  const [moves, setMoves] = useState([]);
  const [turn, setTurn] = useState("w");
  const [status, setStatus] = useState("playing");
  const [winner, setWinner] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [whitePlayer, setWhitePlayer] = useState(null);
  const [blackPlayer, setBlackPlayer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("resume-game", { roomId });

    const handleResumeGame = (data) => {
      console.log("Game resumed:", data);
      setBoardFen(data.fen || "start");
      setMoves(data.moves || []);
      setTurn(data.turn || "w");
      setStatus(data.status || "playing");
      setWhitePlayer({ id: data.whitePlayerId, username: data.whitePlayerUsername });
      setBlackPlayer({ id: data.blackPlayerId, username: data.blackPlayerUsername });
      
      if (data.status === "game_over") {
        setWinner(data.winner);
        setGameOverReason(data.reason);
      }
    };

    const handleMoveMade = (data) => {
      console.log("Move made:", data);
      setBoardFen(data.fen);
      setTurn(data.turn);
      if (data.move && data.move.san) {
        setMoves((prev) => [...prev, data.move.san]);
      }
      setError(null);
    };

    const handleMoveError = (data) => {
      console.error("Move error:", data);
      setError(data.message);
    };

    const handleGameOver = (data) => {
      console.log("Game over:", data);
      setStatus("game_over");
      setWinner(data.winner);
      setGameOverReason(data.reason);
    };

    socket.on("resume-game", handleResumeGame);
    socket.on("move-made", handleMoveMade);
    socket.on("move-error", handleMoveError);
    socket.on("game-over", handleGameOver);

    return () => {
      socket.off("resume-game", handleResumeGame);
      socket.off("move-made", handleMoveMade);
      socket.off("move-error", handleMoveError);
      socket.off("game-over", handleGameOver);
    };
  }, [roomId]);

  const makeMove = useCallback((from, to, promotion = "q") => {
    socket.emit("move", {
      roomId,
      from,
      to,
      promotion,
    });
  }, [roomId]);

  return {
    boardFen,
    moves,
    turn,
    status,
    winner,
    gameOverReason,
    whitePlayer,
    blackPlayer,
    error,
    makeMove,
  };
};
