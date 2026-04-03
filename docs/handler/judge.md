# JudgeHandler

Judge system extension interfaces for handling judge task lifecycle, result callbacks, and daemon communication.

> **Source**: `packages/hydrooj/src/handler/judge.ts`
> **Export**: `import { JudgeHandler, JudgeResultCallbackContext, postJudge } from 'hydrooj';`

`JudgeHandler` is a namespace re-export of the entire module. Individual named exports (`JudgeResultCallbackContext`, `postJudge`) are also available directly.

---

## Classes

### `JudgeResultCallbackContext`

Manages the lifecycle of a single judge task's result callbacks. Serializes all `next`/`end` operations via an internal promise chain to ensure ordered updates. Implements a `then` method so instances can be awaited directly (resolves when `end()` is called).

**Constructor**: `new JudgeResultCallbackContext(ctx: Context, task: Task)`

| Property | Type | Description |
|----------|------|-------------|
| `ctx` | `Context` | The Cordis context for broadcasting events |
| `task` | `Task` | The judge task being processed |

#### Instance Methods

| Method | Description |
|--------|-------------|
| `next(body: Partial<JudgeResultBody>)` | Appends an intermediate judge result (progress update). Serialized internally to guarantee ordering. |
| `end(body?: Partial<JudgeResultBody>)` | Finalizes the judge task. Sets `judgeAt`/`judger`, clears `progress`, triggers `postJudge`, and resolves the awaitable promise. Pass no body to resolve without updating. |
| `reset()` | Resets the record to pending state and re-enqueues the task. Used when a judge daemon disconnects mid-judgment. |

#### Static Methods

| Method | Description |
|--------|-------------|
| `JudgeResultCallbackContext.next(domainId: string, rid: ObjectId, body: Partial<JudgeResultBody>)` | Sends an intermediate result update without an instance. Broadcasts `record/change`. |
| `JudgeResultCallbackContext.end(domainId: string, rid: ObjectId, body: Partial<JudgeResultBody>)` | Finalizes a judge task without an instance. Sets `judgeAt`/`judger`, triggers `postJudge`, broadcasts `record/change`. |
| `JudgeResultCallbackContext.postJudge(rdoc: RecordDoc, context?: JudgeResultCallbackContext)` | Post-judgment processing: updates problem/contest status, increments acceptance counters, fires `record/judge` lifecycle hook. |

### `JudgeConnectionHandler` (extends `ConnectionHandler`)

WebSocket handler for judge daemon connections. Manages task dispatching, language config synchronization, and daemon lifecycle.

> **Note**: This is an internal handler registered by Hydro core. Plugins typically do not extend this class.

### `JudgeFilesDownloadHandler` (extends `Handler`)

HTTP handler for judge file downloads (submission code and test data). Registered at `POST /judge/files` with `PRIV_JUDGE`.

### `JudgeFileUpdateHandler` (extends `Handler`)

HTTP handler for judge file uploads (e.g., hack test data). Registered at `POST /judge/upload` with `PRIV_JUDGE`.

---

## Functions

### `processJudgeFileCallback(rid: ObjectId, filename: string, filePath: string): Promise<void>`

Validates and uploads a judge-produced file as problem test data. Checks file count/size limits and user permissions before calling `problem.addTestdata`.

---

## Deprecated

> The following are deprecated and should not be used in new code.

| Export | Replacement | Description |
|--------|-------------|-------------|
| `postJudge(rdoc: RecordDoc)` | `JudgeResultCallbackContext.postJudge(rdoc)` | Post-judgment processing as a standalone function |
| `next(payload: any)` | `JudgeResultCallbackContext.next(...)` | Static-style next callback using a payload object |
| `end(payload: any)` | `JudgeResultCallbackContext.end(...)` | Static-style end callback using a payload object |
| `JudgeHandler.apply.next` | — | Deprecated alias on the `apply` function |
| `JudgeHandler.apply.end` | — | Deprecated alias on the `apply` function |

---

## Lifecycle

The `apply(ctx)` function registers the following on startup:

- Route `judge_files_download` at `/judge/files` → `JudgeFilesDownloadHandler` (requires `PRIV_JUDGE`)
- Route `judge_files_upload` at `/judge/upload` → `JudgeFileUpdateHandler` (requires `PRIV_JUDGE`)
- Connection `judge_conn` at `/judge/conn` → `JudgeConnectionHandler` (requires `PRIV_JUDGE`)
- Event listener on `record/judge` — handles successful hack submissions by auto-adding hack data and triggering rejudge

---

## Notes

- `JudgeResultCallbackContext` serializes `next`/`end` calls via an internal promise chain — callers do not need to handle ordering.
- Controlled rejudge mode (`meta.rejudge === 'controlled'`) writes results to `record.collHistory` instead of the live record, enabling review before applying.
- When a judge daemon disconnects (connection cleanup), all in-progress tasks are reset and re-enqueued via `reset()`.
