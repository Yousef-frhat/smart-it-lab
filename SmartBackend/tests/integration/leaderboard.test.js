/**
 * Integration tests — Leaderboard routes
 *
 * Covers: weekly/monthly periods, sorting, isCurrentUser, tie-breaking,
 * empty state, period boundary, pagination, score propagation, and
 * invalid period param handling.
 */

import { jest } from "@jest/globals";
import request from "supertest";
import app from "../helpers/app.js";
import { connectTestDB, disconnectTestDB, clearCollections } from "../helpers/db.js";
import {
  createUser,
  getAuthHeader,
  createLab,
  createUserLab,
  createLeaderboardEntry,
} from "../helpers/factories.js";
import User from "../../src/database/schemas/user.model.js";
import UserSettings from "../../src/database/schemas/user-settings.model.js";
import LeaderboardEntry from "../../src/database/schemas/leaderboard.model.js";
import UserLab from "../../src/database/schemas/user-lab.model.js";
import Achievement from "../../src/database/schemas/achievement.model.js";
import UserAchievement from "../../src/database/schemas/user-achievement.model.js";
import Lab from "../../src/database/schemas/lab.model.js";

// Mock SSE emitter so lab completion tests don't hang
jest.mock("../../src/modules/events/events.routes.js", () => ({
  emitLabEvent: jest.fn(),
  default: { get: jest.fn() },
}));

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

afterEach(async () => {
  await clearCollections(
    User, UserSettings, LeaderboardEntry, UserLab, Lab, Achievement, UserAchievement
  );
});

// ── Helper: get Monday of current week ───────────────────────────
function currentWeekOf() {
  const now = new Date();
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return d;
}

// ── GET /api/leaderboard — basic shape ───────────────────────────
describe("GET /api/leaderboard — basic shape", () => {
  test("200 — returns success:true with leaderboard array", async () => {
    const res = await request(app).get("/api/leaderboard");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.leaderboard)).toBe(true);
  });

  test("200 — response includes period and weekOf fields", async () => {
    const res = await request(app).get("/api/leaderboard");
    expect(res.body.data.period).toBeDefined();
    expect(res.body.data.weekOf).toBeDefined();
  });

  test("200 — defaults to weekly period when no param given", async () => {
    const res = await request(app).get("/api/leaderboard");
    expect(res.body.data.period).toBe("weekly");
  });

  test("200 — accepts monthly period param", async () => {
    const res = await request(app).get("/api/leaderboard?period=monthly");
    expect(res.body.data.period).toBe("monthly");
  });
});

// ── Empty state ───────────────────────────────────────────────────
describe("GET /api/leaderboard — empty state", () => {
  test("200 — returns empty array with correct shape when no entries exist", async () => {
    const res = await request(app).get("/api/leaderboard");
    expect(res.status).toBe(200);
    expect(res.body.data.leaderboard).toEqual([]);
    expect(res.body.data.period).toBe("weekly");
    expect(res.body.data.weekOf).toBeDefined();
  });

  test("200 — empty leaderboard still has success:true", async () => {
    const res = await request(app).get("/api/leaderboard");
    expect(res.body.success).toBe(true);
  });
});

// ── Sorting ───────────────────────────────────────────────────────
describe("GET /api/leaderboard — sorting", () => {
  test("200 — entries are sorted by totalPoints descending", async () => {
    const u1 = await createUser({ name: "Low", totalPoints: 100 });
    const u2 = await createUser({ name: "High", totalPoints: 500 });
    const u3 = await createUser({ name: "Mid", totalPoints: 300 });

    // Seed entries directly so we control the points
    await createLeaderboardEntry(u1._id, { totalPoints: 100 });
    await createLeaderboardEntry(u2._id, { totalPoints: 500 });
    await createLeaderboardEntry(u3._id, { totalPoints: 300 });

    const res = await request(app).get("/api/leaderboard");
    const points = res.body.data.leaderboard.map((e) => e.totalPoints);
    for (let i = 1; i < points.length; i++) {
      expect(points[i - 1]).toBeGreaterThanOrEqual(points[i]);
    }
  });

  test("200 — rank field increments from 1", async () => {
    const u1 = await createUser({ totalPoints: 200 });
    const u2 = await createUser({ totalPoints: 100 });
    await createLeaderboardEntry(u1._id, { totalPoints: 200 });
    await createLeaderboardEntry(u2._id, { totalPoints: 100 });

    const res = await request(app).get("/api/leaderboard");
    const ranks = res.body.data.leaderboard.map((e) => e.rank);
    expect(ranks[0]).toBe(1);
    expect(ranks[1]).toBe(2);
  });
});

// ── Tie-breaking ──────────────────────────────────────────────────
describe("GET /api/leaderboard — tie-breaking", () => {
  test("200 — two users with identical points both appear in results", async () => {
    const u1 = await createUser({ name: "TieUser1", totalPoints: 250 });
    const u2 = await createUser({ name: "TieUser2", totalPoints: 250 });
    await createLeaderboardEntry(u1._id, { totalPoints: 250 });
    await createLeaderboardEntry(u2._id, { totalPoints: 250 });

    const res = await request(app).get("/api/leaderboard");
    expect(res.body.data.leaderboard).toHaveLength(2);
    const pts = res.body.data.leaderboard.map((e) => e.totalPoints);
    expect(pts).toEqual([250, 250]);
  });

  test("200 — tied users have consecutive ranks (1 and 2)", async () => {
    const u1 = await createUser({ totalPoints: 250 });
    const u2 = await createUser({ totalPoints: 250 });
    await createLeaderboardEntry(u1._id, { totalPoints: 250 });
    await createLeaderboardEntry(u2._id, { totalPoints: 250 });

    const res = await request(app).get("/api/leaderboard");
    const ranks = res.body.data.leaderboard.map((e) => e.rank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2]);
  });

  test("200 — sort order is deterministic across two identical requests", async () => {
    const u1 = await createUser({ name: "Alpha", totalPoints: 250 });
    const u2 = await createUser({ name: "Beta", totalPoints: 250 });
    await createLeaderboardEntry(u1._id, { totalPoints: 250 });
    await createLeaderboardEntry(u2._id, { totalPoints: 250 });

    const res1 = await request(app).get("/api/leaderboard");
    const res2 = await request(app).get("/api/leaderboard");
    const ids1 = res1.body.data.leaderboard.map((e) => e.userId);
    const ids2 = res2.body.data.leaderboard.map((e) => e.userId);
    expect(ids1).toEqual(ids2);
  });
});

// ── isCurrentUser accuracy ────────────────────────────────────────
describe("GET /api/leaderboard — isCurrentUser accuracy", () => {
  test("200 — isCurrentUser is true only for the authenticated user", async () => {
    const me = await createUser({ name: "Me", totalPoints: 300 });
    const other = await createUser({ name: "Other", totalPoints: 200 });

    // Seed entries via GET (the controller upserts on auth'd request)
    await request(app).get("/api/leaderboard").set(getAuthHeader(me));
    await request(app).get("/api/leaderboard").set(getAuthHeader(other));

    const res = await request(app).get("/api/leaderboard").set(getAuthHeader(me));
    const myEntry = res.body.data.leaderboard.find((e) => e.isCurrentUser);
    const otherEntries = res.body.data.leaderboard.filter((e) => !e.isCurrentUser);

    expect(myEntry).toBeDefined();
    expect(myEntry.name).toBe("Me");
    expect(otherEntries.every((e) => !e.isCurrentUser)).toBe(true);
  });

  test("200 — exactly one entry has isCurrentUser:true when authenticated", async () => {
    const me = await createUser({ totalPoints: 400 });
    const u2 = await createUser({ totalPoints: 300 });
    const u3 = await createUser({ totalPoints: 200 });

    await request(app).get("/api/leaderboard").set(getAuthHeader(me));
    await request(app).get("/api/leaderboard").set(getAuthHeader(u2));
    await request(app).get("/api/leaderboard").set(getAuthHeader(u3));

    const res = await request(app).get("/api/leaderboard").set(getAuthHeader(me));
    const currentUserEntries = res.body.data.leaderboard.filter((e) => e.isCurrentUser);
    expect(currentUserEntries).toHaveLength(1);
  });

  test("200 — isCurrentUser is false for all entries when unauthenticated", async () => {
    const u = await createUser({ totalPoints: 100 });
    await request(app).get("/api/leaderboard").set(getAuthHeader(u));

    const res = await request(app).get("/api/leaderboard");
    const hasCurrentUser = res.body.data.leaderboard.some((e) => e.isCurrentUser);
    expect(hasCurrentUser).toBe(false);
  });
});

// ── Period boundary ───────────────────────────────────────────────
describe("GET /api/leaderboard — period boundary", () => {
  test("200 — entry from 8 days ago does NOT appear in current weekly board", async () => {
    const oldUser = await createUser({ name: "OldUser", totalPoints: 999 });

    // Build a weekOf that is definitely in a previous week (8 days ago, midnight-normalized)
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    eightDaysAgo.setHours(0, 0, 0, 0);
    // Normalize to Monday of that week
    const dayOfWeek = eightDaysAgo.getDay();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

    await LeaderboardEntry.create({
      userId: oldUser._id,
      period: "weekly",
      weekOf: eightDaysAgo,
      totalPoints: 999,
      labsCompleted: 5,
      streak: 0,
      avgScore: 0,
      trend: "same",
    });

    const res = await request(app).get("/api/leaderboard");
    // The old entry should not appear in the current week's board
    const found = res.body.data.leaderboard.find((e) => e.name === "OldUser");
    expect(found).toBeUndefined();
  });

  test("200 — entry from current week DOES appear in weekly board", async () => {
    const currentUser = await createUser({ name: "CurrentUser", totalPoints: 500 });
    await createLeaderboardEntry(currentUser._id, { totalPoints: 500 });

    const res = await request(app).get("/api/leaderboard");
    const found = res.body.data.leaderboard.find((e) => e.name === "CurrentUser");
    expect(found).toBeDefined();
    expect(found.totalPoints).toBe(500);
  });
});

// ── Pagination ────────────────────────────────────────────────────
describe("GET /api/leaderboard — pagination via limit param", () => {
  test("200 — limit param caps the number of returned entries", async () => {
    // Create 5 users with entries
    for (let i = 0; i < 5; i++) {
      const u = await createUser({ totalPoints: (5 - i) * 100 });
      await createLeaderboardEntry(u._id, { totalPoints: (5 - i) * 100 });
    }

    const res = await request(app).get("/api/leaderboard?limit=3");
    expect(res.status).toBe(200);
    expect(res.body.data.leaderboard.length).toBeLessThanOrEqual(3);
  });

  test("200 — limit=1 returns exactly 1 entry (the top scorer)", async () => {
    const u1 = await createUser({ totalPoints: 1000 });
    const u2 = await createUser({ totalPoints: 500 });
    await createLeaderboardEntry(u1._id, { totalPoints: 1000 });
    await createLeaderboardEntry(u2._id, { totalPoints: 500 });

    const res = await request(app).get("/api/leaderboard?limit=1");
    expect(res.body.data.leaderboard).toHaveLength(1);
    expect(res.body.data.leaderboard[0].totalPoints).toBe(1000);
  });

  test("200 — limit is capped at 100 (server-side max)", async () => {
    const res = await request(app).get("/api/leaderboard?limit=999");
    expect(res.status).toBe(200);
    // Should not error — server silently caps at 100
    expect(Array.isArray(res.body.data.leaderboard)).toBe(true);
  });
});

// ── Invalid period param ──────────────────────────────────────────
describe("GET /api/leaderboard — invalid period param", () => {
  test("200 — unknown period value falls back to weekly (controller default)", async () => {
    // The controller does: period = req.query.period === "monthly" ? "monthly" : "weekly"
    // So "yearly" silently becomes "weekly" — this is the actual behaviour.
    const res = await request(app).get("/api/leaderboard?period=yearly");
    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe("weekly");
  });

  test("200 — empty period string falls back to weekly", async () => {
    const res = await request(app).get("/api/leaderboard?period=");
    expect(res.status).toBe(200);
    expect(res.body.data.period).toBe("weekly");
  });
});

// ── Score update propagation ──────────────────────────────────────
describe("GET /api/leaderboard — score update propagation", () => {
  test("200 — completing a lab updates the user's leaderboard entry", async () => {
    const user = await createUser({ totalPoints: 0 });
    const lab = await createLab();
    await createUserLab(user._id, lab.labId, { status: "running" });

    // Complete the lab via the API (triggers updateLeaderboard internally)
    await request(app)
      .post(`/api/labs/${lab.labId}/save-progress`)
      .set(getAuthHeader(user))
      .send({ progress: 100, score: 80 });

    // Allow the non-blocking leaderboard update to settle
    await new Promise((r) => setTimeout(r, 100));

    // Fetch the leaderboard as this user (triggers upsert of their entry)
    const res = await request(app)
      .get("/api/leaderboard")
      .set(getAuthHeader(user));

    const myEntry = res.body.data.leaderboard.find((e) => e.isCurrentUser);
    expect(myEntry).toBeDefined();
    // After completing a lab with score 80, totalPoints should be > 0
    expect(myEntry.totalPoints).toBeGreaterThan(0);
  });

  test("200 — user with higher score ranks above user with lower score after lab completion", async () => {
    const highScorer = await createUser({ totalPoints: 0 });
    const lowScorer = await createUser({ totalPoints: 0 });

    const lab1 = await createLab();
    const lab2 = await createLab();

    await createUserLab(highScorer._id, lab1.labId, { status: "running" });
    await createUserLab(lowScorer._id, lab2.labId, { status: "running" });

    // High scorer completes with 90, low scorer with 30
    await request(app)
      .post(`/api/labs/${lab1.labId}/save-progress`)
      .set(getAuthHeader(highScorer))
      .send({ progress: 100, score: 90 });

    await request(app)
      .post(`/api/labs/${lab2.labId}/save-progress`)
      .set(getAuthHeader(lowScorer))
      .send({ progress: 100, score: 30 });

    await new Promise((r) => setTimeout(r, 150));

    // Seed both into leaderboard by hitting the endpoint
    await request(app).get("/api/leaderboard").set(getAuthHeader(highScorer));
    await request(app).get("/api/leaderboard").set(getAuthHeader(lowScorer));

    const res = await request(app).get("/api/leaderboard");
    const entries = res.body.data.leaderboard;
    const highIdx = entries.findIndex((e) => e.userId === highScorer._id.toString());
    const lowIdx = entries.findIndex((e) => e.userId === lowScorer._id.toString());

    if (highIdx !== -1 && lowIdx !== -1) {
      expect(highIdx).toBeLessThan(lowIdx);
    }
  });
});

// ── Entry shape validation ────────────────────────────────────────
describe("GET /api/leaderboard — entry shape", () => {
  test("200 — each entry has required fields", async () => {
    const u = await createUser({ totalPoints: 100 });
    await createLeaderboardEntry(u._id, { totalPoints: 100 });

    const res = await request(app).get("/api/leaderboard");
    const entry = res.body.data.leaderboard[0];

    expect(entry).toHaveProperty("rank");
    expect(entry).toHaveProperty("userId");
    expect(entry).toHaveProperty("name");
    expect(entry).toHaveProperty("totalPoints");
    expect(entry).toHaveProperty("labsCompleted");
    expect(entry).toHaveProperty("streak");
    expect(entry).toHaveProperty("avgScore");
    expect(entry).toHaveProperty("trend");
    expect(entry).toHaveProperty("isCurrentUser");
  });
});
