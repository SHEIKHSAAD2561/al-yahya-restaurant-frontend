# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Frontend for the Al Yahya Restaurant site. This is currently an unmodified `create-next-app` scaffold (Next.js App Router) — `app/page.tsx` still has the default starter content and no restaurant-specific pages, components, or data have been added yet.

## Commands

Run from the `frontend/` directory:

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint (flat config via `eslint.config.mjs`)

There is no test runner configured yet.

## Architecture

- **Next.js 16 App Router**, React 19, TypeScript (strict mode), path alias `@/*` → project root (`tsconfig.json`).
- Routing/layout lives under `app/`: `app/layout.tsx` defines the root HTML shell and loads the Geist fonts via `next/font/google`; `app/page.tsx` is the home route.
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss`, configured through `app/globals.css` using the `@theme inline` directive (not a `tailwind.config.js`). Light/dark colors are defined as CSS variables in `:root` and overridden under `@media (prefers-color-scheme: dark)`.
- **Linting**: `eslint-config-next` (core-web-vitals + typescript rulesets) via the flat config in `eslint.config.mjs`.
