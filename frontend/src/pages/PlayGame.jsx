import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGameSocket } from "../hooks/useGameSocket";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import ChessBoard from "../components/ChessBoard.jsx";
import { UserCircle2, Trophy, AlertCircle, LogOut, RotateCcw, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";

const PIECE_IMAGES = {
  wp: "/chess-01.png", wn: "/chess-02.png", wb: "/chess-03.png", wr: "/chess-04.png",
  bp: "/chess-05.png", bn: "/chess-06.png", bb: "/chess-07.png", br: "/chess-08.png",
};

const formatReason = (reason) => {
  if (!reason) return null;
  return reason.replace(/_/g, " ");
};

const getWinnerLabel = (winner, winnerUsername, whitePlayer, blackPlayer, userId) => {
  if (!winner) return "Draw";
  const winnerId = winner === "white" ? whitePlayer?.id : blackPlayer?.id;
  if (winnerId && userId) {
    if (winnerId === userId) return "You won!";
    return "You lost";
  }
  if (winnerUsername) return `${winnerUsername} wins`;
  if (winner === "white") return `${whitePlayer?.username || "White"} wins`;
  if (winner === "black") return `${blackPlayer?.username || "Black"} wins`;
  return "Game over";
};

const formatTime = (ms) => {
  if (ms == null) return "—";
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

function TimerDisplay({ timeMs, isActive, label, playerColor: color, capturedValue }) {
  const isLow = timeMs != null && timeMs < 30000;
  const isCritical = timeMs != null && timeMs < 10000;
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
      isActive ? "border-primary bg-primary/5 shadow-sm shadow-primary/10" : "border-accent/30 bg-white/50"
    } ${isCritical ? "border-red-500 bg-red-50" : isLow ? "border-amber-400 bg-amber-50/50" : ""}`}>
      <div className="flex items-center gap-2.5">
        <div className={`rounded-full p-1.5 ${color === "white" ? "bg-accent/20" : "bg-ink/10"}`}>
          <img
            src={color === "white" ? PIECE_IMAGES.wp : PIECE_IMAGES.bp}
            alt={color}
            className="w-5 h-5"
          />
        </div>
        <div className="text-xs text-ink/50 font-medium uppercase">{label}</div>
      </div>
      <div className="flex items-center gap-2">
        {capturedValue > 0 && (
          <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
            <Plus size={10} />{capturedValue}
          </span>
        )}
        <span className={`font-mono text-lg font-bold tabular-nums ${
          isCritical ? "text-red-600" : isLow ? "text-amber-600" : "text-ink"
        }`}>
          {formatTime(timeMs)}
        </span>
      </div>
    </div>
  );
}

export default function PlayGame() {
  const { roomId } = useParams();
  return <PlayGameView key={roomId} roomId={roomId} />;
}

function PlayGameView({ roomId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [capturedValues, setCapturedValues] = useState({ white: 0, black: 0 });
  const confettiFired = useRef(false);

  const initialColor = location.state?.color || null;

  const {
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
    isLoading,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    rematch,
    rematchData,
    setRematchData,
  } = useGameSocket(roomId, initialColor);

  const initialPlayers = location.state?.players;
  const resolvedWhitePlayer = whitePlayer || initialPlayers?.white;
  const resolvedBlackPlayer = blackPlayer || initialPlayers?.black;
  const opponent = playerColor === "white" ? resolvedBlackPlayer : resolvedWhitePlayer;
  const me = playerColor === "white" ? resolvedWhitePlayer : resolvedBlackPlayer;
  const turnColor = turn === "w" ? "white" : "black";
  const opponentOfferedDraw = drawOfferBy && drawOfferBy !== user?.id;
  const reasonLabel = formatReason(gameOverReason);
  const myTimeMs = playerColor === "white" ? whiteTimeMs : blackTimeMs;
  const opponentTimeMs = playerColor === "white" ? blackTimeMs : whiteTimeMs;
  const isMyTurn = playerColor === turnColor;

  useEffect(() => {
    if (status === "game_over" && !confettiFired.current) {
      const isWinner = winner === playerColor;
      if (isWinner) {
        const duration = 3000;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#cc3d3d", "#ffd700", "#ff6b6b"],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#cc3d3d", "#ffd700", "#ff6b6b"],
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      }
      confettiFired.current = true;
      setTimeout(() => setShowGameOverPopup(true), 800);
    }
  }, [status, winner, playerColor]);

  useEffect(() => {
    if (rematchData?.newRoomId) {
      const { newRoomId, color, players } = rematchData;
      setRematchData(null);
      navigate(`/playing/${newRoomId}`, {
        state: { color, players },
      });
    }
  }, [rematchData, navigate, setRematchData]);

  useEffect(() => {
    try {
      const fenParts = (boardFen || "").split(" ")[0] || "";
      const pieces = fenParts.replace(/[0-9]/g, (d) => " ".repeat(parseInt(d))).replace(/\//g, " ");
      const initialCounts = { p: 8, n: 2, b: 2, r: 2, q: 1 };
      const currentCounts = { p: 0, n: 0, b: 0, r: 0, q: 0 };
      for (const ch of pieces) {
        if (ch === " ") continue;
        const type = ch.toLowerCase();
        if (currentCounts[type] !== undefined) currentCounts[type]++;
      }
      const capturedByWhite = { p: 0, n: 0, b: 0, r: 0, q: 0 };
      const capturedByBlack = { p: 0, n: 0, b: 0, r: 0, q: 0 };
      for (const [type, initial] of Object.entries(initialCounts)) {
        const current = currentCounts[type] || 0;
        const totalExpectedOnBoard = initial * 2;
        const remaining = Math.min(current, initial);
        const missingFromWhite = initial - remaining;
        const missingFromBlack = totalExpectedOnBoard - current - missingFromWhite;
        const whiteLost = initial - (current >= initial ? initial : current);
        const blackLost = initial - (current >= initial ? current - initial : 0);
        if (whiteLost > 0) capturedByBlack[type] = whiteLost;
        if (blackLost > 0) capturedByWhite[type] = blackLost;
      }
      const values = { p: 1, n: 3, b: 3, r: 5, q: 9 };
      const whiteVal = Object.entries(capturedByWhite).reduce((s, [t, c]) => s + values[t] * c, 0);
      const blackVal = Object.entries(capturedByBlack).reduce((s, [t, c]) => s + values[t] * c, 0);
      setCapturedValues({ white: whiteVal, black: blackVal });
    } catch {
      setCapturedValues({ white: 0, black: 0 });
    }
  }, [boardFen]);

  const handleResign = () => {
    setShowResignConfirm(false);
    resign();
  };

  const handleBackHome = () => {
    navigate("/home");
  };

  const handleRematch = () => {
    setShowGameOverPopup(false);
    rematch();
  };

  const handleNewMatch = () => {
    setShowGameOverPopup(false);
    navigate("/home");
  };

  const opponentCaptureAdv = capturedValues[playerColor === "white" ? "black" : "white"] - capturedValues[playerColor || "white"];
  const myCaptureAdv = capturedValues[playerColor || "white"] - capturedValues[playerColor === "white" ? "black" : "white"];

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col font-sans">
      <div className="border-b border-accent/80 bg-cream/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-3">
            {status === "playing" ? (
              <button
                onClick={() => setShowResignConfirm(true)}
                className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors font-medium text-sm"
              >
                <LogOut size={16} /> Resign
              </button>
            ) : (
              <button
                onClick={handleBackHome}
                className="flex items-center gap-2 text-ink/70 hover:text-ink transition-colors font-medium text-sm"
              >
                <LogOut size={16} /> Leave
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-accent/20 px-2.5 py-1 rounded-md border border-accent/30">
              <span className="font-mono text-xs text-ink/50">#{roomId?.slice(0, 6)}</span>
            </div>
          </div>
          <div />

          {showResignConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl p-6 shadow-2xl border border-accent/20 max-w-sm mx-4">
                <h3 className="text-lg font-bold text-center mb-2">Resign Game?</h3>
                <p className="text-sm text-ink/60 text-center mb-5">Are you sure you want to resign? This will count as a loss.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResignConfirm(false)}
                    className="flex-1 rounded-lg border border-accent px-4 py-2.5 text-sm font-medium hover:bg-accent/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResign}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600"
                  >
                    Resign
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 items-start justify-center">
          <div className="w-full lg:w-auto flex flex-col items-center gap-2 shrink-0">
            <div className="w-full max-w-[600px] flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="bg-accent/20 p-1.5 rounded-full">
                  <img src={playerColor === "white" ? PIECE_IMAGES.bp : PIECE_IMAGES.wp} alt="opponent piece" className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm">{opponent?.username || "Opponent"}</span>
                <span className="text-xs text-ink/40 font-mono">({resolvedBlackPlayer?.rating || resolvedWhitePlayer?.rating || "—"})</span>
              </div>
              <TimerDisplay
                timeMs={opponentTimeMs}
                isActive={!isMyTurn && status === "playing"}
                label={status === "playing" ? (isMyTurn ? "opponent's turn" : "their turn") : " "}
                playerColor={playerColor === "white" ? "black" : "white"}
                capturedValue={Math.max(0, opponentCaptureAdv)}
              />
            </div>

            {isLoading ? (
              <div className="w-full max-w-[600px] aspect-square rounded-lg border-4 border-accent/20 bg-accent/10 flex items-center justify-center">
                <p className="text-ink/60 font-medium">Loading game...</p>
              </div>
            ) : (
              <ChessBoard
                fen={boardFen}
                playerColor={playerColor}
                onMove={makeMove}
                status={status}
                turn={turn}
              />
            )}

            <div className="w-full max-w-[600px] flex flex-col gap-1.5">
              <TimerDisplay
                timeMs={myTimeMs}
                isActive={isMyTurn && status === "playing"}
                label={status === "playing" ? (isMyTurn ? "your turn" : "opponent's turn") : " "}
                playerColor={playerColor}
                capturedValue={Math.max(0, myCaptureAdv)}
              />
              <div className="flex items-center gap-2 justify-end">
                <span className="font-semibold text-sm">{me?.username || user?.username || "You"}</span>
                <span className="text-xs text-ink/40 font-mono">({user?.rating || "—"})</span>
                <div className="bg-primary/10 p-1.5 rounded-full">
                  <img src={playerColor === "white" ? PIECE_IMAGES.wp : PIECE_IMAGES.bp} alt="my piece" className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
            <div className="bg-white border border-accent/40 rounded-2xl p-5 shadow-lg shadow-accent/5">
              <h2 className="text-lg font-bold mb-3">Game</h2>

              {status === "playing" ? (
                <div className="space-y-3">
                  <div className="text-center py-4 bg-accent/10 rounded-xl border border-accent/20">
                    <p className="text-base font-medium">
                      {!playerColor
                        ? "Syncing board..."
                        : isMyTurn
                          ? "Your turn"
                          : `${turnColor === "white" ? "White" : "Black"}'s turn`}
                    </p>
                    {error && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center justify-center gap-1">
                        <AlertCircle size={12} /> {error}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={offerDraw}
                      disabled={!playerColor}
                      className="rounded-lg border border-accent px-3 py-2 text-xs font-medium hover:bg-accent/10 disabled:opacity-50"
                    >
                      Offer Draw
                    </button>
                  </div>

                  {opponentOfferedDraw && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={acceptDraw}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-cream"
                      >
                        Accept Draw
                      </button>
                      <button
                        onClick={declineDraw}
                        className="rounded-lg border border-accent px-3 py-2 text-xs font-medium hover:bg-accent/10"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setShowResignConfirm(true)}
                    disabled={!playerColor}
                    className="w-full rounded-lg border border-red-300 text-red-600 px-3 py-2 text-xs font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    Resign
                  </button>
                </div>
              ) : (
                <GameOverContent
                  winner={winner}
                  winnerUsername={winnerUsername}
                  resolvedWhitePlayer={resolvedWhitePlayer}
                  resolvedBlackPlayer={resolvedBlackPlayer}
                  userId={user?.id}
                  reasonLabel={reasonLabel}
                />
              )}
            </div>

            <div className="bg-white border border-accent/40 rounded-2xl flex flex-col shadow-lg shadow-accent/5 overflow-hidden flex-1 max-h-[320px]">
              <div className="p-3 border-b border-accent/30 bg-cream/30">
                <h3 className="font-bold text-sm">Move History</h3>
              </div>
              <div className="p-3 overflow-y-auto flex-1 font-mono text-xs">
                {moves.length === 0 ? (
                  <p className="text-ink/40 text-center py-6">No moves yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {moves
                      .reduce((result, move, index) => {
                        const moveIndex = Math.floor(index / 2);
                        if (!result[moveIndex]) {
                          result[moveIndex] = { white: move, black: "" };
                        } else {
                          result[moveIndex].black = move;
                        }
                        return result;
                      }, [])
                      .map((pair, i) => (
                        <div
                          key={i}
                          className="col-span-2 flex items-center gap-3 py-1 border-b border-accent/10 last:border-0 hover:bg-accent/5 px-1.5 rounded"
                        >
                          <span className="text-ink/30 w-5 text-right">{i + 1}.</span>
                          <span className="flex-1 font-medium">{pair.white}</span>
                          <span className="flex-1 font-medium">{pair.black}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showGameOverPopup && (
        <GameOverPopup
          winner={winner}
          winnerUsername={winnerUsername}
          playerColor={playerColor}
          userId={user?.id}
          reasonLabel={reasonLabel}
          resolvedWhitePlayer={resolvedWhitePlayer}
          resolvedBlackPlayer={resolvedBlackPlayer}
          onRematch={handleRematch}
          onNewMatch={handleNewMatch}
        />
      )}
    </div>
  );
}

function GameOverContent({ winner, winnerUsername, resolvedWhitePlayer, resolvedBlackPlayer, userId, reasonLabel }) {
  return (
    <div className="text-center py-5 bg-amber-50 rounded-xl border border-amber-200">
      <Trophy className="mx-auto text-amber-500 mb-1.5" size={28} />
      <p className="text-lg font-bold text-amber-700 mb-0.5">Game Over</p>
      <p className="text-amber-800 font-medium text-sm">
        {getWinnerLabel(winner, winnerUsername, resolvedWhitePlayer, resolvedBlackPlayer, userId)}
      </p>
      {reasonLabel ? (
        <p className="text-xs text-amber-700/70 capitalize mt-1">{reasonLabel}</p>
      ) : null}
    </div>
  );
}

function GameOverPopup({
  winner, winnerUsername, playerColor, userId, reasonLabel,
  resolvedWhitePlayer, resolvedBlackPlayer, onRematch, onNewMatch,
}) {
  const isWinner = winner === playerColor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-accent/20 max-w-sm mx-4 text-center">
        {isWinner ? (
          <div className="text-6xl mb-3">🏆</div>
        ) : (
          <div className="text-6xl mb-3">😔</div>
        )}
        <h2 className={`text-2xl font-bold mb-1 ${isWinner ? "text-green-600" : "text-red-500"}`}>
          {isWinner ? "Congratulations! You Won!" : "Game Over"}
        </h2>
        <p className="text-sm text-ink/60 mb-1">
          {getWinnerLabel(winner, winnerUsername, resolvedWhitePlayer, resolvedBlackPlayer, userId)}
        </p>
        {reasonLabel && <p className="text-xs text-ink/40 capitalize mb-5">{reasonLabel}</p>}

        <div className="flex gap-3">
          <button
            onClick={onRematch}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-cream hover:opacity-90 transition"
          >
            <RotateCcw size={16} /> Rematch
          </button>
          <button
            onClick={onNewMatch}
            className="flex-1 rounded-xl border border-accent px-5 py-3 text-sm font-medium hover:bg-accent/10 transition"
          >
            New Match
          </button>
        </div>
      </div>
    </div>
  );
}
