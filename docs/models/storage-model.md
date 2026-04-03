# StorageModel

File storage model for managing uploads, downloads, and file lifecycle with object storage backends.

> **Source**: `packages/hydrooj/src/model/storage.ts`
> **Export**: `import { StorageModel } from 'hydrooj';`

`StorageModel` is a static-only class. All methods are called on the class itself (e.g. `StorageModel.put(...)`).

---

## Methods

### Upload & Write

#### `put(path: string, file: string | Buffer | Readable, owner?: number): Promise<string>`

Uploads a file to storage at the given path. Deletes any existing file at the same path first, generates a unique storage ID, and stores both in object storage and MongoDB. Returns the `path`.

#### `copy(src: string, dst: string): Promise<string>`

Creates a copy of a file at a new path. The copy references the original storage object via a `link` field (no duplicate storage). Deletes any existing file at `dst` first. Returns the new storage `_id`.

### Read & Download

#### `get(path: string, savePath?: string): Promise<Readable | string>`

Retrieves a file by path. Updates `lastUsage` timestamp. If the document has a `link` field, follows it to the actual storage object. If `savePath` is provided, saves to disk and returns the file path; otherwise returns a `Readable` stream.

#### `getMeta(path: string): Promise<object | null>`

Returns metadata for a file by path: `Content-Type`, `size`, `lastModified`, `etag`, and any custom metadata. Returns `null` if not found. Updates `lastUsage` timestamp.

#### `signDownloadLink(target: string, filename?: string, noExpire?: boolean, useAlternativeEndpointFor?: 'user' | 'judge'): Promise<string>`

Generates a signed URL for downloading a file. Supports optional filename override, disabling expiration, and routing through alternative endpoints for user or judge access. Updates `lastUsage` timestamp.

### File Operations

#### `rename(path: string, newPath: string, operator?: null | number): Promise<UpdateResult>`

Renames a file's path in the database. Optionally records the operator who performed the rename.

#### `move(src: string, dst: string): Promise<boolean>`

Moves a file from `src` to `dst` path. Returns `true` if the source file was found and moved, `false` otherwise.

#### `del(path: string[], operator?: number): Promise<void>`

Marks files for deletion. Does not immediately delete — sets `autoDelete` to 7 days from now. Handles linked files by swapping IDs so that files still referenced by other documents remain accessible. Operator is recorded for audit.

#### `list(target: string, recursive?: boolean): Promise<object[]>`

Lists files under a target path prefix. Returns an array of file documents with an added `name` field (relative path). Non-recursive mode lists only immediate children. Rejects paths containing `..` or `//`.

#### `exists(path: string): Promise<boolean>`

Checks whether a file exists at the given path (excluding auto-deleted files).

### Utility

#### `generateId(ext: string): string`

Generates a unique storage ID in the format `{3-char-nanoid}/{nanoid}{ext}`. Replaces `_` and `-` with `0` for filename safety. Always lowercase.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection` | MongoDB `storage` collection |

---

## Types

The file also exports a non-class function used internally:

- `apply(ctx: Context)` — Registers domain-delete handler (cleans up files when a domain is deleted) and a `storage.prune` worker that periodically removes expired files.

---

## Indexes

Created in `apply()` on startup (only on `NODE_APP_INSTANCE=0`):

| Key | Options | Notes |
|-----|---------|-------|
| `{ path: 1 }` | — | Primary lookup by file path |
| `{ path: 1, autoDelete: 1 }` | sparse | Excludes deleted files from queries |
| `{ link: 1 }` | sparse | Resolves linked/copied files |

---

## Notes

- Files are not immediately deleted by `del()` — they are marked with `autoDelete` (7 days) and cleaned up by the `storage.prune` scheduled task (runs hourly).
- `copy()` creates a lightweight reference (`link` field) to the original storage object rather than duplicating data in object storage.
- `_swapId` is a private method that swaps two file records' metadata to handle linked-file deletion safely.
- The `storage.prune` task also cleans submission files older than `submission.saveDays` system setting, and respects `server.keepFiles` to skip cleanup.
