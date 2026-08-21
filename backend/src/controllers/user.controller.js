import prisma from "../prisma/client.js";

export const getRelationshipState = async (currentUserId, targetUserId) => {
  if (!currentUserId) return "NONE";
  if (currentUserId === targetUserId) return "SELF";

  const request = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: currentUserId },
      ],
    },
  });

  if (!request) return "NONE";
  if (request.status === "ACCEPTED") return "FRIENDS";
  if (request.status === "PENDING") {
    return request.senderId === currentUserId ? "PENDING_SENT" : "PENDING_RECEIVED";
  }
  return "NONE";
};

export const searchUser = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: "Please enter a username" });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        rating: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const currentUserId = req.user?.id || null;
    const relationship = await getRelationshipState(currentUserId, user.id);

    return res.status(200).json({
      success: true,
      user,
      relationship,
    });
  } catch (error) {
    console.error("Search user error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: "Username parameter is required" });
    }

    const normalizedUsername = decodeURIComponent(username.trim()).toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: normalizedUsername,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        rating: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "The profile you're looking for doesn't exist." });
    }

    // Fetch user game stats
    const games = await prisma.game.findMany({
      where: {
        OR: [{ whitePlayerId: user.id }, { blackPlayerId: user.id }],
        status: "COMPLETED",
      },
      select: {
        whitePlayerId: true,
        blackPlayerId: true,
        winnerId: true,
        result: true,
      },
    });

    let wins = 0;
    let losses = 0;
    let draws = 0;

    games.forEach((game) => {
      if (game.result === "DRAW" || !game.winnerId) {
        draws++;
      } else if (game.winnerId === user.id) {
        wins++;
      } else {
        losses++;
      }
    });

    const currentUserId = req.user?.id || null;
    const relationship = await getRelationshipState(currentUserId, user.id);

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        stats: {
          gamesPlayed: games.length,
          wins,
          losses,
          draws,
        },
      },
      relationship,
    });
  } catch (error) {
    console.error("Get public profile error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong loading the profile." });
  }
};
