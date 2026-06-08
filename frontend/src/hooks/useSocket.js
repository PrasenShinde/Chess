import { useState, useEffect } from "react";
import { socket } from "../socket/socket.js";

/**
 * Custom hook to manage socket connection lifecycle
 * It provides the socket instance and connection status
 */
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onReconnectAttempt() {
      console.log("Socket attempting to reconnect...");
    }

    // Attach event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);

    // Initial check in case it connects before the effect runs
    setIsConnected(socket.connected);

    // Cleanup listeners on unmount
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
    };
  }, []);

  return { socket, isConnected };
};
