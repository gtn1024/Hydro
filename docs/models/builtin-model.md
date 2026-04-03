# BuiltinModel

Builtin constants, permission flags, privilege flags, judge status enums, and UI metadata re-exported from `@hydrooj/common` and extended by Hydro.

> **Source**: `packages/hydrooj/src/model/builtin.ts`
> **Export**: `import * as BuiltinModel from 'hydrooj/dist/model/builtin';` (barrel re-export; individual named imports also work)

---

## Re-exports from `@hydrooj/common`

These are re-exported via `export * from '@hydrooj/common/permission'` and `export * from '@hydrooj/common/status'`.

### PERM — Domain-level permission bitflags

Object mapping permission names to `bigint` values. Used as bitmasks on domain-user roles.

| Constant | Bit | Description |
|----------|-----|-------------|
| `PERM_NONE` | `0n` | No permissions |
| `PERM_VIEW` | `1n << 0` | View this domain |
| `PERM_EDIT_DOMAIN` | `1n << 1` | Edit domain settings |
| `PERM_MOD_BADGE` | `1n << 2` | Show MOD badge |
| `PERM_CREATE_PROBLEM` | `1n << 4` | Create problems |
| `PERM_EDIT_PROBLEM` | `1n << 5` | Edit any problems |
| `PERM_EDIT_PROBLEM_SELF` | `1n << 6` | Edit own problems |
| `PERM_VIEW_PROBLEM` | `1n << 7` | View problems |
| `PERM_VIEW_PROBLEM_HIDDEN` | `1n << 8` | View hidden problems |
| `PERM_SUBMIT_PROBLEM` | `1n << 9` | Submit problem solutions |
| `PERM_READ_PROBLEM_DATA` | `1n << 10` | Read problem test data |
| `PERM_READ_RECORD_CODE` | `1n << 12` | Read all record codes |
| `PERM_REJUDGE_PROBLEM` | `1n << 13` | Rejudge problems |
| `PERM_REJUDGE` | `1n << 14` | Rejudge records |
| `PERM_VIEW_PROBLEM_SOLUTION` | `1n << 15` | View problem solutions |
| `PERM_CREATE_PROBLEM_SOLUTION` | `1n << 16` | Create problem solutions |
| `PERM_VOTE_PROBLEM_SOLUTION` | `1n << 17` | Vote on problem solutions |
| `PERM_EDIT_PROBLEM_SOLUTION` | `1n << 18` | Edit any problem solutions |
| `PERM_EDIT_PROBLEM_SOLUTION_SELF` | `1n << 19` | Edit own problem solutions |
| `PERM_DELETE_PROBLEM_SOLUTION` | `1n << 20` | Delete any problem solutions |
| `PERM_DELETE_PROBLEM_SOLUTION_SELF` | `1n << 21` | Delete own problem solutions |
| `PERM_REPLY_PROBLEM_SOLUTION` | `1n << 22` | Reply to problem solutions |
| `PERM_EDIT_PROBLEM_SOLUTION_REPLY_SELF` | `1n << 24` | Edit own problem solution replies |
| `PERM_DELETE_PROBLEM_SOLUTION_REPLY` | `1n << 25` | Delete any problem solution replies |
| `PERM_DELETE_PROBLEM_SOLUTION_REPLY_SELF` | `1n << 26` | Delete own problem solution replies |
| `PERM_VIEW_DISCUSSION` | `1n << 27` | View discussions |
| `PERM_CREATE_DISCUSSION` | `1n << 28` | Create discussions |
| `PERM_HIGHLIGHT_DISCUSSION` | `1n << 29` | Highlight discussions |
| `PERM_EDIT_DISCUSSION` | `1n << 30` | Edit any discussions |
| `PERM_EDIT_DISCUSSION_SELF` | `1n << 31` | Edit own discussions |
| `PERM_DELETE_DISCUSSION` | `1n << 32` | Delete any discussions |
| `PERM_DELETE_DISCUSSION_SELF` | `1n << 33` | Delete own discussions |
| `PERM_REPLY_DISCUSSION` | `1n << 34` | Reply to discussions |
| `PERM_EDIT_DISCUSSION_REPLY_SELF` | `1n << 36` | Edit own discussion replies |
| `PERM_DELETE_DISCUSSION_REPLY` | `1n << 38` | Delete any discussion replies |
| `PERM_DELETE_DISCUSSION_REPLY_SELF` | `1n << 39` | Delete own discussion replies |
| `PERM_DELETE_DISCUSSION_REPLY_SELF_DISCUSSION` | `1n << 40` | Delete replies in own discussion |
| `PERM_VIEW_CONTEST` | `1n << 41` | View contests |
| `PERM_VIEW_CONTEST_SCOREBOARD` | `1n << 42` | View contest scoreboard |
| `PERM_VIEW_CONTEST_HIDDEN_SCOREBOARD` | `1n << 43` | View hidden contest scoreboard |
| `PERM_CREATE_CONTEST` | `1n << 44` | Create contests |
| `PERM_ATTEND_CONTEST` | `1n << 45` | Attend contests |
| `PERM_VIEW_TRAINING` | `1n << 46` | View training plans |
| `PERM_CREATE_TRAINING` | `1n << 47` | Create training plans |
| `PERM_EDIT_TRAINING` | `1n << 48` | Edit any training plans |
| `PERM_EDIT_TRAINING_SELF` | `1n << 49` | Edit own training plans |
| `PERM_EDIT_CONTEST` | `1n << 50` | Edit any contests |
| `PERM_EDIT_CONTEST_SELF` | `1n << 51` | Edit own contests |
| `PERM_VIEW_HOMEWORK` | `1n << 52` | View homework |
| `PERM_VIEW_HOMEWORK_SCOREBOARD` | `1n << 53` | View homework scoreboard |
| `PERM_VIEW_HOMEWORK_HIDDEN_SCOREBOARD` | `1n << 54` | View hidden homework scoreboard |
| `PERM_CREATE_HOMEWORK` | `1n << 55` | Create homework |
| `PERM_ATTEND_HOMEWORK` | `1n << 56` | Claim homework |
| `PERM_EDIT_HOMEWORK` | `1n << 57` | Edit any homework |
| `PERM_EDIT_HOMEWORK_SELF` | `1n << 58` | Edit own homework |
| `PERM_VIEW_RANKING` | `1n << 59` | View ranking |
| `PERM_NEVER` | `1n << 60` | Placeholder: never granted |
| `PERM_PIN_DISCUSSION` | `1n << 61` | Pin discussions |
| `PERM_ADD_REACTION` | `1n << 62` | React to discussions |
| `PERM_PIN_TRAINING` | `1n << 63` | Pin training plans |
| `PERM_LOCK_DISCUSSION` | `1n << 64` | Lock discussions |
| `PERM_VIEW_PROBLEM_SOLUTION_ACCEPT` | `1n << 65` | View solutions after accept |
| `PERM_READ_RECORD_CODE_ACCEPT` | `1n << 66` | Read record codes after accept |
| `PERM_VIEW_USER_PRIVATE_INFO` | `1n << 67` | View domain user private info |
| `PERM_VIEW_HIDDEN_CONTEST` | `1n << 68` | View all contests (including hidden) |
| `PERM_VIEW_HIDDEN_HOMEWORK` | `1n << 69` | View all homework (including hidden) |
| `PERM_VIEW_RECORD` | `1n << 70` | View other users' records |

**Composite roles** (pre-computed combinations):

| Constant | Value | Description |
|----------|-------|-------------|
| `PERM_ALL` | `-1n` | All permissions (every bit set) |
| `PERM_BASIC` | union of view perms | Basic view-only permissions for guests |
| `PERM_DEFAULT` | union of basic + create/self-edit | Default permissions for registered users |
| `PERM_ADMIN` | `-1n` | Alias for `PERM_ALL` |

### PRIV — System-level privilege bitflags

Object mapping privilege names to `number` (bitshift) values. Used for site-wide user privileges.

| Constant | Bit | Description |
|----------|-----|-------------|
| `PRIV_NONE` | `0` | No privileges |
| `PRIV_EDIT_SYSTEM` | `1 << 0` | Edit system settings (renamed from `PRIV_SET_PRIV`) |
| `PRIV_SET_PERM` | `1 << 1` | Set domain permissions |
| `PRIV_USER_PROFILE` | `1 << 2` | Edit user profile |
| `PRIV_REGISTER_USER` | `1 << 3` | Register new users |
| `PRIV_READ_PROBLEM_DATA` | `1 << 4` | Read problem test data |
| `PRIV_READ_RECORD_CODE` | `1 << 7` | Read all record codes |
| `PRIV_VIEW_HIDDEN_RECORD` | `1 << 8` | View hidden records |
| `PRIV_JUDGE` | `1 << 9` | Act as a judge node |
| `PRIV_CREATE_DOMAIN` | `1 << 10` | Create new domains |
| `PRIV_VIEW_ALL_DOMAIN` | `1 << 11` | View all domains |
| `PRIV_MANAGE_ALL_DOMAIN` | `1 << 12` | Manage all domains |
| `PRIV_REJUDGE` | `1 << 13` | Rejudge records site-wide |
| `PRIV_VIEW_USER_SECRET` | `1 << 14` | View user secrets |
| `PRIV_VIEW_JUDGE_STATISTICS` | `1 << 15` | View judge statistics |
| `PRIV_CREATE_FILE` | `1 << 16` | Create files in storage |
| `PRIV_UNLIMITED_QUOTA` | `1 << 17` | Bypass storage quota limits |
| `PRIV_DELETE_FILE` | `1 << 18` | Delete files from storage |
| `PRIV_NEVER` | `1 << 20` | Placeholder: never granted |
| `PRIV_UNLIMITED_ACCESS` | `1 << 22` | Bypass all access checks |
| `PRIV_VIEW_SYSTEM_NOTIFICATION` | `1 << 23` | View system notifications |
| `PRIV_SEND_MESSAGE` | `1 << 24` | Send messages |
| `PRIV_MOD_BADGE` | `1 << 25` | Show MOD badge globally |

**Composite roles**:

| Constant | Value | Description |
|----------|-------|-------------|
| `PRIV_ALL` | `-1` | All privileges |
| `PRIV_DEFAULT` | `USER_PROFILE + CREATE_FILE + SEND_MESSAGE` | Default privileges for registered users |

### STATUS — Judge status enum

Enum of judge verdict status codes.

| Value | Name | Description |
|-------|------|-------------|
| `0` | `STATUS_WAITING` | Waiting to be judged |
| `1` | `STATUS_ACCEPTED` | Solution accepted |
| `2` | `STATUS_WRONG_ANSWER` | Wrong answer |
| `3` | `STATUS_TIME_LIMIT_EXCEEDED` | Time limit exceeded |
| `4` | `STATUS_MEMORY_LIMIT_EXCEEDED` | Memory limit exceeded |
| `5` | `STATUS_OUTPUT_LIMIT_EXCEEDED` | Output limit exceeded |
| `6` | `STATUS_RUNTIME_ERROR` | Runtime error |
| `7` | `STATUS_COMPILE_ERROR` | Compile error |
| `8` | `STATUS_SYSTEM_ERROR` | System error |
| `9` | `STATUS_CANCELED` | Submission cancelled |
| `10` | `STATUS_ETC` | Unknown error |
| `11` | `STATUS_HACKED` | Solution hacked |
| `20` | `STATUS_JUDGING` | Currently judging |
| `21` | `STATUS_COMPILING` | Currently compiling |
| `22` | `STATUS_FETCHED` | Fetched by judge |
| `30` | `STATUS_IGNORED` | Submission ignored |
| `31` | `STATUS_FORMAT_ERROR` | Format error |
| `32` | `STATUS_HACK_SUCCESSFUL` | Hack successful |
| `33` | `STATUS_HACK_UNSUCCESSFUL` | Hack unsuccessful |

### Status lookup maps

| Export | Type | Description |
|--------|------|-------------|
| `STATUS_TEXTS` | `Record<STATUS, string>` | Full display names per status code (e.g. `"Wrong Answer"`) |
| `STATUS_SHORT_TEXTS` | `Partial<Record<STATUS, string>>` | Abbreviations per status code (e.g. `"WA"`, `"TLE"`) |
| `STATUS_CODES` | `Record<STATUS, string>` | Semantic categories: `"pending"`, `"pass"`, `"fail"`, `"progress"`, `"ignored"` |
| `NORMAL_STATUS` | `STATUS[]` | Final verdict statuses (AC through CE) — excludes in-progress and special statuses |

### User gender constants

| Export | Type | Description |
|--------|------|-------------|
| `USER_GENDER_MALE` | `0` | Male gender constant |
| `USER_GENDER_FEMALE` | `1` | Female gender constant |
| `USER_GENDER_OTHER` | `2` | Other gender constant |
| `USER_GENDERS` | `number[]` | Array `[0, 1, 2]` of all gender values |
| `USER_GENDER_RANGE` | `Record<number, string>` | Display labels: `"Boy ♂"`, `"Girl ♀"`, `"Other"` |
| `USER_GENDER_ICONS` | `Record<number, string>` | Icon symbols: `"♂"`, `"♀"`, `"?"` |

### Utility function

#### `getScoreColor(score: number | string): string`

Returns a hex color string (`#rrggbb`) for a numeric score (0–100), mapping to a red-to-green gradient in 10-point bands. Returns `#000000` for non-finite values.

---

## Hydro-extended exports

These are defined in `builtin.ts` itself, building on top of the `@hydrooj/common` primitives.

### Permission(family, key, desc)

Factory function that creates a permission descriptor object `{ family, key, desc }`. Used internally to build the `PERMS` array.

### PERMS

Array of all domain-level permission descriptors, each with `{ family, key, desc }`. Grouped by family:

| Family | Permissions |
|--------|------------|
| `perm_general` | `PERM_VIEW`, `PERM_VIEW_USER_PRIVATE_INFO`, `PERM_EDIT_DOMAIN`, `PERM_MOD_BADGE` |
| `perm_problem` | `PERM_CREATE_PROBLEM`, `PERM_EDIT_PROBLEM`, `PERM_EDIT_PROBLEM_SELF`, `PERM_VIEW_PROBLEM`, `PERM_VIEW_PROBLEM_HIDDEN`, `PERM_SUBMIT_PROBLEM`, `PERM_READ_PROBLEM_DATA` |
| `perm_record` | `PERM_VIEW_RECORD`, `PERM_READ_RECORD_CODE`, `PERM_READ_RECORD_CODE_ACCEPT`, `PERM_REJUDGE_PROBLEM`, `PERM_REJUDGE` |
| `perm_problem_solution` | 13 permissions for solution CRUD, voting, and replies |
| `perm_discussion` | 16 permissions for discussion CRUD, pinning, highlighting, locking, reactions, and replies |
| `perm_contest` | `PERM_VIEW_CONTEST`, `PERM_VIEW_CONTEST_SCOREBOARD`, `PERM_VIEW_CONTEST_HIDDEN_SCOREBOARD`, `PERM_CREATE_CONTEST`, `PERM_ATTEND_CONTEST`, `PERM_EDIT_CONTEST`, `PERM_EDIT_CONTEST_SELF`, `PERM_VIEW_HIDDEN_CONTEST` |
| `perm_homework` | `PERM_VIEW_HOMEWORK`, `PERM_VIEW_HOMEWORK_SCOREBOARD`, `PERM_VIEW_HOMEWORK_HIDDEN_SCOREBOARD`, `PERM_CREATE_HOMEWORK`, `PERM_ATTEND_HOMEWORK`, `PERM_EDIT_HOMEWORK`, `PERM_EDIT_HOMEWORK_SELF`, `PERM_VIEW_HIDDEN_HOMEWORK` |
| `perm_training` | `PERM_VIEW_TRAINING`, `PERM_CREATE_TRAINING`, `PERM_EDIT_TRAINING`, `PERM_PIN_TRAINING`, `PERM_EDIT_TRAINING_SELF` |
| `perm_ranking` | `PERM_VIEW_RANKING` |

### PERMS\_BY\_FAMILY

`Record<string, PermissionDescriptor[]>` — auto-generated index of `PERMS` grouped by `family`. Useful for rendering permission settings UI by category.

### LEVELS

`number[]` — `[100, 90, 70, 55, 40, 30, 20, 10, 5, 2, 1]` — percentage thresholds for the 10 user level tiers. Users whose rank percentile is below a threshold get that level.

### BUILTIN\_ROLES

Pre-defined role permission sets:

| Role | Value | Description |
|------|-------|-------------|
| `guest` | `PERM.PERM_BASIC` | Guest (view-only) permissions |
| `default` | `PERM.PERM_DEFAULT` | Registered user default permissions |
| `root` | `PERM.PERM_ALL` | Full administrator permissions |

### DEFAULT\_NODES

Default discussion node categories and their sub-nodes (Chinese labels). Used to populate the initial discussion board structure for new domains.

### CATEGORIES

Problem category taxonomy — a `Record<string, string[]>` mapping top-level algorithm categories to sub-category tags. Used for problem classification.

---

## Notes

- `PERM` flags are `bigint` (domain-scoped); `PRIV` flags are `number` (system-scoped). Both use bitwise OR (`|`) to combine and bitwise AND (`&`) to check.
- `PERM_VIEW_DISPLAYNAME` is deprecated — use `PERM_VIEW_USER_PRIVATE_INFO` instead (same bit position `1n << 67`).
- `PRIV_EDIT_SYSTEM` was renamed from `PRIV_SET_PRIV`; `PRIV_JUDGE` was renamed from an older name.
- The module registers itself on `global.Hydro.model.builtin` at load time.
