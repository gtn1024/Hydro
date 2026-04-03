# SolutionModel

Solution (题解) model for managing problem solutions, replies, and votes.

> **Source**: `packages/hydrooj/src/model/solution.ts`
> **Export**: `import { SolutionModel } from 'hydrooj';`

`SolutionModel` is a static-only class. All methods are called on the class itself (e.g. `SolutionModel.add(...)`).

All methods delegate to the generic `document` subsystem using `document.TYPE_PROBLEM_SOLUTION` as the document type.

---

## Methods

### CRUD

#### `add(domainId: string, pid: number, owner: number, content: string): Promise<ObjectId>`

Create a new solution for problem `pid`. Initializes with empty `reply` array and `vote: 0`. Returns the inserted document `_id`.

#### `get(domainId: string, psid: ObjectId): Promise<Document>`

Get a single solution by ID. Throws `SolutionNotFoundError` if not found.

#### `getMany(domainId: string, query: any, sort: any, page: number, limit: number): Promise<Document[]>`

Paginated list of solutions matching `query`, sorted by `sort`. Applies `skip`/`limit` for pagination.

#### `edit(domainId: string, psid: ObjectId, content: string): Promise<void>`

Update the content of an existing solution.

#### `del(domainId: string, psid: ObjectId): Promise<[void, void]>`

Delete a solution and all associated status records (votes) in parallel.

#### `count(domainId: string, query: any): Promise<number>`

Count solutions matching the given query.

### Listing

#### `getMulti(domainId: string, pid: number, query?: any): Cursor<Document>`

Get all solutions for a specific problem. Results are sorted by `vote` descending (highest voted first). Optional additional query filters can be passed.

#### `getByUser(domainId: string, uid: number): Cursor<Document>`

Get all solutions by a specific user. Results are sorted by `_id` descending (newest first).

### Replies

#### `reply(domainId: string, psid: ObjectId, owner: number, content: string): Promise<void>`

Add a reply to a solution. Appends to the `reply` sub-document array.

#### `getReply(domainId: string, psid: ObjectId, psrid: ObjectId): Promise<Document>`

Get a specific reply within a solution by its ID.

#### `editReply(domainId: string, psid: ObjectId, psrid: ObjectId, content: string): Promise<void>`

Update the content of an existing reply.

#### `delReply(domainId: string, psid: ObjectId, psrid: ObjectId): Promise<void>`

Delete a specific reply from a solution.

### Voting

#### `vote(domainId: string, psid: ObjectId, uid: number, value: number): Promise<Document>`

Cast or update a vote on a solution. Tracks per-user vote status — if the user already voted, the vote delta is adjusted (not duplicated). A no-op if the new vote matches the existing one.

#### `getListStatus(domainId: string, psids: ObjectId[], uid: number): Promise<Record<string, { docId: ObjectId, vote: number }>>`

Batch-fetch the current user's vote status for multiple solutions. Returns a map keyed by solution ID string.

---

## Bus Events

| Event | Trigger |
|-------|---------|
| `problem/delete` | Deletes all solutions and their status records for the deleted problem |

---

## Notes

- Solutions use the generic `document` subsystem with `TYPE_PROBLEM_SOLUTION` as the document type and `TYPE_PROBLEM` as the parent type.
- `vote` uses `document.setStatus` with `'before'` strategy to detect prior votes, then adjusts the solution's `vote` count via `document.inc` — prevents double-counting.
- `del` performs two parallel deletions: the document itself and all associated status records.
