import mongoose from "mongoose";

const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    achievementId: { type: String, required: true }, // references Achievement.achievementId
    progress: { type: Number, default: 0 },
    unlockedAt: { type: Date },
    unlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One record per user per achievement
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const UserAchievement = mongoose.model("UserAchievement", userAchievementSchema);

export default UserAchievement;
