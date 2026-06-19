/**
 * Integration tests — SSE endpoint (GET /api/events/lab/:id)
 *
 * Uses Node's built-in http module (not EventSource — Node doesn't have it).
 * Each test opens a real HTTP connection, collects data, then destroys it.
 */

import { jest } from "@jest/globals";
import http from "http";
import request from "supertest";
import app from "../helpers/app.js";
import { connectTestDB, disconnectTestDB, clearCollections } from "../helpers/db.js";
import { createUser, createLab, getAuthHeader } from "../helpers/factories.js";
import User from "../../src/database/schemas/user.model.js";
import UserSettings from "../../src/database/schemas/user-settings.model.js";
import Lab from "../../src/database/schemas/lab.model.js";
import UserLab from "../../src/database/schemas/user-lab.model.js";
import { generateAccessToken } from "../../src/common/utils/token.js";

let server;
let serverPort;

beforeAll(async () => {
  await connectTestDB();
  // Start a real HTTP server so we can use http.get for SSE
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      serverPort = server.address().port;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await disconnectTestDB();
});

afterEach(async () => {
  await clearCollections(User, UserSettings, Lab, UserLab);
});

/**
 * Open an SSE connection using Node's http.get.
 * Returns a promise that resolves with { statusCode, headers, chunks }
 * after `timeoutMs` ms or when the connection is destroyed.
 */
function openSSE(path, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let resolved = false;

    const req = http.get(
      {
        hostname: "127.0.0.1",
        port: serverPort,
        path,
        headers: { Accept: "text/event-stream" },
      },
      (res) => {
        const { statusCode, headers } = res;

        res.on("data", (chunk) => {
          chunks.push(chunk.toString());
        });

        res.on("error", (err) => {
          if (!resolved) {
            resolved = true;
            reject(err);
          }
        });

        // Resolve after timeout with whatever we've collected
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            req.destroy();
            resolve({ statusCode, headers, chunks });
          }
        }, timeoutMs);
      }
    );

    req.on("error", (err) => {
      // ECONNRESET is expected when we destroy the request — ignore it
      if (err.code !== "ECONNRESET" && !resolved) {
        resolved = true;
        reject(err);
      }
    });
  });
}

// ── SSE endpoint tests ────────────────────────────────────────────
describe("GET /api/events/lab/:id — SSE stream", () => {
  test("401 — missing token returns JSON error, not SSE stream", async () => {
    const lab = await createLab();
    const res = await request(app).get(`/api/events/lab/${lab.labId}`);
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/token/i);
  });

  test("401 — invalid token returns JSON error", async () => {
    const lab = await createLab();
    const res = await request(app).get(
      `/api/events/lab/${lab.labId}?token=invalid.jwt.token`
    );
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("200 — valid token opens SSE stream with correct headers", async () => {
    const user = await createUser();
    const lab = await createLab();
    const token = generateAccessToken(user);

    const { statusCode, headers } = await openSSE(
      `/api/events/lab/${lab.labId}?token=${encodeURIComponent(token)}`,
      2000
    );

    expect(statusCode).toBe(200);
    expect(headers["content-type"]).toMatch(/text\/event-stream/);
    expect(headers["cache-control"]).toMatch(/no-cache/);
    expect(headers["connection"]).toMatch(/keep-alive/i);
  });

  test("200 — receives at least one data: line within timeout", async () => {
    const user = await createUser();
    const lab = await createLab();
    const token = generateAccessToken(user);

    const { chunks } = await openSSE(
      `/api/events/lab/${lab.labId}?token=${encodeURIComponent(token)}`,
      2000
    );

    const fullText = chunks.join("");
    expect(fullText).toMatch(/^data:/m);
  });

  test("200 — first event is the 'connected' event with labId", async () => {
    const user = await createUser();
    const lab = await createLab();
    const token = generateAccessToken(user);

    const { chunks } = await openSSE(
      `/api/events/lab/${lab.labId}?token=${encodeURIComponent(token)}`,
      2000
    );

    const fullText = chunks.join("");
    // Parse the first data line
    const firstDataLine = fullText.split("\n").find((l) => l.startsWith("data:"));
    expect(firstDataLine).toBeDefined();

    const parsed = JSON.parse(firstDataLine.replace("data: ", ""));
    expect(parsed.type).toBe("connected");
    expect(parsed.data.labId).toBe(lab.labId);
  });

  test("200 — X-Accel-Buffering header is set to 'no' (nginx SSE support)", async () => {
    const user = await createUser();
    const lab = await createLab();
    const token = generateAccessToken(user);

    const { headers } = await openSSE(
      `/api/events/lab/${lab.labId}?token=${encodeURIComponent(token)}`,
      2000
    );

    expect(headers["x-accel-buffering"]).toBe("no");
  });

  test("200 — SSE stream works for a lab that has been started", async () => {
    const user = await createUser();
    const lab = await createLab();
    const token = generateAccessToken(user);

    // Start the lab first
    await request(app)
      .post(`/api/labs/${lab.labId}/start`)
      .set(getAuthHeader(user));

    const { statusCode, chunks } = await openSSE(
      `/api/events/lab/${lab.labId}?token=${encodeURIComponent(token)}`,
      2000
    );

    expect(statusCode).toBe(200);
    const fullText = chunks.join("");
    expect(fullText).toMatch(/^data:/m);
  });
});
