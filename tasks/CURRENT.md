# 当前任务

## 基本信息

- 任务名称：如意助手统一业务消息卡片合并与发布
- 提出日期：2026-11-19
- 任务类型：前端原型功能合并、去重、验收与 Git 发布
- 目标用户/评审对象：产品、设计及后续开发模型

## 范围

在最新 `origin/main` 的如意能力面板、反馈会话和路由架构上，合并本地尚未进入远端的统一业务消息卡片能力；识别并淘汰已被 WorkBuddy 新架构替代的旧公文/PPT 工具面板。

本轮不新增真实后端接口，仅使用前端路由、页面状态和模拟数据。

## 完成项

- 新增统一业务消息卡片类型，覆盖来源、分类、状态、指标、详情字段、事项列表、标签和操作。
- 新增共享 `BusinessMessageCard` 组件，支持标准模式和 IM 紧凑模式。
- 新增流程、考勤、日程、项目和知识五类模拟卡片数据。
- 消息页流程、日程、考勤、项目、知识应用推送统一使用共享卡片。
- IM 如意助手和如意空间会话共用同一业务卡片渲染器。
- 流程、考勤查询及任务打断查询接入对应卡片；知识查询接入知识卡片。
- 删除流程卡片之外的重复“查看流程中心”动作。
- 删除缺少结果引用、点击无效的“查看知识库”动作，改由知识卡片自身入口承担跳转。
- IM 紧凑卡片的四项指标改为两列，避免窄消息区内容挤压。
- UI 设计规范增加应用推送与如意助手共用业务消息卡片的长期规则。
- 保留远端公文、PPT、参谋师、翻译四能力面板；未合入本地旧 `RuyiToolPanel`。

## 影响范围

### 新增

- `src/components/messages/BusinessMessageCard.tsx`
- `src/data/businessMessageCards.ts`
- `src/types/businessMessageCard.ts`

### 修改

- `docs/UI_DESIGN_GUIDELINES.md`
- `src/components/ruyi/RuyiImMessageList.tsx`
- `src/components/ruyi/RuyiMessageRenderer.tsx`
- `src/data/ruyiDemoScenarios.ts`
- `src/pages/Home.tsx`
- `src/services/ruyiMockRuntime.ts`
- `src/types/ruyi.ts`
- `tasks/CURRENT.md`

## 验证结果

- `npm.cmd run check`：通过。
- TypeScript 类型检查：通过。
- React/Vite 生产构建：通过，1950 modules transformed。
- 路由合同检查：全部通过。
- 页面冒烟：21/21 通过。
- 四端下载与页面链路：20/20 通过，console/pageerror 为 0。
- 浏览器 `/pc_client`：流程应用推送展示完整流程卡片。
- 浏览器 IM 如意助手：发送“我的考勤情况怎么样？”后展示完整考勤卡片。
- 浏览器 `/pc_client/ruyi-zone?demo=default`：待办场景展示流程卡片及复制/有用/没用/重新生成操作。
- 浏览器控制台：无 error。
- `git diff --check`：通过。

## 明确淘汰

- 本地旧 `src/components/ruyi/RuyiToolPanel.tsx` 不进入 main。
- 本地旧版 `RuYiZone`、`RuyiConversationView` 面板接线不覆盖远端新版。
- 远端现有 `RuyiConversationComposer`、`RuyiPluginBar`、`RuyiCapabilityPanel` 及四个独立能力面板作为唯一实现。

## 后续未包含

以下需求不属于本次现有成果合并，当前仍待单独开发：

- 每条助手回复固定出现的通用功能条。
- IM 默认直接展示完整能力对话。
- 如意空间完整场景会话清单。
- 运营、IT 等新增业务卡片。
- 如意空间内部子路由不进入“打开的页面”。
- 新建真实空白会话、历史会话初始滚动和 IT 意图优先级修复。
- 需求扫描器 CRLF 兼容及“0 条需求”失败保护。

## Git 状态

等待提交并推送到 `main`；用户已于 2026-11-19 明确要求发布当前双方有效成果。
