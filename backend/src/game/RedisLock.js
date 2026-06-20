import crypto from "crypto";
import { getRedisClient } from "../redis/redisClient.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withGameLock(roomId, fn) {
  const client = getRedisClient();
  const lockKey = `lock:game:${roomId}`;
  const token = crypto.randomUUID();
  let acquired = false;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const result = await client.set(lockKey, token, { NX: true, EX: 5 });
    if (result) {
      acquired = true;
      break;
    }
    await sleep(25);
  }

  if (!acquired) {
    throw new Error("Move already in progress. Please try again.");
  }

  try {
    return await fn();
  } finally {
    const current = await client.get(lockKey);
    if (current === token) {
      await client.del(lockKey);
    }
  }
}
