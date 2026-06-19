import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    achievementId: { type: String, required: true, unique: true }, // e.g. "ach-1"
    name: { type: String, required: true },
    description: { type: String, required: true },
    points: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        "Lab Completion",
        "Networking Skills",
        "Security",
        "Consistency",
        "Social",
        "Speed",
        "Automation",
        "CCNA",
      ],
      required: true,
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      required: true,
    },
    maxProgress: { type: Number, default: 1 }, // e.g. 5 for "complete 5 labs"
    icon: { type: String, default: "🏆" },
  },
  { timestamps: true }
);

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
