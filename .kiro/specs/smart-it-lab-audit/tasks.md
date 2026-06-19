# Implementation Plan: Smart IT Lab Audit Fixes

## Overview

This plan implements all audit fixes identified in the requirements and design documents. Fixes are grouped by severity and file to minimize context switching. The implementation follows a 5-phase approach: Critical Security → High Priority Data Integrity → Medium Priority Integration → Low Priority Code Quality → Final Verification.

All changes are in-place modifications to existing files. No new dependencies or architectural changes are required.

---

## Tasks

### Phase 1: Critical Security Fixes (Backend)

- [x] 1. Fix privilege escalation vulnerability in admin user updates
  - [x] 1.1 Verify `validate(updateUserSchema)` middleware is wired on `PATCH /api/users/:id` route
    - Open `SmartBackend/src/modules/users/user.routes.js`
    - Confirm the route includes `validate(updateUserSchema)` middleware
    - If missing, add it to the route chain
    - _Requirements: 1.1, 1.3_
  
  - [x] 1.2 Verify Zod schema strips unauthorized fields
    - Open `SmartBackend/src/modules/users/user.validation.js`
    - Confirm `updateUserSchema` only allows: `name`, `email`, `role`, `plan`, `isActive`, `status`, `avatar`
    - Ensure no `.passthrough()` or similar permissive options are set
    - _Requirements: 1.1, 1.2_

- [x] 2. Implement cascade delete for user removal
  - [x] 2.1 Add cascade deletes to `deleteUser` controller
    - Open `SmartBackend/src/modules/users/controllers/user.controller.js`
    - Import `UserSettings`, `UserAchievement`, `LeaderboardEntry` models
    - In `deleteUser`, replace single `UserLab.deleteMany` with `Promise.all` that deletes from all four collections: `UserLab`, `UserSettings`, `UserAchievement`, `LeaderboardEntry`
    - Use `{ userId: id }` as the filter for all deletes
    - _Requirements: 2.1, 2.2_

- [x] 3. Verify settings update field whitelist
  - [x] 3.1 Confirm `validate(updateSettingsSchema)` is wired on settings route
    - Open `SmartBackend/src/modules/settings/settings.routes.js`
    - Verify `PATCH /api/settings` route includes `validate(updateSettingsSchema)` middleware
    - If missing, add it to the route chain
    - _Requirements: 3.1, 3.3_
  
  - [x] 3.2 Verify Zod schema restricts fields
    - Open `SmartBackend/src/modules/settings/settings.validation.js`
    - Confirm `updateSettingsSchema` only allows: `theme`, `language`, `notifications`, `privacy`
    - Ensure schema strips unknown fields (default Zod behavior)
    - _Requirements: 3.1, 3.2_

- [x] 4. Raise password minimum length to 8 characters
  - [x] 4.1 Update `resetPassword` validation in auth controller
    - Open `SmartBackend/src/modules/auth/controllers/auth.controller.js`
    - Find the `resetPassword` handler
    - Change password length check from `< 6` to `< 8`
    - Update error message to `"Password must be at least 8 characters."`
    - _Requirements: 4.1, 4.2_
  
  - [x] 4.2 Update `changePasswordSchema` minimum length
    - Open `SmartBackend/src/modules/settings/settings.validation.js`
    - Find `changePasswordSchema`
    - Change `newPassword` validation from `.min(6, ...)` to `.min(8, "New password must be at least 8 characters")`
    - _Requirements: 4.3_

- [ ] 5. Harden SSE token validation
  - [x] 5.1 Verify SSE endpoint validates token before opening stream
    - Open `SmartBackend/src/modules/events/events.routes.js`
    - Confirm the route checks for missing `token` query param and returns 401
    - Confirm the route validates token with JWT and returns 401 on invalid/expired tokens
    - Ensure validation happens BEFORE opening the SSE stream
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 5.2 URL-encode token in frontend SSE hook
    - Open `src/app/hooks/useLabEvents.ts`
    - Find where the EventSource URL is constructed
    - Wrap the token with `encodeURIComponent(token)` before appending to query string
    - _Requirements: 5.4_

- [ ] 6. Clear OAuth token from URL after consumption
  - [~] 6.1 Implement URL cleanup in AuthCallback page
    - Open `src/app/pages/auth-callback.tsx`
    - After reading `token` from URL params, immediately call `window.history.replaceState({}, '', '/auth/callback')`
    - Ensure this happens BEFORE any async API calls
    - Ensure token is stored in localStorage before calling `/api/auth/me`
    - _Requirements: 6.1, 6.2, 6.3_

- [~] 7. Checkpoint - Run security tests
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 2: High Priority Data Integrity Fixes (Backend)

- [ ] 8. Implement streak calculation on lab completion
  - [~] 8.1 Add streak logic to `saveProgress` controller
    - Open `SmartBackend/src/modules/labs/controllers/lab.controller.js`
    - Find the `saveProgress` handler, locate the completion branch (`progress >= 100`)
    - After the existing `User.findByIdAndUpdate` call, add streak calculation logic:
      - Fetch user's current `lastLabDate` and `streak`
      - Get today's UTC date using `new Date().setUTCHours(0, 0, 0, 0)`
      - Compare to `lastLabDate`: if yesterday → increment streak, if today → unchanged, else → reset to 1
      - Include `streak` and `lastLabDate` in the `$set` update
    - _Requirements: 17.1, 17.2_

- [ ] 9. Update leaderboard helper to include streak
  - [~] 9.1 Modify `updateLeaderboard` helper function
    - In `SmartBackend/src/modules/labs/controllers/lab.controller.js`
    - Find the `updateLeaderboard` helper function
    - After streak calculation is implemented, fetch the updated user's `streak` value
    - Include `streak` in the `LeaderboardEntry` upsert `$set` object
    - _Requirements: 17.3_

- [ ] 10. Fix leaderboard period boundaries to use UTC
  - [~] 10.1 Update `getPeriodStart` to use UTC methods
    - Open `SmartBackend/src/modules/leaderboard/controllers/leaderboard.controller.js`
    - Find the `getPeriodStart` function
    - Replace all local-time methods with UTC equivalents:
      - `getDay()` → `getUTCDay()`
      - `setDate()` → `setUTCDate()`
      - `setHours()` → `setUTCHours(0, 0, 0, 0)`
    - For monthly period, use `new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))`
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 11. Make progress field required in saveProgress schema
  - [~] 11.1 Update Zod schema to require progress
    - Open `SmartBackend/src/modules/labs/lab.validation.js`
    - Find `saveProgressSchema`
    - Change `progress` from `z.number().min(0).max(100).optional()` to `z.number().min(0).max(100)` (remove `.optional()`)
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 12. Remove hardcoded avgSessionTime from admin stats
  - [~] 12.1 Replace hardcoded value with null
    - Open `SmartBackend/src/modules/admin/controllers/admin.controller.js`
    - Find the `getStats` handler
    - Replace `avgSessionTime: 45.3` with `avgSessionTime: null`
    - _Requirements: 18.1_

- [~] 13. Checkpoint - Run data integrity tests
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 3: Medium Priority Integration Fixes (Frontend)

- [ ] 14. Fix settings page field alignment with backend schema
  - [~] 14.1 Update settings load logic
    - Open `src/app/pages/settings.tsx`
    - In the `useEffect` that loads settings, update field mappings:
      - `settings.notifications.email` → `emailNotifications`
      - `settings.notifications.labReminders` → `labReminders`
      - `settings.notifications.achievements` → `achievementAlerts`
      - Add new state: `pushNotifications` from `settings.notifications.push` (default `true`)
      - Add new state: `marketingEmails` from `settings.notifications.marketing` (default `false`)
      - `settings.privacy.showProfile` → `profileVisible`
      - `settings.privacy.showLeaderboard` → `showLeaderboard`
      - Add new state: `showActivity` from `settings.privacy.showActivity` (default `true`)
    - Remove all `bio` state and related code
    - _Requirements: 7.3, 7.4_
  
  - [~] 14.2 Update `handleSaveNotifications` function
    - Send nested object: `{ notifications: { email: emailNotifications, push: pushNotifications, labReminders, achievements: achievementAlerts, marketing: marketingEmails } }`
    - _Requirements: 7.1, 7.5_
  
  - [~] 14.3 Update `handleSavePrivacy` function
    - Send nested object: `{ privacy: { showProfile: profileVisible, showLeaderboard, showActivity } }`
    - _Requirements: 7.2_
  
  - [~] 14.4 Update `handleSaveProfile` function
    - Remove the second `api.patch('/settings', { bio })` call
    - Keep only `api.patch('/settings/profile', { name })`
    - _Requirements: 7.4_
  
  - [~] 14.5 Update settings UI
    - Remove the `bio` textarea and its label
    - Add "Push Notifications" toggle mapped to `pushNotifications` state
    - Add "Show Activity" toggle mapped to `showActivity` state
    - Update password validation from `< 6` to `< 8` characters
    - _Requirements: 7.4_

- [ ] 15. Add streak field to frontend User type
  - [~] 15.1 Update AuthContext User interface and normalization
    - Open `src/app/contexts/auth-context.tsx`
    - Remove unused `React` import (keep `createContext`, `useContext`, `useState`, `useEffect`, `ReactNode`)
    - Add `streak?: number` to the `User` interface
    - In `normalizeUser`, add: `streak: typeof raw.streak === 'number' ? raw.streak : undefined`
    - Change `raw: any` parameter to `raw: Record<string, unknown>`
    - _Requirements: 9.1, 9.2, 13.1, 19.1_

- [ ] 16. Fix student dashboard active labs and streak display
  - [~] 16.1 Update StudentDashboard component
    - Open `src/app/pages/student-dashboard.tsx`
    - Filter active labs: `const activeLabs = labs.filter(l => l.status === 'running' || l.status === 'stopped')`
    - Replace `(user as Record<string, unknown>).streak` with `user?.streak`
    - Change "New Lab" link from `/lab/lab-1` to `/dashboard/labs`
    - Render `activeLabs` instead of all `labs` in Active Labs section
    - Add empty state when `activeLabs.length === 0`: "No active labs. Start one from the Labs page!" with link to `/dashboard/labs`
    - _Requirements: 9.3, 16.1, 16.2, 16.3_

- [ ] 17. Remove redundant lab refetch after terminal command
  - [~] 17.1 Update LabInterface handleCommand
    - Open `src/app/pages/lab-interface.tsx`
    - In `handleCommand`, remove the `fetchLab(id)` call and related state updates after terminal command execution
    - Keep only the terminal entry state update from the API response
    - Rely on SSE `progress` and `objective_complete` events for state updates
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 18. Fix dynamic Tailwind tier border colors
  - [~] 18.1 Update achievements page tier color logic
    - Open `src/app/pages/achievements.tsx`
    - Verify `getTierColor` returns complete static class strings like `'text-[#CD7F32] border-[#CD7F32]'`
    - Fix the locked/unlocked achievement card to use `getTierColor(achievement.tier)` directly without `border-` prefix interpolation
    - Ensure all tier color classes are static strings visible to Tailwind's JIT scanner
    - _Requirements: 12.1, 12.2_

- [ ] 19. Add SSE reconnect max-retry limit
  - [~] 19.1 Implement retry limit in useLabEvents hook
    - Open `src/app/hooks/useLabEvents.ts`
    - Add `retryCount` ref initialized to 0
    - In `connect()`, check `if (retryCount.current >= 5) return` before creating EventSource
    - In `onerror`, increment `retryCount.current` before scheduling reconnect
    - In cleanup and when `labId` changes, reset `retryCount.current = 0`
    - Change `data: Record<string, any>` to `data: Record<string, unknown>` in `LabEvent` interface
    - _Requirements: 14.1, 14.2, 14.3, 19.2_

- [~] 20. Checkpoint - Run integration tests
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 4: Low Priority Code Quality Fixes (Frontend)

- [ ] 21. Surface pagination in admin dashboard
  - [~] 21.1 Update admin-api.ts to return pagination data
    - Open `src/app/services/admin-api.ts`
    - Change `getUsers` return type to include pagination: `Promise<{ users: AdminUser[]; pagination: { page: number; limit: number; total: number; pages: number } }>`
    - Return both users and pagination: `{ users: users.map(normalizeAdminUser), pagination: data.data?.pagination ?? { page: 1, limit: 20, total: users.length, pages: 1 } }`
    - Replace `(srv: any)` and `(a: any)` with typed interfaces or `unknown` with narrowing
    - Change `avgSessionTime: number` to `avgSessionTime: number | null` in `PlatformStats` interface
    - _Requirements: 15.1, 15.2, 19.3_
  
  - [~] 21.2 Update AdminDashboard to handle pagination
    - Open `src/app/pages/admin-dashboard.tsx`
    - Update `getUsers()` call to destructure `{ users: usersData, pagination }`
    - Add `pagination` state
    - Render prev/next pagination controls in the users tab
    - Display "N/A" for `avgSessionTime` when value is `null`
    - _Requirements: 15.3, 18.2_

- [ ] 22. Replace any types in lab-api.ts
  - [~] 22.1 Update type annotations
    - Open `src/app/services/lab-api.ts`
    - Change `const body: Record<string, any>` to `const body: Record<string, unknown>` in `saveProgress`
    - Replace any other `any` types with `unknown` or proper interfaces
    - _Requirements: 19.3_

- [~] 23. Final checkpoint - Run all tests
  - Ensure all tests pass, ask the user if questions arise.

---

### Phase 5: Final Verification

- [ ] 24. Verify all correctness properties
  - [ ]* 24.1 Test P1: Privilege escalation prevention
    - Send `PATCH /api/users/:id` with `{ password: "hacked" }` in body
    - Verify password field is NOT updated in database
    - Verify response does not include password field
    - **Property 1: Privilege Escalation Prevention**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 24.2 Test P2: Cascade delete completeness
    - Create a test user with associated records in UserLab, UserSettings, UserAchievement, LeaderboardEntry
    - Call `DELETE /api/users/:id`
    - Verify no documents with `userId === deletedId` exist in any of the four collections
    - **Property 2: Cascade Delete Completeness**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ]* 24.3 Test P3: Progress field required
    - Send `POST /api/labs/:id/save-progress` with no `progress` field
    - Verify response is HTTP 400 with Zod validation error
    - **Property 3: Progress Required**
    - **Validates: Requirements 8.1, 8.2**
  
  - [ ]* 24.4 Test P4: Settings field alignment
    - Call `handleSaveNotifications` in frontend
    - Call `GET /api/settings`
    - Verify `notifications.email`, `notifications.labReminders`, `notifications.achievements` reflect saved values
    - **Property 4: Settings Field Alignment**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  
  - [ ]* 24.5 Test P5: Streak monotonicity
    - Complete a lab on day 1
    - Complete a lab on day 2 (consecutive UTC day)
    - Verify streak increments by 1
    - Complete a lab on day 4 (non-consecutive)
    - Verify streak resets to 1
    - **Property 5: Streak Monotonicity**
    - **Validates: Requirements 17.1, 17.2**
  
  - [ ]* 24.6 Test P6: UTC leaderboard boundary
    - Call `getPeriodStart('weekly')` from different timezones (mock system time)
    - Verify all calls return the same Monday UTC date
    - **Property 6: UTC Leaderboard Boundary**
    - **Validates: Requirements 10.1, 10.2, 10.3**
  
  - [ ]* 24.7 Test P7: SSE token required
    - Connect to `/api/events/lab/:id` without `token` query param
    - Verify response is HTTP 401
    - **Property 7: SSE Token Required**
    - **Validates: Requirements 5.1**
  
  - [ ]* 24.8 Test P8: OAuth URL cleanup
    - Navigate to `/auth/callback?token=abc123`
    - After AuthCallback runs, verify `window.location.search` does not contain `token=`
    - **Property 8: OAuth URL Cleanup**
    - **Validates: Requirements 6.1**

- [~] 25. Final review and documentation
  - Review all changed files for consistency
  - Ensure no console.log statements remain
  - Verify all error messages are user-friendly
  - Update any relevant documentation

---

## Notes

- Tasks marked with `*` are optional verification tasks and can be skipped for faster deployment
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major phase
- All fixes are in-place modifications to existing files
- No new dependencies or architectural changes required
- Follow the existing code style and conventions in each file
