# Requirements Document

## Introduction

This document captures the full-stack audit and fix requirements for Smart IT Lab — a browser-based networking education platform. The audit identified bugs across four severity tiers: critical security vulnerabilities, data integrity failures, frontend–backend integration mismatches, and code quality / UI polish issues. All fixes must be applied in-place within the existing file structure; no architectural changes or new dependencies are permitted.

The priority order is: **Critical → High → Medium → Low/UI**.

---

## Glossary

- **System**: The Smart IT Lab full-stack application (frontend + backend together).
- **Backend**: The Node.js 20 + Express 4 + Mongoose API at `SmartBackend/src/`.
- **Frontend**: The React 18 + Vite + TypeScript SPA at `src/`.
- **AuthController**: `SmartBackend/src/modules/auth/controllers/auth.controller.js`.
- **UserController**: `SmartBackend/src/modules/users/controllers/user.controller.js`.
- **SettingsController**: `SmartBackend/src/modules/settings/controllers/settings.controller.js`.
- **LabController**: `SmartBackend/src/modules/labs/controllers/lab.controller.js`.
- **LeaderboardController**: `SmartBackend/src/modules/leaderboard/controllers/leaderboard.controller.js`.
- **EventsRouter**: `SmartBackend/src/modules/events/events.routes.js`.
- **UserModel**: The Mongoose `User` schema in `SmartBackend/src/database/schemas/user.model.js`.
- **UserSettings**: The Mongoose `UserSettings` schema in `SmartBackend/src/database/schemas/user-settings.model.js`.
- **AuthContext**: `src/app/contexts/auth-context.tsx`.
- **SettingsPage**: `src/app/pages/settings.tsx`.
- **LabInterface**: `src/app/pages/lab-interface.tsx`.
- **StudentDashboard**: `src/app/pages/student-dashboard.tsx`.
- **useLabEvents**: `src/app/hooks/useLabEvents.ts`.
- **AdminDashboard**: `src/app/pages/admin-dashboard.tsx`.
- **Zod schema**: A validation schema defined in a `*.validation.js` file and applied via the `validate()` middleware.
- **sanitizeUser**: The `sanitizeUser()` helper in `SmartBackend/src/common/utils/token.js`.
- **EARS**: Easy Approach to Requirements Syntax — the pattern used for all acceptance criteria below.

---

## Requirements

### Requirement 1 — Admin updateUser Field Whitelist (Privilege Escalation)

**User Story:** As a platform security owner, I want admin user-update requests to be restricted to safe fields, so that an admin cannot escalate privileges or corrupt sensitive fields like `password`, `refreshToken`, or `emailVerificationToken`.

#### Acceptance Criteria

1. THE UserController `updateUser` handler SHALL apply the existing `updateUserSchema` Zod validation before executing the database update, so that only the fields `name`, `email`, `role`, `plan`, `isActive`, `status`, and `avatar` can be modified via `PATCH /api/users/:id`.
2. WHEN a `PATCH /api/users/:id` request body contains fields outside the allowed whitelist (e.g., `password`, `refreshToken`, `emailVerificationToken`), THE Backend SHALL strip those fields before the database write and return only the sanitized update result.
3. IF the `validate(updateUserSchema)` middleware is not already wired on the `PATCH /api/users/:id` route in `user.routes.js`, THEN THE Backend SHALL add it so validation is enforced at the route level.

---

### Requirement 2 — Admin deleteUser Cascade (Orphaned Records)

**User Story:** As a platform administrator, I want deleting a user to remove all associated records, so that orphaned data does not accumulate in the database and cause incorrect statistics.

#### Acceptance Criteria

1. WHEN an admin calls `DELETE /api/users/:id`, THE UserController `deleteUser` handler SHALL delete the target user's records from `UserSettings`, `UserAchievement`, and `LeaderboardEntry` collections in addition to `UserLab`.
2. THE UserController `deleteUser` handler SHALL perform all cascade deletes in a single `Promise.all()` call to minimize latency.
3. IF the target user does not exist, THEN THE Backend SHALL return HTTP 404 without attempting any cascade deletes.

---

### Requirement 3 — updateSettings Field Whitelist

**User Story:** As a platform security owner, I want the settings update endpoint to accept only schema-defined fields, so that users cannot inject arbitrary data into the `UserSettings` document.

#### Acceptance Criteria

1. THE SettingsController `updateSettings` handler SHALL apply the `updateSettingsSchema` Zod validation before executing the database update, so that only `theme`, `language`, `notifications`, and `privacy` top-level keys are accepted.
2. WHEN a `PATCH /api/settings` request body contains fields outside the allowed schema (e.g., `userId`, `__v`), THE Backend SHALL strip those fields before the database write.
3. IF the `validate(updateSettingsSchema)` middleware is not already wired on the `PATCH /api/settings` route in `settings.routes.js`, THEN THE Backend SHALL add it so validation is enforced at the route level.

---

### Requirement 4 — resetPassword Minimum Password Length Consistency

**User Story:** As a user, I want the password length requirement to be the same whether I am registering, changing my password, or resetting it, so that I am not confused by inconsistent rules.

#### Acceptance Criteria

1. THE AuthController `resetPassword` handler SHALL enforce a minimum password length of 8 characters, matching the registration and change-password validation rules.
2. WHEN a reset-password request supplies a `password` shorter than 8 characters, THE Backend SHALL return HTTP 400 with the message `"Password must be at least 8 characters."`.
3. THE `changePasswordSchema` Zod schema in `settings.validation.js` SHALL enforce `min(8)` for `newPassword` to match the registration minimum.

---

### Requirement 5 — SSE Token Validation Hardening

**User Story:** As a security-conscious operator, I want the SSE endpoint to validate the token robustly and not expose it unnecessarily, so that token leakage risk is minimized.

#### Acceptance Criteria

1. WHEN a client connects to `GET /api/events/lab/:id` with a missing `token` query parameter, THE EventsRouter SHALL return HTTP 401 with `{ success: false, message: "Token required." }` before opening the SSE stream.
2. WHEN a client connects to `GET /api/events/lab/:id` with an invalid or expired `token` query parameter, THE EventsRouter SHALL return HTTP 401 with `{ success: false, message: "Invalid token." }` before opening the SSE stream.
3. WHEN a valid token is provided, THE EventsRouter SHALL open the SSE stream and emit a `connected` event containing the `labId`.
4. THE `useLabEvents` hook in the Frontend SHALL URL-encode the access token before appending it as a query parameter to prevent token corruption from special characters.

---

### Requirement 6 — OAuth Callback Token Exposure

**User Story:** As a security-conscious operator, I want the OAuth callback to clear the token from the browser URL after consumption, so that the access token is not persisted in browser history.

#### Acceptance Criteria

1. WHEN the AuthCallback page successfully reads the `token` query parameter from the URL, THE Frontend SHALL call `window.history.replaceState({}, '', '/auth/callback')` to remove the token from the browser URL before making any API calls.
2. WHEN the AuthCallback page stores the access token in `localStorage`, THE Frontend SHALL do so before calling `GET /api/auth/me` so the Axios interceptor can attach it.
3. IF the `token` query parameter is absent from the callback URL, THEN THE Frontend SHALL redirect to `/auth` with a toast error and SHALL NOT attempt to call `GET /api/auth/me`.

---

### Requirement 7 — Settings Frontend–Backend Field Name Alignment

**User Story:** As a user, I want my notification and privacy settings to actually be saved when I click "Save", so that my preferences are respected across sessions.

#### Acceptance Criteria

1. WHEN the SettingsPage `handleSaveNotifications` function sends a `PATCH /api/settings` request, THE Frontend SHALL send the body as a nested object matching the backend schema: `{ notifications: { email, push, labReminders, achievements, marketing } }`.
2. WHEN the SettingsPage `handleSavePrivacy` function sends a `PATCH /api/settings` request, THE Frontend SHALL send the body as a nested object: `{ privacy: { showProfile, showLeaderboard, showActivity } }`.
3. WHEN the SettingsPage loads settings from `GET /api/settings`, THE Frontend SHALL read notification values from `settings.notifications.email`, `settings.notifications.labReminders`, `settings.notifications.achievements` and privacy values from `settings.privacy.showProfile`, `settings.privacy.showLeaderboard`, `settings.privacy.showActivity`.
4. THE SettingsPage SHALL remove the `bio` field from all API calls and local state, as `bio` does not exist in the `UserSettings` schema.
5. THE SettingsPage `handleSaveNotifications` SHALL include a `push` field mapped to a UI toggle, or default it to the current stored value, so the `notifications.push` field is not silently overwritten with `undefined`.

---

### Requirement 8 — saveProgress Schema: progress Field Required

**User Story:** As a developer, I want the saveProgress Zod schema to require the `progress` field, so that the completion logic (which depends on `progress >= 100`) cannot be called with an undefined value.

#### Acceptance Criteria

1. THE `saveProgressSchema` in `lab.validation.js` SHALL declare `progress` as `z.number().min(0).max(100)` (required, not optional).
2. WHEN a `POST /api/labs/:id/save-progress` request body omits the `progress` field, THE Backend SHALL return HTTP 400 with a Zod validation error.
3. THE LabController `saveProgress` handler SHALL only execute the auto-complete branch (`status: "completed"`) when `progress` is exactly 100, not when it is `undefined` or any other falsy value.

---

### Requirement 9 — streak Field in Frontend User Type

**User Story:** As a developer, I want the `streak` field to be part of the typed `User` interface and returned by `sanitizeUser`, so that the student dashboard can display it without unsafe type casting.

#### Acceptance Criteria

1. THE `User` interface in `AuthContext` SHALL include `streak?: number` as an optional typed field.
2. THE `normalizeUser` function in `AuthContext` SHALL map `raw.streak` to the `streak` field on the returned `User` object.
3. THE StudentDashboard SHALL access `user.streak` directly (typed) instead of casting `user` to `Record<string, unknown>`.
4. THE `sanitizeUser` helper in `token.js` already returns all non-sensitive fields via `toObject()`, so no backend change is required for this field — only the frontend type and normalization need updating.

---

### Requirement 10 — Leaderboard Weekly Boundary in UTC

**User Story:** As a student, I want my weekly leaderboard ranking to reset at the correct Monday midnight UTC boundary, so that users in different timezones see consistent weekly periods.

#### Acceptance Criteria

1. THE LeaderboardController `getPeriodStart` function SHALL compute the Monday boundary using UTC date methods (`getUTCDay()`, `setUTCDate()`, `setUTCHours(0, 0, 0, 0)`) instead of local-time methods.
2. WHEN `getPeriodStart('weekly')` is called at any time on any day of the week, THE LeaderboardController SHALL return a `Date` object representing the most recent Monday at `00:00:00.000 UTC`.
3. WHEN `getPeriodStart('monthly')` is called, THE LeaderboardController SHALL return a `Date` object representing the first day of the current UTC month at `00:00:00.000 UTC`, using `Date.UTC(year, month, 1)`.

---

### Requirement 11 — lab-interface.tsx: Remove Full Lab Refetch After Terminal Command

**User Story:** As a student, I want terminal commands to respond quickly, so that the lab interface feels responsive and does not make unnecessary network requests.

#### Acceptance Criteria

1. WHEN the LabInterface `handleCommand` function successfully executes a terminal command, THE Frontend SHALL update local state using the `TerminalEntry` returned by the command API response, without calling `fetchLab(id)` again.
2. THE LabInterface SHALL only call `fetchLab(id)` on initial mount and after `startLab` or `stopLab` actions.
3. WHEN an SSE `progress` event is received, THE LabInterface SHALL update `lab.progress` and `lab.score` from the event payload, maintaining the existing SSE-driven state update pattern.

---

### Requirement 12 — Dynamic Tailwind Class Fix for Tier Border Colors

**User Story:** As a developer, I want tier-based border colors to render correctly in TailwindCSS v4, so that achievement tier badges display the correct color.

#### Acceptance Criteria

1. WHERE achievement tier colors are applied in any component, THE Frontend SHALL use a static lookup map (e.g., `const TIER_COLORS = { bronze: 'border-amber-600', silver: 'border-slate-400', gold: 'border-yellow-400', platinum: 'border-cyan-400' }`) instead of dynamically constructing class strings like `` `border-${tier}-500` ``.
2. THE Frontend SHALL ensure all tier color class strings appear as complete, static strings in source code so TailwindCSS v4's JIT scanner can detect and include them in the output bundle.

---

### Requirement 13 — Unused React Import Removal

**User Story:** As a developer, I want the codebase to be free of unused imports, so that the TypeScript compiler does not emit warnings and the bundle is clean.

#### Acceptance Criteria

1. THE `AuthContext` file SHALL NOT import `React` as a named or default import, since the React 18 JSX transform does not require it and the import is flagged as unused by the TypeScript compiler.

---

### Requirement 14 — SSE Reconnect Max-Retry Limit

**User Story:** As a student, I want the SSE connection to stop retrying after repeated failures, so that a broken backend does not cause the browser to make infinite reconnect attempts.

#### Acceptance Criteria

1. THE `useLabEvents` hook SHALL track a reconnect attempt counter and SHALL NOT attempt more than 5 reconnections for a given `labId`.
2. WHEN the reconnect counter reaches 5, THE `useLabEvents` hook SHALL stop reconnecting and SHALL set `lastEvent` to `null` without throwing an error.
3. WHEN `labId` changes (including to `null`), THE `useLabEvents` hook SHALL reset the reconnect counter to 0.

---

### Requirement 15 — Admin Pagination Surfaced in UI

**User Story:** As an admin, I want the user list to support pagination, so that the dashboard remains performant as the user base grows.

#### Acceptance Criteria

1. THE `getUsers` function in `admin-api.ts` SHALL accept optional `page` and `limit` parameters and pass them as query parameters to `GET /api/users`.
2. THE `getUsers` function SHALL return both the `users` array and the `pagination` object `{ page, limit, total, pages }` from the backend response.
3. THE AdminDashboard users tab SHALL display the current page, total user count, and next/previous page controls using the pagination data returned by the API.

---

### Requirement 16 — Student Dashboard: Active Labs Filter and New Lab Link

**User Story:** As a student, I want the "Active Labs" section to show only labs I have started or am working on, and the "New Lab" button to navigate to the labs list, so that the dashboard is focused and actionable.

#### Acceptance Criteria

1. THE StudentDashboard "Active Labs" section SHALL display only labs with `status` of `running` or `stopped`, filtering out `not-started` and `completed` labs.
2. WHEN no active labs exist, THE StudentDashboard SHALL display a message such as "No active labs. Start one from the Labs page!" with a link to `/dashboard/labs`.
3. THE "New Lab" button in the StudentDashboard header SHALL link to `/dashboard/labs` instead of the hardcoded `/lab/lab-1`.

---

### Requirement 17 — Streak Calculation on Lab Completion

**User Story:** As a student, I want my streak to be updated when I complete a lab, so that the streak counter reflects my actual consecutive daily activity.

#### Acceptance Criteria

1. WHEN a lab is completed (progress reaches 100) in the LabController `saveProgress` handler, THE Backend SHALL compare the current UTC date to `user.lastLabDate` and update `user.streak` accordingly: increment by 1 if the last lab was completed on the previous UTC calendar day, reset to 1 if the last lab was on an earlier day, or leave unchanged if the last lab was already today.
2. THE Backend SHALL update `user.streak` and `user.lastLabDate` in the same `User.findByIdAndUpdate` call that increments `labsCompleted` and `totalPoints`.
3. WHEN the leaderboard entry is updated after lab completion, THE `updateLeaderboard` helper SHALL include the user's current `streak` value in the upserted `LeaderboardEntry`.

---

### Requirement 18 — Remove Hardcoded avgSessionTime

**User Story:** As an admin, I want the platform stats to not display a hardcoded session time, so that the dashboard does not show misleading data.

#### Acceptance Criteria

1. THE AdminController `getStats` handler SHALL omit the `avgSessionTime` field from the response, or replace it with `null`, until a real session-tracking mechanism is implemented.
2. THE AdminDashboard SHALL handle a `null` or absent `avgSessionTime` gracefully, displaying "N/A" or omitting the stat card rather than showing a hardcoded number.

---

### Requirement 19 — TypeScript any Types in Service Files

**User Story:** As a developer, I want service files to use proper TypeScript types instead of `any`, so that type errors are caught at compile time.

#### Acceptance Criteria

1. THE `normalizeUser` function in `AuthContext` SHALL replace the `raw: any` parameter type with `raw: Record<string, unknown>` or a dedicated `RawUser` interface.
2. THE `LabEvent` interface in `useLabEvents.ts` SHALL replace `data: Record<string, any>` with `data: Record<string, unknown>`.
3. WHERE `any` is used in `lab-api.ts` for request/response body typing, THE Frontend SHALL replace it with `unknown` or a typed interface.
