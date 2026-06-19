import mongoose from "mongoose";
import User from "../../../database/schemas/user.model.js";
import UserLab from "../../../database/schemas/user-lab.model.js";
import UserSettings from "../../../database/schemas/user-settings.model.js";
import UserAchievement from "../../../database/schemas/user-achievement.model.js";
import LeaderboardEntry from "../../../database/schemas/leaderboard.model.js";
import { sanitizeUser } from "../../../common/utils/token.js";

// ── Security: allowlist for sortBy to prevent NoSQL injection ────
const ALLOWED_SORT_FIELDS = new Set([
  "createdAt", "updatedAt", "name", "email",
  "role", "plan", "status", "labsCompleted", "totalPoints",
]);

// ── Security: escape special regex characters to prevent ReDoS ───
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── GET ALL USERS (Admin) ───────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      role,
      plan,
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Security: enforce pagination limits to prevent DB exhaustion
    const safePage  = Math.max(1, parseInt(page,  10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const filter = {};
    if (search) {
      // Security Fix #3a — ReDoS: escape before passing to $regex
      const safeSearch = escapeRegex(String(search).slice(0, 100));
      filter.$or = [
        { name:  { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // Security: only allow known enum values — prevents NoSQL operator injection
    const VALID_ROLES   = ["student", "admin", "instructor"];
    const VALID_PLANS   = ["free", "pro", "enterprise"];
    const VALID_STATUSES = ["active", "inactive", "suspended"];

    if (role   && VALID_ROLES.includes(role))     filter.role   = role;
    if (plan   && VALID_PLANS.includes(plan))     filter.plan   = plan;
    if (status && VALID_STATUSES.includes(status)) filter.status = status;

    const skip      = (safePage - 1) * safeLimit;
    const sortOrder = order === "asc" ? 1 : -1;

    // Security Fix #3b — NoSQL Injection: validate sortBy against allowlist
    const safeSortBy = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : "createdAt";

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [safeSortBy]: sortOrder })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users: users.map((u) => {
          delete u.password;
          delete u.refreshToken;
          delete u.emailVerificationToken;
          delete u.emailVerificationExpires;
          delete u.passwordResetToken;
          delete u.passwordResetExpires;
          u.id = u._id.toString();
          delete u._id;
          return u;
        }),
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(total / safeLimit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE USER (Admin) ─────────────────────────────────────
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Security: strip ALL sensitive fields before sending
    delete user.password;
    delete user.refreshToken;
    delete user.emailVerificationToken;
    delete user.emailVerificationExpires;
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    user.id = user._id.toString();
    delete user._id;

    const labStats = await UserLab.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          labsCompleted: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          avgScore: { $avg: "$score" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          labStats: labStats[0] || { labsCompleted: 0, avgScore: 0 },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE USER (Admin) ─────────────────────────────────────────
export const updateUser = async (req, res, next) => {
  try {
    // Security Fix #2 — Mass Assignment:
    // Only allow specific fields — NEVER pass req.body directly to $set.
    // This prevents an attacker (even admin) from writing to password,
    // refreshToken, or any other sensitive field via this endpoint.
    const {
      name,
      email,
      role,
      plan,
      isActive,
      status,
      avatar,
    } = req.body;

    const allowedUpdates = {};
    if (name      !== undefined) allowedUpdates.name      = name;
    if (email     !== undefined) allowedUpdates.email     = email;
    if (role      !== undefined) allowedUpdates.role      = role;
    if (plan      !== undefined) allowedUpdates.plan      = plan;
    if (isActive  !== undefined) allowedUpdates.isActive  = isActive;
    if (status    !== undefined) allowedUpdates.status    = status;
    if (avatar    !== undefined) allowedUpdates.avatar    = avatar;

    if (Object.keys(allowedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },   // explicit allowlist — not req.body
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.json({
      success: true,
      message: "User updated successfully.",
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE USER (Admin) ─────────────────────────────────────────
export const deleteUser = async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account via admin panel.",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Cascade-delete all user data
    await Promise.all([
      UserLab.deleteMany({ userId: req.params.id }),
      UserSettings.deleteOne({ userId: req.params.id }),
      UserAchievement.deleteMany({ userId: req.params.id }),
      LeaderboardEntry.deleteMany({ userId: req.params.id }),
    ]);

    res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── SUSPEND / UNSUSPEND USER (Admin) ───────────────────────────
export const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isSuspended = user.status === "suspended";
    user.status   = isSuspended ? "active" : "suspended";
    user.isActive = isSuspended;
    if (!isSuspended) user.refreshToken = null; // revoke session on suspend

    await user.save();

    res.json({
      success: true,
      message: `User ${isSuspended ? "unsuspended" : "suspended"} successfully.`,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    next(error);
  }
};
