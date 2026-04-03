# ProblemModel

Problem management model providing CRUD operations, testdata/attachment management, import/export, and per-user status tracking.

> **Source**: `packages/hydrooj/src/model/problem.ts`
> **Export**: `import { ProblemModel } from 'hydrooj';`

`ProblemModel` is a static-only class. All methods are called on the class itself (e.g. `ProblemModel.get(...)`). It wraps the `document` subsystem with document type `TYPE_PROBLEM`.

---

## Type Exports

### `ProblemDoc`

The primary problem document type. Extends `Document` (which provides `_id`, `docId`, `docType`, `domainId`, `owner`, `maintainer?`). Additional fields declared via module augmentation in `interface.ts`:

| Field | Type | Description |
|-------|------|-------------|
| `pid` | `string` | Problem identifier (e.g. `"A"`, `"abc-123"`) |
| `title` | `string` | Problem title |
| `content` | `string` | Problem statement (plain text, HTML, or JSON for multi-language) |
| `nSubmit` | `number` | Total submission count |
| `nAccept` | `number` | Total accepted count |
| `tag` | `string[]` | Tags / categories |
| `data` | `FileInfo[]` | Test data file metadata |
| `additional_file` | `FileInfo[]` | Additional file metadata |
| `hidden` | `boolean?` | Whether the problem is hidden |
| `html` | `boolean?` | Whether content is raw HTML |
| `stats` | `any?` | Statistics object |
| `difficulty` | `number?` | Difficulty level |
| `sort` | `string?` | Sort key for ordering |
| `config` | `string?` | Judge config (YAML string) |
| `reference` | `{ domainId: string, pid: number }?` | Reference to source problem (for copied problems) |

### `ProblemDict`

```typescript
type ProblemDict = NumericDictionary<ProblemDoc>
```

A dictionary keyed by both `docId` (number) and `pid` (string).

### `ProblemStatusDoc`

Per-user problem status document. Extends `StatusDocBase`.

| Field | Type | Description |
|-------|------|-------------|
| `docId` | `number` | Problem docId |
| `docType` | `10` | Always `TYPE_PROBLEM` |
| `uid` | `number` | User ID |
| `rid` | `ObjectId?` | Record ID of best/latest submission |
| `score` | `number?` | Best score |
| `status` | `number?` | Best status code |
| `star` | `boolean?` | Whether user starred the problem |

### `Field`

```typescript
type Field = keyof ProblemDoc;
```

Union type of all ProblemDoc field names. Used in projection arrays.

---

## Projection Constants

Pre-built field projection arrays for common query patterns.

| Constant | Fields | Use Case |
|----------|--------|----------|
| `PROJECTION_LIST` | `_id`, `domainId`, `docType`, `docId`, `pid`, `owner`, `title`, `nSubmit`, `nAccept`, `difficulty`, `tag`, `hidden`, `stats` | Problem list pages |
| `PROJECTION_CONTEST_LIST` | `PROJECTION_BASE` + `config` | Contest problem lists |
| `PROJECTION_CONTEST_DETAIL` | `PROJECTION_CONTEST_LIST` + `content`, `html`, `data`, `additional_file`, `reference`, `maintainer` | Contest problem detail |
| `PROJECTION_PUBLIC` | `PROJECTION_LIST` + `content`, `html`, `data`, `config`, `additional_file`, `reference`, `maintainer` | Full public problem view |

---

## CRUD Operations

### `add(domainId, pid?, title, content, owner, tag?, meta?)`

Create a new problem with auto-incremented `docId`. Fires `problem/before-add` and `problem/add` events.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domainId` | `string` | — | Domain ID |
| `pid` | `string` | `''` | Problem identifier |
| `title` | `string` | — | Problem title |
| `content` | `string` | — | Problem statement |
| `owner` | `number` | — | Owner user ID |
| `tag` | `string[]` | `[]` | Tags |
| `meta` | `ProblemCreateOptions` | `{}` | Additional options |
| **Returns** | `Promise<number>` | | New `docId` |

### `addWithId(domainId, docId, pid?, title, content, owner, tag?, meta?)`

Create a problem with a specific `docId`. Used internally by `add` and import logic.

### `get(domainId, pid, projection?, rawConfig?)`

Get a single problem by numeric `docId` or string `pid`. Automatically parses the judge config unless `rawConfig` is `true`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domainId` | `string` | — | Domain ID |
| `pid` | `string \| number` | — | Problem ID or pid |
| `projection` | `Projection<ProblemDoc>` | `PROJECTION_PUBLIC` | Fields to return |
| `rawConfig` | `boolean` | `false` | Skip config parsing |
| **Returns** | `Promise<ProblemDoc \| null>` | | |

### `getMulti(domainId, query, projection?)`

Get a MongoDB cursor for querying multiple problems, sorted by `sort` field.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domainId` | `string` | — | Domain ID |
| `query` | `Filter<ProblemDoc>` | — | MongoDB filter |
| `projection` | `Field[]` | `PROJECTION_LIST` | Fields to return |
| **Returns** | `MongoDB.Cursor<ProblemDoc>` | | |

### `list(domainId, query, page, pageSize, projection?)` *(deprecated)*

Paginated problem list. Returns `[docs, count, page]`.

### `edit(domainId, _id, $set)`

Update problem fields. Recalculates `sort` key when `pid` changes. Fires `problem/before-edit` and `problem/edit` events.

| Parameter | Type | Description |
|-----------|------|-------------|
| `domainId` | `string` | Domain ID |
| `_id` | `number` | Problem `docId` |
| `$set` | `Partial<ProblemDoc>` | Fields to update |
| **Returns** | `Promise<ProblemDoc>` | Updated document |

### `del(domainId, docId)`

Delete a problem, its statuses, and associated storage files. Fires `problem/before-del` and `problem/delete` events.

| Parameter | Type | Description |
|-----------|------|-------------|
| `domainId` | `string` | Domain ID |
| `docId` | `number` | Problem `docId` |
| **Returns** | `Promise<boolean>` | Whether anything was deleted |

### `count(domainId, query)`

Count problems matching a filter.

### `copy(domainId, _id, target, pid?, hidden?)`

Copy a problem to another domain, creating a reference link back to the original.

### `random(domainId, query)`

Get a random problem `pid` or `docId` matching the filter. Returns `null` if none found.

---

## Batch Lookup

### `getList(domainId, pids, canViewHidden?, doThrow?, projection?, indexByDocIdOnly?)`

Get multiple problems as a `ProblemDict`. Resolves references, parses configs, and optionally throws for missing problems.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domainId` | `string` | — | Domain ID |
| `pids` | `number[]` | — | Array of `docId`s |
| `canViewHidden` | `number \| boolean` | `false` | UID (checks ownership/maintainer) or `true` to skip check |
| `doThrow` | `boolean` | `true` | Throw on missing problems |
| `projection` | `Field[]` | `PROJECTION_PUBLIC` | Fields to return |
| `indexByDocIdOnly` | `boolean` | `false` | Only index by `docId`, skip `pid` keys |
| **Returns** | `Promise<ProblemDict>` | | |

---

## Status Tracking

### `getStatus(domainId, docId, uid)`

Get the status record for a specific user on a problem.

### `getMultiStatus(domainId, query)`

Get a cursor for querying problem status documents.

### `getListStatus(domainId, uid, pids)`

Get status records for multiple problems, returned as a dict keyed by `docId`.

### `updateStatus(domainId, pid, uid, rid, status, score)`

Update a user's problem status. Only updates if the new status is better (accepted always wins).

| Parameter | Type | Description |
|-----------|------|-------------|
| `domainId` | `string` | Domain ID |
| `pid` | `number` | Problem `docId` |
| `uid` | `number` | User ID |
| `rid` | `ObjectId` | Record ID |
| `status` | `number` | Status code |
| `score` | `number` | Score |
| **Returns** | `Promise<boolean>` | Whether the status was updated |

### `incStatus(domainId, pid, uid, key, count)`

Increment a numeric field on a user's problem status.

### `setStar(domainId, pid, uid, star)`

Set or unset the star flag on a user's problem status.

---

## Testdata Management

### `addTestdata(domainId, pid, name, f, operator?)`

Upload a test data file. Updates the `data` array in the problem document.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domainId` | `string` | — | Domain ID |
| `pid` | `number` | Problem `docId` |
| `name` | `string` | File name |
| `f` | `Readable \| Buffer \| string` | — | File content or path |
| `operator` | `number` | `1` | Operator user ID |

### `renameTestdata(domainId, pid, file, newName, operator?)`

Rename a test data file in both storage and document metadata.

### `delTestdata(domainId, pid, name, operator?)`

Delete one or more test data files. `name` can be a single string or array.

---

## Additional File Management

### `addAdditionalFile(domainId, pid, name, f, operator?, skipUpload?)`

Upload an additional file (e.g. attachments). Similar to `addTestdata` but for the `additional_file` array.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domainId` | `string` | — | Domain ID |
| `pid` | `number` | Problem `docId` |
| `name` | `string` | File name |
| `f` | `Readable \| Buffer \| string` | — | File content or path |
| `operator` | `number` | `1` | Operator user ID |
| `skipUpload` | `boolean` | `false` | Skip storage upload (metadata only) |

### `renameAdditionalFile(domainId, pid, file, newName, operator?)`

Rename an additional file.

### `delAdditionalFile(domainId, pid, name, operator?)`

Delete one or more additional files. `name` accepts `string | string[]`.

---

## Sub-document Helpers

### `push(domainId, _id, key, value)`

Push an element onto an array field (`data` or `additional_file`).

### `pull(domainId, pid, key, values)`

Remove elements from an array field by value.

### `inc(domainId, _id, field, n)`

Increment a numeric field (e.g. `nSubmit`, `nAccept`).

---

## Permission Check

### `canViewBy(pdoc, udoc)`

Check whether a user can view a problem. Returns `true` if the user has `PERM_VIEW_PROBLEM` and either owns/maintains the problem, has `PERM_VIEW_PROBLEM_HIDDEN`, or the problem is not hidden.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pdoc` | `ProblemDoc` | Problem document |
| `udoc` | `User` | User document |
| **Returns** | `boolean` | |

---

## Import / Export

### `import(domainId, filepath, options?)`

Import problems from a ZIP archive or directory. Supports Hydro, ICPC, and DOMjudge package formats. Fires progress callbacks and handles config merging.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domainId` | `string` | — | Target domain |
| `filepath` | `string` | — | Path to `.zip` file or directory |
| `options.preferredPrefix` | `string?` | — | Replace PID prefix during import |
| `options.progress` | `Function?` | — | Progress callback |
| `options.override` | `boolean` | `false` | Override existing problems |
| `options.operator` | `number` | `1` | Operator user ID |
| `options.delSource` | `boolean?` | — | Delete source after import |
| `options.hidden` | `boolean?` | — | Mark imported problems as hidden |

### `export(domainId, pidFilter?)`

Export all problems (or those matching a PID regex filter) as a ZIP archive.

---

## Defaults

| Property | Description |
|----------|-------------|
| `default` | Template `ProblemDoc` with all fields set to safe defaults |
| `deleted` | Sentinel `ProblemDoc` used as placeholder for deleted problems |

---

## Events

The following events are emitted via `bus` during ProblemModel operations:

| Event | Arguments | When |
|-------|-----------|------|
| `problem/before-add` | `domainId, content, owner, docId, args` | Before creating a problem |
| `problem/add` | `args, result` | After creating a problem |
| `problem/before-edit` | `$set, $unset` | Before editing a problem |
| `problem/edit` | `result` | After editing a problem |
| `problem/before-del` | `domainId, docId` | Before deleting a problem |
| `problem/delete` | `domainId, docId` | After deleting a problem |
| `problem/addTestdata` | `domainId, pid, name, payload` | After adding test data |
| `problem/renameTestdata` | `domainId, pid, file, newName` | After renaming test data |
| `problem/delTestdata` | `domainId, pid, names` | After deleting test data |
| `problem/addAdditionalFile` | `domainId, pid, name, payload` | After adding additional file |
| `problem/renameAdditionalFile` | `domainId, pid, file, newName` | After renaming additional file |
| `problem/delAdditionalFile` | `domainId, pid, names` | After deleting additional file |
