/**
 * Test Express app — no HTTP server, used by Supertest.
 * Sets all required env vars before any imports so modules pick them up.
 */

process.env.JWT_SECRET = "test_access_secret_min_32_chars_long";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_min_32_chars_long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";
process.env.NODE_ENV = "test";
process.env.FRONTEND_URL = "http://localhost:3000";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "passport";

import { configurePassport } from "../../src/modules/auth/passport.js";
import authRoutes from "../../src/modules/auth/auth.routes.js";
import userRoutes from "../../src/modules/users/user.routes.js";
import labRoutes from "../../src/modules/labs/lab.routes.js";
import achievementRoutes from "../../src/modules/achievements/achievement.routes.js";
import leaderboardRoutes from "../../src/modules/leaderboard/leaderboard.routes.js";
import adminRoutes from "../../src/modules/admin/admin.routes.js";
import settingsRoutes from "../../src/modules/settings/settings.routes.js";
import eventsRoutes from "../../src/modules/events/events.routes.js";
import { errorHandler } from "../../src/common/middleware/error-handler.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

configurePassport();
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/labs", labRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/events", eventsRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found." }));
app.use(errorHandler);

export default app;
