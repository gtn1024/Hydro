# 错误类 (Error Classes)

Hydro 插件开发中可用的所有错误类型，包括基础错误类和 Hydro 自定义业务错误。

> **Source**: `packages/hydrooj/src/error.ts`, `@hydrooj/framework/error`

## 导入

```ts
import {
    HydroError, UserFacingError, BadRequestError, ForbiddenError, NotFoundError,
    CreateError,
    // ... 自定义错误类
} from 'hydrooj';
```

## CreateError 工厂函数

`CreateError` 用于创建自定义错误类。所有 Hydro 内置错误均通过此函数生成。

### 签名

```ts
function CreateError(
    name: string,
    Base: typeof UserFacingError,
    message: string | ((this: HydroError) => string),
    httpStatus?: number
): typeof UserFacingError;
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 错误类名称，同时作为错误 `name` 属性 |
| `Base` | `typeof UserFacingError` | 父错误类，决定 HTTP 状态码默认值 |
| `message` | `string \| (this: HydroError) => string` | 错误消息模板，支持 `{0}` `{1}` `{2}` 占位符；或返回消息的函数 |
| `httpStatus` | `number` | 可选，覆盖 HTTP 状态码 |

### 用法示例

```ts
import { CreateError, ForbiddenError } from 'hydrooj';

// 简单消息 + 占位符
export const MyError = CreateError('MyError', ForbiddenError, 'Something went wrong: {0}');

// 动态消息（基于 this.params 计算）
export const DynamicError = CreateError('DynamicError', ForbiddenError, function (this: HydroError) {
    return `Value is ${this.params[0]}`;
});

// 抛出
throw new MyError('detail info');
```

消息模板中的 `{0}`、`{1}`、`{2}` 会被替换为构造函数传入的参数（`this.params`）。

---

## 基础错误类

由 `@hydrooj/framework/error` 导出，构成错误继承体系。

| 类名 | HTTP 状态码 | 说明 |
|------|------------|------|
| `HydroError` | — | 所有 Hydro 错误的基类。持有 `name`、`params`、`message` 属性 |
| `UserFacingError` | 500 | 面向用户的错误基类，继承 `HydroError`。带 HTTP 状态码 |
| `BadRequestError` | 400 | 请求参数或业务逻辑无效，继承 `UserFacingError` |
| `ForbiddenError` | 403 | 权限不足或操作被拒绝，继承 `UserFacingError` |
| `NotFoundError` | 404 | 资源不存在，继承 `UserFacingError` |

继承关系：

```
HydroError
└── UserFacingError (500)
    ├── BadRequestError (400)
    ├── ForbiddenError (403)
    └── NotFoundError (404)
```

---

## Hydro 自定义错误

以下错误均定义于 `packages/hydrooj/src/error.ts`，通过 `CreateError` 创建。

### Internal / Server Error (500)

继承 `UserFacingError`，表示服务端异常。

| 错误类 | 默认消息 |
|--------|----------|
| `RemoteOnlineJudgeError` | `RemoteOnlineJudgeError` |
| `SendMailError` | `Failed to send mail to {0}. (1)` |

### Permission / Auth Errors (403)

继承 `ForbiddenError`，表示权限验证失败。

| 错误类 | 默认消息 |
|--------|----------|
| `LoginError` | `Invalid password for user {0}.` |
| `BuiltinLoginError` | `Builtin login is disabled.` |
| `AccessDeniedError` | `Access denied.` |
| `InvalidTokenError` | `The {0} Token is invalid.` |
| `BlacklistedError` | `Address or user {0} is blacklisted.` |
| `VerifyPasswordError` | `Passwords don't match.` |
| `OpcountExceededError` | `Too frequent operations of {0} (limit: {2} operations in {1} seconds).` |
| `PermissionError` | `You don't have the required permission ({0}) in this domain.` *动态* |
| `PrivilegeError` | `You don't have the required privilege.` *动态* |
| `CurrentPasswordError` | `Current password doesn't match.` |

> `PermissionError`：若 `params[0]` 为 `bigint` 权限标志，自动替换为对应的权限描述文本。
>
> `PrivilegeError`：若缺少 `PRIV_USER_PROFILE`，消息变为 `"You're not logged in."`。

### User / Domain Errors (403)

继承 `ForbiddenError`，表示用户或域操作冲突。

| 错误类 | 默认消息 |
|--------|----------|
| `UserAlreadyExistError` | `User {0} already exists.` |
| `RoleAlreadyExistError` | `This role already exists.` |
| `DomainAlreadyExistsError` | `The domain {0} already exists.` |
| `DomainJoinForbiddenError` | `You are not allowed to join domain {0}. {1}` |
| `DomainJoinAlreadyMemberError` | `Failed to join the domain. You are already a member.` |
| `InvalidJoinInvitationCodeError` | `The invitation code you provided is invalid.` |
| `AlreadyVotedError` | `You've already voted.` |

### Contest / Homework Errors (403)

继承 `ForbiddenError`，表示比赛/作业相关业务规则违反。

| 错误类 | 默认消息 |
|--------|----------|
| `ContestNotAttendedError` | `You haven't attended this contest yet.` |
| `ContestAlreadyAttendedError` | `You've already attended this contest.` |
| `ContestNotLiveError` | `This contest is not live.` |
| `ContestNotEndedError` | `This contest is not ended.` |
| `ContestScoreboardHiddenError` | `Contest scoreboard is not visible.` |
| `HomeworkNotLiveError` | `This homework is not open.` |
| `HomeworkNotAttendedError` | `You haven't claimed this homework yet.` |

### Training Errors (403)

继承 `ForbiddenError`。

| 错误类 | 默认消息 |
|--------|----------|
| `TrainingAlreadyEnrollError` | `You've already enrolled this training.` |

### Problem / File Errors (403)

继承 `ForbiddenError`，表示题目或文件操作被拒绝。

| 错误类 | 默认消息 |
|--------|----------|
| `NotAssignedError` | `You are not assigned to this {0}.` |
| `FileLimitExceededError` | `File {0} limit exceeded.` |
| `FileUploadError` | `File upload failed.` |
| `FileExistsError` | `File {0} already exists.` |
| `HackFailedError` | `Hack failed: {0}` |
| `ProblemAlreadyExistError` | `Problem {0} already exists.` |
| `ProblemAlreadyUsedByContestError` | `Problem {0} is already used by contest {1}.` |
| `ProblemNotAllowPretestError` | `Pretesting is not supported for {0}.` |
| `ProblemNotAllowLanguageError` | `This language is not allowed to submit.` |
| `ProblemNotAllowCopyError` | `You are not allowed to copy this problem from {0} to {1}.` |
| `DiscussionLockedError` | `The discussion is locked, you can not reply anymore.` |
| `RequireProError` | `RequireProError` |

### Validation / Logic Errors (400)

继承 `BadRequestError`，表示请求参数或业务逻辑无效。

| 错误类 | 默认消息 |
|--------|----------|
| `PretestRejudgeFailedError` | `Cannot rejudge a pretest record.` |
| `HackRejudgeFailedError` | `Cannot rejudge a hack record.` |
| `CannotDeleteSystemDomainError` | `You are not allowed to delete system domain.` |
| `OnlyOwnerCanDeleteDomainError` | `You are not the owner of this domain.` |
| `CannotEditSuperAdminError` | `You are not allowed to edit super admin in web.` |
| `ProblemConfigError` | `Invalid problem config.` |
| `ProblemIsReferencedError` | `Cannot {0} of a referenced problem.` |
| `AuthOperationError` | `{0} is already {1}.` |
| `NotLaunchedByPM2Error` | `Not launched by PM2.` |

### Not Found Errors (404)

继承 `NotFoundError`，表示资源不存在。

| 错误类 | 默认消息 |
|--------|----------|
| `UserNotFoundError` | `User {0} not found.` |
| `NoProblemError` | `No problem.` |
| `RecordNotFoundError` | `Record {0} not found.` |
| `ProblemDataNotFoundError` | `Data of problem {0} not found.` |
| `MessageNotFoundError` | `Message {0} not found.` |
| `DocumentNotFoundError` | `Document {2} not found.` |

### Document Sub-type Not Found (404)

继承 `DocumentNotFoundError`（间接继承 `NotFoundError`），表示特定类型的文档不存在。

| 错误类 | 默认消息 |
|--------|----------|
| `ProblemNotFoundError` | `Problem {1} not found.` |
| `SolutionNotFoundError` | `Solution {1} not found.` |
| `TrainingNotFoundError` | `Training {1} not found.` |
| `ContestNotFoundError` | `Contest {1} not found.` |
| `DiscussionNotFoundError` | `Discussion {1} not found.` |
| `DiscussionNodeNotFoundError` | `Discussion node {1} not found.` |

继承关系：

```
NotFoundError
└── DocumentNotFoundError ("Document {2} not found.")
    ├── ProblemNotFoundError ("Problem {1} not found.")
    ├── SolutionNotFoundError ("Solution {1} not found.")
    ├── TrainingNotFoundError ("Training {1} not found.")
    ├── ContestNotFoundError ("Contest {1} not found.")
    ├── DiscussionNotFoundError ("Discussion {1} not found.")
    └── DiscussionNodeNotFoundError ("Discussion node {1} not found.")
```
