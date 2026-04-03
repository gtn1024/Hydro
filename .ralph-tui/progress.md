# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

- DocumentModel is the foundational data-access layer that higher-level models (Problem, Contest, Training, Discussion) delegate to — each specifies a `docType` constant and calls DocumentModel functions
- DocumentModel has two collections: `coll` (document) for records and `collStatus` (document.status) for per-user state, both sharing the same `(domainId, docType, docId)` composite key
- Revision-based status methods (`revPushStatus`, `revSetStatus`, `revInitStatus`) use a `rev` counter for optimistic concurrency control on status records

---

## 2026-04-03 - US-029
- Documented JudgeHandler: 4 classes (JudgeResultCallbackContext, JudgeConnectionHandler, JudgeFilesDownloadHandler, JudgeFileUpdateHandler), 1 utility function (processJudgeFileCallback), 3 deprecated functions (postJudge, next, end), plus lifecycle registration
- Files changed: `docs/handler/judge.md` (created)
- **Learnings:**
  - `JudgeResultCallbackContext` serializes `next`/`end` calls via an internal promise chain — no external locking needed
  - Controlled rejudge mode (`meta.rejudge === 'controlled'`) writes to `record.collHistory` instead of live records, enabling review-before-apply
  - The deprecated `postJudge`, `next`, `end` are thin wrappers forwarding to static methods on `JudgeResultCallbackContext`
  - `apply.next` and `apply.end` are deprecated properties attached to the `apply` function itself — unusual pattern

---

## 2026-04-03 - US-028
- Documented pipelineUtils: 7 batch iteration functions + 1 type interface
- Files changed: `docs/utils/pipeline-utils.md` (created)
- **Learnings:**
  - pipelineUtils functions fall into two groups: direct iterators (`iterateAllDomain`, `iterateAllUser`, `iterateAllRecord`) and composite iterators (`iterateAllContest`, `iterateAllPsdoc`, `iterateAllProblem`, `iterateAllProblemInDomain`) that nest `iterateAllDomain` as the outer loop
  - `iterateAllProblemInDomain` is the only function with a mutation side-effect — returning a truthy value from the callback triggers automatic `problem.edit()`, making it useful for migration scripts
  - Most functions load the full result set into memory before iterating; only `iterateAllPsdoc` and `iterateAllRecord` use cursor-based iteration
---

## 2026-04-03 - US-027
- Documented Handler, ConnectionHandler, requireSudo: 2 handler classes + 1 decorator
- Files changed: `docs/service/handler.md` (created)
- **Learnings:**
  - Handler and ConnectionHandler are thin subclasses of `@hydrooj/framework` originals, adding only `domain: DomainDoc` — all other functionality comes from framework base classes + handler mixins registered at server startup
  - `requireSudo` is a TypeScript method decorator (property descriptor pattern) that checks `session.sudo` timestamp with 1-hour validity, saves request context to `session.sudoArgs` on failure, and redirects to sudo page
  - The `domain` property on both handlers is injected via the `handler/create` lifecycle hook in `server.ts`, not via constructor
---

## 2026-04-03 - US-026
- Documented MongoService (ctx.db): 2 properties + 6 methods + 1 static method across categories: Properties, Collection Access, Pagination, Index Management, Lifecycle
- Documented Collections interface: 27 collection name-to-type mappings augmented via declaration merging in interface.ts
- Documented StorageService: 2 backend classes (RemoteStorageService, LocalStorageService) sharing 8 public methods, plus Config schema and encodeRFC5987ValueChars utility
- Files changed: `docs/services/db-and-collections.md` (created), `docs/services/storage-service.md` (created)
- **Learnings:**
  - MongoService is a Cordis Service registered as `ctx.db` — the `db` default export is a deprecated Proxy forwarding to `app.get('db')`
  - Collections interface is declared empty in `service/db.ts` and fully augmented via `declare module './service/db'` in `interface.ts` — plugins can use the same pattern to add custom collection types
  - StorageService exports a namespace with 2 backend classes selected at startup based on `Config.type` — `ctx.storage` is whichever is active, both share the same method signatures
  - `signUpload` only works on S3 backend (throws on local); `isLinkValid` only works on local (returns false on S3)
---

## 2026-04-03 - US-024
- Documented ContestModel: 47 exported members across 10 categories — Constants & Types (3), State Predicates (8), CRUD (7), Status (10), Scoreboard Visibility (5), Balloon (4), Clarification (4), Print Task (4), Other (2), plus lifecycle (1)
- Files changed: `docs/models/contest-model.md` (created)
- **Learnings:**
  - ContestModel is the most complex model documented so far — it contains 6 built-in scoring rules (acm, oi, homework, ioi, ledo, strictioi) each with full scoreboard rendering logic
  - The `buildContestRule` factory creates rules by inheriting from a base rule and binding functions — `ioi` inherits from `oi`, `strictioi` inherits from `ioi`, `ledo` inherits from `oi`
  - Contest uses multiple docTypes: `TYPE_CONTEST` (30) for contests, `TYPE_CONTEST_CLARIFICATION` for Q&A, `TYPE_CONTEST_PRINT` for print tasks — all sharing the parent/child document pattern
  - `updateStatus` is the central scoring entry point — it pushes a journal entry via `revPushStatus`, then recalculates stats via the rule's `stat` function and saves via `revSetStatus`
  - Visibility functions (`canShowRecord`, `canShowSelfRecord`, `canShowScoreboard`) use `this` context binding (called with `.call(this, ...)`) to access the request handler's user object
---

## 2026-04-03 - US-023
- Documented BuiltinModel: all exports from `@hydrooj/common` (PERM 55+ flags, PRIV 22+ flags, STATUS 18 enum values + 4 lookup maps, gender constants, utility function) plus Hydro-extended exports (Permission factory, PERMS array, PERMS_BY_FAMILY, LEVELS, BUILTIN_ROLES, DEFAULT_NODES, CATEGORIES)
- Files changed: `docs/models/builtin-model.md` (created)
- **Learnings:**
  - BuiltinModel is a pure re-export + extension module — it re-exports `@hydrooj/common/permission` and `@hydrooj/common/status` wholesale, then adds Hydro-specific constants (PERMS array, LEVELS, BUILTIN_ROLES, DEFAULT_NODES, CATEGORIES)
  - `PERM` flags use `bigint` (domain-scoped); `PRIV` flags use `number` (system-scoped) — different numeric types for different scopes
  - `PERM_VIEW_DISPLAYNAME` is deprecated alias for `PERM_VIEW_USER_PRIVATE_INFO` (same bit `1n << 67`)
  - `PERMS` is an array of `{family, key, desc}` descriptors used for UI rendering; `PERMS_BY_FAMILY` is auto-generated from it
  - Source lives in `packages/common/` (not `packages/hydrooj/src/`), with `packages/hydrooj/src/model/builtin.ts` re-exporting and extending

---

## 2026-04-03 - US-022
- Documented DocumentModel: 28 functions across 6 categories — DocType Constants (10), Collections (2), Document CRUD (9), Sub-document Operations (6), Status CRUD (11), Revision-based Status (3), plus Lifecycle (1) and 2 type interfaces
- Files changed: `docs/models/document-model.md` (created)
- **Learnings:**
  - DocumentModel is the foundational data-access layer — higher-level models delegate to it with specific `docType` constants
  - Two separate collections: `coll` for documents, `collStatus` for per-user status, sharing `(domainId, docType, docId)` composite key
  - Revision-based methods (`revPushStatus`, `revSetStatus`, `revInitStatus`) use a `rev` counter for optimistic concurrency control
  - `setStatusIfCondition` catches exceptions and returns `false` — unusual error handling pattern compared to other methods
  - `cappedIncStatus` silently skips increments that would exceed caps (uses `$not` filter instead of post-check)
  - `add()` fires `document/add` bus event; `set()` fires `document/set` bus event — only these two methods have event hooks

---

## 2026-04-03 - US-021
- Documented DiscussionModel: 33 exported members across 9 categories — Constants & Types (6), Discussion CRUD (7), Reply CRUD (6), Tail Reply CRUD (4), Reactions (2), History (1), User Status (3), Nodes (4), Virtual Nodes (3), Lifecycle (1)
- Files changed: `docs/models/discussion-model.md` (created)
- **Learnings:**
  - DiscussionModel has a 3-level nesting hierarchy: Discussion -> Reply -> Tail Reply, each with full CRUD
  - Tail replies are stored as sub-documents (`reply` array field) on the parent reply, accessed via `document.push/getSub/setSub/deleteSub`
  - All content edits (discussions, replies, tail replies) automatically insert history records into `discussion.history` collection
  - `add()` fires bus events (`discussion/before-add`, `discussion/add`) — the only model method with before/after event hooks observed so far
  - `apply()` handles cross-entity cascading (problem deletion triggers discussion cleanup, problem edit syncs `hidden` status)

---

## 2026-04-03 - US-020
- Documented SettingModel: 1 factory function (`Setting`), 5 registration functions (`PreferenceSetting`, `AccountSetting`, `DomainSetting`, `DomainUserSetting`, `SystemSetting`), 6 flag constants, 10 collection constants, `langs`, and `SettingType`
- Files changed: `docs/models/setting-model.md` (created)
- **Learnings:**
  - SettingModel is a registration-based module, not a data-access model — plugins call registration functions to declare settings, not to read/write values
  - All registration functions return a dispose callback (`() => void`) for clean plugin teardown
  - Registration functions accept both raw `_Setting[]` objects and schemastery `Schema` objects (auto-converted via internal `schemaToSettings()`)
  - `SETTINGS` and `SETTINGS_BY_KEY` are shared across preference + account settings only; domain/system/user-domain have their own separate `*_BY_KEY` maps

---

## 2026-04-03 - US-019
- Documented OplogModel: 4 exported members (`coll`, `add`, `get`, `log`)
- Files changed: `docs/models/oplog-model.md` (created)
- **Learnings:**
  - OplogModel is a plain module with exported functions, not a class — same pattern as OpcountModel and TrainingModel
  - `log()` is the primary entry point for request-context logging; `add()` is a lower-level variant for system/background use
  - `safeKeys()` is an internal helper (not exported) that strips sensitive fields like `password` and sanitizes MongoDB-unsafe key characters (`$`, `.`)
  - The model registers itself on `global.Hydro.model.oplog` at module load time

---

## 2026-04-03 - US-018
- Documented OpcountModel: 2 exported functions (`inc`, `apply`)
- Files changed: `docs/models/opcount-model.md` (created)
- **Learnings:**
  - OpcountModel is a plain module with exported functions, not a class — same pattern as TrainingModel
  - Rate limiting uses fixed-aligned time windows (not sliding), implemented via MongoDB TTL indexes + unique constraint on `{op, ident, expireAt}`
  - The unique constraint doubles as the rate-limit enforcement: when the counter hits max, the upsert fails with a duplicate key error which is caught and re-thrown as `OpcountExceededError`

---

## 2026-04-03 - US-017
- Documented TrainingModel: 17 exported functions across CRUD (7), Enrollment & Status (5), DAG Helpers (5)
- Files changed: `docs/models/training-model.md` (created)
- **Learnings:**
  - TrainingModel is a plain module with exported functions, not a class — unlike TaskModel which is a static class
  - All CRUD/status operations delegate to the shared `document` module with `TYPE_TRAINING = 40`
  - DAG helpers accept both `Set<number>` and `number[]` — they coerce internally
  - `get()` normalizes DAG `pids` strings to integers for backwards compat

---

## 2026-04-03 - US-016
- Documented TaskModel: 8 static methods + Consumer class with 4 methods
- Files changed: `docs/models/task-model.md` (created)
- **Learnings:**
  - TaskModel also exports a `Consumer` class used for polling-based task consumption — worth documenting alongside the model
  - `getFirst` is an atomic `findOneAndDelete` — important for understanding concurrent consumer safety
  - The `apply()` function handles cross-process event broadcasting via change streams, separate from the task queue itself

---

