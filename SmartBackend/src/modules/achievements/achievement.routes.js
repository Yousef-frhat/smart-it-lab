import express from "express";
import {
  getAchievements,
  unlockAchievement,
} from "./controllers/achievement.controller.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getAchievements);
router.post("/:id/unlock", authenticate, unlockAchievement);

export default router;
