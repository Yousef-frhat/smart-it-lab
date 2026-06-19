import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Smart IT Lab API",
    version: "1.0.0",
    description:
      "REST API for Smart IT Lab — a B2B SaaS EdTech platform for IT lab management and learning. Provides authentication, lab management, achievements, leaderboard, admin analytics, and user settings.",
    contact: { name: "Smart IT Lab Team" },
  },
  servers: [{ url: "/api", description: "API base path" }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT access token",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "664a1f..." },
          name: { type: "string", example: "Ahmed Hassan" },
          email: { type: "string", example: "ahmed@university.edu" },
          role: { type: "string", enum: ["student", "admin", "instructor"] },
          plan: { type: "string", enum: ["free", "pro", "enterprise"] },
          avatar: { type: "string" },
          status: { type: "string", enum: ["active", "inactive", "suspended"] },
          labsCompleted: { type: "number" },
          totalPoints: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Lab: {
        type: "object",
        properties: {
          id: { type: "string", example: "lab-1" },
          name: { type: "string", example: "OSPF Troubleshooting" },
          description: { type: "string" },
          difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          category: { type: "string" },
          estimatedTime: { type: "string", example: "45 min" },
          status: { type: "string", enum: ["not-started", "running", "stopped", "completed"] },
          progress: { type: "number" },
          score: { type: "number" },
          objectives: { type: "array", items: { type: "string" } },
          topology: { type: "array", items: { type: "object" } },
        },
      },
      Achievement: {
        type: "object",
        properties: {
          achievementId: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          points: { type: "number" },
          category: { type: "string" },
          tier: { type: "string", enum: ["bronze", "silver", "gold", "platinum"] },
          unlocked: { type: "boolean" },
          progress: { type: "number" },
          maxProgress: { type: "number" },
        },
      },
      LeaderboardEntry: {
        type: "object",
        properties: {
          rank: { type: "number" },
          name: { type: "string" },
          points: { type: "number" },
          labsCompleted: { type: "number" },
          isCurrentUser: { type: "boolean" },
        },
      },
      ServerMetric: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "string", enum: ["web", "database", "cache", "lab-vm"] },
          status: { type: "string", enum: ["healthy", "warning", "critical", "offline"] },
          cpu: { type: "number" },
          memory: { type: "number" },
          disk: { type: "number" },
          uptime: { type: "number" },
          location: { type: "string" },
        },
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    // ── Auth ──────────────────────────────────────────
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Ahmed Hassan" },
                  email: { type: "string", example: "ahmed@university.edu" },
                  password: { type: "string", example: "securePass123" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Registration successful" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
          403: { description: "Account suspended" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout current user",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Logged out" } },
      },
    },
    "/auth/refresh-token": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token using httpOnly cookie",
        responses: {
          200: { description: "New access token issued" },
          401: { description: "Invalid refresh token" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Current user data" },
          401: { description: "Not authenticated" },
        },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify email with token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { token: { type: "string" } },
              },
            },
          },
        },
        responses: {
          200: { description: "Email verified" },
          400: { description: "Invalid or expired token" },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request a password reset email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { email: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "Reset email sent (if account exists)" } },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password with token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password reset successful" },
          400: { description: "Invalid or expired token" },
        },
      },
    },
    // ── Labs ──────────────────────────────────────────
    "/labs": {
      get: {
        tags: ["Labs"],
        summary: "List all published labs",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "difficulty", schema: { type: "string" } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "search", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Array of labs" } },
      },
    },
    "/labs/{id}": {
      get: {
        tags: ["Labs"],
        summary: "Get a single lab by ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Lab details" },
          404: { description: "Lab not found" },
        },
      },
    },
    "/labs/{id}/start": {
      post: {
        tags: ["Labs"],
        summary: "Start a lab session",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Lab started" } },
      },
    },
    "/labs/{id}/stop": {
      post: {
        tags: ["Labs"],
        summary: "Stop a running lab",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Lab stopped" } },
      },
    },
    "/labs/{id}/save-progress": {
      post: {
        tags: ["Labs"],
        summary: "Save lab progress and score",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  progress: { type: "number" },
                  score: { type: "number" },
                  completedObjectives: { type: "array", items: { type: "number" } },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Progress saved" } },
      },
    },
    "/labs/{id}/terminal": {
      post: {
        tags: ["Labs"],
        summary: "Execute a terminal command in a lab",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["command", "device"],
                properties: {
                  command: { type: "string", example: "show ip route" },
                  device: { type: "string", example: "Router-1" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Command output" } },
      },
    },
    "/labs/{id}/objectives": {
      get: {
        tags: ["Labs"],
        summary: "Get lab objectives with completion status",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Objectives list" } },
      },
    },
    // ── Achievements ─────────────────────────────────
    "/achievements": {
      get: {
        tags: ["Achievements"],
        summary: "Get all achievements with user progress",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Achievements list" } },
      },
    },
    "/achievements/{id}/unlock": {
      post: {
        tags: ["Achievements"],
        summary: "Unlock an achievement",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Achievement unlocked" } },
      },
    },
    // ── Leaderboard ──────────────────────────────────
    "/leaderboard": {
      get: {
        tags: ["Leaderboard"],
        summary: "Get the leaderboard rankings",
        responses: { 200: { description: "Leaderboard entries" } },
      },
    },
    // ── Users (Admin) ────────────────────────────────
    "/users": {
      get: {
        tags: ["Users (Admin)"],
        summary: "List all users (admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "role", schema: { type: "string" } },
          { in: "query", name: "plan", schema: { type: "string" } },
          { in: "query", name: "status", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Users list" }, 403: { description: "Forbidden" } },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users (Admin)"],
        summary: "Get user by ID",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User data" } },
      },
      patch: {
        tags: ["Users (Admin)"],
        summary: "Update a user",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User updated" } },
      },
      delete: {
        tags: ["Users (Admin)"],
        summary: "Delete a user",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User deleted" } },
      },
    },
    "/users/{id}/suspend": {
      patch: {
        tags: ["Users (Admin)"],
        summary: "Suspend a user",
        security: [{ BearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "User suspended" } },
      },
    },
    // ── Admin Analytics ──────────────────────────────
    "/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Get platform statistics",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Platform stats" } },
      },
    },
    "/admin/servers": {
      get: {
        tags: ["Admin"],
        summary: "Get server metrics",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Server metrics" } },
      },
    },
    "/admin/activity": {
      get: {
        tags: ["Admin"],
        summary: "Get recent platform activity",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Activity feed" } },
      },
    },
    // ── Settings ─────────────────────────────────────
    "/settings": {
      get: {
        tags: ["Settings"],
        summary: "Get user settings",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "User settings" } },
      },
      patch: {
        tags: ["Settings"],
        summary: "Update user settings",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Settings updated" } },
      },
    },
    "/settings/profile": {
      patch: {
        tags: ["Settings"],
        summary: "Update user profile (name, avatar)",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Profile updated" } },
      },
    },
    "/settings/password": {
      patch: {
        tags: ["Settings"],
        summary: "Change password",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password changed" },
          401: { description: "Current password incorrect" },
        },
      },
    },
    "/settings/avatar": {
      patch: {
        tags: ["Settings"],
        summary: "Upload avatar image",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  avatar: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Avatar updated" } },
      },
    },
    "/settings/account": {
      delete: {
        tags: ["Settings"],
        summary: "Permanently delete account",
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: "Account deleted" } },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [], // All paths defined inline above
});
