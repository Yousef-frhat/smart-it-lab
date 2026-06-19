import crypto from "crypto";
import User from "../../../database/schemas/user.model.js";
import UserSettings from "../../../database/schemas/user-settings.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  sanitizeUser,
} from "../../../common/utils/token.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../../common/utils/mailer.js";

// ── Helper: hash a raw token with SHA-256 ────────────────────────
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// ─── REGISTER ────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Generate verification token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(rawToken);

    const user = await User.create({
      name,
      email,
      password,
      role: "student",
      plan: "free",
      emailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    await UserSettings.create({ userId: user._id });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, rawToken).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    // Generate tokens and log user in
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
      data: {
        user: sanitizeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY EMAIL ────────────────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required." });
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token.",
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── RESEND VERIFICATION ─────────────────────────────────────────
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user || user.emailVerified) {
      // Don't reveal whether the account exists
      return res.json({
        success: true,
        message: "If that email exists and is unverified, a new verification link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = hashToken(rawToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    sendVerificationEmail(email, rawToken).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    res.json({
      success: true,
      message: "If that email exists and is unverified, a new verification link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Always return success to prevent email enumeration
    const successMsg = "If an account with that email exists, a password reset link has been sent.";

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: successMsg });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = hashToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    sendPasswordResetEmail(email, rawToken).catch((err) =>
      console.error("Failed to send password reset email:", err)
    );

    res.json({ success: true, message: successMsg });
  } catch (error) {
    next(error);
  }
};

// ─── RESET PASSWORD ──────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token and password are required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const hashedToken = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token.",
      });
    }

    user.password = password; // pre-save hook will hash it
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = null; // revoke all sessions
    await user.save();

    res.json({ success: true, message: "Password has been reset. You can now log in." });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ───────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact support.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();
    setRefreshTokenCookie(res, refreshToken);

    // FIX 4: Attach user settings so the frontend can apply the correct theme immediately
    const settings = await UserSettings.findOne({ userId: user._id }).lean();

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          ...sanitizeUser(user),
          settings: {
            theme: settings?.theme || "dark",
            language: settings?.language || "en",
          },
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id || req.user.id, {
        refreshToken: null,
      });
    }
    clearRefreshTokenCookie(res);
    res.json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
};

// ─── REFRESH TOKEN ───────────────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token provided." });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ success: false, message: "Refresh token has been revoked." });
    }

    if (!user.isActive) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({ success: false, message: "Account has been suspended." });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = newRefreshToken;
    await user.save();
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ success: true, data: { accessToken: newAccessToken } });
  } catch (error) {
    next(error);
  }
};

// ─── GET CURRENT USER ────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // FIX 4: Attach user settings so the frontend can apply the correct theme on session restore
    const settings = await UserSettings.findOne({ userId: user._id }).lean();

    res.json({
      success: true,
      data: {
        user: {
          ...sanitizeUser(user),
          settings: {
            theme: settings?.theme || "dark",
            language: settings?.language || "en",
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── OAUTH TOKEN EXCHANGE ────────────────────────────────────────
// Reads the short-lived oauthToken cookie (set by oauthCallback),
// returns the access token once, then immediately clears the cookie.
// This endpoint is hit by the frontend /auth/callback page.
export const oauthTokenExchange = async (req, res) => {
  const token = req.cookies?.oauthToken;
  if (!token) {
    return res.status(401).json({ success: false, message: "No OAuth token available." });
  }

  // Clear the one-time cookie immediately
  res.clearCookie("oauthToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/api/auth/oauth-token",
  });

  res.json({ success: true, data: { accessToken: token } });
};
export const oauthCallback = async (req, res, next) => {
  try {
    const user = req.user;
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken  = refreshToken;
    await user.save();
    setRefreshTokenCookie(res, refreshToken);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Security Fix #5 — OAuth Token Exposure:
    // The access token must NOT be placed in the URL (visible in browser
    // history, server logs, and Referer headers of third-party scripts).
    //
    // Instead, we set it as a short-lived, httpOnly cookie scoped to the
    // callback path. The frontend /auth/callback page reads it via a
    // dedicated exchange endpoint (/api/auth/oauth-token) and immediately
    // clears the cookie. This keeps the token out of the URL entirely.
    res.cookie("oauthToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 2 * 60 * 1000, // 2 minutes — one-time pickup only
      path: "/api/auth/oauth-token",
    });

    // Redirect to callback page with NO token in the URL
    res.redirect(`${frontendUrl}/auth/callback`);
  } catch (error) {
    next(error);
  }
};