import { spawn } from 'node:child_process'
import { access, readFile, readdir } from 'node:fs/promises'
import { constants } from 'node:fs'
import path from 'node:path'

/**
 * P2-4：权威工程等价 Harness `npm run check:pages` 的路由冒烟。
 * 覆盖 5 个一级入口 + 14 条消息子路由（与 harness/tasks/CURRENT.md 的清单一致）。
 * 单条 PASS 需同时满足：HTTP 200 / 返回应用外壳 / 路由声明已进入构建产物 / 入口资源可读。
 */
const host = '127.0.0.1'
const port = 4178
const baseUrl = `http://${host}:${port}`
const appBase = '/app/prototype'
const startupTimeoutMs = 20_000
const viteEntry = path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js')
const outputDir = path.join(process.cwd(), 'node_modules', '.prototype-check-dist')

const routes = [
  { name: 'Home', path: '/', marker: 'Home' },
  { name: 'Schedule', path: '/schedule', marker: 'Schedule' },
  { name: 'Workspace', path: '/workspace', marker: 'Workspace' },
  { name: 'Profile', path: '/profile', marker: 'Profile' },
  { name: 'Message', path: '/message', marker: 'Message' },
  { name: 'MessageSearch', path: '/message/search', marker: '/message/search' },
  { name: 'MessageChat', path: '/message/chat/' + 's-g-fe', marker: '/message/chat/:sessionId' },
  { name: 'MessageInfo', path: '/message/info/' + 's-g-fe', marker: '/message/info/:sessionId' },
  { name: 'MessageHistory', path: '/message/history/' + 's-g-fe', marker: '/message/history/:sessionId' },
  { name: 'MessageContacts', path: '/message/contacts', marker: '/message/contacts' },
  { name: 'MessageContact', path: '/message/contact/jy-p5', marker: '/message/contact/:contactId' },
  { name: 'MessageGroupCreate', path: '/message/group/create', marker: '/message/group/create' },
  { name: 'MessageGroup', path: '/message/group/g-fe', marker: '/message/group/:groupId' },
  { name: 'MessageScan', path: '/message/scan', marker: '/message/scan' },
  { name: 'MessagePins', path: '/message/pins/s-g-fe', marker: '/message/pins/:sessionId' },
  { name: 'MessageTopic', path: '/message/topic/t-demo', marker: '/message/topic/:topicId' },
  { name: 'MessageReceipt', path: '/message/receipt/s-g-fe/m1', marker: '/message/receipt/:sessionId/:msgId' },
  { name: 'MessageService', path: '/message/service/sa-it', marker: '/message/service/:accountId' },
  { name: 'MessageFallback', path: '/message/not-exist', marker: '/message/:pathMatch(.*)*' }
]

const preview = spawn(
  process.execPath,
  [viteEntry, 'preview', '--config', 'vite.react.config.mjs', '--configLoader', 'runner',
    '--outDir', 'node_modules/.prototype-check-dist', '--host', host, '--port', String(port), '--strictPort'],
  { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'] }
)

let previewOutput = ''
preview.stdout.on('data', (chunk) => { previewOutput += chunk })
preview.stderr.on('data', (chunk) => { previewOutput += chunk })

async function waitForServer() {
  const deadline = Date.now() + startupTimeoutMs
  while (Date.now() < deadline) {
    if (preview.exitCode !== null) throw new Error(`Preview exited before startup.\n${previewOutput}`)
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
    } catch { /* still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Preview did not start within ${startupTimeoutMs}ms.\n${previewOutput}`)
}

async function bundleText() {
  const assetsDir = path.join(outputDir, 'assets')
  const files = (await readdir(assetsDir)).filter((f) => f.endsWith('.js'))
  const chunks = await Promise.all(files.map((f) => readFile(path.join(assetsDir, f), 'utf8')))
  return chunks.join('\n')
}

async function verifyEntryAssets(html) {
  const assetPaths = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)].map((m) => m[1])
  if (!assetPaths.length) throw new Error('Built HTML does not reference any entry asset.')
  const basePath = process.env.VITE_BASE || '/'
  for (const assetPath of assetPaths) {
    const rel = assetPath.replace(/^\//, '').replace(basePath.replace(/^\//, ''), '').replace(/^\//, '')
    await access(path.join(outputDir, rel), constants.R_OK)
  }
  return assetPaths.length
}

const failures = []
let passed = 0

try {
  const indexHtml = await readFile(path.join(outputDir, 'index.html'), 'utf8')
  if (!indexHtml.includes('id="root"')) throw new Error('index.html is missing the #root mount element.')
  const assetCount = await verifyEntryAssets(indexHtml)
  const bundle = await bundleText()
  await waitForServer()

  for (const route of routes) {
    const url = `${appBase}${route.path === '/' ? '/' : route.path}`
    try {
      const response = await fetch(baseUrl + url, { redirect: 'manual' })
      const html = await response.text()
      if (response.status !== 200) throw new Error(`HTTP ${response.status}`)
      if (!html.includes('id="root"')) throw new Error('application shell missing')
      if (!bundle.includes(route.marker)) throw new Error(`route declaration ${route.marker} not in bundle`)
      passed += 1
      console.log(`PASS ${route.name.padEnd(20)} ${url} (HTTP 200, shell, route-in-bundle)`)
    } catch (error) {
      failures.push(`${route.name}: ${error.message}`)
      console.log(`FAIL ${route.name} ${url} | ${error.message}`)
    }
  }

  console.log(`PASS ${assetCount} built entry asset(s) are readable`)
  console.log(`Page smoke check: ${passed}/${routes.length} routes passed.`)
  if (failures.length) {
    console.error(failures.join('\n'))
    process.exitCode = 1
  }
} catch (error) {
  console.error(`Smoke check failed: ${error.message}`)
  console.error(previewOutput)
  process.exitCode = 1
} finally {
  if (preview.exitCode === null) preview.kill()
}
