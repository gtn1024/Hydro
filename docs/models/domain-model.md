# DomainModel

Domain (tenant/organization) model providing domain CRUD, user-role membership management, role permission management, and join settings.

> **Source**: `packages/hydrooj/src/model/domain.ts`
> **Export**: `import { DomainModel } from 'hydrooj';`

`DomainModel` is a static-only class. All methods are called on the class itself (e.g. `DomainModel.get(...)`).

---

## Type Exports

### `DomainDoc`

Defined in `packages/hydrooj/src/interface.ts`:

```typescript
interface DomainDoc extends Record<string, any> {
    _id: string;          // Domain ID
    owner: number;        // Owner UID
    roles: Dictionary<string>;  // Role name → permission bigint string
    avatar: string;       // Domain avatar URL
    bulletin: string;     // Domain bulletin text
    _join?: any;          // Join settings (method, role, expire, code)
    host?: string[];      // Custom host headers
}
```

Note: `DomainDoc` extends `Record<string, any>`, so arbitrary additional fields are allowed.

---

## Constants

### Join Methods

| Constant | Value | Description |
|----------|-------|-------------|
| `JOIN_METHOD_NONE` | `0` | No user is allowed to join this domain |
| `JOIN_METHOD_ALL` | `1` | Any user is allowed to join this domain |
| `JOIN_METHOD_CODE` | `2` | Any user is allowed to join with an invitation code |

### Join Expiration

| Constant | Value | Description |
|----------|-------|-------------|
| `JOIN_EXPIRATION_KEEP_CURRENT` | `0` | Keep current expiration |
| `JOIN_EXPIRATION_UNLIMITED` | `-1` | Never expire |
| _(numeric keys)_ | `3`, `24`, `72`, `168`, `720` | In 3 hours / 1 day / 3 days / 1 week / 1 month |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection` | MongoDB `domain` collection |
| `collUser` | `Collection` | MongoDB `domain.user` collection |

---

## Methods

### Domain CRUD

| Method | Signature | Description |
|--------|-----------|-------------|
| `add` | `(domainId: string, owner: number, name: string, bulletin: string) => Promise<string>` | Create a new domain with specified owner, name, and bulletin; sets owner as `root` role. |
| `get` | `(domainId: string) => Promise<DomainDoc \| null>` | Get a domain by ID (case-insensitive lookup on `lower` field), with LRU cache. |
| `getByHost` | `(host: string) => Promise<DomainDoc \| null>` | Get a domain by its `host` field, with LRU cache (caches `null` misses too). |
| `getMulti` | `(query?: Filter<DomainDoc>) => Cursor<DomainDoc>` | Get a cursor for multiple domains matching the filter. |
| `getList` | `(domainIds: string[]) => Promise<Record<string, DomainDoc \| null>>` | Get multiple domains as a dict keyed by domain ID (uses `get` internally, respects cache). |
| `edit` | `(domainId: string, $set: Partial<DomainDoc>) => Promise<DomainDoc \| null>` | Update domain fields by ID; broadcasts cache invalidation. |
| `inc` | `(domainId: string, field: NumberKeys<DomainDoc>, n: number) => Promise<number \| null>` | Atomically increment a numeric field on a domain; broadcasts cache invalidation. |
| `getPrefixSearch` | `(prefix: string, limit?: number) => Promise<DomainDoc[]>` | Search domains by ID or name prefix (regex, case-insensitive); default limit 50. |
| `del` | `(domainId: string) => Promise<void>` | Delete a domain and all its user associations; fires `domain/delete` event and invalidates cache. |

### Domain User Management

| Method | Signature | Description |
|--------|-----------|-------------|
| `countUser` | `(domainId: string, role?: string) => Promise<number>` | Count joined users in a domain, optionally filtered by role. |
| `getDomainUser` | `(domainId: string, udoc: { _id: number, priv: number }) => Promise<any>` | Get domain-user record with effective role and computed `perm` (considers user privileges like `PRIV_MANAGE_ALL_DOMAIN`). |
| `getDomainUserMulti` | `(domainId: string, uids: number[]) => Cursor<any>` | Get cursor for multiple domain-user records by UIDs. |
| `getDictUserByDomainId` | `(uid: number) => Promise<Record<string, any>>` | Get all joined domain-user records for a user, keyed by `domainId`. |
| `setUserRole` | `(domainId: string, uid: MaybeArray<number>, role: string, autojoin?: boolean) => Promise<any>` | Set user role(s) in a domain; supports single or batch UID; optionally auto-joins the user. |
| `setJoin` | `(domainId: string, uid: MaybeArray<number>, join: boolean) => Promise<void>` | Set join status for user(s) in a domain. |
| `setUserInDomain` | `(domainId: string, uid: number, params: any) => Promise<any>` | Set specific fields on a domain-user record (upsert). |
| `updateUserInDomain` | `(domainId: string, uid: number, update: any) => Promise<any>` | Apply arbitrary MongoDB update to a domain-user record (upsert). |
| `setMultiUserInDomain` | `(domainId: string, query: any, params: any) => Promise<any>` | Bulk update domain users matching query with `$set` (upsert). |
| `getMultiUserInDomain` | `(domainId: string, query?: any) => Cursor<any>` | Get cursor for domain users matching query. |
| `incUserInDomain` | `(domainId: string, uid: number, field: string, n?: number) => Promise<any>` | Read-modify-write increment of a numeric field on a domain-user record; returns updated doc. |

### Role Management

| Method | Signature | Description |
|--------|-----------|-------------|
| `getRoles` | `(domainId: string \| DomainDoc, count?: boolean) => Promise<any[]>` | Get all roles for a domain (built-in + custom), optionally with user counts per role. |
| `setRoles` | `(domainId: string, roles: Dictionary<bigint \| string>) => Promise<any>` | Set multiple roles and their permissions (merges into existing roles). |
| `addRole` | `(domainId: string, name: string, permission: bigint) => Promise<any>` | Add a new custom role with specified permission. |
| `deleteRoles` | `(domainId: string, roles: string[]) => Promise<void>` | Delete roles and reset all affected users to `default` role. |

### Join Settings

| Method | Signature | Description |
|--------|-----------|-------------|
| `getJoinSettings` | `(ddoc: DomainDoc, roles: string[]) => any \| null` | Get join settings if the domain allows joining and the role is permitted; returns `null` if joining is disabled or expired. |

---

## Bus Events

| Event | Payload | Description |
|-------|---------|-------------|
| `domain/create` | `(ddoc: DomainDoc)` | Fires during domain creation (before DB insert). |
| `domain/before-get` | `(query: Filter<DomainDoc>)` | Fires before domain lookup; allows query modification. |
| `domain/get` | `(ddoc: DomainDoc)` | Fires after a domain is successfully fetched. |
| `domain/before-update` | `(domainId: string, $set: Partial<DomainDoc>)` | Fires before domain update. |
| `domain/update` | `(domainId: string, $set: Partial<DomainDoc>, ddoc: DomainDoc)` | Fires after domain update (with updated doc). |
| `domain/delete` | `(domainId: string)` | Fires after domain is deleted. |
| `domain/delete-cache` | `(domainId: string)` | Broadcast to invalidate domain cache across cluster. |

---

## Cache Behavior

- Uses `LRUCache` with `max: 1000` entries and `ttl: 300000ms` (5 minutes).
- Cache keys: `id::{lower}` for ID lookups, `host::{host}` for host lookups.
- Cache is invalidated via `domain/delete-cache` broadcast (cross-cluster) on edit, inc, role changes, and delete.
- `getByHost` caches `null` results (domain not found for a host).
