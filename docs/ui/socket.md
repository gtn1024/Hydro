# Socket (Sock)

Source: `packages/ui-default/components/socket/index.ts`

A WebSocket client with automatic reconnection, heartbeat, and optional Shorty compression.

---

## Sock

```ts
class Sock
```

Wraps `ReconnectingWebSocket` with ping/pong heartbeat, Shorty decompression, and session-based authentication.

### Constructor

**`new Sock(url: string, nocookie?: boolean, shorty?: boolean)`**

Creates a WebSocket connection to `url`. The URL scheme is automatically converted from `http`/`https` to `ws`/`wss`. If the target host differs from the current page and a `sid` cookie exists, the session ID is appended as a query parameter (unless `nocookie` is `true`). If `shorty` is `true`, the `shorty=on` query parameter is sent to request compressed messages.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | `string` | — | WebSocket endpoint URL (http/https scheme auto-converted to ws/wss) |
| `nocookie` | `boolean` | `false` | Skip automatic session ID forwarding to cross-origin hosts |
| `shorty` | `boolean` | `false` | Request Shorty-compressed messages from server |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `url` | `string` | Resolved WebSocket URL (public, set via constructor) |
| `sock` | `ReconnectingWebSocket` | Underlying WebSocket instance (auto-reconnects, max 100 retries, 10s max delay) |
| `interval` | `NodeJS.Timeout` | Heartbeat interval handle (sends `"ping"` every 30s while connected) |

### Event Callbacks

Assignable function properties — set directly or via `on()`.

| Callback | Signature | Description |
|----------|-----------|-------------|
| `onopen` | `(sock: ReconnectingWebSocket) => void` | Fired when connection is established. |
| `onclose` | `(code: number, reason: string) => void` | Fired when connection closes. Codes >= 4000 trigger automatic `close()`. |
| `onmessage` | `(message: MessageEvent, data: string) => void` | Fired for application-level messages (ping/pong/shorty handshake filtered out). |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `on` | `(event: 'message' \| 'close' \| 'open', callback: (...args: any[]) => void) => void` | Registers an event callback (sets `onmessage`, `onclose`, or `onopen`). |
| `send` | `(data: any) => void` | Sends data through the WebSocket. |
| `close` | `() => void` | Closes the connection (safe to call multiple times). |

### Internal Message Handling

The `onmessage` handler on the underlying socket processes several protocol-level messages before dispatching to the user callback:

| Incoming Message | Behavior |
|-----------------|----------|
| `"pong"` | Silently consumed (heartbeat response). |
| `"ping"` | Replies with `"pong"` (server-initiated heartbeat). |
| `"shorty"` | Activates Shorty decompression for subsequent messages. |
| `PermissionError` / `PrivilegeError` JSON | Calls `close()` — connection is terminated on auth errors. |
| All other messages | If Shorty is active, decompresses then parses as JSON; dispatches to `this.onmessage`. |
