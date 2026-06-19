# Development Workflow

## Running the Project Locally

### Prerequisites
- Node.js 20+
- A MongoDB instance (Atlas URI or local `mongod`)
- Copy `SmartBackend/.env.example` → `SmartBackend/.env` and fill in the required values

### Start the backend
```
cd SmartBackend
npm install
npm run dev        # nodemon watches src/server.js, restarts on change
```
Backend runs at `http://localhost:5000`
Swagger docs at `http://localhost:5000/api/docs`

### Seed the database (first run)
```
cd SmartBackend
npm run seed       # populates labs, achievements, and a default admin user
```
Run this once after the database is empty. Re-running is safe (uses upserts).

### Start the frontend
```
# from project root (Smart It Lab/)
npm install
npm run dev        # Vite dev server
```
Frontend runs at `http://localhost:3000` (or the port Vite assigns).
Set `VITE_API_URL=http://localhost:5000/api` in a root `.env` file if needed (defaults to that value already).

---

## Production Build

### Docker Compose (recommended)
```
docker-compose up --build
```
- Frontend: `http://localhost:3000` (nginx serving the built SPA)
- Backend: `http://localhost:5000`
- MongoDB: internal container, data persisted in `mongo_data` volume

Set `JWT_SECRET` and `JWT_REFRESH_SECRET` via environment or a `.env` file at the project root before running in production.

### Manual build
```
# Frontend
npm run build      # outputs to dist/

# Backend
cd SmartBackend
npm start          # node src/server.js (no nodemon)
```

---

## CI Pipeline (GitHub Actions)

Defined in `.github/workflows/ci.yml`. Runs on push to `main`/`develop` and on PRs to `main`.

| Job | What it does |
|---|---|
| `backend-lint` | `node --check src/server.js` — syntax validation only |
| `frontend-build` | `npm ci && npm run build` with `VITE_API_URL=http://localhost:5000/api` |

No tests run in CI yet. Adding a test job is the next CI priority.

---

## Adding a New Backend Feature

1. Create the module folder: `SmartBackend/src/modules/<feature>/`
2. Add `<feature>.validation.js` with Zod schemas for any request bodies
3. Add `controllers/<feature>.controller.js` with exported async handler functions
4. Add `<feature>.routes.js` wiring routes → middleware → controller
5. Register the router in `server.js`:
   ```js
   import featureRoutes from './modules/<feature>/<feature>.routes.js';
   app.use('/api/<feature>', featureRoutes);
   ```
6. If a new collection is needed, add a model in `database/schemas/<name>.model.js`

---

## Adding a New Frontend Page

1. Create `src/app/pages/<page-name>.tsx`
2. Add the route in `src/app/routes.tsx` — wrap with `<ProtectedRoute>` and `<DashboardLayout>` as needed
3. If the page needs API calls, add typed functions to an existing service file or create `src/app/services/<domain>-api.ts`
4. Add a nav link in `dashboard-layout.tsx` if it's a dashboard section

---

## Auth Flow Reference

```
Register / Login
  → POST /api/auth/register or /login
  → Response: { accessToken } + httpOnly refreshToken cookie
  → Frontend: localStorage.setItem('accessToken', ...)
  → AuthContext: setUser(normalizeUser(payload.user))

Session restore (on app load)
  → AuthContext useEffect checks localStorage for accessToken
  → GET /api/auth/me (Axios interceptor attaches Bearer token)
  → Sets user state; applies saved theme

Token expiry (401 response)
  → Axios response interceptor catches 401
  → POST /api/auth/refresh-token (sends httpOnly cookie automatically)
  → New accessToken stored; original request retried
  → If refresh also fails → localStorage cleared → redirect to /auth

OAuth (GitHub / Google)
  → loginWithProvider() redirects browser to /api/auth/github or /google
  → Backend Passport callback → redirect to /auth/callback?token=<accessToken>
  → AuthCallback page reads token from URL → stores in localStorage → GET /me → redirect to /dashboard

Logout
  → POST /api/auth/logout (clears DB refreshToken + cookie)
  → localStorage.removeItem('accessToken')
  → setUser(null)
```

---

## Key File Locations Quick Reference

| What | Where |
|---|---|
| All client routes | `src/app/routes.tsx` |
| Global auth state | `src/app/contexts/auth-context.tsx` |
| Axios instance + interceptors | `src/app/services/api.ts` |
| Lab API calls | `src/app/services/lab-api.ts` |
| Admin API calls | `src/app/services/admin-api.ts` |
| SSE hook | `src/app/hooks/useLabEvents.ts` |
| Design tokens (colors) | `src/styles/theme.css` |
| Express app + middleware order | `SmartBackend/src/server.js` |
| All env vars documented | `SmartBackend/.env.example` |
| Cisco IOS command simulator | `SmartBackend/src/modules/labs/terminal-engine.js` |
| Achievement unlock rules | `SmartBackend/src/modules/labs/controllers/lab.controller.js` → `ACHIEVEMENT_RULES` |
| DB seed data | `SmartBackend/src/database/seed.js` |
