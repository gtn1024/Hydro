# EventMap (事件总线)

Hydro 插件系统的事件总线。所有可监听事件定义在 `EventMap` 接口中，通过 `cordis` 框架的事件机制分发。

> **Source**: `packages/hydrooj/src/service/bus.ts`
>
> ```ts
> import { Events } from 'hydrooj'; // re-exported as Events
> import type { EventMap } from 'hydrooj'; // original type name
> ```

---

## 使用模式

### ctx.on() — 订阅事件

注册事件监听器，返回一个 `Disposable` 函数，调用即可取消订阅。

```ts
const dispose = ctx.on('problem/add', (doc, docId) => {
    console.log('New problem added:', docId);
});
// 取消订阅
dispose();
```

### ctx.emit() — 同步触发

同步触发事件，所有监听器按注册顺序执行。

```ts
ctx.emit('record/change', rdoc, $set, $push, body);
```

### ctx.parallel() — 并发触发

触发事件，所有监听器并发执行，返回 `Promise` 在全部完成后 resolve。

```ts
await ctx.parallel('app/ready');
```

### ctx.broadcast() — 跨进程广播

跨集群广播事件（PM2 或 MongoDB 总线）。每个节点收到后以 `parallel` 方式执行。

```ts
ctx.broadcast('record/judge', rdoc, updated, pdoc, updater);
```

---

## App Lifecycle

| Event | Signature | Description |
|-------|-----------|-------------|
| `app/listen` | `() => void` | HTTP 服务器开始监听端口时触发。 |
| `app/started` | `() => void` | 应用启动完成时触发。 |
| `app/ready` | `() => VoidReturn` | 所有插件加载完毕、应用就绪时触发。用于异步初始化。 |
| `app/exit` | `() => VoidReturn` | 应用即将关闭时触发。用于清理资源。 |
| `app/before-reload` | `(entries: Set<string>) => VoidReturn` | 热重载发生前触发，`entries` 为即将重载的插件路径集合。 |
| `app/reload` | `(entries: Set<string>) => VoidReturn` | 热重载完成后触发。 |

## File Watch

| Event | Signature | Description |
|-------|-----------|-------------|
| `app/watch/change` | `(path: string) => VoidReturn` | 监视的文件内容发生变更时触发。 |
| `app/watch/unlink` | `(path: string) => VoidReturn` | 监视的文件被删除时触发。 |

## Database

| Event | Signature | Description |
|-------|-----------|-------------|
| `database/connect` | `(db: Db) => void` | 数据库连接建立后触发，传入 `Db` 实例。 |
| `database/config` | `() => VoidReturn` | 数据库配置加载时触发。 |

## System

| Event | Signature | Description |
|-------|-----------|-------------|
| `system/setting` | `(args: Record<string, any>) => VoidReturn` | 系统设置变更时触发。 |
| `system/setting-loaded` | `() => VoidReturn` | 系统设置加载完毕时触发。 |
| `bus/broadcast` | `(event: keyof EventMap, payload: any, trace?: string) => VoidReturn` | 跨进程广播消息到达时触发。一般不直接监听，由 `ctx.broadcast()` 内部使用。 |
| `monitor/update` | `(type: 'server' \| 'judge', $set: any) => VoidReturn` | 监控数据更新时触发。 |
| `monitor/collect` | `(info: any) => VoidReturn` | 收集监控信息时触发。 |
| `api/update` | `() => void` | API 路由更新时触发。 |

## Scheduled Task

| Event | Signature | Description |
|-------|-----------|-------------|
| `task/daily` | `() => void` | 每日定时任务触发。 |
| `task/daily/finish` | `(pref: Record<string, number>) => void` | 每日任务完成后触发，传入执行偏好统计。 |

## Subscription (WebSocket)

| Event | Signature | Description |
|-------|-----------|-------------|
| `subscription/init` | `(h: ConnectionHandler<Context>, privileged: boolean) => VoidReturn` | WebSocket 订阅初始化时触发。 |
| `subscription/subscribe` | `(channel: string, user: User, metadata: Record<string, string>) => VoidReturn` | 用户订阅某频道时触发。 |
| `subscription/enable` | `(channel: string, h: ConnectionHandler<Context>, privileged: boolean, onDispose: (disposable: () => void) => void) => VoidReturn` | 订阅频道激活时触发；通过 `onDispose` 注册清理回调。 |

## User

| Event | Signature | Description |
|-------|-----------|-------------|
| `user/message` | `(uid: number[], mdoc: Omit<MessageDoc, 'to'>) => void` | 用户收到消息时触发。 |
| `user/get` | `(udoc: User) => void` | 用户信息被查询时触发。 |
| `user/delcache` | `(content: string \| true) => void` | 用户缓存失效时触发。 |
| `user/import/parse` | `(payload: any) => VoidReturn` | 用户导入解析阶段触发。 |
| `user/import/create` | `(uid: number, udoc: any) => VoidReturn` | 用户导入创建阶段触发。 |

## Domain

| Event | Signature | Description |
|-------|-----------|-------------|
| `domain/create` | `(ddoc: DomainDoc) => VoidReturn` | 域创建后触发。 |
| `domain/before-get` | `(query: Filter<DomainDoc>) => VoidReturn` | 域查询前触发，可修改查询条件。 |
| `domain/get` | `(ddoc: DomainDoc) => VoidReturn` | 域查询后触发。 |
| `domain/before-update` | `(domainId: string, $set: Partial<DomainDoc>) => VoidReturn` | 域更新前触发，可拦截或修改更新内容。 |
| `domain/update` | `(domainId: string, $set: Partial<DomainDoc>, ddoc: DomainDoc) => VoidReturn` | 域更新后触发。 |
| `domain/delete` | `(domainId: string) => VoidReturn` | 域删除后触发。 |
| `domain/delete-cache` | `(domainId: string) => VoidReturn` | 域缓存失效时触发。 |

## Document

| Event | Signature | Description |
|-------|-----------|-------------|
| `document/add` | `(doc: any) => VoidReturn` | 文档创建后触发。 |
| `document/set` | `<T extends keyof DocType>(domainId: string, docType: T, docId: DocType[T], $set: any, $unset: OnlyFieldsOfType<DocType[T], any, true \| '' \| 1>) => VoidReturn` | 文档更新时触发。泛型参数 `T` 对应文档类型键。 |

## Discussion

| Event | Signature | Description |
|-------|-----------|-------------|
| `discussion/before-add` | `(payload: Partial<DiscussionDoc>) => VoidReturn` | 讨论创建前触发，可修改内容。 |
| `discussion/add` | `(payload: Partial<DiscussionDoc>) => VoidReturn` | 讨论创建后触发。 |

## Problem

| Event | Signature | Description |
|-------|-----------|-------------|
| `problem/before-add` | `(domainId: string, content: string, owner: number, docId: number, doc: Partial<ProblemDoc>) => VoidReturn` | 题目创建前触发。 |
| `problem/add` | `(doc: Partial<ProblemDoc>, docId: number) => VoidReturn` | 题目创建后触发。 |
| `problem/before-edit` | `(doc: Partial<ProblemDoc>, $unset: OnlyFieldsOfType<ProblemDoc, any, true \| '' \| 1>) => VoidReturn` | 题目编辑前触发。 |
| `problem/edit` | `(doc: ProblemDoc) => VoidReturn` | 题目编辑后触发。 |
| `problem/before-del` | `(domainId: string, docId: number) => VoidReturn` | 题目删除前触发。 |
| `problem/list` | `(query: Filter<ProblemDoc>, handler: any, sort?: string[]) => VoidReturn` | 题目列表查询时触发。 |
| `problem/get` | `(doc: ProblemDoc, handler: any) => VoidReturn` | 题目详情查询后触发。 |
| `problem/delete` | `(domainId: string, docId: number) => VoidReturn` | 题目删除后触发。 |
| `problem/addTestdata` | `(domainId: string, docId: number, name: string, payload: Omit<FileInfo, '_id'>) => VoidReturn` | 测试数据文件添加后触发。 |
| `problem/renameTestdata` | `(domainId: string, docId: number, name: string, newName: string) => VoidReturn` | 测试数据文件重命名后触发。 |
| `problem/delTestdata` | `(domainId: string, docId: number, name: string[]) => VoidReturn` | 测试数据文件删除后触发。 |
| `problem/addAdditionalFile` | `(domainId: string, docId: number, name: string, payload: Omit<FileInfo, '_id'>) => VoidReturn` | 附加文件添加后触发。 |
| `problem/renameAdditionalFile` | `(domainId: string, docId: number, name: string, newName: string) => VoidReturn` | 附加文件重命名后触发。 |
| `problem/delAdditionalFile` | `(domainId: string, docId: number, name: string[]) => VoidReturn` | 附加文件删除后触发。 |

## Contest

| Event | Signature | Description |
|-------|-----------|-------------|
| `contest/before-add` | `(payload: Partial<Tdoc>) => VoidReturn` | 比赛创建前触发。 |
| `contest/add` | `(payload: Partial<Tdoc>, id: ObjectId) => VoidReturn` | 比赛创建后触发。 |
| `contest/before-edit` | `(tdoc: Tdoc, $set: Partial<Tdoc>) => VoidReturn` | 比赛编辑前触发。 |
| `contest/edit` | `(payload: Tdoc) => VoidReturn` | 比赛编辑后触发。 |
| `contest/list` | `(query: Filter<Tdoc>, handler: any) => VoidReturn` | 比赛列表查询时触发。 |
| `contest/scoreboard` | `(tdoc: Tdoc, rows: ScoreboardRow[], udict: BaseUserDict, pdict: ProblemDict) => VoidReturn` | 比赛排行榜计算时触发，可修改排名结果。 |
| `contest/balloon` | `(domainId: string, tid: ObjectId, bdoc: ContestBalloonDoc) => VoidReturn` | 比赛气球（AC 提示）事件触发。 |
| `contest/del` | `(domainId: string, tid: ObjectId) => VoidReturn` | 比赛删除后触发。 |

## Training

| Event | Signature | Description |
|-------|-----------|-------------|
| `training/list` | `(query: Filter<TrainingDoc>, handler: any) => VoidReturn` | 训练计划列表查询时触发。 |
| `training/get` | `(tdoc: TrainingDoc, handler: any) => VoidReturn` | 训练计划详情查询后触发。 |

## Record

| Event | Signature | Description |
|-------|-----------|-------------|
| `record/change` | `(rdoc: RecordDoc, $set?: any, $push?: any, body?: any) => void` | 评测记录状态变更时同步触发。 |
| `record/judge` | `(rdoc: RecordDoc, updated: boolean, pdoc?: ProblemDoc, updater?: any) => VoidReturn` | 评测记录进入判题阶段时并发触发。 |

## OpLog

| Event | Signature | Description |
|-------|-----------|-------------|
| `oplog/log` | `(type: string, handler: Handler<Context> \| ConnectionHandler<Context>, args: any, data: any) => VoidReturn` | 操作日志记录时触发。 |

---

## 内部广播机制

Hydro 使用两种跨进程广播实现（`bus.ts` 中的 `apply` 函数）：

1. **PM2 模式** — 集群部署时，通过 PM2 的 `launchBus` + BSON 序列化在进程间传递事件。
2. **MongoDB 模式** — 单进程或无 PM2 时，`bus/broadcast` 事件直接在本进程内调用 `parallel`。

插件开发者无需关心底层实现，统一使用 `ctx.broadcast()` 即可。
