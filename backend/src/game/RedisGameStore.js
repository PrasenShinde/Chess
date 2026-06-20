import { getRedisClient } from "../redis/redisClient.js";

export const RedisGameStore = {
  async saveGame(roomId, gameData, ttlSeconds = 86400) {
    const client = getRedisClient();
    const key = `game:${roomId}`;
    await client.set(key, JSON.stringify(gameData), { EX: ttlSeconds });
  },

  async getGame(roomId) {
    const client = getRedisClient();
    const key = `game:${roomId}`;
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data);
  },

  async updateGame(roomId, gameData, ttlSeconds = 86400) {
    await this.saveGame(roomId, gameData, ttlSeconds);
  },

  async deleteGame(roomId) {
    const client = getRedisClient();
    const key = `game:${roomId}`;
    await client.del(key);
  },
};
