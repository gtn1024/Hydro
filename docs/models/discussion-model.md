# DiscussionModel

Discussion (forum) model for managing threaded discussions, replies, nested tail-replies, reactions, discussion nodes (categories), and parent-entity resolution.

> **Source**: `packages/hydrooj/src/model/discussion.ts`
> **Export**: `import { DiscussionModel } from 'hydrooj';` (available as `ctx.model.discussion`)

DiscussionModel is a plain module with exported functions (not a class). All functions are called directly (e.g. `DiscussionModel.add(...)`).

---

## Constants & Types

### `coll`

MongoDB collection for `discussion.history` — stores edit history records.

### `typeDisplay: Record<number, string>`

Maps document type constants to human-readable names: `{ 10: 'problem', 20: 'contest', 30: 'node', 40: 'training' }`.

### `PROJECTION_LIST: Field[]`

Fields returned in list views: `_id`, `domainId`, `docType`, `docId`, `highlight`, `nReply`, `views`, `pin`, `updateAt`, `owner`, `parentId`, `parentType`, `title`, `hidden`.

### `PROJECTION_PUBLIC: Field[]`

Fields returned in detail views — extends `PROJECTION_LIST` with `content`, `edited`, `react`, `maintainer`, `lock`.

### `HISTORY_PROJECTION_PUBLIC: (keyof DiscussionHistoryDoc)[]`

Fields returned in history views: `title`, `content`, `docId`, `uid`, `time`.

### `DiscussionDoc` (interface)

Extends `Document` — the shape of a discussion record.

### `Field` (type)

`keyof DiscussionDoc` — union type of all discussion document field names.

---

## Discussion CRUD

### `add(domainId: string, parentType: number, parentId: ObjectId | number | string, owner: number, title: string, content: string, ip?: string, highlight: boolean, pin: boolean, hidden?: boolean): Promise<ObjectId>`

Creates a new discussion under a parent entity (problem, contest, training, or node). Fires `discussion/before-add` and `discussion/add` bus events. Returns the new discussion ID.

### `get<T extends Field>(domainId: string, did: ObjectId, projection?: T[]): Promise<Pick<DiscussionDoc, T>>`

Retrieves a single discussion by ID with the specified field projection. Defaults to `PROJECTION_PUBLIC`.

### `edit(domainId: string, did: ObjectId, $set: Partial<DiscussionDoc>): Promise<void>`

Updates discussion fields. If `content` is changed, automatically inserts a history record into the `coll` collection.

### `del(domainId: string, did: ObjectId): Promise<void>`

Deletes a discussion and all its associated replies, statuses, and history records.

### `inc(domainId: string, did: ObjectId, key: NumberKeys<DiscussionDoc>, value: number): Promise<DiscussionDoc | null>`

Atomically increments a numeric field on a discussion (e.g. `views`).

### `getMulti(domainId: string, query?: Filter<DiscussionDoc>, projection?: Field[]): FindCursor<DiscussionDoc>`

Returns a cursor of discussions matching the query, sorted by `pin` descending then `docId` descending. Defaults to `PROJECTION_LIST`.

### `count(domainId: string, query: Filter<DiscussionDoc>): Promise<number>`

Returns the count of discussions matching the given query.

---

## Reply CRUD

### `addReply(domainId: string, did: ObjectId, owner: number, content: string, ip: string): Promise<ObjectId>`

Adds a reply to a discussion. Atomically increments `nReply` and updates `updateAt` on the parent discussion. Returns the new reply ID.

### `getReply(domainId: string, drid: ObjectId): Promise<DiscussionReplyDoc | null>`

Retrieves a single reply by ID.

### `editReply(domainId: string, drid: ObjectId, content: string, uid: number, ip: string): Promise<DiscussionReplyDoc | null>`

Updates a reply's content. Automatically inserts a history record and sets `edited: true`.

### `delReply(domainId: string, drid: ObjectId): Promise<void>`

Deletes a reply and all its tail-replies and history records. Atomically decrements `nReply` on the parent discussion. Throws `DocumentNotFoundError` if the reply doesn't exist.

### `getMultiReply(domainId: string, did: ObjectId): FindCursor<DiscussionReplyDoc>`

Returns a cursor of replies for a discussion, sorted by `_id` descending.

### `getListReply(domainId: string, did: ObjectId): Promise<DiscussionReplyDoc[]>`

Returns all replies for a discussion as an array (convenience wrapper over `getMultiReply`).

---

## Tail Reply (Nested Reply) CRUD

Tail replies are second-level replies nested within a top-level reply, stored in the `reply` array field of `DiscussionReplyDoc`.

### `addTailReply(domainId: string, drid: ObjectId, owner: number, content: string, ip: string): Promise<[DiscussionReplyDoc, ObjectId]>`

Adds a nested reply to a top-level reply. Also updates the parent discussion's `updateAt`. Returns the updated parent reply document and the new tail-reply ID.

### `getTailReply(domainId: string, drid: ObjectId, drrid: ObjectId): Promise<[DiscussionReplyDoc, DiscussionTailReplyDoc] | [null, null]>`

Retrieves a specific tail-reply within a parent reply. Returns `[null, null]` if not found.

### `editTailReply(domainId: string, drid: ObjectId, drrid: ObjectId, content: string, uid: number, ip: string): Promise<DiscussionTailReplyDoc>`

Updates a tail-reply's content. Automatically inserts a history record and sets `edited: true`.

### `delTailReply(domainId: string, drid: ObjectId, drrid: ObjectId): Promise<[void, void]>`

Deletes a tail-reply and its associated history records.

---

## Reactions

### `react(domainId: string, docType: keyof DocType, did: ObjectId, id: string, uid: number, reverse?: boolean): Promise<[any, any]>`

Toggles a reaction emoji (`id`) by a user on a discussion or reply. If `reverse` is true, removes the reaction. Returns `[updatedDoc, statusDoc]`.

### `getReaction(domainId: string, docType: keyof DocType, did: ObjectId, uid: number): Promise<Record<string, number>>`

Returns the user's reaction state for a document as a map of emoji ID to value.

---

## History

### `getHistory(domainId: string, docId: ObjectId, query?: Filter<DiscussionHistoryDoc>, projection?: (keyof DiscussionHistoryDoc)[]): Promise<DiscussionHistoryDoc[]>`

Returns edit history records for a discussion or reply, sorted by `time` descending.

---

## User Status

### `setStar(domainId: string, did: ObjectId, uid: number, star: boolean): Promise<void>`

Sets or clears the star flag on a discussion for a user.

### `getStatus(domainId: string, did: ObjectId, uid: number): Promise<any>`

Retrieves a single user's status record for a discussion (includes star, react, etc.).

### `setStatus(domainId: string, did: ObjectId, uid: number, $set: any): Promise<void>`

Overwrites status fields for a user on a discussion.

---

## Nodes (Categories)

Discussion nodes act as top-level categories for organizing discussions.

### `addNode(domainId: string, _id: string, category: string, args?: any): Promise<any>`

Creates a discussion node with the given ID and category name. Optional `args` for additional fields.

### `getNode(domainId: string, _id: string): Promise<any>`

Retrieves a single discussion node by its string ID.

### `getNodes(domainId: string): Promise<any[]>`

Returns all discussion nodes for a domain as an array.

### `flushNodes(domainId: string): Promise<any>`

Deletes all discussion nodes for a domain.

---

## Virtual Nodes (Parent Entities)

Virtual nodes resolve the parent entity a discussion is attached to (problem, contest, training, or discussion node).

### `getVnode(domainId: string, type: number, id: string, uid?: number): Promise<any>`

Resolves the parent entity for a discussion. Handles problems (by numeric ID), contests/trainings (by ObjectId), and discussion nodes (by string ID). Optionally populates `attend` status for the given user. Throws `DiscussionNodeNotFoundError` if not found.

### `getListVnodes(domainId: string, ddocs: any, getHidden?: boolean, assign?: string[]): Promise<Record<number, Record<string, any>>>`

Batch resolves parent entities for multiple discussions. Returns a nested map `{ [parentType]: { [parentId]: vnode } }`. Filters out hidden nodes and assignment-restricted items by default.

### `checkVNodeVisibility(type: number, vnode: any, user: User): boolean`

Returns `true` if the user is allowed to see the parent entity. Checks hidden problem visibility and assignment-group restrictions for contests/trainings.

---

## Lifecycle

### `apply(ctx: Context): void`

Registers lifecycle hooks: cascades discussion deletion when a problem is deleted, and syncs `hidden` status from problem edits to associated discussions.

---

## Notes

- Discussion is a document-type model (`TYPE_DISCUSSION = 30`). CRUD and status operations delegate to the shared `document` module.
- The model supports three levels of nesting: **Discussion** -> **Reply** -> **Tail Reply**.
- All content changes (discussion edits, reply edits, tail-reply edits) automatically insert history records into the `discussion.history` collection.
- `add()` fires bus events (`discussion/before-add`, `discussion/add`) enabling plugins to intercept or react to discussion creation.
- `apply()` handles cross-entity cascading: deleting a problem removes all its associated discussions and replies.
