import dotenv from "dotenv";
dotenv.config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import passport from "passport";

// ── Database ────────────────────────────────────────────────────
import { connectDB } from "./database/connection.js";

// ── Passport OAuth ──────────────────────────────────────────────
import { configurePassport } from "./modules/auth/passport.js";

// ── Routes ──────────────────────────────────────────────────────
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import labRoutes from "./modules/labs/lab.routes.js";
import achievementRoutes from "./modules/achievements/achievement.routes.js";
import leaderboardRoutes from "./modules/leaderboard/leaderboard.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import eventsRoutes from "./modules/events/events.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

// ── Middleware ──────────────────────────────────────────────────
import { apiLimiter } from "./common/middleware/rate-limiter.js";
import { errorHandler } from "./common/middleware/error-handler.js";

// ────────────────────────────────────────────────────────────────
const app = express();

// ── Security Fix: Trust proxy (needed for rate limiting behind Nginx) ──
// Without this, express-rate-limit sees Nginx's IP instead of the real
// client IP, making rate limiting ineffective.
// '1' means trust one hop (Nginx). Adjust if behind multiple proxies.
app.set("trust proxy", 1);

// ── 1. Security headers (must be first) ─────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ── 2. CORS ──────────────────────────────────────────────────────
const isDev = (process.env.NODE_ENV || "development") === "development";

const corsOrigin = isDev
  ? (origin, callback) => {
      // Development: allow no-origin requests (Postman, curl) and any localhost
      if (!origin) return callback(null, true);
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  : (origin, callback) => {
      // Security Fix #9 — Production CORS:
      // In production, NEVER allow requests without an Origin header.
      // This prevents server-side scripts and curl from hitting the API
      // with credentials. Only the explicit FRONTEND_URL is allowed.
      if (!origin) {
        return callback(new Error("CORS: requests without Origin header are not allowed in production"));
      }
      const allowed = process.env.FRONTEND_URL || "http://localhost:3000";
      if (origin === allowed) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    };

app.use(
  cors({
    origin: corsOrigin,
    credentials: true, // allow cookies (refresh token)
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── 3. Body parsing + cookies ────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── 4. Passport (OAuth strategies) ──────────────────────────────
configurePassport();
app.use(passport.initialize());

// ── 5. General API rate limiter ──────────────────────────────────
app.use("/api", apiLimiter);

// ── 6. Health check ──────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "🚀 Smart IT Lab API is running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// ── 7. Swagger API Docs (development only) ──────────────────────
// Security Fix #8: never expose full API schema in production.
// In production, show only a minimal "docs disabled" message.
if (isDev) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Smart IT Lab API Docs',
  }));
} else {
  app.get("/api/docs", (_req, res) => {
    res.status(404).json({
      success: false,
      message: "API documentation is not available in production.",
    });
  });
  app.use("/api/docs", (_req, res) => {
    res.status(404).end();
  });
}

// ── 8. API Routes ────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);           // Admin: CRUD on all users
app.use("/api/labs", labRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);          // Admin analytics
app.use("/api/settings", settingsRoutes);    // /api/settings/* (profile, password, account)
app.use("/api/events", eventsRoutes);        // SSE real-time events

// ── 8. 404 handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ── 9. Global error handler (must be last) ───────────────────────
app.use(errorHandler);

// ── 10. Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Smart IT Lab API v2.0`);
    console.log(`📡 Server:   http://localhost:${PORT}`);
    console.log(
      `🌍 CORS:     ${isDev ? "any localhost port (development)" : process.env.FRONTEND_URL || "http://localhost:3000"}`
    );
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || "development"}\n`);
  });

  // ── Graceful Shutdown ──────────────────────────────────────────
  // Allows in-flight requests to complete before the process exits.
  // Required for Docker/ECS rolling deployments and SIGTERM signals.
  const shutdown = (signal) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(() => {
      console.log("✅ HTTP server closed. Exiting.");
      process.exit(0);
    });

    // Force-kill after 10s if connections don't close
    setTimeout(() => {
      console.error("⚠️  Forced shutdown after 10s timeout.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));

  // ── Unhandled rejection safety net ────────────────────────────
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Promise Rejection:", reason);
    // Don't crash in production — log and continue
  });
});

export default app;