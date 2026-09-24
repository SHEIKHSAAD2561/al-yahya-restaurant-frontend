# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Admin console for Al-Yahya Restaurant — single-tenant (one restaurant, not multi-tenant SaaS), bilingual (English/Arabic with RTL). Talks to a sibling NestJS backend at `../al-yahya-restaurant-backend` (not part of this repo; see that repo's own CLAUDE.md). Only Auth and Settings → Company Overview/Users/Roles & Permissions/Locations/Taxes are real, fully-wired features today — everything else in the sidebar (POS, Customers, Products, Stock, Purchases & Suppliers, Expenses, Accounting, Dashboard analytics, Reports) and the remaining Settings tabs shown in Rewaa references (Configuration, Payment Methods, Custom Fields, Import Logs, Finance) are permission-gated "coming soon" stubs or simply not built yet, because the backend has no real endpoints for those.

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
- `src/core/` — cross-cutting, not domain-specific: `auth/` (session/cookie machinery), `permissions/` (codes + client-side gating), `i18n/` (next-intl config), `api/` (fetch clients, TanStack Query setup), `nav/` (`nav-config.ts` — the single source of truth for sidebar items *and* their required permission codes), `company/` (`get-company-branding.ts` — server-only, hits the backend's public branding endpoint directly, a deliberate narrow exception to the "only Route Handlers touch the backend" rule since it needs no cookies), `phone/` (`country-codes.ts` — shared country-code list + phone split/join helpers), `config/env.ts`.
- `src/features/<name>/` — one per domain (`auth`, `users`, `roles`, `permissions`, `locations`, `company`, `taxes`), each with `api/` (fetch functions + query-key factories), `components/`, `hooks/` (TanStack Query wrappers), `schemas/` (zod), `types/`.
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

Both `User` and `Role` have bilingual `nameEn`/`nameAr` fields, not a single `name` — display code picks one based on `useLocale()`/`getLocale()`. `Location` has a single `name` (not bilingual) plus an `isDefault` flag (exactly one location can be default; used to pre-select a location for new users). `Role` also has an optional bilingual `description`/`descriptionEn`/`descriptionAr` (backend localizes it into one `description` string, same as `name`).

### React Compiler + react-hook-form gotcha (real bug, hit repeatedly — read before writing any form)

**Never populate a `Controller`-bound field via `reset()` inside a `useEffect` that fires after data loads.** This app's React Compiler setup does not reliably re-render a `Controller`'s subscribed field when `reset()` is called from an effect — a `<Select>`/`<Checkbox>` driven through `Controller` can silently keep showing its stale/empty value even though `useForm`'s internal state (and the raw query data) is correct. Plain `register()`-bound `<input>`s are *not* affected (react-hook-form writes those straight to the DOM node), which is why this bug is easy to miss — some fields on a form update correctly while a `Controller`-bound one next to it doesn't.

The fix used everywhere in this codebase (`company-overview-page.tsx`, `tax-form-page.tsx`, `user-drawer-form.tsx`): split into an outer component that fetches/loads the data and an inner form component that receives the loaded record as a **prop**, keyed by something that changes on every real update (`key={record.updatedAt}` or `key={record?.id ?? 'new'}`). The inner form builds `useForm`'s `defaultValues` directly from that prop — no `reset()`, no effect. A fresh save (new `updatedAt`) or a different target (new `id`) naturally remounts the form with correct values. Do this for any new form that edits existing data; don't reach for `reset()`-in-`useEffect` even though it's the "obvious" pattern from react-hook-form's own docs.

Separately: `useWatch({control, name})` does *not* have this problem (used safely for live derived values, e.g. the Tax form's Total Rate) — it's specifically `Controller` + a value set via `reset()` after mount that's unreliable.

### Radix `<Select>` gotcha: pre-filled value shows blank

A Radix `<Select value={x}>` only auto-displays the matching `<SelectItem>`'s text if that item has actually rendered at least once — which only happens while the dropdown is open (`SelectContent` unmounts while closed). A value set programmatically (from `defaultValues`, not a user click) can render **blank** on first paint even though `value` is non-empty. Fix: pass explicit `children` to `<SelectValue>` instead of relying on the default behavior — `<SelectValue>{value ? label(value) : undefined}</SelectValue>`. See `company-overview-page.tsx`'s Business Type select or `user-filters-bar.tsx` for the pattern.

### Company branding: public endpoint + dynamic favicon

`src/core/company/get-company-branding.ts` hits the backend's `GET /company/branding` (public, no permission gate — see that repo's CLAUDE.md) and is called from both dashboard/auth layouts (to brand the sidebar/login logo via `BrandMark`) and `src/app/icon.tsx` (a code-generated favicon route that fetches and streams back the actual logo image, falling back to `src/app/default-favicon.ico` when none is set). `src/app/icon.tsx` must stay excluded from `proxy.ts`'s matcher (alongside `favicon.ico`) — browsers request the tab icon with no session, and the auth-gating logic would otherwise redirect it to `/login`.

### Taxes: system vs. custom, locked vs. toggleable

Mirrors the backend's `Tax.type` model (`SYSTEM_LOCKED | SYSTEM_TOGGLABLE | CUSTOM`, `src/features/taxes/types/tax-type.ts`). `taxes-page.tsx`'s action column branches on it: `CUSTOM` gets an edit pencil (no activate/deactivate — custom taxes are always active), `SYSTEM_LOCKED` gets a disabled "Activated" pill, `SYSTEM_TOGGLABLE` gets a real Activate/Deactivate button behind a confirmation dialog (`ToggleTaxStatusDialog`). `tax-form-page.tsx` renders fully read-only (disabled inputs, no Save button) for anything non-`CUSTOM` — don't remove that guard even though the backend also rejects the edit, since the point is to not show an editable-looking form for something the API will 403 on save.

### Phone input: country code + number

`src/core/phone/country-codes.ts` exports `COUNTRY_CODES` (Gulf countries first, default `+966`), `splitPhoneNumber()`/`joinPhoneNumber()`. The backend's `User.phone` is one plain string — the split only exists in the UI (`user-drawer-form.tsx`'s `phoneCountryCode`/`phoneNumber` form fields, joined on submit). `splitPhoneNumber()` falls back to `+966` + the raw value verbatim for any legacy/unrecognized value rather than guessing a wrong country.
