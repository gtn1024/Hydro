# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

- **Workspace layout**: The `@hydrooj/framework` package lives at `framework/framework/` (not `packages/`), configured via `pnpm.workspaces` including `framework/*`.
- **Framework source structure**: `framework/framework/` contains `index.ts` (re-exports), `api.ts` (Query/Mutation/Subscription/APIS), `server.ts` (HandlerCommon/Handler/ConnectionHandler/WebService/httpServer), `router.ts` (Router with WS support).

---

## 2026-04-03 - US-001
- Documented 9 re-exports from `@hydrooj/framework`: Apis, APIS, HandlerCommon, httpServer, Mutation, Query, Router, Subscription, WebService
- Created `docs/framework/exports.md` with categorized tables and import example
- **Learnings:**
  - `@hydrooj/framework` is a workspace package at `framework/framework/`, not in `packages/`
  - Source files: `api.ts` (Query/Mutation/Subscription/APIS/Apis interface), `server.ts` (HandlerCommon/httpServer/WebService), `router.ts` (Router)
  - `APIS` is a mutable runtime dictionary; `Apis` is the TypeScript interface describing its shape
  - `HandlerCommon` is the base class for both `Handler` (HTTP) and `ConnectionHandler` (WebSocket)
  - `WebService` is the cordis Service that exposes `ctx.Route()` and `ctx.Connection()`
---

