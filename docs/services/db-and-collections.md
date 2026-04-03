# db (MongoService) & Collections

MongoDB database service providing collection access, index management, pagination, and ranking utilities.

> **Source**: `packages/hydrooj/src/service/db.ts`
> **Export**: `import { db, Collections } from 'hydrooj';`
> **Access**: `ctx.db` (preferred) or `db` (deprecated global proxy)

---

## MongoService (`ctx.db`)

A Cordis `Service` registered under the `'db'` key. Available via `ctx.db` after the `database/connect` lifecycle event.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `client` | `MongoClient` | Underlying MongoDB client instance |
| `db` | `Db` | Native MongoDB `Db` instance for the connected database |

### Methods

#### `collection<K extends keyof Collections>(c: K): Collection<Collections[K]>`

Returns a typed MongoDB collection. Respects `prefix` and `collectionMap` config for name remapping.

#### `paginate<T>(cursor: FindCursor<T>, page: number, pageSize: number): Promise<[docs: T[], numPages: number, count: number]>`

Paginates a find cursor. Returns a tuple of page documents, total page count, and total document count. Throws `ValidationError` if `page <= 0`.

#### `ranked<T>(cursor: T[] | FindCursor<T>, equ: (a: T, b: T) => boolean): Promise<[number, T][]>`

Assigns dense ranks to sorted results. Documents with `unrank: true` get rank `0`. Tied documents (per `equ` comparator) share the same rank.

#### `ensureIndexes<T>(coll: Collection<T>, ...indexes: IndexDescription[]): Promise<void>`

Creates or updates indexes on a collection. Only runs on `NODE_APP_INSTANCE=0`. Compares existing indexes by name/key and drops+recreates if the definition changed. Text indexes are handled specially to avoid conflicts.

#### `clearIndexes<T>(coll: Collection<T>, dropIndex: string[]): Promise<void>`

Drops named indexes from a collection if they exist. Only runs on `NODE_APP_INSTANCE=0`.

#### `fixExpireAfter(): Promise<void>`

Workaround for MongoDB TTL indexes not expiring in non-replica-set mode. Manually deletes documents past their `expireAfterSeconds` threshold. Called hourly via interval.

### Static Methods

#### `MongoService.getUrl(): Promise<string | null>`

Resolves the MongoDB connection URL from config or environment. Returns `null` if no config is loaded. In CI mode, starts an in-memory `mongodb-memory-server` instance.

---

## Collections

A TypeScript interface that maps collection names to their document types. Augmented via module declaration merging in `packages/hydrooj/src/interface.ts`.

**Export**: `import { Collections } from 'hydrooj';`

### Defined Collections

| Collection Name | Document Type | Description |
|-----------------|---------------|-------------|
| `blacklist` | `BlacklistDoc` | IP/email blacklist entries |
| `domain` | `DomainDoc` | Domain (site) documents |
| `domain.user` | `any` | Domain-user membership records |
| `record` | `RecordDoc` | Submission/judge records |
| `record.stat` | `RecordStatDoc` | Aggregated record statistics |
| `record.history` | `RecordHistoryDoc` | Record change history |
| `document` | `any` | Generic documents (problems, contests, trainings, discussions, etc.) |
| `document.status` | `StatusDocBase & DocStatusType` | Per-user document status (enrollment, progress, etc.) |
| `discussion.history` | `DiscussionHistoryDoc` | Discussion/reply edit history |
| `user` | `Udoc` | User accounts |
| `user.preference` | `UserPreferenceDoc` | User preference settings |
| `vuser` | `VUdoc` | Virtual users |
| `user.group` | `GDoc` | User groups |
| `check` | `System` | System health check records |
| `message` | `MessageDoc` | User messages/notifications |
| `token` | `TokenDoc` | Authentication tokens |
| `status` | `any` | System status records |
| `oauth` | `OauthMap` | OAuth provider mappings |
| `system` | `System` | System configuration documents |
| `task` | `Task` | Background task queue entries |
| `storage` | `FileNode` | File storage metadata |
| `oplog` | `OplogDoc` | Operation audit log entries |
| `event` | `EventDoc` | Domain event records |
| `opcount` | `OpCountDoc` | Rate-limit operation counters |
| `schedule` | `Schedule` | Scheduled job definitions |
| `contest.balloon` | `ContestBalloonDoc` | Contest balloon (notification) records |
| `lock` | `LockDoc` | Distributed lock entries |

### Usage

```typescript
import { Collections } from 'hydrooj';

// Access a typed collection via ctx.db
const coll = ctx.db.collection('document');       // Collection<any>
const userColl = ctx.db.collection('user');       // Collection<Udoc>
```

---

## Notes

- `db` (default export) is a deprecated Proxy that forwards to `app.get('db')`. Prefer `ctx.db` in plugins.
- The `Collections` interface is declared empty in `service/db.ts` and augmented in `interface.ts` via `declare module './service/db'`.
- Plugins can extend `Collections` via the same declaration-merge pattern to register custom collection types.
