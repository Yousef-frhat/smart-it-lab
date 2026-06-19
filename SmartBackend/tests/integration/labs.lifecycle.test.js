/**
 * Integration tests — Lab lifecycle (start → commands → progress → stop)
 * Covers all API endpoints for the lab system.
 */

import { jest } from "@jest/globals";
import request from "supertest";
import app from "../helpers/app.js";
import { connectTestDB, disconnectTestDB, clearCollections } from "../helpers/db.js";
import { createUser, getAuthHeader, createLab, createAchievement } from "../helpers/factories.js";
import User from "../../src/database/schemas/user.model.js";
import UserSettings from "../../src/database/schemas/user-settings.model.js";
import Lab from "../../src/database/schemas/lab.model.js";
import UserLab from "../../src/database/schemas/user-lab.model.js";
import Achievement from "../../src/database/schemas/achievement.model.js";
import UserAchievement from "../../src/database/schemas/user-achievement.model.js";
import LeaderboardEntry from "../../src/database/schemas/leaderboard.model.js";

jest.mock("../../src/modules/events/events.routes.js", () => ({
  emitLabEvent: jest.fn(),
  default: { get: jest.fn() },
}));

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await disconnectTestDB(); });
afterEach(async () => {
  await clearCollections(User, UserSettings, Lab, UserLab, Achievement, UserAchievement, LeaderboardEntry);
});

// ── Helper: create a lab with objectiveCommands ───────────────────
async function createFullLab(overrides = {}) {
  return createLab({
    objectives: ["Configure routing", "Verify neighbors", "Check routing table", "Test connectivity", "Review config"],
    objectiveCommands: [
      ["router ospf", "network"],
      ["show ip ospf neighbor"],
      ["show ip route"],
      ["ping"],
      ["show running-config", "show run"],
    ],
    commands: ["show ip ospf neighbor", "show ip route", "ping 192.168.1.1", "show running-config", "router ospf 1"],
    ...overrides,
  });
}

// ── GET /api/labs ─────────────────────────────────────────────────
describe("GET /api/labs", () => {
  test("200 — returns labs array", async () => {
    await createLab();
    const res = await request(app).get("/api/labs");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.labs)).toBe(true);
  });

  test("200 — filters by difficulty", async () => {
    await createLab({ difficulty: "beginner" });
    await createLab({ difficulty: "advanced" });
    const res = await request(app).get("/api/labs?difficulty=beginner");
    expect(res.status).toBe(200);
    res.body.data.labs.forEach((l) => expect(l.difficulty).toBe("beginner"));
  });

  test("200 — search by name", async () => {
    await createLab({ name: "OSPF Multi-Area Lab" });
    await createLab({ name: "BGP Configuration Lab" });
    const res = await request(app).get("/api/labs?search=OSPF");
    expect(res.status).toBe(200);
    expect(res.body.data.labs.some((l) => l.name.includes("OSPF"))).toBe(true);
  });

  test("200 — includes status/progress when authenticated", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    const res = await request(app).get("/api/labs").set(getAuthHeader(user));
    expect(res.status).toBe(200);
    const found = res.body.data.labs.find((l) => l.id === lab.labId);
    expect(found).toBeDefined();
    expect(found.status).toBe("running");
  });
});

// ── GET /api/labs/:id ─────────────────────────────────────────────
describe("GET /api/labs/:id", () => {
  test("200 — returns single lab", async () => {
    const lab = await createLab({ name: "Test OSPF Lab" });
    const res = await request(app).get(`/api/labs/${lab.labId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.lab.id).toBe(lab.labId);
    expect(res.body.data.lab.name).toBe("Test OSPF Lab");
  });

  test("404 — unknown lab id", async () => {
    const res = await request(app).get("/api/labs/lab-does-not-exist");
    expect(res.status).toBe(404);
  });

  test("200 — lab shape has required fields", async () => {
    const lab = await createLab();
    const res = await request(app).get(`/api/labs/${lab.labId}`);
    const l = res.body.data.lab;
    expect(l).toHaveProperty("id");
    expect(l).toHaveProperty("name");
    expect(l).toHaveProperty("difficulty");
    expect(l).toHaveProperty("objectives");
    expect(l).toHaveProperty("commands");
    expect(l).toHaveProperty("status");
    expect(l).toHaveProperty("score");
    expect(l).toHaveProperty("progress");
  });
});

// ── POST /api/labs/:id/start ──────────────────────────────────────
describe("POST /api/labs/:id/start", () => {
  test("200 — creates UserLab with status running", async () => {
    const user = await createUser();
    const lab = await createLab();
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/start`)
      .set(getAuthHeader(user));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lab.status).toBe("running");
  });

  test("401 — requires authentication", async () => {
    const lab = await createLab();
    const res = await request(app).post(`/api/labs/${lab.labId}/start`);
    expect(res.status).toBe(401);
  });

  test("404 — unknown lab id", async () => {
    const user = await createUser();
    const res = await request(app)
      .post("/api/labs/nonexistent-lab/start")
      .set(getAuthHeader(user));
    expect(res.status).toBe(404);
  });

  test("200 — starting again is idempotent (stays running)", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    const res = await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    expect(res.status).toBe(200);
    expect(res.body.data.lab.status).toBe("running");
  });
});

// ── POST /api/labs/:id/terminal ───────────────────────────────────
describe("POST /api/labs/:id/terminal", () => {
  test("200 — returns terminal output for valid command", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));

    const res = await request(app)
      .post(`/api/labs/${lab.labId}/terminal`)
      .set(getAuthHeader(user))
      .send({ command: "show ip route", device: "Router-1" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.entry).toBeDefined();
    expect(res.body.data.entry.command).toBe("show ip route");
    expect(typeof res.body.data.entry.output).toBe("string");
  });

  test("400 — missing command body", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/terminal`)
      .set(getAuthHeader(user))
      .send({});
    expect(res.status).toBe(400);
  });

  test("400 — no active lab instance", async () => {
    const user = await createUser();
    const lab = await createLab();
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/terminal`)
      .set(getAuthHeader(user))
      .send({ command: "show ip route", device: "Router-1" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/No active lab instance/i);
  });

  test("401 — unauthenticated request rejected", async () => {
    const lab = await createLab();
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/terminal`)
      .send({ command: "show ip route", device: "Router-1" });
    expect(res.status).toBe(401);
  });

  test("200 — entry contains id, timestamp, command, output, isError fields", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/terminal`)
      .set(getAuthHeader(user))
      .send({ command: "show version", device: "Router-1" });
    const entry = res.body.data.entry;
    expect(entry).toHaveProperty("entryId");
    expect(entry).toHaveProperty("timestamp");
    expect(entry).toHaveProperty("command");
    expect(entry).toHaveProperty("output");
    expect(entry).toHaveProperty("isError");
  });
});

// ── Objective Completion via terminal commands ────────────────────
describe("POST /api/labs/:id/terminal — objective completion", () => {
  test("running a trigger command completes the linked objective", async () => {
    const user = await createUser();
    const lab = await createFullLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));

    await request(app)
      .post(`/api/labs/${lab.labId}/terminal`)
      .set(getAuthHeader(user))
      .send({ command: "show ip route", device: "Router-1" });

    await new Promise((r) => setTimeout(r, 50));
    const userLab = await UserLab.findOne({ userId: user._id, labId: lab.labId });
    expect(userLab.completedObjectives).toContain(2); // 'show ip route' → objective index 2
  });

  test("running all useful commands → all objectives completed, score = 100", async () => {
    const user = await createUser();
    const lab = await createFullLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));

    const commands = [
      "router ospf 1",       // → objective 0
      "show ip ospf neighbor", // → objective 1
      "show ip route",        // → objective 2
      "ping 192.168.1.1",    // → objective 3
      "show running-config",  // → objective 4
    ];

    for (const cmd of commands) {
      await request(app)
        .post(`/api/labs/${lab.labId}/terminal`)
        .set(getAuthHeader(user))
        .send({ command: cmd, device: "Router-1" });
    }

    await new Promise((r) => setTimeout(r, 80));
    const userLab = await UserLab.findOne({ userId: user._id, labId: lab.labId }).lean();
    expect(userLab.completedObjectives.length).toBe(5);
    expect(userLab.score).toBe(100);
    expect(userLab.progress).toBe(100);
    expect(userLab.status).toBe("completed");
  });

  test("score formula: 2/5 objectives → score = 40", async () => {
    const user = await createUser();
    const lab = await createFullLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));

    await request(app).post(`/api/labs/${lab.labId}/terminal`).set(getAuthHeader(user))
      .send({ command: "show ip ospf neighbor", device: "Router-1" });
    await request(app).post(`/api/labs/${lab.labId}/terminal`).set(getAuthHeader(user))
      .send({ command: "show ip route", device: "Router-1" });

    await new Promise((r) => setTimeout(r, 80));
    const userLab = await UserLab.findOne({ userId: user._id, labId: lab.labId }).lean();
    expect(userLab.completedObjectives.length).toBe(2);
    expect(userLab.score).toBe(40);
  });
});

// ── POST /api/labs/:id/save-progress ─────────────────────────────
describe("POST /api/labs/:id/save-progress", () => {
  test("200 — saves progress correctly", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/save-progress`)
      .set(getAuthHeader(user))
      .send({ progress: 60, score: 60, completedObjectives: [0, 1, 2] });
    expect(res.status).toBe(200);
    expect(res.body.data.lab.progress).toBe(60);
    expect(res.body.data.lab.score).toBe(60);
  });

  test("200 — progress=100 marks lab as completed", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/save-progress`)
      .set(getAuthHeader(user))
      .send({ progress: 100, score: 100, completedObjectives: [0, 1] });
    expect(res.status).toBe(200);
    expect(res.body.data.lab.status).toBe("completed");
  });

  test("400 — no lab instance started", async () => {
    const user = await createUser();
    const lab = await createLab();
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/save-progress`)
      .set(getAuthHeader(user))
      .send({ progress: 100, score: 100 });
    expect(res.status).toBe(400);
  });
});

// ── POST /api/labs/:id/stop ───────────────────────────────────────
describe("POST /api/labs/:id/stop", () => {
  test("200 — stops a running lab (not completed → stopped status)", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/stop`)
      .set(getAuthHeader(user));
    expect(res.status).toBe(200);
    expect(res.body.data.lab.status).toBe("stopped");
  });

  test("200 — lab at 100% progress → status = completed on stop", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    await request(app)
      .post(`/api/labs/${lab.labId}/save-progress`)
      .set(getAuthHeader(user))
      .send({ progress: 100, score: 100 });
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/stop`)
      .set(getAuthHeader(user));
    expect(res.status).toBe(200);
    expect(res.body.data.lab.status).toBe("completed");
  });

  test("400 — stop before start returns error", async () => {
    const user = await createUser();
    const lab = await createLab();
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/stop`)
      .set(getAuthHeader(user));
    expect(res.status).toBe(400);
  });
});

// ── GET /api/labs/:id/objectives ──────────────────────────────────
describe("GET /api/labs/:id/objectives", () => {
  test("200 — returns objectives with completed flag", async () => {
    const user = await createUser();
    const lab = await createFullLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));

    const res = await request(app)
      .get(`/api/labs/${lab.labId}/objectives`)
      .set(getAuthHeader(user));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.objectives)).toBe(true);
    res.body.data.objectives.forEach((obj) => {
      expect(obj).toHaveProperty("index");
      expect(obj).toHaveProperty("text");
      expect(obj).toHaveProperty("completed");
    });
  });

  test("200 — initially all objectives are not completed", async () => {
    const lab = await createFullLab();
    const res = await request(app).get(`/api/labs/${lab.labId}/objectives`);
    expect(res.status).toBe(200);
    expect(res.body.data.objectives.every((o) => !o.completed)).toBe(true);
  });
});

// ── Full lifecycle: start → commands → save-progress → stop ──────
describe("Full lab lifecycle end-to-end", () => {
  test("complete lifecycle: start → run commands → save 100% → stop → achievement unlocked", async () => {
    const user = await createUser();
    const lab = await createFullLab();

    // Seed the "First Steps" achievement so it can be unlocked
    await createAchievement({ achievementId: "ach-1", name: "First Steps", maxProgress: 1 });

    // 1. Start the lab
    const startRes = await request(app)
      .post(`/api/labs/${lab.labId}/start`)
      .set(getAuthHeader(user));
    expect(startRes.status).toBe(200);
    expect(startRes.body.data.lab.status).toBe("running");

    // 2. Run commands covering all objectives
    for (const cmd of lab.commands) {
      const cmdRes = await request(app)
        .post(`/api/labs/${lab.labId}/terminal`)
        .set(getAuthHeader(user))
        .send({ command: cmd, device: "Router-1" });
      expect(cmdRes.status).toBe(200);
      expect(typeof cmdRes.body.data.entry.output).toBe("string");
    }

    // 3. Save progress at 100%
    await new Promise((r) => setTimeout(r, 80));
    const saveRes = await request(app)
      .post(`/api/labs/${lab.labId}/save-progress`)
      .set(getAuthHeader(user))
      .send({ progress: 100, score: 100, completedObjectives: [0, 1, 2, 3, 4] });
    expect(saveRes.status).toBe(200);
    expect(saveRes.body.data.lab.status).toBe("completed");

    // 4. Allow async achievement/leaderboard updates
    await new Promise((r) => setTimeout(r, 150));

    // 5. Verify achievement unlocked
    const ach = await UserAchievement.findOne({ userId: user._id, achievementId: "ach-1" }).lean();
    expect(ach?.unlocked).toBe(true);

    // 6. Verify leaderboard updated (points > 0)
    const lb = await LeaderboardEntry.findOne({ userId: user._id }).lean();
    expect(lb).toBeDefined();
    expect(lb.totalPoints).toBeGreaterThan(0);
    expect(lb.labsCompleted).toBe(1);
  });

  test("multiple labs completed → lab-marathon achievement unlocked at 10", async () => {
    const user = await createUser();
    await createAchievement({ achievementId: "ach-4", name: "Lab Marathon", maxProgress: 10 });

    for (let i = 0; i < 10; i++) {
      const lab = await createLab({ labId: `lab-marathon-${i}-${Date.now()}` });
      await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
      await request(app)
        .post(`/api/labs/${lab.labId}/save-progress`)
        .set(getAuthHeader(user))
        .send({ progress: 100, score: 80 });
    }

    await new Promise((r) => setTimeout(r, 200));
    const ach = await UserAchievement.findOne({ userId: user._id, achievementId: "ach-4" }).lean();
    expect(ach?.unlocked).toBe(true);
  });
});

// ── Terminal response time ────────────────────────────────────────
describe("Terminal endpoint performance", () => {
  test("POST /terminal responds in under 200ms", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));

    const start = Date.now();
    const res = await request(app)
      .post(`/api/labs/${lab.labId}/terminal`)
      .set(getAuthHeader(user))
      .send({ command: "show ip route", device: "Router-1" });
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(200);
  });
});

// ── POST /api/labs/sync-stats ─────────────────────────────────────
describe("POST /api/labs/sync-stats", () => {
  test("200 — syncs user stats and returns labsCompleted", async () => {
    const user = await createUser();
    const lab = await createLab();
    await request(app).post(`/api/labs/${lab.labId}/start`).set(getAuthHeader(user));
    await request(app)
      .post(`/api/labs/${lab.labId}/save-progress`)
      .set(getAuthHeader(user))
      .send({ progress: 100, score: 90 });

    await new Promise((r) => setTimeout(r, 80));
    const res = await request(app)
      .post("/api/labs/sync-stats")
      .set(getAuthHeader(user));
    expect(res.status).toBe(200);
    expect(res.body.data.labsCompleted).toBeGreaterThanOrEqual(1);
  });
});
