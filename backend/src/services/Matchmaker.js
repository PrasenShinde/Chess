import crypto from "crypto";
import queue from "./MatchmakingQueue.js";
import roomManager from "./RoomManager.js";
import gameManager from "../game/GameManager.js";

class Matchmaker {
  constructor(io) {
    this.io = io;
  }

  /**
   * Attempt to match players from the queue
   */
  matchPlayers() {
    // If we have at least 2 players in the queue, match them
    if (queue.size >= 2) {
      const players = queue.extractTwoPlayers();
      
      if (!players) return; // Failsafe

      const [player1, player2] = players;
      
      // Generate a unique room ID (e.g., room_a8x3f9)
      const roomId = `room_${crypto.randomUUID().slice(0, 8)}`;

      // Assign colors randomly (50% chance for player1 to be white)
      const isPlayer1White = Math.random() < 0.5;
      
      const whitePlayer = isPlayer1White ? player1 : player2;
      const blackPlayer = isPlayer1White ? player2 : player1;

      // Store in RoomManager
      roomManager.createRoom(roomId, whitePlayer.user, blackPlayer.user);

      // Create game in Redis
      gameManager.createGame(roomId, whitePlayer.user, blackPlayer.user).catch(err => {
        console.error("[Matchmaker] Failed to create game in Redis", err);
      });

      // Join both sockets to the newly created room
      whitePlayer.socket.join(roomId);
      blackPlayer.socket.join(roomId);

      // Emit "match-found" to everyone in the room with the roomId
      this.io.to(roomId).emit("match-found", roomId);
      
      console.log(`[Matchmaker] Match created between ${whitePlayer.user.username} and ${blackPlayer.user.username} in ${roomId}`);

      // Recursively call in case there are more pairs waiting in the queue
      this.matchPlayers();
    }
  }
}

// We instantiate it lazily or manually inject `io` where needed, 
// but typically a singleton service can just expose a setup/run method.
let matchmakerInstance = null;

export const initMatchmaker = (io) => {
  if (!matchmakerInstance) {
    matchmakerInstance = new Matchmaker(io);
  }
};

export const tryMatchmaking = () => {
  if (matchmakerInstance) {
    matchmakerInstance.matchPlayers();
  }
};
