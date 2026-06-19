import express from "express";
import { getLeaderboard } from "./controllers/leaderboard.controller.js";
import { authenticate, optionalAuth } from "../../common/middleware/auth.middleware.js";

const router = express.Router();

// Optional auth so rank is visible even when logged out,
// but isCurrentUser highlighting works when logged in
router.get("/", optionalAuth, getLeaderboard);

export default router;
