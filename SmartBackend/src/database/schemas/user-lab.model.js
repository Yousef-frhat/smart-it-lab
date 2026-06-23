import mongoose from "mongoose";

const terminalEntrySchema = new mongoose.Schema(
  {
    entryId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    device: { type: String, required: true },
    command: { type: String, required: true },
    output: { type: String, default: "" },
    isError: { type: Boolean, default: false },
    prompt: { type: String, default: "" },
  },
  { _id: false }
);

const userLabSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    labId: { type: String, required: true }, // references Lab.labId
    status: {
      type: String,
      enum: ["not-started", "running", "stopped", "completed"],
      default: "not-started",
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    score: { type: Number, default: 0 },
    completedObjectives: [{ type: Number }], // indices of completed objectives
    commandHistory: [terminalEntrySchema],
    currentDevice: { type: String },
    // Per-device live CLI state for the stateful IOS engine
    // (keyed by device name → { mode, hostname, interfaces, vlans, ... })
    deviceStates: { type: mongoose.Schema.Types.Mixed, default: {} },
    startedAt: { type: Date },
    completedAt: { type: Date },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index: one record per user per lab
userLabSchema.index({ userId: 1, labId: 1 }, { unique: true });

const UserLab = mongoose.model("UserLab", userLabSchema);

export default UserLab;
