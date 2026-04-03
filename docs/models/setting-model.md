# SettingModel

Setting registration model for declaring user, domain, and system-level settings.

> **Source**: `packages/hydrooj/src/model/setting.ts`
> **Export**: `import { SettingModel } from 'hydrooj';`

`SettingModel` is a plain module with exported constants and registration functions (not a class). Plugins use it to register their own settings into the appropriate category.

---

## Setting Factory

### `Setting(family, key, value?, type?, name?, desc?, flag?, validation?): Setting`

Creates a setting descriptor object. This is the low-level factory used by all registration functions.

- **`family`** — group/family name for UI categorization (e.g. `"setting_basic"`).
- **`key`** — unique setting key (e.g. `"pagination.problem"`).
- **`value`** — default value (default `null`).
- **`type`** — one of `"text"` | `"yaml"` | `"number"` | `"float"` | `"markdown"` | `"password"` | `"boolean"` | `"textarea"` | `"json"` | `[string, string][]` | `Record<string, string>` (default `"text"`). Object types render as `<select>`.
- **`name`** — display name (default `""`).
- **`desc`** — description text (default `""`).
- **`flag`** — bitwise combination of `FLAG_*` constants (default `0`).
- **`validation`** — optional `(val: any) => boolean` validator.

---

## Registration Functions

Each registration function accepts `_Setting[]` or `Schema` objects (via schemastery), registers them into the corresponding collection, and returns a **dispose function** (`() => void`) that removes those settings.

### `PreferenceSetting(...settings): () => void`

Registers preference-level settings (per-user display/UI preferences like language, timezone). Adds to `PREFERENCE_SETTINGS`, `SETTINGS`, and `SETTINGS_BY_KEY`.

### `AccountSetting(...settings): () => void`

Registers account-level settings (user profile info like avatar, bio, phone). Adds to `ACCOUNT_SETTINGS`, `SETTINGS`, and `SETTINGS_BY_KEY`.

### `DomainSetting(...settings): () => void`

Registers domain-level settings (per-domain configuration like name, bulletin). Adds to `DOMAIN_SETTINGS` and `DOMAIN_SETTINGS_BY_KEY`.

### `DomainUserSetting(...settings): () => void`

Registers domain-user-level settings (per-user-per-domain data like display name, rank). Adds to `DOMAIN_USER_SETTINGS` and `DOMAIN_USER_SETTINGS_BY_KEY`.

### `SystemSetting(...settings): () => void`

Registers system-level settings (global server config like SMTP, limits, pagination). Adds to `SYSTEM_SETTINGS` and `SYSTEM_SETTINGS_BY_KEY`.

---

## Flag Constants

| Constant | Value | Meaning |
|---|---|---|
| `FLAG_HIDDEN` | `1` | Hidden from settings UI |
| `FLAG_DISABLED` | `2` | Shown but not editable |
| `FLAG_SECRET` | `4` | Secret field (e.g. passwords) |
| `FLAG_PRO` | `8` | Requires Hydro Pro |
| `FLAG_PUBLIC` | `16` | Visible to non-admin users |
| `FLAG_PRIVATE` | `32` | Private to the owner |

---

## Collection Constants

Read-only arrays and dictionaries populated by the registration functions.

### Arrays

- **`PREFERENCE_SETTINGS`** — all registered preference settings.
- **`ACCOUNT_SETTINGS`** — all registered account settings.
- **`DOMAIN_SETTINGS`** — all registered domain settings.
- **`DOMAIN_USER_SETTINGS`** — all registered domain-user settings.
- **`SYSTEM_SETTINGS`** — all registered system settings.
- **`SETTINGS`** — merged array of preference + account settings (flat).

### Dictionaries (by key)

- **`SETTINGS_BY_KEY`** — lookup map for preference + account settings.
- **`DOMAIN_SETTINGS_BY_KEY`** — lookup map for domain settings.
- **`DOMAIN_USER_SETTINGS_BY_KEY`** — lookup map for domain-user settings.
- **`SYSTEM_SETTINGS_BY_KEY`** — lookup map for system settings.

---

## Other Exports

### `langs: Record<string, LangConfig>`

Parsed language configuration derived from the `hydrooj.langs` system setting. Updated dynamically when that setting changes.

### `type SettingType`

Type alias for setting value types: `"text" | "yaml" | "number" | "float" | "markdown" | "password" | "boolean" | "textarea" | [string, string][] | Record<string, string> | "json"`.

---

## Notes

- All registration functions accept **schemastery `Schema` objects** in addition to `Setting` descriptors — they are automatically converted via `schemaToSettings()`.
- Each registration function returns a dispose callback. Calling it removes the settings from all relevant collections, enabling plugin teardown.
- Duplicate setting keys trigger a warning log but are not prevented.
- The `Setting` interface (from `hydrooj/src/interface.ts`) defines the shape: `{ family, key, range, value, type, subType?, name, desc, flag, validation? }`.
