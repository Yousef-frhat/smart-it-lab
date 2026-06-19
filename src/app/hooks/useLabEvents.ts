import { useState, useEffect, useRef } from "react";

export interface LabEvent {
  type:
    | "connected"
    | "progress"
    | "objective_complete"
    | "lab_complete"
    | "terminal_output"
    | "ping";
  data: Record<string, any>;
}

/**
 * Hook that subscribes to Server-Sent Events for a specific lab.
 * Automatically reconnects on error after 3 seconds.
 */
export function useLabEvents(labId: string | null) {
  const [lastEvent, setLastEvent] = useState<LabEvent | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!labId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const apiBase =
      import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const url = `${apiBase}/events/lab/${labId}?token=${encodeURIComponent(token)}`;

    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      const es = new EventSource(url);
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed: LabEvent = JSON.parse(event.data);
          if (parsed.type !== "ping") {
            setLastEvent(parsed);
          }
        } catch {
          // ignore malformed events
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        // Reconnect after 3 seconds
        reconnectTimer = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [labId]);

  return { lastEvent };
}
