# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev             # Start Next.js dev server (port 3000)
npm run build           # Production build
npm run lint            # ESLint check
npm run seed:sample     # Seed MongoDB with sample data (requires MONGODB_URI)
npm run hermes:tunnel   # Open SSH tunnel to the Hermes bridge API (run in a separate terminal before dev)
```

No test framework is configured. Lint is the primary automated check.

### Developing with the live Hermes agent

The real Hermes AI agent runs on a remote server (port 3001, not publicly exposed). To use it locally:

1. In terminal 1: `npm run hermes:tunnel` (keeps running — forwards localhost:3001 → remote:3001)
2. In terminal 2: `npm run dev`

Without the tunnel, the app falls back to mock keyword-matching in `lib/hermes-handler.ts`.

The bridge server on the remote box lives at `~/helm-api/server.py`. To restart it after changes:
```bash
ssh -i ~/Downloads/login.pem ubuntu@100.50.19.205 "~/helm-api/start.sh"
```

## Environment

Requires a `.env.local` file at the repo root:

```
MONGODB_URI=mongodb+srv://...
```

The app will throw on any API call that hits the DB if `MONGODB_URI` is absent.

## Architecture

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, MongoDB/Mongoose, shadcn/ui components, Phosphor Icons.

### Dual-Workspace Model

The app has two personas toggled via `WorkspaceContext` (`lib/context/workspace-context.tsx`), persisted in `localStorage`:

- **Organizer** — full operations dashboard with CRUD access to all collections and full Hermes incident analysis
- **Volunteer** — restricted view with task lists, shifts, and a sandboxed Hermes that blocks operational commands and sanitizes incident data

The `role` field passed to `processHermesMessage` enforces this split; volunteer requests for `reschedule`, `reassign`, `cancel`, `strategy`, or `recovery` are blocked at the handler level.

### Hermes AI Agent

`lib/hermes-handler.ts` contains the core logic for the Hermes agent. It is **intentionally framework-agnostic** so it can be deployed as both:

- A Next.js API route at `app/api/hermes/route.ts`
- A GCP Cloud Function in `bridge-cf/` (uses `@google-cloud/functions-framework`)

Currently the handler uses keyword-matching against `mockIncidents` from `lib/hermes.ts`. The production plan is to replace this with Vertex AI (Gemini 1.5 Pro) calls. Do not add Next.js-specific imports to `lib/hermes-handler.ts`.

`HermesResponse` in `lib/hermes.ts` is a tagged union — four response types: `text`, `operational-card`, `execution-checklist`, `issue-report`. UI components in `components/agent/` render each type. Keep response type additions serializable (no functions, no class instances).

### Operations Dashboard (Data Hub)

`components/operations/collection-view.tsx` is a generic CRUD component that drives the entire operations dashboard. It fetches from `/api/{collectionName}` and delegates column/field definitions to:

- `components/operations/column-definitions.tsx` — table column config per collection
- `components/operations/field-definitions.ts` — form field config per collection

All database collections follow the same API pattern: `GET /api/[collection]` (paginated, filterable by `eventId`), `POST`, `PATCH /api/[collection]/[id]`, `DELETE /api/[collection]/[id]`.

### Data Models

Mongoose schemas live in `models/`. TypeScript interfaces mirror them in `types/data-hub.ts`. Always update both when changing a schema.

Key relationships:
- Most records belong to an `eventId` (the most recently created event is used as the active event)
- `Incident` → many `Task` records
- `Task` → many `TaskMessage` records (threaded discussion in `app/operations/tasks/[id]`)
- `Session` links `speakerIds[]`, `roomId`, and `eventId`

### Context Service

`lib/context/contextService.ts` aggregates MongoDB data into formatted strings for AI context. `lib/services/traversal-service.ts` handles the cross-collection joins. These are used to enrich Hermes prompts with real event data.

### Activity Logging

`lib/activity-logger.ts` writes to the `Activity` MongoDB collection. Call `logActivity()` for any agent action or significant operational event — the activity feed in the UI reads from `/api/activities`.
