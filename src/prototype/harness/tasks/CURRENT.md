# 当前任务

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

## 阶段二三第二轮整合修复（2026-11-10，已归档）

### 基本信息

| 项 | 内容 |
| --- | --- |
| 任务名称 | i吉祥员工端 —— 阶段二三第二轮整合修复（保留式修复，不重做页面） |
| 依据 | `C:\Users\jjie6\Documents\new ijx()\GLM5.3-阶段二三第二轮整合修复开发方案.md` |
| 依据顺序 | 用户本轮明确要求 > `page-home.jpg` / `page-profile.jpg` > `spec-*` > 长期 Harness > 当前源码 |
| 状态 | **待人工确认**（工程检查、浏览器实测与 14 张真实截图均已完成） |
| 技术边界 | 继续 Vue 3 + Vue Router + Vite + 现有 Token；不新增组件库、状态管理、后端、远程资源或生产依赖 |

### 用户覆盖规则（本轮明确，优先于旧参考图与旧 Harness）

1. “我的”顶部：**无左侧返回**；右侧恰好两个同族线稿图标，顺序为**退出（门形）+ 设置（齿轮）**，退出打开页面内确认层，设置给非阻塞轻提示。
2. **删除页面底部独立“退出账号”按钮**及对应模板/CSS/状态；末菜单组与底栏之间不得留大块空洞。
3. 背景资源只含天空与飞机，360/375/480px 下均不得出现被烘焙的退出门图标、状态栏、资料卡或文字 UI。
4. 首页助手：**水平居中**、文案精确为“问问您的如意助手”、本地干净人物头像、首屏实底 / 下滑半透明 / 回顶恢复。

### 范围与影响文件

- 修改：`src/views/Home.vue`、`src/views/Profile.vue`
- 资源重裁：`src/assets/profile/bg-sky.png`、`src/assets/home/news-logo.png`、`src/assets/home/assistant-avatar.png`（圆形 alpha 蒙版）、`src/assets/icons/ws/ws-all.png`
- 工具：`tools/stage23-repair/extract-r2-assets.ps1`（唯一权威可重复坐标脚本，含 bg-sky）、`extract-r2-review.ps1`（参考图条带定位）、`extract-r2*.ps1` / `extract-ws-all*.ps1`（改为委托，避免旧错误坐标回退）、`crop-zoom.ps1`、`cdp-harness.mjs`、`r2-verify-and-shots.mjs`、`shots/*`
- 文档：`docs/PRODUCT.md`、`docs/REFERENCE_BASELINES.md`、`tasks/CURRENT.md`
- **未修改**：`Schedule.vue`、`Workspace.vue`、`Message.vue`、路由、`TabBar.vue`、`package.json` 依赖、后端 / 部署 / Git 配置
- 阶段二已通过的日程、任务、工作台未顺手重写；首页只复用工作台 `ws-00..ws-04` 资源。

### 完成内容

| 级别 | 项 | 结果 |
| --- | --- | --- |
| P0 | `bg-sky.png` 退出门 UI 污染 | 重裁为 x0-640 / y84-294 纯天空+飞机；480px 放大复核无退出门、无状态栏、无资料卡（机身涂装文字为飞机自身品牌标识） |
| P0 | “我的”顶部结构 | 左侧返回移除；右侧仅退出+设置（门形 / 齿轮，同色 #333、同线宽、44×44 点击区、无圆底） |
| P0 | 底部退出账号 | 模板/CSS/状态全删；退出确认层改由顶部图标触发；末菜单组与底栏间距实测 16px，无空洞 |
| P1 | 四待办数字 | 62 / 7 / 99 为 `--mr` 粉底白字 18px 角标气泡；今日日程 `count=null` 不显示横杠、0 或空气泡；数据仍来自 `todoEntries` |
| P1 | 快捷应用 | 第一行 5 项直接复用 `ws-00..ws-04`；第二行改用 5 列 grid，“全部”位于第一列左对齐，图标为同族四宫格 `ws-all.png` |
| P1 | “全部”跳转 | `onQuickApp` 统一 `router.push('/workspace')`；直接点击与搜索结果点击均实测进入 `/workspace` |
| P1 | i快讯 | 白色圆角资讯卡：左侧本地 i快讯品牌标识（重裁）+ 右侧 DOM 标题；删除黄色胶囊/橙字/通用箭头 |
| P1 | 企业页签 | `grid-template-columns: repeat(4, minmax(0,1fr))` + `nowrap` + 4-6px 内边距；360/375/480 单行且无文字裁切 |
| P1 | 如意助手 | 画布水平居中（`left:50%` + `translateX(-50%)`），`--tabbar-total` 避让，本地头像，白胶囊 + 渐变文字；`IntersectionObserver` 两态；`prefers-reduced-motion` 降级；底部避让增至 `tabbar + 68px` |
| P1 | 精品推荐 | N1 区块背景 + 四张独立白底圆角卡，图片上圆角，DOM 标题/标签/价格在白底正文中 |
| P1 | 图标一致性 | 首页快捷入口用工作台同族 PNG；“我的”四高优入口为黑线稿 + `#F53A71` 粉点缀，无方块底 |
| P2 | 验收截图 | 14 张真实独立截图（13 张规定 + 1 张真实 200% 缩放）；根目录 SHA-256 零重复；旧 21 张移入 `archive-round1/`；480 全页高度由 `Page.getLayoutMetrics` 实测为 2485px，无假 6800px 空白 |
| P2 | 工程临时文件 | `vite.config.js.timestamp-*.mjs` 已不存在于 `git status --short` |

### 验证证据（2026-11-10 实测）

- `npm run check` 退出 **0**（vite build 104 模块 + 5 路由 smoke 全 PASS）；`git diff --check` 退出 **0**。
- CDP 直连浏览器断言 **36 / 36 PASS，0 FAIL**，覆盖 360 / 375 / 480px；控制台 error / exception **0**；第三方资源请求 **0**；所有图片 `naturalWidth > 0`。
- 交互实测：点击“全部”→`/workspace` ✓；搜索命中“全部”→`/workspace` ✓；助手首屏不透明 / 下滑 `rgba(255,255,255,.78)` 半透明 / 回顶恢复实底 ✓；助手面板打开、关闭按钮、遮罩关闭 ✓；顶部退出→确认层→取消返回 / 确认轻提示 ✓。
- 遮挡实测：滚动到底部时最后一张推荐卡 `bottom ≤` 助手 `top` ✓；Profile 末菜单组与底栏间距 16px ✓；三宽度无横向溢出 ✓。
- 截图清单（`tools/stage23-repair/shots/`，尺寸为实际 PNG 像素，哈希为 SHA-256 前 12 位；机器可读清单见 `manifest-r2.json`）：

| 文件 | 尺寸 | 字节 | SHA-256(12) |
| --- | --- | --- | --- |
| `360-home-top.png` | 720×1080 | 288745 | `15e6a9f863f1` |
| `360-home-news-docs.png` | 720×1560 | 359837 | `eb2a990f4fc9` |
| `360-home-travel.png` | 1440×1684 | 1433101 | `2dce95bf3320` |
| `360-home-assistant-top.png` | 720×1560 | 490915 | `3724aa0bf19d` |
| `360-home-assistant-scrolled.png` | 720×1560 | 403364 | `3110cb41b9e4` |
| `360-home-bottom.png` | 720×1560 | 678575 | `c78b7efe9a6c` |
| `360-profile-top.png` | 720×1560 | 359969 | `bd90f9e05c2e` |
| `360-profile-bottom.png` | 720×1560 | 334761 | `2c5d712850f2` |
| `360-home-zoom200.png` | 720×1560 | 491109 | `0817f2a351ce` |
| `375-home-top.png` | 750×1560 | 518266 | `5775dfaa9c60` |
| `375-profile-top.png` | 750×1560 | 374972 | `d2272e8b8de5` |
| `480-home-top.png` | 960×1800 | 720434 | `ffe2b6fccd21` |
| `480-profile-top.png` | 960×1800 | 483502 | `4e4af63c7a7c` |
| `480-home-fullpage.png` | 480×2485 | 686876 | `56957a4219cb` |

### 已知限制与未验证项

- 悬浮助手在首屏视口底部会覆盖“企业信息”页签行中间两项；页面滚动后这些页签可正常点击（可恢复操作）。方案要求 fixed 居中且具备两态，属固有遮挡；是否改为内容流式胶囊待产品确认。
- 参考图裁切的演示资源（i快讯标识、助手头像、商品/旅行/横幅/天空）仍待正式素材替换；助手面板仍是结构性占位。
- 200% 缩放只验证首页可读与助手可见，未逐区块比对；未做真机、Safari 与深色模式验证。
- `Message.vue` 仍为旧结构（阶段四范围），本轮未动。

### 待人工确认

1. 13 张规定截图 + 200% 缩放截图的视觉验收（尤其 480-profile-top 背景纯净、助手两态、精品推荐白卡）。
2. 首屏助手对页签行的局部遮挡是否接受；若否，下一轮改为非 fixed 的内容流式胶囊。
3. 正式素材替换时机与助手面板正式能力范围。

### Harness 更新情况

- `docs/PRODUCT.md`：首页结构（角标 / 全部 / i快讯 / 页签 / 白卡 / 助手两态）、“我的”顶部退出+设置且无左侧返回与底部退出、当前实现状态、资源脚本入口。
- `docs/REFERENCE_BASELINES.md`：`page-home.jpg` / `page-profile.jpg` 基线说明登记用户覆盖规则；首页与“我的”接受标准同步。
- `tasks/CURRENT.md`：本记录；修正上一轮“31 张截图全部有效”的作废结论。
- 长期 Harness 变更来源均为用户 2026-11-10 明确要求，已落到 `Home.vue` / `Profile.vue`。

### Git 状态

**未提交、未推送、未部署**；工作区保留阶段一至三既有未提交改动（含 `dist/` 旧产物），本轮未覆盖无关文件。

---

## 基本信息（阶段二三修复轮，已归档）

> 以下存档记录中的“返回/设置”“底部退出账号”“31 张截图全部有效”“480×6800 全页”等描述均为上一轮状态，已被本轮用户覆盖规则与重拍截图取代，不代表现行实现，也不得据此恢复旧 UI。

- 任务名称：i吉祥员工端原型 —— 阶段二三验收缺陷修复（资源重裁 + 页面重排 + 日程新增闭环）
- 提出日期：2026-11-10
- 任务类型：阻断级视觉缺陷修复（P0×4）、高优先级交互补齐（P1×6）、阶段二最低闭环
- 依据文档：`GLM5.3-阶段二三验收与修复开发方案.md`（用户目录）
- 状态：**已归档，被第二轮整合修复取代**（本轮旧截图证据已移入 `tools/stage23-repair/shots/archive-round1/`，不再作为有效验收证据）

## 修复根因

阶段三资源裁切按粗略纵坐标执行、未验证裁切内容，把含 UI 文案的截图块当纯图片接入页面，DOM 又绘制同样内容，造成重复状态栏/城市/搜索/待办/标题/价格。本轮全部资源按像素行/列扫描坐标重裁，接入前逐张验证。

## 资源修复清单

| 资源 | 新坐标（源图 1080 宽） | 验证结果 |
| --- | --- | --- |
| hero-brand.png → **hero-art.png** | home y480-810 品牌美术字+云层 | 顶部 60px 文字能量=2（无状态栏/城市/待办）；旧文件已删除 |
| banner-strategy.png | home y1470-1760 | 中带 RGB(123,171,212) 蓝色主导 ✓（旧资源实为企业信息页签） |
| banner-culture.png | home y3010-3270 | 无白边 |
| goods-1/2/3.png | y4330-4550 三列纯商品照 | 无标题/价格文字带（能量=10） |
| travel-1/2/3/4.png | y5035-5295 / y5675-5935 | 无相邻卡内容；四张唯一不复用 |
| about-1/2/3.png（新增） | y3330-3540 三入口图 | 无文字（标题由 DOM） |
| welfare-1/2.png（新增） | y3890-4110 两图卡 | 无文字 |
| bg-sky.png | profile y78-278 干净天空 | 避开状态栏/角标/资料卡/头像 |
| avatar-liangjie.png | profile y340-540 | 头像主体 |
| banner-wifi.png | profile y990-1248 | **含完整首行文案**（旧资源 y1080 起丢字） |

裁切脚本：`tools/stage23-repair/extract-*.ps1`（可重复执行）。

## 页面修复

### 首页（Home.vue 重写）
品牌区改渐变天空 + 全 DOM（城市/扫码/铃铛55/搜索/四待办白线稿）；hero-art 纯画面在四待办后；快捷应用一行 5+全部（无方块底）；企业信息无大标题、公司文件浅粉胶囊激活；关于吉祥标题卡外+三入口图；福利两图片卡；商城 3 卡/精品 4 卡纯图+DOM 文字；搜索实时分组筛选+BaseEmpty+清空；今日日程→/schedule、待办流程→/workspace、铃铛→/message；图标按钮 ≥44×44。

### 我的（Profile.vue）
黑色线稿返回/设置（无圆底）；独立浅金入职纪念条+铃铛；四入口纯黑线稿无方块底；钱包白卡（黑标题+粉 ¥68.35+浅金付款码胶囊+二维码图标+淡纹样）；两组菜单 5 个线稿图标；Wi-Fi 完整横幅。

### 日程（Schedule.vue 新增闭环，不重写已有结构）
FAB 按标签开底部表单（日程：标题/日期/时间；任务：标题/提醒时间）；必填错误→取消→提交中（600ms）→成功；新日程=选中日事件点（9→10）+日程列表反馈；新任务=待处理 0→1（数组派生）；"恢复演示数据"清新增回基线；已处理 7 条与 2026-11 日历无回归。

## 验收证据

- 工程：`npm run check` 退出 0（5 路由 PASS）；`git diff --check` 退出 0。
- 遗留扫描：无 alert(/FA/DiceBear 依赖/via.placeholder/旧红（唯一命中为 people.ts 注释"替代远程 DiceBear"文字，非引用）。
- 360 断言：单城市/单搜索/四待办在品牌区、无重复状态栏、5+全部、无"企业信息"大标题、粉胶囊、商品 3 图唯一、旅行 4 卡价格单次、末项不遮（700≤729）、我的背景 720×200 干净、单一"梁劼"、独立纪念条、四入口无底、白卡钱包粉余额、5 菜单图标+18 角标、Wi-Fi 完整、表单必填/事件点/待处理 0→1/恢复/已处理 7 全过。
- 375/480：无横向溢出、FAB 画布内、0 控制台错误；200% 缩放三页可访问；第三方请求 0、图片全加载。
- 截图（已作废结论）：上一轮 `tools/stage23-repair/shots/` 的 31 张截图**并非全部有效**——存在三组完全重复哈希、伪 200% 缩放截图（复制普通截图改名）与固定 6800px 假全页（后半段空白）。本轮已重拍 14 张独立截图并归档旧文件至 `archive-round1/`。

## 已知差异（中/低）

- 中：头像为参考图裁切块保真度待确认。
- 低：商品/旅行/关于/福利图为演示裁切资源待正式素材替换（PRODUCT.md 已标记）；公文 5 条为演示数据。

## 待产品经理确认

1. 方案第八节五张人工验收图（360 首页首屏/商城/末屏、我的首屏/钱包区）。
2. 演示图替换正式素材时机。
3. Message.vue 属阶段四（本轮未动，已登记）。

## 改动文件

- 重写 `src/views/Home.vue`；修改 `Profile.vue`、`Schedule.vue`、`docs/PRODUCT.md`、`tasks/CURRENT.md`
- 资源：home 13 张（含删除 hero-brand.png）+ profile 3 张重裁
- 工具：`tools/stage23-repair/*`
- 未修改：`Message.vue`、`router/index.js`、`TabBar.vue`、`package.json` 依赖、后端/部署/Git 配置；未提交未推送未部署

---

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

## 以下为阶段一至三存档

## 存档：阶段三（首页与我的页面保真改造，2026-11-10）

## 用户问题（阶段二）

现有日程页与工作台页仍是旧实现：

- 日程页硬编码“2026年7月”、已处理任务**有数据（7 条）却不渲染列表**（模板缺 v-else）、日历缺农历/节气/事件点的准确数据、存在非基线的事件列表块、FAB 靠写死 70px 避让。
- 工作台页使用 Font Awesome 图标、含“最近使用/快捷入口”等与基线不符的旧结构、搜索不做真实筛选、`alert()` 冒充交互、残留旧红 `#d93030`。

需要先改这两个页面，用于校准共享组件与图标语言。

## 参考基线

- B 级（页面结构）：`page-schedule-calendar.jpg`、`page-schedule-empty.jpg`、`page-schedule-completed.jpg`、`page-workspace.jpg`
- A 级（Token/组件，沿用阶段一）：`spec-colors.png`、`spec-typography.png`、`spec-button.png`、`spec-empty.png`、`spec-field.png`
- C 级：`AGENTS.md`、`docs/PRODUCT.md`、`docs/DESIGN_SYSTEM.md`、`docs/PROTOTYPE_RULES.md`、`docs/REFERENCE_BASELINES.md`
- D 级（仅记录差距）：当前 `src/views/Schedule.vue`、`src/views/Workspace.vue`

## 阶段二目标

### 日程页

1. 顶部「日程 / 任务」大文字标签（非胶囊），激活项下有粉色短下划线。
2. 日程视图：白色日历卡，左上“2026年11月”，右上蓝色「今天」；星期行 日一二三四五六。
3. 选中/今天 = 5 号：粉色实心圆 + 白色数字/农历「廿七」。
4. 日期格底部**粉色事件小圆点**：当月 3、10、12、17、19、24、26 日；12 月溢出日 1、3 日也带点。
5. 农历/节气：7 日“立冬”、22 日“小雪”蓝色；11 日“光棍节”、26 日“感恩节”灰色；其余显示农历日名；12 月溢出日 1–5 置灰。
6. 删除非基线的日历下方事件列表块；日历下方放淡灰风景装饰图。
7. 任务视图：胶囊分段「待处理 0」（浅粉底深玫红字）/「已处理 7」（浅灰底灰字）。
8. 待处理空状态：淡灰风景画 + 居中“暂无数据”。
9. 修复并渲染**已处理 7 条任务卡**（粉圆白勾 + 标题 N8 + 金色“提醒我:YYYY-MM-DD HH:mm”），标题/附加行严格按基线原文。
10. FAB：金色/驼色圆 + 白色“+”，固定定位在底栏正上方，用 token 避让底栏，不重叠、不遮挡内容。

### 工作台页

11. 全页白底连续内容，分组间用 N1 灰条分隔。
12. 顶部 N2 圆角胶囊搜索：左放大镜 + 居中“搜索”占位；**搜索必须真实筛选**（按应用名称过滤宫格，无结果时给空状态）。
13. 「我的工作台」粗标题 + 右侧浅粉底「编辑」。
14. 我的工作台宫格：行1 会议室/通讯录/流程中心/员工活动室；行2 公司值班（仅 1 个）。
15. 推荐应用（3 个）：员工活动室/通讯录/流程中心。
16. 综合服务 4 行×4 列：我的邮箱/流程中心/会议室/公司值班；工作汇报/我的考评/AOC大厅/健康云；航卫管理/车辆管理/智能会议/质量管理；低代码平台/SMS上报/SMS核查/网上报。
17. 图标语言统一为**黑色线稿 + 品牌粉色点缀**（使用已裁切的 `ws-00..ws-23.png`），移除 Font Awesome。
18. 移除“最近使用 / 快捷入口 / 常用应用”等旧结构；不使用 `alert()`；清除旧红 `#d93030`。

## 影响文件

- 修改：`src/views/Schedule.vue`、`src/views/Workspace.vue`
- 新增：`src/assets/empty/schedule-deco.png`（自 page-schedule-calendar.jpg 裁切的淡灰风景画）
- 沿用（不改）：`src/styles/tokens.css`、`src/styles/base.css`、`src/components/*`、`src/assets/icons/ws/ws-00..23.png`、`src/assets/icons/tab/*`
- 临时：`tools/stage2/*`（裁切/检查脚本与条带，验收后清理）
- 不修改：`src/router/index.js`、`src/App.vue`、`src/main.js`、`src/data/people.ts`、`Home.vue`、`Message.vue`、`Profile.vue`、`package.json`

## 已处理 7 条任务（基线原文，顺序固定）

1. 确认poc参与方 —— 提醒我:2026-03-26 14:30
2. 通知poc线下安排 —— 提醒我:2026-03-31 16:33
3. i吉祥push流程地址修改 —— 提醒我:2026-04-01 09:43
4. i吉祥日程需求设计 —— 创建人:肖林川；参与人:梁劼√
5. 运维需求沟通 —— 提醒我:2024-07-12 09:22
6. 三季度绩效 —— 提醒我:2024-07-10 13:20
7. 酒店公寓项目结项材料 —— 参与人:梁劼√；提醒我:2024-05-27 10:10

## 需要覆盖的状态

- 日程：日历默认态、点击「今天」回到 5 号、点击日期切换选中、事件点显示、12 月溢出置灰。
- 任务：待处理（0，空状态）、已处理（7，列表渲染）。
- 工作台：默认结构、搜索有结果（实时筛选）、搜索无结果（空状态）、点击「编辑」的非 alert 反馈。
- FAB：在日程/任务两态均固定且避让底栏与安全区。

## 非目标（阶段二不做）

- 不改一级路由、五栏导航名称与底栏。
- 不改首页 / 消息 / 我的页面。
- 不替换 `people.ts` 的人名与 DiceBear 头像（阶段三处理）。
- 不做真实后端/持久化；搜索与勾选均为前端原型行为。
- 不提交、不推送、不部署；不覆盖用户已有 `package.json` 改动。

## 验收标准

- [ ] 日程/任务标签样式与基线一致（大文字 + 粉色短下划线；任务内为胶囊分段）。
- [ ] 日历为 2026 年 11 月：5 号粉色选中、农历/节气/节日文案与颜色正确、事件点日期正确、12 月溢出置灰。
- [ ] 「今天」点击后回到 5 号并切换到当月。
- [ ] 日历下方无非基线事件列表块，改为淡灰风景画。
- [ ] 待处理显示风景画空状态；已处理渲染 7 张卡片，标题/附加行与基线原文一致。
- [ ] FAB 固定于底栏正上方、用 token 避让，不与底栏重叠、不遮挡列表末项。
- [ ] 工作台结构为 搜索 / 我的工作台(+编辑) / 推荐应用 / 综合服务；无“最近使用/快捷入口”。
- [ ] 搜索真实筛选（含无结果空状态）；无 Font Awesome；无 `alert()`；无旧红。
- [ ] 360px 主验收截图（日程日历 / 任务已处理 / 工作台）+ 375px、480px 检查截图留存。
- [ ] `npm run check` 通过；`git diff --check` 通过。
- [ ] 改动文件均属本阶段范围；保留用户已有 `package.json` 修改。

## 待产品经理确认

- 综合服务末行第 4 项基线标签为“网上报”（OCR 小字略有不确定），先按此实现并标注。
- 工作台「编辑」无明确下一层基线：本轮已实现编辑态删除 + 删空提示 + “恢复初始”入口（非 alert 本地反馈，不新增路由）。

---

## 阶段二审计与验收记录（2026-11-10，已完成，待人工确认）

### 审计差异清单（审计 → 修复）

| 等级 | 差异 | 处理 |
| --- | --- | --- |
| 高 | 工作台搜索无结果时 `BaseEmpty` 无文案（只有插图） | 已修复：传入 `description="未找到相关应用"` |
| 高 | 编辑态删除全部“我的工作台”项后分组整体消失，无恢复途径（死状态风险） | 已修复：my 分组未搜索时常驻；删空显示提示行 + “恢复初始”按钮（初始快照恢复 5 项，toast 反馈） |
| 中 | 搜索输入无显式清空入口（仅靠手动删字符） | 已修复：有输入时显示圆形清空按钮（aria-label="清空搜索"） |
| 中 | 我的工作台分组用 `filteredSections[0]` 下标取数（方案点名的脆弱实现） | 已修复：统一改为 `sectionApps('my')` 按 key 取数 |
| 低 | 应用点击 toast 文案“打开「X」（原型占位）”语义不准 | 已调整：“「X」暂未开放” |
| 通过 | 日程页 15 项结构断言（标签/月份/今天/星期/农历/节气/节日/溢出/选中粉圆 rgb(245,58,113)/事件点 9 个/无旧事件列表/FAB） | 无需修复 |
| 通过 | 任务待处理空状态（暂无数据 + 装饰图）、已处理 7 条（标题/创建人/参与人/金色提醒与基线原文一致） | 无需修复 |
| 通过 | 日历交互（点击 10 日切换选中、“今天”回 5 号、点 12 月溢出日切换月份） | 无需修复 |
| 通过 | 24 项应用图标全部本地加载（naturalWidth>0）、四列网格、无“最近使用/快捷入口” | 无需修复 |
| 通过 | 搜索分组映射正确（“通讯录”命中 my+reco 两组、全部结果只含通讯录） | 无需修复 |

### 验收证据

- 工程：`npm run check` 退出 0（build 1.46s + 5 路由 smoke PASS）；`git diff --check` 退出 0；控制台 0 error。
- 遗留扫描：Schedule.vue / Workspace.vue 无 `alert(`、无 Font Awesome、无 `#d93030/#ff6b6b/#b82971`、无远程 URL/DiceBear/占位图服务。
- 交互（360px 真实渲染）：已处理末项 bottom=650 ≤ 底栏顶 729（不遮挡）；工作台末项不遮挡；FAB 480px 画布内（right=468≤480）；200% 文本缩放日历仍可读、FAB 可见；搜索清空按钮恢复 24 项；删空→提示行→恢复初始回 5 项。
- 断网降级：DOM 资源与 Performance 资源均 100% 同源（schedule 6 项 / workspace 23 项，第三方 0）——无远程依赖可致白屏。注：SPA 离线冷启动（首次加载即断网）任何 Web 应用均不可用，不属“远程资源降级”范畴。
- 截图（`tools/stage2/shots/`，15 张全部有效 PNG ≥51KB）：
  - 360px：schedule-calendar / task-pending / task-done-top / task-done-bottom / workspace-default / search-hit / search-empty / edit-empty / bottom / zoom200
  - 375px：schedule-calendar / workspace-default
  - 480px：schedule-calendar / task-bottom / workspace-bottom

### 本轮改动文件（阶段二范围内）

- `src/views/Workspace.vue`（空态文案、清空按钮、编辑恢复机制、分组取数、toast 文案）
- `tasks/CURRENT.md`（本记录）
- `tools/stage2/shots/*`（15 张验收截图）
- `dist/*`（运行 `npm run build` 的自然产物更新，非手改）

---

## 阶段一验证记录（2026-11-06，已完成，存档）

- 构建：`npm run check` 通过 —— `vite build` 52 模块转换成功；`check:pages` 5 路由 + 2 入口资源全部 PASS。
- 空白：`git diff --check` 退出码 0（仅 LF→CRLF 提示，无尾随空白/冲突标记）。
- 截图证据（`tools/stage1/shots/`，均为真实渲染）：`360-home.png`、`360-schedule.png`、`375-home.png`、`480-home.png`、`360-safearea-sim.png`。
- 成果：tokens.css（品牌/中性/功能色、T1-T10 字阶、安全区、间距、圆角、固定高度、层级）、base.css（app-container/字阶工具类）、App.vue 精简、index.html 清理、TabBar（本地 PNG 同族图标 + 主色激活 + 安全区）、BaseButton/BaseNavBar/BaseEmpty。
- 临时资源：`message-active.png` 无正式激活基线，为按主色派生件，待官方素材替换。

---

## 阶段三完成记录（2026-11-10，已完成，待人工确认）

### 我的（Profile.vue 重写）

- 结构（page-profile.jpg 自上而下）：航空背景（bg-sky.png 裁切）+ 返回/设置图标 → 白色人员卡（本地头像 avatar-liangjie.png、梁劼、女标识、名片标签、产品经理、信息管理部-管理支撑产品处、右箭头）→ 入职纪念条（固定文案"2023-07-03日加入，您在吉祥第1221天！"）→ 四高优入口（薪酬/打卡/福利/钱包，黑灰线稿 SVG+品牌粉底）→ 机上 Wi-Fi 横幅（banner-wifi.png）→ 吉食GO钱包卡（棕金渐变、¥68.35、付款码）→ 菜单一（邮箱/梧桐云学堂角标18/IT资源）→ 菜单二（帮助反馈/账户安全）→ 独立退出账号。
- 交互：梧桐云学堂点击角标本地清零 ✓；退出账号页面内确认层（取消/确认，原型反馈不伪造登出）✓；未开放功能统一轻提示（无 alert）✓；末项退出按钮不被底栏遮挡（bottom=714≤780-50）✓。
- 断言：15 项结构全过；旧"累计任务/完成率"统计区已移除。

### 首页（Home.vue 重写 + src/data/home.js）

- 结构（page-home.jpg 自上而下）：品牌头图（hero-brand.png）+ 上海市 + 扫码 + 消息铃铛（55 角标）+ 快捷服务搜索（可输入/清空）→ 四待办（未读公文62/待办流程7/今日日程—/我的课程99）→ 快捷应用六项（会议室/通讯录/流程中心/员工活动室/公司值班/全部）→ i快讯通知条 → 战略规划横幅（banner-strategy.png）→ 企业信息页签（公司文件默认含文号公文 5 条/会议纪要/通知公告/更多，切换同步）→ 关于吉祥（文化横幅 banner-culture.png + 如意飞翔/美好吉祥、信息通知/内部招聘、花吉食/今日菜单）→ 福利中心（工会福利专区/生日福利）→ 如意商城（横向滚动 3 商品 ¥55.00 起，goods 图）→ 精品推荐（双列 4 旅行卡，机票+酒店标签，travel 图）→ 如意助手悬浮胶囊（底部面板结构性占位）。
- 交互：铃铛真实跳转 /message ✓；通讯录/流程中心真实路由 /workspace ✓；页签切换激活态+列表同步 ✓；搜索清空按钮 ✓；商城横滚 scrollWidth>clientWidth ✓；如意助手面板开/关 ✓；16 项结构断言 + 15/15 图片加载全过。
- 移除：旧"最新动态/通知公告"社交模板、Banner占位、via.placeholder 远程图、alert()。

### people.ts DiceBear 移除

- 8 人头像改为本地 SVG data-URI（首字母+品牌浅粉底），不再请求 api.dicebear.com。

### 验收证据

- 工程：`npm run check` 退出 0（5 路由 smoke PASS）；`npm run build` 1.08s 退出 0；`git diff --check` 退出 0；两页控制台 0 error。
- 遗留扫描（Home/Profile/home.js/people.ts）：无 alert(、无 Font Awesome、无 d93030/ff6b6b/b82971、无 DiceBear、无 via.placeholder、无远程 URL（仅 SVG xmlns）。
- 200% 文本缩放：home 内容可读、如意助手可见 ✓。
- 断网：DOM 资源与 Performance 第三方请求均 0（全同源）✓。
- 截图（tools/stage3/shots/，15 张全部有效）：360×8（profile 首末屏/退出确认、home 首屏/企业信息/末屏/如意助手面板/zoom200）+ 375×2 + 480×5（含 home 全页 6000px、末屏底栏）。

### 与参考图的中/低等级已知差异

- 中：头像为参考图裁切块，比例接近但非精确圆形原位（保真度待产品确认）。
- 中：品牌头图裁切自参考图顶部 850px 区域，"心有吉祥 如意人生"文案包含在头图内（美术字保留于图内，符合方案对营销创意的规定）。
- 低：商品/旅行图为参考图区块裁切，具体商品与基线可能非一一对应（演示数据）。
- 低：企业信息公文 5 条为按截图格式构造的演示数据（结构/文号格式与基线一致）。

### 阶段三改动文件

- 重写：`src/views/Profile.vue`、`src/views/Home.vue`
- 新增：`src/data/home.js`、`src/assets/profile/*`（bg-sky/avatar-liangjie/banner-wifi）、`src/assets/home/*`（hero-brand/banner-strategy/banner-culture/goods-1,2/travel-1,2）
- 修改：`src/data/people.ts`（仅移除 DiceBear 远程头像）
- 工具与证据：`tools/stage3/*`（裁切脚本+截图 15 张）、`tasks/CURRENT.md`

**未修改**：Schedule/Workspace/Message、TabBar/Base* 组件、tokens.css/base.css、App.vue/main.js/router、package.json（除既有改动）。
