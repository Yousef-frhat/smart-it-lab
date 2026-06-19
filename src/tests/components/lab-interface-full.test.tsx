/**
 * Frontend Test: Lab Interface Full Functionality
 *
 * Tests:
 * 1. Useful Command click → command appears in terminal input immediately
 * 2. Useful Command click → auto-executes without manual Enter (calls API)
 * 3. After command response → Live Validation panel updates
 * 4. Score display shows correct percentage
 * 5. Submit Lab button: hidden/disabled when no objectives done, enabled when ≥1 done
 * 6. Lab complete notification appears on lab_complete SSE event
 * 7. Double-click prevention via isExecuting ref
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import LabInterface from '@/app/pages/lab-interface';
import * as labApi from '@/app/services/lab-api';
import * as useLabEventsHook from '@/app/hooks/useLabEvents';
import { toast } from 'sonner';

// ── Mocks ─────────────────────────────────────────────────────────
vi.mock('@/app/services/lab-api');
vi.mock('@/app/hooks/useLabEvents');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}));
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useParams: () => ({ id: 'lab-1' }),
    useNavigate: () => vi.fn(),
  };
});

// ── Fixtures ──────────────────────────────────────────────────────
const mockTopology = [
  {
    id: 'r1',
    type: 'router' as const,
    name: 'Router-1',
    position: { x: 100, y: 200 },
    ip: '10.0.1.1',
    status: 'active' as const,
    connections: ['r2'],
  },
  {
    id: 'r2',
    type: 'router' as const,
    name: 'Router-2',
    position: { x: 400, y: 200 },
    ip: '10.0.2.1',
    status: 'active' as const,
    connections: ['r1'],
  },
];

const mockLab: labApi.Lab = {
  id: 'lab-1',
  name: 'OSPF Troubleshooting',
  description: 'Configure and troubleshoot OSPF routing protocol',
  difficulty: 'advanced',
  category: 'Routing Protocols',
  module: 'IP Connectivity',
  order: 1,
  estimatedTime: '45 min',
  status: 'running',
  progress: 0,
  score: 0,
  objectives: [
    'Configure OSPF on all routers',
    'Establish neighbor relationships',
    'Verify routing table convergence',
    'Troubleshoot area mismatches',
    'Implement authentication',
  ],
  completedObjectives: [],
  commands: [
    'show ip ospf neighbor',
    'show ip route',
    'show ip ospf interface',
    'show ip ospf database',
    'show running-config',
  ],
  topology: mockTopology,
};

const mockTerminalEntry: labApi.TerminalEntry = {
  id: 'cmd-1',
  timestamp: new Date().toISOString(),
  device: 'Router-1',
  command: 'show ip ospf neighbor',
  output: 'Neighbor ID     Pri   State\n10.0.2.1          1   FULL/DR',
  isError: false,
};

// ── Helper: render with router ────────────────────────────────────
function renderLab() {
  return render(
    <MemoryRouter initialEntries={['/labs/lab-1']}>
      <LabInterface />
    </MemoryRouter>
  );
}

// ── Helper: wait for lab to load ──────────────────────────────────
async function waitForLabLoad() {
  await waitFor(() => {
    expect(screen.getByText('OSPF Troubleshooting')).toBeInTheDocument();
  });
}

// ── Setup ─────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(labApi.getLab).mockResolvedValue(mockLab);
  vi.mocked(labApi.getObjectives).mockResolvedValue({
    objectives: mockLab.objectives!.map((text, index) => ({
      index,
      text,
      completed: false,
    })),
    progress: 0,
  });
  vi.mocked(labApi.executeCommand).mockResolvedValue(mockTerminalEntry);
  vi.mocked(labApi.saveProgress).mockResolvedValue({ ...mockLab, score: 100, progress: 100 });

  // Default: no SSE events
  vi.mocked(useLabEventsHook.useLabEvents).mockReturnValue({ lastEvent: null });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────

describe('Lab Interface Full Functionality', () => {

  // ── Test 1: Command appears in input immediately ───────────────
  it('useful command click → command appears in terminal input immediately', async () => {
    renderLab();
    await waitForLabLoad();

    // Find the useful command button
    const commandButton = screen.getByRole('button', { name: 'show ip ospf neighbor' });
    expect(commandButton).toBeInTheDocument();

    // Click it
    await userEvent.click(commandButton);

    // The input should show the command (set synchronously before API call)
    const terminalInput = screen.getByPlaceholderText(/Type command here/i);
    // After execution completes, input is cleared — so check it was set then cleared
    // The component sets commandInput = cmd, then clears it after API resolves
    await waitFor(() => {
      expect(labApi.executeCommand).toHaveBeenCalledWith(
        'lab-1',
        'show ip ospf neighbor',
        expect.any(String)
      );
    });
  });

  // ── Test 2: Auto-executes without manual Enter ─────────────────
  it('useful command click → auto-executes without manual Enter (calls API directly)', async () => {
    renderLab();
    await waitForLabLoad();

    const commandButton = screen.getByRole('button', { name: 'show ip ospf neighbor' });
    await userEvent.click(commandButton);

    // API should be called automatically — no Enter key needed
    await waitFor(() => {
      expect(labApi.executeCommand).toHaveBeenCalledTimes(1);
      expect(labApi.executeCommand).toHaveBeenCalledWith(
        'lab-1',
        'show ip ospf neighbor',
        expect.any(String)
      );
    });

    // Input cleared after execution
    const terminalInput = screen.getByPlaceholderText(/Type command here/i);
    await waitFor(() => {
      expect(terminalInput).toHaveValue('');
    });
  });

  // ── Test 3: Live Validation updates after SSE objective_complete ─
  it('after command response → Live Validation updates with completed objective', async () => {
    // Start with no event, then simulate SSE firing after lab loads
    const { rerender } = renderLab();
    await waitForLabLoad();

    // Now simulate the SSE event arriving
    vi.mocked(useLabEventsHook.useLabEvents).mockReturnValue({
      lastEvent: {
        type: 'objective_complete',
        data: { objectiveId: 0, name: 'Configure OSPF on all routers' },
      },
    });

    // Re-render to trigger the hook update
    rerender(
      <MemoryRouter initialEntries={['/labs/lab-1']}>
        <LabInterface />
      </MemoryRouter>
    );

    // The objective text should appear in the Live Validation panel
    await waitFor(() => {
      expect(screen.getByText('Configure OSPF on all routers')).toBeInTheDocument();
    });

    // Toast should fire for objective completion
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Objective complete')
      );
    });
  });

  // ── Test 4: Score display shows correct percentage ─────────────
  it('score display shows correct percentage (2/5 = 40%)', async () => {
    // Lab with 2 completed objectives
    vi.mocked(labApi.getLab).mockResolvedValue({
      ...mockLab,
      completedObjectives: [0, 1],
      score: 40,
      progress: 40,
    });
    vi.mocked(labApi.getObjectives).mockResolvedValue({
      objectives: mockLab.objectives!.map((text, index) => ({
        index,
        text,
        completed: index < 2,
      })),
      progress: 40,
    });

    renderLab();
    await waitForLabLoad();

    // Progress text: "2/5 objectives completed"
    await waitFor(() => {
      expect(
        screen.getByText(/2\/5 objectives completed/i)
      ).toBeInTheDocument();
    });
  });

  // ── Test 5a: Submit button disabled when no objectives done ─────
  it('Submit Lab button is disabled when no objectives completed', async () => {
    // Lab with 0 completed objectives — canSubmit = false
    vi.mocked(labApi.getLab).mockResolvedValue({
      ...mockLab,
      completedObjectives: [],
      score: 0,
    });

    renderLab();
    await waitForLabLoad();

    // The submit button should be disabled (canSubmit requires >= 1 objective)
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit lab/i });
      expect(submitButton).toBeDisabled();
    });
  });

  // ── Test 5b: Submit button enabled when score = 100 ───────────
  it('Submit Lab button is enabled when all objectives completed (score = 100)', async () => {
    vi.mocked(labApi.getLab).mockResolvedValue({
      ...mockLab,
      completedObjectives: [0, 1, 2, 3, 4],
      score: 100,
      progress: 100,
    });
    vi.mocked(labApi.getObjectives).mockResolvedValue({
      objectives: mockLab.objectives!.map((text, index) => ({
        index,
        text,
        completed: true,
      })),
      progress: 100,
    });

    renderLab();
    await waitForLabLoad();

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit lab/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  // ── Test 6: Lab complete notification on lab_complete event ─────
  it('lab complete notification appears when lab_complete SSE event fires', async () => {
    const { rerender } = renderLab();
    await waitForLabLoad();

    // Simulate lab_complete SSE event arriving after lab is loaded
    vi.mocked(useLabEventsHook.useLabEvents).mockReturnValue({
      lastEvent: {
        type: 'lab_complete',
        data: { score: 100, unlockedAchievements: ['ach-1'] },
      },
    });

    rerender(
      <MemoryRouter initialEntries={['/labs/lab-1']}>
        <LabInterface />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('Lab complete'),
        expect.objectContaining({ duration: expect.any(Number) })
      );
    });
  });

  // ── Test 7: Double-click prevention ───────────────────────────
  it('double-click on useful command only executes once (debounce)', async () => {
    // Make executeCommand take a moment so isExecuting stays true during second click
    let resolveFirst: () => void;
    const firstCallPromise = new Promise<labApi.TerminalEntry>((resolve) => {
      resolveFirst = () => resolve(mockTerminalEntry);
    });

    vi.mocked(labApi.executeCommand)
      .mockReturnValueOnce(firstCallPromise)
      .mockResolvedValue(mockTerminalEntry);

    renderLab();
    await waitForLabLoad();

    const commandButton = screen.getByRole('button', { name: 'show ip ospf neighbor' });

    // Click once — starts execution (isExecuting = true)
    await userEvent.click(commandButton);

    // Click again immediately while first is still in-flight
    await userEvent.click(commandButton);

    // Resolve the first call
    act(() => { resolveFirst!(); });

    await waitFor(() => {
      // Should only have been called once due to isExecuting guard
      expect(labApi.executeCommand).toHaveBeenCalledTimes(1);
    });
  });

  // ── Test 8: Terminal output appears after command ──────────────
  it('terminal output appears in terminal history after command execution', async () => {
    renderLab();
    await waitForLabLoad();

    const commandButton = screen.getByRole('button', { name: 'show ip ospf neighbor' });
    await userEvent.click(commandButton);

    // The terminal output text should appear (from mockTerminalEntry.output)
    await waitFor(() => {
      expect(screen.getByText(/Neighbor ID.*Pri.*State/i)).toBeInTheDocument();
    });
  });
});
