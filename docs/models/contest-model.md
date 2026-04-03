# ContestModel

Contest model for managing competitions with multiple scoring rules (ACM/ICPC, OI, IOI, IOI Strict, Ledo, Assignment), scoreboard generation, balloon notifications, clarifications, and print tasks.

> **Source**: `packages/hydrooj/src/model/contest.ts`
> **Export**: `import * as contest from 'hydrooj/model/contest';` (available as `ctx.model.contest`)

ContestModel is a plain module with exported functions (not a class). All functions are called directly. It delegates CRUD and status operations to the shared `document` module with `TYPE_CONTEST = 30`.

---

## Constants & Types

### `RULES: ContestRules`

Object mapping rule names to their rule definitions. Keys: `acm`, `oi`, `homework`, `ioi`, `ledo`, `strictioi`. Each rule defines scoring logic, scoreboard rendering, visibility controls, and record projection behavior.

### `PrintTaskStatus: enum`

Enum with values: `pending`, `printing`, `printed`, `failed`. Used for contest print task status tracking.

### `buildContestRule<T>(def): ContestRule<T>`

Factory function that builds a new contest rule from a partial definition, inheriting and binding all unspecified functions from a base rule. Used internally to create the built-in rules.

---

## State Predicates

Utility functions that evaluate the current phase of a contest based on its `beginAt`/`endAt` timestamps.

### `isNew(tdoc: Tdoc, days = 1): boolean`

Returns `true` if the contest starts more than `days` days from now.

### `isUpcoming(tdoc: Tdoc, days = 7): boolean`

Returns `true` if the contest starts within `days` days but hasn't started yet.

### `isNotStarted(tdoc: Tdoc): boolean`

Returns `true` if the current time is before `tdoc.beginAt`.

### `isOngoing(tdoc: Tdoc, tsdoc?: any): boolean`

Returns `true` if the current time is between `beginAt` and `endAt`. For duration-based contests, also checks the user's `startAt` hasn't exceeded the allowed duration.

### `isDone(tdoc: Tdoc, tsdoc?: any): boolean`

Returns `true` if the contest has ended. For duration-based contests, also considers the user's `startAt` plus duration.

### `isLocked(tdoc: Tdoc, time = new Date()): boolean`

Returns `true` if the scoreboard is locked (`lockAt` is set and has passed) and not yet unlocked.

### `isExtended(tdoc: Tdoc): boolean`

Returns `true` if the current time is in the penalty/extension period (between `penaltySince` and `endAt`).

### `statusText(tdoc: Tdoc, tsdoc?: any): string`

Returns a human-readable status string: `'New'`, `'Ready (☆▽☆)'`, `'Live...'`, or `'Done'`.

---

## CRUD

### `add(domainId, title, content, owner, rule, beginAt?, endAt?, pids?, rated?, data?): Promise<ObjectId>`

Creates a new contest. Validates the rule exists and `beginAt < endAt`. Fires `contest/before-add` and `contest/add` bus events.

### `edit(domainId: string, tid: ObjectId, $set: Partial<Tdoc>): Promise<Tdoc>`

Updates contest fields. Validates the rule if changed. Fires `contest/before-edit` and `contest/edit` bus events.

### `del(domainId: string, tid: ObjectId): Promise<void>`

Deletes a contest and all associated user statuses. Fires `contest/del` bus event.

### `get(domainId: string, tid: ObjectId): Promise<Tdoc>`

Retrieves a single contest by ID. Throws `ContestNotFoundError` if not found.

### `getMulti(domainId: string, query?): FindCursor<Tdoc>`

Returns a cursor of contests matching the query, sorted by `beginAt` descending.

### `getRelated(domainId: string, pid: number, rule?: string): Promise<Tdoc[]>`

Finds contests that contain a specific problem (`pid` in `pids`). Filters out hidden rules unless a specific `rule` is given.

### `count(domainId: string, query: any): Promise<number>`

Returns the count of contests matching the query.

---

## Status

### `getStatus(domainId: string, tid: ObjectId, uid: number): Promise<Tsdoc | null>`

Retrieves a single user's contest status.

### `getMultiStatus(domainId: string, query: any): FindCursor`

Returns a cursor of contest statuses matching the query.

### `getListStatus(domainId: string, uid: number, tids: ObjectId[]): Promise<Record<string, Tsdoc>>`

Batch retrieves statuses for multiple contests for a given user, returned as a map keyed by `tid.toHexString()`.

### `setStatus(domainId: string, tid: ObjectId, uid: number, $set: any): Promise<void>`

Overwrites status fields for a user on a specific contest.

### `updateStatus(domainId, tid, uid, rid, pid, opts?): Promise<Tsdoc>`

Pushes a new journal entry (submission result) and recalculates the user's stats using the contest rule's `stat` function. Uses revision-based status update for concurrency safety. Also triggers balloon creation for accepted submissions.

### `countStatus(domainId: string, query: any): Promise<number>`

Returns the count of contest statuses matching the query.

### `attend(domainId: string, tid: ObjectId, uid: number, payload?: any): Promise<{}>`

Registers a user for a contest. Throws `ContestAlreadyAttendedError` if already attended. Uses `cappedIncStatus` to atomically prevent double attendance.

### `getAndListStatus(domainId: string, tid: ObjectId): Promise<[Tdoc, Tsdoc[]]>`

Gets the contest document and all user statuses sorted by the rule's `statusSort`.

### `recalcStatus(domainId: string, tid: ObjectId): Promise<Tsdoc[]>`

Recalculates all user statuses from their journals using the contest rule's `stat` function.

### `unlockScoreboard(domainId: string, tid: ObjectId): Promise<void>`

Unlocks a locked scoreboard by setting `unlocked: true` and recalculating all statuses.

---

## Scoreboard Visibility

Functions that check whether a user can view certain contest information. All use `this` context with `{ user: User }`.

### `canViewHiddenScoreboard(this: { user }, tdoc: Tdoc): boolean`

Returns `true` if the user owns the contest or has `PERM_VIEW_CONTEST_HIDDEN_SCOREBOARD` (or `PERM_VIEW_HOMEWORK_HIDDEN_SCOREBOARD` for homework).

### `canShowRecord(this: { user }, tdoc: Tdoc, allowPermOverride = true): boolean`

Returns `true` if the contest rule allows showing all records at the current time, or the user has scoreboard override permission.

### `canShowSelfRecord(this: { user }, tdoc: Tdoc, allowPermOverride = true): boolean`

Returns `true` if the contest rule allows showing the user's own records, or the user has scoreboard override permission.

### `canShowScoreboard(this: { user }, tdoc: Tdoc, allowPermOverride = true): boolean`

Returns `true` if the contest rule allows showing the scoreboard, or the user has scoreboard override permission.

### `getScoreboard(this: Handler, domainId, tid, config): Promise<[Tdoc, ScoreboardRow[], BaseUserDict, ProblemDict]>`

Builds the full scoreboard for a contest using the rule's `scoreboard` function. Throws `ContestScoreboardHiddenError` if the scoreboard is not visible. Fires `contest/scoreboard` bus event.

---

## Balloon

Balloon management for ACM-style first-blood notifications.

### `addBalloon(domainId, tid, uid, rid, pid): Promise<ObjectId | null>`

Adds a balloon for an accepted submission. Determines if it's the first accept for that problem. Emits `contest/balloon` event.

### `getBalloon(domainId: string, tid: ObjectId, _id: ObjectId): Promise<BalloonDoc>`

Retrieves a single balloon by ID.

### `getMultiBalloon(domainId: string, tid: ObjectId, query?: any): FindCursor`

Returns a cursor of balloons for a contest.

### `updateBalloon(domainId: string, tid: ObjectId, _id: ObjectId, $set: any): Promise<BalloonDoc>`

Updates a balloon's fields.

---

## Clarification

Clarification (question/answer) management for contests, stored as sub-documents with `TYPE_CONTEST_CLARIFICATION`.

### `addClarification(domainId, tid, owner, content, ip, subject?): Promise<ObjectId>`

Creates a new clarification question on a contest.

### `addClarificationReply(domainId, did, owner, content, ip): Promise<void>`

Appends a reply to an existing clarification.

### `getClarification(domainId: string, did: ObjectId): Promise<ClarificationDoc>`

Retrieves a single clarification by ID.

### `getMultiClarification(domainId: string, tid: ObjectId, owner?: number): Promise<ClarificationDoc[]>`

Lists clarifications for a contest. If `owner` is specified, includes only those visible to that user (owner `$in: [owner, 0]`).

---

## Print Task

Print task management for on-site contests. Uses `TYPE_CONTEST_PRINT`.

### `addPrintTask(domainId, tid, uid, name, content): Promise<ObjectId>`

Creates a new print task with `pending` status.

### `updatePrintTask(domainId, tid, taskId, $set): Promise<boolean>`

Updates a print task's fields. Returns `true` if modified.

### `allocatePrintTask(domainId, tid): Promise<PrintDoc | null>`

Atomically claims the next pending print task by setting its status to `printing`.

### `getMultiPrintTask(domainId: string, tid: ObjectId, query?: any): FindCursor`

Returns a cursor of print tasks for a contest, sorted by `_id` ascending.

---

## Other

### `applyProjection(tdoc: Tdoc, rdoc: RecordDoc, udoc: User): RecordDoc`

Applies the contest rule's `applyProjection` to strip sensitive fields (score, time, memory, test cases, etc.) from a record while the contest is ongoing.

### `apply(ctx: Context): Promise<void>`

Lifecycle hook. Registers the `contest/balloon` event listener (sends first-blood messages) and ensures database indexes on the balloon collection.

---

## Notes

- Contest is a document-type model (`TYPE_CONTEST = 30`). CRUD and status operations delegate to the shared `document` module.
- Six built-in rules: `acm` (XCPC), `oi`, `ioi`, `strictioi`, `ledo`, `homework` (hidden). Each rule defines `stat`, `scoreboard`, `scoreboardRow`, `scoreboardHeader`, `showScoreboard`, `showRecord`, `showSelfRecord`, `applyProjection`, and `check`.
- `updateStatus` uses revision-based status (`revPushStatus` + `revSetStatus`) for optimistic concurrency control on journal updates.
- `attend` uses `cappedIncStatus` with cap=1 to atomically prevent double attendance; re-throws as `ContestAlreadyAttendedError`.
- `add` and `edit` fire before/after bus events (`contest/before-add`, `contest/add`, `contest/before-edit`, `contest/edit`).
- Clarifications use `TYPE_CONTEST_CLARIFICATION` as a separate docType with parent references to the contest.
- Print tasks use `TYPE_CONTEST_PRINT` as a separate docType with parent references to the contest.
