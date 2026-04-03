# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

- **Workspace layout**: The `@hydrooj/framework` package lives at `framework/framework/` (not `packages/`), configured via `pnpm.workspaces` including `framework/*`.
- **Framework source structure**: `framework/framework/` contains `index.ts` (re-exports), `api.ts` (Query/Mutation/Subscription/APIS), `server.ts` (HandlerCommon/Handler/ConnectionHandler/WebService/httpServer), `router.ts` (Router with WS support).

- **Param decorator pattern**: `@param/@query/@post/@route/@get` decorators bind handler method params to request sources. Each accepts `(name, Type, ...options)` where `Type` is a Schemastery schema or `[convert, validate?, optional?]` tuple.
- **Types are tuples**: `Types.*` values are `[Converter, Validator?, isOptional?]` tuples (not classes), making them composable via `Types.ArrayOf`, `Types.AnyOf`, `Types.Range`.

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
## 2026-04-03 - US-002
- Documented 6 parameter decorators (`param`, `query`, `get`, `post`, `route`, `subscribe`) and 3 utility types (`Converter`, `Validator`, `Type`)
- Documented all 28 `Types.*` validators in categorized tables (string, number, special, composite)
- Created `docs/framework/decorators.md` with decorator usage example and full type reference
- **Learnings:**
  - `Types.*` are `[Converter, Validator?, isOptional?]` tuples, not classes — composable via `Types.ArrayOf`, `Types.AnyOf`, `Types.Range`
  - PERM/PRIV are NOT part of `@hydrooj/framework` — they live in `packages/hydrooj/src/model/builtin.ts` (likely a separate US)
  - `subscribe` is dual-purpose: works as both a method decorator and a class decorator for WebSocket handlers
  - `Types.Boolean` is always optional (3rd tuple element is `true`); `Types.Name` is deprecated
---
## 2026-04-03 - US-003
- Documented Context class (14 methods across 4 categories: routing, events, lifecycle, Hydro-specific) and 4 properties
- Documented Service base class with usage example
- Documented 4 types: Fiber, FiberState, Disposable, Plugin
- Created `docs/context/index.md`
- **Learnings:**
  - `Context` extends `cordis.Context` — many core methods (on, emit, parallel, plugin, effect, mixin, inject) come from cordis, not defined locally
  - Hydro adds methods via two mixins: `ApiMixin` (addScript, setImmediate, provideModule, injectUI, broadcast) and `WebService` (Route, Connection)
  - `broadcast` is cluster-aware — uses PM2 bus in cluster mode, MongoDB event bus otherwise
  - `Route` and `Connection` are NOT methods on `cordis.Context` — they're mixed in by `WebService` via `ctx.mixin('server', ['Route', 'Connection'])`
  - `injectUI` injects into typed slots: `Nav`, `ProblemAdd`, `ControlPanel`, `DomainManage`, `Notification`, `UserDropdown`
---

## 2026-04-03 - US-004
- Documented SystemModel: 3 public methods (get, getMany, set), 2 properties (coll, cache), and 20 SystemKeys entries
- Created `docs/models/system.md` with method signatures, type reference, and initialization flow
- **Learnings:**
  - `SystemModel` is a `serviceInstance` proxy over `SystemModelService` — not a plain class, but all methods are accessible through it
  - `getMany` has typed tuple overloads for up to 6 keys; beyond that it falls back to `any[]`
  - `set` broadcasts by default (`broadcast=true`); pass `false` for local-only writes
  - Cache is populated from two sources at init: `SYSTEM_SETTINGS` defaults, then MongoDB collection values (DB wins)
  - `SystemKeys` interface in `packages/hydrooj/src/interface.ts` defines 20 typed keys; arbitrary string keys also work (return `any`)
---

