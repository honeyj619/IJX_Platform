import { readFile } from 'node:fs/promises'

const files = {
  app: 'src/App.tsx',
  download: 'src/pages/Download.tsx',
  constants: 'src/constants/appRoutes.ts',
  vueRouter: 'src/prototype/router/index.ts',
  contract: 'docs/APP_ROUTES.md',
  agents: 'Agents.md',
}

const sources = Object.fromEntries(
  await Promise.all(Object.entries(files).map(async ([name, file]) => [name, await readFile(file, 'utf8')]))
)

const checks = [
  ['React 挂载 Vue App', sources.app.includes('APP_PROTOTYPE_BASE') && sources.app.includes('<VuePrototypeHost')],
  ['旧消息入口兼容', sources.app.includes('/app/messages/*') && sources.app.includes('APP_PROTOTYPE_MESSAGE')],
  ['下载页使用统一入口', sources.download.includes('appPrototypeUrl(platform)')],
  ['客户端与 Web 入口集中管理', sources.download.includes('PC_CLIENT_HOME') && sources.download.includes('PC_WEB_HOME')],
  ['App 规范入口', sources.constants.includes("APP_PROTOTYPE_BASE = '/app/prototype'")],
  ['iOS/Android 查询参数', sources.constants.includes('?platform=${platform}')],
  ['Vue 一级路由完整', ['/', '/schedule', '/workspace', '/message', '/profile'].every((route) => sources.vueRouter.includes(`path: '${route}'`))],
  ['Vue 消息路由完整', [
    '/message/search', '/message/chat/:sessionId', '/message/info/:sessionId',
    '/message/history/:sessionId', '/message/contacts', '/message/contact/:contactId',
    '/message/group/create', '/message/group/:groupId', '/message/scan',
    '/message/pins/:sessionId', '/message/topic/:topicId',
    '/message/receipt/:sessionId/:msgId', '/message/service/:accountId',
  ].every((route) => sources.vueRouter.includes(`path: '${route}'`))],
  ['Pages base 由环境注入', sources.vueRouter.includes('import.meta.env.BASE_URL') && sources.contract.includes('/IJX_Platform/')],
  ['合同声明唯一实现', sources.contract.includes('权威实现：`src/prototype/`')],
  ['根规范指向 Harness 地图', sources.agents.includes('docs/HARNESS_MAP.md')],
]

const staleStatements = [
  ['旧 React AppLayout 被登记为入口', 'src/pages/app/AppLayout.tsx'],
  ['下载页直接进入旧 iOS 首页', "navigate('/app/ios/home')"],
  ['下载页直接进入旧 Android 首页', "navigate('/app/android/home')"],
]

let failed = false
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
  failed ||= !passed
}

const combinedActiveSources = [sources.app, sources.download, sources.constants, sources.agents].join('\n')
for (const [name, marker] of staleStatements) {
  const passed = !combinedActiveSources.includes(marker)
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
  failed ||= !passed
}

if (failed) process.exitCode = 1
else console.log('Route contract check passed.')
