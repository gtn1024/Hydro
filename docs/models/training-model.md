# TrainingModel

Training (course) model for managing DAG-structured training plans, user enrollment, and progress tracking.

> **Source**: `packages/hydrooj/src/model/training.ts`
> **Export**: `import { TrainingModel } from 'hydrooj';` (available as `ctx.model.training`)

Unlike `TaskModel`, `TrainingModel` is a plain module with exported functions (not a class). All functions are called directly (e.g. `TrainingModel.add(...)`).

---

## CRUD

### `add(domainId: string, title: string, content: string, owner: number, dag?: TrainingNode[], description?: string, pin?: number): Promise<TrainingDoc>`

Creates a new training. Defaults: `dag=[]`, `description=''`, `pin=0`.

### `edit(domainId: string, tid: ObjectId, $set: Partial<TrainingDoc>): Promise<void>`

Updates training fields matching the given partial document.

### `del(domainId: string, tid: ObjectId): Promise<[void, void]>`

Deletes a training and all its associated user statuses.

### `get(domainId: string, tid: ObjectId): Promise<TrainingDoc>`

Retrieves a single training by ID. Throws `TrainingNotFoundError` if not found. Also normalizes DAG `pids` values to integers.

### `getMulti(domainId: string, query?: Filter<TrainingDoc>): FindCursor<TrainingDoc>`

Returns a cursor of trainings matching the query, sorted by `pin` descending then `_id` descending.

### `getList(domainId: string, tids: ObjectId[]): Promise<Record<string, TrainingDoc>>`

Retrieves multiple trainings by IDs, returned as a map keyed by `docId.toString()`.

### `count(domainId: string, query: Filter<TrainingDoc>): Promise<number>`

Returns the count of trainings matching the given query.

---

## Enrollment & Status

### `enroll(domainId: string, tid: ObjectId, uid: number): Promise<number>`

Enrolls a user in a training. Throws `TrainingAlreadyEnrollError` if already enrolled. Increments the training's `attend` counter and returns the new count.

### `getStatus(domainId: string, tid: ObjectId, uid: number): Promise<TrainingStatusDoc | null>`

Retrieves a single user's status for a specific training.

### `getMultiStatus(domainId: string, query: Filter<TrainingDoc>): FindCursor<TrainingStatusDoc>`

Returns a cursor of training statuses matching the given query.

### `getListStatus(domainId: string, uid: number, tids: ObjectId[]): Promise<Record<string, TrainingStatusDoc>>`

Retrieves statuses for multiple trainings for a given user, returned as a map keyed by `docId`.

### `setStatus(domainId: string, tid: ObjectId, uid: number, $set: any): Promise<void>`

Sets (overwrites) status fields for a user on a specific training.

---

## DAG Helpers

Utility functions for evaluating node completion state within a training DAG.

### `getPids(dag: TrainingNode[]): number[]`

Extracts the unique set of all parent IDs (`pids`) across all nodes in the DAG.

### `isDone(node: TrainingNode, doneNids: Set<number>, donePids: Set<number>): boolean`

Returns `true` if the node's required node IDs and parent problem IDs are all satisfied.

### `isProgress(node: TrainingNode, doneNids: Set<number>, donePids: Set<number>, progPids: Set<number>): boolean`

Returns `true` if the node's requirements are met but some parent problems are incomplete, and at least one parent problem is in progress.

### `isOpen(node: TrainingNode, doneNids: Set<number>, donePids: Set<number>, progPids: Set<number>): boolean`

Returns `true` if the node's requirements are met, no parent problems are done or in progress.

### `isInvalid(node: TrainingNode, doneNids: Set<number>): boolean`

Returns `true` if the node's required node IDs are **not** all satisfied (i.e. prerequisites unmet).

---

## Types

Referenced from `packages/hydrooj/src/interface.ts`:

```typescript
interface TrainingNode {
    _id: number;
    title: string;
    requireNids: number[];
    pids: number[];
}

interface TrainingDoc extends Omit<Tdoc, 'docType'> {
    docType: 40; // document.TYPE_TRAINING
    description: string;
    pin?: number;
    dag: TrainingNode[];
}
```

---

## Notes

- Training is a document-type model (`TYPE_TRAINING = 40`). CRUD and status operations delegate to the shared `document` module.
- `enroll` is atomic — it uses `setIfNotStatus` to prevent double enrollment and throws `TrainingAlreadyEnrollError` on conflict.
- `get` normalizes DAG `pids` values (parses numeric strings to integers) for backwards compatibility.
- DAG helpers (`isDone`, `isProgress`, `isOpen`, `isInvalid`) accept both `Set<number>` and `number[]` — they internally convert to `Set`.
