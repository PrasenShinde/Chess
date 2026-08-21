import express from "express";
import { searchUser, getPublicProfile } from "../controllers/user.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/search", optionalAuth, searchUser);
router.get("/profile/:username", optionalAuth, getPublicProfile);

export default router;
