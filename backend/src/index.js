import { createServer } from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { initializeSocket } from "./socket/index.js";

const PORT = env.PORT;

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
