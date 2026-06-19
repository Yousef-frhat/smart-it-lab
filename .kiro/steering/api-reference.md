# API Reference

Base URL: `http://localhost:5000/api` (dev) — proxied via nginx as `/api` in production.

All responses use the envelope: `{ success, message?, data? }`

Auth header: `Authorization: Bearer <accessToken>` (except OAuth and refresh-token routes)

---

## Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register; returns `{ user, accessToken }`, sets refresh cookie |
| POST | `/login` | — | Login; returns `{ user, accessToken }`, sets refresh cookie. User includes `settings.theme` |
| POST | `/logout` | ✅ | Clears refresh cookie, nulls DB token |
| POST | `/refresh-token` | cookie | Rotates access + refresh tokens |
| GET | `/me` | ✅ | Returns current user + `settings.theme/language` |
| POST | `/verify-email` | — | Body: `{ token }` |
| POST | `/resend-verification` | — | Body: `{ email }` |
| POST | `/forgot-password` | — | Body: `{ email }` — always returns success (anti-enumeration) |
| POST | `/reset-password` | — | Body: `{ token, password }` — revokes all sessions |
| GET | `/github` | — | Redirects to GitHub OAuth |
| GET | `/github/callback` | — | GitHub OAuth callback → redirects to `/auth/callback?token=` |
| GET | `/google` | — | Redirects to Google OAuth |
| GET | `/google/callback` | — | Google OAuth callback → redirects to `/auth/callback?token=` |

---

## Labs — `/api/labs`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | optional | List published labs. Query: `difficulty`, `category`, `search`. Includes user progress when authenticated |
| GET | `/:id` | optional | Single lab with user progress |
| GET | `/:id/objectives` | optional | Lab objectives with completion status |
| POST | `/:id/start` | ✅ | Start/resume a lab instance (upsert) |
| POST | `/:id/stop` | ✅ | Stop a running lab instance |
| POST | `/:id/save-progress` | ✅ | Body: `{ progress, score?, completedObjectives? }`. Auto-completes at 100%, triggers achievements + leaderboard update + SSE event |
| POST | `/:id/terminal` | ✅ | Body: `{ command, device }`. Executes Cisco IOS command via terminal-engine. Requires running lab instance. Keeps last 500 commands |

---

## Achievements — `/api/achievements`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | All achievements with user's unlock status and progress |
| POST | `/:id/unlock` | ✅ | Manually unlock an achievement by achievementId |

---

## Leaderboard — `/api/leaderboard`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | optional | Query: `period=weekly\|monthly`. Returns ranked entries; `isCurrentUser` flag when authenticated |

---

## Settings — `/api/settings`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get user settings + profile |
| PATCH | `/` | ✅ | Update settings (theme, language, notifications, privacy) |
| PATCH | `/profile` | ✅ | Update name, email |
| PATCH | `/password` | ✅ | Body: `{ currentPassword, newPassword }` |
| PATCH | `/avatar` | ✅ | Multipart form — uploads to Cloudinary |
| DELETE | `/account` | ✅ | Permanently delete account |

---

## Users (Admin) — `/api/users`

All routes require `authenticate + authorize('admin')`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | 🔒 admin | List all users. Query: `search`, `role`, `plan`, `status`, `page`, `limit`, `sortBy`, `order` |
| GET | `/:id` | 🔒 admin | Get user by MongoDB ObjectId |
| PATCH | `/:id` | 🔒 admin | Update user fields |
| DELETE | `/:id` | 🔒 admin | Delete user |
| PATCH | `/:id/suspend` | 🔒 admin | Toggle suspend/activate |

---

## Admin Analytics — `/api/admin`

All routes require `authenticate + authorize('admin')`.

| Method | Path | Description |
|---|---|---|
| GET | `/stats` | Platform stats: totalUsers, activeUsers, totalLabs, runningLabs, revenue, avgCompletionRate, avgSessionTime |
| GET | `/servers` | Server metrics from `ServerMetric` collection |
| GET | `/activity` | Recent user activity feed |

---

## Events (SSE) — `/api/events`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/lab/:id` | query `?token=` | Server-Sent Events stream for a lab. EventSource can't set headers so token is passed as query param |

SSE event types emitted:
- `connected` — on subscribe
- `ping` — keepalive every 30s
- `progress` — when `save-progress` is called (non-completion)
- `lab_complete` — when progress reaches 100; includes `{ score, unlockedAchievements[] }`
- `terminal_output` — after each terminal command
- `objective_complete` — when an objective is checked off

---

## Health

| Method | Path | Description |
|---|---|---|
| GET | `/` | API status + version |
| GET | `/api/health` | Health check with uptime |
| GET | `/api/docs` | Swagger UI |

---

## Rate Limits

- Auth routes (`/api/auth/*`): **15 requests / 15 minutes** per IP
- All other API routes: **100 requests / minute** per IP
