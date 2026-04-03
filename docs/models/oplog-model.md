# OplogModel

Operation log model for recording and querying audit log entries.

> **Source**: `packages/hydrooj/src/model/oplog.ts`
> **Export**: `import { OplogModel } from 'hydrooj';`

`OplogModel` is a plain module with exported functions (not a class). All methods are called directly (e.g. `OplogModel.log(...)`).

---

## Methods

### Logging

#### `log(handler, type: string, data: any): Promise<ObjectId>`

Logs an operation from an HTTP handler context. Automatically captures request metadata (domain, user-agent, referer, path, IP, operator). Emits an `oplog/log` bus event before inserting.

- **`handler`** — the request handler (`Handler | ConnectionHandler`), used to extract request context.
- **`type`** — operation type identifier (e.g. `"problem.create"`, `"user.login"`).
- **`data`** — additional data to store with the log entry.

#### `add(data: Partial<OplogDoc> & { type: string }): Promise<ObjectId>`

Inserts a raw oplog entry without any request context. Useful for system-level or background task logging.

- **`data`** — partial oplog document. Must include `type`. If `_id` is provided, it is remapped to `id`.

### Querying

#### `get(id: ObjectId): Promise<OplogDoc | null>`

Retrieves a single oplog entry by its `_id`. Returns `null` if not found.

### Collection

#### `coll`

The raw MongoDB collection reference (`Collection<OplogDoc>`). Use for custom queries (e.g. `OplogModel.coll.find({ type: 'user.login' })`).

---

## Notes

- `log()` sanitizes handler args before storage: it strips `password`/`verifyPassword` fields and any keys starting with `__`, and replaces `$` and `.` characters in key names with `_`.
- `log()` fires a `oplog/log` bus event via `bus.parallel()` before the database insert, allowing plugins to react to or augment log entries.
- `add()` does **not** auto-populate request metadata (time, domainId, operator, etc.) — callers must provide these manually if needed.
