# 模板 & 国际化工具

> 源码: `packages/ui-default/utils/base.ts`

前端模板渲染与国际化工具集。提供 HTML 模板构建、字符串插值和语言翻译功能。

---

## tpl()

模板标签函数，支持两种调用方式：

**标签模板字面量** — 自动对插值进行 HTML 转义，返回拼接后的 HTML 字符串：

```ts
function tpl(pieces: TemplateStringsArray, ...substitutions: Substitution[]): string;
```

- 插值类型为 `string | number | { templateRaw: true, html: string }`
- 普通插值通过 `_.escape()` 转义；使用 `rawHtml()` 包裹可跳过转义

**React 节点渲染** — 将 React 元素渲染为 HTML 字符串（默认）或挂载到 DOM 节点：

```ts
function tpl(node: React.ReactNode, reactive?: true): HTMLDivElement;
function tpl(node: React.ReactNode, reactive?: false): string;
```

- `reactive = false`（默认）：调用 `ReactDOMServer.renderToStaticMarkup()` 返回 HTML 字符串
- `reactive = true`：调用 `ReactDOM.createRoot()` 挂载到新 `<div>` 并返回该 DOM 节点

---

## tpl.typoMsg()

`tpl` 上的静态方法，生成 Hydro `typo` 样式容器包裹的 HTML 段落。

```ts
tpl.typoMsg(msg: string, raw?: boolean): string;
```

- `raw = true`：直接将 `msg` 包裹在 `<div class="typo"><p>...</p></div>` 中，不做转义
- `raw = false`（默认）：按换行符拆分，每行用 `<p>` 包裹并对内容做 `_.escape()` 转义

---

## rawHtml()

创建一个跳过 HTML 转义的插值对象，供 `tpl()` 标签模板使用。

```ts
function rawHtml(html: string): { templateRaw: true; html: string };
```

- 返回对象被 `tpl()` 识别后直接插入，不经过 `_.escape()` 处理

---

## substitute()

简单的字符串模板插值，将 `{key}` 占位符替换为对象中对应的值。

```ts
function substitute(str: string, obj: any): string;
```

- 匹配 `{key}` 模式（不支持嵌套花括号）
- 值不为 `undefined`/`null` 时调用 `.toString()` 替换；否则保留原始占位符

---

## i18n()

国际化翻译函数，从 `window.LOCALES` 查找翻译文本并插值。

```ts
function i18n(str: string, ...params: any[]): string;
```

- 通过 `window.LOCALES[str]` 查找翻译；未找到时回退到原始字符串
- 找到翻译后调用 `substitute()` 将剩余参数替换 `{0}`, `{1}` 等占位符
- 传入空值（`null`/`undefined`/`''`）时返回空字符串
