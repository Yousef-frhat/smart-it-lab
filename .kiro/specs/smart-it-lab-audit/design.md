# Design Document — Smart IT Lab Audit Fixes

## Overview

All fixes are applied in-place within existing files. No new dependencies, no structural refactoring. Changes are grouped by file to minimize context switching during implementation.

---

## Fix Groups

### Group A — Backend Security & Validation

#### A1. `lab.validation.js` — Make `progress` required in `saveProgressSchema`
Change `z.number().min(0).max(100).optional()` → `z.number().min(0).max(100)` (remove `.optional()`).

#### A2. `auth.controller.js` — Raise `resetPassword` minimum password length to 8
Change the inline guard `password.length < 6` → `password.length < 8` and update the error message to `"Password must be at least 8 characters."`.

#### A3. `settings.validation.js` — Raise `changePasswordSchema` `newPassword` minimum to 8
Change `.min(6, ...)` → `.min(8, "New password must be at least 8 characters")`.

#### A4. `user.controller.js` — Cascade delete in `deleteUser`
Import `UserSettings`, `UserAchievement`, `LeaderboardEntry`. Replace the single `UserLab.deleteMany` call with a `Promise.all` that also deletes from those three collections.

#### A5. `settings.controller.js` — `updateSettings` already has `validate(updateSettingsSchema)` on the route (confirmed in `settings.routes.js`). No route change needed. The controller uses `$set: req.body` — since Zod strips unknown keys via `validate()`, this is safe. No change needed.

#### A6. `user.routes.js` — `validate(updateUserSchema)` is already wired on `PATCH /:id` (confirmed). No change needed.

---

### Group B — Backend Data Integrity

#### B1. `lab.controller.js` — Streak calculation on lab completion
In `saveProgress`, when `progress >= 100`, after the `User.findByIdAndUpdate` call, add streak logic:
- Fetch the user's current `lastLabDate` and `streak`.
- Compare today's UTC date to `lastLabDate`.
- If yesterday → `streak + 1`; if today → unchanged; otherwise → reset to 1.
- Include `streak` and `lastLabDate` in the same `$inc`/`$set` update.
- Pass `streak` to `updateLeaderboard`.

#### B2. `lab.controller.js` — `updateLeaderboard` helper: include `streak`
The helper already accepts `userId`. After the streak fix, fetch the updated user's `streak` and include it in the `LeaderboardEntry` upsert `$set`.

#### B3. `leaderboard.controller.js` — UTC boundary in `getPeriodStart`
Replace local-time `getDay()`, `setDate()`, `setHours()` with UTC equivalents: `getUTCDay()`, `setUTCDate()`, `setUTCHours(0, 0, 0, 0)`. For monthly, use `new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))`.

#### B4. `admin.controller.js` — Remove hardcoded `avgSessionTime: 45.3`
Replace with `avgSessionTime: null`.

---

### Group C — Frontend Integration Fixes

#### C1. `settings.tsx` — Align field names with backend schema

**Load (useEffect):**
- Read `settings.notifications.email` → `setEmailNotifications`
- Read `settings.notifications.labReminders` → `setLabReminders`
- Read `settings.notifications.achievements` → `setAchievementAlerts`
- Read `settings.notifications.push` → new `pushNotifications` state (default `true`)
- Read `settings.notifications.marketing` → new `marketingEmails` state (default `false`)
- Read `settings.privacy.showProfile` → `setProfileVisible`
- Read `settings.privacy.showLeaderboard` → `setShowLeaderboard`
- Read `settings.privacy.showActivity` → new `showActivity` state (default `true`)
- Remove `bio` state entirely.

**`handleSaveNotifications`:**
Send `{ notifications: { email: emailNotifications, push: pushNotifications, labReminders, achievements: achievementAlerts, marketing: marketingEmails } }`.

**`handleSavePrivacy`:**
Send `{ privacy: { showProfile: profileVisible, showLeaderboard, showActivity } }`.

**`handleSaveProfile`:**
Remove the second `api.patch('/settings', { bio })` call. Keep only `api.patch('/settings/profile', { name })`.

**UI:**
- Remove the `bio` textarea and its `Label`.
- Add a "Push Notifications" toggle mapped to `pushNotifications`.
- Rename "Weekly Progress Report" toggle to map to `marketingEmails` (or remove — it maps to `marketing` in schema).
- Add a "Show Activity" toggle mapped to `showActivity`.

**Password validation:**
Change `newPassword.length < 6` → `newPassword.length < 8` and update the toast message.

#### C2. `auth-context.tsx` — Remove unused `React` import, add `streak` to `User` interface
- Remove `React` from the import line (keep `createContext`, `useContext`, `useState`, `useEffect`, `ReactNode`).
- Add `streak?: number` to the `User` interface.
- In `normalizeUser`, add `streak: typeof raw.streak === 'number' ? raw.streak : undefined`.
- Change `raw: any` → `raw: Record<string, unknown>`.

#### C3. `student-dashboard.tsx` — Active labs filter, streak type fix, New Lab link
- Filter active labs: `const activeLabs = labs.filter(l => l.status === 'running' || l.status === 'stopped')`.
- Replace `(user as Record<string, unknown>).streak` with `user?.streak` (now typed).
- Change `<Link to="/lab/lab-1">` → `<Link to="/dashboard/labs">`.
- Render `activeLabs` in the Active Labs section instead of all `labs`.
- Add empty state: when `activeLabs.length === 0`, show "No active labs. Start one from the Labs page!" with a link to `/dashboard/labs`.

#### C4. `auth-callback.tsx` — Clear token from URL after reading
After reading `token` from `params`, call `window.history.replaceState({}, '', '/auth/callback')` before any async work.

#### C5. `lab-interface.tsx` — Remove redundant `fetchLab` after terminal command
In `handleCommand`, remove the two lines:
```ts
const updatedLab = await fetchLab(id);
setLab(updatedLab);
setCompletedObjectiveIndices(updatedLab.completedObjectives ?? []);
```
The SSE `progress` event already updates `lab.progress` and `lab.score` via the existing `useEffect`. Completed objectives are updated via the `objective_complete` SSE event.

#### C6. `achievements.tsx` — Fix dynamic Tailwind class for tier border
The `getTierColor` function already returns full static strings like `'text-[#CD7F32] border-[#CD7F32]'`. The issue is in the category loop where `border-${getTierColor(...)}` is used — but looking at the actual code, `getTierColor` is used directly as a class string (not interpolated into `border-${...}`). The real issue is the locked achievement card uses:
```tsx
`border-${getTierColor(achievement.tier)} ${getTierBg(achievement.tier)}`
```
This is wrong — `getTierColor` already returns `'text-[#CD7F32] border-[#CD7F32]'` so it should just be used directly. Fix: change the locked/unlocked conditional class to use `getTierColor` directly without the `border-` prefix interpolation.

#### C7. `useLabEvents.ts` — Add max-retry limit (5) and fix `data` type
- Add a `retryCount` ref initialized to 0.
- In `connect()`, before creating `EventSource`, check `if (retryCount.current >= 5) return`.
- In `onerror`, increment `retryCount.current` before scheduling reconnect.
- In the `useEffect` cleanup / when `labId` changes, reset `retryCount.current = 0`.
- Change `data: Record<string, any>` → `data: Record<string, unknown>` in `LabEvent` interface.

#### C8. `admin-api.ts` — Surface pagination, fix `any` types
- Change `getUsers` return type to `Promise<{ users: AdminUser[]; pagination: { page: number; limit: number; total: number; pages: number } }>`.
- Return `{ users: users.map(normalizeAdminUser), pagination: data.data?.pagination ?? { page: 1, limit: 20, total: users.length, pages: 1 } }`.
- Replace `(srv: any)` and `(a: any)` with typed interfaces or `unknown` with narrowing.
- In `PlatformStats`, change `avgSessionTime: number` → `avgSessionTime: number | null`.

#### C9. `admin-dashboard.tsx` — Handle pagination and null `avgSessionTime`
- Update `getUsers()` call to destructure `{ users: usersData, pagination }`.
- Add `pagination` state and render prev/next controls in the users tab.
- In `quickStats` or wherever `avgSessionTime` is displayed, show `"N/A"` when value is `null`.

#### C10. `lab-api.ts` — Replace `any` in `saveProgress` body
Change `const body: Record<string, any>` → `const body: Record<string, unknown>`.

---

## Correctness Properties

1. **P1 (Privilege Escalation Prevention):** A `PATCH /api/users/:id` request containing `{ password: "hacked" }` MUST NOT update the user's password field in the database.
2. **P2 (Cascade Delete Completeness):** After `DELETE /api/users/:id`, no documents with `userId === deletedId` SHALL exist in `UserLab`, `UserSettings`, `UserAchievement`, or `LeaderboardEntry`.
3. **P3 (Progress Required):** A `POST /api/labs/:id/save-progress` with no `progress` field MUST return HTTP 400.
4. **P4 (Settings Field Alignment):** After `handleSaveNotifications` in the frontend, `GET /api/settings` MUST return `notifications.email`, `notifications.labReminders`, and `notifications.achievements` reflecting the saved values.
5. **P5 (Streak Monotonicity):** If a user completes a lab on consecutive UTC calendar days, their `streak` MUST increment by 1 each day.
6. **P6 (UTC Leaderboard Boundary):** `getPeriodStart('weekly')` MUST return the same Monday date regardless of the server's local timezone.
7. **P7 (SSE Token Required):** A connection to `/api/events/lab/:id` without a `token` query param MUST return HTTP 401 (already implemented — verify preserved).
8. **P8 (OAuth URL Cleanup):** After `AuthCallback` runs, `window.location.search` MUST NOT contain `token=`.
