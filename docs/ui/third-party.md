# Third-Party Library Re-exports

Source: `packages/ui-default/api.ts:17-29`

Pre-bundled third-party libraries re-exported by `@hydrooj/ui-default` for direct use in frontend plugins. These are simple re-exports — no Hydro-specific wrappers or modifications.

## Exports

### $

```ts
import { $ } from '@hydrooj/ui-default';
```

Re-export of [jQuery](https://jquery.com/) (default export from `jquery`). Also registered globally as `window.$` and `window.jQuery` (line 59-61 in api.ts).

### _

```ts
import { _ } from '@hydrooj/ui-default';
```

Re-export of [Lodash](https://lodash.com/) (default export from `lodash`).

### React

```ts
import { React } from '@hydrooj/ui-default';
```

Re-export of [React](https://react.dev/) (default export from `react`).

### ReactDOM

```ts
import { ReactDOM } from '@hydrooj/ui-default';
```

Merged re-export combining `react-dom` and `react-dom/client`. The main `react-dom` module is augmented with all exports from `react-dom/client` via `Object.assign`, providing both legacy (`render`, `unmountComponentAtNode`) and modern (`createRoot`, `hydrateRoot`) APIs in a single object.

### jsxRuntime

```ts
import { jsxRuntime } from '@hydrooj/ui-default';
```

Re-export of `react/jsx-runtime` — the JSX transformation runtime used by React. Provides `jsx`, `jsxs`, and `Fragment` for JSX compilation.

### redux

```ts
import { redux } from '@hydrooj/ui-default';
```

Namespace re-export of [react-redux](https://react-redux.js.org/) via `export * as redux`. Contains all react-redux exports: `Provider`, `connect`, `useSelector`, `useDispatch`, `createSelectorHook`, `createDispatchHook`, etc.

### AnsiUp

```ts
import { AnsiUp } from '@hydrooj/ui-default';
```

Re-export of [AnsiUp](https://github.com/drudru/ansi_up) from the `ansi_up` package. Converts ANSI terminal escape sequences into HTML for display in the browser.
