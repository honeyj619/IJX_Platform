# 已归档：P2 状态闭环、工程口径与文档同步

> 2026-11-13 Harness 治理整改：从 tasks/CURRENT.md 原样迁入，仅作历史记录，不再作为当前任务依据。

## P2 状态闭环、工程口径与文档同步（2026-11-11 22:20，当前轮）

### 基本信息

| 项 | 内容 |
| --- | --- |
| 任务名称 | 消息模块 P2-1 ~ P2-5 实施（状态矩阵 / 一键重置 / 空态下一步 / 工程验收对齐 / 文档同步） |
| 依据 | 用户 2026-11-11 决策 Q1–Q5；方案 `Vue消息模块-Harness验收差距与改造方案.md` §5 P2、§6 验收标准 |
| 状态 | **已执行并通过验证**；不改 React 主工程路由与 `Download.tsx` 落地链路；**未提交 / 未推送 / 未部署** |
| 参考基线 | 消息页＝「结构性基线清单 + `spec-*`」；不新增 `page-message*`（Q2） |
| 技术边界 | Vue 3 + Vue Router + Vite；保留 `zustand/vanilla + persist`（Q4）；不新增组件库 / 后端 / 远程资源 |

### 逐项落点

| 项 | 实际改动 |
| --- | --- |
| **P2-1 状态矩阵（C2 / H4d）** | 新增 `im/task.ts`（`showBusy` / `showError` / `runTask` / `useImTask`）；`ImButton` 加 `loading`（spinner + 行为禁用 + `aria-busy`）；`im.css` 加 `.im-busy` / `.im-task-error` / `.im-btn__spinner` / reduced-motion 降级。发送、建群、发布公告、保存群名、清空、置顶清空、投票 / 接龙 / 话题 / 转发 / 通话记录 / 名片 / 添加成员、话题回复等写操作统一「处理中 → 结果 / 错误」；错误经 `ImField.error` 就近说明（群名为空为可复现错误路径）。原型无后端，store 写入保持同步、BUSY_MS=180ms，既有 e2e 时序不受影响。`Contacts.vue` / `History.vue` / `ImSheet.vue` 无核心写操作（仅跳转 / 只读 / 关闭），保留原即时反馈，不计入接线范围 |
| **P2-1 Q5 统一「暂未开放」（C4）** | 扫一扫页、通话面板、联系人语音 / 视频、服务咨询入口、应用菜单 URL 分支、群文件真实存储均加「暂未开放」标识；原型流程示例保留但明确「不代表功能已开放」；移除「扫描完成」「已生成通话记录」「演示链接：」「通话演示」等完成态表述。**保留流程本身**（方案 §7 不重写已验证业务功能，且既有 32/32 + 23/23 回归依赖该流程），仅把主标识改为「暂未开放」——此取舍已登记，不宣称已删除 Mock 流程 |
| **P2-2 一键重置（D1 / H6）** | `Message.vue` 「+」菜单与 `SessionInfo.vue` 设置页均新增可见「恢复演示数据」→ `confirmBox` 二次确认 → `resetDemoData()` → 回列表 / 刷新初始数据 |
| **P2-3 空态下一步（D2）** | `Search.vue` 无结果「清空搜索条件」、初始「开始搜索」；`Message.vue` 筛选空态「查看全部会话」/「发起新会话」；`GroupCreate.vue`「清空搜索」；`GroupDetail.vue` 群文件空态「上传演示文件」 |
| **P2-4 工程口径（F1）** | `package.json`：`check` = `check:types`（`tsc -b --noEmit`）+ `check:build`（`vite build --outDir node_modules/.prototype-check-dist`）+ `check:pages`；新增 `tools/prototype/smoke-pages.mjs`，覆盖 5 个一级入口 + 14 条消息子路由，单条 PASS 需 HTTP 200 / 应用外壳 / 路由声明进入构建产物 / 入口资源可读 |
| **P2-4 Q4 复核** | 任务级技术决策三要素仍齐备：来源＝跨 8 页状态同步与刷新恢复；适用范围＝仅 `src/prototype/im/`；已落代码＝`im/store.ts`（`ijx-vue-im-store-v1` + version/migrate/partialize）。**不升级为长期 Harness 规则** |
| **P2-5 文档同步** | `DESIGN_SYSTEM.md §13` 追加「消息模块已处理的迁移差距」范围声明；`PRODUCT.md §4 / §8` 登记 Q5 代码落地与 P1/P2 状态；本文件记录验证证据与 Harness 更新；方案文档补 §12 P2 执行记录 |

### 验证证据（2026-11-11 22:20 实测）

| 检查 | 结果 |
| --- | --- |
| `npm run check`（类型 + 构建 + 冒烟） | 退出 **0**；`Page smoke check: 19/19 routes passed`；5 个入口资源可读 |
| `harness-im-audit.cjs`（H4d / H6 由 PENDING 改为真实断言） | **27 / 27 PASS**，PENDING(P2)=0；第三方 host 0、console error 0 |
| `harness-p2-audit.cjs`（本轮新增 P2 专项） | **26 / 26 PASS**，0 console error / 0 第三方 / 0 alert；覆盖状态矩阵 / 错误态 / 重置闭环 / 空态 / Q5 / 工程口径 / 文档 / 三视口 |
| `verify-vue-im.cjs` / `verify-vue-im-flows.cjs` / `verify-download-chain.cjs` | **32/32** / **23/23** / **10/10**，均 0 error |
| `harness-p1-audit.cjs`（P1 回归） | 见 §11；本轮未改 P1 断言口径 |
| 视觉 | 360px 主验收截图 `harness-p2-360-message.png`；三视口 360/375/480 无横向溢出；按 Q2 对照「结构性基线 + `spec-*`」，未新增 `page-message*` |
| `git diff --check` | 两仓库退出 0 |

### Harness 更新情况（AGENTS.md §8）

本轮**更新长期 Harness**：`docs/DESIGN_SYSTEM.md`（§13 消息模块迁移差距表 + 范围声明）、`docs/PRODUCT.md`（§4 Q5 代码落地、§8 实现状态）、`tasks/CURRENT.md`（本记录）。`AGENTS.md` / `REFERENCE_BASELINES.md` / `PROTOTYPE_RULES.md` / `ADMIN_SYSTEM.md` 本轮未改，P0 登记的 Q1–Q5 口径保持不变。待确认项：**无**（Q1–Q5 已闭环）；剩余为已知限制而非待确认推断（见下）。

### 已知限制与未验证项

- 占位图标集、160px 空态插图、圆角候选值仍待正式素材 / 截图验收后替换或转正（P1 已登记）。
- Q5 采用「统一标识 + 移除完成态表述」而非删除 Mock 流程，保留已验证的原型示例路径；若产品要求彻底下线示例流程，需另开任务并同步调整 32/32 + 23/23 回归。
- 未覆盖：iOS 真机、实机键盘弹出、深色模式、`spec-*` 按压 / 禁用像素级对照、真实后端错误码分支。
- `src/prototype/`（含本轮新增 `im/task.ts` 与图标资产）仍为 **untracked 文件组**，需显式 `git add` 才纳入版本跟踪；本轮**未提交 / 未推送 / 未部署**。

---

