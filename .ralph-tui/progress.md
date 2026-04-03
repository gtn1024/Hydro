# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

* **AutoComplete 组件族模式**: 所有 AutoComplete 子类继承自 `AutoComplete` 基类（`DOMAttachedObject`），通过 `DOMAttachKey` 静态属性区分类型，构造函数中传入 `component` 和 `props` 覆盖默认渲染。

---

## 2026-04-03 - US-042
- Documented all AutoComplete components (AutoComplete base class + 7 subclasses)
- Created `docs/ui/components/autocomplete.md`
- **Learnings:**
  - The autocomplete directory has 8 classes (base + 7 subclasses), not just the 6 listed in AC. Also found `FileSelectAutoComplete` and `LanguageSelectAutoComplete`
  - All subclasses follow the same pattern: extend `AutoComplete`, set `DOMAttachKey`, pass a specific React component via `component` option
  - Source files exist at both top level and in `components/` subdirectory — top-level files are the DOMAttachedObject wrappers, `components/` contains the React components
---

