# Handler, ConnectionHandler & requireSudo

Server-side handler classes and the sudo decorator for request processing.

> **Source**: `packages/hydrooj/src/service/server.ts`
> **Export**: `import { Handler, ConnectionHandler, requireSudo } from 'hydrooj';`

---

## Classes

### `Handler`

HTTP request handler class, extending `HandlerOriginal<Context>` from `@hydrooj/framework`. Adds a `domain` property and inherits all framework handler utilities (`request`, `response`, `args`, `user`, `checkPerm`, `checkPriv`, `url`, `renderHTML`, etc.). This is the base class for all Hydro HTTP route handlers.

| Property | Type | Description |
|----------|------|-------------|
| `domain` | `DomainDoc` | The current domain document, injected during handler creation |

```typescript
import { Handler } from 'hydrooj';

class MyHandler extends Handler {
  async get() {
    const { domain, user } = this;
    // domain._id, domain.host, etc.
  }
}
```

### `ConnectionHandler`

WebSocket connection handler class, extending `ConnectionHandlerOriginal<Context>` from `@hydrooj/framework`. Adds a `domain` property and inherits framework WebSocket utilities (`send`, `close`, etc.). This is the base class for all Hydro WebSocket connection handlers.

| Property | Type | Description |
|----------|------|-------------|
| `domain` | `DomainDoc` | The current domain document, injected during handler creation |

```typescript
import { ConnectionHandler } from 'hydrooj';

class MyConnection extends ConnectionHandler {
  async prepare() {
    this.send({ type: 'welcome', domain: this.domain._id });
  }
}
```

---

## Decorators

### `requireSudo`

Method decorator that enforces sudo (re-authentication) privilege before allowing the decorated handler method to execute. If the user has an active sudo session (within the last hour), the original method runs. Otherwise, the user is redirected to the sudo confirmation page.

**Behavior**:
- Checks `session.sudo` timestamp — valid for 1 hour
- On valid sudo: restores saved `referer` header and proceeds with original method
- On missing/expired sudo: saves request context to `session.sudoArgs` and redirects to `user_sudo` page

```typescript
import { Handler, requireSudo } from 'hydrooj';

class AdminHandler extends Handler {
  @requireSudo
  async post() {
    // This handler requires the user to have re-authenticated
    // via the sudo confirmation page within the last hour
  }
}
```

---

## Notes

- Both `Handler` and `ConnectionHandler` re-export framework classes with Hydro's `Context` type parameter and an added `domain` property. The `domain` is injected via the `handler/create` lifecycle hook.
- Additional handler mixins (`paginate`, `limitRate`, `checkPerm`, `checkPriv`, `progress`, `renderTitle`, `url`, `translate`) are registered at server startup via `server.handlerMixin()` — see `@hydrooj/framework`'s `HandlerCommon` for the base interface.
- `requireSudo` is designed for security-sensitive operations to prevent misuse of remembered passwords on shared computers.
