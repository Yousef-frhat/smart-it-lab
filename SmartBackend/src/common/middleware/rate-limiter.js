import rateLimit from "express-rate-limit";

// In test environment, use no-op middleware to avoid 429s in tests.
const noOp = (_req, _res, next) => next();

const isTest = process.env.NODE_ENV === "test";
const isDev = (process.env.NODE_ENV || "development") === "development";

/**
 * Auth limiter — login, register, refresh-token.
 * Production: 10 failed attempts per 15-minute window per IP.
 * Development: a generous 200 so local testing / repeated logins
 * don't lock you out.
 *
 * `skipSuccessfulRequests: true` means only FAILED attempts count
 * toward the limit — a legitimate user logging in successfully (even
 * many times) is never locked out. This is the correct behavior for a
 * brute-force guard.
 */
export const authLimiter = isTest
  ? noOp
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: isDev ? 200 : 10,
      standardHeaders: true,
      legacyHeaders: false,
      // Security: don't reveal internal details in the error message
      message: {
        success: false,
        message: "Too many requests. Please try again later.",
      },
      // Security: skip successful requests — count only failures so
      // legitimate users are never locked out by their own valid logins.
      skipSuccessfulRequests: true,
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
