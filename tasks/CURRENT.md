# 当前任务

## 基本信息

- 任务名称：桌面端统一登录原型与设备管理联动
- 提出日期：2026-11-23
- 任务类型：前端原型跨路由、共享状态、模拟数据与关键交互改造
- 执行方案：`C:\Users\jjie6\Documents\new ijx()\桌面端统一登录原型开发方案-Trae执行版.md`（V1.0）
- 上游功能方案：`桌面端浏览器登录功能设计方案.md` V1.2
- 目标用户/评审对象：产品、设计及后续开发模型

## 目标与已确认产品规则

- 新增独立 `/login` 页面，PC Web 与 PC 客户端共用同一登录组件，通过 `source=web|client` 决定成功后的过渡状态链、最终入口和设备类型。
- PC Web 未登录时由路由门禁进入 `/login?source=web`；登录成功回到合法来源页，否则 `/pc_web`。
- PC 客户端未登录时展示客户端未登录页（保留客户端窗口视觉），点击「使用浏览器登录」进入 `/login?source=client`；登录成功经「登录中 → 登录成功 → 同步中 → 拉起中」进入 `/pc_client`。
- 完整覆盖：登录中、成功、账号错误、锁定、停用、无权限、网络异常、系统异常、取消、超时、客户端同步失败、拉起失败。
- 不拉起真实浏览器/客户端，不接真实认证、设备或会话接口；登录成功只更新前端模拟 Store，并与 `/admin/security/devices` 联动。
- 失败、同步失败、拉起失败不得写入有效设备会话；只有最终进入 `/pc_web` 或 `/pc_client` 时才写入。
- 稳定失败演示使用 `demo` 参数（success/invalid/locked/disabled/forbidden/network/system/timeout/sync-fail/launch-fail）。

## 影响域

- PC 客户端（`/pc_client/*`）：外层 AuthGate、UserMenu 退出登录、客户端未登录页。
- PC Web（`/pc_web`、`/pc_web/contacts`）：外层 AuthGate、头像区最小退出菜单。
- 管理后台（`/admin/security/devices`）：设备/会话数据迁移共享 Store，登录/退出联动。

## 参考基线与必读文档

- 根 `Agents.md`、`docs/HARNESS_MAP.md`、`docs/UI_DESIGN_GUIDELINES.md`、`docs/ADMIN_UI_GUIDELINES.md`、`docs/ADMIN_ROUTES.md`、`docs/APP_ROUTES.md`、`docs/REQUIREMENT_EDITING.md`
- App 权威实现位于 `src/prototype/`，本任务不进入该治理域。

## 成功与失败分支清单

- 成功（Web）：submitting → web_entering → completeLogin('web') → /pc_web[|/pc_web/contacts]
- 成功（Client）：submitting → client_authenticated → client_syncing → client_launching → completeLogin('client') → /pc_client...
- 失败：invalid_credentials、account_locked、account_disabled、permission_denied、network_error、system_error、cancelled、timed_out、client_sync_failed、client_launch_failed
- 所有失败分支均有准确文案与恢复动作，且不写入有效设备会话。

## 验收标准

- `/login` 独立路由可直接访问，1440/1280/1024 无重叠、无横向溢出。
- 受保护路由不能通过刷新、后退或直接粘贴地址绕过。
- 重复登录不重复新增设备、但追加会话；登录中重复点击不创建多条会话。
- Admin 单设备退出/全部退出/批量退出与 channel 登录态联动正确；多标签页经 storage 事件同步。
- Download、App、Admin 原有路径不被破坏；`npm.cmd run check` 与 `npm.cmd run build` 通过。

## 非目标

- 真实登录接口、账号安全策略、系统浏览器打开、客户端唤醒、协议注册、Token/Cookie。
- App 端登录；`SettingsContent.tsx` 设备数据统一改造；Admin 新页面或新菜单。
- 真实 IP、设备指纹或隐私数据采集；Git 提交、推送和部署。

## 预计影响文件

新增：`src/pages/Login.tsx`、`src/components/auth/AuthGate.tsx`、`src/components/auth/ClientSignedOut.tsx`、`src/store/prototypeSessionStore.ts`、`src/data/deviceManagement.ts`、`tools/prototype/verify-login-flow.mjs`

修改：`src/App.tsx`、`src/components/UserMenu.tsx`、`src/components/admin/DeviceManagement.tsx`、`src/pages/PcWebPortal.tsx`（仅最小退出入口）、`docs/HARNESS_MAP.md`、`docs/APP_ROUTES.md`（仅补充未登录门禁说明）、`docs/PROTOTYPE_REQUIREMENTS.md`（仅由需求编辑器写入）、`tools/prototype/check-route-contract.mjs`、`tools/prototype/verify-download-chain.mjs`、`package.json`、`tasks/CURRENT.md`

## 未确认项与实现假设

- `demo` 失败参数仅作用于每次访问 `/login` 后的第一次登录尝试；任何恢复动作后的再次尝试按成功处理（满足「launch-fail 重试后可成功」的回归要求）。刷新页面后 `demo` 重新生效。
- 主用户模拟账号使用设备管理演示数据中的 `liangjie`（梁吉力）；Web 登录设备复用 `device-web-liang-1`，PC 客户端登录设备复用 `device-pc-liang`。
- 登录页在 <600px 窄视口仍显示移动端提示（桌面原型页），`verify-download-chain.mjs` 的 PC 两端断言改用桌面视口（1440×900）执行后恢复 390×844。
- PC Web 退出入口：在现有头像区域补最小「退出登录」菜单（含确认弹窗），不新造整套 Header。
- 新增会话 ID/时间格式沿用现有 `SES-*` 与 `YYYY-MM-DD HH:mm:ss` 风格，时间取当前时间。
- 基础设施最小扩展（方案要求登记 `/login` 与 `/admin/security/devices` 需求条目所必需）：`tools/requirements/schema.mjs` 的 route 白名单放开 `/login` 与 `/admin/` 子路径；`src/components/requirements/RequirementMode.tsx` 的 `supportedRoute` 同步覆盖 `/login` 与 `/admin/` 子路径（需求模式层此前不支持管理后台子页面，现子页面可显示角标与维护入口）。
- 需求模式入口 UI 有既有的独立拖拽手柄与 pointer capture 机制，本次未改动其交互。

## 执行状态

- 已完成（2026-11-23）。

### 实际影响文件

新增：

- `src/pages/Login.tsx`（统一登录页 + 完整状态机 + 失败分支视图）
- `src/components/auth/AuthGate.tsx`（路由门禁 + 来源/回跳白名单）
- `src/components/auth/ClientSignedOut.tsx`（客户端未登录页）
- `src/store/prototypeSessionStore.ts`（version:1 localStorage 持久化 + storage 跨标签页同步）
- `src/data/deviceManagement.ts`（设备/用户演示数据与纯函数抽取）
- `tools/prototype/verify-login-flow.mjs`（登录专项回归，check:login）

修改：

- `src/App.tsx`（/login 路由、/pc_web 与 /pc_client 门禁接线）
- `src/components/UserMenu.tsx`（退出登录确认弹窗 + logoutChannel('client')）
- `src/components/admin/DeviceManagement.tsx`（迁移共享 Store，data anchor）
- `src/pages/PcWebPortal.tsx`（头像区最小退出菜单 + 确认弹窗）
- `src/components/requirements/RequirementMode.tsx`、`tools/requirements/schema.mjs`（见基础设施扩展说明）
- `docs/HARNESS_MAP.md`（新增「统一登录 / PC 跨端会话」治理域）、`docs/APP_ROUTES.md`（下载入口补充未登录门禁说明）
- `docs/PROTOTYPE_REQUIREMENTS.md`（由需求编辑器写入两条需求）
- `tools/prototype/check-route-contract.mjs`（+6 项登录合同断言）、`tools/prototype/verify-download-chain.mjs`（PC 两端门禁断言 + 桌面视口）
- `package.json`（`check:login` 纳入总 `check` 链尾）

### 需求模式条目（经需求编辑器写入，锚点自动插入）

- `custom-20261123-001` 统一登录 / 统一登录流程，route=`/login`，锚点 `src/pages/Login.tsx` 最外层常驻登录区域
- `custom-20261123-002` 安全管理 · 设备管理 / 登录与设备管理联动，route=`/admin/security/devices`，锚点 `src/components/admin/DeviceManagement.tsx` 页面常驻根容器
- 两模块内序号均为 1，连续无空洞。

### 验证结果

- `npm.cmd run check`（types + build + routes + pages + app-chain + login）整体通过：
  - check:routes 20 项 PASS（含 6 项新登录合同断言）
  - check:pages 21/21 PASS
  - check:app-chain 20/20 PASS（PC 两端更新为门禁断言）
  - check:login 23/23 PASS（方案 §16.1 全部 17 类场景；失败分支均验证「不写有效会话」）
- `npm.cmd run build` 生产构建通过。
- 浏览器验收：16 张截图（1440 主 + 1280/1024 布局检查），1440/1280/1024 下登录页与设备管理页 scrollWidth=clientWidth（无横向溢出、无重叠），console/pageerror 零新增。截图存放于工作区 `登录验收截图/`（不入 Git）。
- `git diff --check` 通过；未执行 commit/push（方案非目标）。
