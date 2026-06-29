/**
 * Unit tests — admin-api service
 *
 * Covers CRUD functions, normalizeAdminUser, and formatRelativeTime.
 * The api module is mocked so no real requests are made.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";

// ── Mock the api module ──────────────────────────────────────────
vi.mock("@/app/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "@/app/services/api";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  suspendUser,
  getAdminStats,
  getServers,
  getActivity,
} from "@/app/services/admin-api";

const mockedApi = vi.mocked(api);

beforeEach(() => {
  vi.clearAllMocks();
});

// ── getUsers ────────────────────────────────────────────────────
describe("getUsers", () => {
  test("calls GET /users and normalizes user data", async () => {
    const rawUser = {
      _id: "u-1",
      name: "Alice",
      email: "alice@test.com",
      role: "student",
      plan: "pro",
      status: "active",
      labsCompleted: 5,
      lastActive: "2025-01-01",
      createdAt: "2024-01-01",
    };
    mockedApi.get.mockResolvedValue({
      data: {
        data: {
          users: [rawUser],
          pagination: { page: 1, limit: 20, total: 1, pages: 1 },
        },
      },
    });

    const result = await getUsers({ search: "alice" });

    expect(mockedApi.get).toHaveBeenCalledWith("/users", {
      params: { search: "alice" },
    });
    expect(result.users).toHaveLength(1);
    expect(result.users[0].id).toBe("u-1");
    expect(result.users[0].name).toBe("Alice");
  });

  test("returns empty users when data.data is missing", async () => {
    mockedApi.get.mockResolvedValue({ data: {} });

    const result = await getUsers();

    expect(result.users).toEqual([]);
    expect(result.pagination.total).toBe(0);
  });

  test("normalizes user with labStats.labsCompleted", async () => {
    const rawUser = {
      _id: "u-2",
      name: "Bob",
      email: "bob@test.com",
      labStats: { labsCompleted: 10 },
    };
    mockedApi.get.mockResolvedValue({
      data: { data: { users: [rawUser], pagination: { page: 1, limit: 20, total: 1, pages: 1 } } },
    });

    const result = await getUsers();
    expect(result.users[0].labsCompleted).toBe(10);
  });

  test("normalizes user with isActive=false to suspended status", async () => {
    const rawUser = {
      _id: "u-3",
      name: "Carol",
      email: "carol@test.com",
      isActive: false,
    };
    mockedApi.get.mockResolvedValue({
      data: { data: { users: [rawUser], pagination: { page: 1, limit: 20, total: 1, pages: 1 } } },
    });

    const result = await getUsers();
    expect(result.users[0].status).toBe("suspended");
  });
});

// ── getUserById ─────────────────────────────────────────────────
describe("getUserById", () => {
  test("calls GET /users/:id and returns normalized user", async () => {
    const rawUser = { _id: "u-1", name: "Alice", email: "a@t.com" };
    mockedApi.get.mockResolvedValue({ data: { data: { user: rawUser } } });

    const result = await getUserById("u-1");

    expect(mockedApi.get).toHaveBeenCalledWith("/users/u-1");
    expect(result.id).toBe("u-1");
  });
});

// ── updateUser ──────────────────────────────────────────────────
describe("updateUser", () => {
  test("calls PATCH /users/:id with updates", async () => {
    const rawUser = { _id: "u-1", name: "Alice Updated", email: "a@t.com" };
    mockedApi.patch.mockResolvedValue({ data: { data: { user: rawUser } } });

    const result = await updateUser("u-1", { name: "Alice Updated" });

    expect(mockedApi.patch).toHaveBeenCalledWith("/users/u-1", {
      name: "Alice Updated",
    });
    expect(result.name).toBe("Alice Updated");
  });
});

// ── deleteUser ──────────────────────────────────────────────────
describe("deleteUser", () => {
  test("calls DELETE /users/:id", async () => {
    mockedApi.delete.mockResolvedValue({});

    await deleteUser("u-1");

    expect(mockedApi.delete).toHaveBeenCalledWith("/users/u-1");
  });
});

// ── suspendUser ─────────────────────────────────────────────────
describe("suspendUser", () => {
  test("calls PATCH /users/:id/suspend", async () => {
    const rawUser = { _id: "u-1", name: "Alice", email: "a@t.com", status: "suspended" };
    mockedApi.patch.mockResolvedValue({ data: { data: { user: rawUser } } });

    const result = await suspendUser("u-1");

    expect(mockedApi.patch).toHaveBeenCalledWith("/users/u-1/suspend");
    expect(result.status).toBe("suspended");
  });
});

// ── getAdminStats ───────────────────────────────────────────────
describe("getAdminStats", () => {
  test("calls GET /admin/stats and returns stats", async () => {
    const stats = {
      totalUsers: 100,
      activeUsers: 50,
      totalLabs: 20,
      runningLabs: 5,
      totalRevenue: 10000,
      monthlyRevenue: 2000,
      avgCompletionRate: 75,
      avgSessionTime: 45,
    };
    mockedApi.get.mockResolvedValue({ data: { data: { stats } } });

    const result = await getAdminStats();

    expect(mockedApi.get).toHaveBeenCalledWith("/admin/stats");
    expect(result.totalUsers).toBe(100);
    expect(result.avgCompletionRate).toBe(75);
  });

  test("provides defaults for missing fields", async () => {
    mockedApi.get.mockResolvedValue({ data: { data: { stats: {} } } });

    const result = await getAdminStats();

    expect(result.totalUsers).toBe(0);
    expect(result.activeUsers).toBe(0);
    expect(result.totalLabs).toBe(0);
    expect(result.totalRevenue).toBe(0);
  });

  test("falls back to data.stats when data.data is absent", async () => {
    mockedApi.get.mockResolvedValue({
      data: { stats: { totalUsers: 42 } },
    });

    const result = await getAdminStats();
    expect(result.totalUsers).toBe(42);
  });
});

// ── getServers ──────────────────────────────────────────────────
describe("getServers", () => {
  test("normalizes server data from response", async () => {
    const rawServer = {
      serverId: "s-1",
      name: "Web Server",
      type: "web",
      status: "healthy",
      cpu: 45,
      memory: 60,
      disk: 30,
      uptime: 99,
      location: "US-East",
    };
    mockedApi.get.mockResolvedValue({
      data: { data: { servers: [rawServer] } },
    });

    const result = await getServers();

    expect(mockedApi.get).toHaveBeenCalledWith("/admin/servers");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("s-1");
    expect(result[0].name).toBe("Web Server");
    expect(result[0].cpu).toBe(45);
  });

  test("provides defaults for missing server fields", async () => {
    mockedApi.get.mockResolvedValue({
      data: { data: { servers: [{}] } },
    });

    const result = await getServers();

    expect(result[0].id).toBe("");
    expect(result[0].name).toBe("");
    expect(result[0].cpu).toBe(0);
  });
});

// ── getActivity ─────────────────────────────────────────────────
describe("getActivity", () => {
  test("normalizes activity data and formats relative time", async () => {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60000).toISOString();
    const rawActivity = {
      _id: "a-1",
      user: "Alice",
      action: "completed lab",
      time: twoMinutesAgo,
      email: "a@t.com",
    };
    mockedApi.get.mockResolvedValue({
      data: { data: { activity: [rawActivity] } },
    });

    const result = await getActivity();

    expect(mockedApi.get).toHaveBeenCalledWith("/admin/activity");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("a-1");
    expect(result[0].user).toBe("Alice");
    expect(result[0].time).toBe("2 minutes ago");
  });

  test("formats 'Just now' for very recent activity", async () => {
    const justNow = new Date().toISOString();
    mockedApi.get.mockResolvedValue({
      data: { data: { activity: [{ _id: "a-2", user: "Bob", action: "login", time: justNow }] } },
    });

    const result = await getActivity();
    expect(result[0].time).toBe("Just now");
  });

  test("formats hours ago correctly", async () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    mockedApi.get.mockResolvedValue({
      data: { data: { activity: [{ _id: "a-3", user: "Carol", action: "signup", time: threeHoursAgo }] } },
    });

    const result = await getActivity();
    expect(result[0].time).toBe("3 hours ago");
  });

  test("formats days ago correctly", async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    mockedApi.get.mockResolvedValue({
      data: { data: { activity: [{ _id: "a-4", user: "Dave", action: "lab", time: twoDaysAgo }] } },
    });

    const result = await getActivity();
    expect(result[0].time).toBe("2 days ago");
  });

  test("formats singular units correctly", async () => {
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    mockedApi.get.mockResolvedValue({
      data: { data: { activity: [{ _id: "a-5", user: "Eve", action: "edit", time: oneMinuteAgo }] } },
    });

    const result = await getActivity();
    expect(result[0].time).toBe("1 minute ago");
  });
});
