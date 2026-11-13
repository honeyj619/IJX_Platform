# 已归档：P0 治理归一与基线登记（Harness 迁入权威工程 + 消息基线登记）

> 2026-11-13 Harness 治理整改：从 tasks/CURRENT.md 原样迁入，仅作历史记录，不再作为当前任务依据。

## P0 治理归一与基线登记（2026-11-11，已归档）

### 基本信息

| 项 | 内容 |
| --- | --- |
| 任务名称 | Harness 治理域迁入权威工程 + 消息结构化基线 / 业务口径登记（P0-1 ~ P0-4） |
| 依据 | 用户 2026-11-11 决策：Q1=A、Q2=只记结构（本轮确认「可以」）、Q3=写入、Q4=确认、Q5=统一「暂未开放」；方案 `Vue消息模块-Harness验收差距与改造方案.md` |
| 依据顺序 | 用户当前任务明确要求 > `REFERENCE_BASELINES.md` 结构性基线 + `spec-*` > 长期 Harness > 当前实现 |
| 状态 | P0 已执行（本轮不改任何产品代码 / 样式 / 路由）；**P1 / P2 已于 2026-11-11 后续轮次执行，见本文件顶部 P2 与 §11 P1 记录** |
| 参考基线 | 消息页＝「§2 结构性基线清单 + `spec-button` / `spec-navbar` / `spec-empty` / `spec-colors` / `spec-field` / `spec-typography`」；**不引用 `page-message.jpg`**（Q2） |
| 技术边界 | 继续 Vue 3 + Vue Router + Vite；`zustand/vanilla + persist` 保留（Q4）；不新增组件库、后端、远程资源 |

### 本轮目标与范围

1. **P0-1**：把 `AGENTS.md` + 5 份 `docs/*.md` + 12 张 `docs/references/` + `tasks/CURRENT.md` 从 `IJX_App` 迁入本目录；`AGENTS.md §0` 声明适用域；仓库根 `Agents.md` 加指向。
2. **P0-2**：`REFERENCE_BASELINES.md` 登记消息结构性基线，删除旧「视觉待补充 / 不得升级为正式基线」结论；`PRODUCT.md §3` 消息行改为结构性基线。不新增任何截图。
3. **P0-3**：`PRODUCT.md §4` 写入消息分类 / 已读规则 / 详情行为 / Q5 口径，`§8` 同步实现状态，`§3` 登记 14 条消息路径；本文件登记冒烟清单与 Q4 决策。
4. **P0-4**：`IJX_App` 的 `PRODUCT.md §8` / `CURRENT.md` 加「权威实现已迁出」指向。

### 路由冒烟清单（P0 仅登记，等价 `npm run check` 脚本待 P2-4 落地）

一级入口 5 条：`/`、`/schedule`、`/workspace`、`/message`、`/profile`。

消息二级 14 条（子应用内路径，线上前缀 `/app/prototype/`）：

| # | 路径 | # | 路径 |
| --- | --- | --- | --- |
| 1 | `/message/search` | 8 | `/message/group/:groupId` |
| 2 | `/message/chat/:sessionId` | 9 | `/message/scan` |
| 3 | `/message/info/:sessionId` | 10 | `/message/pins/:sessionId` |
| 4 | `/message/history/:sessionId` | 11 | `/message/topic/:topicId` |
| 5 | `/message/contacts` | 12 | `/message/receipt/:sessionId/:msgId` |
| 6 | `/message/contact/:contactId` | 13 | `/message/service/:accountId` |
| 7 | `/message/group/create` | 14 | `/message/:pathMatch(.*)*` → `/message` |

验收视口：360（主）/ 375 / 480px。主演示路径：下载页 iOS / 安卓 → `/app/prototype/` → 底部「消息」→ 筛选 → 会话 → 发送与撤回 → 返回列表预览同步。

### 任务级技术决策登记（Q4，按 AGENTS.md §2）

| 要素 | 内容 |
| --- | --- |
| 决策 | 保留 `zustand/vanilla + persist` 作为消息模块状态层，不退回 Vue 原生 `reactive` |
| 来源 | 跨 8 个消息页面共享会话 / 消息 / 群 / 草稿状态，且需刷新恢复与页面间实时同步 |
| 适用范围 | **仅** `src/prototype/im/`（`store.ts` / `selectors.ts` / `data/`），不影响一级页面与 React 主工程 |
| 已落代码 | **是** —— `src/prototype/im/store.ts`，`createStore` + `persist`（key `ijx-vue-im-store-v1`，`version` / `migrate` / `partialize`），`useImState()` 提供 Vue 响应式订阅 |
| 级别 | 任务级决策，**不升级为长期 Harness 规则**（用户 2026-11-11 确认 Q4） |

### 产品口径登记（Q5，用户 2026-11-11 确认）

通话 / 扫一扫 / 员工服务后端 / 消息应用真实菜单等未接真实能力的入口**统一标注「暂未开放」**，不保留 Mock 演示流程作为完成状态。该口径已写入 `PRODUCT.md §4`；**页面标识改造属 P2-1，本轮 P0 未改代码**，实施前页面仍显示「演示」文案，不得据此宣称 C4 已关闭。

### 验收标准与非目标

- 文档一致性检查通过；12 张参考图字节一致；`git diff --check` 退出 0；不破坏两仓库既有未提交改动。
- **非目标**：不改产品代码 / 样式 / 路由 / 构建配置；不新增 `page-message*` 截图；不改回 `IJX_App`；不执行 P1 / P2；不提交 / 推送 / 部署。

### 影响文件

- 迁入（新建）：`src/prototype/harness/AGENTS.md`、`docs/*.md`（5）、`docs/references/*`（12）、`tasks/CURRENT.md`。
- 修改（权威工程）：`harness/AGENTS.md`、`harness/docs/{PRODUCT,REFERENCE_BASELINES}.md`、`harness/tasks/CURRENT.md`、仓库根 `Agents.md`。
- 修改（历史仓库，仅加说明）：`IJX_App/docs/PRODUCT.md`、`IJX_App/tasks/CURRENT.md`。

### Harness 更新情况（AGENTS.md §8）

本轮**更新长期 Harness**：`AGENTS.md`（适用域 §0）、`PRODUCT.md`（§3 / §4 / §8 / §11）、`REFERENCE_BASELINES.md`（§2 / §3 / §4）、`CURRENT.md`（本记录）。来源均为用户 2026-11-11 明确决策 Q1–Q5。待确认项：无（Q1–Q5 已闭环）；P1 / P2 为待实施差距，非待确认推断。

### Git 状态

**未提交、未推送、未部署**；两仓库既有未提交 WIP 均保留未覆盖。

---

