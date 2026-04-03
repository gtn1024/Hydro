# AutoComplete 组件

Source: `packages/ui-default/components/autocomplete/`

基于 DOM 的自动完成组件族，绑定到 `<input>` 元素并渲染 React 下拉选择器。所有子类继承自 `AutoComplete` 基类，通过 `DOMAttachedObject` 模式挂载到页面 DOM。

## 基类

### AutoComplete

Source: `packages/ui-default/components/autocomplete/index.tsx`

通用自动完成基类，将一个 `<input>` DOM 元素包装为带下拉建议列表的选择器。内部使用 `@hydrooj/components` 的 `AutoComplete` React 组件进行渲染。

```ts
class AutoComplete<Options extends Record<string, any> = object, Multi extends boolean = boolean> extends DOMAttachedObject
```

**构造参数：**
- `$dom` — 要绑定的 jQuery DOM 元素（通常是 `<input>`）
- `options` — 配置选项（见 `AutoCompleteOptions`）

**AutoCompleteOptions 接口：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `multi` | `boolean` | 是否允许多选 |
| `defaultItems` | `string` | 默认选中的项（逗号分隔） |
| `width` | `string` | 组件宽度 |
| `height` | `string` | 组件高度 |
| `classes` | `string` | 附加的 CSS 类名 |
| `listStyle` | `any` | 下拉列表样式 |
| `allowEmptyQuery` | `boolean` | 是否允许空查询触发搜索 |
| `freeSolo` | `boolean` | 是否允许自由输入（不在列表中的值） |
| `freeSoloConverter` | `any` | 自由输入值的转换函数 |
| `onChange` | `(value) => any` | 选中值变化时的回调 |
| `items` | `() => Promise<any[]>` | 异步获取候选项列表 |
| `render` | `() => string` | 自定义候选项渲染 |
| `text` | `() => string` | 自定义选中项文本 |
| `component` | `React.ComponentType<any>` | 自定义 React 组件（覆盖默认） |
| `props` | `Record<string, any>` | 传递给 React 组件的额外属性 |

**实例方法：**

| 方法 | 说明 |
|------|------|
| `clear(clearValue?: boolean)` | 清除选中值或仅关闭下拉列表 |
| `onChange(val)` | 设置值或注册变化监听器 |
| `attach()` | 挂载 React 组件到 DOM |
| `open()` | 打开下拉建议列表 |
| `close()` | 关闭下拉建议列表 |
| `value()` | 获取当前选中值（多选模式返回数组） |
| `detach()` | 卸载组件并清理 DOM |
| `focus()` | 聚焦输入框 |

## 子类组件

### AssignSelectAutoComplete

Source: `packages/ui-default/components/autocomplete/AssignSelectAutoComplete.tsx`

题目评测者/管理员分配选择器，默认多选模式。用于比赛或作业中将用户分配为评测者或管理员。

```ts
class AssignSelectAutoComplete<Multi extends boolean> extends AutoComplete
```

- `DOMAttachKey`: `ucwAssignSelectAutoCompleteInstance`
- 固定 `multi: true`，`value()` 返回逗号分隔的选中键字符串

### CustomSelectAutoComplete

Source: `packages/ui-default/components/autocomplete/CustomSelectAutoComplete.tsx`

自定义数据源的下拉选择器，调用方通过 `data` 选项直接提供候选项列表。

```ts
class CustomSelectAutoComplete<Multi extends boolean> extends AutoComplete<CustomSelectOptions>
```

- `DOMAttachKey`: `ucwCustomSelectAutoCompleteInstance`
- 额外选项 `data: any[]` — 静态候选项数据

### DomainSelectAutoComplete

Source: `packages/ui-default/components/autocomplete/DomainSelectAutoComplete.tsx`

域名（站点）选择器，用于在多个 Hydro 站点/域之间切换选择。

```ts
class DomainSelectAutoComplete<Multi extends boolean> extends AutoComplete
```

- `DOMAttachKey`: `ucwDomainSelectAutoCompleteInstance`
- 固定高度 `34px`

### ProblemSelectAutoComplete

Source: `packages/ui-default/components/autocomplete/ProblemSelectAutoComplete.tsx`

题目选择器，用于搜索和选择题库中的题目。

```ts
class ProblemSelectAutoComplete extends AutoComplete
```

- `DOMAttachKey`: `ucwProblemSelectAutoCompleteInstance`

### UserSelectAutoComplete

Source: `packages/ui-default/components/autocomplete/UserSelectAutoComplete.tsx`

用户选择器，用于搜索和选择系统用户。

```ts
class UserSelectAutoComplete<Multi extends boolean> extends AutoComplete
```

- `DOMAttachKey`: `ucwUserSelectAutoCompleteInstance`
- `value()` 在多选模式下返回 `number[]`（用户 ID 数组），单选模式返回字符串

### FileSelectAutoComplete

Source: `packages/ui-default/components/autocomplete/FileSelectAutoComplete.tsx`

文件选择器，从给定文件列表中选择文件。

```ts
class FileSelectAutoComplete<Multi extends boolean> extends AutoComplete<FileSelectOptions>
```

- `DOMAttachKey`: `ucwFileSelectAutoCompleteInstance`
- 额外选项 `data: { id: string; name: string }[]` — 文件列表

### LanguageSelectAutoComplete

Source: `packages/ui-default/components/autocomplete/LanguageSelectAutoComplete.tsx`

编程语言选择器，用于选择题目的提交语言。

```ts
class LanguageSelectAutoComplete<Multi extends boolean> extends AutoComplete<LanguageSelectOptions>
```

- `DOMAttachKey`: `ucwLanguageSelectAutoCompleteInstance`
- 额外选项 `withAuto: boolean` — 是否包含"自动"选项
