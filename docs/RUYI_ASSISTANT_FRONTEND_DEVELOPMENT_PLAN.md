# 如意助手与如意空间前端原型开发方案

> 文档状态：可执行开发方案  
> 编写日期：2026-11-06  
> 当前交付版本：V1（2026 年 12 月目标原型）  
> 后续预留版本：V2（2027 年 3 月目标原型）  
> 产品基线：`docs/RUYI_ASSISTANT_PROTOTYPE_REDESIGN_PLAN.md`  
> 后端边界：`docs/RUYI_ASSISTANT_BACKEND_REQUIREMENTS.md`

## 1. 开发目标与交付边界

本任务只建设 React 前端产品原型，通过确定性 mock 数据和前端状态机演示完整产品行为，不接入真实模型、ADP、MCP、企业接口或跨端服务。

当前开发交付必须完成 V1：

1. 如意助手与如意空间统一入口和统一对话主页。
2. 会话新建、查看、重命名、删除及刷新保留。
3. 现有专业能力按统一交互契约接入对话。
4. 公文、PPT、参谋师工作台与来源会话、成果卡片互通。
5. “创建会议/日程”单任务补参和中断恢复 POC。
6. PC 消息中的如意助手复用统一 mock 会话数据。
7. 功能规则、场景触发方式和页面锚点进入需求模式。

V2 只预留类型、路由规划和扩展点，不在 V1 页面中展示未完成的“AI 任务”“AI 成果”入口。

### 1.1 禁止扩展

- 不恢复已删除的 `src/pages/app/**`，不修改 `src/data/im/**`、`src/store/imStore.ts` 及 App 路由。
- 不实现真实登录、多用户认证、服务端权限、流式接口或后台任务。
- 不新增完整 Agent Team、Connector/MCP、模型或知识库管理页面。
- 不把 AI 任务中心做成现有事项、项目、日程或审批数据的聚合页。
- 不迁移公文、PPT、汇报源文件，不重写专业工作台内部流程。
- 不修改部署、GitHub Actions、远端配置、构建产物和 `node_modules`。
- 不自动提交、推送或发布。

## 2. 当前实现与改造原则

### 2.1 当前实现问题

- `RuYiZone.tsx` 同时包含首页、历史、意图正则、消息回复、公文/PPT配置和工作台切换，文件体积过大。
- 历史会话为固定数组，刷新后用户新输入和状态不会保留。
- `Home.tsx` 中的如意助手拥有另一套固定会话和消息类型，新输入主要只处理反馈意图。
- `/pc_client/assistant` 是第三套静态助手页面。
- 专业工作台只有返回行为，没有统一的来源会话和成果回流契约。
- 不同业务状态散落在页面局部 state，无法稳定演示删除、失效、失败和任务恢复场景。

### 2.2 改造原则

- **共享数据，不共享页面**：PC 消息和如意空间共享 store、会话、消息、成果索引；各自保留适合自身的布局和消息渲染。
- **确定性模拟，不伪装后端**：前端通过 mock 路由器和状态机生成固定结果；页面明确标注演示状态，不出现真实接口措辞。
- **先拆数据和行为，再调整视觉**：先建立类型、store、fixture、适配器，再替换现有页面局部数组和正则。
- **工作台保持独立**：对话只确认需求、展示状态和成果入口；结构化编辑仍进入公文、PPT、参谋师工作台。
- **V1 不提前建设 V2 页面**：V2 只在类型和 store 中留兼容字段，不渲染任务中心、成果中心。
- **小批次落地**：每批次完成独立检查，避免一次重写 `RuYiZone.tsx` 和 `Home.tsx`。

## 3. 路由与页面结构

### 3.1 V1 路由

| 路由 | 行为 |
| --- | --- |
| `/pc_client/ruyi-zone` | 进入统一主页；若存在最近会话，不自动打开，保持“新对话/能力发现”主页 |
| `/pc_client/ruyi-zone/conversations/:conversationId` | 打开指定会话；不存在时显示会话不存在状态并提供返回主页 |
| `/pc_client/ruyi-zone/document?sourceConversationId=...` | 公文工作台，关联来源会话 |
| `/pc_client/ruyi-zone/presentation?sourceConversationId=...` | PPT 工作台，关联来源会话 |
| `/pc_client/ruyi-zone/advisor?sourceConversationId=...` | 参谋师工作台，关联来源会话 |
| `/pc_client/assistant` | 使用 `<Navigate replace>` 重定向 `/pc_client/ruyi-zone` |

现有无 `sourceConversationId` 的工作台地址继续可用，按“独立打开、无来源会话”处理。

### 3.2 V2 预留路由

- `/pc_client/ruyi-zone/tasks`
- `/pc_client/ruyi-zone/tasks/:taskId`
- `/pc_client/ruyi-zone/results`

V1 不注册可访问页面、不显示菜单、不增加空壳页面。

### 3.3 如意空间布局

保持客户端“全局导航 + 单一主工作面”结构，主工作面内部为：

- 左侧栏 `280px`：新建对话、快捷能力、历史会话。
- 右侧内容区：主页或会话页。
- 左侧栏和内容区在同一个白色工作面内，以分割线连接，不暴露额外底面间隙。
- 会话头固定，消息流独立滚动，输入区固定在底部。
- 1024px 以下不重排为移动端，通过 `web-client-viewport` 横向滚动。

### 3.4 PC 消息适配

- `Home.tsx` 仍使用消息页三块结构。
- 仅替换“如意助手”系统会话的数据来源和发送行为。
- 普通联系人、群聊、会议卡片等现有消息功能不改。
- IM 中复杂成果使用紧凑结果消息；点击后进入如意空间或专业工作台。
- IM 不显示如意空间左侧能力栏、会话管理菜单或完整任务 POC 面板。

## 4. 前端数据模型

新增 `src/types/ruyi.ts`，统一声明下列类型。字段命名按本节执行，避免实现模型自行改名造成跨页面适配重复。

### 4.1 能力

```ts
export type RuyiCapabilityMode = 'qa' | 'instant' | 'creative' | 'transaction';

export interface RuyiCapability {
  id: 'work-query' | 'document' | 'presentation' | 'advisor' | 'translation' | 'it-service';
  name: string;
  shortDescription: string;
  promptPlaceholder: string;
  mode: RuyiCapabilityMode;
  producesResult: boolean;
  workbenchPath?: string;
}
```

### 4.2 会话与消息

```ts
export interface RuyiConversation {
  id: string;
  ownerId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  activeCapabilityId: RuyiCapability['id'] | null;
  lastCapabilityId: RuyiCapability['id'] | null;
  messageIds: string[];
  activeTaskId: string | null;
}

export type RuyiMessageKind =
  | 'text'
  | 'capability-status'
  | 'loading'
  | 'confirmation'
  | 'resume-task'
  | 'result'
  | 'error'
  | 'system';

export interface RuyiMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  kind: RuyiMessageKind;
  content: string;
  createdAt: string;
  capabilityId?: RuyiCapability['id'];
  resultId?: string;
  taskId?: string;
  actions?: RuyiMessageAction[];
  sourceLabel?: string;
  sourceHref?: string;
}
```

`RuyiMessageAction` 只保存语义动作，例如 `open-result`、`open-workbench`、`confirm-task`、`modify-task`、`cancel-task`、`resume-task`、`retry`，具体按钮由渠道渲染器决定。

### 4.3 成果索引

```ts
export type RuyiResultType = 'document' | 'presentation' | 'report' | 'translation';
export type RuyiResultStatus = 'editable' | 'completed' | 'invalid' | 'forbidden';

export interface RuyiResultReference {
  id: string;
  ownerId: string;
  conversationId: string | null;
  type: RuyiResultType;
  title: string;
  capabilityId: RuyiCapability['id'];
  status: RuyiResultStatus;
  workbenchHref: string;
  createdAt: string;
  statusReason?: string;
}
```

删除会话时仅将对应成果的 `conversationId` 置空，不删除成果。

### 4.4 V1 任务 POC

```ts
export type RuyiTaskStatus =
  | 'collecting'
  | 'interrupted'
  | 'awaiting-confirmation'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface MeetingTaskSlots {
  title: string;
  dateText: string;
  resolvedDate: string;
  startTime: string;
  endTime: string;
  attendeeNames: string[];
  location: string;
}

export interface RuyiTaskMock {
  id: string;
  ownerId: string;
  conversationId: string;
  type: 'create-meeting';
  status: RuyiTaskStatus;
  slots: Partial<MeetingTaskSlots>;
  missingSlots: Array<keyof MeetingTaskSlots>;
  createdAt: string;
  updatedAt: string;
  resultHref?: string;
  failureReason?: string;
}
```

V2 可以扩展多任务和其他任务类型，但不得改变 V1 已使用字段的语义。

## 5. Store 与 mock runtime

### 5.1 文件职责

- `src/data/ruyiCapabilities.ts`：能力注册表和快捷入口顺序。
- `src/data/ruyiDemoScenarios.ts`：默认种子和所有确定性演示 fixture。
- `src/services/ruyiMockRuntime.ts`：关键词到演示意图、回复和状态转换的纯函数。
- `src/store/ruyiStore.ts`：会话、消息、成果、V1任务及持久化动作。

页面组件不得再次声明独立的会话数组、能力数组或任务状态机。

### 5.2 持久化

- 使用 Zustand `persist` 中间件。
- storage key：`ijx-ruyi-prototype-v1`。
- store 数据按 `ownerId` 分区；当前主用户 ID 使用现有主用户数据对应的稳定值，不用显示姓名作主键。
- 默认种子只在该用户从未初始化时写入。
- 增加 `schemaVersion: 1`，未来字段变化通过轻量 migrate 处理。
- 不持久化真实 `File`、Blob、Token、浏览器路径或隐私数据。

### 5.3 Store 动作

V1 至少提供：

- `initializeUser(ownerId)`
- `createConversation(ownerId)`
- `renameConversation(conversationId, title)`
- `deleteConversation(conversationId)`
- `selectCapability(conversationId, capabilityId | null)`
- `sendUserMessage(conversationId, content)`
- `appendAssistantMessage(message)`
- `startMeetingTask(conversationId, initialText)`
- `updateMeetingTask(taskId, patch)`
- `interruptTask(taskId)`
- `resumeTask(taskId)`
- `confirmTask(taskId)`
- `cancelTask(taskId)`
- `failTask(taskId, reason)`
- `createResult(reference)`
- `recordWorkbenchResult(sourceConversationId, result)`
- `resetUserPrototype(ownerId)`
- `loadDemoScenario(scenarioId)`

删除会话动作必须原子完成：删除消息和任务展示引用、保留成果、清空成果的来源会话关联、选择下一页面。

### 5.4 Mock 意图路由

`ruyiMockRuntime.ts` 使用确定性规则模拟产品结果，优先级固定：

1. 当前有 V1 会议任务时，先判断确认、修改、取消、补参和恢复语句。
2. 明确的公文、PPT、汇报、翻译、IT、日程、待办、考勤、知识、运营关键词。
3. 当前已激活能力。
4. 普通问答兜底。

规则只用于演示，不在 UI 文案中声称模型已真实识别。

### 5.5 模拟延迟

- 发送后立即追加用户消息。
- 追加 `loading` 消息，600–900ms 后替换或追加确定性回复。
- 事务确认后的 `executing` 状态持续约 800ms，再进入完成或指定失败结果。
- 定时器在组件卸载时清理；刷新后不恢复未完成定时器，而是根据持久化状态显示“处理中已中断，请重试”，避免永久加载。

## 6. 组件拆分

新增 `src/components/ruyi/`，按以下职责拆分：

- `RuyiConversationSidebar.tsx`：新建、快捷能力、历史会话和更多菜单。
- `RuyiAssistantHome.tsx`：问候、统一输入和快捷能力。
- `RuyiConversationView.tsx`：会话头、消息流、固定输入区。
- `RuyiMessageRenderer.tsx`：如意空间消息语义渲染。
- `RuyiCapabilityStatus.tsx`：当前能力标签和退出。
- `RuyiResultCard.tsx`：统一成果卡片及状态。
- `RuyiConfirmationMessage.tsx`：参数摘要和确认动作。
- `RuyiTaskResumeMessage.tsx`：中断任务恢复提示。
- `RuyiConversationDialogs.tsx`：重命名、删除确认。
- `RuyiEmptyState.tsx`：不存在、空历史、失效等状态。

`RuYiZone.tsx` 最终只负责路由解析、工作台分支、页面组合和 store 选择器，不继续承载大段场景回复。

PC 消息复用 `RuyiMessage` 语义，但由 `Home.tsx` 内的紧凑 adapter 渲染，不直接复用如意空间大卡片组件。

## 7. V1 功能实现

### 7.1 统一主页

- 未打开会话时展示问候、说明、统一输入和六个快捷能力。
- 主页输入发送时自动创建会话，然后导航到会话路由。
- 第一条用户消息生成标题：取规范化文本前 18 个汉字；超出加省略号。
- 快捷能力点击后：
  - `qa`/`instant`：创建会话、激活能力、预填引导语但不自动发送。
  - `creative`：创建会话、激活能力、预填专业需求提示。
  - `transaction`：创建会话并展示参数收集引导。
- 用户仍可清除能力标签并以普通对话发送。

### 7.2 会话管理

- 历史列表按 `updatedAt` 倒序。
- 最近消息摘要只取纯文本，不展示内部状态编码。
- 更多菜单包含重命名、删除。
- 重命名使用弹框，去除首尾空格，1–40 字；失败时在弹框内提示。
- 删除使用确认弹框，说明成果不会删除。
- 删除当前会话后导航主页；删除其他会话不切换当前页面。
- 会话不存在时显示错误状态，不自动创建同 ID 会话。

### 7.3 能力和消息

- 切换能力时追加 `capability-status` 消息，并清空尚未发送的输入草稿。
- 退出能力时追加系统消息，回到普通问答。
- 同一会话可依次使用多个能力；历史列表辅助文字显示最后一次能力。
- 专业能力激活时隐藏通用推荐。
- 任何按钮点击产生新消息或可见 Toast，不在原回复内部原地改变业务进程。
- 复制、反馈等非业务操作可只改变本条 UI 状态，但重新生成必须追加新回复。

### 7.4 能力映射

| 能力 | 触发示例 | 返回形式 |
| --- | --- | --- |
| 查询工作信息 | `我还有什么流程没有处理？` | 待办摘要、来源和流程页入口 |
| 考勤查询 | `我上个月考勤怎么样？` | 统计文字、制度来源和详情入口 |
| 知识咨询 | `搜索智能办公相关知识` | 文字摘要、文档来源链接 |
| 运营查询 | `看看公司近期运营数据` | 指标文字列表和看板入口 |
| 如意公文 | `帮我写一份会议纪要` | 补充资料提示、进入公文工作台 |
| 如意 PPT | `做一份AI办公汇报PPT` | 需求摘要、进入 PPT 工作台 |
| 如意参谋 | `生成如意空间项目周报` | 需求摘要、进入参谋师工作台 |
| 智能翻译 | `把“会议改到下午三点”翻译成英文` | 当前会话直接给出译文 |
| IT 服务 | `VPN无法连接，帮我反馈` | 指引或反馈表单入口，提交后新消息回执 |
| 创建会议 | `帮我创建明天的会议` | 启动 V1 单任务 POC |

### 7.5 专业工作台与成果回流

#### 打开工作台

- 跳转工作台时携带 `sourceConversationId`。
- 工作台从 store 读取来源消息中已确认的主题和参数；现有初始状态 props 继续复用。
- 无来源 ID 时按当前独立工作台逻辑运行。

#### 记录成果

- 公文、PPT、参谋师增加最小的成果回流调用点，不重写内部流程。
- 当用户完成现有“保存/生成最终文件/保存汇报”等关键动作时调用 `recordWorkbenchResult`。
- 同一工作台会话重复保存时更新同一成果索引，不重复生成多张成果卡片。
- 返回来源会话时追加一条 `result` 消息；若已追加则定位已有成果消息。
- 返回按钮导航到 `/pc_client/ruyi-zone/conversations/:sourceConversationId`。

#### 成果状态

- `editable`、`completed`：按钮可用。
- `invalid`：按钮禁用，显示失效原因。
- `forbidden`：按钮禁用，显示无权限，不展示敏感摘要。
- 来源会话已删除：成果仍可从专业工作台历史打开，但不显示来源会话链接。

### 7.6 V1 创建会议任务 POC

状态流固定为：

```text
collecting → interrupted → collecting → awaiting-confirmation
→ executing → completed
                    ├→ collecting（修改参数）
                    ├→ cancelled
                    └→ failed
```

#### 参数规则

- 首次输入识别“明天”为 `dateText`，并根据当前演示日期生成 `resolvedDate`。
- 必填：标题、日期、开始时间、结束时间、参会人。
- 默认标题：`项目沟通会`。
- 用户只给开始时间时，默认时长 1 小时，并在确认摘要中明确显示。
- 地点非必填，缺失时显示“线上会议”。
- 补参顺序：时间 → 参会人 → 其他必要冲突说明。

#### 中断与恢复

- 收集参数期间输入年假、考勤、待办等明确查询时，任务转为 `interrupted`。
- 先完成当前查询回复，再追加“继续创建会议”恢复消息。
- 点击恢复或输入“继续刚才的会议”后转回 `collecting`。
- V1 每个会话只能存在一个未完成任务；开始新会议任务前先提示继续或取消旧任务。

#### 确认与失败

- 参数齐备后追加确认消息，展示全部参数。
- “修改”追加用户操作消息并回到 `collecting`。
- “取消”追加取消消息并进入 `cancelled`。
- “确认创建”进入 `executing`，再进入完成或 fixture 指定失败。
- 失败不自动重试，提供“重试”和“前往日历手动创建”。
- 完成后展示模拟会议详情入口；再次修改需进入现有日历/会议功能，不重放原创建任务。

### 7.7 PC 消息连续性

- PC 消息中的如意助手从 store 读取一个固定的系统会话映射。
- 如意空间可打开该会话，二者消息顺序和成果引用一致。
- IM 点击“前往如意空间”打开相同 `conversationId`。
- 如意空间普通会话不会全部出现在 PC 消息联系人列表；PC 消息只展示固定如意助手系统会话。
- App 本轮保持现状，不接入该 store。

## 8. 演示场景与触发方式

### 8.1 场景加载机制

新增只读 URL 参数 `demo`，用于确定性加载临时 fixture：

- `?demo=first-use`
- `?demo=default`
- `?demo=conversation-management`
- `?demo=capability-states`
- `?demo=task-poc`
- `?demo=result-states`
- `?demo=failure-states`
- `?demo=user-isolation`

规则：

- 带 `demo` 参数时使用独立的内存 fixture，不写入默认 localStorage。
- 刷新页面重新加载同一 fixture，便于重复验收。
- 移除 `demo` 参数后恢复当前用户的持久化原型数据。
- 未识别的 `demo` 值显示“演示场景不存在”，不修改任何数据。
- 需求模式的对应业务规则必须写明场景 URL、操作步骤和预期结果。

### 8.2 V1 场景矩阵

| 场景 | 触发方式 | 操作步骤 | 预期结果 |
| --- | --- | --- | --- |
| 首次使用 | `?demo=first-use` | 直接进入页面 | 无历史选中；展示统一问候、输入和六项能力 |
| 自动建会话 | `?demo=first-use` | 输入“我还有什么流程没有处理？” | 自动创建会话、生成标题、进入会话路由并回复待办摘要 |
| 快捷能力 | `?demo=default` | 点击“如意公文” | 新会话激活公文能力、预填引导、隐藏通用推荐 |
| 多能力同会话 | `?demo=capability-states` | 先翻译，再点击 PPT | 同一会话保留两次能力调用，历史辅助文字显示最后能力 |
| 会话重命名 | `?demo=conversation-management` | 会话更多 → 重命名 → 保存 | 列表和会话头同步，刷新仍保留当前 fixture 内状态 |
| 会话删除 | `?demo=conversation-management` | 删除含成果的会话 | 二次确认；会话删除；成果不删除 |
| 公文成果回流 | `?demo=default` | 输入“帮我写一份会议纪要”→进入工作台→完成→返回 | 来源会话出现公文成果卡片，可再次打开 |
| PPT成果回流 | `?demo=default` | 输入“做一份AI办公汇报PPT”并完成工作台 | 来源会话出现 PPT 成果卡片 |
| 任务补参 | `?demo=task-poc` | 输入“帮我创建明天的会议”→“上午10点”→“叫上张飞和赵云” | 参数逐步补齐并进入确认 |
| 任务中断恢复 | `?demo=task-poc` | 补参中输入“我还有多少年假？”→点击“继续创建会议” | 先回答年假，原任务参数不丢失并恢复 |
| 任务修改 | `?demo=task-poc` | 确认页点击修改并输入“改成11点” | 参数更新，重新生成确认摘要 |
| 任务取消 | `?demo=task-poc` | 确认页点击取消 | 新消息说明已取消，不生成会议结果 |
| 任务失败 | `?demo=failure-states` | 完成会议确认 | 显示模拟超时失败，提供重试和日历入口，不重复创建 |
| 成果失效 | `?demo=result-states` | 点击“旧版协同平台方案” | 卡片显示已失效及原因，打开按钮禁用 |
| 成果无权限 | `?demo=result-states` | 查看“经营分析报告” | 只显示无权限，不展示正文摘要 |
| 用户隔离 | `?demo=user-isolation` | 在场景内切换演示用户 | 两个用户会话集合不同，不能相互查看 |
| 会话不存在 | 打开不存在的会话 ID | 访问 `/conversations/not-found` | 显示不存在状态和返回主页，不创建新会话 |

### 8.3 普通输入触发词

除场景 URL 外，默认数据下支持以下可见话术：

- 待办：`我还有什么流程没有处理？`
- 考勤：`我上个月考勤怎么样？`
- 知识：`搜索智能办公相关知识`
- 运营：`看看公司近期运营数据`
- 公文：`帮我写一份会议纪要`
- PPT：`做一份AI办公汇报PPT`
- 参谋师：`生成如意空间项目周报`
- 翻译：`把“会议改到下午三点”翻译成英文`
- IT：`VPN无法连接，帮我反馈`
- 会议任务：`帮我创建明天的会议`

输入不匹配时返回普通问答兜底和能力建议，不错误启动任务。

## 9. 需求模式落地清单

### 9.1 写入方式

- 先完成组件和 `data-requirement-id` 锚点。
- 启动本机 `npm run dev:react`。
- 通过需求模式编辑界面创建/编辑条目，使 `docs/PROTOTYPE_REQUIREMENTS.md` 与源码锚点同轮更新。
- 不手工直接编辑需求 MD。
- 同一 surface/route 的序号必须连续。
- 每条需要演示的需求，最后一条业务规则以 `原型触发：` 开头，写明 URL、话术或操作步骤。

### 9.2 V1 条目

以下是必须写入需求模式的最终内容。已有同 ID 条目按本表更新，不新增重复 ID。

| ID | Surface | 锚点位置 | 标题 | 功能要求与关键规则 | 原型触发 |
| --- | --- | --- | --- | --- | --- |
| `ruyi-unified-entry` | 如意空间首页 | 主页统一输入与快捷能力的常驻容器 | 统一入口与直接发起需求 | 用户无需先选智能体；主页发送自动创建会话；快捷能力只辅助发现 | `/pc_client/ruyi-zone?demo=first-use` |
| `ruyi-plugin-state` | 如意空间首页 | 当前能力标签与快捷能力共同父容器 | 快捷能力与当前能力状态 | 同时只激活一个专业能力；可退出；切换时清空未发送草稿；激活后隐藏通用推荐 | `?demo=capability-states`，先翻译后切换 PPT |
| `ruyi-conversation-input` | 如意空间首页 | 固定输入区根容器 | 统一输入与消息推进 | 空内容不发送；发送清空草稿；每次用户操作生成新消息；输入区固定 | `?demo=default` 输入任一触发话术 |
| `ruyi-conversation-management` | 如意空间首页 | 左侧历史会话区根容器 | 会话新建、重命名与删除 | 多会话并存；重命名同步；删除二次确认；删除会话不删除成果；刷新保留 | `?demo=conversation-management` |
| `ruyi-capability-routing` | 如意空间会话 | 消息流根容器 | 专业能力统一调用与状态 | 按即时问答、即时处理、内容创作、业务执行返回；显示识别、补参、处理、完成、失败 | `?demo=capability-states` 按场景话术触发 |
| `ruyi-workbench-navigation` | 如意空间会话 | 工作台入口消息/操作根容器 | 确认需求后进入专业工作台 | 公文/PPT/参谋师携带来源会话；返回恢复原会话；普通翻译不进入工作台 | `?demo=default` 依次触发公文、PPT、参谋师 |
| `ruyi-result-reference` | 如意空间会话 | 成果卡片根容器 | 成果记录与会话关联 | 成果与回答分离；可再次打开；会话删除不删除成果；失效与无权限明确提示 | `?demo=result-states` |
| `ruyi-single-task-poc` | 如意空间会话 | 会议任务状态消息序列的常驻外层 | 单任务补参、中断与恢复 | 单会话一个未完成任务；按顺序补参；切话题后可恢复；确认前可修改取消；失败不盲目重试 | `?demo=task-poc` 按任务场景步骤操作 |
| `ruyi-response-feedback` | 如意空间会话 | 助手消息反馈操作区的稳定父容器 | 回复反馈与重新生成 | 有用/没用有可见反馈；没用可选原因；重新生成追加新回复，不覆盖旧回复 | `?demo=default` 在助手消息底部操作 |
| `ruyi-im-continuity` | 消息 · 如意助手 | `Home.tsx` 如意助手会话内容根容器 | PC消息与如意空间会话连续性 | PC消息只展示固定系统会话；复杂任务跳如意空间；打开同一会话和成果 | 在消息页打开如意助手，点击“前往如意空间” |

### 9.3 需求模式字段模板

以下内容按 `功能需求` 和 `业务规则` 原样录入；如开发过程中仅调整视觉，不得改写业务规则。

#### `ruyi-unified-entry`

功能需求：

> 如意助手提供统一需求入口，用户无需先选择智能体即可直接描述工作需求；专业能力快捷入口只用于辅助发现和进入对应场景。

业务规则：

- 主页发送第一条消息时自动创建新会话并进入对应会话地址。
- 点击快捷能力后创建或激活对应能力，但不自动替用户发送消息。
- 用户可以清除当前能力并回到普通对话，当前会话继续保留。
- 新建对话不删除、覆盖或重置已有会话。
- 原型触发：打开 `/pc_client/ruyi-zone?demo=first-use`，在统一输入框发送“我还有什么流程没有处理？”。

#### `ruyi-plugin-state`

功能需求：

> 快捷能力用于切换当前会话使用的专业能力，同一时间只激活一个能力，并向用户明确展示当前使用状态。

业务规则：

- 再次点击已激活能力或点击退出时回到普通对话。
- 切换能力时清空尚未发送的输入草稿，避免带入上一场景。
- 激活专业能力后隐藏通用“猜你想问”，改为展示该能力的输入提示。
- 能力切换只影响当前会话，不创建互不关联的独立聊天。
- 原型触发：打开 `/pc_client/ruyi-zone?demo=capability-states`，先使用翻译，再切换到如意 PPT。

#### `ruyi-conversation-input`

功能需求：

> 统一输入区根据普通对话或当前专业能力接收文本和附件操作，并将每次用户操作作为新的会话消息推进。

业务规则：

- 空内容不触发发送。
- 发送成功后清空当前输入草稿。
- 用户发送、确认、修改、取消和恢复任务均生成新的消息，不在旧消息中嵌套推进。
- 对话输入区固定在内容区底部，消息区独立滚动。
- 原型触发：打开 `/pc_client/ruyi-zone?demo=default`，输入任一已登记的场景话术并发送。

#### `ruyi-conversation-management`

功能需求：

> 用户可以新建、查看、重命名和删除本人会话；多个会话相互独立，刷新后保留当前用户的会话数据。

业务规则：

- 新建会话不删除旧会话，历史列表按最近更新时间倒序。
- 第一条用户消息发送后自动生成会话标题，用户可手动重命名。
- 删除会话必须二次确认；删除聊天会话不删除已保存的公文、PPT或汇报成果。
- 删除当前会话后返回新对话主页；删除其他会话不改变当前页面。
- 不存在或不属于当前用户的会话不得自动创建或展示。
- 原型触发：打开 `/pc_client/ruyi-zone?demo=conversation-management`，依次验证新建、重命名、删除和刷新。

#### `ruyi-capability-routing`

功能需求：

> 如意助手根据用户输入或快捷入口调用对应专业能力，并按即时问答、即时处理、内容创作和业务执行四种交互形态返回结果。

业务规则：

- 即时问答和即时处理在当前对话直接返回结果。
- 内容创作在对话中确认需求后进入专业工作台。
- 业务执行先补齐参数并确认，再展示模拟执行结果。
- 调用过程统一展示已识别、补充信息、处理中、需要确认、已完成和失败状态。
- 能力不可用时提供用户可理解的说明和下一步，不暴露技术异常。
- 原型触发：打开 `/pc_client/ruyi-zone?demo=capability-states`，按开发方案场景话术依次触发查询、翻译、公文和日程。

#### `ruyi-workbench-navigation`

功能需求：

> 公文、PPT和结构化汇报在对话中确认需求后进入对应专业工作台，并能够返回来源会话继续查看结果。

业务规则：

- 进入工作台时携带来源会话和已确认需求，不要求用户重复填写。
- 返回时恢复原会话，不新增重复的助手导航入口。
- 简短翻译、查询和普通咨询在当前对话完成，不强制打开工作台。
- 无来源会话的工作台地址继续按独立工作台使用。
- 原型触发：打开 `/pc_client/ruyi-zone?demo=default`，分别输入公文、PPT和项目周报触发话术并完成工作台返回。

#### `ruyi-result-reference`

功能需求：

> 专业工作台生成的公文、PPT和汇报作为独立工作成果记录，并通过统一成果卡片与来源会话关联。

业务规则：

- 回答结果属于对话消息；可再次打开或编辑的内容才建立成果索引。
- 成果卡片展示名称、类型、来源能力、状态和打开入口。
- 删除来源会话不删除成果，仅移除来源会话关联。
- 成果失效时保留记录并禁用打开；无权限时不得展示敏感内容。
- 同一工作台会话重复保存时更新原成果，不重复创建成果卡片。
- 原型触发：打开 `/pc_client/ruyi-zone?demo=result-states`，查看可编辑、已完成、已失效和无权限成果。

#### `ruyi-single-task-poc`

功能需求：

> V1 使用创建会议场景验证单个业务任务的参数补充、话题中断、恢复、修改、确认、取消、失败和完成流程。

业务规则：

- 一个会话同时只允许一个未完成任务；再次发起前提示继续或取消原任务。
- 系统按时间、参会人等必要参数顺序追问，并保留已填写内容。
- 用户临时查询年假、考勤或待办时先回答新问题，原任务进入可恢复状态。
- 参数齐备后必须确认；确认前允许修改或取消。
- 失败不自动重复提交，提供重试或前往业务页面操作。
- 已完成任务不能重新执行原创建动作；后续修改进入现有会议或日历功能。
- 原型触发：打开 `/pc_client/ruyi-zone?demo=task-poc`，依次输入“帮我创建明天的会议”“上午10点”“叫上张飞和赵云”“我还有多少年假？”，再点击继续。

#### `ruyi-response-feedback`

功能需求：

> 用户可以对助手回复执行复制、有用、没用和重新生成操作，并获得明确可见的反馈。

业务规则：

- 有用和没用操作显示已记录状态，避免重复提交造成视觉不确定。
- 选择没用时可选择答非所问、信息不准确、操作失败或其他原因。
- 重新生成必须追加新的助手回复，不覆盖或删除原回复。
- 复制成功显示 Toast。
- 原型触发：打开 `/pc_client/ruyi-zone?demo=default`，在任一助手回复底部依次验证复制、没用和重新生成。

#### `ruyi-im-continuity`

功能需求：

> PC消息中的如意助手与如意空间共享同一固定系统会话，用户可以从消息中的复杂任务或成果入口打开如意空间继续处理。

业务规则：

- PC消息只展示固定如意助手系统会话，不把如意空间全部历史会话复制为联系人。
- 简单问答和结果在消息中直接展示，复杂任务提供前往如意空间或工作台入口。
- 跳转后打开相同会话ID，消息顺序和成果引用保持一致。
- 本规则不适用于当前正在独立开发的App消息模块。
- 原型触发：进入 `/pc_client` 打开如意助手会话，点击“前往如意空间”，核对会话ID和消息内容一致。

### 9.4 V1 锚点规则

- `ruyi-unified-entry`：绑定主页输入和快捷能力的常驻 section，不绑发送按钮。
- `ruyi-conversation-management`：绑定左栏历史区，不绑单个会话菜单。
- `ruyi-capability-routing`：绑定会话消息流容器，使各状态都可定位。
- `ruyi-workbench-navigation`：绑定专业能力回复的工作台操作区域；该区域在 fixture 中必须常驻可见。
- `ruyi-result-reference`：绑定成果卡片根节点。
- `ruyi-single-task-poc`：绑定任务消息序列父容器，不绑确认按钮。
- `ruyi-response-feedback`：绑定反馈操作区父节点。
- `ruyi-im-continuity`：仅在 `Home.tsx` 如意助手分支挂载。

### 9.5 V2 条目预留

V2 实现时再新增，不在 V1 提前写入：

- `ruyi-task-list`
- `ruyi-task-detail`
- `ruyi-multi-task-resolution`
- `ruyi-result-center`
- `ruyi-result-permission-state`
- `ruyi-cross-device-context`

## 10. UI 与 Harness 同步

V1 实现形成稳定规则后，在 `docs/UI_DESIGN_GUIDELINES.md` 追加“如意助手统一对话页”小节，内容只包括长期视觉和布局规则：

- 如意空间内部左栏宽度、会话头、消息区和固定输入区。
- 快捷能力、当前能力标签、成果卡片的统一视觉基线。
- PC 消息使用紧凑消息表现，不复制如意空间完整组件。
- 对话操作产生新消息，不在旧卡片中嵌套业务流程。

不把本次一次性 fixture、触发话术、V1 日期和开发步骤写入长期 UI 规范、`AGENTS.md` 或项目 `MEMORY.md`。

## 11. 实施批次

### 批次 1：数据底座与路由

- 新增类型、能力注册、demo fixture、mock runtime 和持久化 store。
- 增加会话子路由和 `/pc_client/assistant` 重定向。
- 保持现有页面可编译，暂不替换工作台。
- 验证 store 初始化、刷新、用户分区和 demo 参数。

### 批次 2：如意空间主页与会话

- 拆出左栏、主页、会话视图和消息渲染。
- 完成新建、自动标题、重命名、删除和不存在状态。
- 替换固定 `historyItems`、`defaultAssistants` 和页面内普通意图分发。
- 添加第一批需求锚点，但在页面稳定后通过需求模式写入条目。

### 批次 3：能力迁移与 PC 消息

- 迁移查询、翻译、IT、反馈和事务确认状态。
- 将 Home 如意助手切换为共享 store 和紧凑 renderer。
- 回归普通聊天、联系人和群聊，确保不受影响。

### 批次 4：工作台与成果

- 为三个专业工作台增加来源会话和结果回流契约。
- 新增成果卡片和结果状态 fixture。
- 验证删除会话不删除成果。

### 批次 5：单任务 POC

- 完成会议任务状态机、补参、中断、恢复、修改、取消、成功和失败。
- 加入任务和异常场景 fixture。
- 完成全部需求模式条目及锚点。

### 批次 6：Harness、回归与验收

- 更新 UI 规范的长期规则。
- 检查需求 MD 和锚点同步、模块序号连续。
- 完成类型、构建、差异、浏览器和多尺寸回归。
- 不提交、不推送，等待用户本地验收。

## 12. 测试方案

### 12.1 自动检查

每批次结束运行：

```bash
npm.cmd run check
git diff --check
```

V1 全部完成后运行一次：

```bash
npm.cmd run build
```

### 12.2 Store 测试

至少覆盖：

- 首次初始化只写一次种子。
- 两个用户的数据隔离。
- 新建会话不覆盖旧会话。
- 重命名更新列表和详情。
- 删除会话保留成果并清空来源关联。
- demo fixture 不污染默认持久化数据。
- schemaVersion 不匹配时安全迁移或重置当前原型数据。

### 12.3 任务状态机测试

- 缺时间时只追问时间。
- 时间补齐后继续追问参会人。
- 任务中断后参数不丢失。
- 多次点击恢复不重复创建任务。
- 修改参数后重新确认。
- 取消后不能确认创建。
- 失败后不自动进入完成。
- 完成后不能重新执行原创建任务。

### 12.4 浏览器回归

- `/pc_client/ruyi-zone` 首次使用、新建会话和快捷能力。
- 会话重命名、删除、刷新恢复和不存在状态。
- 所有默认触发话术。
- 公文、PPT、参谋师进入、返回和成果回流。
- PC 消息打开如意助手、发送、跳如意空间和返回。
- `demo` 全场景 URL 逐一验证。
- 需求模式角标能定位对应常驻容器，触发说明可读。
- 浏览器前进/后退不丢失当前会话。
- 1440、1280、1024 宽度无重叠、遮挡和错误滚动。
- 深色模式下消息、卡片、菜单和弹框对比度正常。

### 12.5 差异卫生

- 不包含 `dist`、缓存、日志、截图和 `node_modules`。
- 不修改 App 文件、部署文件和无关页面。
- 不整文件格式化 `Home.tsx`、工作台或 `App.tsx`。
- 中文无乱码、UTF-8 无 BOM。
- `docs/PROTOTYPE_REQUIREMENTS.md` 与所有锚点同批变化。

## 13. V1 验收清单

- [ ] 用户无需选择智能体即可开始对话。
- [ ] 六个快捷能力入口可用，且不强制拆成六个聊天。
- [ ] 同一会话可连续调用多个能力。
- [ ] 会话可新建、查看、重命名、删除，刷新后保留。
- [ ] 删除会话不删除已保存成果。
- [ ] 普通问答、查询、翻译留在当前对话。
- [ ] 公文、PPT、参谋师进入正确工作台。
- [ ] 工作台返回后成果出现在来源会话。
- [ ] 失效和无权限成果状态可演示。
- [ ] 会议任务支持补参、中断、恢复、修改、取消、失败和完成。
- [ ] PC 消息与如意空间可打开同一固定系统会话。
- [ ] `/pc_client/assistant` 不再展示另一套静态助手。
- [ ] 所有场景均有确定性触发方式。
- [ ] 功能性需求进入需求模式，触发方式写在业务规则中。
- [ ] App 页面、后端能力和部署配置未被修改。
- [ ] 类型检查、生产构建、差异检查和关键浏览器回归全部通过。

## 14. V2 后续实现约束

V2 开发必须基于 V1 的会话、消息、成果和任务类型扩展，不重新建设第二套 store。

- 多任务恢复必须在歧义时让用户选择。
- AI 任务中心只展示 AI 协助任务。
- 我的 AI 成果只是索引，不替代源工作台文件管理。
- 跨端部分先消费统一数据语义，App 视觉继续遵守 App Harness。
- 业务上下文必须显式展示引用对象并支持取消引用。
- 不纳入桌面控制、屏幕读取和完整 Agent 平台。

## 15. 开发交接要求

接手模型开始实施前必须：

1. 读取 `Agents.md`、`docs/UI_DESIGN_GUIDELINES.md`、`docs/REQUIREMENT_EDITING.md`、本方案和产品基线。
2. 检查当前 `git status`、`git log -1`，确认没有其他模型正在修改同一批文件。
3. 只实施用户明确指定的批次；默认从 V1 批次 1 开始，不一次性开发 V2。
4. 每批次汇报改动文件、路由、功能、场景触发方式、验证结果和未完成项。
5. 完成后由 Codex 或指定复核模型检查 diff、需求锚点、构建和浏览器关键链路。
6. 未经用户本地验收和明确批准，不 commit、不 push、不部署。
