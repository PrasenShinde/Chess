import { createServer } from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initializeSocket } from "./socket/index.js";
import { initRedis } from "./redis/redisClient.js";

const PORT = env.PORT;

const httpServer = createServer(app);

initializeSocket(httpServer);

const startServer = async () => {
  try {
    await initRedis();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server due to Redis error:", err);
    process.exit(1);
  }
};

startServer();
