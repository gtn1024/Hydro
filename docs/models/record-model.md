# RecordModel

Judge record model providing submission creation, judge task dispatch, result updates, rejudge/reset, and submission statistics.

> **Source**: `packages/hydrooj/src/model/record.ts`
> **Export**: `import { RecordModel } from 'hydrooj';`

`RecordModel` is a static-only class. All methods are called on the class itself (e.g. `RecordModel.get(...)`).

---

## Type Exports

### `RecordDoc`

The primary record document type. Defined in `packages/hydrooj/src/interface.ts` as a mapped type over `RecordPayload` (from `@hydrooj/common`):

```typescript
type RecordDoc = {
    [K in keyof RecordPayload]: K extends 'hackTarget' | 'contest' ? ObjectId : RecordPayload[K];
} & {
    _id: ObjectId;
    notify?: boolean;
};
```

Key fields from `RecordPayload` (which extends `RecordJudgeInfo`):

| Field | Type | Description |
|-------|------|-------------|
| `domainId` | `string` | Domain the record belongs to |
| `pid` | `number` | Problem ID |
| `uid` | `number` | User ID who submitted |
| `lang` | `string` | Submission language |
| `code` | `string` | Submitted source code |
| `status` | `number` | Judge status (from `STATUS` enum) |
| `score` | `number` | Total score |
| `time` | `number` | Total time (ms) |
| `memory` | `number` | Total memory (KB) |
| `rejudged` | `boolean` | Whether this is a rejudge |
| `progress` | `number?` | Judge progress percentage |
| `source` | `string?` | Source identifier |
| `contest` | `ObjectId?` | Contest ID (or pretest/generate sentinel) |
| `input` | `string \| string[]?` | Pretest input data |
| `hackTarget` | `ObjectId?` | Target record ID for hack submissions |
| `files` | `Record<string, string>?` | Attached files |
| `judgeTexts` | `(string \| JudgeMessage)[]` | Judge output messages |
| `compilerTexts` | `string[]` | Compiler output messages |
| `testCases` | `Required<TestCase>[]` | Per-testcase results |
| `judger` | `number` | Judge user ID |
| `judgeAt` | `Date` | Timestamp of judging |
| `subtasks` | `Record<number, SubtaskResult>?` | Subtask results |

### `RecordStatDoc`

Statistics document stored in the `record.stat` collection for unique/accepted submission tracking:

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `ObjectId` | Same as the record's `_id` |
| `domainId` | `string` | Domain ID |
| `pid` | `number` | Problem ID |
| `uid` | `number` | User ID |
| `time` | `number` | Time used |
| `memory` | `number` | Memory used |
| `length` | `number` | Code length |
| `lang` | `string` | Language |

### `RecordHistoryDoc`

Archived judge results stored in `record.history` when a record is reset for rejudge:

| Field | Type | Description |
|-------|------|-------------|
| `_id` | `ObjectId` | History entry ID |
| `rid` | `ObjectId` | Original record ID |
| *(inherited from `RecordJudgeInfo`)* | | `score`, `time`, `memory`, `status`, `judgeTexts`, `compilerTexts`, `testCases`, `subtasks`, `judger`, `judgeAt` |

### `JudgeMeta`

Metadata passed to the judge task:

| Field | Type | Description |
|-------|------|-------------|
| `problemOwner` | `number` | Owner UID of the problem |
| `hackRejudge?` | `string` | Hack rejudge identifier |
| `rejudge?` | `boolean \| 'controlled'` | Rejudge mode |
| `type?` | `string` | Judge type hint |

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection<RecordDoc>` | MongoDB collection `record` |
| `collStat` | `Collection<RecordStatDoc>` | MongoDB collection `record.stat` |
| `collHistory` | `Collection<RecordHistoryDoc>` | MongoDB collection `record.history` |
| `PROJECTION_LIST` | `(keyof RecordDoc)[]` | Fields included in list view (15 fields) |
| `STAT_QUERY` | `object` | Sort orders for stat queries (`time`, `memory`, `length`, `date`) |
| `RECORD_PRETEST` | `ObjectId` | Sentinel ID (`000...000`) for pretest records |
| `RECORD_GENERATE` | `ObjectId` | Sentinel ID (`000...001`) for generate records |

---

## Methods

### Lookup

#### `get(_id: ObjectId): Promise<RecordDoc | null>`

Get a single record by its ObjectId.

#### `get(domainId: string, _id: ObjectId): Promise<RecordDoc | null>`

Get a single record by domainId and ObjectId. Returns `null` if the record's domainId doesn't match.

---

#### `getMulti(domainId: string, query: any, options?: FindOptions): Cursor<RecordDoc>`

Query multiple records. Automatically scopes by `domainId`. Returns a MongoDB cursor.

---

#### `getMultiStat(domainId: string, query: any, sortBy?: any): Cursor<RecordStatDoc>`

Query multiple stat documents. Defaults to sorting by `_id` descending.

---

#### `getList(domainId: string, rids: ObjectId[], fields?: (keyof RecordDoc)[]): Promise<Record<string, Partial<RecordDoc>>>`

Get records by an array of IDs, returned as a map keyed by hex-string `_id`. Deduplicates input IDs. Optionally projects specific fields.

---

#### `count(domainId: string, query: any): Promise<number>`

Count records matching the query, scoped by `domainId`.

---

### Statistics

#### `stat(domainId?: string): Promise<{ d5min, d1h, day, week, month, year, total }>`

Get submission counts across time windows: 5 minutes, 1 hour, 1 day, 1 week, 1 month, 1 year, and total. Optionally scoped to a domain.

Decorated with `@ArgMethod`.

---

### Submission & Judging

#### `add(domainId, pid, uid, lang, code, addTask, args?): Promise<ObjectId>`

Create a new judge record. Inserts into `coll` and optionally dispatches a judge task.

| Param | Type | Description |
|-------|------|-------------|
| `domainId` | `string` | Domain ID |
| `pid` | `number` | Problem ID |
| `uid` | `number` | Submitter UID |
| `lang` | `string` | Language identifier |
| `code` | `string` | Source code |
| `addTask` | `boolean` | Whether to dispatch judge task immediately |
| `args.type` | `'judge' \| 'rejudge' \| 'pretest' \| 'hack' \| 'generate'` | Submission type (default: `'judge'`) |
| `args.contest` | `ObjectId?` | Contest ID |
| `args.input` | `string[]?` | Pretest input data |
| `args.files` | `Record<string, string>?` | Attached files |
| `args.hackTarget` | `ObjectId?` | Target record for hack |
| `args.notify` | `boolean?` | Whether to send notification on judge completion |

Returns the inserted record's ObjectId.

---

#### `judge(domainId, rids, priority?, config?, meta?): Promise<any>`

Submit one or more records for judging. Resolves the problem (following references), deletes existing tasks for those records, and creates new judge tasks.

| Param | Type | Description |
|-------|------|-------------|
| `domainId` | `string` | Domain ID |
| `rids` | `MaybeArray<ObjectId> \| RecordDoc` | Record ID(s) or document(s) |
| `priority` | `number` | Task priority (default: `0`) |
| `config` | `ProblemConfigFile` | Override judge config (default: `{}`) |
| `meta` | `Partial<JudgeMeta>` | Judge metadata (default: `{}`) |

---

#### `submissionPriority(uid: number, base?: number): Promise<number>`

Calculate dynamic submission priority for a user. Reduces priority based on recent submission volume and pending tasks. Used to throttle high-frequency submitters.

---

### Update

#### `update(domainId, _id, $set?, $push?, $unset?, $inc?): Promise<RecordDoc | null>`

Update a single record or multiple records. Accepts MongoDB update operators (`$set`, `$push`, `$unset`, `$inc`). When `_id` is an array, performs `updateMany` and returns `null`; otherwise returns the updated document.

---

#### `updateMulti(domainId, $match, $set?, $push?, $unset?): Promise<number>`

Update multiple records matching a filter. Returns the number of modified documents.

---

#### `reset(domainId, rid, isRejudge): Promise<RecordDoc | null>`

Reset one or more records for rejudging. Archives current judge results to `record.history`, clears all judge fields back to defaults, and deletes associated stat entries and tasks.

---

## Bus Events

| Event | Payload | Description |
|-------|---------|-------------|
| `record/change` | `RecordDoc` | Broadcast when a new record is created (via `add()`) |
| `record/judge` | `rdoc: RecordDoc, updated: boolean` | Fired when judging completes; updates `record.stat` for accepted submissions and sends notifications |
