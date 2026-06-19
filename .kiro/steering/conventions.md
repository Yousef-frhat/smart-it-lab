# Coding Conventions & Patterns

## Naming Conventions

### Files & Folders
- **Frontend**: `kebab-case` for all files and folders — `auth-context.tsx`, `lab-api.ts`, `dashboard-layout.tsx`
- **Backend**: `kebab-case` with type suffix — `auth.routes.js`, `auth.controller.js`, `auth.validation.js`, `user.model.js`
- **React components**: PascalCase export, kebab-case filename — file `protected-route.tsx` exports `ProtectedRoute`
- **Hooks**: `use` prefix, camelCase — `useLabEvents.ts` exports `useLabEvents()`
- **Contexts**: `kebab-case` filename, PascalCase provider — `auth-context.tsx` exports `AuthProvider`, `useAuth`

### Variables & Functions
- **Frontend**: camelCase for variables/functions, PascalCase for components/types/interfaces
- **Backend**: camelCase throughout; exported controller functions are camelCase verbs (`getLabs`, `startLab`, `runCommand`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants (`ACHIEVEMENT_RULES`, `OUTPUTS`)
- **Mongoose models**: PascalCase singular (`User`, `Lab`, `UserLab`)
- **Route params**: camelCase in Express (`:id`, `:labId`)

## Frontend Patterns

### State Management
- **Global auth state**: `AuthContext` in `src/app/contexts/auth-context.tsx` — use `useAuth()` hook
- **No Redux or Zustand** — use React Context for cross-cutting concerns, local `useState` for component state
- **Server state**: fetch directly in components/pages with `useEffect` + local state; no React Query yet
- **Theme**: applied via `applyTheme()` util which toggles `dark`/`light` class on `document.documentElement`

### API Calls
- Always import the Axios singleton: `import api from '@/app/services/api'`
- Domain-specific helpers live in `services/`: `lab-api.ts`, `admin-api.ts` — add new service files for new domains
- All API functions are `async` and return typed data (normalize raw backend shapes inside the service file)
- Handle errors with `try/catch` in the calling component; use `toast.error()` for user-facing errors
- The Axios interceptor handles 401 → silent token refresh → retry automatically

### Component Structure
- Prefer small, focused components; extract reusable pieces to `components/`
- Pages live in `src/app/pages/` — one file per route, named after the route
- Layout wrapper: `DashboardLayout` wraps all `/dashboard/*` routes — do not duplicate sidebar/nav
- Protected routes: wrap with `<ProtectedRoute>` (add `requireAdmin` prop for admin-only pages)
- UI primitives: use components from `src/app/components/ui/` (shadcn) — do NOT modify these files

### Routing
- All routes defined in `src/app/routes.tsx` — add new routes here only
- Use `<Navigate>` for programmatic redirects inside components
- Use `useNavigate()` hook for imperative navigation

### Styling
- TailwindCSS v4 — utility classes only, no `tailwind.config.js`
- Design tokens: dark background `#0F172A`, card/sidebar `#1E293B`, border `#334155`, accent green `#00FF41`, blue `#3B82F6`, muted text `#94A3B8`, error red `#EF4444`
- Inline Tailwind classes are preferred over custom CSS
- Use `cn()` from `src/app/components/ui/utils.ts` to merge conditional class names
- Global styles in `src/styles/` — `index.css` imports the others

## Backend Patterns

### Module Structure
Every feature module follows this exact layout:
```
modules/<feature>/
  <feature>.routes.js       ← Express router, imports controller + middleware
  <feature>.validation.js   ← Zod schemas exported as named consts
  controllers/
    <feature>.controller.js ← Exported async functions, always call next(error) on catch
```

### Controller Pattern
```js
export const myAction = async (req, res, next) => {
  try {
    // business logic
    res.json({ success: true, data: { ... } });
  } catch (error) {
    next(error); // always delegate to global error handler
  }
};
```

### Response Shape
All API responses follow this envelope:
```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error (handled by error-handler.js)
{ "success": false, "message": "..." }
```

### Validation
- Define Zod schemas in `<feature>.validation.js`
- Apply via `validate(schema)` middleware in the route file
- Validation errors are caught by the global error handler and return 400

### Authentication & Authorization
- `authenticate` middleware: verifies Bearer JWT, attaches `req.user`
- `optionalAuth` middleware: attaches `req.user` if token present, continues without it if not
- `authorize('admin')` middleware: checks `req.user.role` — use after `authenticate`
- Route-level application: `router.use(authenticate, authorize('admin'))` for entire admin modules

### Database
- One Mongoose model per file in `database/schemas/`
- Use `.lean()` on read queries for plain JS objects (better performance)
- Use `findOneAndUpdate` with `{ upsert: true, new: true }` for upsert patterns
- Denormalized stats on `User` (`labsCompleted`, `totalPoints`, `streak`) — update via `$inc` when labs complete
- Non-critical side effects (achievements, leaderboard) run after `res.json()` — never block the response

### Error Handling
- Never `throw` inside controllers — always `next(error)`
- Non-critical async work (achievement checks, leaderboard updates) uses `.catch(err => console.error(...))` — never throws

## Import Aliases

Frontend uses `@/` alias mapped to `src/`:
```ts
import api from '@/app/services/api'
import { useAuth } from '@/app/contexts/auth-context'
import { Button } from '@/app/components/ui/button'
```

Backend uses relative imports (ESM, no alias):
```js
import User from '../../database/schemas/user.model.js'
import { authenticate } from '../../common/middleware/auth.middleware.js'
```
Note: `.js` extension is **required** in all backend ESM imports.

## TypeScript (Frontend)

- Interfaces for object shapes, types for unions/primitives
- Normalize raw API responses inside service files — pages receive clean typed objects
- `User` interface lives in `auth-context.tsx` and is the canonical frontend user type
- Avoid `any` — use `unknown` and narrow, or define proper interfaces in the service file
