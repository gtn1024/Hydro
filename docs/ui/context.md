# Frontend Plugin System Core

Source: `packages/ui-default/context.ts`, `packages/ui-default/api.ts`

The frontend plugin system is built on [Cordis](https://github.com/shigma/cordis), the same plugin framework used by the Hydro backend. This page documents the core types and the global context instance available to frontend plugins.

## Exports

### Context

```ts
class Context extends cordis.Context { }
```

The central plugin context. Frontend plugins receive a `Context` instance to register lifecycle hooks, services, and event listeners. Extends `cordis.Context` without additional methods — all functionality comes from the Cordis base class.

The context has a `broadcast` property aliased to `emit`, providing a semantic shorthand for broadcasting events to all listeners.

### ctx

```ts
const ctx: Context
```

The global frontend plugin context singleton. Created as `new Context()` at module load time. Import and use this to register plugins, listen for events, and access services on the frontend.

Example usage:
```ts
import { ctx } from '@hydrooj/ui-default';

ctx.on('some-event', (payload) => { /* handle */ });
```

### Service

```ts
class Service<C extends Context = Context> extends cordis.Service<C> { }
```

Base class for frontend services. Extends `cordis.Service` without additional methods. Plugins subclass `Service` to provide reusable functionality that can be injected via Cordis dependency injection.

### EventMap

```ts
interface EventMap { }
```

An empty interface serving as the extension point for frontend event type declarations. Plugins can use TypeScript declaration merging to add custom event signatures:

```ts
declare module '@hydrooj/ui-default' {
  interface EventMap {
    'my-plugin/event': (data: MyData) => void
  }
}
```

### Events

```ts
interface Events<C extends Context = Context> extends cordis.Events<C>, EventMap { }
```

The combined event interface, merging Cordis built-in events with Hydro frontend `EventMap`. Accessible via `Context[Context.events]`.

### Fiber

```ts
type Fiber = cordis.Fiber<Context>
```

Type alias for a Cordis fiber parameterized with Hydro's `Context`. Represents a plugin's lifecycle scope within the context tree.

### Disposable

```ts
type Disposable = cordis.Disposable
```

Re-exported from Cordis. A cleanup function returned by registration methods (e.g., `ctx.on()`, `ctx.effect()`). Calling it removes the registered resource.

### FiberState

```ts
type FiberState = cordis.FiberState
```

Re-exported from Cordis. Represents the lifecycle state of a fiber (e.g., `active`, `disposed`).

### Plugin

```ts
type Plugin = cordis.Plugin
```

Re-exported from Cordis. The plugin descriptor type used when defining and registering plugins with `ctx.plugin()`.

## Architecture Notes

- `context.ts` defines Hydro-specific subclasses/wrappers over Cordis primitives, while all actual plugin functionality (lifecycle hooks, dependency injection, event system) comes from the Cordis base classes.
- `api.ts` re-exports `Context`, `ctx`, and `Service` from `context.ts`, making them available as part of the `@hydrooj/ui-default` public API.
- `EventMap` is declared empty in `api.ts` and is designed to be extended via TypeScript declaration merging by plugins.
- The frontend `Context` is a separate instance from the backend `Context` — they share the same Cordis architecture but run in different environments (browser vs Node.js).
