# IJX Platform 管理后台路径规范

> 版本：1.0  
> 适用范围：`/admin` 管理后台  
> 目标：让已完成页面拥有稳定、可复制、可刷新、可前进后退的 URL，并避免菜单状态与地址栏脱节。

## 1. 路径清单

| 菜单归属 | 页面名称 | 规范 URL | 兼容的旧 `section` |
| --- | --- | --- | --- |
| 安全管理 | 设备管理 | `/admin/security/devices` | `device-management` |
| 系统管理 | 用户组管理 | `/admin/system/user-groups` | `user-groups`、`system-user-groups` |
| 系统管理 | 字典管理 | `/admin/system/dictionaries` | `system-dictionary` |
| 版本管理 | 版本管理 | `/admin/versions` | `version-list` |
| 版本管理 | 发布记录 | `/admin/versions/releases` | `version-release` |
| 工作台 | 应用管理 | `/admin/workspace/apps` | `app-management` |
| 工作台 | 导航栏管理 | `/admin/workspace/navigation` | `system-nav` |
| 门户基础管理 | 帮助与反馈 | `/admin/portal/help-feedback` | `help-feedback`、`portal-feedback` |
| i吉祥初始功能 / 汇报管理 | 模板管理 | `/admin/reports/templates` | `report-template` |
| AI辅助功能 | 公文模板管理 | `/admin/ai/document-templates` | `ai-template` |
| AI辅助功能 | PPT模板管理 | `/admin/ai/ppt-templates` | `ppt-template` |

管理后台首页使用 `/admin`。原“版本列表”统一更名为“版本管理”，代码内部 `version-list` 仅作为兼容标识保留。

## 2. 路径设计规则

- 使用 `/admin/<业务域>/<资源>`，业务域与左侧菜单的信息架构一致。
- URL 使用英文小写与短横线；资源集合优先使用复数名词。
- 页面筛选、分页和临时弹窗状态不另建页面路径；需要分享或恢复时再使用查询参数。
- 新增、编辑、详情若成为独立整页，应使用 `/new`、`/:id/edit`、`/:id`，不得继续只保存在组件本地状态。
- 菜单点击必须通过路由导航更新地址栏，不能只修改 `activeSubMenu`。
- 页面必须支持直接粘贴 URL、浏览器刷新、前进和后退。

## 3. 兼容规则

- 旧地址 `/admin?section=<旧标识>` 必须自动替换为规范 URL，不保留重复地址。
- 未登记的 `/admin/*` 路径回到 `/admin`，不展示错误菜单状态。
- GitHub Pages 的 `basename` 由路由器统一处理，业务代码不得手工拼接仓库前缀。

## 4. 维护流程

新增或更名管理后台页面时，同一轮必须完成：

1. 在 `src/pages/Admin.tsx` 的管理后台路径表登记路径、菜单状态和旧标识。
2. 确认 `src/App.tsx` 继续使用 `/admin/*` 承接子路径。
3. 更新本文件的路径清单。
4. 验证菜单点击、直接访问、刷新、前进后退和旧地址跳转。
5. 在 `tasks/CURRENT.md` 记录本轮路径变化和验证结果。
