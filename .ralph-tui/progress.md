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

## 2026-04-03 - US-005
- Documented UserModel: 21 static methods across 4 categories (lookup, mutation, creation, groups), 5 properties, and 7 User instance methods
- Created `docs/models/user.md` with categorized method signatures, parameter tables, and User class reference
- **Learnings:**
  - `UserModel` is a plain static class (not a serviceInstance proxy like SystemModel) — all methods are `static`
  - Cache key format: `type/key/domainId` where type is `id`, `name`, or `mail`
  - `User` class constructor merges `Udoc` + domain user doc; `init()` fires `user/get` event for plugin hooks
  - Virtual users (`_id < -999`) live in a separate `vuser` collection; `getById` automatically routes to it
  - `ban` both zeros privileges AND revokes all tokens via `token.delByUid`
  - `handleMailLower` normalizes Gmail addresses: strips dots and `+` suffixes, maps `googlemail.com` → `gmail.com`
  - `create` auto-allocates UIDs by finding max `_id + 1` and retries on duplicate key collision
---

## 2026-04-03 - US-006
- Documented ProblemModel: 29 static methods across 7 categories (CRUD, batch lookup, status tracking, testdata, additional files, sub-doc helpers, import/export) + permission check
- Documented 4 type exports: `ProblemDoc`, `Field`, `ProblemDict`, `ProblemStatusDoc`
- Documented 4 projection constants, 2 default sentinels, and 12 bus events
- Created `docs/models/problem-model.md`
- **Learnings:**
  - `ProblemModel` is a static-only class like `UserModel` — all methods are `static`
  - `ProblemDoc` is declared via module augmentation in `interface.ts` (not in `problem.ts` itself); the file just has `export interface ProblemDoc extends Document {}` as a base
  - `Field` is simply `keyof ProblemDoc` — a derived type, not a standalone schema
  - `ProblemDict` is `NumericDictionary<ProblemDoc>` — keys can be both `docId` (number) and `pid` (string)
  - Testdata and additional files are stored in gridfs (`storage.*`) with metadata tracked in the `data` / `additional_file` arrays on the problem document
  - `push`/`pull`/`inc` are generic helpers delegated to the `document` subsystem; they use `ArrayKeys<ProblemDoc>` and `NumberKeys<ProblemDoc>` type constraints
  - `import` supports 3 formats: Hydro native, ICPC problem package, and DOMjudge (`domjudge-problem.ini`)
  - Config auto-parses on `get()` unless `rawConfig=true`; `getList()` also resolves references and parses configs
---

## 2026-04-03 - US-007
- Documented RecordModel: 12 public static methods across 4 categories (lookup, statistics, submission & judging, update) + properties, types, and bus events
- Documented 4 type exports: `RecordDoc`, `RecordStatDoc`, `RecordHistoryDoc`, `JudgeMeta`
- Created `docs/models/record-model.md`
- **Learnings:**
  - `RecordModel` is a static-only class like `UserModel` and `ProblemModel` — all methods are `static`
  - Uses 3 MongoDB collections: `record` (main), `record.stat` (accepted stats), `record.history` (archived results for rejudge)
  - `RECORD_PRETEST` and `RECORD_GENERATE` are sentinel ObjectIds (`000...000`, `000...001`) used as contest IDs to mark special record types
  - `RecordDoc` is a mapped type over `RecordPayload` from `@hydrooj/common`, converting `hackTarget`/`contest` fields from `string` to `ObjectId`
  - `reset()` archives judge results to `record.history` before clearing — enables viewing previous judge results
  - `stat()` is decorated with `@ArgMethod` — this marks it as callable via argument/CLI patterns
  - `judge()` follows problem references — if the problem has `reference`, it resolves to the source problem for judging
  - `submissionPriority()` throttles high-frequency submitters by penalizing recent submissions and pending tasks
---

## 2026-04-03 - US-008
- Documented DomainModel: 25 public static methods across 4 categories (CRUD, user management, role management, join settings) + constants, properties, types, and 7 bus events
- Created `docs/models/domain-model.md` with categorized method signatures, constant tables, and cache behavior notes
- **Learnings:**
  - `DomainModel` is a static-only class like `UserModel`, `ProblemModel`, and `RecordModel` — all methods are `static`
  - Uses 2 MongoDB collections: `domain` (domain docs) and `domain.user` (per-domain user membership)
  - LRU cache keyed by `id::{lower}` and `host::{host}` with 5-min TTL; `getByHost` caches `null` misses too
  - `getDomainUser` computes effective role considering system privileges (`PRIV_MANAGE_ALL_DOMAIN` → root, `PRIV_USER_PROFILE`/`PRIV_VIEW_ALL_DOMAIN` checks)
  - `setUserRole` supports both single UID and batch (array) via `MaybeArray<number>`
  - `getRoles` has overloads accepting either `domainId: string` or `ddoc: DomainDoc` — resolves to doc internally
  - `DomainDoc` extends `Record<string, any>` so it allows arbitrary additional fields beyond the declared ones
---

## 2026-04-03 - US-009
- Documented TokenModel: 9 public static methods across 3 categories (CRUD, session queries, bulk operations), 8 token type constants, properties, indexes, and TokenDoc type
- Created `docs/models/token-model.md` with method signatures, constant tables, and @ArgMethod summary
- **Learnings:**
  - `TokenModel` is a static-only class like `UserModel`, `ProblemModel`, `RecordModel`, `DomainModel` — all methods are `static`
  - Uses MongoDB TTL index (`expireAfterSeconds: 0`) on `expireAt` for automatic cleanup of expired tokens
  - `TokenDoc` has an index signature `[key: string]: any` — payload fields vary by token type (uid, email, challenge, etc.)
  - 5 of 9 methods are decorated with `@ArgMethod`: `get`, `del`, `getSessionListByUid`, `getMostRecentSessionByUid`, `delByUid`
  - `createOrUpdate` uses `data` as both the search filter and the update payload — it finds by `{tokenType, ...data}` then either adds or updates
  - `delByUid` deletes ALL token types for a user (not just sessions) — used in ban/logout flows
---

## 2026-04-03 - US-010
- Documented ScheduleModel: 6 public static methods (add, get, count, del, deleteMany, getFirst), properties, type exports, indexes, and bus events
- Created `docs/models/schedule-model.md`
- **Learnings:**
  - `ScheduleModel` is a static-only class like `UserModel`, `ProblemModel`, `RecordModel`, `DomainModel`, `TokenModel` — all methods are `static`
  - `getFirst` is defined as a standalone function outside the class then assigned as `static getFirst = getFirst` — uses `findOneAndDelete` for atomic task consumption
  - If a task has an `interval` field, `getFirst` automatically re-inserts it with the next execution time
  - The `apply()` function seeds a built-in `task.daily` schedule (runs at 03:00 daily) and registers a worker handler for cleanup/stats
  - `getFirst` returns `null` when `process.env.CI` is set — skips task execution in CI environments
---

## 2026-04-03 - US-011
- Documented SolutionModel: 14 public static methods across 4 categories (CRUD, listing, replies, voting) and 1 bus event
- Created `docs/models/solution-model.md`
- **Learnings:**
  - `SolutionModel` is a static-only class like all other models — all methods are `static`
  - Entirely delegates to the generic `document` subsystem using `TYPE_PROBLEM_SOLUTION` / `TYPE_PROBLEM` — no direct MongoDB collection access
  - `vote` uses a two-step pattern: `setStatus` with `'before'` strategy to detect prior votes, then `inc` to adjust the delta — prevents double-counting
  - `del` performs parallel deletion of both the document and its status records
  - No exported types from `solution.ts` — uses generic `Document` from the document subsystem
---