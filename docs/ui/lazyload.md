# Lazy Loading System

Source: `packages/ui-default/lazyload.ts`

Frontend module lazy-loading system for dynamically loading scripts and managing plugin-contributed features. Supports both built-in lazy modules (via script injection) and externally registered features.

## Functions

### load

```ts
async function load(name: string): Promise<any>
```

Default export. Dynamically loads a lazy module by injecting a `<script>` tag and waiting for the module's resolver callback. Special-cases `'echarts'` and `'moment'` to use native dynamic imports instead. Returns cached result on subsequent calls with the same name.

**Parameters:**
- `name` — Module name to load. Must exist in `window.lazyloadMetadata` as `{name}.lazy.js`, or be one of the special cases (`'echarts'`, `'moment'`).

**Behavior:**
1. Checks special cases (`echarts`, `moment`) — uses `import()` directly.
2. Validates the module exists in `window.lazyloadMetadata`.
3. Returns cached promise from `lazyModules[name]` if already loading/loaded.
4. Creates a `<script>` element pointing to `{host}lazy/{hash}/{name}.lazy.js` (uses CDN if configured).
5. Registers a resolver in `window.lazyModuleResolver[name]` that resolves the promise.
6. Sets a 30-second timeout that rejects if the module never loads.
7. Appends the script to `document.body`.

### getFeatures

```ts
async function getFeatures(name: string): Promise<(string | (() => Promise<any>))[]>
```

Collects all registered features matching a given name (including versioned variants like `name@version`). Searches both the plugin-registered `features` map and the legacy `window.externalModules`. Returns a combined array of feature entries (functions or URL strings).

**Parameters:**
- `name` — Feature name to query. Matches exact name and any `name@...` variants.

### loadFeatures

```ts
async function loadFeatures(name: string, ...args: any[]): Promise<void>
```

Loads and applies all features registered under a given name. Idempotent — each feature name is loaded only once, tracked via the `loaded` array. Each feature entry is resolved differently based on its type:

- **Function** — Called directly with `...args`.
- **URL string** (starts with `http` or `/`) — Loaded via `legacyLoadExternalModule`, then the resolved module's `apply` or `default` function is called.
- **Module path string** — Loaded via `load()`, then the module's `apply` or `default.apply` function is called.

**Parameters:**
- `name` — Feature name to load.
- `...args` — Arguments forwarded to each feature's apply function.

### provideFeature

```ts
function provideFeature(name: string, content: string | (() => Promise<any>)): void
```

Registers a feature that can later be loaded via `loadFeatures()`. Emits a console warning if the feature name is already registered or already loaded.

**Parameters:**
- `name` — Feature name. Can include a version suffix (e.g. `'markdown@2'`).
- `content` — Either a function returning a Promise, or a URL/module-path string.

## Properties

### loaded

```ts
const loaded: string[]
```

Exported array tracking which feature names have been loaded by `loadFeatures()`. Used internally for idempotency checks — once a name appears in this array, `loadFeatures()` skips it on subsequent calls.
