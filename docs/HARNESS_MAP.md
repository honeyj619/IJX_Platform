# Harness 治理地图

> 处理任何页面需求前，先读取本文件判断治理域。
> 涉及 `src/prototype/` 时，必须进入 `src/prototype/harness/`，根规范不得覆盖 App Harness。

## 1. 三个治理域

| 治理域 | 权威代码 | 权威规范 | 验证入口 |
| --- | --- | --- | --- |
| PC 客户端 / 如意空间 | `src/pages/`、`src/components/` | 根 `Agents.md`、`docs/UI_DESIGN_GUIDELINES.md` | `npm run check` + 相关页面浏览器回归 |
| 管理后台 | `/admin` 相关代码（`src/pages/Admin.tsx` 等） | `docs/ADMIN_UI_GUIDELINES.md`、`docs/ADMIN_ROUTES.md` | `npm run check` + 后台入口回归 |
| Vue App（员工端） | `src/prototype/` | `src/prototype/harness/` | `npm run check:routes` + `check:pages` + `check:app-chain` |
| 跨端入口与兼容路由 | `src/App.tsx`、`src/pages/Download.tsx` | `docs/APP_ROUTES.md` | `npm run check:routes` + 下载链路回归 |
| 统一登录 / PC 跨端会话 | `src/pages/Login.tsx`、`src/components/auth/`、`src/store/prototypeSessionStore.ts` | 根 `Agents.md`、`docs/UI_DESIGN_GUIDELINES.md`、`docs/ADMIN_UI_GUIDELINES.md`、`docs/ADMIN_ROUTES.md` | `npm run check` + `npm run check:login`（登录专项回归） |

## 1.1 统一登录 / PC 跨端会话

- PC Web 与 PC 客户端共用 `/login`（`source=web|client`）；失败分支由 `demo` 参数稳定触发，不接真实认证、浏览器拉起或客户端协议。
- 登录态、设备与会话共享 `src/store/prototypeSessionStore.ts`（版本化 localStorage `ijx-prototype-session-v1`，跨标签页 storage 同步）；设备与用户基础数据在 `src/data/deviceManagement.ts`。
- Web（`/pc_web*`）与客户端（`/pc_client/*`）路由由 `src/components/auth/AuthGate.tsx` 门禁；失败、同步失败、拉起失败不得写入有效设备会话。
- Admin `/admin/security/devices` 与登录原型联动（单设备退出 / 全部退出 / 批量退出同步清除 channel 登录态）；Admin 路由自身不受登录门禁。
- 本功能不进入 Vue App Harness（`src/prototype/` 禁止修改）。

## 2. 唯一事实源

- 员工端 App 唯一权威实现：`IJX_Platform/src/prototype/`（Vue 3 子应用，由 `src/components/VuePrototypeHost.tsx` 挂载）。
- `IJX_App` 独立仓库已退役，只读归档，不参与主仓构建、路由和发布（审计见 `docs/archive/IJX_APP_MIGRATION_AUDIT.md`）。
- GitHub Pages 只构建和发布 `IJX_Platform` 主仓。

## 3. 每个治理域开始任务前必读

- **PC 客户端 / 如意空间**：根 `Agents.md` → `docs/UI_DESIGN_GUIDELINES.md` → 涉及页面代码。
- **管理后台**：根 `Agents.md` → `docs/ADMIN_UI_GUIDELINES.md` → `docs/ADMIN_ROUTES.md` → `/admin` 相关代码。
- **统一登录 / PC 跨端会话**：根 `Agents.md` → `docs/UI_DESIGN_GUIDELINES.md` → `docs/ADMIN_UI_GUIDELINES.md` → `docs/ADMIN_ROUTES.md` → `src/pages/Login.tsx` / `src/components/auth/` / `src/store/prototypeSessionStore.ts`。
- **Vue App**：`src/prototype/harness/AGENTS.md` → 其 `docs/` 四份长期规范 → `tasks/CURRENT.md`；涉及宿主路由或下载入口时加读根 `docs/APP_ROUTES.md`。

## 4. 跨域需求处理

- 一个需求横跨两个治理域（如下载页入口调整 + App 页面改动）时，拆分为各域内的独立改动，分别按各自 Harness 验收，分批提交，不混在一起。
- Vue Router 内部使用相对于 `/app/prototype/` 的路径；React 宿主侧的路由常量统一放 `src/constants/appRoutes.ts`，Vue 侧不得硬编码 React 部署前缀，React 侧不得绕过常量硬编码 App 路径。

## 5. 禁止互相覆盖

- 根 `Agents.md` 只负责把任务路由到正确治理域，不复制 App Harness 的详细规范。
- `src/prototype/harness/` 不混入后台与客户端规范；后台规范（`ADMIN_*`）不进入 App Harness。
- 任何治理域的规范更新不得顺带改写其他域的规范文件。

## 6. App 验证入口速查

| 命令 | 覆盖 |
| --- | --- |
| `npm run check:routes` | 路由合同（宿主路由 / 兼容路由 / 下载入口 / APP_ROUTES.md 一致性） |
| `npm run check:pages` | App 页面冒烟（5 入口 + 14 消息子路由） |
| `npm run check:app-chain` | `/download` 四端入口全链路浏览器回归 |
| `npm run check` | 上述 + 类型 + 构建 |

Pages 正式 base（`/IJX_Platform/`）构建验收：`VITE_BASE='/IJX_Platform/' npm run build`，然后验证 `/IJX_Platform/download`、`/IJX_Platform/app/prototype/`、`/IJX_Platform/app/prototype/message`、`/IJX_Platform/pc_client`、`/IJX_Platform/pc_web`、`/IJX_Platform/admin`。

## 7. PC 客户端专项验证入口速查

| 命令 | 覆盖 |
| --- | --- |
| `npm run check:req-mode` | 需求模式入口交互回归（真实 pointer/mouse/touch/keyboard，非 DOM `.click()`）：点击开关（含按钮内部文字）、拖拽手柄移动 + 位置持久化且不切换模式、拖后立即点击有效、键盘 Enter/Space、触控 tap、生产只读（无维护入口、不请求 `/__ijx/requirements`）、本机 dev 维护入口可见性与点选流程。独立命令（需本机 Chrome + playwright-core），不并入 `npm run check` |
