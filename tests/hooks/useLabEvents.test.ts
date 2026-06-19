/**
 * Unit tests — useLabEvents hook
 *
 * Uses vi.stubGlobal to replace EventSource with a controllable mock.
 * The MockEventSource lets tests fire events manually.
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLabEvents } from "@/app/hooks/useLabEvents";

// ── MockEventSource ───────────────────────────────────────────────
class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  readyState = 0; // CONNECTING
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  /** Fire a message event manually from tests */
  fireMessage(data: unknown) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent("message", { data: JSON.stringify(data) }));
    }
  }

  /** Simulate a connection error */
  fireError() {
    if (this.onerror) {
      this.onerror();
    }
  }

  close() {
    this.closed = true;
    this.readyState = 2; // CLOSED
  }

  static reset() {
    MockEventSource.instances = [];
  }

  static latest(): MockEventSource | undefined {
    return MockEventSource.instances[MockEventSource.instances.length - 1];
  }
}

// ── Setup / teardown ──────────────────────────────────────────────
beforeEach(() => {
  MockEventSource.reset();
  vi.stubGlobal("EventSource", MockEventSource);
  // Stub localStorage
  vi.stubGlobal("localStorage", {
    getItem: vi.fn().mockReturnValue("mock-access-token"),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
  // Stub import.meta.env
  vi.stubGlobal("import", { meta: { env: { VITE_API_URL: "http://localhost:5000/api" } } });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllTimers();
});

// ── Tests ─────────────────────────────────────────────────────────
describe("useLabEvents", () => {
  describe("subscription", () => {
    test("creates an EventSource on mount when labId is provided", () => {
      renderHook(() => useLabEvents("lab-1"));
      expect(MockEventSource.instances).toHaveLength(1);
    });

    test("subscribes to the correct SSE URL", () => {
      renderHook(() => useLabEvents("lab-42"));
      const es = MockEventSource.latest();
      expect(es?.url).toContain("/events/lab/lab-42");
      expect(es?.url).toContain("token=mock-access-token");
    });

    test("does NOT create EventSource when labId is null", () => {
      renderHook(() => useLabEvents(null));
      expect(MockEventSource.instances).toHaveLength(0);
    });

    test("does NOT create EventSource when no access token", () => {
      vi.stubGlobal("localStorage", {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      });
      renderHook(() => useLabEvents("lab-1"));
      expect(MockEventSource.instances).toHaveLength(0);
    });
  });

  describe("message handling", () => {
    test("lastEvent is null initially", () => {
      const { result } = renderHook(() => useLabEvents("lab-1"));
      expect(result.current.lastEvent).toBeNull();
    });

    test("updates lastEvent when a message is received", () => {
      const { result } = renderHook(() => useLabEvents("lab-1"));
      const es = MockEventSource.latest()!;

      act(() => {
        es.fireMessage({ type: "progress", data: { progress: 50 } });
      });

      expect(result.current.lastEvent).toEqual({
        type: "progress",
        data: { progress: 50 },
      });
    });

    test("ignores ping events (does not update lastEvent)", () => {
      const { result } = renderHook(() => useLabEvents("lab-1"));
      const es = MockEventSource.latest()!;

      act(() => {
        es.fireMessage({ type: "ping", data: {} });
      });

      expect(result.current.lastEvent).toBeNull();
    });

    test("updates lastEvent for lab_complete event", () => {
      const { result } = renderHook(() => useLabEvents("lab-1"));
      const es = MockEventSource.latest()!;

      act(() => {
        es.fireMessage({ type: "lab_complete", data: { score: 95 } });
      });

      expect(result.current.lastEvent?.type).toBe("lab_complete");
      expect(result.current.lastEvent?.data.score).toBe(95);
    });

    test("updates lastEvent for objective_complete event", () => {
      const { result } = renderHook(() => useLabEvents("lab-1"));
      const es = MockEventSource.latest()!;

      act(() => {
        es.fireMessage({ type: "objective_complete", data: { objectiveId: 0 } });
      });

      expect(result.current.lastEvent?.type).toBe("objective_complete");
    });

    test("ignores malformed (non-JSON) messages without throwing", () => {
      const { result } = renderHook(() => useLabEvents("lab-1"));
      const es = MockEventSource.latest()!;

      // Manually fire a raw MessageEvent with bad JSON
      act(() => {
        if (es.onmessage) {
          es.onmessage(new MessageEvent("message", { data: "not-json{{" }));
        }
      });

      // Should not throw and lastEvent stays null
      expect(result.current.lastEvent).toBeNull();
    });
  });

  describe("cleanup on unmount", () => {
    test("closes the EventSource when the component unmounts", () => {
      const { unmount } = renderHook(() => useLabEvents("lab-1"));
      const es = MockEventSource.latest()!;

      unmount();

      expect(es.closed).toBe(true);
    });

    test("does not leak EventSource after unmount", () => {
      const { unmount } = renderHook(() => useLabEvents("lab-1"));
      const es = MockEventSource.latest()!;

      unmount();

      // Firing a message after unmount should not update state (no error thrown)
      expect(() => {
        es.fireMessage({ type: "progress", data: {} });
      }).not.toThrow();
    });
  });

  describe("labId changes", () => {
    test("creates a new EventSource when labId changes", () => {
      const { rerender } = renderHook(({ id }) => useLabEvents(id), {
        initialProps: { id: "lab-1" as string | null },
      });

      expect(MockEventSource.instances).toHaveLength(1);

      rerender({ id: "lab-2" });

      // Old one closed, new one created
      expect(MockEventSource.instances).toHaveLength(2);
      expect(MockEventSource.instances[0].closed).toBe(true);
    });

    test("closes EventSource when labId changes to null", () => {
      const { rerender } = renderHook(({ id }) => useLabEvents(id), {
        initialProps: { id: "lab-1" as string | null },
      });

      const es = MockEventSource.latest()!;
      rerender({ id: null });

      expect(es.closed).toBe(true);
    });
  });
});
