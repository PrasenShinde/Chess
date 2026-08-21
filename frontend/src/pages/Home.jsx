import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import { Link, useNavigate } from "react-router-dom";
import { gameService } from "../services/api.js";
import { Play, Loader2, X, Zap, Clock, ShieldAlert } from "lucide-react";

const TIME_CONTROLS = [
  { id: "bullet", label: "Bullet", time: "1 min", icon: Zap },
  { id: "blitz", label: "Blitz", time: "3 min", icon: Clock },
  { id: "rapid", label: "Rapid", time: "10 min", icon: ShieldAlert },
];

export default function Home() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ rating: user?.rating ?? 200, wins: 0, draws: 0, losses: 0 });
  const [recentGames, setRecentGames] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [timeControl, setTimeControl] = useState("rapid");
  const [isSearching, setIsSearching] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, recentData] = await Promise.all([
          gameService.getStats(),
          gameService.getRecentGames(),
        ]);
        setStats(statsData);
        setRecentGames(recentData.games || []);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleOnlineUsers = (usersArray) => {
      setOnlineCount(usersArray.length);
    };

    const handleMatchFound = (match) => {
      if (!match?.roomId) return;
      setIsSearching(false);
      navigate(`/playing/${match.roomId}`, {
        state: {
          color: match.color,
          players: match.players,
          timeControl: match.timeControl,
        },
      });
    };

    const handleMatchCancelled = () => {
      setIsSearching(false);
    };

    socket.on("online-users", handleOnlineUsers);
    socket.on("match-found", handleMatchFound);
    socket.on("match-cancelled", handleMatchCancelled);

    return () => {
      socket.off("online-users", handleOnlineUsers);
      socket.off("match-found", handleMatchFound);
      socket.off("match-cancelled", handleMatchCancelled);
    };
  }, [socket, navigate]);

  const handleStartGame = () => {
    if (!isConnected) return;
    socket.emit("find-match", { timeControl });
    setIsSearching(true);
  };

  const handleCancelSearch = () => {
    socket.emit("cancel-match");
    setIsSearching(false);
  };

  const totalGames = (stats.wins || 0) + (stats.losses || 0) + (stats.draws || 0);
  const winPercent = totalGames > 0 ? (stats.wins / totalGames) * 100 : 33.3;
  const lossPercent = totalGames > 0 ? (stats.losses / totalGames) * 100 : 33.3;
  const drawPercent = totalGames > 0 ? (stats.draws / totalGames) * 100 : 33.4;

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col font-sans">
      <SiteHeader />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Welcome Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/50 mb-1">
            Welcome back
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-ink">
            {user.username}
          </h1>
          <p className="text-sm text-ink/65 mt-1">
            Ready for your next match? Jump into quick matchmaking or review your stats.
          </p>
        </div>

        {/* Quick Match & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          {/* Quick Match Card (3 cols) */}
          <div className="lg:col-span-3 rounded-3xl bg-[#1c1917] text-white p-7 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/50 mb-1">
                Quick match
              </p>
              <h2 className="text-3xl font-bold text-white mb-6">Find an opponent</h2>

              {/* Time Control Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {TIME_CONTROLS.map((tc) => {
                  const Icon = tc.icon;
                  const isSelected = timeControl === tc.id;
                  return (
                    <button
                      key={tc.id}
                      type="button"
                      onClick={() => setTimeControl(tc.id)}
                      disabled={isSearching}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? "border-primary bg-primary/20 text-white font-bold ring-2 ring-primary/40"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                      } disabled:opacity-50`}
                    >
                      <Icon size={18} className={isSelected ? "text-primary" : "text-white/60"} />
                      <span className="text-sm font-semibold mt-1">{tc.label}</span>
                      <span className="text-[11px] text-white/50">{tc.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Area */}
            <div>
              {isSearching ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary/20 border border-primary/40 px-6 py-3.5 text-base font-bold text-primary animate-pulse">
                    <Loader2 className="animate-spin" size={20} />
                    Searching for opponent ({timeControl})...
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelSearch}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-primary bg-primary/10 px-6 py-3.5 text-base font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartGame}
                  disabled={!isConnected}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-base font-bold text-white transition-all shadow-md ${
                    !isConnected
                      ? "bg-gray-600 cursor-not-allowed opacity-60"
                      : "bg-primary hover:bg-primary/90 hover:scale-[1.02] shadow-primary/30"
                  }`}
                >
                  <Play size={18} fill="currentColor" />
                  Start game
                </button>
              )}

              {/* Online Indicator */}
              <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <span>{isConnected ? `${onlineCount} players online` : "Disconnected from server"}</span>
              </div>
            </div>
          </div>

          {/* Stats Card (2 cols) */}
          <div className="lg:col-span-2 rounded-3xl bg-[#f2ede4] border border-accent/60 p-7 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-ink/65">Rating</span>
                <span className="text-4xl font-extrabold text-ink tracking-tight">
                  {loadingData ? "—" : stats.rating}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4 pt-3 border-t border-accent/40">
                <span className="text-sm font-semibold text-ink/65">Record</span>
                <span className="text-sm font-bold tracking-wide">
                  <span className="text-green-600 font-extrabold">{stats.wins}W</span>
                  <span className="text-ink/40 mx-1">·</span>
                  <span className="text-red-500 font-extrabold">{stats.losses}L</span>
                  <span className="text-ink/40 mx-1">·</span>
                  <span className="text-gray-500 font-extrabold">{stats.draws}D</span>
                </span>
              </div>

              {/* Progress bar line */}
              <div className="h-2.5 w-full bg-accent/30 rounded-full overflow-hidden flex">
                <div style={{ width: `${winPercent}%` }} className="bg-green-500 h-full" title={`Wins: ${stats.wins}`} />
                <div style={{ width: `${lossPercent}%` }} className="bg-red-500 h-full" title={`Losses: ${stats.losses}`} />
                <div style={{ width: `${drawPercent}%` }} className="bg-gray-400 h-full" title={`Draws: ${stats.draws}`} />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-accent/40 flex items-center justify-between text-xs text-ink/60">
              <span>Total Games: <strong>{totalGames}</strong></span>
              <Link to="/friends" className="font-semibold text-primary hover:underline">
                View Friends →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Games Section */}
        <div>
          <h2 className="text-xl font-bold text-ink mb-4">Recent games</h2>

          {loadingData ? (
            <div className="rounded-2xl border border-accent/40 bg-white p-8 text-center text-ink/50 text-sm">
              Loading recent games...
            </div>
          ) : recentGames.length === 0 ? (
            <div className="rounded-2xl border border-accent/40 bg-white p-8 text-center text-ink/50 text-sm">
              No recent games played yet. Start a match above!
            </div>
          ) : (
            <div className="space-y-3">
              {recentGames.map((game) => {
                const isWin = game.outcome === "win";
                const isLoss = game.outcome === "loss";
                return (
                  <div
                    key={game.id}
                    className="flex items-center justify-between rounded-2xl border border-accent/60 bg-white px-5 py-4 shadow-sm hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-ink/70 shrink-0" />
                      <div>
                        <p className="font-bold text-base text-ink">
                          vs {game.opponentUsername}
                        </p>
                        <p className="text-xs text-ink/50 capitalize font-medium">
                          {game.color} · {game.reason || "Finished"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize ${
                          isWin
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : isLoss
                            ? "bg-red-100/80 text-red-600 border border-red-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {game.outcome}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
