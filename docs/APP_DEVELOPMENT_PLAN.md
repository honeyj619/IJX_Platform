# IJX Platform App 端页面开发方案

> 版本：1.0（规划稿，待评审）
> 日期：2026-11-05
> 依据材料：6 张 App 截图、IM 原型 `index.html`（3745 行单页）、既有 `docs/APP_ROUTES.md` 与客户端设计规范

## 1. 参考材料分析

### 1.1 App 截图（6 张）

App 为 5 Tab 结构：**首页 / 日程 / 工作台 / 消息 / 我的**。

| 页面 | 内容要点（OCR + 取色） |
| --- | --- |
| 首页 | 顶部紫罗兰渐变 banner（`#C492D1 → #D6BAE3`）；快捷服务宫格（通讯录/待办流程/流程中心/会议室/公司值班…）；通知公告列表（含文号）；企业文化/福利中心；精品推荐双列卡片（机票+酒店、吉祥航空熊猫公仔）；信息通知（内部招聘/花吉食/生日福利） |
| 日程 | 2026 年 11 月月历（含节气"小雪"、农历日期），任务区（待处理 0 / 已处理 7，含"提醒我"时间戳、创建人/参与人） |
| 工作台 | "我的工作台"宫格（推荐应用/综合服务，如我的邮箱、工作汇报、航卫管理、通讯录、流程中心、我的考评、车辆管理、智能会议、AOC 大厅…），顶部搜索 + 编辑模式 |
| 消息 | 当前为占位（本方案将其接入 IM 原型） |
| 我的 | 名片卡（梁吉力 · 产品经理 · 信息管理部-管理支撑产品处 · 入职天数）；功能列表（我的薪酬/我要打卡/我的福利/吉食GO/我的邮箱/梧桐云学堂/我的资源/帮助与反馈/账户安全中心/退出账号）；钱包（余额 ¥68.35、付款码） |

视觉基调：页面底色 `#F7F8FA`，白色卡片，Tab 选中与关键状态为**玫红**（`≈#E34274`，日期高亮 `≈#D8486C/#E46084`），首页头部为紫罗兰渐变。

### 1.2 IM 原型（index.html + store.js）

- 独立单页应用，360px 手机壳；自带 4 Tab：**消息 / 通讯录 / 工作台 / 我的**（原型结构，仅作功能参考）。
- 页面视图约 28 个（`renderApp` 的 page 清单）：会话列表、聊天页、搜索、会话内搜索、会话信息、回执、通讯录、群聊（资料/成员/公告/文件/名单）、我的/设置、工作台应用、扫码、建群（选人/信息）、话题及成员、加入申请、置顶/合并详情、定时、指令、投票、通话等。
- 消息类型：text / image / video / voice / file / card / article / emoji / call / vote / chain / merge / topic，支持引用、编辑、定时、阅后即焚、表情回应、已读回执。
- **store.js 提供完整 mock 数据模型与功能函数蓝本**：`ME`/`CONTACTS`/`ORG_TREE`/`DEFAULT_GROUPS`/`DEFAULT_SESSIONS`/`DEFAULT_MESSAGES`（全消息类型示例），以及会话/群/消息操作（发送、编辑、撤回、删除、置顶、表情、投票、接龙、合并转发、搜索、回执、通话记录等）与 localStorage 持久化逻辑。
- 页面实现依赖外部 store JS（`identity-store.js`、`im-app-store.js` 等，未随材料提供）→ 无法直接 iframe 挂载运行。

### 1.3 结论

IM 原型无法以 iframe 原样嵌入，且与 React 项目技术栈不匹配。采用**在 App 内以 React 组件重写 IM 功能（mock 数据）**的方案。**IM 只参考原型的功能与交互结构，样式统一使用 App 系统玫红体系**（`docs/APP_UI_GUIDELINES.md` 第 2-4 节令牌），不使用原型蓝色视觉。

## 2. 总体架构

- 顶层 5 Tab：首页 `/app/home`、日程 `/app/schedule`、工作台 `/app/workbench`、消息 `/app/messages`、我的 `/app/me`；全部为 Android/iOS 共享页（不带平台段）。
- 消息 Tab 承载 IM 功能模块：会话列表、聊天页、搜索、历史、会话信息、通讯录、群聊、话题等全部作为 `/app/messages/*` 子页面；IM 原型自带的「工作台」「我的」由 App 系统 Tab 承担，不建立独立 IM 版本。
- 平台规则沿用：共享页不带平台段；明确平台差异页用 `/app/<platform>/<section>`；`useAppPlatform()` 读取平台。
- **App 壳层与 IM 模块统一使用系统玫红体系**（`docs/APP_UI_GUIDELINES.md` 令牌）；IM 仅参考原型的功能与交互结构。
- 数据全部为 mock（复用 `src/data/people.ts` 主用户梁吉力），不新增后端服务。

## 3. 页面清单与实施阶段

### P0 — IM 核心闭环（先交付可演示的消息链路）

| 页面 | 规范 URL | 要点 |
| --- | --- | --- |
| 消息列表 | `/app/messages` | 会话列表：筛选（全部/未读/@消息）、未读角标、置顶/星标/免打扰标记、最后消息预览；顶部搜索入口与"+"菜单 |
| 会话详情 | `/app/messages/session/:sessionId` | 聊天页：消息气泡（全类型）、输入栏 + 快捷面板（表情/图片/文件/语音/定时/截屏）、消息长按菜单、表情回应 |
| 全局搜索 | `/app/messages/search` | 联系人/群聊/聊天记录三结果区 + 类型筛选 |
| 会话内搜索 | `/app/messages/history/:sessionId` | 关键词 + 筛选（发送人/成员/时间/类型） |
| 会话信息 | `/app/messages/session-info/:sessionId` | 成员/群信息、置顶、星标、免打扰、清空/删除会话 |

### P1 — IM 完整与 App 其余页面

| 页面 | 规范 URL | 要点 |
| --- | --- | --- |
| IM 通讯录 | `/app/messages/contacts` | 组织架构目录、员工服务、服务号 |
| 群聊管理 | `/app/messages/group/:groupId`（资料/成员/公告/文件/名单/话题） | 群资料、成员管理、公告、文件、禁言/白名单/黑名单 |
| 建群/加入 | `/app/messages/groups/create`、`/app/messages/groups/join` | 选人页、群信息页、申请列表 |
| 话题 | `/app/messages/topic/:topicId` | 话题详情、话题成员、成员管理 |
| 转发/合并 | `/app/messages/forward`、`/app/messages/merge/:mergeId` | 转发会话选择、合并记录详情 |
| App 首页 | `/app/home` | 渐变 banner、宫格、公告、福利、精选（按截图还原，替换当前骨架） |
| App 日程 | `/app/schedule` | 月历（节气/农历）、任务列表（待处理/已处理） |
| App 工作台 | `/app/workbench` | 应用宫格（推荐/综合服务）+ 编辑模式、搜索 |
| App 我的 | `/app/me` | 名片卡、功能列表、钱包、退出 |

### P2 — IM 高级交互（可选，按演示需要裁剪）

回执与已读列表、投票/指令卡片、阅后即焚、定时消息、语音/视频通话（控制台/网格）、扫码、工作台应用页（iframe 占位）、加入申请审批。

## 4. Mock 数据模型（`src/data/`）

IM 数据以 `store.js` 为结构蓝本（`ME`/`CONTACTS`/`ORG_TREE`/`DEFAULT_GROUPS`/`DEFAULT_SESSIONS`/`DEFAULT_MESSAGES`），按项目规范调整：

- `im/contacts.ts`：联系人（复用 `people.ts` 与 `getDemoPerson()`；**主用户=梁吉力**，演示联系人沿用原型演示名）。
- `im/sessions.ts`：会话（单聊/群聊；unread/pinned/starred/muted/lastTime）。
- `im/messages.ts`：消息（类型联合：text/image/video/voice/file/card/article/emoji/call/vote/chain/merge/topic；引用/回应/回执/定时/阅后即焚）。
- `im/groups.ts`、`im/topics.ts`：群与话题（群资料/成员/公告/文件/名单，参照 store.js 群操作函数）。
- `im/orgTree.ts`：组织架构树（参照 `ORG_TREE`）。
- `home.ts`、`calendar.ts`、`workbench.ts`、`profile.ts`：首页/日程/工作台/我的页面 mock。

## 5. 目录结构（`src/pages/app/`）

```
app/
  AppLayout.tsx        # 移动端外壳（骨架已就绪；后续加 5-Tab 栏）
  appPlatform.ts       # 平台解析（已就绪）
  AppHome.tsx          # 首页（当前骨架 → P1 按截图还原）
  AppSchedule.tsx      # 日程
  AppWorkbench.tsx     # 工作台
  AppMe.tsx            # 我的
  messages/            # IM 模块
    MessagesHome.tsx   # 会话列表（P0）
    SessionChat.tsx    # 会话详情（P0）
    SearchPage.tsx     # 全局搜索（P0）
    HistoryPage.tsx    # 会话内搜索（P0）
    SessionInfo.tsx    # 会话信息（P0）
    ContactsTab.tsx    # 通讯录（P1）
    GroupPages.tsx     # 群聊管理（P1）
    TopicPages.tsx     # 话题（P1）
    ...
```

## 6. 交互与视觉约定

- App 页面遵循 `docs/APP_UI_GUIDELINES.md`（官方 Vant 令牌：玫红 MR 体系 + 紫罗兰首页头 + 浅灰底白卡片）。
- IM 页面功能与交互按原型还原，**样式统一使用系统令牌**（自聊气泡 MR 玫红、对方气泡白底 N 系边框；导航栏/按钮/表单/空状态用系统组件基线）。
- 删除/清空/覆盖类操作必须有确认弹框；新增交互有可见反馈（toast/选中态）。
- 会话与页面状态用组件内 state / zustand；消息收发为前端模拟（点击发送 → 回执"已发送"）。

## 7. Harness 更新

- `docs/APP_ROUTES.md`：登记本方案全部规范 URL（共享页 + IM 子页 + 平台差异规则）。
- `docs/APP_UI_GUIDELINES.md`：新增 App 端视觉基线（从截图提炼，待设计稿校准）。
- `Agents.md`：路由规则与 UI 规范章节补充 App/IM 必读引用。
- `tasks/CURRENT.md`：记录本方案与后续实施验证结果。

## 8. 实施顺序与验证

1. P0 IM 核心闭环 → `npm.cmd run check` + `build` + 浏览器验证（下载页入口 → 消息 Tab → 会话 → 输入/回应 → 搜索/历史 → 返回；刷新与前进后退）。
2. P1 App 其余页面 + IM 完整 → 同上逐页验证。
3. P2 高级交互按需。
4. 每轮验证结论写入 `tasks/CURRENT.md`；用户验收后再提交推送。
