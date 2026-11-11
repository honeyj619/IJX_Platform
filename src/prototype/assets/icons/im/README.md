# 消息模块线稿图标（本地占位，待正式品牌图标包替换）

- 状态：**临时占位资产**，不是正式品牌图标；按 `DESIGN_SYSTEM.md §5`，已在本文件与 `harness/tasks/CURRENT.md` 明确登记，待设计交付正式图标包后整体替换。
- 来源：本轮 P1 由工程按统一线稿语言生成的本地占位，**不冒充正式品牌图标**，不引入远程资源。
- 规格：`viewBox="0 0 24 24"`、`fill="none"`、`stroke="currentColor"`、`stroke-width="1.7"`、圆角线端；颜色由 `ImIcon.vue` 的 `currentColor` 继承，激活态可用 `brand` 属性切品牌玫红。
- 用法：`<ImIcon name="search" :size="20" />`；`ImIcon.vue` 通过 `import.meta.glob('?raw', eager)` 载入，构建期内联，无运行时网络请求。
- 与底部 TabBar 的品牌 PNG 图标保持「同一黑色线稿 + 品牌粉点缀」设计语言；正式图标包到位后需同步替换 TabBar 与此处，确保同族。
