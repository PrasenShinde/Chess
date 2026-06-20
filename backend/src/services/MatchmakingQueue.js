import { getRedisClient } from "../redis/redisClient.js";

const QUEUE_KEY = "matchmaking:queue";
const USER_KEY_PREFIX = "matchmaking:user:";

class MatchmakingQueue {
  userKey(userId) {
    return `${USER_KEY_PREFIX}${userId}`;
  }

  async add(user) {
    const client = getRedisClient();
    const position = await client.lPos(QUEUE_KEY, user.id);

    if (position !== null) {
      return;
    }

    await client.rPush(QUEUE_KEY, user.id);
    await client.hSet(this.userKey(user.id), {
      username: user.username || "Player",
      rating: String(user.rating ?? 1200),
      enqueuedAt: String(Date.now()),
    });
    await client.expire(this.userKey(user.id), 3600);

    console.log(`[Queue] Added user ${user.username}`);
  }

  async remove(userId) {
    const client = getRedisClient();
    await client.lRem(QUEUE_KEY, 0, userId);
    await client.del(this.userKey(userId));
    console.log(`[Queue] Removed user ${userId}`);
  }

  async size() {
    const client = getRedisClient();
    return client.lLen(QUEUE_KEY);
  }

  async extractTwoPlayers(getSocket) {
    const client = getRedisClient();
    const matched = [];
    const queueLength = await client.lLen(QUEUE_KEY);
    let attempts = 0;

    while (matched.length < 2 && attempts < queueLength + 5) {
      attempts += 1;
      const userId = await client.rPop(QUEUE_KEY);
      if (!userId) {
        break;
      }

      const meta = await client.hGetAll(this.userKey(userId));
      await client.del(this.userKey(userId));

      if (!meta.username) {
        continue;
      }

      const socket = getSocket(userId);
      if (!socket?.connected) {
        continue;
      }

      matched.push({
        user: {
          id: userId,
          username: meta.username,
          rating: Number(meta.rating) || 1200,
        },
        socket,
      });
    }

    if (matched.length < 2) {
      for (const player of matched) {
        await this.add(player.user);
      }
      return null;
    }

    return matched;
  }
}

const queue = new MatchmakingQueue();
export default queue;
