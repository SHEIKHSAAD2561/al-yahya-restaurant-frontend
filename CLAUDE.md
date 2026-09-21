# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Admin console for Al-Yahya Restaurant — single-tenant (one restaurant, not multi-tenant SaaS), bilingual (English/Arabic with RTL). Talks to a sibling NestJS backend at `../al-yahya-restaurant-backend` (not part of this repo; see that repo's own CLAUDE.md). Only Auth and Settings → Users/Roles & Permissions/Locations are real, fully-wired features today — everything else in the sidebar (POS, Customers, Products, Stock, Purchases & Suppliers, Expenses, Accounting, Dashboard analytics, Reports) is a permission-gated "coming soon" stub, because the backend has no real endpoints for those yet.

## Commands

Run from the project root. The backend must also be running (`npm run start:dev` in `../al-yahya-restaurant-backend`, port 3001) for anything beyond the login screen to work.

- `npm run dev` — dev server with Turbopack (http://localhost:3000)
- `npm run build` — production build (also type-checks)
- `npm run start` — serve the production build (never use this while actively developing — it doesn't hot-reload; use `dev`)
- `npm run lint` — ESLint (flat config, includes React Compiler-aware hooks rules)

`.env.local` needs `BACKEND_URL` (the NestJS API origin) and `SESSION_SECRET` (signs this app's own session cookie — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). No test runner configured yet.

## Architecture

Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4. Path alias `@/*` → `src/*`.

### Directory layout (feature-sliced)

- `src/app/` — routing only, kept thin. `[locale]/(auth)/*` (login, accept-invitation, forgot-password) and `[locale]/(dashboard)/*` (everything behind auth) are separate route groups with separate layouts. `app/api/**` holds the BFF Route Handlers (see Auth below) — the only files allowed to touch the backend's raw JWTs.
- `src/core/` — cross-cutting, not domain-specific: `auth/` (session/cookie machinery), `permissions/` (codes + client-side gating), `i18n/` (next-intl config), `api/` (fetch clients, TanStack Query setup), `nav/` (`nav-config.ts` — the single source of truth for sidebar items *and* their required permission codes), `config/env.ts`.
- `src/features/<name>/` — one per domain (`auth`, `users`, `roles`, `permissions`, `locations`), each with `api/` (fetch functions + query-key factories), `components/`, `hooks/` (TanStack Query wrappers), `schemas/` (zod), `types/`.
- `src/components/ui/` — Radix primitives + Tailwind, shadcn-style (the component code is owned/edited directly, not an installed package). `src/components/layout/` — shell chrome (Sidebar, Topbar, Sheet-based settings tabs, etc).
- `src/proxy.ts` — Next 16 renamed `middleware.ts` to `proxy.ts`; don't recreate a `middleware.ts`, it won't run.

### Auth: BFF pattern, httpOnly cookies

The backend issues its own access/refresh JWTs, but the browser **never sees them**. Three httpOnly cookies (`src/core/auth/cookies.ts`):
- `access_token` / `refresh_token` — the backend's raw tokens, forwarded server-side only.
- `session` — a **separate**, compact JWT this app signs itself (`jose`, `src/core/auth/jwt-session.ts`) from the backend's `GET /auth/me` response, carrying `{sub, nameEn, nameAr, email, roleId, roleType, permissionCodes, preferredLanguage}`. This exists because the backend's access token payload is only `{sub}` — no role/permission data — so `proxy.ts` and server components need something they can read synchronously without a network call.

Route Handlers own all cookie writes: `app/api/auth/{login,logout,accept-invitation,forgot-password}/route.ts` for the auth-establishing calls, and a single catch-all `app/api/backend/[...path]/route.ts` for every other authenticated backend call (users/roles/permissions/locations) — it attaches `Authorization: Bearer <access_token>` + `x-lang: <locale>`, and on a `401` does one silent refresh (mints a fresh `session` too) before retrying. Feature code never imports fetch logic that hits the backend directly — always through `core/api/backend-fetch-client.ts` (browser) which calls the catch-all, or `core/api/backend-fetch-server.ts` (server-only, used only inside Route Handlers).

**Known tradeoff**: since `permissionCodes` is baked into the `session` cookie at login/refresh time, a role's permissions changing does *not* take effect for an already-logged-in user until their session cookie naturally re-mints (≤15 min, tied to the backend's access-token TTL) or they log out/in. This is expected, not a bug.

### Permissions

`src/core/permissions/codes.ts` (`PERMISSIONS`, `PERMISSION_MODULES`) is hand-synced to the backend's `permission-catalog.ts` — keep them in step when that changes. Gating happens in three places for three different needs:
- `proxy.ts` — coarse only (is there a valid session). Deliberately does *not* do fine-grained permission checks (Next's own guidance: proxy should stay coarse; every page re-verifies). The one exception is `/settings` itself, which has no page and must permission-aware-redirect to whichever tab (from `SETTINGS_TABS` in `nav-config.ts`) the user actually has — that logic has to live in proxy (not a page's `redirect()`) so it resolves before any page renders.
- `core/auth/permissions.ts` → `requirePermission()` — server-side, called at the top of protected pages, redirects home if missing.
- `core/permissions/session-context.tsx` → `usePermission()`/`useSession()` — client-side, reads from a `<SessionProvider>` seeded once in `(dashboard)/layout.tsx`, for conditionally rendering UI (buttons, menu items).

A user has **exactly one role** (`roleId`, not an array) — this is intentional, not a limitation to work around. "Assign to Users" (Roles & Permissions) *reassigns* a user's role; it does not add a second one.

### i18n / RTL

`next-intl`, locale-prefixed routing (`/en/...`, `/ar/...`), messages in `src/messages/{en,ar}.json`. `directionForLocale()` in `core/i18n/routing.ts` drives `<html dir>` in the root `[locale]/layout.tsx`. Use logical Tailwind properties (`ps-`/`pe-`/`start-`/`end-`, not `pl-`/`pr-`/`left-`/`right-`) in any new UI so it mirrors correctly in Arabic.

### Data layer

TanStack Query. Each feature's `api/*.query-keys.ts` exports a keys factory (`{all, lists, list(filters), details, detail(id)}` convention); mutations invalidate via `queryClient.invalidateQueries({queryKey: xKeys.lists()})` and toast (`sonner`) on success/error — `ApiError.message` from the backend is already localized (the fetch clients forward the active locale as `x-lang`/`x-locale`), so error toasts just show it directly.

### Naming quirk to know about

Both `User` and `Role` have bilingual `nameEn`/`nameAr` fields, not a single `name` — display code picks one based on `useLocale()`/`getLocale()`. `Location` has a single `name` (not bilingual) plus an `isDefault` flag (exactly one location can be default; used to pre-select a location for new users).
