# App Harness 检查命令索引

本目录存放 App 治理域的自动化检查。主仓统一入口在 `package.json`：

| 命令 | 脚本 | 覆盖 |
| --- | --- | --- |
| `npm run check:routes` | `tools/prototype/check-route-contract.mjs` | 宿主路由、兼容路由、下载入口与 `docs/APP_ROUTES.md` 的合同一致性 |
| `npm run check:pages` | `tools/prototype/smoke-pages.mjs` | 5 个一级入口 + 14 条消息子路由冒烟（HTTP 200 / 外壳 / 构建产物 / 资源可读） |
| `npm run check:app-chain` | `tools/prototype/verify-download-chain.mjs` | `/download` 四端入口 → App / PC 的全链路浏览器回归 |
| `npm run check` | 上述 + `check:types` + `check:build` | 工程总检查 |

运行前置：本地 dev server 已启动（默认 `http://localhost:5173/`，以 `tools/prototype/*.mjs` 内 `BASE` 配置为准）。

Pages 正式 base 验收（`VITE_BASE=/IJX_Platform/`）见 `docs/APP_ROUTES.md` 末节。
