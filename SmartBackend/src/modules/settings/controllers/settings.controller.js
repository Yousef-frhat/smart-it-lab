import User from "../../../database/schemas/user.model.js";
import UserSettings from "../../../database/schemas/user-settings.model.js";
import UserLab from "../../../database/schemas/user-lab.model.js";
import UserAchievement from "../../../database/schemas/user-achievement.model.js";
import LeaderboardEntry from "../../../database/schemas/leaderboard.model.js";
import {
  sanitizeUser,
  clearRefreshTokenCookie,
} from "../../../common/utils/token.js";

// ─── GET SETTINGS ────────────────────────────────────────────────
export const getSettings = async (req, res, next) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user._id });

    // Create defaults if none exist
    if (!settings) {
      settings = await UserSettings.create({ userId: req.user._id });
    }

    res.json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE SETTINGS ─────────────────────────────────────────────
export const updateSettings = async (req, res, next) => {
  try {
    // Security Fix #7 — Mass Assignment:
    // Extract only the fields defined in updateSettingsSchema.
    // Do NOT pass req.body directly to $set — the Zod validator strips
    // unknown keys but we make the intent explicit here too.
    const { theme, language, notifications, privacy } = req.body;

    const allowedUpdates = {};
    if (theme         !== undefined) allowedUpdates.theme         = theme;
    if (language      !== undefined) allowedUpdates.language      = language;
    if (notifications !== undefined) allowedUpdates.notifications = notifications;
    if (privacy       !== undefined) allowedUpdates.privacy       = privacy;

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: allowedUpdates },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Settings updated.",
      data: { settings },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE PROFILE ──────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile updated.",
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── CHANGE PASSWORD ─────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Retrieve user with password field
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // OAuth users may not have a password
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message:
          "Your account uses social login and does not have a password.",
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    user.refreshToken = null; // revoke all existing sessions
    await user.save();

    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message:
        "Password changed successfully. Please log in again with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE ACCOUNT ──────────────────────────────────────────────
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Cascade delete all user-related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      UserSettings.deleteOne({ userId }),
      UserLab.deleteMany({ userId }),
      UserAchievement.deleteMany({ userId }),
      LeaderboardEntry.deleteMany({ userId }),
    ]);

    clearRefreshTokenCookie(res);

    res.json({
      success: true,
      message: "Your account and all data have been permanently deleted.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPLOAD AVATAR ───────────────────────────────────────────────
export const uploadAvatarHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file uploaded." });
    }

    // Cloudinary returns a full URL in req.file.path.
    // Local disk storage returns a filesystem path — convert to a servable URL.
    let avatarUrl = req.file.path;
    if (!avatarUrl.startsWith("http")) {
      // Build a full URL so the frontend can display it regardless of port/domain
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      avatarUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;
    }

    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    res.json({
      success: true,
      message: "Avatar updated.",
      data: { avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};
