# uploadFiles

Source: `packages/ui-default/components/upload.tsx`

Uploads files to a server endpoint with a progress dialog, browser close-guard, and per-file callbacks.

## Function

### uploadFiles

```ts
async function uploadFiles(
  endpoint?: string,
  files?: File[] | FileList,
  options?: UploadOptions
): Promise<void>
```

Uploads files sequentially to `endpoint` via `request.postFile`. Shows a `Dialog` with two `Progress` bars (overall + per-file). Displays a toast notification on success or failure. Blocks browser navigation during upload via `beforeunload`.

**Parameters:**
- `endpoint` (default `''`) — Server URL to POST files to.
- `files` (default `[]`) — Files to upload. Accepts `File[]` or `FileList` (from `<input>`).
- `options` — See `UploadOptions` below.

**Behavior:**
1. Shows info toast "Uploading files..." and opens a progress dialog.
2. Iterates files sequentially. For each file:
   - Builds `FormData` with `filename`, `file`, `type` (if set), and `operation: 'upload_file'`.
   - POSTs to endpoint with XHR progress tracking (updates both progress bars).
   - Calls `singleFileUploadCallback(file)` after each successful upload.
3. On success: shows success toast, optionally navigates via PJAX.
4. On error: logs to console, shows error toast with message.
5. After completion: waits 500ms, closes dialog.

## Interface

### UploadOptions

```ts
interface UploadOptions {
  type?: string;                          // Appended as 'type' in FormData
  pjax?: boolean;                         // Navigate via PJAX after upload
  sidebar?: boolean;                      // Append 'sidebar=true' to PJAX URL
  singleFileUploadCallback?: (file: File) => any;  // Called after each file succeeds
  filenameCallback?: (file: File) => string;       // Custom filename override
}
```

- `type` — Passed as form field; used to categorize uploads on the server side.
- `pjax` — When `true`, performs a PJAX navigation to `endpoint` (with optional `type` and `sidebar` query params) after all uploads complete.
- `sidebar` — Adds `sidebar=true` to the PJAX URL.
- `singleFileUploadCallback` — Async callback invoked after each individual file upload succeeds.
- `filenameCallback` — Override the filename sent to the server; defaults to `file.name`.
