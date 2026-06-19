import jwt from "jsonwebtoken";

/**
 * Generate a short-lived access token (default 15 min).
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" }
  );
};

/**
 * Generate a long-lived refresh token (default 7 days).
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
  );
};

/**
 * Verify an access token and return the decoded payload.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify a refresh token and return the decoded payload.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Attach refresh token as an httpOnly cookie on the response.
 */
export const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth",
  });
};

/**
 * Clear the refresh token cookie.
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/api/auth",
  });
};

/**
 * Return a sanitized user object safe for the client (no password / refreshToken).
 */
export const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.refreshToken;
  obj.id = obj._id?.toString() || obj.id;
  delete obj._id;
  delete obj.__v;
  return obj;
};
