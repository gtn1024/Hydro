# api() & request 工具

Source: `packages/ui-default/utils/index.ts`, `packages/ui-default/utils/base.ts`

Frontend HTTP request utilities and language helper for plugin developers.

---

## api()

```ts
function api(method: string, args: Record<string, any>, projection?: any): Promise<any>
```

Calls a Hydro backend API method via the `/d/{domainId}/api/{method}` endpoint. Sends `args` and optional `projection` as JSON body via POST. Throws if the response contains an `error` field.

| Parameter | Type | Description |
|-----------|------|-------------|
| `method` | `string` | Backend API method name (e.g. `"contest.add"`) |
| `args` | `Record<string, any>` | Arguments forwarded to the backend method |
| `projection` | `any` | Optional field projection for the response |

---

## request

```ts
const request: { ajax, post, get, postFile }
```

A jQuery-based HTTP client object with structured error handling.

### request.ajax()

```ts
function ajax(options: Record<string, any>): Promise<any>
```

Low-level wrapper around `$.ajax` with JSON defaults and unified error handling. Sets `dataType: 'json'` and `Accept: application/json` by default. Preserves the original call stack on errors.

**Error handling:**

| Condition | Behavior |
|-----------|----------|
| Aborted request | Rejects with `Error` where `err.aborted = true` |
| Network failure (`readyState === 0`) | Rejects with "Network error" |
| Server JSON error with params | Applies i18n to `error.message` with `error.params` |
| Server JSON error without params | Rejects with `error.message` |
| Other failures | Rejects with status text or thrown error |

### request.post()

```ts
function post(url: string, dataOrForm?: JQueryStatic | Node | string | Record<string, any>, options?: Record<string, any>): Promise<any>
```

Sends a POST request. The `dataOrForm` parameter accepts multiple input types:

| Input Type | Behavior |
|------------|----------|
| jQuery form (`$(form)`) | Serialized via `.serialize()` |
| DOM form element | Serialized via `$().serialize()` |
| String | Sent as raw query string body |
| Plain object | JSON-stringified with `Content-Type: application/json` |

### request.get()

```ts
function get(url: string, qs?: Record<string, any>, options?: Record<string, any>): Promise<any>
```

Sends a GET request with query string parameters.

### request.postFile()

```ts
function postFile(url: string, form: FormData, options?: Record<string, any>): Promise<any>
```

Uploads files via `FormData`. Sets `processData: false` and `contentType: false` so jQuery passes the FormData untouched (browser sets the correct multipart boundary).

---

## getAvailableLangs()

```ts
function getAvailableLangs(langsList?: string[]): Record<string, any>
```

Filters `window.LANGS` to return only available language entries. Excludes entries that are prefixes of other keys (e.g. `"en"` when `"en.section"` exists), entries marked as `hidden` (unless explicitly listed in `langsList`), and entries marked as `disabled`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `langsList` | `string[]` | Optional whitelist of language keys to include (overrides `hidden` check) |
