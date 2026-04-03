# Context & Service

Core plugin system classes that form the foundation of Hydro's extensibility.

> **Source**: `packages/hydrooj/src/context.ts`, with base classes from `cordis`

```ts
import { Context, Service, Fiber, FiberState, Disposable, Plugin } from 'hydrooj';
```

## Context

The central object available to every plugin. It provides event subscription, service injection, route registration, and lifecycle management.

`Context` extends `cordis.Context` and adds Hydro-specific methods via the `ApiMixin` service. The WebService also mixes in `Route`, `Connection`, and `withHandlerClass`.

### Routing Methods

Methods mixed in from `WebService` for registering HTTP and WebSocket handlers.

| Method | Description |
|--------|-------------|
| `Route(name, path, Handler, ...permPrivChecker)` | Registers an HTTP route; binds `name`, `path`, and a `Handler` class with optional permission/privilege guards. |
| `Connection(name, path, Handler, ...permPrivChecker)` | Registers a WebSocket connection endpoint; same signature as `Route` but for persistent connections. |

### Event Methods

Inherited from `cordis.Context`. Hydro defines its own `EventMap` (see `Events`) with domain-specific events.

| Method | Description |
|--------|-------------|
| `on(event, callback)` | Subscribes to an event; returns a `Disposable` that removes the listener when called. |
| `emit(event, ...args)` | Fires an event synchronously to all registered listeners. |
| `parallel(event, ...args)` | Fires an event and runs all listeners concurrently; returns a `Promise` that resolves when all listeners complete. |
| `broadcast(event, ...args)` | Emits an event across all cluster processes (PM2 or MongoDB bus); calls `parallel` on each node. |

### Lifecycle & Plugin Methods

Inherited from `cordis.Context` for managing plugins and side effects.

| Method | Description |
|--------|-------------|
| `plugin(Plugin, config?)` | Registers and initializes a plugin (class or function) on this context; returns a `Fiber`. |
| `effect(() => Disposable)` | Registers a side-effect; the returned cleanup function is called when the context is disposed. |
| `mixin(serviceId, methods)` | Mixes named methods from a service instance onto the context prototype, making them callable as `ctx.method()`. |
| `inject` | Declares service dependencies on a plugin/service class (static `inject` array). |

### Hydro-Specific Methods

Added by `ApiMixin` — these are available as direct methods on every context instance.

| Method | Description |
|--------|-------------|
| `addScript(name, description, schema, run)` | Registers a named admin script with input validation and an async execution function. |
| `provideModule(type, id, module)` | Registers a pluggable module (e.g., `'hash'`, `'problemSearch'`) into the global module registry. |
| `injectUI(node, name, args?, ...permPrivChecker)` | Injects a UI component into a frontend slot (`Nav`, `ProblemAdd`, `ControlPanel`, etc.) with optional permission guards. |
| `setImmediate(callback)` | Schedules a callback for the next event loop tick; auto-disposed when the context is disposed. |

### Context Properties

| Property | Type | Description |
|----------|------|-------------|
| `loader` | `Loader` | The plugin loader service managing plugin lifecycle and hot-reload. |
| `check` | `CheckService` | The check/ping service for health monitoring. |
| `domain` | `DomainDoc?` | The current domain document (available in domain-scoped contexts). |
| `geoip` | `GeoIP?` | GeoIP resolver service (optional, may not be loaded). |

---

## Service

Abstract base class for all Hydro services. Extends `cordis.Service<T, Context>`.

```ts
import { Service } from 'hydrooj';

export default class MyService extends Service {
    static inject = ['database'];  // declare dependencies

    constructor(ctx: Context) {
        super(ctx, 'myService');
    }
}
```

Services are registered via `ctx.plugin(MyService)` and become available on the context by their service ID. Other plugins declare dependencies through the static `inject` array.

---

## Types

Re-exported from `cordis`, adapted for Hydro's `Context`.

| Type | Description |
|------|-------------|
| `Fiber` | `cordis.Fiber<Context>` — represents a plugin's lifecycle node in the context tree; tracks state (pending, loading, active, disposed). |
| `FiberState` | Enum of fiber lifecycle states: `PENDING`, `LOADING`, `ACTIVE`, `DISPOSED`, etc. |
| `Disposable` | `() => void` — cleanup function returned by `on()`, `effect()`, and other registration methods. |
| `Plugin` | Type alias for a plugin definition — either a class extending `Service` or a function `(ctx, config) => void`. |
