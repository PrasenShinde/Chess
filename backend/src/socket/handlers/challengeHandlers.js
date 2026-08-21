import crypto from "crypto";
import socketRegistry from "../../services/SocketRegistry.js";
import gameManager from "../../game/GameManager.js";
import roomManager from "../../services/RoomManager.js";
import { assignPlayerColors } from "../../services/Matchmaker.js";

// In-memory store for active direct challenges
const pendingChallenges = new Map();

export const registerChallengeHandlers = (io, socket) => {
  const user = socket.user;

  socket.on("send-challenge", async ({ targetUserId, timeControl = "rapid" } = {}) => {
    try {
      if (!targetUserId) {
        return socket.emit("challenge-error", { message: "Target user ID is required" });
      }

      if (targetUserId === user.id) {
        return socket.emit("challenge-error", { message: "You cannot challenge yourself" });
      }

      const targetSocket = socketRegistry.get(targetUserId);
      if (!targetSocket) {
        return socket.emit("challenge-error", { message: "User is currently offline" });
      }

      const challengeId = `challenge_${crypto.randomUUID().slice(0, 8)}`;
      const challengeData = {
        challengeId,
        challengerId: user.id,
        challengerUser: user,
        targetUserId,
        timeControl,
        createdAt: Date.now(),
      };

      pendingChallenges.set(challengeId, challengeData);

      targetSocket.emit("challenge-received", {
        challengeId,
        challenger: {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          rating: user.rating,
        },
        timeControl,
      });

      socket.emit("challenge-sent", {
        challengeId,
        targetUserId,
      });
    } catch (error) {
      console.error("[Send Challenge Error]", error);
      socket.emit("challenge-error", { message: "Failed to send challenge" });
    }
  });

  socket.on("accept-challenge", async ({ challengeId } = {}) => {
    try {
      const challenge = pendingChallenges.get(challengeId);
      if (!challenge) {
        return socket.emit("challenge-error", { message: "Challenge expired or no longer available" });
      }

      if (challenge.targetUserId !== user.id) {
        return socket.emit("challenge-error", { message: "Unauthorized challenge acceptance" });
      }

      const challengerSocket = socketRegistry.get(challenge.challengerId);
      if (!challengerSocket) {
        pendingChallenges.delete(challengeId);
        return socket.emit("challenge-error", { message: "Challenger is no longer online" });
      }

      const roomId = `room_${crypto.randomUUID().slice(0, 8)}`;
      const timeControl = challenge.timeControl || "rapid";

      const { white: whitePlayer, black: blackPlayer } = assignPlayerColors(
        { user: challenge.challengerUser, socket: challengerSocket },
        { user, socket }
      );

      await gameManager.createGame(roomId, whitePlayer.user, blackPlayer.user, timeControl);
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

      const matchPayload = (color) => ({
        roomId,
        color,
        players: playersPayload,
        timeControl,
      });

      whitePlayer.socket.emit("match-found", matchPayload("white"));
      blackPlayer.socket.emit("match-found", matchPayload("black"));

      gameManager.startTimer(roomId);
      pendingChallenges.delete(challengeId);
    } catch (error) {
      console.error("[Accept Challenge Error]", error);
      socket.emit("challenge-error", { message: "Failed to start challenged game" });
    }
  });

  socket.on("decline-challenge", ({ challengeId } = {}) => {
    const challenge = pendingChallenges.get(challengeId);
    if (challenge) {
      const challengerSocket = socketRegistry.get(challenge.challengerId);
      if (challengerSocket) {
        challengerSocket.emit("challenge-declined", {
          challengeId,
          declinedBy: user.username,
        });
      }
      pendingChallenges.delete(challengeId);
    }
  });

  socket.on("cancel-challenge", ({ challengeId } = {}) => {
    const challenge = pendingChallenges.get(challengeId);
    if (challenge && challenge.challengerId === user.id) {
      const targetSocket = socketRegistry.get(challenge.targetUserId);
      if (targetSocket) {
        targetSocket.emit("challenge-cancelled", { challengeId });
      }
      pendingChallenges.delete(challengeId);
    }
  });
};
