# 当前任务：客户端任务窗口 P0/P2 改造与 Windows 原型表达

## 基本信息

- 更新日期：2026-11-26
- 任务类型：PC 客户端交互改造 + Harness 规则沉淀
- 影响域：`/pc_client` 日历、如意会议、会议室、会议详情
- 不在范围：P1 既有复杂交互复核、管理后台、Vue App、Git 提交/推送/部署

## 本轮决策

- 创建日程、预定会议及编辑复用同一 `ScheduleTaskWindow`。
- Web 原型不使用 `window.open` 拉起浏览器页；入口在当前应用视口进入独立任务窗口路由。
- 任务窗口由“客户端舞台 + Windows 中性标题栏 + 业务工作面”构成；真实客户端可在后续把同一内容映射为原生子窗口。
- 背景图片只用于窗口外侧舞台，不进入业务表单、时间轴或组件表面。
- 当前 PC 原型统一按 Windows 环境表达，不使用 macOS 红黄绿交通灯；具体操作系统皮肤不固化为业务规范。
- Modal 继续用于通讯录、会议室、自定义重复、取消修改确认等窗口内短任务。

## P0 实施范围

- 统一规范路由：
  - `/pc_client/calendar/create`
  - `/pc_client/calendar/events/:eventId/edit`
  - `/pc_client/meetings/create`
  - `/pc_client/meetings/:meetingId/edit`
- 统一日历、会议中心、会议室拖选和会议详情编辑入口。
- 删除 `Calendar.tsx` 的重复大型创建弹框，并停止使用 `MeetingScheduleDialog`。
- 任务窗口关闭返回来源页；脏数据关闭前继续确认。
- 提交后复用 meeting store 同步日历、会议与会议室数据。

## P2 实施范围

- 共享 `Modal`、`Popover`、`Drawer`、`TaskWindowShell`。
- `TaskWindowShell` 提供 Windows 中性标题栏、舞台背景、最大化/还原模拟、固定底部操作和未保存保护。
- 自动检查覆盖独立路由、入口跳转、返回来源、提交同步和无浏览器弹窗。
- 真实最小化、多原生窗口、IPC 与主窗口退出联动保留为客户端壳验收项。

## P1 状态

- 暂不执行。
- 工作事项、帮助反馈、OKR 助手、发起/加入会议、录制详情和全局搜索保持现状。

## 验收标准

- “创建日程”和“预定会议”都显示标题为“创建日程”的同一任务窗口。
- 窗口外侧能看到客户端舞台背景，窗口内不使用背景图片模拟业务组件。
- 标题栏没有 macOS 交通灯；控制区位于右侧，关闭遵守草稿保护。
- 打开入口不产生浏览器新窗口或新标签页。
- Modal 与 Task Window 的层级、遮罩、路由和尺寸语义可被清楚区分。
- `npm.cmd run check`、`npm.cmd run build` 和关键浏览器回归通过。

## 执行状态

- P0：已完成。创建/编辑入口已统一到同一任务窗口路由，旧重复弹框已移除。
- P1：按要求暂缓。
- P2：已完成。共享窗口组件、任务窗口契约检查与浏览器回归脚本已建立。

## 实际验证结果

- `npm.cmd run check:types`：通过。
- `npm.cmd run build`：通过；保留一个存量主包超过 `900 kB` 的构建警告。
- `npm.cmd run check:task-window`：通过。
- `npm.cmd run check:task-window:browser`（`TASK_WINDOW_BASE=http://127.0.0.1:5180`）：11 项通过，覆盖同页打开、Windows 标题栏、舞台背景、脏数据 Modal、最大化/还原、关闭返回、预定会议复用和控制台错误。
- 变更文件 ESLint：0 error；保留 3 条存量 Hook/无效禁用注释 warning。
- `npm.cmd run check`：类型、构建、路由合同、21 条页面冒烟均通过；在非本轮范围的 App 下载链停止，iOS“消息 → 会话详情 → 返回列表”3 项失败（17/20），未继续进入后续登录与任务窗口步骤。

## 合并与收尾记录（2026-11-26 21:30，DSH 接管）

- 本次推送合并两个工作路径：主仓 `D:\WorkBuddy_Workspace\IJX_Platform` 与 Codex 本轮改动集 `C:\Users\jjie6\Documents\new ijx()\work_window_redesign`。
- 采用 Codex 改造：`taskWindow.ts`（同页路由 + `returnTo`）、`TaskWindowShell`（Windows 中性标题栏 + 舞台背景 + 最大化模拟）、`client-task-stage.png`、`Calendar/Meetings/MeetingRoomView/MeetingDetailDialog` 入口、`index.css` 任务窗口舞台样式、`package.json` 新增 `check:task-window` 与 `check:task-window:browser`、两个契约/浏览器校验脚本、`RequirementMode` 任务窗口路由下入口按钮右下角避让、`CLIENT_INTERACTION_SURFACES` / `UI_DESIGN_GUIDELINES` / `Agents` 相关规则。
- 保留主仓 `ScheduleTaskWindow.tsx`（含 `ParticipantSelector` 双入口与 2210 审批字段），仅把 `closeWindow` 由 `window.close()` 改为按 `returnTo` 返回来源页，以适配同页窗口；未采用 Codex 的精简重写版（该版用 `ContactPicker` 替代双入口，会回退需求 `custom-20261028-005`）。
- `package.json` 未整体覆盖：保留主仓 `check:participants`、`audit`、`cleanup` 等脚本，仅追加任务窗口两条。
- 上一轮遗留项（会议中心切窗口、`custom-20261028-005` route 改为 `/pc_client/calendar/create`）已在合并中一并生效。
