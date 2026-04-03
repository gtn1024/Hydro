# Frontend Page Registration System

Source: `packages/ui-default/misc/Page.ts`, `packages/ui-default/api.ts`

Hydro's frontend uses a page registration system to organize per-page initialization logic. Plugins register page instances via `addPage()`, and the page loader invokes lifecycle callbacks (`beforeLoading`, `afterLoading`) at the appropriate times during page transitions.

## Classes

### Page

```ts
class Page {
  name: string | string[];
  moduleName?: string;
  autoload: boolean;        // always false for Page
  afterLoading?: Callback;
  beforeLoading?: Callback;

  constructor(pagename: string | string[], afterLoading?: Callback, beforeLoading?: Callback);
  constructor(pagename: string | string[], moduleName: string, afterLoading?: Callback, beforeLoading?: Callback);

  isNameMatch(name: string): boolean;
}
```

The base class for all page registrations. Matches specific route names and provides lifecycle hooks.

**Constructor parameters (overloaded):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `pagename` | `string \| string[]` | Page route name(s) to match. Corresponds to the `data-page` attribute on `<html>`. |
| `moduleName` | `string` | *(Optional)* If provided as the second argument (string type), used as a module name identifier for `PageLoader.getPage()`. |
| `afterLoading` | `Callback` | Called after the page DOM has loaded. |
| `beforeLoading` | `Callback` | Called before the page DOM loads. |

The constructor detects whether the second argument is a string (`moduleName`) or a function (`afterLoading`) and destructures accordingly.

**Callback type:**

```ts
type Callback = (pagename: string, loadPage: (name: string) => Promise<any>) => any;
```

- `pagename` — the current page's route name.
- `loadPage` — a function to dynamically load another registered page by module name, enabling nested page loading (depth-limited to 32 to prevent infinite recursion).

**Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string \| string[]` | *(constructor)* | Route name(s) this page matches. |
| `moduleName` | `string \| undefined` | `undefined` | Optional module name for lookup via `PageLoader.getPage()`. |
| `autoload` | `boolean` | `false` | Whether this page's hooks run on every route. |
| `afterLoading` | `Callback \| undefined` | `undefined` | Post-load lifecycle hook. |
| `beforeLoading` | `Callback \| undefined` | `undefined` | Pre-load lifecycle hook. |

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `isNameMatch` | `(name: string) => boolean` | Tests whether a given route name matches this page. For string names, checks strict equality; for array names, checks inclusion. |

### NamedPage

```ts
class NamedPage extends Page { }
```

An empty subclass of `Page` with no additional behavior. Used semantically to indicate that the page is route-specific (not autoloaded). `autoload` remains `false`.

This is the most commonly used class — most pages in Hydro register as `new NamedPage(...)`.

### AutoloadPage

```ts
class AutoloadPage extends Page {
  constructor(pagename: string | string[], afterLoading?: Callback, beforeLoading?: Callback);
  constructor(pagename: string | string[], moduleName: string, afterLoading?: Callback, beforeLoading?: Callback);
}
```

Extends `Page` and sets `autoload = true` in the constructor. Autoload pages have their lifecycle hooks invoked on **every** route change, regardless of whether the route name matches. Use this for global page enhancements (e.g., notifications, tooltips, keyboard shortcuts).

## Functions

### addPage

```ts
function addPage(page: Page | (() => Promise<void> | void)): void
```

Registers a page instance or an initialization function with the page loader.

- **`page: Page`** — A `Page`, `NamedPage`, or `AutoloadPage` instance. It will be collected by `PageLoader` and matched against routes.
- **`page: () => Promise<void> | void`** — A plain function. Called immediately during `PageLoader` construction (after all `Page` instances are processed). Used for side-effect-only initialization that doesn't need route matching.

Pages are stored in `window.Hydro.extraPages`. The `PageLoader` constructor merges built-in pages (from `pages/` and `components/` directories) with extra pages, filters for valid `Page` instances, and invokes plain functions directly.

## Lifecycle

The page loader runs lifecycle callbacks in a specific order during `initPageLoader()`:

```
1. Autoload pages — beforeLoading   (all autoload pages, in registration order)
2. Named pages   — beforeLoading   (pages matching current route)
3. Autoload pages — afterLoading    (all autoload pages, in registration order)
4. Named pages   — afterLoading     (pages matching current route)
```

### beforeLoading

```ts
beforeLoading?: (pagename: string, loadPage: (name: string) => Promise<any>) => any
```

Called **before** the page's DOM content is processed. Use this for:
- Setting up global event listeners
- Modifying DOM before rendering
- Loading external resources

### afterLoading

```ts
afterLoading?: (pagename: string, loadPage: (name: string) => Promise<any>) => any
```

Called **after** the page's DOM content is available. Use this for:
- Binding event handlers to DOM elements
- Initializing UI components
- Fetching data and updating the page

### Nested Loading

The `loadPage` parameter passed to callbacks enables recursive page loading:

```ts
new NamedPage('problem_edit', async (pagename, loadPage) => {
  // Load another page's hooks by module name
  await loadPage('editor');
}, async (pagename, loadPage) => {
  await loadPage('editor');
});
```

Depth is capped at 32 to prevent infinite recursion.

## Usage Examples

### NamedPage with lifecycle hooks

```ts
import { NamedPage } from '@hydrooj/ui-default';

export default new NamedPage('user_detail', async (pagename, loadPage) => {
  // beforeLoading — prepare data
  console.log('Loading user page...');
}, async (pagename, loadPage) => {
  // afterLoading — bind DOM
  document.querySelector('.avatar')?.addEventListener('click', handleAvatarClick);
});
```

### NamedPage matching multiple routes

```ts
new NamedPage(['contest_detail', 'contest_scoreboard'], () => {
  // beforeLoading for both contest_detail and contest_scoreboard pages
}, () => {
  // afterLoading for both pages
});
```

### AutoloadPage for global behavior

```ts
import { AutoloadPage } from '@hydrooj/ui-default';

export default new AutoloadPage('tooltips', () => {
  // Runs on every page — initialize tooltip library
}, () => {
  // Bind tooltip elements after DOM is ready
});
```

### Registering via addPage

```ts
import { addPage, AutoloadPage } from '@hydrooj/ui-default';

addPage(new AutoloadPage('my-plugin-init', () => {
  // beforeLoading — runs on every page
}, () => {
  // afterLoading — runs on every page
}));

// Or register a plain initialization function
addPage(() => {
  console.log('Plugin initialized');
});
```
