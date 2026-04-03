# StorageService

File storage backend service providing upload, download, deletion, and signed URL generation. Supports both local filesystem and S3-compatible object storage.

> **Source**: `packages/hydrooj/src/service/storage.ts`
> **Export**: `import * as StorageService from 'hydrooj';`
> **Access**: `ctx.storage` (instance, available after service startup)

`StorageService` is a namespace export containing two backend classes (`RemoteStorageService` for S3, `LocalStorageService` for filesystem) plus the `Config` schema and `encodeRFC5987ValueChars` utility. At runtime, `ctx.storage` returns whichever backend is configured.

Both backends share the same public API surface:

---

## Public Methods

### `put(target: string, file: string | Buffer | Readable, meta?: Record<string, string>): Promise<void>`

Uploads a file to the storage path. Accepts a file path, Buffer, or Readable stream. S3 backend uses multipart upload for files > 5MB. Local backend writes to disk. Paths are validated (no `..`, `//`, etc.).

### `get(target: string, path?: string): Promise<Readable | null>`

Retrieves a file. Returns a `Readable` stream. If `path` is provided, saves the file to that local path and returns `null`.

### `del(target: string | string[]): Promise<void>`

Deletes one or more files. Accepts a single path string or an array of paths. S3 backend uses batch `DeleteObjectsCommand` for multiple targets.

### `getMeta(target: string): Promise<{ size, lastModified, etag, metaData }>`

Returns file metadata: `size` (bytes), `lastModified` (Date), `etag` (string), and `metaData` (record). Local backend computes etag from Base64-encoded path.

### `signDownloadLink(target: string, filename?: string, noExpire?: boolean, useAlternativeEndpointFor?: 'user' | 'judge'): Promise<string>`

Generates a signed download URL. S3 backend uses pre-signed URLs (7-day max for Aliyun compat, 30min default). Local backend generates HMAC-signed paths via `/storage` endpoint. Supports alternative endpoint routing for user or judge access.

### `signUpload(target: string, size: number): Promise<{ url, fields }>`

Generates a pre-signed POST for direct browser upload (S3 only). Includes content-length-range conditions with ±50 byte tolerance. 10-minute expiry. Throws `Error('Not implemented')` on local backend.

### `isLinkValid(link: string): Promise<boolean>`

Validates a signed link's HMAC signature. Only meaningful on local backend (returns `false` on S3).

### `status(): Promise<{ type, status, error, ... }>`

Returns service health info: `type` (`'S3'` or `'Local'`), `status` (boolean), `error` (string), plus backend-specific fields (`bucket`, `dir`).

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `client` | `S3Client \| null` | S3 client instance (null for local backend) |
| `error` | `string` | Last error message, empty string if healthy |

---

## Exports (Namespace)

| Export | Type | Description |
|--------|------|-------------|
| `Config` | `Schema` | Storage configuration schema (validates `type`, `path`/`endPoint`, credentials, etc.) |
| `encodeRFC5987ValueChars` | `(str: string) => string` | Encodes filenames for `Content-Disposition` headers per RFC 5987 |
| `apply` | `(ctx, config) => Promise<void>` | Service lifecycle: instantiates backend, starts it, registers `/fs` proxy route, provides `ctx.storage` |

---

## Configuration

The `Config` schema validates:

| Field | Default | Description |
|-------|---------|-------------|
| `type` | — | `'file'` (local) or `'s3'` |
| `endPointForUser` | `'/fs/'` | URL prefix for user-facing file access |
| `endPointForJudge` | `'/fs/'` | URL prefix for judge-facing file access |

**Local (`type: 'file'`)**:

| Field | Default | Description |
|-------|---------|-------------|
| `path` | `/data/file/hydro` | Local storage directory |
| `secret` | `nanoid()` | HMAC secret for signed links |

**S3 (`type: 's3'`)**:

| Field | Default | Description |
|-------|---------|-------------|
| `endPoint` | — | S3 endpoint URL |
| `accessKey` | — | Access key ID |
| `secretKey` | — | Secret access key |
| `bucket` | `'hydro'` | Bucket name |
| `region` | `'us-east-1'` | Region |
| `pathStyle` | `true` | Use path-style addressing |

---

## Notes

- `ctx.storage` is provided at startup via `ctx.provide('storage', service)`.
- Both backends validate paths against traversal (`..`), double-slash (`//`), and trailing `/.`.
- The `apply` function registers a `/fs/` proxy route for direct file access.
- Alternative endpoints allow routing user/judge file traffic through different URLs (CDN, internal network, etc.).
