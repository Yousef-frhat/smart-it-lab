import express from "express";
import {
  getLabs,
  getLabById,
  startLab,
  stopLab,
  saveProgress,
  runCommand,
  getObjectives,
  syncUserStats,
} from "./controllers/lab.controller.js";
import { authenticate, optionalAuth } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import { saveProgressSchema, terminalCommandSchema } from "./lab.validation.js";

const router = express.Router();

// Public with optional user context (so progress is shown when logged in)
router.get("/", optionalAuth, getLabs);

// ── Retroactive stats sync — must be before /:id routes to avoid conflict ──
router.post("/sync-stats", authenticate, syncUserStats);

router.get("/:id", optionalAuth, getLabById);
router.get("/:id/objectives", optionalAuth, getObjectives);

// Require auth for all interaction
router.post("/:id/start", authenticate, startLab);
router.post("/:id/stop", authenticate, stopLab);
router.post("/:id/save-progress", authenticate, validate(saveProgressSchema), saveProgress);
router.post("/:id/terminal", authenticate, validate(terminalCommandSchema), runCommand);

export default router;
