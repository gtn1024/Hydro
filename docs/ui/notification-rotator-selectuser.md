# Notification, Rotator & selectUser

Source: `packages/ui-default/components/notification/index.ts`, `packages/ui-default/components/rotator/index.js`, `packages/ui-default/components/selectUser.tsx`

Three UI utilities: toast-style notifications, an animated number rotator, and a user picker dialog.

---

## Notification

```ts
class Notification
```

A dual-mode notification system. Static methods (`success`, `info`, `warn`, `error`) render Mantine toast notifications. The constructor creates a legacy jQuery-based notification with optional avatar, title, and click action.

### Static Methods (Mantine Toasts)

| Method | Signature | Description |
|--------|-----------|-------------|
| `success` | `(message: string, duration?: number) => string` | Shows a green success toast with check icon. |
| `info` | `(message: string, duration?: number) => string` | Shows a blue info toast with info-circle icon. |
| `warn` | `(message: string, duration?: number) => string` | Shows an orange warning toast with warning icon. |
| `error` | `(message: string, duration?: number) => string` | Shows a red error toast with close-circle icon. |

All static methods delegate to `@mantine/notifications` and return the notification `id`.

### Instance API (Legacy jQuery Notifications)

**Constructor:** `new Notification(options: NotificationOptions)`

```ts
interface NotificationOptions {
  avatar?: string;    // URL for avatar image
  title?: string;     // Notification title
  message: string;    // Body text (newlines become <p> elements)
  type?: string;      // CSS class suffix appended to the notification element
  duration?: number;  // Auto-hide delay in ms (default 3000)
  action?: any;       // Click handler (default no-op)
}
```

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `show` | `(autohide?: boolean) => void` | Reveals the notification; auto-hides after `duration` if `autohide` is true (default). |
| `hide` | `() => void` | Hides the notification and removes the DOM element after 200ms transition. |
| `handleClick` | `() => void` | Invokes the `action` callback on click. |

---

## Rotator

```ts
class Rotator extends DOMAttachedObject
```

An animated value display that slides the old value out and the new value in. Numeric comparisons determine slide direction — higher values slide up from below, lower values slide down from above.

**DOM Attachment:** `data-vjRotatorInstance` (via `DOMAttachedObject.DOMAttachKey = 'vjRotatorInstance'`)

**Constructor:** `new Rotator($dom: JQuery)` — Reads the element's text content as the initial value.

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `setValue` | `(value: string) => void` | Animates to a new value. No-op if value unchanged. |
| `getValue` | `() => string` | Returns the current displayed value. |

**Animation behavior:** Outgoing item slides to `pos--above` or `pos--below` (opposite of incoming direction), incoming item starts from the other side and transitions to `pos--original`. Total animation duration is 4000ms per transition.

---

## selectUser

```ts
function selectUser(): Promise<string | undefined>
```

Opens a `prompt` dialog with a user autocomplete field. Returns the selected username/UID, or `undefined` if the dialog was cancelled.

Also registered globally as `window.Hydro.components.selectUser`.
