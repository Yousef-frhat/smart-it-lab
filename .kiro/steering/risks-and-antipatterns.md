# Risks & Anti-Patterns

Known issues, architectural constraints, and things to avoid when working on this codebase.

---

## Active Risks

### 1. SSE connections are in-memory only
`labConnections` in `events.routes.js` is a plain `Map` on the Node.js process heap.

- **Impact**: In a multi-process or multi-container deployment, SSE events emitted by one process won't reach clients connected to another. Horizontal scaling is currently broken for real-time features.
- **Mitigation for now**: Single-process deployment (Docker Compose runs one backend container).
- **Fix when scaling**: Replace with Redis Pub/Sub or a message broker.

### 2. Terminal engine is a static mock
`terminal-engine.js` returns hardcoded Cisco IOS output strings. It does not run real network simulations.

- **Impact**: Students can't actually misconfigure a device and see real consequences. The learning value is limited to command recognition.
- **Risk**: Adding new lab types or commands requires manually extending the `OUTPUTS` map and pattern-matching logic.
- **Fix when needed**: Integrate GNS3, EVE-NG, or a containerized network simulator via a separate service.

### 3. No test suite exists
Neither the frontend nor the backend has any automated tests (unit, integration, or e2e).

- **Impact**: Regressions are caught only manually. CI only checks syntax and build success.
- **Fix**: Add Vitest for frontend, Jest/Supertest for backend. Start with auth and lab controller tests.

### 4. Access token stored in localStorage
`localStorage.getItem('accessToken')` is used throughout the frontend.

- **Impact**: Vulnerable to XSS attacks — any injected script can steal the token.
- **Mitigation**: The refresh token is httpOnly cookie (correct). The access token lifetime is short (15m).
- **Fix when hardening**: Move access token to memory (React state) and rely solely on the httpOnly refresh cookie for persistence.

### 5. Leaderboard streak field is never updated
`LeaderboardEntry.streak` and `User.streak` are stored but no code currently calculates or increments the streak based on consecutive daily activity.

- **Impact**: Streak always shows 0 in the leaderboard.
- **Fix**: Add a daily cron job or calculate streak on `saveProgress` by comparing `lastLabDate` to today.

### 6. No pagination on leaderboard or labs list
`getLabs` and `getLeaderboard` return all documents in a single query with no limit.

- **Impact**: Will degrade as data grows. A large number of labs or leaderboard entries will slow down the API and the frontend render.
- **Fix**: Add `page`/`limit` query params (pattern already exists on `/api/users`).

### 7. Revenue fields in admin stats are hardcoded/estimated
`getStats` in `admin.controller.js` calculates revenue from plan counts using fixed price assumptions. There is no real payment system.

- **Impact**: Revenue figures are not real. Misleading in a production context.
- **Fix**: Integrate a payment provider (Stripe) and track actual transactions.

---

## Anti-Patterns to Avoid

### Frontend

**Don't fetch data outside of `useEffect` at the top level of a component.**
Data fetching belongs in `useEffect` with proper cleanup or in a service function. Fetching at module level causes issues with SSR and testing.

**Don't call `api` directly in JSX or event handlers without error handling.**
Always wrap API calls in `try/catch` and call `toast.error(err.message)` so the user gets feedback.

**Don't add new global state to `AuthContext` unless it's truly auth-related.**
`AuthContext` manages user identity only. Feature-specific state (lab progress, achievements) belongs in local component state or a dedicated context.

**Don't modify files in `src/app/components/ui/`.**
These are shadcn/ui primitives. Customise by wrapping them in a new component, not by editing the source.

**Don't hardcode the API base URL.**
Always use `import.meta.env.VITE_API_URL` or the `api` Axios instance. Never write `http://localhost:5000` directly in a component.

**Don't use both MUI and shadcn components for the same UI pattern.**
Pick one per feature. The existing codebase leans on shadcn for most UI; MUI is present but mixing both for the same element type creates inconsistent styling.

### Backend

**Don't register routes before core middleware in `server.js`.**
The middleware order is: security headers → CORS → body parsing → cookies → passport → rate limiter → routes. Breaking this order causes subtle bugs (missing CORS headers, unparsed bodies).

**Don't `throw` inside controller functions.**
Always use `next(error)`. Uncaught throws bypass the global error handler and crash the request.

**Don't block the response with non-critical side effects.**
Achievement checks and leaderboard updates run *after* `res.json()`. Never `await` them before sending the response — they use fire-and-forget with `.catch()` logging.

**Don't skip `.lean()` on read-only queries.**
Mongoose documents carry overhead (virtuals, methods, change tracking). Use `.lean()` whenever you're only reading data to return in a response.

**Don't store plain-text tokens in the database.**
Email verification and password reset tokens are SHA-256 hashed before storage (`hashToken()` in `auth.controller.js`). Always hash before saving, compare hashes — never store or compare raw tokens.

**Don't omit `.js` extensions in ESM imports.**
The backend uses `"type": "module"`. Node.js ESM requires explicit file extensions. `import foo from './foo'` will fail — it must be `import foo from './foo.js'`.

**Don't add new routes without Zod validation.**
Every route that accepts a request body must have a corresponding Zod schema in `<feature>.validation.js` and use the `validate(schema)` middleware.

### Database

**Don't use string IDs where ObjectId refs are expected.**
`UserLab.userId` and `UserAchievement.userId` are ObjectId refs. Pass `req.user._id` (not `req.user.id`) when querying, or ensure the string is cast correctly.

**Don't query `UserLab` by `labId` without also filtering by `userId`.**
`labId` is not globally unique per user — the compound index is `{ userId, labId }`. Always include both fields in queries to avoid cross-user data leaks.

**Don't add fields to `User` for per-lab or per-achievement data.**
The `User` model only holds denormalized *aggregate* stats (`labsCompleted`, `totalPoints`). Detailed per-lab state lives in `UserLab`; per-achievement state lives in `UserAchievement`.
