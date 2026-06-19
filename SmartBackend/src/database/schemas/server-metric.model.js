import mongoose from "mongoose";

const serverMetricSchema = new mongoose.Schema(
  {
    serverId: { type: String, required: true, unique: true }, // e.g. "srv-1"
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["web", "database", "cache", "lab-vm"],
      required: true,
    },
    status: {
      type: String,
      enum: ["healthy", "warning", "critical", "offline"],
      default: "healthy",
    },
    cpu: { type: Number, default: 0, min: 0, max: 100 },
    memory: { type: Number, default: 0, min: 0, max: 100 },
    disk: { type: Number, default: 0, min: 0, max: 100 },
    uptime: { type: Number, default: 0 }, // seconds
    location: { type: String, default: "" },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ServerMetric = mongoose.model("ServerMetric", serverMetricSchema);

export default ServerMetric;
