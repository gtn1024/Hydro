# DocumentModel

Generic document storage model providing typed CRUD, sub-document manipulation, and per-user status tracking across all document types (problems, contests, trainings, discussions, etc.).

> **Source**: `packages/hydrooj/src/model/document.ts`
> **Export**: `import * as document from 'hydrooj';` (available as `ctx.model.document`)

DocumentModel is a plain module with exported functions (not a class). All functions are called directly. It is the foundational data-access layer that higher-level models (ProblemModel, ContestModel, TrainingModel, DiscussionModel) delegate to.

---

## DocType Constants

| Constant | Value | Description |
|---|---|---|
| `TYPE_PROBLEM` | `10` | Problem documents |
| `TYPE_PROBLEM_SOLUTION` | `11` | Problem solution posts |
| `TYPE_PROBLEM_LIST` | `12` | Problem list / homework |
| `TYPE_DISCUSSION_NODE` | `20` | Discussion category nodes |
| `TYPE_DISCUSSION` | `21` | Discussion threads |
| `TYPE_DISCUSSION_REPLY` | `22` | Discussion replies |
| `TYPE_CONTEST` | `30` | Contest documents |
| `TYPE_CONTEST_CLARIFICATION` | `31` | Contest clarification requests |
| `TYPE_CONTEST_PRINT` | `32` | Contest print jobs |
| `TYPE_TRAINING` | `40` | Training plans |

## DocType Interface

Maps type constants to their corresponding document interfaces:

```typescript
interface DocType {
    [TYPE_PROBLEM]: ProblemDoc;
    [TYPE_PROBLEM_SOLUTION]: any;
    [TYPE_PROBLEM_LIST]: any;
    [TYPE_DISCUSSION_NODE]: any;
    [TYPE_DISCUSSION]: DiscussionDoc;
    [TYPE_DISCUSSION_REPLY]: DiscussionReplyDoc;
    [TYPE_CONTEST]: Tdoc;
    [TYPE_CONTEST_PRINT]: ContestPrintDoc;
    [TYPE_CONTEST_CLARIFICATION]: ContestClarificationDoc;
    [TYPE_TRAINING]: TrainingDoc;
}
```

`DocStatusType` maps type constants to status document interfaces (e.g. `ProblemStatusDoc` for `TYPE_PROBLEM`).

---

## Collections

### `coll`

MongoDB collection `document` — stores all document records.

### `collStatus`

MongoDB collection `document.status` — stores per-user status records (submissions, scores, enrollments, etc.).

---

## Document CRUD

### `add(domainId, content, owner, docType, docId, parentType?, parentId?, args?)`

Inserts a new document. Returns `docId` if provided, otherwise returns the generated `ObjectId`. Fires `document/add` bus event before insert.

### `get(domainId, docType, docId, projection?)`

Retrieves a single document by composite key `(domainId, docType, docId)`. Returns `null` if not found. Accepts optional field projection.

### `getMulti(domainId, docType, query?, projection?)`

Returns a `FindCursor` for multiple documents matching the query. Accepts optional filter and projection.

### `set(domainId, docType, docId, $set?, $unset?, $push?)`

Atomically updates a document using `$set`, `$unset`, and/or `$push` operators. Returns the updated document. Fires `document/set` bus event before update. Upserts if document doesn't exist.

### `inc(domainId, docType, docId, key, value)`

Atomically increments a numeric field by `value`. Returns the updated document.

### `incAndSet(domainId, docType, docId, key, value, args)`

Atomically increments a numeric field and sets additional fields in one operation. Returns the updated document.

### `count(domainId, docType, query?)`

Counts documents matching the filter.

### `deleteOne(domainId, docType, docId)`

Deletes a single document and its associated status records.

### `deleteMulti(domainId, docType, query?)`

Deletes multiple documents matching the filter.

---

## Sub-document Operations

These methods operate on array fields within a document (e.g. replies, tags).

### `push(domainId, docType, docId, key, ...)` *(two overloads)*

**Object form**: `push(domainId, docType, docId, key, value)` — pushes an object onto an array field.
**Content form**: `push(domainId, docType, docId, key, content, owner, args?)` — pushes a new sub-document with auto-generated `_id`.
Returns `[updatedDoc, subId]`.

### `pull(domainId, docType, docId, setKey, contents)`

Removes sub-documents from an array field matching the given filter. Returns the updated document.

### `getSub(domainId, docType, docId, key, subId)`

Retrieves a specific sub-document by `_id` from an array field. Returns `[parentDoc, subDoc]` or `[null, null]` if not found.

### `setSub(domainId, docType, docId, key, subId, args)`

Updates fields on a specific sub-document identified by `_id`. Uses positional `$` operator. Returns the updated parent document.

### `deleteSub(domainId, docType, docId, key, subId)`

Removes one or more sub-documents by `_id` from an array field. Accepts single or array of IDs. Returns the updated document.

### `addToSet(domainId, docType, docId, setKey, content)`

Adds a string value to an array field only if it doesn't already exist (dedup via `$addToSet`). Returns the updated document.

---

## Status CRUD

Status records track per-user state (scores, submissions, enrollments) keyed by `(domainId, docType, docId, uid)`.

### `getStatus(domainId, docType, docId, uid)`

Retrieves a single status record. Returns `null` if not found.

### `getMultiStatus(domainId, docType, args)`

Returns a `FindCursor` for status records matching the filter (scoped to domain).

### `getMultiStatusWithoutDomain(docType, args)`

Returns a `FindCursor` for status records matching the filter (cross-domain). Used for system-wide queries.

### `setStatus(domainId, docType, docId, uid, args, returnDocument?)`

Sets fields on a status record, upserting if needed. `returnDocument` controls whether the returned document is `'before'` or `'after'` the update (default `'after'`). Uses `readConcern: 'majority'` when returning `'before'`.

### `setMultiStatus(domainId, docType, query, args)`

Bulk-updates multiple status records matching the filter.

### `countStatus(domainId, docType, query?)`

Counts status records matching the filter.

### `deleteMultiStatus(domainId, docType, query?)`

Deletes status records matching the filter.

### `incStatus(domainId, docType, docId, uid, key, value)`

Atomically increments a numeric field on a status record. Upserts if needed.

### `setStatusIfCondition(domainId, docType, docId, uid, filter, args?, returnDocument?)`

Conditionally sets status fields — only updates if the additional `filter` matches. Returns `false` on error (catches exceptions).

### `setIfNotStatus(domainId, docType, docId, uid, key, value, ifNot, args, returnDocument?)`

Sets a field to `value` only if it is not currently `ifNot`. Delegates to `setStatusIfCondition` with a `$ne` filter.

### `cappedIncStatus(domainId, docType, docId, uid, key, value, minValue?, maxValue?, setPayload?)`

Atomically increments a numeric field but clamps it within `[minValue, maxValue]` (defaults `[-1, 1]`). The increment is silently skipped if the field would exceed the cap. Optionally sets additional fields in the same operation.

---

## Revision-based Status Operations

These methods maintain a `rev` (revision counter) on status records for optimistic concurrency control.

### `revInitStatus(domainId, docType, docId, uid)`

Initializes or increments the `rev` counter on a status record. Upserts if needed.

### `revPushStatus(domainId, docType, docId, uid, key, value, id?)`

Pushes a value onto a status array field with revision tracking. If an element with matching `id` already exists, it replaces it instead of pushing. Increments `rev` in both cases.

### `revSetStatus(domainId, docType, docId, uid, rev, args)`

Sets status fields only if the current `rev` matches the provided value, then increments `rev`. Used for optimistic locking.

---

## Lifecycle

### `apply(ctx)`

Registers database indexes and the `domain/delete` cleanup handler. Called once during application startup.
