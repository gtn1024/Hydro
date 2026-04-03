# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

---

## 2026-04-03 - US-016
- Documented TaskModel: 8 static methods + Consumer class with 4 methods
- Files changed: `docs/models/task-model.md` (created)
- **Learnings:**
  - TaskModel also exports a `Consumer` class used for polling-based task consumption — worth documenting alongside the model
  - `getFirst` is an atomic `findOneAndDelete` — important for understanding concurrent consumer safety
  - The `apply()` function handles cross-process event broadcasting via change streams, separate from the task queue itself

---

