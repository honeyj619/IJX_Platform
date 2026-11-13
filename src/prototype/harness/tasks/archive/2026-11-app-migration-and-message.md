# 2026-11 App 迁移与消息模块归档

本文件归档 2026-11-11 已完成的治理迁入与消息模块 P0/P1/P2 工作。完整逐项记录可从主仓接管提交 `754cbdd` 的 `src/prototype/harness/tasks/CURRENT.md` 查看。

## 已完成范围

- App Harness 与版本化参考图迁入 `src/prototype/harness/`。
- 明确 `src/prototype/` 为唯一权威实现，`IJX_App` 退役。
- 消息模块完成会话、搜索、单聊、群聊、通讯录、服务号、持久化和状态闭环。
- Vue Router 建立 5 个一级入口和 14 条消息二级路径。
- 工程检查覆盖类型、构建和 19 条 App 路由冒烟。
- 下载页 iOS、Android 到 Vue App 的链路已验证。

## 稳定决策

- 消息页使用结构性基线与 `spec-*` 组件规范，不新增 `page-message*` 页面截图。
- 原型保留 `zustand/vanilla + persist`，仅用于 `src/prototype/im/` 状态持久化。
- 未开放能力统一明确标记“暂未开放”，不得伪装真实成功。

## 验证摘要

- `npm run check`：退出 0，19/19 路由通过。
- 下载链路：10/10 通过，无新增控制台错误。
- 360、375、480px：无横向溢出。
- 第三方资源请求：0。

此记录不再作为活动任务；后续任务不得继续向本文件追加过程日志。
