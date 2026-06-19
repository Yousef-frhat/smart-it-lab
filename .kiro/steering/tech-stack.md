# Tech Stack & Dependencies

## Frontend

| Category | Library | Version | Notes |
|---|---|---|---|
| Framework | React | 18.x (peer) | Functional components + hooks only |
| Build tool | Vite | 6.3.5 | ESM, `@vitejs/plugin-react` |
| Language | TypeScript | via Vite | Strict mode implied |
| Styling | TailwindCSS | 4.1.12 | v4 — config via CSS, NOT tailwind.config.js |
| UI primitives | shadcn/ui (Radix) | various | Lives in `src/app/components/ui/` — do NOT edit |
| UI extras | MUI (Material UI) | 7.3.5 | Used alongside shadcn; avoid mixing patterns |
| Routing | react-router | 7.13.0 | `createBrowserRouter`, data router API |
| HTTP client | Axios | 1.15.2 | Singleton in `services/api.ts` with interceptors |
| Forms | react-hook-form | 7.55.0 | Pair with Zod for validation |
| Charts | Recharts | 2.15.2 | Used in admin dashboard |
| Animations | Motion (Framer) | 12.23.24 | Use sparingly |
| Toast | Sonner | 2.0.3 | `toast.success/error()` — Toaster in App.tsx |
| Icons | Lucide React | 0.487.0 | Primary icon set |
| Icons (alt) | MUI Icons | 7.3.5 | Secondary — prefer Lucide for consistency |
| Date utils | date-fns | 3.6.0 | |
| DnD | react-dnd | 16.0.1 | HTML5 backend |
| Theming | next-themes | 0.4.6 | Supplemented by custom `applyTheme()` util |
| Carousel | Embla | 8.6.0 | |
| Masonry | react-responsive-masonry | 2.7.1 | |

## Backend

| Category | Library | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | 20 | ESM (`"type": "module"`) |
| Framework | Express | 4.18.2 | |
| Database ODM | Mongoose | 9.2.1 | MongoDB |
| Auth — JWT | jsonwebtoken | 9.0.3 | Access (15m) + Refresh (7d) |
| Auth — OAuth | Passport.js | 0.7.0 | GitHub + Google strategies |
| Auth — Passwords | bcryptjs | 2.4.3 | Salt rounds: 12 |
| Validation | Zod | 3.24.4 | Schemas in `*.validation.js` per module |
| File uploads | Multer | 2.1.1 | + multer-storage-cloudinary |
| Cloud storage | Cloudinary | 1.41.3 | Avatar uploads only |
| Email | Nodemailer | 8.0.7 | SMTP / Mailtrap |
| Rate limiting | express-rate-limit | 7.5.0 | |
| Security headers | Helmet | 8.1.0 | |
| CORS | cors | 2.8.5 | |
| API docs | swagger-jsdoc + swagger-ui-express | 6.2.8 / 5.0.1 | `/api/docs` |
| Dev server | nodemon | 3.1.11 | |

## Infrastructure

| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Production containerization (frontend, backend, MongoDB) |
| nginx (alpine) | Serves SPA, proxies `/api`, disables buffering for SSE |
| GitHub Actions | CI: backend syntax check + frontend build |
| MongoDB Atlas | Recommended cloud database |

## Key Env Variables

All documented in `SmartBackend/.env.example`. Required for the backend to start:

```
PORT                    # default 5000
NODE_ENV                # development | production
FRONTEND_URL            # CORS origin (default http://localhost:3000)
MONGO_URI               # MongoDB connection string
JWT_SECRET              # min 32 chars
JWT_REFRESH_SECRET      # min 32 chars
JWT_ACCESS_EXPIRY       # default 15m
JWT_REFRESH_EXPIRY      # default 7d
```

Optional (features degrade gracefully without them):
```
GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET / GITHUB_CALLBACK_URL
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM
CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
```

Frontend env (set at build time via Vite):
```
VITE_API_URL            # default http://localhost:5000/api
```
