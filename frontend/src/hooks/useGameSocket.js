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

  const [whiteTimeMs, setWhiteTimeMs] = useState(null);
  const [blackTimeMs, setBlackTimeMs] = useState(null);
  const [timeControl, setTimeControl] = useState("rapid");

  const [rematchData, setRematchData] = useState(null);
  const [rematchOfferBy, setRematchOfferBy] = useState(null);
  const [rematchDeclined, setRematchDeclined] = useState(false);

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
      setRematchOfferBy(data.rematchOfferBy || null);

      if (data.whiteTimeMs != null) setWhiteTimeMs(data.whiteTimeMs);
      if (data.blackTimeMs != null) setBlackTimeMs(data.blackTimeMs);
      if (data.timeControl) setTimeControl(data.timeControl);

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
      if (data.whiteTimeMs != null) setWhiteTimeMs(data.whiteTimeMs);
      if (data.blackTimeMs != null) setBlackTimeMs(data.blackTimeMs);
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
      if (data.whiteTimeMs != null) setWhiteTimeMs(data.whiteTimeMs);
      if (data.blackTimeMs != null) setBlackTimeMs(data.blackTimeMs);
    };

    const handleDrawOffered = (data) => {
      setDrawOfferBy(data.offeredBy);
    };

    const handleDrawDeclined = () => {
      setDrawOfferBy(null);
    };

    const handleTimerUpdate = (data) => {
      if (data.whiteTimeMs != null) setWhiteTimeMs(data.whiteTimeMs);
      if (data.blackTimeMs != null) setBlackTimeMs(data.blackTimeMs);
    };

    const handleRematchOffered = (data) => {
      setRematchOfferBy(data.offeredBy);
      setRematchDeclined(false);
    };

    const handleRematchDeclined = () => {
      setRematchOfferBy(null);
      setRematchDeclined(true);
    };

    const handleRematchStarted = (data) => {
      setRematchData(data);
    };

    socket.on("resume-game", handleResumeGame);
    socket.on("move-made", handleMoveMade);
    socket.on("move-error", handleMoveError);
    socket.on("game-over", handleGameOver);
    socket.on("draw-offered", handleDrawOffered);
    socket.on("draw-declined", handleDrawDeclined);
    socket.on("timer-update", handleTimerUpdate);
    socket.on("rematch-offered", handleRematchOffered);
    socket.on("rematch-declined", handleRematchDeclined);
    socket.on("rematch-started", handleRematchStarted);

    return () => {
      socket.off("resume-game", handleResumeGame);
      socket.off("move-made", handleMoveMade);
      socket.off("move-error", handleMoveError);
      socket.off("game-over", handleGameOver);
      socket.off("draw-offered", handleDrawOffered);
      socket.off("draw-declined", handleDrawDeclined);
      socket.off("timer-update", handleTimerUpdate);
      socket.off("rematch-offered", handleRematchOffered);
      socket.off("rematch-declined", handleRematchDeclined);
      socket.off("rematch-started", handleRematchStarted);
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

  const offerRematch = useCallback(() => {
    socket.emit("offer-rematch", { roomId });
    // Also support fallback trigger
    socket.emit("rematch", { roomId });
  }, [roomId]);

  const acceptRematch = useCallback(() => {
    socket.emit("accept-rematch", { roomId });
  }, [roomId]);

  const declineRematch = useCallback(() => {
    socket.emit("decline-rematch", { roomId });
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
    whiteTimeMs,
    blackTimeMs,
    timeControl,
    rematchData,
    rematchOfferBy,
    rematchDeclined,
    isLoading: !playerColor && !error,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    offerRematch,
    acceptRematch,
    declineRematch,
    rematch: offerRematch,
    setRematchData,
  };
};
