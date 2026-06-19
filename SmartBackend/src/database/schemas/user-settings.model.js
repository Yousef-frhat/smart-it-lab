import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      enum: ["dark", "light", "auto"],
      default: "dark",
    },
    language: {
      type: String,
      enum: ["en", "ar", "fr", "de", "es", "zh"],
      default: "en",
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      labReminders: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showLeaderboard: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);

export default UserSettings;
