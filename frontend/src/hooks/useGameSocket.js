import { useEffect, useState, useCallback } from "react";
import { socket } from "../socket/socket.js";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export const useGameSocket = (roomId, initialPlayerColor = null) => {
  const [boardFen, setBoardFen] = useState(START_FEN);
  const [moves, setMoves] = useState([]);
  const [turn, setTurn] = useState("w");
  const [status, setStatus] = useState("playing");
  const [winner, setWinner] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const [whitePlayer, setWhitePlayer] = useState(null);
  const [blackPlayer, setBlackPlayer] = useState(null);
  const [playerColor, setPlayerColor] = useState(initialPlayerColor);
  const [winnerUsername, setWinnerUsername] = useState(null);
  const [drawOfferBy, setDrawOfferBy] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("resume-game", { roomId, expectedColor: initialPlayerColor });

    const handleResumeGame = (data) => {
      setBoardFen(data.fen || START_FEN);
      setMoves(data.moves || []);
      setTurn(data.turn || "w");
      setStatus(data.status || "playing");
      setPlayerColor(data.playerColor || null);
      setWhitePlayer(
        data.players?.white || { id: data.whitePlayerId, username: data.whitePlayerUsername },
      );
      setBlackPlayer(
        data.players?.black || { id: data.blackPlayerId, username: data.blackPlayerUsername },
      );
      setDrawOfferBy(data.drawOfferBy || null);

      if (data.status === "game_over") {
        setWinner(data.winner);
        setWinnerUsername(data.winnerUsername || null);
        setGameOverReason(data.reason);
      }
    };

    const handleMoveMade = (data) => {
      setBoardFen(data.fen);
      setTurn(data.turn);
      if (data.move?.san) {
        setMoves((prev) => [...prev, data.move.san]);
      }
      setDrawOfferBy(null);
      setError(null);
    };

    const handleMoveError = (data) => {
      setError(data.message);
    };

    const handleGameOver = (data) => {
      setStatus("game_over");
      setWinner(data.winner);
      setWinnerUsername(data.winnerUsername || null);
      setGameOverReason(data.reason);
      setDrawOfferBy(null);
    };

    const handleDrawOffered = (data) => {
      setDrawOfferBy(data.offeredBy);
    };

    const handleDrawDeclined = () => {
      setDrawOfferBy(null);
    };

    socket.on("resume-game", handleResumeGame);
    socket.on("move-made", handleMoveMade);
    socket.on("move-error", handleMoveError);
    socket.on("game-over", handleGameOver);
    socket.on("draw-offered", handleDrawOffered);
    socket.on("draw-declined", handleDrawDeclined);

    return () => {
      socket.off("resume-game", handleResumeGame);
      socket.off("move-made", handleMoveMade);
      socket.off("move-error", handleMoveError);
      socket.off("game-over", handleGameOver);
      socket.off("draw-offered", handleDrawOffered);
      socket.off("draw-declined", handleDrawDeclined);
    };
  }, [roomId, initialPlayerColor]);

  const makeMove = useCallback((from, to, promotion = "q") => {
    socket.emit("move", { roomId, from, to, promotion });
  }, [roomId]);

  const resign = useCallback(() => {
    socket.emit("resign", { roomId });
  }, [roomId]);

  const offerDraw = useCallback(() => {
    socket.emit("offer-draw", { roomId });
  }, [roomId]);

  const acceptDraw = useCallback(() => {
    socket.emit("accept-draw", { roomId });
  }, [roomId]);

  const declineDraw = useCallback(() => {
    socket.emit("decline-draw", { roomId });
  }, [roomId]);

  const claimTimeout = useCallback(() => {
    socket.emit("claim-timeout", { roomId });
  }, [roomId]);

  return {
    boardFen,
    moves,
    turn,
    status,
    winner,
    winnerUsername,
    gameOverReason,
    whitePlayer,
    blackPlayer,
    playerColor,
    drawOfferBy,
    error,
    isLoading: !playerColor && !error,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    claimTimeout,
  };
};
