import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import SiteHeader from "../components/layout/SiteHeader.jsx";

export default function Play() {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [onlineCount, setOnlineCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    if (!socket.connected) {
      socket.connect();
    }

    const handleOnlineUsers = (usersArray) => {
      setOnlineCount(usersArray.length);
    };

    const handleMatchFound = (match) => {
      if (!match?.roomId) {
        return;
      }

      setIsSearching(false);
      navigate(`/playing/${match.roomId}`, {
        state: {
          color: match.color,
          players: match.players,
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
  }, [user, socket, navigate]);

  const handleFindMatch = () => {
    if (!isConnected) return;
    setIsSearching(true);
    socket.emit("find-match");
  };

  const handleCancelMatch = () => {
    socket.emit("cancel-match");
    setIsSearching(false);
  };

  return (
    <div className="min-h-svh bg-cream text-ink flex flex-col">
      <SiteHeader />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1 flex flex-col">
        <header className="mb-8 border-b border-accent pb-6">
          <h1 className="text-3xl font-bold mb-2">Play Chess</h1>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className={`flex items-center gap-2 ${isConnected ? "text-green-600" : "text-red-500"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-green-600" : "bg-red-500"}`}></span>
              {isConnected ? "Connected to Server" : "Disconnected"}
            </div>
            <div className="text-ink/65">
              Online Players: <span className="font-bold text-ink">{onlineCount}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-accent rounded-xl bg-white/50 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Play?</h2>
          <p className="text-ink/70 mb-8 max-w-md">
            Enter matchmaking and you will be assigned white or black when an opponent is found.
          </p>

          {isSearching ? (
            <div className="flex flex-col items-center gap-4">
              <button
                disabled
                className="rounded-xl px-12 py-4 text-xl font-bold text-cream bg-primary/80 cursor-wait animate-pulse"
              >
                Searching for match...
              </button>
              <button
                onClick={handleCancelMatch}
                className="text-sm font-medium text-ink/70 hover:text-ink"
              >
                Cancel search
              </button>
            </div>
          ) : (
            <button
              onClick={handleFindMatch}
              disabled={!isConnected}
              className={`rounded-xl px-12 py-4 text-xl font-bold text-cream transition transform inline-block ${
                !isConnected
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:opacity-90 hover:scale-105"
              }`}
            >
              Find Match
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
