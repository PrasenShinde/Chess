import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader.jsx";

export default function Play() {
  const { user, loading } = useAuth();
  const { socket, isConnected } = useSocket();
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (user) {
      // Connect to the socket server when the Play page mounts
      socket.connect();

      // Listen for the online users broadcast
      const handleOnlineUsers = (usersArray) => {
        setOnlineCount(usersArray.length);
      };

      socket.on("online-users", handleOnlineUsers);

      // Cleanup on unmount
      return () => {
        socket.off("online-users", handleOnlineUsers);
        socket.disconnect();
      };
    }
  }, [user, socket]);

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
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex-1">
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

        <div className="flex items-center justify-center min-h-[400px] border-2 border-dashed border-accent rounded-xl bg-white/50">
          <p className="text-ink/60 text-lg">Chessboard will go here.</p>
        </div>
      </main>
    </div>
  );
}
