# 当前任务

状态：进行中 —— 通讯录入口整改（2026-11-17，App 撤一级 / PC 保一级 / 群聊去伪）

## 通讯录入口整改（2026-11-17）

- **背景**：5fe3528 误将 App 通讯录升级为一级入口（产品决策为 PC Client 专属）；0c77cb0 PC Client 实现保留。整改在源码上直接回滚，不改写历史。
- **App 端**：撤掉底部导航"通讯录"Tab 与 /contacts 一级路由域；恢复五入口基线；消息模块通讯录入口恢复 /message/contacts 二级页；删除仅服务一级入口的页面/组件/图标/组织树 mock。
- **保留修复**：setContactNote 同步写 contact.note（既有备注刷新丢失 bug，消息模块详情页受益，与一级入口无关）。
- **PC Client**：/pc_client/contacts 一级导航保留；"发起群聊"取消单聊桥接伪实现，改为"群聊创建功能暂未开放"诚实提示（消息模块无真实群聊创建模型可复用）。
- **非目标**：不动如意模块；不 reset/rebase；不推送远端（等 Codex 验收）。


状态：已完成待复核 —— 帮助与反馈五端闭环（2026-11-14）+ 视觉修正与需求模式入口改造（2026-11-15）

## 视觉修正与需求模式入口（2026-11-15，轻量/中等验证）

1. **ClientWindowBar 底色**：初版误用不存在的 token `--ui-surface-panel`/`--ui-hover`（解析为透明）→ 面板与标题栏无底色与页面文字重叠。修正：面板用 `--ui-surface-card`，hover 用 `--ui-surface-selected`。标题栏本身保持完全透明（用户确认效果）。
2. **标题栏布局回归**（事故+修复，教训记录）：①删除左上角「i吉祥」标题（appTitle prop 移除，左区空占位）；②标题栏从白卡内移到白卡外层以求全页面透明统一，但新外层容器丢失 `flex-1` 导致白卡按内容收缩（各页面宽度 626~1021px 不等）——发现后补 `flex-1` 并移除 `calc(100% - 36px)` 硬编码，6 路由实测白卡统一 right:1432/w:1248。**教训：调整 Layout flex 结构时必须逐路由量化 shell 尺寸**。
3. **需求模式入口**（RequirementMode.tsx）：固定右上改为可拖动（Pointer 事件，4px 阈值防点击误判，拖后抑制 click），位置存 localStorage `ijx-requirement-entry-pos-v1` 刷新保持、resize 夹紧；失焦 1s 后 opacity-30、悬停/拖动恢复（transition 500ms）。实测：拖动 (1327,12)→(252,482) 持久化、刷新保持、hover opacity=1。

验证：tsc 通过；浏览器实测（标题栏 6 路由 bg=rgba(0,0,0,0)、需求模式拖动/透明/持久化）；截图 `.fix-panel-bg.png`→`.fix-bar-v4.png`、`.fix-req-drag.png`。**未跑全量 npm run check**（本轮仅 React 侧样式/交互调整，未动路由与构建结构）。

## 任务边界（2026-11-14 五端闭环）

- 目标：用户问题 → 如意助手自助排查 → 携带页面/终端环境提交 → 后台受理 → IM 沟通 → 状态更新 → 用户查看结果。
- 五端：PC 客户端（ClientWindowBar 标题栏+统一面板+用户菜单备份入口）、PC Web（悬浮栏弹窗+折叠持久化）、App（/profile/feedback 列表+详情页+最近业务页采集）、如意助手（两步流程：先排查后草稿）、Admin（终端列+会话操作）。
- 数据层 v2：`ijx-feedback-records-v2`（v1 自动迁移，编号/时间线保留）、clientKind 枚举（PC_CLIENT/PC_WEB/APP）、source 六渠道、白名单参数脱敏（platform/tab/view/section）、clientRequestId 幂等、bindFeedbackConversation 会话绑定。
- 会话层：`src/data/feedbackConversations.ts`（稳定 ID fb-conv-{feedbackId}、首条系统消息、受理/解决自动追加、PC 消息页 FeedbackConversationView + App Message.vue 共享读取）。
- 非目标：真实后端/附件上传/窗口控制/生产 IM/工单分派 SLA。

## 验证结果（2026-11-14）

- `npm run check`：types + build + routes + pages（21/21）全部通过。
- 定向断言 14/14 PASS：v1→v2 迁移（编号/时间线/状态归一/clientKind 枚举化）、脱敏（token/手机号/邮箱剔除、白名单保留、hash 剔除）、幂等、会话（稳定 ID/标题格式/首条系统消息/受理追加/绑定回写）。脚本 `工作区/.verify-feedback-core.cjs`。
- 五端浏览器回归 18/18 PASS 零 pageerror（统一 BrowserContext）：标题栏面板+日历页采集+提交、Web 弹窗不跳转+折叠持久化、App 默认关联 /schedule+详情页时间线、如意两步流程（VPN 无反馈词→排查→仍要反馈→草稿→提交）、Admin 列表终端列+联系用户建会话自动受理+解决+PC/App 消息页会话同步。脚本 `工作区/.verify-feedback-5ends.cjs`。
- 375/480px 无横向溢出；深色模式标题栏帮助入口可读。
- 截图：`.fb5-app-360.png`、`.fb5-app-detail-360.png`、`.fb5-admin.png`、`.fb5-dark-1440.png`（工作区根）。

## 已知待处理项

- 反馈/会话均为演示层（localStorage），未接后端
- Feedback.vue / FeedbackDetail.vue 无参考图基线，按 DESIGN_SYSTEM token 实现，待产品确认
- App 消息页反馈会话点击进「反馈详情」而非 IM 聊天界面（聊天视图未深度集成 zustand store，列表+详情互跳已闭环）
- 如意助手 mock 回复与两步流程并存（排查卡为独立 UI，不替代助手消息）

## Git 状态

未提交（等用户确认）；未推送；未部署。
