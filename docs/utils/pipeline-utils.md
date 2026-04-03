# pipelineUtils

Batch iteration utilities for traversing all documents of a given type across the system. Designed for migration scripts, bulk data processing, and background maintenance tasks.

> **Source**: `packages/hydrooj/src/pipelineUtils.ts`
> **Export**: `import { iterateAllDomain, iterateAllUser, ... } from 'hydrooj';`

All functions process documents **sequentially** (one at a time) and return `Promise<true>` on completion.

---

## Functions

### iterateAllDomain

```typescript
iterateAllDomain(
  cb: (ddoc: DomainDoc, current?: number, total?: number) => Promise<any>
): Promise<true>
```

Loads all domains and invokes the callback for each one. Provides `current` (0-based index) and `total` progress counters.

### iterateAllUser

```typescript
iterateAllUser(
  cb: (udoc: Udoc, current?: number, total?: number) => Promise<any>
): Promise<true>
```

Loads all users and invokes the callback for each one. Provides `current` (0-based index) and `total` progress counters.

### iterateAllContest

```typescript
iterateAllContest(
  cb: (tdoc: Tdoc) => Promise<any>
): Promise<true>
```

Iterates all domains, then all contests within each domain. Does **not** provide progress counters.

### iterateAllPsdoc

```typescript
iterateAllPsdoc(
  filter: Filter<ProblemStatusDoc>,
  cb: (psdoc: ProblemStatusDoc) => Promise<any>
): Promise<true>
```

Iterates all domains, then all problem status documents matching `filter` within each domain (docType `TYPE_PROBLEM`). Uses cursor-based iteration.

### iterateAllProblemInDomain

```typescript
iterateAllProblemInDomain(
  domainId: string,
  fields: (Field | string)[],
  cb: (pdoc: PartialProblemDoc, current?: number, total?: number) => Promise<any>
): Promise<true>
```

Iterates all problems in a single domain, fetching only the specified `fields`. Automatically injects `domainId` and `docId` into the field list.

If the callback returns a truthy value, the document is **automatically updated** via `problem.edit()` with that value. This enables in-place mutation during iteration. Provides 1-based `current` and `total` progress counters.

### iterateAllProblem

```typescript
iterateAllProblem(
  fields: (Field | string)[],
  cb: (pdoc: PartialProblemDoc, current?: number, total?: number) => Promise<any>
): Promise<true>
```

Iterates all domains, then all problems within each domain. Same field projection and auto-edit behavior as `iterateAllProblemInDomain`.

### iterateAllRecord

```typescript
iterateAllRecord(
  cb: (rdoc: RecordDoc, current: number, total: number) => any
): Promise<true>
```

Iterates **all** records system-wide, sorted by `_id` ascending. Unlike other functions, `current` and `total` are required (not optional) in the callback signature. Uses cursor-based iteration.

---

## Types

```typescript
interface PartialProblemDoc extends ProblemDoc {
    [key: string]: any;
}
```

A relaxed version of `ProblemDoc` used when projecting specific fields via `iterateAllProblemInDomain` / `iterateAllProblem`.

---

## Notes

- All functions load full result sets into memory before iterating (except `iterateAllPsdoc` and `iterateAllRecord` which use cursors). For very large collections, be mindful of memory usage.
- `iterateAllProblemInDomain` is the only function that supports in-place document mutation — returning a truthy value from the callback triggers an automatic `problem.edit()` call.
- `iterateAllContest`, `iterateAllPsdoc`, and `iterateAllProblem` are composite iterators that nest `iterateAllDomain` as the outer loop.
