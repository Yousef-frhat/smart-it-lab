/**
 * Custom operational error that carries an HTTP status code.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express error-handling middleware.
 * Must be registered AFTER all routes.
 */
export const errorHandler = (err, req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "Invalid ID format.";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(", ");
    statusCode = 409;
    message = `Duplicate value for field(s): ${field}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    statusCode = 400;
    message = messages.join(". ");
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired.";
  }

  // Security Fix #12: Never log errors (which may contain user data) via
  // console in production. A proper logger (Winston, Pino) should be used.
  // For now, only log in development and avoid exposing stack traces.
  if (process.env.NODE_ENV === "development") {
    console.error("❌ ERROR:", err);
  }

  // Security: never expose internal error messages or stack traces in production.
  // Replace generic 500 messages with a safe message.
  const safeMessage =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "An internal error occurred. Please try again later."
      : message;

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    // Stack only in development — never in production
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
