# 当前任务

## 基本信息

- 任务名称：如意助手 WorkBuddy 返工（直展示+消息三层+契约）
- 提出日期：2026-11-18（V3.5 验收返工）
- 任务类型：前端原型功能改造（依据《RUYI_CONVERSATION_HISTORY_AND_SCENARIO_RETENTION_PLAN.md》修订版）
- 目标用户/评审对象：产品、设计及后续执行任务的 AI

## 范围（修订版原则：能力做成默认可见的对话内容，不藏在待触发的交互里）

1. PC「消息－如意助手」打开即显示完整能力示例对话（无欢迎页、无 history 参数）。
2. 如意空间直接展示 13 条按场景预置的完整对话；`/ruyi-zone` 默认打开最近预置会话。
3. 「新对话」创建真实空白会话进入空状态（复用快捷能力与输入区）。
4. 操作卡片复用 codex 目录的 `BusinessMessageCard` 三件套（IM compact / 空间完整布局）。
5. 撤除上一轮 history/场景快照体系（ruyiInteractionCatalog / ruyiScenarioStorage / useRuyiDemoScenario / im-history 场景 / 快照 actions）。

不修改 App 子应用、后端与部署；不建第二套 store 或卡片。

## 完成项

- [x] 撤旧：删除 `ruyiInteractionCatalog.ts` / `ruyiScenarioStorage.ts` / `useRuyiDemoScenario.ts`；store 撤快照 actions/订阅器；RuYiZone/Home 回退 demo 生命周期（applyDemoScenario + 边界验收提示条）；types 撤 RuyiScenarioSnapshot/RuyiPersistedState/seedRevision
- [x] 收编 codex 卡片：`src/components/messages/BusinessMessageCard.tsx` + `src/types/businessMessageCard.ts` + `src/data/businessMessageCards.ts`（五类卡）+ 新增 `itServiceMessageCard`（notice 类）；`RuyiMessage.businessCard` 字段；RuyiMessageRenderer（完整）/RuyiImMessageList（compact）卡片渲染分支；mockRuntime 待办/考勤/中断分支挂卡
- [x] `src/data/ruyiShowcaseConversations.ts`：IM 固定会话综合对话（五类卡片 + 会议任务 completed 全链路 + 周报工作台入口）+ 空间 13 场景（查询×5/翻译/会议/创作×3/IT/任务恢复含失败重试/成果权限×3 状态）；稳定 ID（showcase-*）；`DEFAULT_RUYI_SHOWCASE_CONVERSATION_ID`
- [x] store：`createInitialState` 用 showcase seed；`SHOWCASE_SEED_VERSION=1` + `showcaseSeedVersion` 持久化 + `mergeRuyiShowcaseSeed` 保留式合并（旧欢迎语替换/用户数据保留/预置置前只合并一次/场景补缺）
- [x] `RuYiZone.tsx`：根路径默认打开预置会话（被删则最近会话，全无则新建空白）；`handleNewConversation` 创建真实空白会话；空会话复用 RuyiAssistantHome 内容区
- [x] `Home.tsx`：助手项删除 272 行旧静态 chatMessages（预览由共享 store 同步）
- [x] action 完成态：`RuyiMessageAction.disabled/completedLabel`；Renderer/IM 列表/确认卡按钮渲染"已确认/已重试"禁用态
- [x] 需求：`ruyi-im-capability-showcase`（order 2）/ `ruyi-scenario-conversation-showcase`（order 6）；删 `ruyi-im-history-retention`；锚点同步

## V3.5 返工完成项（验收返工）

- [x] `RuyiMessageToolbar`：通用功能条（复制/有用/没用/重新生成）常驻每条完成态助手回复，不依赖 message.actions；锚点 `ruyi-response-feedback` 移至该组件
- [x] `RuyiMessageBusinessActions`：业务动作独立渲染 + 契约校验（open-result 需 resultId / open-workbench 需 workbenchPath / open-route 需 href；不满足隐藏不渲染废按钮）
- [x] 新增 `open-route` action 类型（payload.href 限 /pc_client 内部路由）；RuYiZone/Home 处理导航
- [x] 契约清理：流程/知识/运营/IT 消息全卡片化（删"查看流程中心/知识库/运营看板/服务台"无效按钮与重复 CTA）；新增 `operationsMessageCard`；compact 指标 2×2
- [x] 创作需求确认挂工作台入口卡（BusinessMessageCard 扩 workbench category）；IM 周报入口同步
- [x] IT 实体优先于反馈意图（Home：VPN/网络/设备/账号锁等先走 IT 服务）
- [x] Layout `isRuyiZoneInternalPath`：如意空间会话/任务/成果不进"打开的页面"；工作台仍记录
- [x] 滚动修复：会话切换顶部开始；接近底部才自动滚底（RuYiConversationView 滚动容器 ref；IM 首载置顶）
- [x] `scan-orders.mjs`：CRLF 归一 + 0 条硬失败（49 条真实解析）
- [x] Harness：Agents.md 打开页面规则（如意空间）；UI_DESIGN_GUIDELINES 卡片判定/映射/功能条/布局；专项方案 V3.5 章节
- [x] 需求更新：ruyi-response-feedback（功能条常驻）/ ruyi-im-continuity（不新增打开页面）
- [x] `tools/ruyi/validate-showcase-data.mjs` 静态断言（ID 稳定/场景齐全/卡片引用）

## 验收地址

| 目标 | 地址/步骤 |
| --- | --- |
| IM 直展示 | `/pc_client` 默认选中如意助手，查看完整对话（五类卡片+会议+周报） |
| 双端一致 | IM 点「前往如意空间」核对同一会话 ID 与消息顺序 |
| 空间默认打开 | `/pc_client/ruyi-zone` 自动进入 `showcase-work-approval` |
| 13 场景 | 左侧历史列表逐条点击核对正文与卡片 |
| 新对话空态 | 左侧「新对话」→ 空白会话 + 快捷能力 + 发送自动命名 |
| 旧数据迁移 | 带旧 localStorage 打开（欢迎语被综合对话替换，用户数据保留） |
| 边界 fixture | `?demo=result-states` / `failure-states` / `v2-multi-task` / `v2-cross-day-resume` 回归 |

## 存储 Key

- 普通数据：`ijx-ruyi-prototype-v1`（schema 3 + showcaseSeedVersion 1；预置与用户数据同库留存）

## 实际验证结果

- `npm.cmd run check`：通过（21 页 smoke 全绿；app-chain 基线 18/20 为通讯录导航既有问题）
- `node tools/requirements/scan-orders.mjs`：ALL OK（消息·如意助手 [1,2]；如意空间会话 [1..6]）
- `git diff --check`：干净
- `npm.cmd run build`：通过
- 浏览器回归（127.0.0.1:5177）：`.workbuddy/scripts/verify-ruyi-showcase-v34.cjs` 覆盖 §13 验收（无交互直展示/五类卡片/任务链路/成果回流/默认打开/新对话空态/旧数据迁移/删除不复活/demo 回归）；控制台零 error

## 未覆盖风险

- 预置会话被用户删除后，`SHOWCASE_SEED_VERSION` 升级时会重新补入（无 tombstone 追踪；原型阶段以版本门控为准）
- 卡片跳转目标页为既有路由，本轮未做目标页内容核对
