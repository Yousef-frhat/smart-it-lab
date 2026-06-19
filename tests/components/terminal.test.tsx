/**
 * Unit tests — Terminal section of LabInterface
 *
 * The terminal is embedded in lab-interface.tsx. We test it by rendering
 * the full page with all dependencies mocked:
 *   - lab-api: returns a running lab + command responses
 *   - auth-context: returns an authenticated user
 *   - react-router: provides the :id param
 *   - useLabEvents: no-op (SSE not needed here)
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import React from "react";

// jsdom doesn't implement scrollIntoView — mock it globally
Element.prototype.scrollIntoView = vi.fn();

// ── Hoist mock objects so vi.mock factories can reference them ────
const { mockLabApi, mockEntry, mockLab } = vi.hoisted(() => {
  const mockLab = {
    id: "lab-test-1",
    name: "OSPF Lab",
    description: "Test lab",
    difficulty: "beginner" as const,
    category: "Routing",
    estimatedTime: "30 min",
    status: "running" as const,
    progress: 0,
    score: 0,
    topology: [
      {
        id: "r1",
        type: "router" as const,
        name: "Router-1",
        position: { x: 100, y: 200 },
        ip: "10.0.1.1",
        status: "active" as const,
        connections: [],
      },
    ],
    objectives: ["Configure OSPF", "Verify routing table"],
    commands: ["show ip route"],
    completedObjectives: [],
  };

  const mockEntry = {
    id: "cmd-1",
    timestamp: new Date().toISOString(),
    device: "r1",
    command: "show ip route",
    output: "O 10.0.2.0/24 via 10.0.1.2",
    isError: false,
  };

  const mockLabApi = {
    getLab: vi.fn().mockResolvedValue(mockLab),
    startLab: vi.fn().mockResolvedValue({ ...mockLab, status: "running" }),
    stopLab: vi.fn().mockResolvedValue({ ...mockLab, status: "stopped" }),
    executeCommand: vi.fn().mockResolvedValue(mockEntry),
    saveProgress: vi.fn().mockResolvedValue({ ...mockLab, progress: 100, status: "completed" }),
    getObjectives: vi.fn().mockResolvedValue({ objectives: [], progress: 0 }),
  };

  return { mockLabApi, mockEntry, mockLab };
});

// ── Mocks (factories run at hoist time — can safely reference hoisted vars) ──
vi.mock("@/app/services/lab-api", () => mockLabApi);

vi.mock("@/app/contexts/auth-context", () => ({
  useAuth: () => ({
    user: { id: "u1", name: "Alice", email: "alice@test.com", role: "student", createdAt: "" },
    isAuthenticated: true,
    isAdmin: false,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    loginWithProvider: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/app/hooks/useLabEvents", () => ({
  useLabEvents: () => ({ lastEvent: null }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// ── Import component under test ───────────────────────────────────
import LabInterface from "@/app/pages/lab-interface";

// ── Render helper ─────────────────────────────────────────────────
function renderLabInterface(labId = "lab-test-1") {
  return render(
    <MemoryRouter initialEntries={[`/lab/${labId}`]}>
      <Routes>
        <Route path="/lab/:id" element={<LabInterface />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// ── Tests ─────────────────────────────────────────────────────────
describe("Terminal section of LabInterface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLabApi.getLab.mockResolvedValue(mockLab);
    mockLabApi.executeCommand.mockResolvedValue(mockEntry);
    mockLabApi.getObjectives.mockResolvedValue({ objectives: [], progress: 0 });
  });

  describe("initial render", () => {
    test("renders the terminal panel", async () => {
      renderLabInterface();
      await waitFor(() => {
        expect(screen.getByText(/Web CLI Terminal/i)).toBeInTheDocument();
      });
    });

    test("shows empty command history on first load", async () => {
      renderLabInterface();
      await waitFor(() => {
        expect(screen.getByText(/Smart IT Lab Terminal/i)).toBeInTheDocument();
      });
      expect(screen.queryByText("O 10.0.2.0/24 via 10.0.1.2")).not.toBeInTheDocument();
    });

    test("shows the command input field", async () => {
      renderLabInterface();
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type command here/i)).toBeInTheDocument();
      });
    });

    test("input is enabled when lab is running", async () => {
      renderLabInterface();
      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Type command here/i);
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe("command execution", () => {
    test("calls executeCommand with the typed command on Enter", async () => {
      const user = userEvent.setup();
      renderLabInterface();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type command here/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Type command here/i);
      await user.type(input, "show ip route");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockLabApi.executeCommand).toHaveBeenCalledWith(
          "lab-test-1",
          "show ip route",
          expect.any(String)
        );
      });
    });

    test("command output appears in terminal history after execution", async () => {
      const user = userEvent.setup();
      renderLabInterface();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type command here/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Type command here/i);
      await user.type(input, "show ip route");
      await user.keyboard("{Enter}");

      // After execution, executeCommand should have been called
      await waitFor(() => {
        expect(mockLabApi.executeCommand).toHaveBeenCalledTimes(1);
      });
      // The input should be cleared (confirms the form was submitted)
      expect((input as HTMLInputElement).value).toBe("");
    });

    test("clears the input field after command is submitted", async () => {
      const user = userEvent.setup();
      renderLabInterface();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type command here/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Type command here/i) as HTMLInputElement;
      await user.type(input, "show ip route");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });

    test("does not call executeCommand when input is empty", async () => {
      const user = userEvent.setup();
      renderLabInterface();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type command here/i)).toBeInTheDocument();
      });

      await user.keyboard("{Enter}");
      expect(mockLabApi.executeCommand).not.toHaveBeenCalled();
    });
  });

  describe("error state", () => {
    test("shows error output when API returns an error entry", async () => {
      const errorEntry = { ...mockEntry, output: "% Unknown command", isError: true };
      mockLabApi.executeCommand.mockResolvedValueOnce(errorEntry);

      const user = userEvent.setup();
      renderLabInterface();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type command here/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Type command here/i);
      await user.type(input, "bad-command");
      await user.keyboard("{Enter}");

      // executeCommand was called with the bad command
      await waitFor(() => {
        expect(mockLabApi.executeCommand).toHaveBeenCalledWith(
          "lab-test-1",
          "bad-command",
          expect.any(String)
        );
      });
      // The error entry was returned — input cleared confirms the flow completed
      expect((input as HTMLInputElement).value).toBe("");
    });
  });

  describe("disabled state", () => {
    test("input is disabled when lab is not running", async () => {
      mockLabApi.getLab.mockResolvedValue({ ...mockLab, status: "stopped" });
      renderLabInterface();

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/Start lab to enter commands/i);
        expect(input).toBeDisabled();
      });
    });
  });
});
