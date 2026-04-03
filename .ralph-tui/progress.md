# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

- Frontend plugin system (`packages/ui-default/context.ts`) is a thin Cordis wrapper — `Context`, `Service` extend cordis base classes with no additional methods; `Disposable`, `FiberState`, `Plugin` are pure re-exports; `EventMap` is an empty interface designed for declaration merging by plugins
- Dialog subclasses (InfoDialog, ActionDialog, ConfirmDialog) are thin preconfigurations of the base `Dialog` class — they only set default `$action` buttons and `cancelByClickingBack`/`cancelByEsc` flags in the constructor, no method overrides
- `prompt()` is the most complex dialog function — it uses React state for form field management, caches values via closure (`valueCache`), and renders different widgets (text input, select, UserSelectAutoComplete, DomainSelectAutoComplete, checkbox) based on `Field.type`
- DocumentModel is the foundational data-access layer that higher-level models (Problem, Contest, Training, Discussion) delegate to — each specifies a `docType` constant and calls DocumentModel functions
- DocumentModel has two collections: `coll` (document) for records and `collStatus` (document.status) for per-user state, both sharing the same `(domainId, docType, docId)` composite key
- Revision-based status methods (`revPushStatus`, `revSetStatus`, `revInitStatus`) use a `rev` counter for optimistic concurrency control on status records
- SettingService registration methods (`PreferenceSetting`, `AccountSetting`, etc.) wrap SettingModel functions via a higher-order `T()` helper that auto-disposes on context teardown — plugins use `ctx.setting.X()` instead of the bare `SettingModel.X()`
- `Sock` wraps `ReconnectingWebSocket` with built-in heartbeat (30s ping interval), Shorty compression support (activated by server sending `"shorty"` message), and auto-close on permission errors — the `on()` method is a thin setter that maps event names to `on{event}` properties
- `uploadFiles` uploads files sequentially (not in parallel) with a two-bar progress dialog — uses closure-captured variables for React re-rendering via `setRender` trick, and blocks browser close via `beforeunload` during upload

---

## 2026-04-03 - US-044
- Documented tpl(), tpl.typoMsg(), rawHtml(), substitute(), i18n()
- Files changed: `docs/ui/utils/template.md` (created)
- **Learnings:**
  - `tpl()` is polymorphic with two overloads: tag template literal (returns HTML string) and React node renderer (returns string or DOM div depending on `reactive` flag)
  - `tpl.typoMsg()` is a static property attached to the `tpl` function — not a separate export, but part of the `tpl` object
  - `rawHtml()` returns a discriminated object `{ templateRaw: true, html }` that `tpl()` checks for to skip escaping — a lightweight alternative to `dangerouslySetInnerHTML`
  - `i18n()` chains `substitute()` for parameter interpolation — looks up `window.LOCALES[str]` first, falls back to raw string key

---

## 2026-04-03 - US-043
- Documented api(), request object (ajax, post, get, postFile), getAvailableLangs()
- Files changed: `docs/ui/utils/request.md` (created)
- **Learnings:**
  - `request` is a plain object (not a class) with 4 methods — `ajax` is the core, others delegate to it
  - `request.post()` has polymorphic input handling — accepts jQuery form, DOM form, string, or plain object, each serialized differently
  - `request.ajax()` preserves the original call stack by capturing `new Error().stack` at call time and attaching it on rejection
  - `api()` is a thin wrapper over `request.post()` targeting the `/d/{domainId}/api/{method}` convention — error field in response body triggers throw
  - `getAvailableLangs()` filters `window.LANGS` by excluding prefix keys (e.g. `"en"` when `"en.section"` exists), `hidden` entries, and `disabled` entries

---

## 2026-04-03 - US-041
- Documented loadMonaco: 1 main async function (load), 1 deprecated function (legacyLoadExternalModule), return type with 4 properties, 5 built-in feature loaders
- Files changed: `docs/ui/components/monaco.md` (created)
- **Learnings:**
  - `load()` serializes concurrent calls via an internal promise chain — `loadPromise` ensures only one initialization runs at a time
  - Feature loading is idempotent — a module-level `loaded` array tracks which features have been loaded, skipping duplicates
  - Plugin-contributed features are resolved via `getFeatures('monaco-{feat}')` — items can be functions, URL strings, or module paths
  - The return value combines exports from both `loader.ts` and `./index.ts` — `monaco`, `registerAction`, `customOptions`, and `renderMarkdown` come from the index module
---

## 2026-04-03 - US-040
- Documented download (default export) and downloadProblemSet: 2 async functions + EventMap extension
- Files changed: `docs/ui/components/zip-downloader.md` (created)
- **Learnings:**
  - `download` uses `streamsaver` to stream ZIP directly to disk — no full-archive-in-memory, uses `createZipStream` with a pull-based controller
  - Files are fetched with `PQueue({ concurrency: 5 })` and up to 5 retries per file with 3-second delays
  - `downloadProblemSet` fires `ctx.serial('problemset/download', ...)` lifecycle hook so plugins can inject extra files into the export ZIP
  - Problem content is parsed as JSON; if it's an object, each key becomes a separate `.md` file, otherwise written as single `problem.md`
  - `WritableStream` polyfill is loaded on demand — `waitForWritableStream` checks native support first
---

## 2026-04-03 - US-039
- Documented uploadFiles: 1 async function + UploadOptions interface (5 optional fields)
- Files changed: `docs/ui/upload-files.md` (created)
- **Learnings:**
  - `uploadFiles` uploads files sequentially (not in parallel) — iterates with `for...in` over FileList
  - Progress dialog uses closure-captured variables (`uploadLabel`, `fileLabel`, `uploadProgress`, `fileProgress`) with a `render` function set via React `useState` — re-renders on XHR progress events
  - Browser close is blocked during upload via `beforeunload` event listener, removed in both success and error paths
  - FormData always includes `operation: 'upload_file'`; `type` and custom filename are optional
  - After completion, dialog stays open for 500ms (`delay(500)`) before closing — UX grace period
---

## 2026-04-03 - US-038
- Documented Socket (Sock class): constructor with url/nocookie/shorty params, 3 properties, 3 event callbacks, 3 methods, internal message handling protocol
- Files changed: `docs/ui/socket.md` (created)
- **Learnings:**
  - `Sock` wraps `ReconnectingWebSocket` with built-in heartbeat (30s ping interval), Shorty compression support, and auto-close on permission errors
  - `on()` is a thin setter mapping event names to `on{event}` properties — not an EventEmitter pattern
  - Close codes >= 4000 trigger automatic `close()` (non-reconnectable), while normal close allows reconnect
  - Shorty compression is activated by server sending `"shorty"` message; subsequent messages are inflated before JSON parsing
---

## 2026-04-03 - US-037
- Documented Notification (4 static toast methods + instance API with constructor options), Rotator (DOMAttachedObject subclass with setValue/getValue animation), selectUser (async prompt wrapper returning username)
- Files changed: `docs/ui/notification-rotator-selectuser.md` (created)
- **Learnings:**
  - Notification has dual modes: static methods delegate to `@mantine/notifications` (modern toast system), while the constructor creates legacy jQuery-based notifications with click actions
  - Rotator extends `DOMAttachedObject` — a base class pattern for components that attach to DOM elements via a key (`vjRotatorInstance`); animation direction is determined by numeric comparison of old vs new value
  - `selectUser` is a single async function that wraps `prompt()` with a user autocomplete field — minimal API surface (just `() => Promise<string | undefined>`)
  - Rotator animation uses CSS class transitions (`pos--above`, `pos--below`, `pos--original`) with a 4000ms delay constant
---

## 2026-04-03 - US-036
- Documented Dialog system: 4 classes (Dialog, InfoDialog, ActionDialog, ConfirmDialog), 3 functions (prompt, confirm, alert), 2 interfaces (Field, DialogOptions)
- Files changed: `docs/ui/dialog.md` (created)
- **Learnings:**
  - Dialog subclasses are thin preconfigurations — they only set default `$action` buttons and cancel flags, no method overrides (except ActionDialog adds `clear()`)
  - `prompt()` is the most complex function — uses React state + closure-cached `valueCache` for form management, renders different widgets based on `Field.type`
  - `DomDialog.show()` returns a `Promise<string>` resolved by `dispatchAction()` — the action name (e.g. "ok", "cancel", "yes", "no") is the dialog result
  - `onDispatch` returning `false` blocks dialog closure — used by `prompt()` for required field validation
  - `Field.columns` with negative value triggers a row break in the grid layout
---

## 2026-04-03 - US-035
- Documented `initPageLoader` function: async page loader initialization with lifecycle callback execution, error handling, performance logging, and post-loading animations
- Documented internal helpers: `buildSequence()` and `PageLoader` class
- Files changed: `docs/ui/page-loader.md` (created)
- **Learnings:**
  - `initPageLoader` is the only exported function from `hydro.ts` — everything else (`buildSequence`, `rounded`, `animate`) is internal
  - `PageLoader` is in a `.js` file (not `.ts`) — uses `require.context` to auto-discover page files from `pages/` and `components/` directories
  - Error handling is per-callback with `Notification.warn()` and `captureException`, execution continues after failures
---

## 2026-04-03 - US-034
- Documented frontend page registration system: Page, NamedPage, AutoloadPage classes, addPage() function, beforeLoading/afterLoading lifecycle, PageLoader internals
- Files changed: `docs/ui/page.md` (created)
- **Learnings:**
  - `NamedPage` is an empty subclass of `Page` — purely semantic, no additional behavior
  - `AutoloadPage` sets `autoload = true` in constructor; autoload pages run hooks on every route regardless of name matching
  - `addPage()` accepts both `Page` instances and plain functions — plain functions are called immediately during PageLoader construction
  - Page lifecycle execution order: autoload beforeLoading → named beforeLoading → autoload afterLoading → named afterLoading
  - `loadPage` callback enables recursive page loading with depth cap of 32
---

## 2026-04-03 - US-033
- Documented frontend plugin system core: Context, ctx, Service, EventMap, Events, Fiber, Disposable, FiberState, Plugin
- Files changed: `docs/ui/context.md` (created)
- **Learnings:**
  - Frontend `context.ts` is a thin Cordis wrapper — `Context` and `Service` extend base classes with no additional methods; `Disposable`, `FiberState`, `Plugin` are pure re-exports from cordis
  - `EventMap` is declared as an empty interface in `api.ts` (not `context.ts`), designed for TypeScript declaration merging by plugins
  - `Context` has a `broadcast` property aliased to `emit`, and an `Events` interface property via `Context[Context.events]`
  - `ctx` is the global singleton — `new Context()` at module load time, separate from the backend `Context`
---

## 2026-04-03 - US-032
- Documented utility libraries: 3 re-exported third-party modules (nanoid, moment, isMoment) + 9 Hydro utilities (buildContent, mime, difficultyAlgorithm, rating, avatar, testdataConfig/parseConfig, sendMail, pwsh, UiContextBase)
- Files changed: `docs/utils/lib.md` (created)
- **Learnings:**
  - `testdataConfig` is an export alias — the internal function is `parseConfig` but `plugin-api.ts` re-exports it as `testdataConfig` via `export { parseConfig as testdataConfig }`
  - `pwsh` (hydro hash) is imported as default from `./lib/hash.hydro` and also registered globally as `global.Hydro.module.hash.hydro` — it's one of multiple hash strategies in the system
  - `UiContextBase` is both an interface and a constant object exported from the base middleware layer — it's the template that gets cloned and augmented per-request
---

## 2026-04-03 - US-031
- Documented SettingService: 5 public methods (get, setConfig, requestConfig, loadConfig, saveConfig), 5 registration methods (PreferenceSetting, AccountSetting, DomainSetting, DomainUserSetting, SystemSetting), plus properties and internal methods
- Files changed: `docs/service/setting-service.md` (created)
- **Learnings:**
  - SettingService registration methods are created via a higher-order `T()` helper that wraps SettingModel functions — the wrapper auto-disposes via `ctx.effect()` when the plugin context ends
  - `requestConfig` returns a reactive Proxy when `dynamic=true` — property writes on the proxy automatically call `setConfig`, enabling transparent config persistence
  - Config is stored as YAML in the `system` MongoDB collection under `_id: 'config'` — `loadConfig` parses it, `saveConfig` serializes via `yaml.dump`
  - `get()` has a 3-tier resolution: domain config → system config → `global.Hydro.model.system.get` fallback
  - Blacklist check (`__proto__`, `prototype`, `constructor`) is enforced on all path-based access methods to prevent prototype pollution

---

## 2026-04-03 - US-030
- Documented Error Classes: 5 base error classes from framework + 60 Hydro custom errors organized by category (Internal, Permission/Auth, User/Domain, Contest/Homework, Training, Problem/File, Validation/Logic, Not Found, Document Sub-type Not Found), plus CreateError factory function usage guide
- Files changed: `docs/error/index.md` (created)
- **Learnings:**
  - `CreateError` (aliased as `Err` internally) creates error classes with template message support (`{0}`, `{1}`, `{2}` placeholders mapped to constructor args via `this.params`)
  - Two errors use dynamic message functions: `PermissionError` auto-resolves bigint perm flags to human-readable descriptions, `PrivilegeError` returns "You're not logged in" when missing `PRIV_USER_PROFILE`
  - Document sub-type errors (ProblemNotFoundError, etc.) inherit from `DocumentNotFoundError` (not directly from `NotFoundError`), creating a 3-level hierarchy
  - `OpcountExceededError` is a ForbiddenError (403) — rate limiting is treated as a permission denial, not a 429

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

