import Achievement from "../../../database/schemas/achievement.model.js";
import UserAchievement from "../../../database/schemas/user-achievement.model.js";

// ─── GET ALL ACHIEVEMENTS ────────────────────────────────────────
export const getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find().sort({ points: 1 }).lean();

    // Fetch this user's unlock records
    const userRecords = await UserAchievement.find({
      userId: req.user._id,
    }).lean();

    const recordMap = {};
    userRecords.forEach((r) => (recordMap[r.achievementId] = r));

    const result = achievements.map((ach) => {
      const record = recordMap[ach.achievementId];
      return {
        id: ach.achievementId,
        name: ach.name,
        description: ach.description,
        points: ach.points,
        category: ach.category,
        tier: ach.tier,
        icon: ach.icon,
        maxProgress: ach.maxProgress,
        unlocked: record?.unlocked || false,
        progress: record?.progress || 0,
        unlockedAt: record?.unlockedAt || null,
      };
    });

    res.json({
      success: true,
      data: { achievements: result },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UNLOCK ACHIEVEMENT ──────────────────────────────────────────
export const unlockAchievement = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only allow admin or internal callers to set arbitrary progress;
    // regular users can only increment by 1 (server-driven progression).
    const isAdmin = req.user.role === "admin";
    const { progress } = req.body;

    const achievement = await Achievement.findOne({ achievementId: id });
    if (!achievement) {
      return res.status(404).json({ success: false, message: "Achievement not found." });
    }

    // Find or create the user's record for this achievement
    let record = await UserAchievement.findOne({
      userId: req.user._id,
      achievementId: id,
    });

    if (!record) {
      record = new UserAchievement({
        userId: req.user._id,
        achievementId: id,
        progress: 0,
        unlocked: false,
      });
    }

    if (record.unlocked) {
      return res.status(200).json({
        success: true,
        message: "Achievement already unlocked.",
        data: { achievement: record },
      });
    }

    // Non-admin users may only increment by 1; admins can set arbitrary values.
    const newProgress = isAdmin && progress !== undefined
      ? Math.min(progress, achievement.maxProgress)
      : Math.min(record.progress + 1, achievement.maxProgress);

    record.progress = newProgress;

    // Check unlock condition
    if (newProgress >= achievement.maxProgress) {
      record.unlocked = true;
      record.unlockedAt = new Date();

      // Award points to user
      await req.user.constructor.findByIdAndUpdate(req.user._id, {
        $inc: { totalPoints: achievement.points },
      });
    }

    await record.save();

    res.json({
      success: true,
      message: record.unlocked
        ? `Achievement "${achievement.name}" unlocked! +${achievement.points} pts`
        : "Progress updated.",
      data: {
        achievement: {
          id: achievement.achievementId,
          name: achievement.name,
          points: achievement.points,
          unlocked: record.unlocked,
          progress: record.progress,
          maxProgress: achievement.maxProgress,
          unlockedAt: record.unlockedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
