import { verifyAccessToken } from "../utils/token.js";
import User from "../../database/schemas/user.model.js";

/**
 * Verify the JWT access token from the Authorization header,
 * look up the user in the database, and attach it to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
      });
    }

    const decoded = verifyAccessToken(token);

    // Fetch the full user from DB (exclude password & refreshToken)
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact support.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please refresh your token.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

/**
 * Optional auth — if a token is present it will be decoded,
 * but routes are still accessible without one.
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select(
        "-password -refreshToken"
      );
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Token invalid or expired — continue without user
  }
  next();
};