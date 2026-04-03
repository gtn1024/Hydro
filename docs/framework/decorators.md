# @hydrooj/framework Decorators & Validators

Parameter binding decorators and type validators for route handler methods.

> **Source**: `framework/framework/decorators.ts`, `framework/framework/validator.ts` — re-exported via `hydrooj`.

```ts
import { param, query, post, route, Types } from 'hydrooj';
```

## Parameter Decorators

Decorators that bind handler method parameters to specific request sources. They extract, validate, and convert values before passing them to the method.

| Decorator | Source | Description |
|-----------|--------|-------------|
| `param` | all (query + body) | Binds a parameter from the combined request arguments. |
| `query` | query string | Binds a parameter from `request.query` (GET parameters). |
| `get` | query string | Alias for `query`. |
| `post` | request body | Binds a parameter from `request.body` (POST body). |
| `route` | route params | Binds a parameter from route path params plus `domainId`. |
| `subscribe` | — | Registers a method (or class) as a WebSocket subscription handler for the given channel name. |

### Usage

Each parameter decorator accepts `(name: string, type?: Type, ...options)`:

```ts
class MyHandler extends Handler {
    @param('name', Types.ShortString)
    @param('page', Types.PositiveInt, true)       // optional
    @param('tags', Types.CommaSeperatedArray)
    async run(name: string, page: number | undefined, tags: string[]) { }
}
```

### Signature

```ts
(name: string, type: Type, validate?: Validator | null, convert?: Converter) => MethodDecorator
(name: string, type?: Type, isOptional?: boolean, validate?: Validator, convert?: Converter) => MethodDecorator
```

A `Type` can be a Schemastery schema or a tuple `[convert, validate?, isOptional?]`.

## Type Validators — `Types`

Pre-built type definitions combining a converter and a validator. Each is a `Type<T>` usable as the second argument to any parameter decorator.

### String Types

| Name | Output | Description |
|------|--------|-------------|
| `Types.Content` | `string` | Multi-line text content (trimmed, max 65535 chars). |
| `Types.Key` | `string` | Identifier key (`/^\w-$/`, 1–255 chars, SASLprep). |
| `Types.Name` | `string` | General name field (1–255 chars, SASLprep). **@deprecated** |
| `Types.Username` | `string` | Username (3–31 chars or 2+ CJK, SASLprep). |
| `Types.Password` | `string` | Password string (6–255 chars). |
| `Types.UidOrName` | `string` | User ID (numeric) or username (3–31 chars or 2+ CJK, SASLprep). |
| `Types.Email` | `string` | Email address (`user@domain.tld`, SASLprep). |
| `Types.Filename` | `string` | File name (1–255 chars, no `\/?#~!|*`, SASLprep). |
| `Types.DomainId` | `string` | Domain identifier (letter prefix, 4–32 `\w` chars, SASLprep). |
| `Types.ProblemId` | `string \| number` | Problem ID — numeric strings convert to `number`. |
| `Types.Role` | `string` | Role name (1–31 `\w` or CJK chars, SASLprep). |
| `Types.Title` | `string` | Short title (1–64 chars, trimmed). |
| `Types.ShortString` | `string` | Short string (1–255 chars). |
| `Types.String` | `string` | Any non-empty string. |
| `Types.Emoji` | `string` | Single emoji character. |

### Number Types

| Name | Output | Description |
|------|--------|-------------|
| `Types.Int` | `number` | Signed integer (converts from string). |
| `Types.UnsignedInt` | `number` | Non-negative integer (zero allowed). |
| `Types.PositiveInt` | `number` | Positive integer (≥ 1). |
| `Types.Float` | `number` | Finite floating-point number (converts from string). |

### Special Types

| Name | Output | Description |
|------|--------|-------------|
| `Types.ObjectId` | `ObjectId` | MongoDB ObjectId (validates via `ObjectId.isValid`). |
| `Types.Boolean` | `boolean` | Boolean — truthy values except `'false'`/`'off'`/`'no'`/`'0'`; always optional. |
| `Types.Date` | `string` | Date string in `YYYY-MM-DD` format (zero-padded). |
| `Types.Time` | `string` | Time string in `HH:MM` format (zero-padded). |

### Composite Types

| Name | Output | Description |
|------|--------|-------------|
| `Types.Range(arr \| obj)` | `T` | Accepts any value from the given array or object keys; numeric strings auto-convert to `number`. |
| `Types.NumericArray` | `number[]` | Array of finite numbers (comma-separated string or JSON array). |
| `Types.CommaSeperatedArray` | `string[]` | Array of strings split by commas. |
| `Types.Set` | `Set<any>` | Converts array or single value to a `Set`. |
| `Types.Any` | `any` | Pass-through, no validation. |
| `Types.ArrayOf(type, isOptional?)` | `T[]` | Wraps any `Type<T>` into an array variant; optional elements become `undefined`. |
| `Types.AnyOf(...types)` | `T` | Union — accepts values matching any one of the given types. |

## Utility Types

Re-exported TypeScript types for building custom validators:

| Type | Description |
|------|-------------|
| `Converter<T>` | `(value: any) => T` — transforms raw input to typed output. |
| `Validator` | `(value: any) => boolean` — returns `true` if the value is valid. |
| `Type<T>` | `Schema<T> \| readonly [Converter<T>, Validator?, (boolean \| 'convert')?]` — either a Schemastery schema or a `[convert, validate?, optional?]` tuple. |
