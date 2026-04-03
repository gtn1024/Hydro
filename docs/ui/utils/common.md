# @hydrooj/utils/lib/common

> Source: `framework/utils/lib/common.ts`
> Re-exported via `packages/ui-default/api.ts:16`

Common utility functions available to all frontend plugins via `import { ... } from 'hydrooj'`.

## Functions

### String Utilities

| API | Description |
|-----|-------------|
| `randomstring(digit?, dict?)` | Generate a random string of `digit` length (default 32) using characters from `dict` (default alphanumeric). |
| `formatDate(date, fmt?)` | Format a `Date` object using printf-style placeholders (`%Y`, `%m`, `%d`, `%H`, `%M`, `%S`). Default format: `'%Y-%m-%d %H:%M:%S'`. |
| `formatSeconds(seconds?, showSeconds?)` | Format a duration in seconds to `HH:MM:SS` (or `H:MM` when `showSeconds` is false). |
| `getAlphabeticId(i)` | Convert a zero-based index to an alphabetic ID (`A`, `B`, ... `Z`, `AA`, `AB`, ...). Caches up to `AZ` for performance. |

### Parsing

| API | Description |
|-----|-------------|
| `parseTimeMS(str, throwOnError?)` | Parse a time string (e.g. `"1s"`, `"500ms"`, `"100us"`) to milliseconds. Plain numbers are returned as-is. Default on parse failure: `1000`. |
| `parseMemoryMB(str, throwOnError?)` | Parse a memory string (e.g. `"256mb"`, `"1gb"`, `"512kb"`) to MiB. Plain numbers are returned as-is. Default on parse failure: `256`. |

### Case Conversion

| API | Description |
|-----|-------------|
| `camelCase(source)` | Deep-convert object keys or a string from `snake_case`/`kebab-case` to `camelCase`. Recurses into nested objects and arrays. |
| `paramCase(source)` | Deep-convert object keys or a string to `param-case` (replaces `_` and uppercase letters with `-lowercase`). |
| `snakeCase(source)` | Deep-convert object keys or a string to `snake_case` (replaces `-` and uppercase letters with `_lowercase`). |

### Array & Collection

| API | Description |
|-----|-------------|
| `diffArray(a, b)` | Compare two arrays by sorted content; returns `true` if they differ. |
| `sortFiles(files, key?)` | Natural-sort an array of strings or objects by `_id` (or specified key). Numeric segments are compared numerically. |
| `randomPick(arr)` | Return a random element from the array. |

### Async & Misc

| API | Description |
|-----|-------------|
| `sleep(timeout)` | Promise-based delay — resolves `true` after `timeout` milliseconds. |
| `size(s, base?)` | Format a byte size to a human-readable string (e.g. `"1.5 GiB"`). `base` multiplier applied before formatting. |
| `noop()` | Empty function — useful as a default callback. |

## Types

| API | Description |
|-----|-------------|
| `StringKeys<O>` | Utility type that extracts keys of `O` whose values extend `string`. |

## Global Prototype Extensions

Importing this module installs the following extensions on built-in prototypes:

| Extension | Description |
|-----------|-------------|
| `String.prototype.format(...args)` | Format string with `{key}` placeholders (object arg) or `{0}`, `{1}` positional placeholders (array args). |
| `String.prototype.formatFromArray(args)` | Format string with positional `{0}`, `{1}`, ... placeholders from an array. |
| `String.prototype.rawformat(object)` | Split string on `{@}` and join with the provided object — simple template interpolation. |
| `Math.sum(...args)` | Sum all arguments, flattening nested arrays. |
| `Set.isSuperset(set, subset)` | Check whether `set` contains all elements of `subset`. |
| `Set.union(setA, setB)` | Return a new `Set` containing elements from both inputs. |
| `Set.intersection(setA, setB)` | Return a new `Set` containing only elements present in both inputs. |
