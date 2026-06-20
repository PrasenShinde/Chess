import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGameSocket } from "../hooks/useGameSocket";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import ChessBoard from "../components/ChessBoard.jsx";
import { UserCircle2, ArrowLeft, Trophy, AlertCircle } from "lucide-react";

const formatReason = (reason) => {
  if (!reason) return null;
  return reason.replace(/_/g, " ");
};

const getWinnerLabel = (
  winner,
  winnerUsername,
  whitePlayer,
  blackPlayer,
  userId,
) => {
  if (!winner) {
    return "Draw";
  }

  const winnerId = winner === "white" ? whitePlayer?.id : blackPlayer?.id;

  if (winnerId && userId) {
    if (winnerId === userId) {
      return "You win!";
    }
    return "You lost";
  }

  if (winnerUsername) {
    return `${winnerUsername} wins`;
  }

  if (winner === "white") {
    return `${whitePlayer?.username || "White"} wins`;
  }

  if (winner === "black") {
    return `${blackPlayer?.username || "Black"} wins`;
  }

  return "Game over";
};

export default function PlayGame() {
  const { roomId } = useParams();
  return <PlayGameView key={roomId} roomId={roomId} />;
}

function PlayGameView({ roomId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
    isLoading,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    claimTimeout,
  } = useGameSocket(roomId, initialColor);

  const initialPlayers = location.state?.players;
  const resolvedWhitePlayer = whitePlayer || initialPlayers?.white;
  const resolvedBlackPlayer = blackPlayer || initialPlayers?.black;
  const opponent = playerColor === "white" ? resolvedBlackPlayer : resolvedWhitePlayer;
  const me = playerColor === "white" ? resolvedWhitePlayer : resolvedBlackPlayer;
  const turnColor = turn === "w" ? "white" : "black";
  const opponentOfferedDraw = drawOfferBy && drawOfferBy !== user?.id;
  const reasonLabel = formatReason(gameOverReason);

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col font-sans">
      <SiteHeader />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        <header className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/play")}
            className="flex items-center gap-2 text-ink/70 hover:text-ink transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Back to Play
          </button>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm bg-accent/20 px-3 py-1 rounded-md border border-accent/40 text-ink/70">
              Room: {roomId}
            </span>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">
          <div className="w-full lg:w-auto flex flex-col items-center gap-4 shrink-0">
            <div className="w-full max-w-[600px] flex items-center justify-between bg-white/50 backdrop-blur-md border border-accent/30 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 p-2 rounded-full">
                  <UserCircle2 size={24} className="text-ink" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">
                    {opponent?.username || "Opponent"}
                  </h3>
                  <p className="text-xs text-ink/60 font-medium uppercase tracking-wider">
                    {playerColor === "white" ? "Black" : playerColor === "black" ? "White" : "—"}
                  </p>
                </div>
              </div>
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

            <div className="w-full max-w-[600px] flex items-center justify-between bg-white/50 backdrop-blur-md border border-accent/30 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <UserCircle2 size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg leading-tight">
                    {me?.username || user?.username || "You"}
                  </h3>
                  <p className="text-xs text-ink/60 font-medium uppercase tracking-wider">
                    {playerColor || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
            <div className="bg-white border border-accent/40 rounded-2xl p-6 shadow-lg shadow-accent/5">
              <h2 className="text-xl font-bold mb-4">Game Status</h2>

              {status === "playing" ? (
                <div className="space-y-4">
                  <div className="text-center py-6 bg-accent/10 rounded-xl border border-accent/20">
                    <p className="text-lg font-medium">
                      {!playerColor
                        ? "Syncing board..."
                        : turnColor === playerColor
                          ? "Your turn"
                          : `${turnColor === "white" ? "White" : "Black"}'s turn`}
                    </p>
                    {error && (
                      <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
                        <AlertCircle size={14} /> {error}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={offerDraw}
                      disabled={!playerColor}
                      className="rounded-lg border border-accent px-3 py-2 text-sm font-medium hover:bg-accent/10 disabled:opacity-50"
                    >
                      Offer Draw
                    </button>
                    <button
                      onClick={claimTimeout}
                      disabled={!playerColor}
                      className="rounded-lg border border-accent px-3 py-2 text-sm font-medium hover:bg-accent/10 disabled:opacity-50"
                    >
                      Claim Timeout
                    </button>
                  </div>

                  {opponentOfferedDraw && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={acceptDraw}
                        className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-cream"
                      >
                        Accept Draw
                      </button>
                      <button
                        onClick={declineDraw}
                        className="rounded-lg border border-accent px-3 py-2 text-sm font-medium hover:bg-accent/10"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  <button
                    onClick={resign}
                    disabled={!playerColor}
                    className="w-full rounded-lg border border-red-300 text-red-600 px-3 py-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                  >
                    Resign
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 bg-amber-50 rounded-xl border border-amber-200">
                  <Trophy className="mx-auto text-amber-500 mb-2" size={32} />
                  <p className="text-xl font-bold text-amber-700 mb-1">Game Over</p>
                  <p className="text-amber-800 font-medium">
                    {getWinnerLabel(
                      winner,
                      winnerUsername,
                      resolvedWhitePlayer,
                      resolvedBlackPlayer,
                      user?.id,
                    )}
                  </p>
                  {reasonLabel ? (
                    <p className="text-sm text-amber-700/70 capitalize mt-1">
                      {reasonLabel}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            <div className="bg-white border border-accent/40 rounded-2xl flex flex-col shadow-lg shadow-accent/5 overflow-hidden flex-1 max-h-[400px]">
              <div className="p-4 border-b border-accent/30 bg-cream/30">
                <h3 className="font-bold text-lg">Move History</h3>
              </div>
              <div className="p-4 overflow-y-auto flex-1 font-mono text-sm">
                {moves.length === 0 ? (
                  <p className="text-ink/40 text-center py-8">No moves yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
                          className="col-span-2 flex items-center gap-4 py-1 border-b border-accent/10 last:border-0 hover:bg-accent/5 px-2 rounded"
                        >
                          <span className="text-ink/40 w-6 text-right">{i + 1}.</span>
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
    </div>
  );
}
