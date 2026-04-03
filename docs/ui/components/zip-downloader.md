# download / ZipDownloader

Source: `packages/ui-default/components/zipDownloader/index.ts`

Creates and streams a ZIP archive to the browser using `streamsaver`, with concurrent file downloads and retry logic.

## Functions

### download

```ts
async function download(
  filename: string,
  targets: { filename: string; url?: string; content?: string }[]
): Promise<void>
```

Downloads a ZIP file containing the given targets. Uses `streamsaver` to stream the ZIP directly to disk without holding the entire archive in memory. Files are fetched concurrently (up to 5 parallel) with automatic retry on failure.

**Parameters:**
- `filename` — Name for the generated ZIP file (e.g. `"Export.zip"`).
- `targets` — Array of files to include. Each target must have `filename` and either `url` (remote file to fetch) or `content` (in-memory string).

**Behavior:**
1. Ensures `WritableStream` is available (loads polyfill if needed).
2. Creates a write stream via `streamsaver.createWriteStream`.
3. Queues all file downloads with concurrency of 5. Each failed download retries up to 5 times with 3-second delays.
4. Pipes a ZIP stream (via `createZipStream`) into the file stream.
5. Guards browser close during download via `beforeunload` / `unload` listeners.
6. On unrecoverable error: logs to Sentry, stops download, shows error notification.

### downloadProblemSet

```ts
async function downloadProblemSet(
  pids: number[],
  name?: string
): Promise<void>
```

Exports one or more problems as a ZIP archive. Gathers problem metadata, content, test data, and additional files, then delegates to `download`. Fires the `problemset/download` lifecycle hook so plugins can inject extra files.

**Parameters:**
- `pids` — Array of problem numeric IDs to export.
- `name` (default `"Export"`) — Base name for the ZIP file (becomes `{name}.zip`).

**Behavior:**
1. Fires `ctx.serial('problemset/download', pids, name, targets)` — plugins can push additional targets.
2. For each problem:
   - Fetches problem metadata via `api('problem', ...)` and serializes it as `problem.yaml`.
   - Parses content: if JSON object, splits each key into `problem_{key}.md`; otherwise writes `problem.md`.
   - Fetches signed download links for test data and additional files.
3. Calls `download(name + '.zip', targets)` to stream the ZIP.
4. On error: logs to Sentry and shows error notification.

## EventMap Extension

The module declares a `problemset/download` event on the frontend `EventMap`:

```ts
interface EventMap {
  'problemset/download': (
    pids: number[],
    name: string,
    targets: { filename: string; url?: string; content?: string }[]
  ) => void;
}
```

Plugins can listen via `ctx.on('problemset/download', ...)` to inject additional files into the ZIP before download begins.
