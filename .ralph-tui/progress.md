# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

---

## 2026-04-03 - US-020
- Documented SettingModel: 1 factory function (`Setting`), 5 registration functions (`PreferenceSetting`, `AccountSetting`, `DomainSetting`, `DomainUserSetting`, `SystemSetting`), 6 flag constants, 10 collection constants, `langs`, and `SettingType`
- Files changed: `docs/models/setting-model.md` (created)
- **Learnings:**
  - SettingModel is a registration-based module, not a data-access model — plugins call registration functions to declare settings, not to read/write values
  - All registration functions return a dispose callback (`() => void`) for clean plugin teardown
  - Registration functions accept both raw `_Setting[]` objects and schemastery `Schema` objects (auto-converted via internal `schemaToSettings()`)
  - `SETTINGS` and `SETTINGS_BY_KEY` are shared across preference + account settings only; domain/system/user-domain have their own separate `*_BY_KEY` maps

---

## 2026-04-03 - US-019
- Documented OplogModel: 4 exported members (`coll`, `add`, `get`, `log`)
- Files changed: `docs/models/oplog-model.md` (created)
- **Learnings:**
  - OplogModel is a plain module with exported functions, not a class — same pattern as OpcountModel and TrainingModel
  - `log()` is the primary entry point for request-context logging; `add()` is a lower-level variant for system/background use
  - `safeKeys()` is an internal helper (not exported) that strips sensitive fields like `password` and sanitizes MongoDB-unsafe key characters (`$`, `.`)
  - The model registers itself on `global.Hydro.model.oplog` at module load time

---

## 2026-04-03 - US-018
- Documented OpcountModel: 2 exported functions (`inc`, `apply`)
- Files changed: `docs/models/opcount-model.md` (created)
- **Learnings:**
  - OpcountModel is a plain module with exported functions, not a class — same pattern as TrainingModel
  - Rate limiting uses fixed-aligned time windows (not sliding), implemented via MongoDB TTL indexes + unique constraint on `{op, ident, expireAt}`
  - The unique constraint doubles as the rate-limit enforcement: when the counter hits max, the upsert fails with a duplicate key error which is caught and re-thrown as `OpcountExceededError`

---

## 2026-04-03 - US-017
- Documented TrainingModel: 17 exported functions across CRUD (7), Enrollment & Status (5), DAG Helpers (5)
- Files changed: `docs/models/training-model.md` (created)
- **Learnings:**
  - TrainingModel is a plain module with exported functions, not a class — unlike TaskModel which is a static class
  - All CRUD/status operations delegate to the shared `document` module with `TYPE_TRAINING = 40`
  - DAG helpers accept both `Set<number>` and `number[]` — they coerce internally
  - `get()` normalizes DAG `pids` strings to integers for backwards compat

---

## 2026-04-03 - US-016
- Documented TaskModel: 8 static methods + Consumer class with 4 methods
- Files changed: `docs/models/task-model.md` (created)
- **Learnings:**
  - TaskModel also exports a `Consumer` class used for polling-based task consumption — worth documenting alongside the model
  - `getFirst` is an atomic `findOneAndDelete` — important for understanding concurrent consumer safety
  - The `apply()` function handles cross-process event broadcasting via change streams, separate from the task queue itself

---

