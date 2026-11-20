# 需求模式编辑指南（Requirement Editing SOP）

> 适用对象：项目唯一管理员（仓库协作者）。其他访问者无需阅读本文——线上需求为只读。

## 权限模型（线上只读，本机维护，Git 发布）

本系统无账号体系，静态部署在 GitHub Pages，生产页面**不会识别访问者是否为项目所有者**：

- 所有访问者（含项目所有者）在 Pages 上均为**只读**：可以开启/关闭需求模式、查看需求角标与详情
- 项目所有者在 Pages 上**不会看到任何维护按钮**（新增/编辑/删除/排序/重新定位/导入）——这是预期行为，不是故障
- 需求内容的**唯一变更通道是 commit 到 main 分支**：GitHub 仓库写权限即发布权限，能 push main 的人才能改线上需求数据
- 维护界面（增/删/改/排序/重新定位/导入旧数据）**仅本机 dev 环境可用**：由 `canMaintainRequirements` 控制（`src/components/requirements/RequirementMode.tsx`），其条件为「开发构建（`import.meta.env.DEV`）且页面地址为本机回环（localhost / 127.0.0.1 / [::1]）」
- dev 编辑 API（`/__ijx/requirements*`）只存在于本机 Vite 开发服务，并拒绝非回环请求（`tools/requirements/vite-plugin.mjs` 内 `assertLocalRequest`）；生产 Pages 根本没有该写接口，浏览器网络面板不会出现此请求
- 需求内容本身在公开站点可见（原型演示用途，已确认不做条目保密）

注意：静态站点没有用户鉴权接口，不应把站点描述成"生产请求由 GitHub 返回 401"。真实安全边界是「生产不渲染维护入口 + 维护 API 只存在于本机开发服务 + GitHub 仓库写权限控制发布」。若未来要求项目所有者在 Pages 线上直接新增，需另建登录、服务端写接口与授权体系，不能通过隐藏按钮或前端口令实现。

## 日常编辑流程

```bash
git pull origin main                 # 1. 同步（与协作者共用 main，务必先 pull）
npm run dev:react                    # 2. 启动本机 dev（固定绑定 127.0.0.1:5173）
```

3. **必须通过本机回环地址访问**（`http://127.0.0.1:5173` 或 `http://localhost:5173`），维护入口才会出现
4. 打开站点任意页面，点右上角 **「需求模式」** 开关进入编辑态
5. 在页面元素角标上执行：新增需求 / 编辑 / 删除 / 上移下移排序 / 重新定位（rebind）
   - 编辑会写回两个地方：**主数据 `docs/PROTOTYPE_REQUIREMENTS.md`** + 被锚定组件源码中的 `data-requirement-id` 标记
6. 完成后提交并推送（**两个文件的变更要一起提交**）：

```bash
git add docs/PROTOTYPE_REQUIREMENTS.md src/**/*.tsx
git commit -m "docs: 更新原型需求"
git push origin main                  # 需要你确认后再推
```

7. push 自动触发 `deploy.yml` 重建，约 1~2 分钟后 Pages 生效

## 注意事项

- **先 pull 再编辑**：多人/多 AI 协作共用 main，编辑前不同步会在 push 时冲突
- **线上看不到新增按钮是正常的**：任何人在 Pages 上都只能查看；需要维护时必须回到本机回环地址启动 `dev:react`
- **MD 主数据勿手改**：`docs/PROTOTYPE_REQUIREMENTS.md` 由 dev 编辑器自动维护（YAML frontmatter + 正文），手改易与工具写回格式冲突；改内容一律走编辑界面
- **新增需求的判定标准**：只有当需求属于「功能逻辑」（影响业务行为的规则、数据口径、状态流转、边界条件、跨模块联动关系）时才写入；简单页面逻辑（按钮样式、颜色、字号、布局、图标、一次性文案与视觉调整）不写入需求模式。写入内容保持简洁，以「功能逻辑 + 业务规则」形式描述，不堆 UI 细节
- **模块内序号顺联**：同一功能模块内的需求序号必须连续（1、2、3…），新增/删除/重排后立即重排该模块序号，不允许跳号或重复
- **锚点绑定位置**：`data-requirement-id` 绑定在承载该功能逻辑的常驻元素上（弹框根节点、区域容器等），不绑定在按钮等易消失元素上；弹框类锚点放弹框根节点
- **rebind 仅 dev 可用**：重新定位依赖 Babel dev 定位插件（仅 `vite serve` 启用），生产无此能力，属正常边界
- **提交粒度**：一次编辑会话的 MD + tsx 锚点变更作为一个 commit，避免拆半造成数据与锚点不一致

## 线上出现异常需求内容时

线上数据 = 构建时固化的 MD 快照。若发现线上内容不对：

1. `git log docs/PROTOTYPE_REQUIREMENTS.md` 查变更来源
2. 本机 dev 打开核对 MD 当前内容
3. 修正后按上述流程重新推送部署

任何人未经你的 GitHub 账号不可能篡改线上需求——若 `git log` 出现陌生提交，说明 GitHub 账号凭证泄露，请立即改密并撤销 token。
