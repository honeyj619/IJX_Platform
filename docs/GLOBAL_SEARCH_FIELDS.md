# 全局搜索字段梳理（可搜索出全部类型）

> 范围：PC Client 全局搜索（`src/components/GlobalSearchDialog.tsx` + `src/data/globalSearch.ts`）。
> 目标：梳理每一类搜索结果"用哪些字段参与搜索匹配、用哪些字段做结果展示"，作为后续扩展类型和字段的标准依据。

## 1. 通用结果结构（所有类型共用）

每条搜索结果都归一化为 `GlobalSearchItem`（`src/data/globalSearch.ts`）：

| 字段 | 类型 | 作用 |
| --- | --- | --- |
| `id` | string | 唯一标识，如 `person-1`、`doc-3`、`process-2` |
| `category` | GlobalSearchCategory | 所属类型分类，决定分区展示与筛选 tab |
| `title` | string | **搜索匹配字段 + 主展示字段**（第一行，支持关键词高亮） |
| `description` | string | **搜索匹配字段 + 副展示字段**（第二行，支持关键词高亮） |
| `keywords` | string[] | **搜索匹配字段**：补充别名/来源/标签等便于命中的词，仅参与匹配不直接展示 |
| `target` | GlobalSearchTarget | 跳转目标：`message`（跳 IM 会话，可带 messageId）或 `route`（跳页面，可带 entityId） |
| `anchor` | SystemAppAnchor（可选） | 仅系统应用使用：`common`（常用功能）/ `agents`（智能体），用于二级筛选 |

搜索匹配逻辑：`title + description + keywords` 拼接后做关键词包含匹配（`searchGlobalItems`），不区分大小写。

分类与分区顺序固定为：`people 人员 → groups 群聊 → chat-records 聊天记录 → calendar 日程 → documents 文档 → processes 流程 → business-systems 业务系统 → system-apps 系统应用`。"全部"视图下每类最多展示 3 条，超出出现"在 XX 中搜索更多"。

## 2. 各类型字段明细

### 2.1 人员（people）
- **数据源**：`src/data/contactDirectory.ts`（ContactPerson）
- **可搜索字段**：姓名、邮箱、部门、职位 + 关键词（"人员""联系人"）
- **展示字段**：
  - 主行：`姓名`（name）
  - 副行：`部门 · 职位`（department · title）
- **跳转**：打开对应单聊会话（message target，kind=person）
- 可扩展：域账号（account）、工号（employeeNo）、在线状态（status）可作为新增搜索词或结果角标。

### 2.2 群聊（groups）
- **数据源**：`src/data/im/groups.ts`（Group）+ globalSearch mock
- **可搜索字段**：群名称、成员人数 + 关键词（主题词，如"值班""项目""PMO"）
- **展示字段**：
  - 主行：`群名称（N人）`（如"信息技术部大群（158人）"）
  - 副行：无（`description` 为空时结果行不渲染第二行）
- **跳转**：打开对应群聊会话（message target，kind=group）
- 可扩展：群类型（普通群/部门群/公开群）、群主（owner）、群描述。

### 2.3 聊天记录（chat-records）
- **数据源**：`src/data/im/messages.ts`（Message）
- **可搜索字段**：会话名、消息内容关键词 + 关键词（消息摘要词，如"立项""预算"）
- **展示字段**：
  - 主行：`聊天名称`（来源会话名，如"如意助手""项目管理"）
  - 副行：`涉及条数`（如"12 条相关消息"）
- **跳转**：进入对应会话并定位到消息（message target，可带 messageId）

### 2.4 日程（calendar）
- **数据源**：`src/store/meetingStore.ts`（calendarEvents）+ `src/data/app/calendar.ts`
- **可搜索字段**：日程标题 + 关键词（"值班""出差""航班""会议"等类型词、地点词）
- **展示字段**：
  - 主行：`日程标题`（title）
  - 副行：`创建人 · 开始时间-结束时间`（如"梁吉力 · 2025-05-22 09:00-18:00"）
- **跳转**：跳日历页并定位该日程（route target，entityId=日程 id）
- 可扩展：参与人（participants）、提醒时间（remindAt）、地点。

### 2.5 文档（documents）
- **数据源**：企业知识库数据（EKB）
- **可搜索字段**：文档标题 + 关键词（"文档""知识库"及标题本身）
- **展示字段**：
  - 主行：`文档标题`（title）
  - 副行：`所属分类`（如"客运服务""行李运输""战略文件"）
- **跳转**：跳知识门户 `/pc_client/ekb` 并定位该文档（entityId）
- 可扩展：更新时间、作者/发布部门、文档格式角标。

### 2.6 流程（processes）
- **数据源**：流程模块数据（Process）
- **可搜索字段**：流程标题 + 关键词（"流程""审批""申请"及标题本身）
- **展示字段**：
  - 主行：`流程标题`（title）
  - 副行：`当前节点 · 创建人`（如"待审批 · 梁吉力""已通过 · 关羽"）
- **跳转**：跳流程页 `/pc_client/process` 并定位该流程（entityId）
- 可扩展：发起时间、流程编号。

### 2.7 业务系统（business-systems）
- **数据源**：`src/pages/Business.tsx` systems 数据（categoryGroups：财务系统/人力系统/综合系统/运行系统/营销系统）
- **可搜索字段**：系统名称 + 关键词（"业务系统"及类别名）
- **展示字段**：
  - 主行：`系统名称`（title，与 Business 页 systems 数据同名同 id）
  - 副行：`所属类别`（如"财务系统""综合系统"）
- **跳转**：跳业务系统页 `/pc_client/business`（entityId，对应 systems id）
- 可扩展：系统图标、一句话简介（description 放 keywords 保留可搜性）。

### 2.8 系统应用（system-apps）
- **数据源**：globalSearch mock（常用功能 + 智能体）
- **可搜索字段**：应用名称 + 关键词（功能词，如"公文""周报""问答"）
- **展示字段**：
  - 主行：`应用/智能体名称`（title）
  - 副行：`所属类别`（常用功能 / 智能体，与 `anchor` 一致）
- **二级筛选**：`anchor` 字段 → 常用功能（common）/ 智能体（agents）
- **跳转**：跳对应页面路由（route target）
- 可扩展：应用图标、智能体头像。

## 3. 结果卡片通用展示规则

| 区域 | 内容 | 来源字段 |
| --- | --- | --- |
| 左侧图标 | 按分类固定的 lucide 图标（人员/群聊/聊天记录/日程/文档/流程/业务系统/智能体） | `category` → categoryIcons |
| 第一行 | 名称，搜索词高亮（amber 底色 mark） | `title` |
| 第二行 | 说明信息，搜索词高亮 | `description` |
| 右侧 | 箭头（ChevronRight） | — |

分区头展示：分类图标 + 分类名称 + 命中条数（如"人员 3 条"）。

## 4. 后续扩展建议

1. **新增搜索类型**时按"§1 通用结构"补 `category`、图标、分类标签，并加进 `GLOBAL_SEARCH_CATEGORY_ORDER`；类型枚举、标签、图标三处必须同步。
2. **新增可搜索字段**时优先放入 `keywords`（不影响两行展示），确需展示的再升级为 `description` 的一部分。
3. 副行统一采用"`字段A · 字段B`"间隔式（如"待审批 · 梁吉力""梁吉力 · 2025-05-22 09:00-18:00"）；某类型无副行字段时 `description` 置空，结果行不渲染第二行。
4. 接入真实后端后，各类型字段映射关系（源数据字段 → title/description/keywords/target）可按本文 §2 的表格直接转换。
