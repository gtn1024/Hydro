# SettingService

System configuration service providing config read/write, schema-based validation, and setting registration for plugins.

> **Source**: `packages/hydrooj/src/settings.ts`
> **Export**: `import { SettingService } from 'hydrooj';`
> **Access**: `ctx.setting` (Cordis service, injected as `'setting'`)

`SettingService` is a Cordis `Service` that manages Hydro's YAML-based system configuration. It loads config from the `system` MongoDB collection, validates it against registered schemas, and provides reactive access via proxy-based getters. Plugins register setting schemas through the five registration methods (PreferenceSetting, AccountSetting, etc.), which are automatically disposed when the plugin's context is disposed.

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `settings` | `Schema[]` | Array of currently registered config schemas |
| `configSource` | `string` | Raw YAML string of the current system config |
| `systemConfig` | `any` (private) | Parsed config object |
| `applied` | `any` (private) | Schema-validated config object |

---

## Public Methods

### `get(key: string): any`

Reads a configuration value by dot-path key. Resolution order: domain config (`ctx.domain.config`) first, then system config, then `global.Hydro.model.system.get` as fallback. Returns `null` if not found.

### `setConfig(key: string, value: any): Promise<void>`

Sets a single config key (dot-path) to the given value. Applies the delta to the current config, validates against all registered schemas, persists to database, and reloads.

### `requestConfig<T, S>(s: Schema<T, S>, dynamic?: boolean): S`

Registers a schema for config validation and returns the current validated config value. When `dynamic` is `true` (default), the returned value is a reactive proxy: reading nested properties works normally, and **writing** to a property automatically calls `setConfig` to persist the change. The schema is auto-removed when the context is disposed.

### `loadConfig(): Promise<void>`

Loads the system config from the `system` MongoDB collection (YAML format), validates it against all registered schemas, and emits the `system/setting` event. Called automatically during service initialization.

### `saveConfig(config: any): Promise<void>`

Validates the given config object against all registered schemas (throws on validation failure), serializes to YAML, persists to the `system` collection, then calls `loadConfig` to refresh the in-memory state and notify listeners.

---

## Registration Methods

These methods wrap the corresponding functions from `SettingModel` (see [SettingModel docs](../models/setting-model.md)) and add automatic context-based disposal. Each returns `void` and registers settings that live as long as the plugin context.

### `PreferenceSetting(...args): void`

Registers preference-level settings (per-user, cross-domain). Delegates to `SettingModel.PreferenceSetting`. Auto-disposed when context ends.

### `AccountSetting(...args): void`

Registers account-level settings (per-user authentication/security settings). Delegates to `SettingModel.AccountSetting`. Auto-disposed when context ends.

### `DomainSetting(...args): void`

Registers domain-level settings (per-domain configuration). Delegates to `SettingModel.DomainSetting`. Auto-disposed when context ends.

### `DomainUserSetting(...args): void`

Registers per-domain-user settings (user preferences scoped to a domain). Delegates to `SettingModel.DomainUserSetting`. Auto-disposed when context ends.

### `SystemSetting(...args): void`

Registers system-level settings (global configuration visible to all domains). Delegates to `SettingModel.SystemSetting`. Auto-disposed when context ends.

---

## Internal Methods

These are used internally and not typically needed by plugin developers.

| Method | Description |
|--------|-------------|
| `_applySchema()` | Validates `systemConfig` against all registered schemas and stores the result in `applied` |
| `_get(key: string)` | Traverses the validated `applied` config by dot-path; rejects blacklisted path segments |
| `applyDelta(source, key, value)` | Returns a deep-cloned copy of `source` with a single key set to `value` |
| `isPatchValid(key, value)` | Tests whether applying a delta would pass schema validation |
| `_tryMigrateConfig(schema)` | Queues a migration of old-format settings (key-per-document) into the unified YAML config |
