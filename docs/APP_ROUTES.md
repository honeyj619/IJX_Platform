# IJX Platform App 端路径规范

> 版本：2.0（2026-11-13 路由收敛整改）
> 适用范围：员工端 App（Vue 子应用）及其宿主路由、下载入口与历史兼容路由
> 权威实现：`src/prototype/`（Vue 3 + Vue Router，由 `src/components/VuePrototypeHost.tsx` 挂载）

## 1. 架构与路由分工

- App 权威代码位于 `src/prototype/`，是员工端唯一事实源；`IJX_App` 独立仓库已退役为只读归档。
- Vue 子应用由 `VuePrototypeHost` 挂载在宿主路由 `/app/prototype/*` 下。
- Vue Router base = 部署 base + `/app/prototype/`（本地 `/app/prototype/`，Pages `/IJX_Platform/app/prototype/`），见 `src/prototype/router/index.ts`。
- 根 React Router（`src/App.tsx`）只负责宿主页面、下载入口和旧路由兼容；App 内部页面路由由 `src/prototype/router/index.ts` 管理。
- 宿主侧进入 App 的路径一律引用 `src/constants/appRoutes.ts` 常量（`APP_PROTOTYPE_BASE` / `APP_PROTOTYPE_HOME` / `APP_PROTOTYPE_MESSAGE` / `appPrototypeRoute` / `appPrototypeHomeWithPlatform`），不硬编码。

## 2. 规范路由（本轮 URL 保持不变，不迁移）

| 页面 | 规范 URL |
| --- | --- |
| App 统一入口 | `/app`（重定向 → `/app/prototype/`） |
| Vue App 首页 | `/app/prototype/` |
| 日程 | `/app/prototype/schedule` |
| 工作台 | `/app/prototype/workspace` |
| 消息 | `/app/prototype/message` |
| 我的 | `/app/prototype/profile` |
| 帮助与反馈 | `/app/prototype/profile/feedback` |
| 反馈详情 | `/app/prototype/profile/feedback/:feedbackId` |
| 消息搜索 | `/app/prototype/message/search` |
| 会话 | `/app/prototype/message/chat/:sessionId` |
| 会话信息 | `/app/prototype/message/info/:sessionId` |
| 会话记录 | `/app/prototype/message/history/:sessionId` |
| 通讯录 | `/app/prototype/message/contacts` |
| 联系人 | `/app/prototype/message/contact/:contactId` |
| 创建群聊 | `/app/prototype/message/group/create` |
| 群详情 | `/app/prototype/message/group/:groupId` |
| 扫一扫 | `/app/prototype/message/scan` |
| 置顶消息 | `/app/prototype/message/pins/:sessionId` |
| 话题 | `/app/prototype/message/topic/:topicId` |
| 回执 | `/app/prototype/message/receipt/:sessionId/:msgId` |
| 服务号 | `/app/prototype/message/service/:accountId` |

消息模块为 13 条功能子页 + 1 条兜底重定向（`/message/:pathMatch(.*)*` → `/message`）；「我的」域新增帮助与反馈二级页（隐藏底部导航、提供返回）。

## 3. 下载入口

| 下载页操作 | 目标 |
| --- | --- |
| iOS 下载 | `/app/prototype/?platform=ios` |
| Android 下载 | `/app/prototype/?platform=android` |
| PC 客户端进入 | `/pc_client` |
| PC Web 进入 | `/pc_web` |

`platform` 仅用于平台演示上下文。没有明确平台差异时，iOS 和 Android 使用同一页面和组件。

## 4. 历史兼容路由（只作入口，不再出现在新增功能、页面链接和文档示例中）

| 历史路由 | 兼容目标 |
| --- | --- |
| `/app` | `/app/prototype/` |
| `/app/home` | `/app/prototype/` |
| `/app/android/home` | `/app/prototype/?platform=android` |
| `/app/ios/home` | `/app/prototype/?platform=ios` |
| `/app/messages` | `/app/prototype/message` |
| `/app/messages/*` | `/app/prototype/message` |
| 其他未登记 `/app/*` | `/app/prototype/` |

React App 原型（`/app/home`、`/app/<platform>/home`、`src/pages/app/`、`AppLayout.tsx`）已弃用，不再是规范实现。

## 5. 维护流程

新增 App 页面时，同一轮必须完成：

1. 在 `src/prototype/views/` 实现页面，并在 `src/prototype/router/index.ts` 登记路由。
2. 宿主侧如有新入口，更新 `src/constants/appRoutes.ts` 并引用。
3. 更新本文件路径清单。
4. 将新路由加入 `tools/prototype/smoke-pages.mjs` 冒烟清单。
5. 在 `src/prototype/harness/tasks/CURRENT.md` 登记任务与验证结果。

## 6. 路由检查

| 命令 | 覆盖 |
| --- | --- |
| `npm run check:routes` | 本文件与 `App.tsx` / `Download.tsx` / Vue Router 的合同一致性 |
| `npm run check:pages` | 全部规范路由冒烟 |
| `npm run check:app-chain` | `/download` 四端入口全链路浏览器回归 |

## 7. Pages base 验收

GitHub Pages basename 为 `/IJX_Platform/`。生产验收构建：

```powershell
$env:VITE_BASE='/IJX_Platform/'
npm.cmd run build
```

必须验证：`/IJX_Platform/download`、`/IJX_Platform/app/prototype/`、`/IJX_Platform/app/prototype/message`、`/IJX_Platform/pc_client`、`/IJX_Platform/pc_web`、`/IJX_Platform/admin`，且子路由刷新可恢复、无重复前缀或丢失前缀。
