# Smart IT Lab — Project Overview

## What This Project Is

Smart IT Lab is a full-stack web application for learning IT networking skills through interactive, browser-based labs. Students practice Cisco IOS CLI commands (OSPF, VLAN, ACL, BGP) in a simulated terminal environment, track progress, earn achievements, and compete on a leaderboard. Admins manage users and monitor platform health.

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Port 3000)                       │
│  React 18 + Vite + TypeScript + TailwindCSS v4 + shadcn/ui      │
│  State: React Context (AuthContext) — no Redux/Zustand           │
│  Routing: react-router v7 (createBrowserRouter)                  │
│  HTTP: Axios with JWT interceptor + silent refresh               │
│  Real-time: EventSource (SSE) via useLabEvents hook              │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/SSE  (proxied via nginx in prod)
┌────────────────────▼────────────────────────────────────────────┐
│                    Express API (Port 5000)                        │
│  Node.js 20 + Express 4 + ESM (type: "module")                  │
│  Auth: JWT (access 15m) + httpOnly refresh cookie (7d)          │
│  OAuth: Passport.js — GitHub + Google strategies                 │
│  Validation: Zod schemas per route                               │
│  Rate limiting: 15 req/15min (auth), 100 req/min (general)      │
│  File uploads: Multer + Cloudinary (avatars)                     │
│  Email: Nodemailer (SMTP / Mailtrap)                             │
│  Real-time: SSE via in-memory Map (labConnections)               │
└────────────────────┬────────────────────────────────────────────┘
                     │ Mongoose ODM
┌────────────────────▼────────────────────────────────────────────┐
│                    MongoDB Atlas (or local)                       │
│  Collections: users, labs, userlabs, achievements,               │
│               userachievements, leaderboardentries,              │
│               usersettings, servermetrics                        │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment

- **Development**: Frontend on `localhost:3000` (Vite), Backend on `localhost:5000`
- **Production**: Docker Compose — nginx serves the React SPA and proxies `/api` to the Express backend; MongoDB runs as a container
- **CI**: GitHub Actions — backend syntax check + frontend build on push to `main`/`develop`

## Monorepo Layout

```
Smart It Lab/                  ← Frontend root (Vite project)
├── src/
│   ├── main.tsx               ← React entry point
│   └── app/
│       ├── App.tsx            ← Root: AuthProvider + RouterProvider + Toaster
│       ├── routes.tsx         ← All client-side routes (createBrowserRouter)
│       ├── contexts/          ← auth-context.tsx (global auth state)
│       ├── pages/             ← One file per page/route
│       ├── components/
│       │   ├── ui/            ← shadcn/ui primitives (DO NOT edit directly)
│       │   ├── dashboard-layout.tsx
│       │   ├── protected-route.tsx
│       │   └── error-boundary.tsx
│       ├── services/          ← API call modules (api.ts, lab-api.ts, admin-api.ts)
│       ├── hooks/             ← Custom React hooks (useLabEvents.ts)
│       └── utils/             ← Pure helpers (apply-theme.ts)
├── styles/                    ← Global CSS (index.css, theme.css, fonts.css)
├── index.html
├── package.json               ← Frontend deps
├── Dockerfile                 ← Multi-stage: build → nginx
└── nginx.conf                 ← SPA fallback + /api proxy + SSE config

SmartBackend/                  ← Backend root (Express project)
├── src/
│   ├── server.js              ← Express app + middleware + route registration
│   ├── database/
│   │   ├── connection.js      ← Mongoose connect
│   │   ├── seed.js            ← Seed script (npm run seed)
│   │   └── schemas/           ← Mongoose models (one file per model)
│   ├── modules/               ← Feature modules (auth, labs, users, admin, …)
│   │   └── <feature>/
│   │       ├── <feature>.routes.js
│   │       ├── <feature>.validation.js  (Zod schemas)
│   │       └── controllers/<feature>.controller.js
│   ├── common/
│   │   ├── middleware/        ← auth, authorize, rate-limiter, upload, validate, error-handler
│   │   └── utils/             ← token.js, mailer.js, uuid.js
│   └── config/
│       └── swagger.js         ← Swagger/OpenAPI spec config
├── .env.example               ← All required env vars documented here
└── package.json               ← Backend deps
```
