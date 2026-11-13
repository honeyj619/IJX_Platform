# IJX_App 迁移与退役审计

审计日期：2026-11-13

## 1. 结论

- 员工端 App 唯一权威实现：`IJX_Platform/src/prototype/`。
- 唯一权威 Harness：`IJX_Platform/src/prototype/harness/`。
- 实际发布链路：`IJX_Platform` 主仓构建并通过 `/app/prototype/*` 发布。
- 历史仓库 `honeyj619/IJX_App` 不参与主仓依赖、构建、路由或 GitHub Pages 发布。
- `IJX_App` 仅保留历史，不再接受功能开发、设计整改或 Harness 更新。

## 2. 基线

| 项目 | 提交 |
| --- | --- |
| 独立仓迁移前基线 | `65a5af3` |
| 独立仓退役合并提交 | `4801fa8` |
| 主仓接管基线 | `754cbdd` |

退役标签：`archive-before-platform-integration-20261113`，指向 `4801fa8`。

## 3. 迁移结果

主仓已经包含并继续维护：

- Vue 3 应用壳、Vue Router 与 React 宿主挂载逻辑。
- 首页、日程、工作台、消息、我的五个一级入口。
- App 图片、图标、Token 与公共组件。
- 完整 Vue 消息模块、二级路由、状态与本地持久化。
- App Harness、参考图和工程验收规则。

独立仓中仍存在的旧 `Message.vue`、旧构建产物和历史工具仅用于追溯，不得回迁覆盖主仓。

## 4. 历史分叉处理

审计期间发现独立仓远端存在 2026 年 7 月的六个旧复刻提交。退役合并提交 `4801fa8` 已把该分叉历史纳入主线，未删除提交历史。

该分叉包含旧页面、构建产物和历史依赖目录，不代表当前产品实现，也不得成为恢复开发的依据。

## 5. 后续约束

- 新 App 需求只修改 `src/prototype/`。
- App 长期规则只修改 `src/prototype/harness/`。
- 跨端入口只在 `src/App.tsx`、`src/pages/Download.tsx` 与 `docs/APP_ROUTES.md` 维护。
- 禁止建立主仓与 `IJX_App` 的双向同步。
- 独立仓完成最终说明修正后设置 GitHub Archive，以物理阻断旧会话继续推送。
