# 已归档：P1 视觉与组件规范对齐

> 2026-11-13 Harness 治理整改：从 tasks/CURRENT.md 原样迁入，仅作历史记录，不再作为当前任务依据。

## P1 执行记录（2026-11-11 18:00，视觉与组件规范对齐，Q2 硬性要求）

### 范围

仅 `src/prototype/` 员工端消息模块：`components/im/`、`views/Message.vue`、`views/message/`、`styles/im.css`、`im/ui.ts`、`im/data/`、`assets/icons/im/`（新增）。未改 React 主工程、路由、`Download.tsx`、Harness 长期规范正文、`package.json`。

### 素材与技术登记（DESIGN_SYSTEM §5 / §4 / AGENTS §2）

- **本地占位图标（待正式品牌图标包替换）**：`assets/icons/im/` 共 40 个统一线稿 SVG（`viewBox 24×24`、`stroke=currentColor`、`stroke-width 1.7`、圆角线端）+ `README.md` 明确标注为**临时占位资产，不冒充正式品牌图标**。`ImIcon.vue` 用 `import.meta.glob('?raw', eager)` 载入，构建期内联、运行时零网络请求。与 TabBar 品牌 PNG 保持「黑色线稿 + 品牌玫红点缀」同一设计语言；正式图标包到位后**需同步替换 TabBar 与占位集**，确保同族。
- **空态场景插图**：`assets/empty/empty-function.png`（项目已有资产，318×298）作为统一 160px 占位；搜索 / 会话 / 群文件等不同场景的专属插图**待设计交付后登记替换**（`DESIGN_SYSTEM.md §8` 场景清单）。
- **圆角候选值（DESIGN_SYSTEM §4：候选值必须写入当前任务并经截图验收，不升级为正式 Token）**：`--im-radius-bubble: 14px`（气泡）、`--im-radius-input: 10px`（输入框 / 发送按钮）、`--im-radius-sheet: 16px`（弹层）、`--im-radius-tag: 4px`（标签 / 气泡折角）；卡片沿用 `--radius-card: 12px`，胶囊沿用 `--radius-pill: 999px`。以上仅为消息模块候选值，截图验收通过前不得写入 `tokens.css`。
- **经批准例外（字阶）**：`ImAvatar.vue` 头像内文字使用 `Math.round(size * 0.42) + 'px'` 随头像尺寸等比缩放，**属图形内文字而非 T1–T10 字阶文本**，登记为例外；表情回应、表情面板与 emoji 消息中的 emoji 属**内容**而非功能图标，不在图标规范约束内。
- **临时开发资源**：`im/data/messages.ts` 的 `https://office.example.com/review` 与 `im/data/services.ts` 的 `https://office.example.com/todo-help` 为**演示文本 / 菜单示例链接**，仅用于展示消息文本与菜单数据，不产生网络请求；评审与离线演示不依赖，登记为**临时开发资源**，正式接入服务后端时替换。
- **状态管理**：沿用 Q4 已确认的 `zustand/vanilla + persist`（`ijx-vue-im-store-v1`），P1 未变更。

### 逐项落点

| 项 | 实际改动 |
| --- | --- |
| P1-1 共享组件 | 新增 `ImButton.vue`（spec-button 三态 / 44px / 胶囊 / `:active` `:focus-visible` `disabled`）、`ImField.vue`（spec-field 行式五态）；重写 `ImEmpty.vue`（160px 本地插图 / 两行文案 / 左右 60px / `actionText` 下一步）、`ImNavBar.vue`（线稿返回 / 左右对称占位 / 浅深背景 / 禁用态）、`ImSheet.vue`（线稿关闭）；3 处主按钮实际接入 `ImButton`（联系人发消息 / 发布公告 / 发布投票） |
| P1-2 点击区与图标 | 40 个本地线稿 SVG + `ImIcon.vue`；6 个消息页面 emoji / 字符图标全量替换（表情内容保留）；`.im-nav__btn`、`.im-filter`、`.im-chip`、`.im-btn`、`.im-sheet__action`、`.im-composer__tool/send`、`.im-card-item` 等统一 ≥44×44；小胶囊（表情回应 / 复选框）用 `::after` 扩大热区而视觉尺寸不变；筛选按钮补 `aria-selected` |
| P1-3 Token 归零 | `im.css` 字号全部 `var(--t1..t10-size)`；品牌玫红 rgba 收敛为 `--im-brand-*` 五个语义变量；`ui.ts` 头像色板移除 `#8b5cf6` / `#00b8a9`，改用 DESIGN_SYSTEM 色表内的金 / 棕 / 链接蓝 / 功能色；新增 `prefers-reduced-motion` 降级；圆角候选值登记如上 |
| P1-4 资源清理 | `people.ts` 移除 DiceBear / trae-api，主用户头像改本地 `assets/profile/avatar-liangjie.png`，其余走 `ImAvatar` 首字母占位；`contacts.ts` 文件助手头像改首字母；`services.ts` / `selectors.ts` 的 emoji 头像文字改中文占位；`office.example.com` 登记为临时开发资源 |

### 验收证据

- 工程：`tsc -b --noEmit` 通过；`npx eslint "src/prototype/**/*.ts"` 退出 0；`npm run build` 通过；两仓库 `git diff --check` 退出 0。
- 回归：`verify-vue-im.cjs` 32/32；`verify-vue-im-flows.cjs` 23/23；`verify-download-chain.cjs` 10/10；均 0 console/pageerror。
- Harness 审计（口径按 §6 修正后）：`harness-im-audit.cjs` **25/25（P1 计入项）**，H4d / H6 明确标记 `PENDING(P2)`；第三方 host 0、console error 0。
- P1 专项：`harness-p1-audit.cjs` 逐项验收 P1-1 ~ P1-4（组件三态 / 行式 Field / 点击区 / 本地图标 / Token / 断网），**23/23 PASS**，0 console error。
- 视觉：360px 主验收截图 `harness-im-360-message.png`（Harness 审计）与 `harness-p1-360-message.png`（P1 专项）；按 Q2 逐区块对照「结构性基线清单 + `spec-*`」，**未新增任何 `page-message*` 截图**。

### 当时仍未处理（以下为 P1 收尾快照；P2 已于 2026-11-11 22:20 执行并关闭，见本文件顶部记录）

- H4d / C2「处理中 / 加载 / 错误」反馈：P2-1。
- H6 / D1 可见「恢复演示数据」入口：P2-2。
- Q5「统一暂未开放」的页面标识改造：P2-1（产品口径已写入长期文档，代码未落地）。
- 搜索 / 筛选空态的「下一步操作」页面接线：P2-3（`ImEmpty.actionText` 组件能力已具备）。
- 等价 `npm run check`（build + 19 条路由冒烟）、`DESIGN_SYSTEM.md §13` 迁移差距标注：P2-4 / P2-5。

### 本轮改动文件

- 新增：`components/im/{ImIcon,ImButton,ImField}.vue`、`assets/icons/im/*.svg`（40）+ `README.md`、`styles/im.css` 语义变量段。
- 重写：`components/im/{ImEmpty,ImNavBar,ImSheet}.vue`、`styles/im.css`。
- 修改：`components/im/{ImBubble,ImComposer,ImPicker}.vue`、`views/Message.vue`、`views/message/*.vue`（8）、`im/ui.ts`、`im/selectors.ts`、`im/data/{people,contacts,services}.ts`。
- 治理：`harness/tasks/CURRENT.md`（本记录）；工作目录审计脚本与方案文档（非工程）。
- **未提交 / 未推送 / 未部署**；`src/prototype/` 仍属 untracked 文件组，需显式 `git add` 才能纳入版本跟踪。

