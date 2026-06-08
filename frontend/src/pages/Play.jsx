import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader.jsx";

export default function Play() {
  const { user, loading } = useAuth();
  const { socket, isConnected } = useSocket();
  const [onlineCount, setOnlineCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Connect to the socket server when the Play page mounts
      socket.connect();

      // Listen for the online users broadcast
      const handleOnlineUsers = (usersArray) => {
        setOnlineCount(usersArray.length);
      };

      // Listen for match-found
      const handleMatchFound = (roomId) => {
        console.log("Match found! Joining room:", roomId);
        setIsSearching(false);
        navigate(`/playing/${roomId}`);
      };

      socket.on("online-users", handleOnlineUsers);
      socket.on("match-found", handleMatchFound);

      // Cleanup on unmount
      return () => {
        socket.off("online-users", handleOnlineUsers);
        socket.off("match-found", handleMatchFound);
        socket.disconnect();
      };
    }
  }, [user, socket, navigate]);

  const handleFindMatch = () => {
    if (!isConnected) return;
    setIsSearching(true);
    socket.emit("find-match");
  };

  if (loading) {
    return (
      <div className="min-h-svh bg-cream text-ink flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
            Click the button below to enter the matchmaking queue. We'll pair you with the next available opponent.
          </p>
          
          <button
            onClick={handleFindMatch}
            disabled={!isConnected || isSearching}
            className={`rounded-xl px-12 py-4 text-xl font-bold text-cream transition transform inline-block ${
              !isConnected 
                ? "bg-gray-400 cursor-not-allowed" 
                : isSearching 
                  ? "bg-primary/80 cursor-wait animate-pulse" 
                  : "bg-primary hover:opacity-90 hover:scale-105"
            }`}
          >
            {isSearching ? "Searching for match..." : "Find Match"}
          </button>
        </div>
      </main>
    </div>
  );
}
