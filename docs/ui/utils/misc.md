# DOM & 异步 & 其他工具函数

> 源码: `packages/ui-default/utils/base.ts`, `packages/ui-default/utils/index.ts`

前端 DOM 操作、异步控制、流处理及其他零散工具集。

---

## zIndexManager

全局 z-index 管理器，用于为弹窗等浮层元素分配递增的 z-index 值。

```ts
const zIndexManager: {
  getCurrent(): number;  // 获取当前 z-index（初始值 1000）
  getNext(): number;     // 递增并返回下一个 z-index
};
```

---

## emulateAnchorClick()

模拟锚点点击行为，根据修饰键决定在当前窗口跳转还是新窗口打开。

```ts
function emulateAnchorClick(ev: KeyboardEvent, targetUrl: string, alwaysOpenInNewWindow?: boolean): void;
```

- 检测 `ctrlKey` / `shiftKey` / `metaKey` 修饰键，按下时调用 `window.open()` 在新窗口打开
- `alwaysOpenInNewWindow = true` 时始终在新窗口打开
- 否则在当前窗口通过 `window.location.href` 跳转

---

## addSpeculationRules()

向页面注入 [Speculation Rules](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API)，用于浏览器预取/预渲染。

```ts
function addSpeculationRules(rules: object): void;
```

- 先检测 `HTMLScriptElement.supports('speculationrules')` 是否可用
- 可用时创建 `<script type="speculationrules">` 并将 `rules` 序列化为 JSON 写入

---

## getTheme()

获取当前用户主题模式。

```ts
function getTheme(): 'dark' | 'light';
```

- 读取 `UserContext.theme`，仅在值为 `'light'` 或 `'dark'` 时返回，否则回退为 `'light'`

---

## delay()

简单的 Promise 延时工具，等待指定毫秒数后 resolve。

```ts
function delay(ms: number): Promise<void>;
```

---

## withTransitionCallback()

使用 [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) 包裹回调函数，实现页面过渡动画。

```ts
async function withTransitionCallback(callback: () => Promise<void> | void): Promise<void>;
```

- 浏览器不支持或页面不可见时（`visibilityState === 'hidden'`）直接执行回调，跳过过渡动画
- 连续调用时会 `skipTransition()` 跳过前一个未完成的过渡
- 等待 `transition.finished` 完成后清除内部引用

---

## setTemporaryViewTransitionNames()

为指定元素临时设置 `view-transition-name` CSS 属性，在过渡完成后自动清除。

```ts
async function setTemporaryViewTransitionNames(
  entries: [HTMLElement, string][],
  vtPromise: Promise<void>,
): Promise<void>;
```

- `entries` 为 `[元素, 过渡名称]` 二元组数组
- 设置名称后等待 `vtPromise` 完成，再将所有元素的 `viewTransitionName` 恢复为空字符串

---

## secureRandomString()

使用浏览器 `crypto.getRandomValues()` 生成密码学安全的随机字符串。

```ts
function secureRandomString(digit?: number, dict?: string): string;
```

- `digit`：生成字符数，默认 `32`
- `dict`：可选字符集，默认 `a-zA-Z0-9`
- 不支持 `crypto.getRandomValues` 时抛出错误

---

## mongoId()

解析 MongoDB ObjectId 字符串，提取其中的时间戳、机器 ID、进程 ID 和序列号。

```ts
function mongoId(idstring: string): {
  timestamp: number;
  machineid: number;
  pid: number;
  sequence: number;
};
```

- 将 24 位十六进制字符串拆分为 4 段并解析为十进制整数

---

## createZipStream

ZIP 流构造器，指向 `window.ZIP`（由 `streamsaver` 的 `zip-stream` polyfill 提供）。

```ts
const createZipStream: any; // window.ZIP
```

---

## createZipBlob()

基于 `createZipStream` 创建 ZIP Blob，将流式输出转换为完整的 Blob 对象。

```ts
function createZipBlob(underlyingSource: any): Promise<Blob>;
```

- 内部通过 `new Response(createZipStream(source)).blob()` 实现

---

## pipeStream()

将可读流连接到可写流，支持中止控制。

```ts
async function pipeStream(read: ReadableStream, write: WritableStream, abort?: { abort: Function }): Promise<void>;
```

- 浏览器原生支持 `WritableStream` 且 `read.pipeTo` 可用时，使用 `pipeTo()` + `AbortController`
- 否则回退到手动 `reader/writer` 循环逐块读写
- `abort` 对象的 `abort` 方法会被绑定到对应的中止控制器上

---

## base64

Base64 编解码工具对象。

```ts
const base64: {
  encode(input: string): string;
  decode(input: string): string;
};
```

- `encode()`：先进行 UTF-8 编码，再转为 Base64 字符串
- `decode()`：先去除非法字符，解码 Base64 后再进行 UTF-8 解码
- 内部使用 `_utf8Encode` / `_utf8Decode` 处理多字节字符

---

## pjax

PJAX (PushState + AJAX) 页面导航模块，实现无刷新页面切换。

```ts
const pjax: {
  request(opt: string | { url: string; method?: string; push?: boolean; ... }): Promise<void>;
};
```

- `pjax.request()` — 发起 PJAX 请求：
  - 向 URL 追加 `?pjax=1` 查询参数
  - 服务端返回 `{ fragments: [{ html }] }` 格式的响应
  - 通过 `data-fragment-id` 属性匹配并替换页面中的 DOM 片段
  - 自动管理 `history.pushState` / `replaceState` 和 `popstate` 事件
  - 使用 `withTransitionCallback` 包裹 DOM 替换操作以支持过渡动画
  - 替换前触发 `vjContentRemove` 事件，替换后触发 `vjContentNew` 事件
  - 使用 `NProgress` 显示顶部加载进度条
  - 连续请求会自动中止前一个未完成的 XHR

---

## mediaQuery

响应式媒体查询工具，提供视口宽度判断。

```ts
namespace mediaQuery {
  function isAbove(width: number): boolean;  // 视口宽度 >= width
  function isBelow(width: number): boolean;  // 视口宽度 <= width
}
```

- 优先使用 `window.matchMedia` API，不支持时回退到 `window.innerWidth` 比较

---

## loadReactRedux()

异步加载 React + Redux 全家桶，返回创建好的 Redux store 和相关依赖。

```ts
async function loadReactRedux<S, A extends Action = UnknownAction>(
  storeReducer: Reducer<S, A>,
): Promise<{
  React: typeof React;
  createRoot: typeof createRoot;
  Provider: React.ComponentType<{ store: Store<S, A> }>;
  store: Store<S, A>;
}>;
```

- 动态导入 `react-redux`、`redux`、`redux-thunk`、`redux-promise-middleware`（并行加载）
- 开发环境下额外加载 `redux-logger`（折叠模式 + 显示耗时）
- 使用 `applyMiddleware(thunk, promise)` 创建 store
- 返回 `React`、`createRoot`、`Provider` 和已创建的 `store`
