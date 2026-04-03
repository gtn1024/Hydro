# UserModel

User management model providing CRUD operations, authentication helpers, and user group management.

> **Source**: `packages/hydrooj/src/model/user.ts`
> **Export**: `import { UserModel } from 'hydrooj';`

`UserModel` is a static-only class. All methods are called on the class itself (e.g. `UserModel.getById(...)`). It wraps the `user`, `vuser`, and `user.group` MongoDB collections with an LRU cache.

---

## User Lookup

### `getById(domainId, _id, scope?)`

Get a single user by numeric ID within a domain. Returns a fully initialized `User` instance or `null`.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domainId` | `string` | — | The domain context |
| `_id` | `number` | — | User ID (negative IDs lookup virtual users) |
| `scope` | `bigint \| string` | `PERM.PERM_ALL` | Permission scope mask |
| **Returns** | `Promise<User \| null>` | | |

### `getByUname(domainId, uname)`

Get a single user by username within a domain.

| Parameter | Type | Description |
|-----------|------|-------------|
| `domainId` | `string` | The domain context |
| `uname` | `string` | Username (case-insensitive) |
| **Returns** | `Promise<User \| null>` | |

### `getByEmail(domainId, mail)`

Get a single user by email address within a domain.

| Parameter | Type | Description |
|-----------|------|-------------|
| `domainId` | `string` | The domain context |
| `mail` | `string` | Email address (case-insensitive, Gmail normalization applied) |
| **Returns** | `Promise<User \| null>` | |

### `getList(domainId, uids)`

Get multiple users as a dict keyed by UID. Missing users fall back to `defaultUser`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `domainId` | `string` | The domain context |
| `uids` | `number[]` | Array of user IDs |
| **Returns** | `Promise<Udict>` | `Record<number, User>` |

### `getPrefixList(domainId, prefix, limit?)`

Search users by username or display name prefix. Searches both `unameLower` and domain display names.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `domainId` | `string` | — | The domain context |
| `prefix` | `string` | — | Search prefix (case-insensitive) |
| `limit` | `number` | `50` | Maximum results |
| **Returns** | `Promise<User[]>` | | |

### `getMulti(params?, projection?)`

Get a MongoDB cursor for querying users with optional filter and field projection.

| Parameter | Type | Description |
|-----------|------|-------------|
| `params` | `Filter<Udoc>` | MongoDB query filter |
| `projection` | `(keyof Udoc)[]` | Fields to include |
| **Returns** | `MongoDB.Cursor<Udoc>` | |

### `getListForRender(domainId, uids, showPrivateInfo?, extraFields?)`

Get user info dict optimized for frontend rendering. Merges user docs, virtual user docs, and domain user docs.

| Parameter | Type | Description |
|-----------|------|-------------|
| `domainId` | `string` | The domain context |
| `uids` | `number[]` | User IDs to fetch |
| `showPrivateInfo` | `boolean` | Whether to include private fields |
| `extraFields` | `string[]` | Additional fields to include |
| **Returns** | `Promise<BaseUserDict>` | |

---

## User Mutation

### `setById(uid, $set?, $unset?, $push?)`

Update a user document with MongoDB update operators. Invalidates cache automatically.

| Parameter | Type | Description |
|-----------|------|-------------|
| `uid` | `number` | User ID |
| `$set` | `Partial<Udoc>` | Fields to set |
| `$unset` | `Partial<Udoc>` | Fields to unset |
| `$push` | `object` | Fields to push (array append) |
| **Returns** | `Promise<Udoc \| null>` | Updated document (null if virtual user) |

### `setUname(uid, uname)`

Change a user's display name. Updates both `uname` and `unameLower`.

### `setEmail(uid, mail)`

Change a user's email. Applies Gmail normalization (`handleMailLower`).

### `setPassword(uid, password)`

Reset a user's password. Generates a new salt and rehashes with the `hydro` hash type.

### `setPriv(uid, priv)`

Set a user's privilege level directly.

| Parameter | Type | Description |
|-----------|------|-------------|
| `uid` | `number` | User ID |
| `priv` | `number` | Privilege bitmask (see `PRIV` constants) |
| **Returns** | `Promise<Udoc>` | Updated document |

### `setSuperAdmin(uid)`

Elevate user to super admin (`PRIV.PRIV_ALL`).

### `setJudge(uid)`

Set user as judge with appropriate privileges (`USER_PROFILE | JUDGE | VIEW_ALL_DOMAIN | READ_PROBLEM_DATA | UNLIMITED_ACCESS`).

### `ban(uid, reason?)`

Ban a user: sets privilege to `PRIV_NONE` and revokes all tokens.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `uid` | `number` | — | User ID |
| `reason` | `string` | `''` | Ban reason stored in `banReason` |

### `inc(_id, field, n?)`

Increment a numeric field on one or more users.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `_id` | `number \| number[]` | — | User ID(s) |
| `field` | `string` | — | Field name to increment |
| `n` | `number` | `1` | Increment amount (negative to decrement) |
| **Returns** | `Promise<Udoc[] \| null>` | Documents before increment |

---

## User Creation

### `create(mail, uname, password, uid?, regip?, priv?)`

Register a new user. Auto-allocates a UID if not provided. Waits for DB sync before returning.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mail` | `string` | — | Email address |
| `uname` | `string` | — | Display name |
| `password` | `string` | — | Plaintext password |
| `uid` | `number?` | auto | Force a specific UID, or auto-allocate |
| `regip` | `string` | `'127.0.0.1'` | Registration IP |
| `priv` | `number` | `system.get('default.priv')` | Initial privilege level |
| **Returns** | `Promise<number>` | The assigned user ID |

### `ensureVuser(uname)`

Ensure a virtual user exists for contest display. Creates one with a descending negative ID if not found.

| Parameter | Type | Description |
|-----------|------|-------------|
| `uname` | `string` | Virtual user display name |
| **Returns** | `Promise<number>` | Virtual user ID |

---

## User Groups

### `listGroup(domainId, uid?)`

List user groups in a domain. If `uid` is provided, only returns groups containing that user plus the implicit self-group.

### `delGroup(domainId, name)`

Delete a user group by name.

### `updateGroup(domainId, name, uids)`

Create or update a user group with the given member UIDs.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection<Udoc>` | The `user` MongoDB collection. |
| `collGroup` | `Collection<GDoc>` | The `user.group` MongoDB collection. |
| `cache` | `LRUCache<string, User>` | LRU cache (max 10000, TTL 5 min) keyed by `type/key/domainId`. |
| `defaultUser` | `Udoc` | Default user document template for missing users. |

---

## User Class

Methods like `getById` return `User` instances. The `User` class wraps a `Udoc` + domain user doc and provides:

| Method | Description |
|--------|-------------|
| `own(doc, arg?)` | Check if user owns (or maintains) a document. Pass a `bigint` perm to gate the check, or `true` for exact owner-only. |
| `hasPerm(...perms)` | Check if user has **any** of the given permission bits (intersected with scope). |
| `hasPriv(...privs)` | Check if user has **any** of the given privilege bits. |
| `checkPassword(password)` | Verify a plaintext password against the stored hash. |
| `private()` | Return a sanitized private view (avatar resolved, pinned domains expanded). |
| `getFields(type?)` | Get field names for `'public'` or `'private'` serialization. |
| `serialize(h)` | Serialize to JSON, filtering fields by viewer permission. |

### Key User Properties

| Property | Type | Description |
|----------|------|-------------|
| `_id` | `number` | User ID |
| `uname` | `string` | Display name |
| `mail` | `string` | Email address |
| `priv` | `number` | Global privilege bitmask |
| `perm` | `bigint` | Domain-scoped permission bitmask |
| `role` | `string` | Domain role (e.g. `'default'`) |
| `scope` | `bigint` | Permission scope mask |
| `regat` | `Date` | Registration time |
| `loginat` | `Date` | Last login time |
| `tfa` | `boolean` | Whether 2FA is enabled |
| `group` | `string[]?` | Domain group memberships |
