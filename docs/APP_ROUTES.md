# IJX Platform App 端路径规范

> 版本：1.0
> 适用范围：`/app` 移动端原型
> 目标：App 端拥有独立移动端布局与稳定路由，Android 与 iOS 默认共用页面，仅对明确的平台差异分别呈现；页面可复制、可刷新、可前进后退。

## 1. 路径清单

| 页面 | 规范 URL | 平台 | 状态 |
| --- | --- | --- | --- |
| App 入口 | `/app` | 共用 | 已实现（重定向 `/app/home`） |
| App 首页 | `/app/home` | 共用（默认） | 已实现（框架） |
| App 首页（平台差异形式） | `/app/android/home`、`/app/ios/home` | 按平台 | 已实现（框架） |
| App 日程 | `/app/schedule`（内含「日程/任务」双 Tab） | 共用 | 已实现（框架） |
| App 工作台 | `/app/workbench` | 共用 | 已实现（框架） |
| App 我的 | `/app/me` | 共用 | 已实现（框架） |
| App 消息（IM 会话列表） | `/app/messages` | 共用 | 已实现（P0） |
| IM 会话详情 | `/app/messages/session/:sessionId` | 共用 | 已实现（P0） |
| IM 会话信息 | `/app/messages/session-info/:sessionId` | 共用 | 已实现（P0） |
| IM 全局搜索 | `/app/messages/search` | 共用 | 已实现（P0） |
| IM 会话内搜索 | `/app/messages/history/:sessionId` | 共用 | 已实现（P0） |
| IM 通讯录 | `/app/messages/contacts` | 共用 | 规划中 |
| IM 群聊管理 | `/app/messages/group/:groupId`（含成员/公告/文件/名单/话题子页） | 共用 | 规划中 |
| IM 建群/加入申请 | `/app/messages/groups/create`、`/app/messages/groups/join` | 共用 | 规划中 |
| IM 话题 | `/app/messages/topic/:topicId` | 共用 | 规划中 |
| IM 转发/合并记录 | `/app/messages/forward`、`/app/messages/merge/:mergeId` | 共用 | 规划中 |

规划页面清单与实施阶段详见 `docs/APP_DEVELOPMENT_PLAN.md`；未登记的 `/app/*` 路径统一回到 `/app/home`。

## 2. 路由设计规则

- App 端页面统一挂在 `/app` 下，使用独立移动端布局（`src/pages/app/AppLayout.tsx`），不嵌套 `web_client` 的桌面 Layout。
- 共享页面：`/app/<section>`，Android 与 iOS 默认共用，不携带平台段。
- 平台差异页：`/app/<platform>/<section>`，仅当页面存在明确平台差异时使用；`<platform>` 取值 `android` | `ios`。
- 共享页面支持 `?platform=android|ios` 指定平台用于调试；缺省平台为 `android`（`DEFAULT_APP_PLATFORM`）。
- 子页面通过 `useAppPlatform()`（AppLayout 导出的 context hook）读取当前平台，不得手工解析路径。
- 移动端页面宽度由 AppLayout 手机壳约束（`max-w-[430px]`），桌面浏览器居中呈现。
- 页面筛选、分页和临时弹窗状态不另建页面路径；需要分享或恢复时再使用查询参数。
- 页面必须支持直接粘贴 URL、浏览器刷新、前进和后退。

## 3. 兼容规则

- `/app` 不受移动端门禁（MobileDevicePrompt）限制，任意窗口宽度均可访问。
- 与现有 Client、Web 页面互不影响：`/app` 不参与 `web_client` 旧路由重定向；`/download` 页「iOS下载」「安卓下载」按钮分别进入 `/app/ios/home`、`/app/android/home`，PC 客户端与 PC Web 入口行为保持不变。
- GitHub Pages 的 `basename` 由路由器统一处理，业务代码不得手工拼接仓库前缀。

## 4. 与三端配置的关系

- App 端相关的管理后台配置页仍遵循 `docs/ADMIN_ROUTES.md` 登记规则。
- 「同一配置同步三端（PC 客户端 / PC Web / App）」的产品规则待 App 页面设计稿确认后补充到需求模式 `docs/PROTOTYPE_REQUIREMENTS.md`。

## 5. 维护流程

新增或更名 App 端页面时，同一轮必须完成：

1. 在 `src/pages/app/` 下实现页面组件，页面内通过 `useAppPlatform()` 读取平台。
2. 确认 `src/App.tsx` 登记规范 URL（共享页不带平台段，平台差异页带平台段）。
3. 更新本文件的路径清单。
4. 验证下载页入口、直接访问、刷新、前进后退和平台段解析。
5. 在 `tasks/CURRENT.md` 记录本轮路径变化和验证结果。
