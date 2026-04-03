# ScheduleModel

Scheduled task model for creating, querying, and deleting delayed or recurring tasks.

> **Source**: `packages/hydrooj/src/model/schedule.ts`
> **Export**: `import { ScheduleModel } from 'hydrooj';`

`ScheduleModel` is a static-only class. All methods are called on the class itself (e.g. `ScheduleModel.add(...)`).

---

## Type Exports

### `Schedule`

Defined in `packages/hydrooj/src/interface.ts`:

```typescript
interface Schedule {
    _id: ObjectId;
    type: string;
    subType?: string;
    executeAfter: Date;
    interval?: [number, moment.UnitOfTime]; // recurring interval (moment duration args)
    [key: string]: any;
}
```

The index signature allows arbitrary fields (e.g. `domainId`, custom payload data) depending on the task type.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection<Schedule>` | MongoDB `schedule` collection |

---

## Methods

### `add(task: Partial<Schedule> & { type: string }): Promise<ObjectId>`

Insert a new scheduled task. If `executeAfter` is omitted, defaults to `new Date()` (immediate execution). Returns the inserted document `_id`.

### `get(_id: ObjectId): Promise<Schedule | null>`

Find a single scheduled task by its `_id`.

### `count(query: Filter<Schedule>): Promise<number>`

Count documents matching the given filter.

### `del(_id: ObjectId): Promise<DeleteResult>`

Delete a single scheduled task by its `_id`.

### `deleteMany(query: Filter<Schedule>): Promise<DeleteResult>`

Delete all scheduled tasks matching the given filter.

### `getFirst(query: Filter<Schedule>): Promise<Schedule | null>`

Atomically find and delete the earliest due task matching the filter (where `executeAfter < now`). If the task has an `interval`, it is automatically re-scheduled by advancing `executeAfter` by the interval duration. Returns `null` if no task is due (or when running in CI).

---

## Indexes

| Name | Key | Notes |
|------|-----|-------|
| `schedule` | `{ type: 1, subType: 1, executeAfter: -1 }` | Composite index for efficient task lookup by type |

---

## Bus Events

| Event | Trigger |
|-------|---------|
| `domain/delete` | Cleans up all scheduled tasks for the deleted domain |
| `task/daily` | Hook for plugins to run daily maintenance logic |
| `task/daily/finish` | Fired after daily task completes, payload contains timing stats (`pref`) |

---

## Notes

- The `apply()` function registers a built-in `task.daily` worker handler that runs cleanup (pretest/generate records), RP recalculation, problem stats, and optional update checks.
- The daily task is automatically seeded on first startup (next day at 03:00) with a 1-day recurring interval.
- `getFirst` uses `findOneAndDelete` for atomic consumption — safe for concurrent workers.
