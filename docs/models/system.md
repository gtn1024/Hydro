# SystemModel

System-wide key-value settings store backed by MongoDB with in-memory caching.

> **Source**: `packages/hydrooj/src/model/system.ts`
> **Export**: `import { SystemModel } from 'hydrooj';`

`SystemModel` is a `serviceInstance` proxy over `SystemModelService` (extends `Service`). It loads all system settings into an in-memory cache at startup and keeps cluster nodes in sync via the broadcast bus.

---

## Methods

### `get(key)`

Retrieves a single system setting from the in-memory cache.

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `K extends keyof SystemKeys` or `string` | The setting key |
| **Returns** | `SystemKeys[K]` or `any` | The cached value |

```ts
const serverName = SystemModel.get('server.name'); // string
const smtpPort = SystemModel.get('smtp.port');      // number
```

### `getMany(keys)`

Retrieves multiple system settings at once. Provides typed tuple return for up to 6 keys.

| Parameter | Type | Description |
|-----------|------|-------------|
| `keys` | `(keyof SystemKeys)[]` | Array of setting keys |
| **Returns** | `any[]` (typed tuple for ≤6 keys) | Array of cached values in same order |

```ts
const [name, url] = SystemModel.getMany(['server.name', 'server.url']);
```

### `set(key, value, broadcast?)`

Writes a setting to MongoDB, updates the local cache, and optionally broadcasts to other cluster nodes.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `key` | `K extends keyof SystemKeys` or `string` | — | The setting key |
| `value` | `SystemKeys[K]` or `any` | — | The value to store |
| `broadcast` | `boolean` | `true` | Whether to sync across cluster nodes |
| **Returns** | `Promise<SystemKeys[K]>` or `Promise<K>` | The stored value |

```ts
await SystemModel.set('server.name', 'My Judge');
await SystemModel.set('custom.key', data, false); // local only
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `MongoDB.Collection` | The `system` MongoDB collection. |
| `cache` | `Record<string, any>` | In-memory cache of all settings; populated from defaults and DB on startup. |

---

## SystemKeys (Type Reference)

Known typed keys defined in `SystemKeys` interface (`packages/hydrooj/src/interface.ts`):

| Key | Type |
|-----|------|
| `smtp.user` | `string` |
| `smtp.from` | `string` |
| `smtp.pass` | `string` |
| `smtp.host` | `string` |
| `smtp.port` | `number` |
| `smtp.secure` | `boolean` |
| `installid` | `string` |
| `server.name` | `string` |
| `server.url` | `string` |
| `server.xff` | `string` |
| `server.xhost` | `string` |
| `server.host` | `string` |
| `server.port` | `number` |
| `server.language` | `string` |
| `limit.problem_files_max` | `number` |
| `problem.categories` | `string` |
| `session.keys` | `string[]` |
| `session.saved_expire_seconds` | `number` |
| `session.unsaved_expire_seconds` | `number` |
| `user.quota` | `number` |

Arbitrary string keys can also be used — they return `any`.

---

## Initialization

On service startup (`[Service.init]`), SystemModel:

1. Loads default values from `SYSTEM_SETTINGS`
2. Reads all documents from the `system` MongoDB collection and populates `cache`
3. Emits `database/config` event
4. Subscribes to `system/setting` broadcast events to keep cache in sync across cluster nodes
