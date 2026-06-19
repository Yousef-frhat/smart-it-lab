import LeaderboardEntry from "../../../database/schemas/leaderboard.model.js";
import User from "../../../database/schemas/user.model.js";
import UserLab from "../../../database/schemas/user-lab.model.js";
import UserAchievement from "../../../database/schemas/user-achievement.model.js";

/**
 * Get the Monday of the current week (for weekly grouping)
 * or the first day of the current month (for monthly grouping).
 *
 * Always normalized to midnight UTC so that entries inserted at different
 * times of day still share the same weekOf key and are found by queries.
 */
const getPeriodStart = (period) => {
  const now = new Date();
  if (period === "weekly") {
    const day = now.getUTCDay(); // 0=Sun
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
    const d = new Date(now);
    d.setUTCDate(diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

// ─── GET LEADERBOARD ─────────────────────────────────────────────
export const getLeaderboard = async (req, res, next) => {
  try {
    const period = req.query.period === "monthly" ? "monthly" : "weekly";
    const weekOf = getPeriodStart(period);
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    // Ensure the current user has an entry for this period (computed from real data)
    if (req.user) {
      const existing = await LeaderboardEntry.findOne({
        userId: req.user._id, period, weekOf,
      }).lean();

      if (!existing) {
        // Compute real stats from UserLab / UserAchievement records for a fresh insert
        const completedLabs = await UserLab.find({
          userId: req.user._id,
          status: "completed",
        }).lean();
        const unlockedAchievements = await UserAchievement.find({
          userId: req.user._id,
          unlocked: true,
        }).lean();

        const totalScore = completedLabs.reduce((sum, l) => sum + (l.score || 0), 0);
        const labsCompleted = completedLabs.length;
        const achievementBonus = unlockedAchievements.length * 100;
        const totalPoints = totalScore + achievementBonus;
        const avgScore = labsCompleted > 0 ? Math.round(totalScore / labsCompleted) : 0;

        // Fetch fresh streak from User document (req.user may be stale)
        const freshUser = await User.findById(req.user._id).lean();
        const streak = freshUser?.streak || 0;

        await LeaderboardEntry.findOneAndUpdate(
          { userId: req.user._id, period, weekOf },
          {
            $setOnInsert: {
              userId: req.user._id,
              period,
              weekOf,
              totalPoints,
              labsCompleted,
              streak,
              avgScore,
              trend: "same",
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    // Fetch sorted leaderboard, populate user name+avatar
    const entries = await LeaderboardEntry.find({ period, weekOf })
      .sort({ totalPoints: -1 })
      .limit(limit)
      .populate("userId", "name avatar email")
      .lean();

    const currentUserId = req.user?._id?.toString();

    const ranked = entries.map((entry, index) => {
      const uid = entry.userId?._id?.toString() || entry.userId?.toString();
      return {
        rank: index + 1,
        userId: uid,
        name: entry.userId?.name || "Unknown",
        avatar: entry.userId?.avatar || "",
        totalPoints: entry.totalPoints,
        labsCompleted: entry.labsCompleted,
        streak: entry.streak,
        avgScore: entry.avgScore,
        trend: entry.trend,
        isCurrentUser: uid === currentUserId,
      };
    });

    res.json({
      success: true,
      data: {
        period,
        weekOf,
        leaderboard: ranked,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync a user's leaderboard stats after lab completion.
 * Called internally from other controllers — not an HTTP endpoint.
 */
export const syncLeaderboardStats = async (userId, stats = {}) => {
  const periods = ["weekly", "monthly"];
  for (const period of periods) {
    const weekOf = getPeriodStart(period);
    await LeaderboardEntry.findOneAndUpdate(
      { userId, period, weekOf },
      {
        $set: {
          totalPoints: stats.totalPoints || 0,
          labsCompleted: stats.labsCompleted || 0,
          streak: stats.streak || 0,
          avgScore: stats.avgScore || 0,
        },
      },
      { upsert: true, new: true }
    );
  }
};
