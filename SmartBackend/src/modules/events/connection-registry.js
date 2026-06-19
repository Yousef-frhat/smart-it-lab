/**
 * connection-registry.js
 *
 * Single source of truth for all SSE lab connections.
 * Currently in-memory (Map). To scale horizontally:
 * replace the Map with Redis pub/sub — no other files need to change.
 */

const labConnections = new Map(); // labId → Set<Response>

export function registerConnection(labId, res) {
  if (!labConnections.has(labId)) {
    labConnections.set(labId, new Set());
  }
  labConnections.get(labId).add(res);
}

export function removeConnection(labId, res) {
  const clients = labConnections.get(labId);
  if (!clients) return;
  clients.delete(res);
  if (clients.size === 0) labConnections.delete(labId);
}

export function emitLabEvent(labId, eventType, data) {
  const clients = labConnections.get(labId) ?? new Set();
  if (clients.size === 0) {
    console.log(`[SSEEmitter] No connections for lab "${labId}" — event "${eventType}" dropped`);
    return;
  }
  console.log(`[SSEEmitter] "${eventType}" → ${clients.size} client(s):`, JSON.stringify(data));
  const payload = `data: ${JSON.stringify({ type: eventType, data })}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      // Client disconnected mid-write — clean up silently
      removeConnection(labId, res);
    }
  }
}

// For debugging / health checks
export function getConnectionCount(labId) {
  return labConnections.get(labId)?.size ?? 0;
}
