# loadMonaco

Source: `packages/ui-default/components/monaco/loader.ts`

Loads the Monaco editor on demand with optional language features and plugin extensions. Serializes concurrent load calls to avoid duplicate initialization.

## Function

### load

```ts
async function load(features?: string[]): Promise<{
  monaco: typeof import('monaco-editor/esm/vs/editor/editor.api');
  registerAction: (editor: monaco.editor.IStandaloneCodeEditor, model: monaco.editor.IModel, element?: HTMLElement) => Promise<any>;
  customOptions: monaco.editor.IStandaloneDiffEditorConstructionOptions;
  renderMarkdown: typeof import('monaco-editor/esm/vs/base/browser/markdownRenderer').renderMarkdown;
}>
```

Default export, re-exported as `loadMonaco` from the plugin API. Loads the Monaco editor and the specified features. Features are loaded only once; subsequent calls with already-loaded features skip them.

**Parameters:**
- `features` (default `['markdown']`) — Array of feature names to load. Built-in features: `'markdown'`, `'typescript'`, `'yaml'`. Plugin-contributed features are resolved via `getFeatures('monaco-{feat}')`.

**Behavior:**
1. Serializes concurrent calls via an internal promise chain.
2. On first call, loads i18n locale data (zh, zh_TW, ko supported).
3. Dynamically imports `./index` (the Monaco editor module).
4. Iterates `features`, loading each via built-in loaders or the external plugin loader.
5. Waits for theme loading to complete.
6. Returns the Monaco instance plus helper utilities.

**Return value:**
- `monaco` — The full Monaco editor API module.
- `registerAction` — Registers keyboard shortcuts on an editor instance (Ctrl+Enter to submit, Ctrl+Shift+P for command palette, Alt+Shift+F for format). Also enables image/zip paste upload in markdown mode.
- `customOptions` — Persisted editor configuration read from `localStorage('editor.config')`. Mutable; changes are saved via `saveCustomOptions()`.
- `renderMarkdown` — Re-exported from `monaco-editor/esm/vs/base/browser/markdownRenderer`.

## Function (Deprecated)

### legacyLoadExternalModule

```ts
async function legacyLoadExternalModule(target: string): Promise<any>
```

**@deprecated** Loads an external script by injecting a `<script>` element into `<head>`. Caches the result in `window.exports`. Used internally by the external feature loader for URL-based plugin scripts.

## Built-in Feature Loaders

| Feature | Description |
|---------|-------------|
| `i18n` | Loads locale data for Monaco UI translations (zh, zh_TW, ko). Auto-loaded on first `load()` call. |
| `markdown` | Imports `./languages/markdown` for Markdown syntax support. |
| `typescript` | Imports `./languages/typescript` and calls `loadTypes()` for TypeScript/JavaScript support. |
| `yaml` | Imports `./languages/yaml` for YAML syntax support. |
| `external` | Loads plugin-contributed features via `getFeatures('monaco-{feat}')`. Each item can be a function, a URL string, or a module path. |
