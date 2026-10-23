# 需求模式编辑指南（Requirement Editing SOP）

> 适用对象：项目唯一管理员（仓库协作者）。其他访问者无需阅读本文——线上需求为只读。

## 权限模型（为什么只有你能改）

本系统无账号体系，静态部署在 GitHub Pages。需求内容的**唯一变更通道是 commit 到 main 分支**：

- GitHub 账号即权限——能 push main 的人才能改需求数据，陌生人调任何接口都会被 GitHub 以 401 拒绝
- 需求编辑界面（增/删/改/排序/重新定位）**仅本机 dev 环境可用**：代码中由 `import.meta.env.DEV` 控制（`src/components/requirements/RequirementMode.tsx`），生产构建中编辑按钮完全不渲染
- dev 编辑 API（`/__ijx/requirements*`）仅接受本机回环请求（`tools/requirements/vite-plugin.mjs` 内 `assertLocalRequest`），外机无法访问
- 需求内容本身在公开站点可见（原型演示用途，已确认不做条目保密）

## 日常编辑流程

```bash
git pull origin main                 # 1. 同步（与协作者共用 main，务必先 pull）
npm run dev:react                    # 2. 启动本机 dev（127.0.0.1:5173）
```

3. 打开站点任意页面，点右上角 **「需求模式」** 开关进入编辑态
4. 在页面元素角标上执行：新增需求 / 编辑 / 删除 / 上移下移排序 / 重新定位（rebind）
   - 编辑会写回两个地方：**主数据 `docs/PROTOTYPE_REQUIREMENTS.md`** + 被锚定组件源码中的 `data-requirement-id` 标记
5. 完成后提交并推送（**两个文件的变更要一起提交**）：

```bash
git add docs/PROTOTYPE_REQUIREMENTS.md src/**/*.tsx
git commit -m "docs: 更新原型需求"
git push origin main                  # 需要你确认后再推
```

6. push 自动触发 `deploy.yml` 重建，约 1~2 分钟后 Pages 生效

## 注意事项

- **先 pull 再编辑**：多人/多 AI 协作共用 main，编辑前不同步会在 push 时冲突
- **MD 主数据勿手改**：`docs/PROTOTYPE_REQUIREMENTS.md` 由 dev 编辑器自动维护（YAML frontmatter + 正文），手改易与工具写回格式冲突；改内容一律走编辑界面
- **rebind 仅 dev 可用**：重新定位依赖 Babel dev 定位插件（仅 `vite serve` 启用），生产无此能力，属正常边界
- **提交粒度**：一次编辑会话的 MD + tsx 锚点变更作为一个 commit，避免拆半造成数据与锚点不一致

## 线上出现异常需求内容时

线上数据 = 构建时固化的 MD 快照。若发现线上内容不对：

1. `git log docs/PROTOTYPE_REQUIREMENTS.md` 查变更来源
2. 本机 dev 打开核对 MD 当前内容
3. 修正后按上述流程重新推送部署

任何人未经你的 GitHub 账号不可能篡改线上需求——若 `git log` 出现陌生提交，说明 GitHub 账号凭证泄露，请立即改密并撤销 token。
