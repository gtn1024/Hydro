# MessageModel

Message model for sending, querying, and deleting user messages and system notifications.

> **Source**: `packages/hydrooj/src/model/message.ts`
> **Export**: `import { MessageModel } from 'hydrooj';`

`MessageModel` is a static-only class. All methods are called on the class itself (e.g. `MessageModel.send(...)`).

---

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `FLAG_UNREAD` | `1` | Message is unread |
| `FLAG_ALERT` | `2` | Message is an alert |
| `FLAG_RICHTEXT` | `4` | Message contains rich text |
| `FLAG_INFO` | `8` | Informational message |
| `FLAG_I18N` | `16` | Content is an i18n key |

Flags are bitmask values — combine with bitwise OR (e.g. `FLAG_INFO | FLAG_I18N`).

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `coll` | `Collection<MessageDoc>` | MongoDB `message` collection |

---

## Methods

### Sending

#### `send(from: number, to: number | number[], content: string, flag?: number): Promise<BaseMessage>`

Send a message from user `from` to one or more recipients. Defaults to `FLAG_UNREAD`. Broadcasts `user/message` event and increments `unreadMsg` count for recipients. Returns the message document (without `_id` if `to` is empty).

**@ArgMethod**

#### `sendInfo(to: number, content: string): Promise<void>`

Send a transient info/i18n notification to a single user. Combines `FLAG_INFO | FLAG_I18N`. Broadcasts via `user/message` but does **not** persist to the database.

#### `sendNotification(message: string, ...args: any[]): Promise<void[]>`

Send a translated notification to all users with `PRIV_VIEW_SYSTEM_NOTIFICATION`. The `message` is translated via `app.i18n` using each recipient's `viewLang`, with `args` passed to `format()`. Messages are sent with `FLAG_RICHTEXT`.

### Lookup

#### `get(_id: ObjectId): Promise<MessageDoc>`

Get a single message by its `_id`.

#### `getByUser(uid: number): Promise<MessageDoc[]>`

Get up to 1000 messages sent by or to the given user, sorted by `_id` descending (newest first).

**@ArgMethod**

#### `getMany(query: Filter<MessageDoc>, sort: any, page: number, limit: number): Promise<MessageDoc[]>`

Paginated message listing with custom filter and sort. Applies `skip((page-1)*limit)`.

#### `getMulti(uid: number): Cursor<MessageDoc>`

Get a MongoDB cursor for all messages sent by or to the given user. No sort or limit applied — caller controls iteration.

### Deletion

#### `del(_id: ObjectId): Promise<DeleteResult>`

Delete a single message by its `_id`.

### Statistics

#### `count(query?: Filter<MessageDoc>): Promise<number>`

Count messages matching the given filter. Defaults to all messages.

**@ArgMethod**

---

## Types

### `MessageDoc`

```typescript
interface MessageDoc {
    from: number;
    to: number | number[];
    content: string;
    flag: number;
}
```

---

## Indexes

| Index | Fields | Notes |
|-------|--------|-------|
| `to` | `{ to: 1, _id: -1 }` | Lookup messages by recipient |
| `from` | `{ from: 1, _id: -1 }` | Lookup messages by sender |

---

## Notes

- `send` both persists to MongoDB and broadcasts `user/message` in real-time.
- `sendInfo` is fire-and-forget — it broadcasts but does not write to the database.
- `sendNotification` is used for system-wide announcements (e.g. maintenance notices).
- `getByUser` caps results at 1000; use `getMulti` for unbounded cursor-based iteration.
