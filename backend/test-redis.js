import { getRedisClient, initRedis } from "./src/redis/redisClient.js";
import gameManager from "./src/game/GameManager.js";
import crypto from "crypto";
import prisma from "./src/prisma/client.js";

async function test() {
  await initRedis();
  
  const users = await prisma.user.findMany({ take: 2 });
  if (users.length < 2) {
    console.error("Need at least 2 users in the DB to test");
    process.exit(1);
  }
  
  const roomId = "test_room_" + crypto.randomUUID().slice(0, 8);
  const whitePlayer = users[0];
  const blackPlayer = users[1];
  
  console.log("Creating game...");
  const room = await gameManager.createGame(roomId, whitePlayer, blackPlayer);
  console.log("Game created. FEN:", room.getFen());
  
  console.log("Fetching game from Redis...");
  const fetched = await gameManager.getGame(roomId);
  console.log("Fetched FEN:", fetched ? fetched.getFen() : "null");
  
  console.log("Making move...");
  try {
    const res = await gameManager.makeMove(roomId, whitePlayer.id, "e2", "e4");
    console.log("Move successful. New FEN:", res.room.getFen());
  } catch (err) {
    console.error("Move error:", err.message);
  }
  
  process.exit(0);
}

test();
