# Dialog System

Source: `packages/ui-default/components/dialog/index.tsx`, `packages/ui-default/components/dialog/DomDialog.ts`

The dialog system provides modal overlays for user interaction — from simple alerts to complex multi-field forms. Built on jQuery DOM manipulation with React-rendered form content.

## Classes

### Dialog

```ts
class Dialog
```

The base modal dialog. Constructs a jQuery-based overlay with a body region and an action button bar. Wraps `DomDialog` for show/hide animation and action dispatch.

**Properties:** `options` (DialogOptions), `$dom` (JQuery), `domDialogInstance` (DomDialog)

**Methods:**
- `open()` — Shows the dialog; returns a `Promise<string>` that resolves with the action name (e.g. `"ok"`, `"cancel"`).
- `close()` — Hides the dialog.

### InfoDialog

```ts
class InfoDialog extends Dialog
```

Preconfigured `Dialog` with an "Ok" button. Supports closing via backdrop click and Escape key.

### ActionDialog

```ts
class ActionDialog extends Dialog
```

Preconfigured `Dialog` with "Cancel" and "Ok" buttons. Supports closing via backdrop click and Escape key. Includes a `clear()` method that resets all input values.

### ConfirmDialog

```ts
class ConfirmDialog extends Dialog
```

Preconfigured `Dialog` with "No" and "Yes" buttons. When `options.canCancel` is true, adds a "Cancel" button and enables backdrop/Escape dismissal.

## Functions

### prompt

```ts
async function prompt<T extends string, R extends Record<T, Field>>(
  title: string, fields: R, options?: PromptOptions
): Promise<Result<T, R> | null>
```

Displays a modal form with the given fields. Returns a typed object mapping field names to values, or `null` if cancelled. Validates `required` fields before accepting.

### confirm

```ts
async function confirm(text: string): Promise<boolean>
```

Shows a `ConfirmDialog` with the given message. Returns `true` if "Yes" was clicked, `false` otherwise.

### alert

```ts
async function alert(text: string): Promise<string>
```

Shows an `InfoDialog` with the given message. Resolves with the action string when dismissed.

## Interfaces

### Field

```ts
interface Field {
  type: 'text' | 'checkbox' | 'user' | 'userId' | 'username' | 'domain';
  options?: string[] | Record<string, string>;
  placeholder?: string;
  label?: string;
  autofocus?: boolean;
  required?: boolean;
  default?: string;
  columns?: number;  // grid column width; negative value triggers row break
}
```

Describes a single form field for `prompt()`. The `type` determines both the UI widget and the return type in the result object:

| type | Widget | Result type |
|------|--------|-------------|
| `'text'` | Text input / select (if `options` present) | `string` |
| `'checkbox'` | Checkbox | `boolean` |
| `'user'` | User autocomplete | `any` (user object) |
| `'userId'` | User autocomplete | `number` |
| `'username'` | User autocomplete | `string` |
| `'domain'` | Domain autocomplete | `string` |

### DialogOptions

```ts
interface DialogOptions {
  classes: string;
  $body: HTMLElement | JQuery | string;
  $action: any;
  width?: string;
  height?: string;
  cancelByClickingBack?: boolean;
  cancelByEsc?: boolean;
  canCancel?: boolean;
  onDispatch?: (action: string) => boolean | void;
}
```

Configuration for all dialog classes. `onDispatch` returning `false` prevents dialog closure.
