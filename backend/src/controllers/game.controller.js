import prisma from "../prisma/client.js";

const summarizeGame = (game, userId) => {
  const isWhite = game.whitePlayerId === userId;
  const opponentUsername = isWhite ? game.blackPlayerUsername : game.whitePlayerUsername;
  let outcome = "draw";

  if (game.result === "DRAW") {
    outcome = "draw";
  } else if (game.winnerId === userId) {
    outcome = "win";
  } else {
    outcome = "loss";
  }

  return {
    id: game.id,
    roomId: game.roomId,
    opponentUsername,
    color: isWhite ? "white" : "black",
    result: game.result,
    reason: game.reason,
    outcome,
    endedAt: game.endedAt,
  };
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rating: true },
    });

    const games = await prisma.game.findMany({
      where: {
        status: "COMPLETED",
        OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
      },
      select: {
        result: true,
        winnerId: true,
      },
    });

    let wins = 0;
    let losses = 0;
    let draws = 0;

    for (const game of games) {
      if (game.result === "DRAW") {
        draws += 1;
      } else if (game.winnerId === userId) {
        wins += 1;
      } else {
        losses += 1;
      }
    }

    res.status(200).json({
      rating: user?.rating ?? 1200,
      wins,
      losses,
      draws,
      total: games.length,
    });
  } catch (error) {
    console.error("[GameController] getStats error:", error);
    res.status(500).json({ message: "Failed to load stats" });
  }
};

export const getRecentGames = async (req, res) => {
  try {
    const userId = req.user.id;
    const games = await prisma.game.findMany({
      where: {
        status: "COMPLETED",
        OR: [{ whitePlayerId: userId }, { blackPlayerId: userId }],
      },
      orderBy: { endedAt: "desc" },
      take: 10,
      select: {
        id: true,
        roomId: true,
        whitePlayerId: true,
        whitePlayerUsername: true,
        blackPlayerUsername: true,
        winnerId: true,
        result: true,
        reason: true,
        endedAt: true,
      },
    });

    res.status(200).json({
      games: games.map((game) => summarizeGame(game, userId)),
    });
  } catch (error) {
    console.error("[GameController] getRecentGames error:", error);
    res.status(500).json({ message: "Failed to load recent games" });
  }
};
