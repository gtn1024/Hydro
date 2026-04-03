# TaskModel

Background task queue model for enqueuing, consuming, and managing asynchronous tasks.

> **Source**: `packages/hydrooj/src/model/task.ts`
> **Export**: `import { TaskModel } from 'hydrooj';`

`TaskModel` is a static-only class. All methods are called on the class itself (e.g. `TaskModel.add(...)`).

---

## Methods

### Enqueue

#### `add(task: Partial<Task> & { type: string }): Promise<ObjectId>`

Inserts a single task into the queue. Auto-generates an `_id` and defaults `priority` to `0`. Returns the inserted task ID.

#### `addMany(tasks: Task[]): Promise<ObjectId[]>`

Batch-inserts multiple tasks. Returns an array of inserted IDs.

### Read

#### `get(_id: ObjectId): Promise<Task | null>`

Retrieves a single task by its ID.

#### `count(query: Filter<Task>): Promise<number>`

Returns the count of tasks matching the given query.

### Delete

#### `del(_id: ObjectId): Promise<DeleteResult>`

Deletes a single task by ID.

#### `deleteMany(query: Filter<Task>): Promise<DeleteResult>`

Deletes all tasks matching the given query.

### Consume

#### `getFirst(query: Filter<Task>): Promise<Task | null>`

Atomically finds and removes the highest-priority task matching the query (sorted by `priority` descending). Returns `null` if no task is found or if running in CI mode.

#### `consume(query: any, cb: (t: Task) => Promise<void>, destroyOnError?: boolean, concurrency?: number): Consumer`

Creates a `Consumer` instance that continuously polls for matching tasks and processes them via the callback. `destroyOnError` defaults to `true`; `concurrency` defaults to `1`.

---

## Consumer

Returned by `TaskModel.consume()`. Manages a polling loop that picks up tasks and processes them concurrently.

| Method | Description |
|--------|-------------|
| `consume()` | Internal polling loop. Not intended to be called directly. |
| `destroy()` | Stops the consumer and cancels the polling loop. Also called automatically on `app/exit`. |
| `setConcurrency(n: number)` | Updates the max number of tasks processed in parallel. |
| `setQuery(query: string)` | Updates the filter query for task matching. |

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection` | MongoDB `task` collection |

---

## Types

Referenced from `packages/hydrooj/src/interface.ts`:

```typescript
interface Task {
    _id: ObjectId;
    type: string;
    subType?: string;
    priority: number;
    [key: string]: any;
}
```

---

## Indexes

Created in `apply()` on startup (only on `NODE_APP_INSTANCE=0`):

| Key | Options | Notes |
|-----|---------|-------|
| `{ type: 1, subType: 1, priority: -1 }` | — | Optimizes `getFirst` queries |

---

## Notes

- `getFirst` is atomic (uses `findOneAndDelete`) — safe for concurrent consumers.
- Tasks are not automatically retried on failure. The `Consumer` class catches errors and optionally destroys itself (`destroyOnError`).
- The `apply()` function also sets up cross-process event broadcasting via the `event` collection and change streams (for replica sets) or polling fallback.
- The `Consumer` polls with a sleep interval inversely proportional to available concurrency slots.
