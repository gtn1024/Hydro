# OpcountModel

Rate-limiting model for tracking and enforcing operation counts within time windows.

> **Source**: `packages/hydrooj/src/model/opcount.ts`
> **Export**: `import { OpcountModel } from 'hydrooj';`

`OpcountModel` is a plain module with exported functions (not a class). All methods are called directly (e.g. `OpcountModel.inc(...)`).

---

## Methods

### Rate Limiting

#### `inc(op: string, ident: string, periodSecs: number, maxOperations: number): Promise<number>`

Atomically increments the operation counter for a given operation type and identifier within the current time window. Returns the new count. Throws `OpcountExceededError` if the limit has been reached.

- **`op`** — operation type identifier (e.g. `"login"`, `"submit"`).
- **`ident`** — unique identity of the caller (e.g. user ID, IP address).
- **`periodSecs`** — length of the rate-limiting window in seconds.
- **`maxOperations`** — maximum allowed operations within one window.

### Lifecycle

#### `apply(): Promise<void>`

Creates the required MongoDB indexes on startup. Called once during application initialization.

---

## Indexes

Created in `apply()`:

| Key | Options | Notes |
|-----|---------|-------|
| `{ expireAt: -1 }` | TTL (`expireAfterSeconds: 0`) | Auto-deletes expired windows |
| `{ op: 1, ident: 1, expireAt: 1 }` | unique | Ensures one counter per operation/identity/window |

---

## Notes

- The time window is aligned to fixed boundaries (based on `periodSecs`), not sliding from the first request.
- When the upsert hits the unique constraint (counter already exists at max), a duplicate key error is caught and re-thrown as `OpcountExceededError`.
- `OpcountExceededError` extends `ForbiddenError` with the message: *"Too frequent operations of {op} (limit: {maxOperations} operations in {periodSecs} seconds)."*
