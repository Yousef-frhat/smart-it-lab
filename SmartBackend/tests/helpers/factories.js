/**
 * Test data factories — create consistent, isolated test fixtures.
 */

process.env.JWT_SECRET = "test_access_secret_min_32_chars_long";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret_min_32_chars_long";
process.env.NODE_ENV = "test";

import User from "../../src/database/schemas/user.model.js";
import UserSettings from "../../src/database/schemas/user-settings.model.js";
import Lab from "../../src/database/schemas/lab.model.js";
import Achievement from "../../src/database/schemas/achievement.model.js";
import UserLab from "../../src/database/schemas/user-lab.model.js";
import LeaderboardEntry from "../../src/database/schemas/leaderboard.model.js";
import { generateAccessToken } from "../../src/common/utils/token.js";

export async function createUser(overrides = {}) {
  const user = await User.create({
    name: "Test User",
    email: `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: "Password123",
    role: "student",
    plan: "free",
    isActive: true,
    status: "active",
    totalPoints: 0,
    labsCompleted: 0,
    streak: 0,
    ...overrides,
  });
  await UserSettings.create({ userId: user._id });
  return user;
}

export async function createAdmin(overrides = {}) {
  return createUser({
    role: "admin",
    email: `admin-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    ...overrides,
  });
}

export function getAuthHeader(user) {
  const token = generateAccessToken(user);
  return { Authorization: `Bearer ${token}` };
}

export async function createLab(overrides = {}) {
  return Lab.create({
    labId: `lab-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "Test Lab",
    description: "A test lab for unit testing",
    difficulty: "beginner",
    category: "Routing Protocols",
    estimatedTime: "30 min",
    topology: [
      {
        nodeId: "r1",
        type: "router",
        name: "Router-1",
        position: { x: 100, y: 200 },
        ip: "10.0.1.1",
        status: "active",
        connections: [],
      },
    ],
    objectives: ["Configure OSPF", "Verify routing table"],
    commands: ["show ip route"],
    isPublished: true,
    ...overrides,
  });
}

export async function createAchievement(overrides = {}) {
  return Achievement.create({
    achievementId: `ach-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "Test Achievement",
    description: "Complete a test",
    points: 100,
    category: "Lab Completion",
    tier: "bronze",
    maxProgress: 1,
    icon: "🏆",
    ...overrides,
  });
}

export async function createUserLab(userId, labId, overrides = {}) {
  return UserLab.create({
    userId,
    labId,
    status: "not-started",
    progress: 0,
    score: 0,
    completedObjectives: [],
    commandHistory: [],
    ...overrides,
  });
}

/**
 * Directly insert a leaderboard entry for a user in the current period.
 * Bypasses the HTTP layer — useful for setting up leaderboard state in tests.
 */
/**
 * Compute weekOf the same way the leaderboard controller does (midnight-normalized).
 */
function getControllerWeekOf(period = "weekly") {
  const now = new Date();
  if (period === "weekly") {
    // Must match the controller's getPeriodStart exactly (UTC-based)
    const day = now.getUTCDay(); // 0=Sun
    const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1); // adjust to Monday
    const d = new Date(now);
    d.setUTCDate(diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function createLeaderboardEntry(userId, overrides = {}) {
  const period = overrides.period || "weekly";
  const weekOf = overrides.weekOf !== undefined ? overrides.weekOf : getControllerWeekOf(period);

  return LeaderboardEntry.create({
    userId,
    period,
    weekOf,
    totalPoints: 0,
    labsCompleted: 0,
    streak: 0,
    avgScore: 0,
    trend: "same",
    ...overrides,
    // Ensure weekOf is not overwritten by spread if we computed it above
    weekOf,
  });
}
