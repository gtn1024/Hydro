# Utility Libraries

Miscellaneous utility functions and re-exported third-party modules available to plugin developers.

> **Source**: Various files under `packages/hydrooj/src/lib/` and `packages/hydrooj/src/service/layers/base.ts`
> **Export**: `import { nanoid, moment, buildContent, ... } from 'hydrooj';`

---

## Re-exported Third-Party Modules

### nanoid

```typescript
import { nanoid } from 'nanoid';
```

Re-exported from the [`nanoid`](https://github.com/ai/nanoid) package. Generates a unique URL-friendly string ID. Used internally for generating token IDs, storage keys, and other random identifiers.

### moment

```typescript
import moment from 'moment-timezone';
```

Re-exported as the default export of `moment-timezone`. A date/time manipulation library with full timezone support. Use this instead of bare `moment` to get timezone-aware date handling.

### isMoment

```typescript
import { isMoment } from 'moment-timezone';
```

Re-exported from `moment-timezone`. A type guard that returns `true` if the given value is a Moment.js object.

---

## Content Building

### buildContent

```typescript
function buildContent(
  source: ProblemSource,
  type?: 'markdown' | 'html',
  translate?: (s: string) => string
): string
```

Converts a structured problem description object into a formatted markdown or HTML string. Sections (background, description, input, output, hint, source) are rendered with appropriate headings. Sample inputs/outputs are formatted as fenced code blocks (markdown) or `<pre><code>` blocks (HTML).

**Parameters**:
- `source` — An object with optional fields: `background`, `description`, `input`, `output`, `samples`, `samplesRaw`, `hint`, `source`. Also accepts a legacy array format for backward compatibility.
- `type` — Output format, defaults to `'markdown'`.
- `translate` — Optional translation function applied to section headings (e.g. `"Background"` → localized text).

> **Source**: `packages/hydrooj/src/lib/content.ts`

---

## MIME Type Detection

### mime

```typescript
function mime(file: string): string
```

Returns the MIME type for a given filename. Special-cases `.in`, `.out`, `.ans` extensions to `'text/plain'` (common in competitive programming). Falls back to `mime-types` lookup, then `'application/octet-stream'`.

> **Source**: `packages/hydrooj/src/lib/mime.ts`

---

## Difficulty Calculation

### difficultyAlgorithm

```typescript
function difficultyAlgorithm(nSubmit: number, nAccept: number): number | null
```

Computes a problem difficulty score (1–10) based on submission and acceptance counts. Uses a numerical integration of the log-normal probability density function weighted by acceptance rate. Returns `null` when `nSubmit` is 0.

> **Source**: `packages/hydrooj/src/lib/difficulty.ts`

---

## Rating Calculation

### rating

```typescript
function rating(users: RatingInputUser[]): RatingOutputUser[]
```

Implements a Codeforces-style Elo rating system. Takes an array of users with `old` rating, `rank`, and `uid`, and returns their new ratings after a contest. Handles seed calculation, delta normalization, and anti-inflation adjustments.

**Types**:

```typescript
interface RatingInputUser {
  old: number;   // previous rating
  uid: number;   // user identifier
  rank: number;  // contest rank (1-based)
}

interface RatingOutputUser {
  new: number;   // updated rating
  uid: number;   // user identifier
}
```

> **Source**: `packages/hydrooj/src/lib/rating.ts`

---

## Avatar URL Generation

### avatar

```typescript
function avatar(src: string, size?: number, fallback?: string): string
```

Generates an avatar URL from a provider-prefixed identifier string (e.g. `"gravatar:user@example.com"`, `"qq:12345"`, `"github:username"`, `"url:https://..."`). Falls back to Gravatar with an empty email if the provider is unknown or the string is unparseable.

**Parameters**:
- `src` — Provider-prefixed identifier (format: `"provider:value"`).
- `size` — Requested image size in pixels, defaults to `64`.
- `fallback` — Alternative `src` to use if the primary one is empty or unparseable.

**Built-in providers**:

| Provider   | Format               | Description                           |
|------------|----------------------|---------------------------------------|
| `gravatar` | `gravatar:email`     | Gravatar avatar via MD5 email hash    |
| `qq`       | `qq:QQ_number`       | QQ avatar via q1.qlogo.cn             |
| `github`   | `github:username`    | GitHub avatar                         |
| `url`      | `url:https://...`    | Direct URL passthrough                |

> **Source**: `packages/hydrooj/src/lib/avatar.ts`

---

## Problem Config Parsing

### testdataConfig

```typescript
function testdataConfig(
  config: string | ProblemConfigFile,
  files: string[]
): Promise<ProblemConfig>
```

Parses a problem configuration (YAML string or pre-parsed object) and a list of testcase filenames into a summary `ProblemConfig` object. Computes aggregate time/memory bounds across all subtasks, counts test cases, and extracts metadata like `type`, `hackable`, `langs`, `redirect`.

**Note**: Exported as `testdataConfig` in the Hydro plugin API (aliased from the internal `parseConfig` function name).

> **Source**: `packages/hydrooj/src/lib/testdataConfig.ts`

---

## Email

### sendMail

```typescript
function sendMail(
  to: string,
  subject: string,
  text: string,
  html: string
): Promise<any>
```

Sends an email using SMTP settings from system configuration (`smtp.host`, `smtp.port`, `smtp.secure`, `smtp.user`, `smtp.pass`, `smtp.from`). Uses `nodemailer` internally. Throws `SendMailError` on failure.

> **Source**: `packages/hydrooj/src/lib/mail.ts`

---

## Password Hashing

### pwsh

```typescript
function pwsh(password: string, salt: string): Promise<string>
```

Hashes a password with the given salt using PBKDF2 (SHA-256, 100,000 iterations, 64-byte key). Returns the first 64 hex characters of the derived key. Registered as `global.Hydro.module.hash.hydro` at module load time.

> **Source**: `packages/hydrooj/src/lib/hash.hydro.ts`

---

## UI Context

### UiContextBase

```typescript
interface UiContextBase {
  cdn_prefix: string;
  cdn_dynamic: boolean;
  url_prefix: string;
  ws_prefix: string;
}
```

A constant object providing default CDN, URL, and WebSocket prefix values for the frontend. Used as the base template that gets augmented per-request with domain-specific overrides (CDN URL, WebSocket prefix, domain info).

> **Source**: `packages/hydrooj/src/service/layers/base.ts`
