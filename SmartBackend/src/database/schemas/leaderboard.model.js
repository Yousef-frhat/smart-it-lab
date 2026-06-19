import mongoose from "mongoose";

const leaderboardEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalPoints: { type: Number, default: 0 },
    labsCompleted: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    period: {
      type: String,
      enum: ["weekly", "monthly"],
      required: true,
    },
    weekOf: { type: Date, required: true }, // Monday of the week / first of the month
    trend: {
      type: String,
      enum: ["up", "down", "same"],
      default: "same",
    },
    // FIX 6: Added lastActive so lab.controller.js can record when the entry was last updated
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One entry per user per period per week/month
leaderboardEntrySchema.index(
  { userId: 1, period: 1, weekOf: 1 },
  { unique: true }
);

// For fast sorted queries
leaderboardEntrySchema.index({ period: 1, weekOf: 1, totalPoints: -1 });

const LeaderboardEntry = mongoose.model("LeaderboardEntry", leaderboardEntrySchema);

export default LeaderboardEntry;
