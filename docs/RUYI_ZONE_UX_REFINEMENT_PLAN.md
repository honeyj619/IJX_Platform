# 如意空间改造开发方案

> 版本：v1.0（2026-11-26）
> 范围：`/pc_client/ruyi-zone` 及其子页面、侧栏、AI 成果中心、三大工作台回流链路
> 状态：待评审，评审通过后按批次实施

## 一、需求映射总表

| # | 需求 | 结论 |
|---|------|------|
| 1 | 新对话 / 切换智能体 = 新开聊天窗口；有真实对话才记录历史 | 引入「草稿会话」概念 |
| 2 | AI 任务入口去掉；AI 成果状态只剩 已完成/已删除 | 移除任务中心入口与页面，收敛成果状态 |
| 3 | ~~来源对话追溯~~ | **已取消**：前端原型中成果与会话本就一一对应（`RuyiResultReference.conversationId`），无需新增 session 概念 |
| 4 | AI 成果改为纯列表；打开成果不跳工作台，提供 下载/预览 | 重做成果中心 + 会话内成果卡 |
| 5 | 历史会话列表：其他智能体对话加标识 | 会话项增加智能体徽标 |
| 6 | 工作台类场景：对话框进工作台 → 生成 → 回对话展示参数/模板/大纲/生成物；回对话后不出工具栏；重新生成展开工具 UI | 参数快照回流 + 回流卡片组 |
| 8 | 历史对话：纯对话可再选工具；用过工具的会话工具锁死，换工具只能新建对话 | 会话工具锁定规则 |

## 二、现状摘要（与方案的差距）

- **新对话**：`handleNewConversation`（RuYiZone.tsx）点击即 `store.createConversation()` 落库，空会话也进历史列表。
- **切换智能体**：`selectCapability` 在**当前会话内**写入一条 system 消息并改 `activeCapabilityId`，不新开会话。
- **AI 任务**：侧栏双入口「AI 任务 / AI 成果」，任务中心 `/ruyi-zone/tasks`、任务详情 `/ruyi-zone/tasks/:id` 独立页面。
- **成果状态**：`RuyiResultStatus = 'editable' | 'completed' | 'invalid' | 'forbidden'`，成果中心有 5 个状态筛选；「打开成果」`navigate(result.workbenchHref)` 直接跳工作台。
- **智能体标识**：会话列表项只有任务/成果角标，无智能体标识。
- **工具切换**：会话内任意时刻可切换插件（公文/PPT/参谋/翻译），无锁定。

## 三、逐项方案

### 1. 新开聊天窗口（点击新对话 / 切换智能体）+ 草稿会话

**目标交互**
- 点击「新对话」：进入一个**草稿聊天视图**（有会话 URL，但不落库），界面与正常会话一致。
- 切换智能体：**总是新开一个聊天窗口**（草稿态，激活对应智能体），不再在当前会话内切换。
- 只有草稿会话发生**第一条真实消息**（用户发送 / 能力提交）时，才真正 `createConversation` 落库并进入历史列表。

**实现要点**
- 新增 store 方法 `ensureConversation(draft)`：草稿态发首条消息时一次性创建。
- 草稿会话 URL 使用固定路由 `/pc_client/ruyi-zone/draft`（可带 `?agent=iknow` / `?capability=document` 参数表达预选智能体/工具），刷新后重置为空白草稿。
- `handleNewConversation`：不再 `createConversation`，改为 `navigate('/pc_client/ruyi-zone/draft')`。
- `onSelectAgent`：改为 `navigate('/pc_client/ruyi-zone/draft?agent=xxx')`；若当前已在草稿且无任何输入，则原地切换 agent 参数，不叠加新草稿。
- 发送链路（`useRuyiSend` / `handleSubmitCapability` / `handleHomeSend` / `handleQuickPromptSend`）统一改造：目标是草稿路由时，先 `ensureConversation` 再发送，随后 `replace` 到真实会话 URL。
- 历史列表渲染过滤条件不变（落库即显示），天然满足"有真实对话才记录"。
- 兼容：`/ruyi-zone` 根路径默认打开最近预置会话的逻辑保留。

**涉及文件**：`RuYiZone.tsx`、`ruyiStore.ts`、`useRuyiSend.ts`、`App.tsx`（新增 draft 路由）、`RuyiConversationSidebar.tsx`（新对话/智能体按钮回调）。

### 2. AI 任务入口去掉；AI 成果状态收敛

**AI 任务**
- 侧栏移除「AI 任务」入口按钮（`onOpenTasks`、`activeNav === 'tasks'` 分支）。
- 移除路由 `/ruyi-zone/tasks`、`/ruyi-zone/tasks/:id` 及 `RuYiTaskCenter.tsx`、`RuyiTaskDetail.tsx`、`RuyiTaskEmptyState.tsx`、`RuyiTaskTimeline.tsx`、`RuyiTaskStatusBadge.tsx`、`RuyiTaskListItem.tsx` 等纯任务页组件；消息动作 `open-task-center`、`open-task`、`select-task` 相关分支同步删除或改为 no-op。
- 会话内仍含会议创建等任务流程（任务数据结构保留），只是不再有独立任务中心页面；消息里的任务入口卡改为在会话内完成。
- 侧栏「含进行中任务」筛选、任务角标同步移除。

**AI 成果状态**
- `RuyiResultStatus` 收敛为 `'completed' | 'deleted'`：
  - 生成完成 → `completed`；
  - 用户删除成果 → `deleted`（软删，列表默认不展示，可留「已删除」筛选查看）。
- 移除 `editable / invalid / forbidden`：`canOpenRuyiResult` 简化为 `status === 'completed'`；`ruyiResultPresentation.ts` 的展示文案函数同步精简。
- 成果中心状态筛选只剩：全部 / 已完成 / 已删除。
- 持久化迁移：`recordWorkbenchResult` 及 seed 数据默认写 `completed`；读取旧数据时 `editable → completed`，`invalid/forbidden → deleted`（在 store hydrate 处做一次性映射，bump `schemaVersion`）。

**涉及文件**：`types/ruyi.ts`、`ruyiStore.ts`、`RuyiResultCenter.tsx`、`ruyiResultPresentation.ts`、`RuyiConversationSidebar.tsx`、`RuYiZone.tsx`、`App.tsx`、`ruyiMockRuntime.ts`（去掉任务中心相关消息构造）。

### 3. 来源对话追溯（已取消）

- 原设想「后续新增 session 追溯历史生成物」，经确认**不再需要**：前端原型中成果与会话一一对应，现有 `RuyiResultReference.conversationId` 关联已足够。
- 成果中心保留现有「来源会话」链接与会话删除后的「来源会话已删除」展示逻辑，不新增字段、不做改动。

### 4. AI 成果交互改版：纯列表 + 下载/预览

**目标交互**
- 成果中心就是一张**成果列表**：图标 + 标题 + 类型 + 状态 + 创建时间，每行操作只有「预览」「下载」「删除」。
- 「打开成果」不再跳工作台（删除 `workbenchHref` 导航路径；字段保留仅供会话内重新生成定位使用）。
- 预览：弹框（Modal，按 `docs/CLIENT_INTERACTION_SURFACES.md` 属确认/查看类）内渲染只读预览——公文/PPT 用现有静态内容渲染，翻译展示双语对照文本，汇报展示摘要卡。
- 下载：按成果类型下载对应文件（公文 → .docx 占位、PPT → .pptx 占位、翻译/汇报 → .txt/.md）。原型阶段用 mock 内容生成 Blob 下载即可。
- 删除：确认弹框后置 `status: 'deleted'`。
- 会话内 `RuyiResultCard` 同步改：去掉「打开工作台」按钮，改为「预览 / 下载」两个轻操作。

**涉及文件**：`RuyiResultCenter.tsx`（重写列表）、`RuyiResultCard.tsx`、新增 `utils/ruyiResultDownload.ts`（Blob 下载）、复用现有预览渲染组件。

### 5. 历史会话列表智能体标识

- 会话项标题旁增加**智能体徽标**：`activeCapabilityId`（兜底 `lastCapabilityId`）映射到 agent（`iknow` → iKnow、`hr-xiaofu` → 人力小福）时展示对应名称/图标；如意助手默认对话不展示徽标。
- 数据已有（`RuyiConversation.activeCapabilityId/lastCapabilityId`），仅改 `RuyiConversationSidebar.tsx` 列表项渲染；无新字段。
- 徽标使用 capability 图标（BookOpen / Users），文案「iKnow」「人力小福」，`title` 提示"由 XX 智能体处理"。

### 6. 工作台类场景完整链路（公文 / PPT / 参谋师 / 文档翻译）

**目标流程**
1. 对话框点击功能（插件入口）→ 提交参数 → **进入工作台**（现有直达逻辑保留）。
2. 工作台内生成过程与 web 端一致（本期不改工作台内部交互）。
3. 生成完成后点「返回对话」→ 回到对话页。
4. 对话页此时展示：**用户选择的参数摘要卡 + 模板/大纲卡 + 最终生成物卡片**（依次排列，作为新的对话消息组）。
5. **回到对话后不展示工具选择栏**；可以继续普通对话。
6. 点「重新生成」→ 展开该工具的输入 UI（预填上次参数）进行重新生成。

**实现要点**
- **生成快照**：`useWorkbenchResultBridge.recordResult` 扩展为 `recordResult(payload)`，payload 除标题外携带：
  ```ts
  interface WorkbenchGenerationSnapshot {
    paramsSummary: Array<{ label: string; value: string }>; // 用户确认的参数
    template?: { name: string };                            // PPT 模板 / 公文文种
    outline?: string[];                                     // 大纲条目
    resultTitle: string;
    resultType: RuyiResultType;
    contentPreview?: string;                                // 预览/下载用的正文快照
  }
  ```
  挂到新增消息类型 `kind: 'generation-summary'`（user 提交消息之后的一组 assistant 消息：参数卡、大纲卡、成果卡），并冗余存到 `RuyiResultReference.snapshot`。
- 三大工作台在生成完成处采集各自参数/模板/大纲传入 bridge（DocumentEditor / PresentationWorkbench / AdvisorWorkbench 各改生成完成回调；翻译走 translation 面板对应对话流，另用消息快照）。
- **工具栏隐藏**：回流后该会话 `activeCapabilityId` 仍为该工具（锁定，见第 8 项），但**输入区不渲染插件面板/工具选择栏**，仅普通输入框 + 「重新生成」入口（放在最近一条生成物卡片上）。
- **重新生成**：点击成果卡「重新生成」→ `selectCapability` 视图层面重新展开该工具输入面板（预填 `snapshot.paramsSummary` 对应草稿），提交后再次进工作台，流程同上，旧生成物保留、新成果追加。
- 消息动作类型新增 `regenerate-with-tool`。

**涉及文件**：`types/ruyi.ts`（快照类型 + 消息 kind）、`useWorkbenchResultBridge.ts`、`DocumentEditor.tsx` / `PresentationWorkbench.tsx` / `AdvisorWorkbench.tsx`（采集快照）、`RuYiZone.tsx`（渲染 generation-summary 消息组、重新生成动作）、`RuyiMessageRenderer.tsx`、`RuyiConversationComposer.tsx`（锁定态工具栏隐藏）、`ruyiMockRuntime.ts`。

### 8. 历史对话工具规则（纯对话可选工具；用过工具则锁死）

**规则定义**
- 会话级状态推导：`hasUsedTool = 会话内存在 capabilitySubmission（或 generation-summary 消息）`。
- **纯对话会话**（从未使用工具）：打开后可正常选择工具（公文 / PPT / 参谋 / 翻译），行为同现状。
- **已使用工具的会话**：`activeCapabilityId` 固定为已用工具：
  - 输入区工具选择栏不展示（或置灰），仅普通对话；
  - 唯一出口：成果卡「重新生成」展开该工具 UI（第 6 项）；
  - **切换工具的唯一方式 = 新建对话**（回到第 1 项的新对话草稿窗口）。
- `selectCapability` 加锁：`hasUsedTool` 的会话拒绝切换到其他 capability（store 层校验，防 UI 绕过）。
- seed / showcase 预置对话按此规则标注（工具会话锁定、问答会话开放）。

**涉及文件**：`ruyiStore.ts`（selectCapability 锁校验 + `hasConversationUsedTool` 派生）、`RuYiZone.tsx`（工具栏渲染条件）、`RuyiPluginBar.tsx` / `RuyiConversationComposer.tsx`。

## 四、实施批次建议

| 批次 | 内容 | 依赖 |
|------|------|------|
| P0-1 | #1 草稿会话 + 新对话/切换智能体新开窗口 | 无 |
| P0-2 | #8 工具锁定规则 + #6 的工具栏隐藏与重新生成入口 | P0-1（新建对话出口） |
| P1-1 | #2 AI 任务入口移除 + 成果状态收敛 + 数据迁移 | 无（与 P0 并行可） |
| P1-2 | #4 成果中心改版（列表 + 预览/下载/删除）+ 会话内成果卡改版 | P1-1 |
| P1-3 | #5 会话列表智能体徽标 | 无 |
| P2 | #6 完整生成快照回流（参数/模板/大纲卡） | P0-2 |

每批次独立可验收：改完跑 `npm.cmd run build` + 预览自查，批次间不互相夹带。

## 五、验收要点清单

1. 新对话：点击后 URL 进 draft，历史列表**无新增**；发送首条消息后列表出现该会话。
2. 切换智能体：总是打开新窗口；当前会话不再被改写 `activeCapabilityId`。
3. 侧栏无「AI 任务」入口；`/ruyi-zone/tasks` 路由移除或重定向。
4. 成果状态只剩 已完成/已删除；旧持久化数据打开后无「可编辑/已失效/无权限」字样。
5. 成果中心：点击成果不跳工作台；预览弹框可看、下载可得文件、删除需确认。
6. 会话列表：iKnow / 人力小福会话带徽标，如意助手会话无徽标。
7. 工作台回流：回到对话后可见 参数卡 → 模板/大纲卡 → 成果卡；无工具选择栏；「重新生成」展开对应工具 UI 且预填参数。
8. 工具锁定：用过工具的会话无法切换其他工具；纯对话会话可自由选工具。
9. demo 场景（`?demo=`）与 showcase 预置会话在新规则下不破（草稿路由透传 demo 参数、预置会话锁定态正确）。
10. 全程无乱码、无编译错误、消息对话滚动置底原则不受影响。

## 六、风险与注意事项

- **持久化迁移**：成果状态映射、`schemaVersion` bump 需一次性处理，避免老用户 localStorage 出现非法状态值。
- **消息动作兼容**：`open-result` / `open-workbench` / `open-task-center` 等动作类型有消息 seed 依赖，删除时保留类型定义（渲染层 no-op）比硬删更稳。
- **PC 消息页如意助手（固定系统会话）**：共享同一 store 与发送链路，草稿会话机制不得影响 `FIXED_SYSTEM_CONVERSATION_ID` 的连续性。
- **演示场景**：`ruyiDemoScenarios` fixture 中任务中心、成果状态相关断言需同步更新（`tools/prototype/verify-requirement-mode.mjs` 等）。
- **工作台内部交互**：本方案不改工作台生成流程本身，只改入口、回流与对话侧展示，控制改动半径。
