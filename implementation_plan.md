# Smart IT Lab — Full-Stack Integration Plan

## Current State Analysis

### Backend (SmartBackend)
The backend is **minimal and incomplete**. It only has:

| Endpoint | Method | Description | Status |
|---|---|---|---|
| `POST /api/auth/register` | POST | Register user | ✅ Works |
| `POST /api/auth/login` | POST | Login user | ✅ Works |
| `GET /api/users/me` | GET | Get current user (protected) | ✅ Works |

**Critical bugs in `server.js`:**
- `app.use("/api/users", userRoutes)` is placed **before** `cors()`, `helmet()`, and `express.json()` — so the users route has no body parsing, CORS, or security middleware
- Auth routes are registered **after** middleware but User routes are registered before

### Frontend (React + Vite + TailwindCSS)
The frontend is **feature-rich** but uses 100% **mock data / localStorage**:
- `auth-context.tsx` — Hardcoded admin login (`admin@smartitlab.com`/`admin123`), fake user creation
- `lab-service.ts` — All labs are hardcoded MOCK data stored in memory/localStorage
- `admin-service.ts` — All admin users, servers, stats are mock data in localStorage
- No `axios` or `fetch` calls exist anywhere

### Missing Backend Modules
The frontend expects these features that have **zero backend support**:

| Feature | Frontend Page | Backend Support |
|---|---|---|
| Labs CRUD | `my-labs.tsx`, `lab-interface.tsx` | ❌ None |
| Lab instances (start/stop/progress) | `student-dashboard.tsx` | ❌ None |
| Achievements | `achievements.tsx` | ❌ None |
| Leaderboard | `leaderboard.tsx` | ❌ None |
| Admin: User management | `admin-dashboard.tsx` | ❌ None |
| Admin: Platform stats | `admin-dashboard.tsx` | ❌ None |
| Admin: Server monitoring | `admin-dashboard.tsx` | ❌ None |
| User settings/profile update | `settings.tsx` | ❌ None |
| Dashboard stats | `student-dashboard.tsx` | ❌ None |

---

## Proposed Changes

### Phase 1: Fix Backend Bugs & Infrastructure

#### [MODIFY] [server.js](file:///d:/Smart%20It%20Lab/SmartBackend/src/server.js)
- Fix middleware ordering (cors, helmet, json MUST come before routes)
- Configure CORS to allow `http://localhost:5173` (Vite dev server)
- Register all new route modules
- Add global error handler

#### [NEW] [.env](file:///d:/Smart%20It%20Lab/SmartBackend/.env)
- Create `.env` with `MONGO_URI`, `JWT_SECRET`, `PORT`

---

### Phase 2: Complete Backend — New Models

#### [MODIFY] [user.model.js](file:///d:/Smart%20It%20Lab/SmartBackend/src/database/schemas/user.model.js)
- Add fields: `plan`, `status`, `labsCompleted`, `avatar`, `lastActive`

#### [NEW] [lab.model.js](file:///d:/Smart%20It%20Lab/SmartBackend/src/database/schemas/lab.model.js)
- Lab schema: `name`, `description`, `difficulty`, `category`, `estimatedTime`, `objectives`, `topology`, `commands`

#### [NEW] [lab-instance.model.js](file:///d:/Smart%20It%20Lab/SmartBackend/src/database/schemas/lab-instance.model.js)
- Per-user lab sessions: `userId`, `labId`, `status`, `progress`, `score`, `startTime`, `terminalHistory`, `completedObjectives`

#### [NEW] [achievement.model.js](file:///d:/Smart%20It%20Lab/SmartBackend/src/database/schemas/achievement.model.js)
- Achievement definitions + user unlocks

---

### Phase 3: Complete Backend — New API Routes

#### [NEW] Labs Module (`/api/labs`)
- `GET /api/labs` — List all labs
- `GET /api/labs/:id` — Get single lab
- `POST /api/labs` — Create lab (admin)
- `PUT /api/labs/:id` — Update lab (admin)
- `DELETE /api/labs/:id` — Delete lab (admin)

#### [NEW] Lab Instances Module (`/api/lab-instances`)
- `POST /api/lab-instances/start/:labId` — Start a lab
- `POST /api/lab-instances/stop/:labId` — Stop a lab
- `PUT /api/lab-instances/progress/:labId` — Update progress
- `POST /api/lab-instances/command/:labId` — Execute command
- `GET /api/lab-instances/history/:labId` — Get terminal history
- `GET /api/lab-instances/my-labs` — Get all user lab instances

#### [NEW] Admin Module (`/api/admin`)
- `GET /api/admin/users` — List all users (admin)
- `PUT /api/admin/users/:id` — Update user (admin)
- `PUT /api/admin/users/:id/suspend` — Suspend user (admin)
- `PUT /api/admin/users/:id/activate` — Activate user (admin)
- `DELETE /api/admin/users/:id` — Delete user (admin)
- `GET /api/admin/stats` — Platform stats (admin)

#### [NEW] Dashboard Module (`/api/dashboard`)
- `GET /api/dashboard/stats` — Student stats (protected)
- `GET /api/dashboard/leaderboard` — Leaderboard data

#### [NEW] User Settings Endpoints
- `PUT /api/users/profile` — Update profile (name, avatar)
- `PUT /api/users/password` — Change password

#### [NEW] Achievements Module (`/api/achievements`)
- `GET /api/achievements` — List all achievements
- `GET /api/achievements/my` — User's unlocked achievements

#### [NEW] Admin Middleware
- `adminOnly` middleware to restrict admin routes

#### [NEW] Seed Script
- `seed.js` to populate MongoDB with initial lab data

---

### Phase 4: Frontend Integration

#### [NEW] [api.ts](file:///d:/Smart%20It%20Lab/src/app/services/api.ts)
- Axios instance with base URL, JWT interceptor, error handling

#### [MODIFY] [auth-context.tsx](file:///d:/Smart%20It%20Lab/src/app/contexts/auth-context.tsx)
- Replace all mock logic with real API calls (`POST /api/auth/login`, `/register`)
- Store JWT token in localStorage, decode to get user info
- Load user profile from `GET /api/users/me` on app init
- Handle token expiry

#### [MODIFY] [lab-service.ts](file:///d:/Smart%20It%20Lab/src/app/services/lab-service.ts)
- Replace entire mock service with API calls to `/api/labs` and `/api/lab-instances`

#### [MODIFY] [admin-service.ts](file:///d:/Smart%20It%20Lab/src/app/services/admin-service.ts)
- Replace entire mock service with API calls to `/api/admin`

#### [MODIFY] Frontend pages
- `student-dashboard.tsx` — Fetch stats from `/api/dashboard/stats`
- `my-labs.tsx` — Fetch from `/api/labs` + `/api/lab-instances/my-labs`
- `achievements.tsx` — Fetch from `/api/achievements`
- `leaderboard.tsx` — Fetch from `/api/dashboard/leaderboard`
- `admin-dashboard.tsx` — Fetch from `/api/admin/stats`, `/api/admin/users`
- `settings.tsx` — Save via `/api/users/profile`

---

### Phase 5: Install Dependencies

#### Frontend
- Install `axios` for HTTP requests

#### Backend
- `npm install` (already has all needed deps)

---

## User Review Required

> [!IMPORTANT]
> **MongoDB Connection**: You need a working MongoDB instance. The `.env` file will be created with a placeholder `MONGO_URI=mongodb://localhost:27017/smart-it-lab`. Update this with your actual connection string (MongoDB Atlas or local).

> [!IMPORTANT]  
> **JWT Secret**: A random secret will be generated for development. Change it for production.

> [!WARNING]
> This plan replaces **all mock/localStorage data** with real API calls. The frontend will not work without the backend running. You must start the backend with `npm run dev` in the `SmartBackend` folder.

## Open Questions

1. Do you have a **MongoDB Atlas** connection string, or should I configure for local MongoDB (`mongodb://localhost:27017`)?
2. Should the labs be **seeded automatically** on first backend run, or do you want a separate seed command?

## Verification Plan

### Automated Tests
- Start backend: `cd SmartBackend && npm run dev`
- Start frontend: `npm run dev`
- Test auth flow via browser: register → login → dashboard
- Verify CORS headers in browser DevTools
- Test protected routes return 401 without token

### Manual Verification
- Full signup/login flow
- Dashboard loads real user data
- Labs list loads from backend
- Admin panel shows real user management
