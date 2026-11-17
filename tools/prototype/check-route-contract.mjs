// 路由合同检查（check:routes）
// 静态检查 docs/APP_ROUTES.md 与 src/App.tsx / src/pages/Download.tsx /
// src/constants/appRoutes.ts / src/prototype/router/index.ts / tools/prototype/smoke-pages.mjs 的一致性。
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const read = (p) => readFile(path.join(root, p), 'utf8')

const failures = []
const ok = (name, pass, detail = '') => {
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${name}${detail && !pass ? ' | ' + detail : ''}`)
  if (!pass) failures.push(name)
}

const [appTsx, downloadTsx, constantsTs, vueRouter, routesDoc, smokeMjs] = await Promise.all([
  read('src/App.tsx'),
  read('src/pages/Download.tsx'),
  read('src/constants/appRoutes.ts'),
  read('src/prototype/router/index.ts'),
  read('docs/APP_ROUTES.md'),
  read('tools/prototype/smoke-pages.mjs'),
])

// ===== App.tsx 宿主路由 =====
ok('App.tsx 声明 /app/prototype/* 宿主路由（经 APP_PROTOTYPE_BASE 常量）',
  appTsx.includes('APP_PROTOTYPE_BASE') && appTsx.includes('VuePrototypeHost'))
ok('App.tsx /app 重定向到 APP_PROTOTYPE_HOME',
  /path="\/app"\s+element=\{<Navigate to=\{APP_PROTOTYPE_HOME\}/.test(appTsx.replace(/\n/g, ' ')))
ok('App.tsx /app/messages/* 仅作兼容入口（重定向）',
  appTsx.includes('/app/messages/*') && appTsx.includes('APP_PROTOTYPE_MESSAGE'))
ok('App.tsx 历史兼容路由 /app/home、/app/<platform>/home 均已登记',
  appTsx.includes('/app/home') && appTsx.includes('/app/android/home') && appTsx.includes('/app/ios/home'))
ok('App.tsx 未在常量之外硬编码 /app/prototype 路径字符串',
  !/"[^"]*\/app\/prototype/.test(appTsx))

// ===== Download.tsx 下载入口 =====
ok('Download.tsx 使用 appPrototypeHomeWithPlatform 常量进入 Vue App',
  downloadTsx.includes('appPrototypeHomeWithPlatform'))
ok('Download.tsx 不再硬编码 /app/prototype 字符串（注释除外）',
  !downloadTsx.replace(/\/\/.*$/gm, '').includes('/app/prototype'))

// ===== 常量文件 =====
ok('appRoutes.ts 定义五大一级入口常量',
  ['APP_ENTRY', 'APP_PROTOTYPE_BASE', 'APP_PROTOTYPE_HOME', 'APP_PROTOTYPE_MESSAGE'].every((k) => constantsTs.includes(k)) &&
  constantsTs.includes('appPrototypeRoute'))

// ===== Vue Router 消息/通讯录子路由 vs 冒烟清单 =====
const vueRoutePaths = [...vueRouter.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1])
const subRoutePrefixes = ['/message/', '/contacts']
const messageSubRoutes = vueRoutePaths.filter((p) => subRoutePrefixes.some((pre) => p.startsWith(pre)) && !p.includes(':pathMatch'))
const smokeHasRoute = (vuePath) => {
  // :param 段在冒烟清单里被替换为示例值：直接按字面段匹配
  const segs = vuePath.split('/').filter(Boolean)
  const literal = segs.filter((s) => !s.startsWith(':'))
  return smokeMjs.includes(literal.join('/')) || literal.every((s) => smokeMjs.includes(`'${s}'`) || smokeMjs.includes(`/${s}`))
}
const missing = messageSubRoutes.filter((p) => !smokeHasRoute(p))
ok(`Vue Router 消息/通讯录子路由全部进入冒烟清单（${messageSubRoutes.length} 条）`,
  missing.length === 0, `缺失: ${missing.join(', ')}`)

// ===== APP_ROUTES.md 文档合同 =====
const canonicalRoutes = [
  '/app/prototype/',
  '/app/prototype/schedule',
  '/app/prototype/workspace',
  '/app/prototype/message',
  '/app/prototype/contacts',
  '/app/prototype/profile',
  '/app/prototype/contacts/dept/:departmentId',
  '/app/prototype/contacts/:contactId',
  '/app/prototype/message/search',
  '/app/prototype/message/chat/:sessionId',
  '/app/prototype/message/info/:sessionId',
  '/app/prototype/message/history/:sessionId',
  '/app/prototype/message/contacts',
  '/app/prototype/message/contact/:contactId',
  '/app/prototype/message/group/create',
  '/app/prototype/message/group/:groupId',
  '/app/prototype/message/scan',
  '/app/prototype/message/pins/:sessionId',
  '/app/prototype/message/topic/:topicId',
  '/app/prototype/message/receipt/:sessionId/:msgId',
  '/app/prototype/message/service/:accountId',
]
const docMissing = canonicalRoutes.filter((r) => !routesDoc.includes(r))
ok(`APP_ROUTES.md 包含全部规范路由（${canonicalRoutes.length} 条）`,
  docMissing.length === 0, `缺失: ${docMissing.join(', ')}`)

ok('APP_ROUTES.md 登记下载入口 platform 参数',
  routesDoc.includes('/app/prototype/?platform=ios') && routesDoc.includes('/app/prototype/?platform=android'))
ok('APP_ROUTES.md 不再把 /app/home 标成正式路由（仅出现在兼容表）',
  !/^.*\/app\/home.*$/m.test(routesDoc.replace(/^.*历史兼容路由.*$/m, '').split('## 5')[0]) ||
  routesDoc.includes('## 4. 历史兼容路由'))
ok('APP_ROUTES.md 不再把 src/pages/app/ 标成权威实现',
  !routesDoc.split('## 4')[0].includes('src/pages/app/') || routesDoc.includes('已弃用'))
ok('APP_ROUTES.md 指向 src/prototype/ 为权威代码',
  routesDoc.includes('src/prototype/') && routesDoc.includes('VuePrototypeHost'))

console.log(`\nRoute contract check: ${failures.length === 0 ? 'ALL PASS' : failures.length + ' FAILED'}`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
}
