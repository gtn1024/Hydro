# @hydrooj/framework Re-exports

Core web framework interfaces re-exported from `@hydrooj/framework` via `hydrooj`.

> **Source**: `packages/hydrooj/src/plugin-api.ts:8-11`

## Overview

These symbols are the building blocks for defining routes, handlers, and API operations in Hydro plugins.

```ts
import {
    Apis, APIS, HandlerCommon, httpServer,
    Mutation, Query, Router, Subscription, WebService,
} from 'hydrooj';
```

## API Definition Helpers

| Export | Type | Description |
|--------|------|-------------|
| `Query` | Function | Defines a read-only API operation; returns an `ApiCall<'Query', Arg, Res>`. |
| `Mutation` | Function | Defines a write API operation; returns an `ApiCall<'Mutation', Arg, Res>`. |
| `Subscription` | Function | Defines a real-time event-stream API operation; returns an `ApiCall<'Subscription', Arg, Res>` with an `emit` callback. |

## API Registry

| Export | Type | Description |
|--------|------|-------------|
| `Apis` | Interface | TypeScript interface describing the typed shape of all registered API operations by namespace. |
| `APIS` | Object | Runtime dictionary holding all registered API call definitions. Plugins register their APIs into this object via `ApiService.provide()`. |

## Handlers

| Export | Type | Description |
|--------|------|-------------|
| `HandlerCommon` | Class | Base class for HTTP and WebSocket handlers; provides `request`, `response`, `args`, `user`, and utility methods like `checkPerm()`, `checkPriv()`, `url()`, `renderHTML()`. |

## Routing & Server

| Export | Type | Description |
|--------|------|-------------|
| `Router` | Class | Extended Koa Router (`@koa/router`) with WebSocket support (`ws()` method) and disposable route registration. |
| `httpServer` | `http.Server` | The underlying Node.js `http.Server` instance. |
| `WebService` | Class | Core web server service (extends cordis `Service`); manages route/connection registration (`ctx.Route()`, `ctx.Connection()`), middleware layers, handler mixins, and template renderers. |
