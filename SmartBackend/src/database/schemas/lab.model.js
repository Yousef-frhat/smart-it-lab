import mongoose from "mongoose";

const topologyNodeSchema = new mongoose.Schema(
  {
    nodeId: { type: String, required: true },
    type: {
      type: String,
      enum: ["router", "switch", "pc", "server", "cloud"],
      required: true,
    },
    name: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    ip: { type: String },
    status: {
      type: String,
      enum: ["active", "inactive", "error"],
      default: "active",
    },
    connections: [{ type: String }],
  },
  { _id: false }
);

const labSchema = new mongoose.Schema(
  {
    labId: { type: String, required: true, unique: true }, // e.g. "lab-1"
    name: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    category: { type: String, required: true },
    // module groups labs by CCNA topic area — backward-compatible optional field
    module: { type: String, default: "" },
    // order controls display sequence — backward-compatible optional field
    order: { type: Number, default: 0 },
    estimatedTime: { type: String, required: true },
    topology: [topologyNodeSchema],
    objectives: [{ type: String }],
    commands: [{ type: String }], // suggested commands shown to students
    hints: [{ type: String }],   // optional hints shown to students
    isPublished: { type: Boolean, default: true },

    /**
     * objectiveCommands — per-objective list of command keywords that satisfy it.
     * Index i in this array corresponds to index i in `objectives`.
     * Each entry is an array of strings; typing ANY one of them marks the objective done.
     *
     * Example for lab-1 (OSPF Troubleshooting):
     *   objectiveCommands[0] = ["router ospf", "network"]          → "Configure OSPF on all routers"
     *   objectiveCommands[1] = ["show ip ospf neighbor"]           → "Establish neighbor relationships"
     *   objectiveCommands[2] = ["show ip route", "show ip route ospf"] → "Verify routing table convergence"
     *   objectiveCommands[3] = ["show ip ospf database", "area"]   → "Troubleshoot area mismatches"
     *   objectiveCommands[4] = ["area 0 authentication", "ip ospf authentication"] → "Implement authentication"
     *
     * If empty or shorter than objectives, the frontend falls back to keyword matching.
     */
    objectiveCommands: [[{ type: String }]],
  },
  { timestamps: true }
);

// ── Performance indexes ──────────────────────────────────────────
// labId already has a unique index from the schema definition above — no duplicate needed
// Filtered list queries: GET /api/labs?difficulty=beginner&category=Routing
labSchema.index({ isPublished: 1, difficulty: 1 });
labSchema.index({ isPublished: 1, category: 1 });
labSchema.index({ isPublished: 1, order: 1 });

const Lab = mongoose.model("Lab", labSchema);

export default Lab;
