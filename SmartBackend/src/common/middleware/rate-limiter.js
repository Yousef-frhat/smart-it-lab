import rateLimit from "express-rate-limit";

// In test environment, use no-op middleware to avoid 429s in tests.
const noOp = (_req, _res, next) => next();

const isTest = process.env.NODE_ENV === "test";

/**
 * Auth limiter — login, register, refresh-token.
 * 10 requests per 15-minute window per IP (tightened from 15).
 */
export const authLimiter = isTest
  ? noOp
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      // Security: don't reveal internal details in the error message
      message: {
        success: false,
        message: "Too many requests. Please try again later.",
      },
      // Security: skip successful requests — count only failures
      // This prevents legitimate users being locked out by their own
      // valid requests piling up against the window.
      skipSuccessfulRequests: false,
    });

/**
 * Sensitive operations limiter — password reset, email verification.
 * Stricter: 5 requests per hour per IP.
 */
export const sensitiveOpLimiter = isTest
  ? noOp
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests for this operation. Please try again in an hour.",
      },
    });

/**
 * General API limiter — all /api/* routes.
 * 100 requests per minute per IP.
 */
export const apiLimiter = isTest
  ? noOp
  : rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Rate limit exceeded. Please slow down.",
      },
    });

/**
 * Upload limiter — avatar uploads.
 * 10 uploads per hour per IP.
 */
export const uploadLimiter = isTest
  ? noOp
  : rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many uploads. Please try again later.",
      },
    });
