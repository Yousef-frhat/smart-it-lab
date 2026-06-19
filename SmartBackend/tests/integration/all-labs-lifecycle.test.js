/**
 * Integration Test: All 46 Labs Lifecycle
 * Tests the complete lifecycle for every lab in the seed data:
 *   POST start → POST terminal (each command) → POST save-progress 100 → POST stop
 * Then verifies achievements and leaderboard updates.
 *
 * Uses mongodb-memory-server (same pattern as labs.lifecycle.test.js).
 */

import { jest } from "@jest/globals";
import request from "supertest";
import app from "../helpers/app.js";
import { connectTestDB, disconnectTestDB, clearCollections } from "../helpers/db.js";
import { createUser, getAuthHeader, createAchievement } from "../helpers/factories.js";
import { LABS } from "../../src/database/seed.js";
import Lab from "../../src/database/schemas/lab.model.js";
import User from "../../src/database/schemas/user.model.js";
import UserSettings from "../../src/database/schemas/user-settings.model.js";
import UserLab from "../../src/database/schemas/user-lab.model.js";
import Achievement from "../../src/database/schemas/achievement.model.js";
import UserAchievement from "../../src/database/schemas/user-achievement.model.js";
import LeaderboardEntry from "../../src/database/schemas/leaderboard.model.js";

jest.mock("../../src/modules/events/events.routes.js", () => ({
  emitLabEvent: jest.fn(),
  default: { get: jest.fn() },
}));

// ── Setup ─────────────────────────────────────────────────────────
beforeAll(async () => {
  await connectTestDB();

  // Seed all 46 labs into the in-memory DB
  for (const lab of LABS) {
    await Lab.findOneAndUpdate({ labId: lab.labId }, lab, { upsert: true, new: true });
  }

  // Seed the "First Steps" achievement so it can be unlocked on first lab completion
  await Achievement.findOneAndUpdate(
    { achievementId: "ach-1" },
    {
      achievementId: "ach-1",
      name: "First Steps",
      description: "Complete your first lab",
      points: 100,
      category: "Lab Completion",
      tier: "bronze",
      maxProgress: 1,
      icon: "🏆",
    },
    { upsert: true, new: true }
  );
});

afterAll(async () => {
  await disconnectTestDB();
});

// ── Tests ─────────────────────────────────────────────────────────
describe("All 46 Labs — Full Lifecycle", () => {
  const successfulLabs = [];
  const failedLabs = [];

  // One test per lab
  LABS.forEach((lab, index) => {
    it(`[${index + 1}/46] ${lab.labId} — ${lab.name}`, async () => {
      // Fresh user per lab so achievements/leaderboard are isolated
      const user = await createUser();

      try {
        // ── Step 1: Start ──────────────────────────────────────────
        const startRes = await request(app)
          .post(`/api/labs/${lab.labId}/start`)
          .set(getAuthHeader(user));

        expect(startRes.status).toBe(200);
        expect(startRes.body.success).toBe(true);
        expect(startRes.body.data.lab.status).toMatch(/running/);

        // ── Step 2: Run every command ──────────────────────────────
        for (const command of lab.commands) {
          const termRes = await request(app)
            .post(`/api/labs/${lab.labId}/terminal`)
            .set(getAuthHeader(user))
            .send({ command, device: "Router-1" });

          // If lab auto-completed (status changed to completed), terminal returns 400
          // That's expected behaviour — just stop sending more commands
          if (termRes.status === 400 && termRes.body.message?.includes("No active lab")) {
            break;
          }

          expect(termRes.status).toBe(200);
          expect(termRes.body.success).toBe(true);
          expect(termRes.body.data.entry).toBeDefined();
          expect(typeof termRes.body.data.entry.output).toBe("string");

          if (termRes.body.data.entry.isError) {
            console.warn(`  ⚠️  ${lab.labId}: command "${command}" returned isError:true`);
          }
        }

        // ── Step 3: Save progress at 100% ─────────────────────────
        // (lab may already be completed if terminal commands triggered auto-complete)
        const saveRes = await request(app)
          .post(`/api/labs/${lab.labId}/save-progress`)
          .set(getAuthHeader(user))
          .send({
            progress: 100,
            score: 100,
            completedObjectives: lab.objectives.map((_, i) => i),
          });

        // 200 = saved, 400 = already completed — both are acceptable
        expect([200, 400]).toContain(saveRes.status);

        // ── Step 4: Stop ───────────────────────────────────────────
        const stopRes = await request(app)
          .post(`/api/labs/${lab.labId}/stop`)
          .set(getAuthHeader(user));

        // 200 = stopped, 400 = already stopped/completed — both acceptable
        expect([200, 400]).toContain(stopRes.status);

        // Allow async achievement/leaderboard side-effects to settle
        await new Promise((r) => setTimeout(r, 100));

        // ── Step 5: Verify at least 1 achievement unlocked ─────────
        const achRes = await request(app)
          .get("/api/achievements")
          .set(getAuthHeader(user));

        expect(achRes.status).toBe(200);
        expect(achRes.body.success).toBe(true);
        const unlocked = achRes.body.data.achievements.filter((a) => a.unlocked);
        expect(unlocked.length).toBeGreaterThan(0);

        // ── Step 6: Verify leaderboard labsCompleted > 0 ──────────
        const lbRes = await request(app)
          .get("/api/leaderboard?period=weekly")
          .set(getAuthHeader(user));

        expect(lbRes.status).toBe(200);
        expect(lbRes.body.success).toBe(true);

        const userEntry = lbRes.body.data.leaderboard.find(
          (e) => e.userId?.toString() === user._id.toString()
        );
        expect(userEntry).toBeDefined();
        expect(userEntry.labsCompleted).toBeGreaterThan(0);

        successfulLabs.push(lab.labId);
      } catch (err) {
        failedLabs.push({ labId: lab.labId, error: err.message });
        throw err;
      } finally {
        // Clean up this user's data so next test is isolated
        await UserLab.deleteMany({ userId: user._id });
        await UserAchievement.deleteMany({ userId: user._id });
        await LeaderboardEntry.deleteMany({ userId: user._id });
        await User.deleteOne({ _id: user._id });
        await UserSettings.deleteOne({ userId: user._id });
      }
    }, 30000); // 30s per lab
  });

  afterAll(() => {
    const total = LABS.length;
    console.log(`\n📊 All-Labs Lifecycle Summary:`);
    console.log(`  ✅ Passed: ${successfulLabs.length}/${total}`);
    console.log(`  ❌ Failed: ${failedLabs.length}/${total}`);
    if (failedLabs.length > 0) {
      console.log(`\n  Failed labs:`);
      failedLabs.forEach((f) => console.log(`    - ${f.labId}: ${f.error}`));
    }
  });
});
