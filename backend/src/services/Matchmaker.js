import crypto from "crypto";
import queue from "./MatchmakingQueue.js";
import roomManager from "./RoomManager.js";
import socketRegistry from "./SocketRegistry.js";
import gameManager from "../game/GameManager.js";

class Matchmaker {
  constructor(io) {
    this.io = io;
    this.isMatching = false;
  }

  async matchPlayers() {
    if (this.isMatching) {
      return;
    }

    this.isMatching = true;

    try {
      while ((await queue.size()) >= 2) {
        const players = await queue.extractTwoPlayers((userId) => socketRegistry.get(userId));

        if (!players) {
          break;
        }

        const [player1, player2] = players;
        const roomId = `room_${crypto.randomUUID().slice(0, 8)}`;

        const isPlayer1White = Math.random() < 0.5;
        const whitePlayer = isPlayer1White ? player1 : player2;
        const blackPlayer = isPlayer1White ? player2 : player1;

        await gameManager.createGame(roomId, whitePlayer.user, blackPlayer.user);
        roomManager.createRoom(roomId, whitePlayer.user, blackPlayer.user);

        whitePlayer.socket.join(roomId);
        blackPlayer.socket.join(roomId);

        const playersPayload = {
          white: {
            id: whitePlayer.user.id,
            username: whitePlayer.user.username,
          },
          black: {
            id: blackPlayer.user.id,
            username: blackPlayer.user.username,
          },
        };

        whitePlayer.socket.emit("match-found", {
          roomId,
          color: "white",
          players: playersPayload,
        });

        blackPlayer.socket.emit("match-found", {
          roomId,
          color: "black",
          players: playersPayload,
        });

        console.log(
          `[Matchmaker] ${whitePlayer.user.username} (white) vs ${blackPlayer.user.username} (black) in ${roomId}`,
        );
      }
    } finally {
      this.isMatching = false;
    }
  }
}

let matchmakerInstance = null;

export const initMatchmaker = (io) => {
  if (!matchmakerInstance) {
    matchmakerInstance = new Matchmaker(io);
  }
};

export const tryMatchmaking = () => {
  if (matchmakerInstance) {
    matchmakerInstance.matchPlayers().catch((err) => {
      console.error("[Matchmaker] Failed to match players", err);
    });
  }
};
