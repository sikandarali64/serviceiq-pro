# AGENTS.md

This repository is a full-stack service dispatch demo with a React/Vite frontend and an Express backend. Use the workspace conventions below when making changes.

## Project shape

- Root package: orchestrates shared commands.
- Frontend lives in `frontend/` and uses Vite + React + Tailwind CSS.
- Backend lives in `backend/` and uses Node.js + Express 5.
- Shared runtime data is backed by Supabase via the backend and frontend realtime subscriptions.

## Working commands

Prefer the monorepo scripts from the root:

- `npm run install-all` — install root, frontend, and backend dependencies.
- `npm run dev` — run backend and frontend together with `concurrently`.

Useful per-package commands:

- Frontend: `npm run dev --prefix frontend`, `npm run build --prefix frontend`, `npm run lint --prefix frontend`
- Backend: `npm run dev --prefix backend`, `npm run start --prefix backend`

## Architecture conventions

- Frontend route entry is in [frontend/src/App.jsx](frontend/src/App.jsx). The app uses `BrowserRouter`, `Routes`, and dashboard-level route composition.
- API access should go through [frontend/src/api.js](frontend/src/api.js), which exports the shared Axios client and the Supabase client.
- Backend API entry is in [backend/index.js](backend/index.js). Keep new endpoints there unless the change clearly belongs in a new module.
- Supabase connectivity lives in [backend/db.js](backend/db.js) and is the canonical backend connection.

## Coding expectations

- Preserve the split between UI logic and API logic: pages own component state, while the backend owns persistence and assignment mechanics.
- Do not introduce a new dependency or state-management framework unless the change truly requires it.
- Follow the existing styling approach: Tailwind utility classes, `framer-motion` for motion, and `lucide-react` for icons.
- Realtime UI updates in the frontend should reuse the existing Supabase channel pattern instead of inventing a new data-layer approach.

## High-value files to inspect first

- [README.md](README.md) — product overview and run instructions.
- [frontend/src/App.jsx](frontend/src/App.jsx) — top-level navigation and dashboard route shell.
- [frontend/src/pages/CustomerDashboard.jsx](frontend/src/pages/CustomerDashboard.jsx) — request flow and job tracking behavior.
- [frontend/src/pages/AdminDashboard.jsx](frontend/src/pages/AdminDashboard.jsx) — live metrics and monitoring UI.
- [backend/index.js](backend/index.js) — endpoint definitions and AI job-assignment logic.

## Change guidance

- When adding new API behavior, update the Express backend first and keep response shapes compatible with the existing frontend consumers.
- When changing the UI, prefer small, local component updates over broad refactors.
- Keep environment assumptions stable: the frontend expects `VITE_API_URL`, and the backend expects Supabase env vars.

## Notes for agents

- Prefer minimal, repo-native edits that match the established design language and existing patterns.
- If the task involves a new workflow, inspect the matching dashboard page and the related backend endpoint together before editing both sides.
- Avoid duplicating documentation already present in [README.md](README.md); link to it when the context is already explained there.
