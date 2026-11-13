# IJX Platform App 路由合同

版本：2.0  
适用范围：React 宿主、`/download` 跨端入口与 `src/prototype/` Vue 员工端  
权威实现：`src/prototype/`

## 1. 架构边界

- React Router 负责 `/app` 统一入口、Vue 子应用宿主和历史 URL 兼容。
- Vue Router 负责 `/app/prototype/*` 内的所有 App 页面。
- Android 与 iOS 默认共用同一页面；`?platform=android|ios` 只表示演示平台，不建立两套页面。
- `src/pages/app/` 是已弃用的 React App 实现，不再登记新路由，也不得作为开发目标。
- `honeyj619/IJX_App` 是历史归档，不参与本合同。

## 2. 规范 URL

| 页面 | 规范 URL | Vue 内部路径 | 状态 |
| --- | --- | --- | --- |
| App 统一入口 | `/app` | - | 重定向到 `/app/prototype/` |
| 首页 | `/app/prototype/` | `/` | 已实现 |
| 日程 | `/app/prototype/schedule` | `/schedule` | 已实现 |
| 工作台 | `/app/prototype/workspace` | `/workspace` | 已实现 |
| 消息 | `/app/prototype/message` | `/message` | 已实现 |
| 我的 | `/app/prototype/profile` | `/profile` | 已实现 |
| 消息搜索 | `/app/prototype/message/search` | `/message/search` | 已实现 |
| 会话 | `/app/prototype/message/chat/:sessionId` | `/message/chat/:sessionId` | 已实现 |
| 会话信息 | `/app/prototype/message/info/:sessionId` | `/message/info/:sessionId` | 已实现 |
| 会话记录 | `/app/prototype/message/history/:sessionId` | `/message/history/:sessionId` | 已实现 |
| 通讯录 | `/app/prototype/message/contacts` | `/message/contacts` | 已实现 |
| 联系人 | `/app/prototype/message/contact/:contactId` | `/message/contact/:contactId` | 已实现 |
| 创建群聊 | `/app/prototype/message/group/create` | `/message/group/create` | 已实现 |
| 群详情 | `/app/prototype/message/group/:groupId` | `/message/group/:groupId` | 已实现 |
| 扫一扫 | `/app/prototype/message/scan` | `/message/scan` | 原型入口 |
| 置顶消息 | `/app/prototype/message/pins/:sessionId` | `/message/pins/:sessionId` | 已实现 |
| 话题 | `/app/prototype/message/topic/:topicId` | `/message/topic/:topicId` | 已实现 |
| 回执 | `/app/prototype/message/receipt/:sessionId/:msgId` | `/message/receipt/:sessionId/:msgId` | 已实现 |
| 服务号 | `/app/prototype/message/service/:accountId` | `/message/service/:accountId` | 已实现 |

## 3. 下载页入口

| 操作 | 目标 URL |
| --- | --- |
| iOS 下载 | `/app/prototype/?platform=ios` |
| Android 下载 | `/app/prototype/?platform=android` |
| PC 客户端进入 | `/pc_client` |
| PC Web 进入 | `/pc_web` |

## 4. 历史兼容

| 历史 URL | 兼容目标 |
| --- | --- |
| `/app/home` | `/app/prototype/` |
| `/app/android/home` | `/app/prototype/?platform=android` |
| `/app/ios/home` | `/app/prototype/?platform=ios` |
| `/app/messages` | `/app/prototype/message` |
| `/app/messages/*` | `/app/prototype/message` |
| 其他未登记 `/app/*` | `/app/prototype/` |

历史 URL 只用于兼容，不得用于新代码、文档示例或页面链接。

## 5. GitHub Pages

- React Router basename 使用 `import.meta.env.BASE_URL`。
- Vue Router base 为 `${import.meta.env.BASE_URL}app/prototype/`。
- Pages 正式 base 为 `/IJX_Platform/`。
- 业务代码不得手工拼接仓库前缀。
- 新增或更名路由时必须验证直接打开、刷新、前进、后退与 404 恢复。

## 6. 维护流程

新增或更名 App 页面时，同一轮必须：

1. 修改 `src/prototype/router/index.ts`。
2. 必要时修改 `src/App.tsx` 的宿主或兼容路由。
3. 更新本文件。
4. 更新 `tools/prototype/smoke-pages.mjs` 与路由合同检查。
5. 在 `src/prototype/harness/tasks/CURRENT.md` 记录任务边界和验证结果。
6. 运行 `npm.cmd run check`、`npm.cmd run check:routes` 和适用的浏览器链路验证。
