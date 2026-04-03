# Ralph Progress Log

This file tracks progress across iterations. Agents update this file
after each iteration and it's included in prompts for context.

## Codebase Patterns (Study These First)

*Add reusable patterns discovered during development here.*

* EventMap 事件使用 `before-*` / 动作 成对模式：`before-add` 可拦截/修改，`add` 为事后通知。监听 `before-*` 可影响主流程，监听动作仅做副作用。
* `VoidReturn` = `Promise<any> | any`，即监听器可同步或异步；`void` 返回表示框架忽略返回值。
* `ctx.broadcast()` 内部触发 `bus/broadcast` 事件，由 PM2 或 MongoDB 总线实现跨进程传播。

---

## 2026-04-03 - US-025
- Documented all 64 EventMap events grouped by 14 domains with parameter signatures
- Added usage patterns for ctx.on(), ctx.emit(), ctx.parallel(), ctx.broadcast()
- Documented internal broadcast mechanism (PM2 vs MongoDB)
- **Files changed:** docs/event/event-bus.md (new)
- **Learnings:**
  - EventMap re-exported as `Events` from context.ts via `export { EventMap as Events }`
  - Events follow a consistent `domain/action` naming pattern
  - `before-*` hooks allow mutation, plain hooks are post-action notifications

---

