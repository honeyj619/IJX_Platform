# IJX Platform Harness 治理地图

版本：1.0  
更新日期：2026-11-13

## 1. 唯一事实源

| 治理域 | 权威代码 | 权威规范 |
| --- | --- | --- |
| PC 客户端、如意空间 | `src/pages/`、`src/components/`、`src/store/` | 根 `Agents.md`、`docs/UI_DESIGN_GUIDELINES.md`、如意助手专项方案 |
| 管理后台 | `src/pages/Admin.tsx`、`src/components/admin/` | 根 `Agents.md`、`docs/ADMIN_UI_GUIDELINES.md`、`docs/ADMIN_ROUTES.md` |
| Vue 员工端 App | `src/prototype/` | `src/prototype/harness/` |
| 跨端入口与兼容路由 | `src/App.tsx`、`src/pages/Download.tsx` | `docs/APP_ROUTES.md` |

`honeyj619/IJX_App` 是只读历史仓库，不再是开发目标，也不得作为代码或 Harness 的同步源。

## 2. 任务路由规则

- 修改 `/pc_client`、如意空间、桌面工作台：读取根 `Agents.md` 和对应专项文档。
- 修改 `/admin`：读取 `docs/ADMIN_UI_GUIDELINES.md` 与 `docs/ADMIN_ROUTES.md`。
- 修改 `/app/prototype/*`、App 五个 Tab 或 Vue 消息模块：进入 `src/prototype/harness/`，按其 `AGENTS.md` 的顺序读取全部必需文件。
- 修改 `/download`、`/app` 兼容入口或跨端跳转：同时检查根路由、Vue Router、`docs/APP_ROUTES.md` 和路由自动化。

同一任务跨越两个治理域时，必须分别满足两套规范；不得用一个治理域的视觉或组件规则覆盖另一个治理域。

## 3. 协作边界

- 同一时间只允许一个 Agent 修改同一组文件。
- `src/prototype/` 的产品、设计与任务记录只写入其子 Harness。
- 根 `tasks/CURRENT.md` 不记录 App 子应用的页面实施细节；App 任务写入 `src/prototype/harness/tasks/CURRENT.md`。
- 历史记录进入对应 `tasks/archive/`，`CURRENT.md` 只保留一个活动任务。
- 任何路由变更必须同轮更新实现、文档和自动化断言。

## 4. 验收入口

| 范围 | 最低验证 |
| --- | --- |
| 主工程 | `npm.cmd run check`、`git diff --check` |
| App 路由合同 | `npm.cmd run check:routes` |
| App 页面路由 | `npm.cmd run check:pages` |
| 下载页四端链路 | `npm.cmd run check:app-chain` |
| GitHub Pages | 使用 `VITE_BASE=/IJX_Platform/` 构建，并验证直接访问与刷新 |

浏览器验收不能被静态构建替代；页面视觉或关键交互发生变化时，仍需按各自 Harness 补充真实视口验证。
