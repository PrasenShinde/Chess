import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as gameController from "../controllers/game.controller.js";

const router = Router();

router.get("/stats", requireAuth, gameController.getStats);
router.get("/recent", requireAuth, gameController.getRecentGames);

export default router;
