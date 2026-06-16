import { getRedisClient } from "../redis/redisClient.js";

export const RedisGameStore = {
  async saveGame(roomId, gameData) {
    const client = getRedisClient();
    const key = `game:${roomId}`;
    // Save with 24 hour expiration to prevent memory leaks
    await client.set(key, JSON.stringify(gameData), { EX: 86400 });
  },

  async getGame(roomId) {
    const client = getRedisClient();
    const key = `game:${roomId}`;
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data);
  },

  async updateGame(roomId, gameData) {
    await this.saveGame(roomId, gameData);
  },

  async deleteGame(roomId) {
    const client = getRedisClient();
    const key = `game:${roomId}`;
    await client.del(key);
  }
};
