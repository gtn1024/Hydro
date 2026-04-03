# OauthModel

OAuth provider and account linking model for registering third-party login providers, looking up linked accounts, and managing platform-to-user mappings.

> **Source**: `packages/hydrooj/src/model/oauth.ts`
> **Export**: `import { OauthModel } from 'hydrooj';`
> **Access**: `ctx.oauth` (service instance, not a static class)

Unlike most models, `OauthModel` extends `Service` and is accessed via `ctx.oauth` rather than static methods.

---

## Type Exports

### `OauthMap`

```typescript
interface OauthMap {
    platform: string;  // OAuth platform name (e.g. 'github', 'google', 'mail')
    id: string;        // Source openId from the provider
    uid: number;       // Target Hydro user ID
}
```

### `OAuthProvider`

```typescript
interface OAuthProvider {
    text: string;              // Display label
    name: string;              // Provider identifier
    icon?: string;             // Icon URL or identifier
    hidden?: boolean;          // If true, not shown in login UI
    get: (this: Handler) => Promise<void>;                         // Initiate OAuth flow
    callback: (this: Handler, args: Record<string, any>) => Promise<OAuthUserResponse>;  // Handle OAuth callback
    canRegister?: boolean;     // Whether this provider allows new user registration
    lockUsername?: boolean;    // Whether username is locked after linking
}
```

### `OAuthUserResponse`

```typescript
interface OAuthUserResponse {
    _id: string;                           // External user ID
    email: string;                         // User email
    avatar?: string;                       // Avatar URL
    bio?: string;                          // User bio
    uname?: string[];                      // Username candidates
    viewLang?: string;                     // Preferred language
    set?: Record<string, any>;             // Fields to set on user doc
    setInDomain?: Record<string, any>;     // Fields to set on domain user doc
}
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection<OauthMap>` | MongoDB `oauth` collection |
| `providers` | `Record<string, OAuthProvider>` | Registered OAuth providers, keyed by name |

---

## Methods

### Lookup

#### `get(platform, id)`

Looks up the Hydro user ID linked to a platform+openId pair.

```typescript
async get(platform: string, id: string): Promise<number | null>
```

Returns the linked `uid`, or `null` if no mapping exists.

### Account Linking

#### `set(platform, id, uid)`

Creates or updates an OAuth account mapping. Uses upsert.

```typescript
async set(platform: string, id: string, uid: number): Promise<number>
```

Returns the `uid` of the upserted document.

#### `unbind(platform, uid)`

Removes an OAuth account mapping by platform and user ID.

```typescript
async unbind(platform: string, uid: number): Promise<void>
```

#### `list(uid)`

Lists all OAuth account mappings for a user.

```typescript
async list(uid: number): Promise<OauthMap[]>
```

### Provider Registration

#### `provide(name, provider)`

Registers an OAuth provider. Throws if a provider with the same name already exists. The provider is automatically cleaned up when the service context is disposed.

```typescript
async provide(name: string, provider: OAuthProvider): Promise<void>
```

Uses `ctx.effect()` to register with cleanup — provider is removed on context disposal.

---

## Indexes

Created in `[Context.init]` on startup:

| Name | Key | Notes |
|------|-----|-------|
| `platform_id` | `{ platform: 1, id: 1 }` | Unique — one mapping per platform+openId |
| `uid_platform` | `{ uid: 1, platform: 1 }` | For listing a user's linked accounts |

---

## Usage

```typescript
// Register a custom OAuth provider
ctx.oauth.provide('github', {
    text: 'GitHub',
    name: 'github',
    icon: 'github',
    async get() { /* redirect to GitHub OAuth */ },
    async callback(args) {
        // Exchange code for user info
        return { _id: '...', email: '...', uname: ['...'] };
    },
});

// Look up a linked user
const uid = await ctx.oauth.get('github', openId);

// Link an account
await ctx.oauth.set('github', openId, uid);

// List a user's linked accounts
const links = await ctx.oauth.list(uid);

// Unlink an account
await ctx.oauth.unbind('github', uid);
```
