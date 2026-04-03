# initPageLoader

Source: `packages/ui-default/hydro.ts`, re-exported from `packages/ui-default/api.ts`

## Functions

### initPageLoader

```ts
async function initPageLoader(): Promise<void>
```

Initializes the frontend page loader: creates a `PageLoader`, resolves the current page name from the `data-page` attribute, builds the lifecycle callback sequence (autoload beforeLoading → named beforeLoading → autoload afterLoading → named afterLoading), and executes each callback in order. On completion, hides the page loader overlay, triggers section animations, and fires the `vjPageFullyInitialized` DOM event.

**Behavior details:**

- **Page resolution** — Reads `document.documentElement.getAttribute('data-page')` to determine the current route name.
- **Callback sequence** — Calls `buildSequence()` to collect pages with matching `beforeLoading`/`afterLoading` hooks, then iterates them in order: autoload before → named before → autoload after → named after.
- **Nested loading** — Each callback receives a `loadPage(depth, type)` function that can recursively invoke another page's lifecycle hooks by module name, with a depth cap of 32.
- **Error handling** — Individual callback failures are caught and reported as `Notification.warn()`; execution continues with remaining callbacks.
- **Performance logging** — In development mode, callbacks taking >16ms are logged; in production, only those >256ms.
- **Post-loading** — After all callbacks complete: hides `.page-loader`, runs section fade-in animation, triggers `vjLayout` event on `.section` elements, and fires `vjPageFullyInitialized` on `$(document)`.

## Internal Helpers

These are not exported but are referenced by `initPageLoader`:

### buildSequence

```ts
function buildSequence(pages: Page[], type: 'before' | 'after'): Array<{ page: Page; func: Callback; type: string }>
```

Filters pages that have a `beforeLoading` or `afterLoading` hook and returns an array of `{ page, func, type }` objects for sequential execution.

### PageLoader (class)

Source: `packages/ui-default/misc/PageLoader.js`

```ts
class PageLoader {
  pageInstances: Page[]

  constructor()
  getAutoloadPages(): Page[]
  getNamedPage(pageName: string): Page[]
  getPage(moduleName: string): Page[]
}
```

Collects all registered pages (built-in from `pages/` and `components/` via `require.context`, plus `window.Hydro.extraPages`), filters for valid `Page` instances, and invokes plain function entries immediately.

| Method | Description |
|--------|-------------|
| `getAutoloadPages()` | Returns all page instances with `autoload = true`. |
| `getNamedPage(pageName)` | Returns page instances whose name matches the given route name via `isNameMatch()`. |
| `getPage(moduleName)` | Returns page instances matching the given `moduleName` property. |

## See Also

- [Page Registration System](./page.md) — `Page`, `NamedPage`, `AutoloadPage`, `addPage()`
