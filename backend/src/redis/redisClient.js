import { createClient } from "redis";
import { env } from "../config/env.js";

let redisClient = null;

export const initRedis = async () => {
  redisClient = createClient({
    url: env.REDIS_URL,
  });

  redisClient.on("error", (err) => console.error("Redis Client Error", err));

  await redisClient.connect();
  console.log("🔑 Connected to Redis");
  return redisClient;
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call initRedis first.");
  }
  return redisClient;
};
