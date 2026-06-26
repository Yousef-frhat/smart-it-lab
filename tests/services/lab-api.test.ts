/**
 * Unit tests — lab-api service
 *
 * Mocks the axios-based `api` client so no real HTTP requests are made.
 * Tests verify that each function calls the correct endpoint and
 * normalizes the response payload correctly.
 */

import { describe, test, expect, vi, beforeEach } from "vitest";

// ── Mock the api module ──────────────────────────────────────────
vi.mock("@/app/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import api from "@/app/services/api";
import {
  getLabs,
  getLab,
  startLab,
  stopLab,
  saveProgress,
  executeCommand,
  getObjectives,
} from "@/app/services/lab-api";

const mockedApi = vi.mocked(api);

beforeEach(() => {
  vi.clearAllMocks();
});

// ── getLabs ──────────────────────────────────────────────────────
describe("getLabs", () => {
  test("calls GET /labs and returns labs from data.data.labs", async () => {
    const labs = [{ id: "1", name: "Lab 1" }];
    mockedApi.get.mockResolvedValue({ data: { data: { labs } } });

    const result = await getLabs();

    expect(mockedApi.get).toHaveBeenCalledWith("/labs");
    expect(result).toEqual(labs);
  });

  test("falls back to data.labs when data.data is absent", async () => {
    const labs = [{ id: "2", name: "Lab 2" }];
    mockedApi.get.mockResolvedValue({ data: { labs } });

    const result = await getLabs();
    expect(result).toEqual(labs);
  });

  test("returns empty array when response has no labs", async () => {
    mockedApi.get.mockResolvedValue({ data: {} });
    const result = await getLabs();
    expect(result).toEqual([]);
  });
});

// ── getLab ───────────────────────────────────────────────────────
describe("getLab", () => {
  test("calls GET /labs/:id and returns lab from data.data.lab", async () => {
    const lab = { id: "lab-1", name: "OSPF Lab" };
    mockedApi.get.mockResolvedValue({ data: { data: { lab } } });

    const result = await getLab("lab-1");

    expect(mockedApi.get).toHaveBeenCalledWith("/labs/lab-1");
    expect(result).toEqual(lab);
  });

  test("falls back to data.lab", async () => {
    const lab = { id: "lab-2", name: "VLAN Lab" };
    mockedApi.get.mockResolvedValue({ data: { lab } });

    const result = await getLab("lab-2");
    expect(result).toEqual(lab);
  });
});

// ── startLab ────────────────────────────────────────────────────
describe("startLab", () => {
  test("calls POST /labs/:id/start and returns lab", async () => {
    const lab = { id: "lab-1", status: "running" };
    mockedApi.post.mockResolvedValue({ data: { data: { lab } } });

    const result = await startLab("lab-1");

    expect(mockedApi.post).toHaveBeenCalledWith("/labs/lab-1/start");
    expect(result).toEqual(lab);
  });
});

// ── stopLab ─────────────────────────────────────────────────────
describe("stopLab", () => {
  test("calls POST /labs/:id/stop and returns lab", async () => {
    const lab = { id: "lab-1", status: "stopped" };
    mockedApi.post.mockResolvedValue({ data: { data: { lab } } });

    const result = await stopLab("lab-1");

    expect(mockedApi.post).toHaveBeenCalledWith("/labs/lab-1/stop");
    expect(result).toEqual(lab);
  });
});

// ── saveProgress ────────────────────────────────────────────────
describe("saveProgress", () => {
  test("sends progress in body and returns lab", async () => {
    const lab = { id: "lab-1", progress: 50 };
    mockedApi.post.mockResolvedValue({ data: { data: { lab } } });

    const result = await saveProgress("lab-1", 50);

    expect(mockedApi.post).toHaveBeenCalledWith("/labs/lab-1/save-progress", {
      progress: 50,
    });
    expect(result).toEqual(lab);
  });

  test("includes optional score and completedObjectives", async () => {
    const lab = { id: "lab-1", progress: 80, score: 75 };
    mockedApi.post.mockResolvedValue({ data: { data: { lab } } });

    await saveProgress("lab-1", 80, 75, [0, 1, 2]);

    expect(mockedApi.post).toHaveBeenCalledWith("/labs/lab-1/save-progress", {
      progress: 80,
      score: 75,
      completedObjectives: [0, 1, 2],
    });
  });
});

// ── executeCommand ──────────────────────────────────────────────
describe("executeCommand", () => {
  test("calls POST /labs/:id/terminal and normalizes response", async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        data: {
          entry: {
            entryId: "e-1",
            timestamp: "2025-01-01T00:00:00Z",
            device: "Router-1",
            command: "show ip route",
            output: "10.0.0.0/24",
            isError: false,
            prompt: "R1>",
          },
          prompt: "R1>",
          progress: 40,
          score: 40,
          completedObjectives: [0, 1],
          newlyCompleted: [1],
          labCompleted: false,
        },
      },
    });

    const result = await executeCommand("lab-1", "show ip route", "Router-1");

    expect(mockedApi.post).toHaveBeenCalledWith("/labs/lab-1/terminal", {
      command: "show ip route",
      device: "Router-1",
    });
    expect(result.entry.id).toBe("e-1");
    expect(result.entry.output).toBe("10.0.0.0/24");
    expect(result.progress).toBe(40);
    expect(result.score).toBe(40);
    expect(result.completedObjectives).toEqual([0, 1]);
    expect(result.newlyCompleted).toEqual([1]);
    expect(result.labCompleted).toBe(false);
  });

  test("provides defaults for missing response fields", async () => {
    mockedApi.post.mockResolvedValue({
      data: {
        data: {
          entry: {
            command: "ping",
          },
        },
      },
    });

    const result = await executeCommand("lab-1", "ping", "R1");

    expect(result.entry.output).toBe("");
    expect(result.entry.isError).toBe(false);
    expect(result.entry.device).toBe("R1");
    expect(result.nextPrompt).toBe("R1>");
    expect(result.progress).toBe(0);
    expect(result.score).toBe(0);
    expect(result.completedObjectives).toEqual([]);
    expect(result.newlyCompleted).toEqual([]);
    expect(result.labCompleted).toBe(false);
  });
});

// ── getObjectives ───────────────────────────────────────────────
describe("getObjectives", () => {
  test("calls GET /labs/:id/objectives and returns objectives + progress", async () => {
    const objectives = [
      { index: 0, text: "Configure OSPF", completed: true },
      { index: 1, text: "Verify routes", completed: false },
    ];
    mockedApi.get.mockResolvedValue({
      data: { data: { objectives, progress: 50 } },
    });

    const result = await getObjectives("lab-1");

    expect(mockedApi.get).toHaveBeenCalledWith("/labs/lab-1/objectives");
    expect(result.objectives).toEqual(objectives);
    expect(result.progress).toBe(50);
  });

  test("returns empty when data.data is missing", async () => {
    mockedApi.get.mockResolvedValue({ data: {} });

    const result = await getObjectives("lab-1");

    expect(result.objectives).toEqual([]);
    expect(result.progress).toBe(0);
  });
});
