# TokenModel

Token management model for creating, querying, updating, and deleting various token types (sessions, registrations, password resets, OAuth, etc.).

> **Source**: `packages/hydrooj/src/model/token.ts`
> **Export**: `import { TokenModel } from 'hydrooj';`

`TokenModel` is a static-only class. All methods are called on the class itself (e.g. `TokenModel.add(...)`).

---

## Type Exports

### `TokenDoc`

Defined in `packages/hydrooj/src/interface.ts`:

```typescript
interface TokenDoc {
    _id: string;
    tokenType: number;
    createAt: Date;
    updateAt: Date;
    expireAt: Date;
    [key: string]: any;
}
```

The index signature allows arbitrary data fields (e.g. `uid`, `email`, `challenge`) depending on the token type.

---

## Constants

### Token Types

| Constant | Value | Label | Description |
|----------|-------|-------|-------------|
| `TYPE_SESSION` | `0` | Session | Browser session tokens |
| `TYPE_REGISTRATION` | `2` | Registration | Email registration verification codes |
| `TYPE_CHANGEMAIL` | `3` | Change Email | Email change verification codes |
| `TYPE_OAUTH` | `4` | OAuth | OAuth provider tokens |
| `TYPE_LOSTPASS` | `5` | Lost Password | Password reset verification codes |
| `TYPE_EXPORT` | `6` | Export | Data export task tokens |
| `TYPE_IMPORT` | `7` | Import | Data import task tokens |
| `TYPE_WEBAUTHN` | `8` | WebAuthn | WebAuthn challenge tokens |

`TYPE_TEXTS` maps each type number to a human-readable label.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection<TokenDoc>` | MongoDB `token` collection |

---

## Methods

### CRUD

#### `add(tokenType, expireSeconds, data, id?)`

Creates a new token record with auto-generated or custom ID.

```typescript
static async add(
    tokenType: number,
    expireSeconds: number,
    data: any,
    id?: string,           // default: randomstring(32)
): Promise<[string, TokenDoc]>
```

Returns a tuple of `[tokenId, tokenDoc]`. Sets `createAt`, `updateAt`, and `expireAt` (now + `expireSeconds`) automatically.

#### `get(tokenId, tokenType)` `@ArgMethod`

Finds a single token by ID and type.

```typescript
static async get(
    tokenId: string,
    tokenType: number,
): Promise<TokenDoc | null>
```

#### `getMulti(tokenType, query?)`

Finds multiple tokens by type with optional additional MongoDB filter.

```typescript
static getMulti(
    tokenType: number,
    query?: Filter<TokenDoc>,
): Cursor<TokenDoc>
```

Returns a MongoDB cursor (not an array). Use `.toArray()` to materialize.

#### `update(tokenId, tokenType, expireSeconds, data)`

Updates a token's data and extends its expiration.

```typescript
static async update(
    tokenId: string,
    tokenType: number,
    expireSeconds: number,
    data: object,
): Promise<TokenDoc | null>
```

Returns the updated document, or `null` if not found. Sets `updateAt` to now and `expireAt` to now + `expireSeconds`.

#### `del(tokenId, tokenType)` `@ArgMethod`

Deletes a single token by ID and type.

```typescript
static async del(
    tokenId: string,
    tokenType: number,
): Promise<boolean>
```

Returns `true` if a document was deleted.

#### `createOrUpdate(tokenType, expireSeconds, data)`

Creates a token, or updates the existing one matching `tokenType` + `data`.

```typescript
static async createOrUpdate(
    tokenType: number,
    expireSeconds: number,
    data: any,
): Promise<string>
```

Returns the token ID (existing or newly created).

---

### Session Queries

#### `getSessionListByUid(uid)` `@ArgMethod`

Gets up to 100 session tokens for a user, sorted by most recently updated.

```typescript
static async getSessionListByUid(
    uid: number,
): Promise<TokenDoc[]>
```

#### `getMostRecentSessionByUid(uid, projection)` `@ArgMethod`

Gets the most recently updated session for a user with selective field projection.

```typescript
static async getMostRecentSessionByUid(
    uid: number,
    projection: string[],
): Promise<TokenDoc | null>
```

Only the fields listed in `projection` (plus no `_id`) are returned.

---

### Bulk Operations

#### `delByUid(uid)` `@ArgMethod`

Deletes all tokens for a user (all types).

```typescript
static async delByUid(uid: number): Promise<any>
```

Used for user ban/logout flows to revoke all sessions and pending tokens at once.

---

## Indexes

Created in `apply()` on startup:

| Name | Key | Notes |
|------|-----|-------|
| `basic` | `{ uid: 1, tokenType: 1, updateAt: -1 }` | Sparse |
| `expire` | `{ expireAt: -1 }` | TTL index (`expireAfterSeconds: 0`) — MongoDB auto-deletes expired tokens |

---

## `@ArgMethod` Summary

Methods marked with `@ArgMethod` are callable via argument/CLI patterns:

- `get` — look up a token by ID + type
- `del` — delete a token by ID + type
- `getSessionListByUid` — list sessions for a user
- `getMostRecentSessionByUid` — get latest session for a user
- `delByUid` — revoke all tokens for a user
