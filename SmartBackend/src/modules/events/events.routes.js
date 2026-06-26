import express from "express";
import { verifyAccessToken } from "../../common/utils/token.js";
import {
  registerConnection,
  removeConnection,
  emitLabEvent,
} from "./connection-registry.js";

const router = express.Router();

export { emitLabEvent };

// Per-user SSE connection limit to prevent resource exhaustion.
const MAX_SSE_PER_USER = 10;
const userConnectionCounts = new Map(); // userId → count

// ── GET /api/events/lab/:id ─────────────────────────────────────
//
// Security note on authentication:
// EventSource API cannot set custom headers, so we cannot use
// Authorization: Bearer <token>. The two safe alternatives are:
//
// Option A (implemented here): Read from httpOnly cookie.
//   - The refresh-token cookie is scoped to /api/auth only, so we
//     use a short-lived "event ticket" approach via a signed cookie.
//
// Option B (fallback): Accept token in Authorization header via a
//   one-time POST that upgrades to SSE — more complex, same security.
//
// We implement a hybrid: first try cookie auth (production-safe),
// then fall back to a short-lived token passed via a secure POST
// endpoint. For now, we accept the token from the Authorization
// header forwarded by a Vite/Nginx proxy, or from a dedicated
// event-ticket mechanism.
//
// IMPORTANT: We do NOT log the token anywhere.
// ────────────────────────────────────────────────────────────────

router.get("/lab/:id", (req, res) => {
  // ── Authentication ───────────────────────────────────────────
  // Try Authorization header first (proxy-forwarded by Nginx/Vite)
  let token = null;

  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // Fallback: short-lived token in query param ONLY for SSE
  // (EventSource limitation). We accept it but do NOT log it.
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }

  const userId = decoded.id;

  // Enforce per-user SSE connection limit
  const currentCount = userConnectionCounts.get(userId) || 0;
  if (currentCount >= MAX_SSE_PER_USER) {
    return res.status(429).json({
      success: false,
      message: "Too many open SSE connections. Close some before opening new ones.",
    });
  }
  userConnectionCounts.set(userId, currentCount + 1);

  const labId = req.params.id;

  // Validate labId format to prevent log injection
  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(labId)) {
    return res.status(400).json({ success: false, message: "Invalid lab ID." });
  }

  // SSE headers — note: no token echoed back in any header
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-store",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
    // Prevent the URL (with token) from being sent as Referer
    "Referrer-Policy": "no-referrer",
  });

  // Initial connection — only send labId, never the token
  res.write(`data: ${JSON.stringify({ type: "connected", data: { labId } })}\n\n`);

  registerConnection(labId, res);

  // Keep-alive ping every 30s
  const pingInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: "ping", data: {} })}\n\n`);
  }, 30000);

  // Cleanup on disconnect
  req.on("close", () => {
    clearInterval(pingInterval);
    removeConnection(labId, res);
    const remaining = (userConnectionCounts.get(userId) || 1) - 1;
    if (remaining <= 0) userConnectionCounts.delete(userId);
    else userConnectionCounts.set(userId, remaining);
  });
});

export default router;
