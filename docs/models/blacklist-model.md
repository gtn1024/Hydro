# BlackListModel

Blacklist model for blocking users or entities by ID with optional expiration.

> **Source**: `packages/hydrooj/src/model/blacklist.ts`
> **Export**: `import { BlackListModel } from 'hydrooj';`

`BlackListModel` is a static-only class. All methods are called on the class itself (e.g. `BlackListModel.add(...)`).

All 3 methods are decorated with `@ArgMethod` — they are callable via argument/CLI patterns.

---

## Methods

### `add(id: string, expire?: Date | number): Promise<WithId<Document>>`

Adds an ID to the blacklist with an optional expiration. Uses upsert — updates `expireAt` if the entry already exists.

**Expiration logic:**
- `expire === 0` → 1000 months from now (effectively permanent)
- `expire` is a `number` → that many months from now
- `expire` is a `Date` → used directly
- `expire` omitted → 365 days from now

**@ArgMethod**

### `get(id: string): Promise<WithId<Document> | null>`

Looks up a blacklist entry by ID. Returns `null` if not found.

**@ArgMethod**

### `del(id: string): Promise<DeleteResult>`

Removes a blacklist entry by ID.

**@ArgMethod**

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection` | MongoDB `blacklist` collection |

---

## Indexes

Created in `apply()` on startup:

| Name | Key | Notes |
|------|-----|-------|
| `expire` | `{ expireAt: -1 }` | TTL index — auto-deletes expired entries (`expireAfterSeconds: 0`) |

---

## Notes

- The collection uses a MongoDB TTL index on `expireAt` — expired entries are automatically removed by MongoDB.
- `add` with `expire=0` sets expiration to 1000 months, not truly permanent.
