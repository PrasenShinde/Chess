import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import { Link } from "react-router-dom";
import { gameService } from "../services/api.js";

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ rating: user?.rating ?? 1200, wins: 0, draws: 0, losses: 0 });
  const [recentGames, setRecentGames] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

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

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col">
      <SiteHeader />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome back, {user.username}!</h1>
          <p className="text-ink/70 max-w-xl mx-auto">
            Ready for your next match? Jump into matchmaking or review your recent games.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2 rounded-2xl border border-accent bg-white p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <h2 className="text-2xl font-semibold mb-6">Play Chess</h2>
            <Link
              to="/play"
              className="rounded-xl bg-primary px-12 py-4 text-xl font-bold text-cream transition hover:opacity-90 hover:scale-105 transform inline-block"
            >
              Start Game
            </Link>
            <div className="mt-8 flex gap-4 text-sm text-ink/65">
              <span>Live matchmaking</span>
              <span>•</span>
              <Link to="/learn" className="hover:text-primary transition-colors">
                Learn basics
              </Link>
            </div>
          </div>

          <div className="col-span-1 flex flex-col gap-8">
            <div className="rounded-2xl border border-accent bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-4">Your Stats</h3>
              {loadingData ? (
                <p className="text-sm text-ink/50">Loading stats...</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-ink/65">Rating</span>
                    <span className="font-bold text-primary">{stats.rating}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink/65">Wins</span>
                    <span className="font-bold text-green-600">{stats.wins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink/65">Draws</span>
                    <span className="font-bold text-gray-500">{stats.draws}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ink/65">Losses</span>
                    <span className="font-bold text-red-500">{stats.losses}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-accent bg-white p-6 shadow-sm flex-1">
              <h3 className="font-semibold text-lg mb-4">Recent Games</h3>
              {loadingData ? (
                <p className="text-sm text-ink/50">Loading games...</p>
              ) : recentGames.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-ink/50 text-sm">
                  No recent games found.
                </div>
              ) : (
                <ul className="space-y-3">
                  {recentGames.map((game) => (
                    <li
                      key={game.id}
                      className="flex items-center justify-between rounded-lg border border-accent/40 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">vs {game.opponentUsername}</p>
                        <p className="text-ink/50 capitalize">
                          {game.color} • {game.reason || "finished"}
                        </p>
                      </div>
                      <span
                        className={`font-semibold capitalize ${
                          game.outcome === "win"
                            ? "text-green-600"
                            : game.outcome === "loss"
                              ? "text-red-500"
                              : "text-gray-500"
                        }`}
                      >
                        {game.outcome}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
