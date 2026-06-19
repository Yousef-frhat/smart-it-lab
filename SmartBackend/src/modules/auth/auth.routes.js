import express from "express";
import passport from "passport";
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  oauthCallback,
  oauthTokenExchange,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "./controllers/auth.controller.js";
import { authenticate } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import { authLimiter, sensitiveOpLimiter } from "../../common/middleware/rate-limiter.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = express.Router();

// ── Local Auth ───────────────────────────────────────────────
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", authenticate, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", authenticate, getMe);

// ── OAuth Token Exchange (replaces ?token= in URL) ───────────────
// Frontend /auth/callback calls this once to pick up the access token
router.get("/oauth-token", oauthTokenExchange);

// ── Email Verification & Password Reset ─────────────────────
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", sensitiveOpLimiter, resendVerification);
router.post("/forgot-password",     sensitiveOpLimiter, forgotPassword);
router.post("/reset-password",      sensitiveOpLimiter, resetPassword);

// ── GitHub OAuth ─────────────────────────────────────────────
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth?error=github_failed`,
    session: false,
  }),
  oauthCallback
);

// ── Google OAuth ─────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth?error=google_failed`,
    session: false,
  }),
  oauthCallback
);

export default router;
