// 下载链路全链路回归（check:app-chain）
// 覆盖 docs/APP_ROUTES.md 的下载入口合同：
//   /download → iOS → /app/prototype/?platform=ios → 消息 → 会话 → 返回列表
//   /download → Android → /app/prototype/?platform=android → 工作台 → 返回首页
//   /download → PC客户端 → /pc_client；/download → PC Web → /pc_web
//   历史兼容路由重定向 + 无 console 错误 + 图片资源加载
// 运行前置：dev server 已在 BASE 上运行（默认 http://localhost:5173/）。
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('D:/NodeJs/node_global/node_modules/openclaw/node_modules/playwright-core')

const BASE = process.env.APP_CHAIN_BASE || 'http://localhost:5173'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const results = []
const errors = []
const ok = (n, p, d = '') => { results.push(p); console.log(`${p ? 'PASS' : 'FAIL'} | ${n} | ${d}`) }
const wait = (p, ms = 900) => p.waitForTimeout(ms)
const url = (p) => p.evaluate(() => location.pathname + location.search)
const body = (p) => p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))

async function clickText(page, text) {
  return page.evaluate((t) => {
    const el = [...document.querySelectorAll('button, a')].find((e) => e.textContent.includes(t))
    if (!el) return false
    el.click()
    return true
  }, text)
}

async function goto(page, path) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' })
  await wait(page, 1000)
}

/** 等待重定向后 URL 稳定（连续两次采样一致且出现 Vue 宿主或目标前缀） */
async function waitForFinalUrl(page, prefix, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs
  let last = ''
  let stable = 0
  while (Date.now() < deadline) {
    await wait(page, 300)
    const u = await url(page)
    if (u === last && u.includes(prefix)) {
      stable += 1
      if (stable >= 2) return u
    } else {
      stable = 0
    }
    last = u
  }
  return last
}

async function imagesLoaded(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('img')].every((i) => i.complete && (i.naturalWidth > 0 || !i.src))
  )
}

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-proxy-server', '--proxy-bypass-list=*']
})
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)))
  page.on('console', (m) => {
    const t = m.text()
    if (m.type() === 'error' && !/favicon|dicebear|Failed to load resource/.test(t)) errors.push('console: ' + t.slice(0, 160))
  })

  // ===== iOS 链路：下载 → App → 消息 → 会话 → 返回 =====
  await goto(page, '/download')
  const dlText = await body(page)
  ok('1 下载页四端按钮在位',
    ['iOS下载', '安卓下载', 'PC客户端进入', 'PC Web进入'].every((x) => dlText.includes(x)))

  await clickText(page, 'iOS下载'); await wait(page, 1200)
  ok('2 iOS下载 → /app/prototype/?platform=ios',
    (await url(page)).includes('/app/prototype/?platform=ios') && (await body(page)).includes('未读公文'), await url(page))

  await clickText(page, '消息'); await wait(page, 1000)
  ok('3 iOS 链路「消息」→ 消息列表',
    (await url(page)).includes('/app/prototype/message') && (await body(page)).includes('前端组项目群'), await url(page))

  // 进入一个会话再返回列表
  const opened = await page.evaluate(() => {
    const el = [...document.querySelectorAll('.ijx-prototype .im-card-item, .ijx-prototype [class*="session"]')]
      .find((e) => e.textContent.includes('前端组项目群'))
    if (!el) return false
    el.click()
    return true
  })
  await wait(page, 1000)
  ok('4 会话列表 → 会话详情（chat/:id）', opened && /\/app\/prototype\/message\/chat\//.test(await url(page)), await url(page))
  if (opened) {
    await page.goBack(); await wait(page, 800)
    ok('5 会话详情 → 返回消息列表',
      (await url(page)).includes('/app/prototype/message'), await url(page))
  } else {
    ok('5 会话详情 → 返回消息列表', false, '未找到会话入口')
  }

  // ===== Android 链路：下载 → App → 工作台 → 返回首页 =====
  await goto(page, '/download')
  await clickText(page, '安卓下载'); await wait(page, 1200)
  ok('6 安卓下载 → /app/prototype/?platform=android',
    (await url(page)).includes('/app/prototype/?platform=android') && (await body(page)).includes('未读公文'), await url(page))

  await clickText(page, '工作台'); await wait(page, 1000)
  ok('7 Android 链路「工作台」→ /app/prototype/workspace',
    (await url(page)).includes('/app/prototype/workspace'), await url(page))

  await clickText(page, '首页'); await wait(page, 1000)
  ok('8 工作台 → 返回首页',
    /\/app\/prototype\/($|\?)/.test(await url(page)) && (await body(page)).includes('未读公文'), await url(page))

  // ===== PC 两端 =====
  await goto(page, '/download')
  await clickText(page, 'PC客户端进入'); await wait(page, 1200)
  ok('9 PC客户端进入 → /pc_client', (await url(page)).startsWith('/pc_client'), await url(page))

  await goto(page, '/download')
  await clickText(page, 'PC Web进入'); await wait(page, 1200)
  ok('10 PC Web进入 → /pc_web', (await url(page)).startsWith('/pc_web'), await url(page))

  // ===== 历史兼容路由（docs/APP_ROUTES.md §4）=====
  for (const [path, expect, label] of [
    ['/app', '/app/prototype/', '11 /app'],
    ['/app/home', '/app/prototype/', '12 /app/home'],
    ['/app/messages', '/app/prototype/message', '13 /app/messages'],
    ['/app/messages/session/s1', '/app/prototype/message', '14 /app/messages/session/:id'],
    ['/app/unknown-page', '/app/prototype/', '15 未登记 /app/*'],
  ]) {
    await goto(page, path)
    const u = await url(page)
    const isVue = await page.evaluate(() => !!document.querySelector('.ijx-prototype .tab-bar, .ijx-prototype .im-page'))
    ok(`${label} → ${expect}`, u.includes(expect) && isVue, u)
  }

  // 平台参数兼容路由
  await goto(page, '/app/android/home')
  ok('16 /app/android/home 携带 platform=android', (await waitForFinalUrl(page, '/app/prototype/')).includes('platform=android'), await url(page))
  await goto(page, '/app/ios/home')
  ok('17 /app/ios/home 携带 platform=ios', (await waitForFinalUrl(page, '/app/prototype/')).includes('platform=ios'), await url(page))

  // ===== 刷新恢复 + 浏览器导航 + 资源 =====
  await goto(page, '/app/prototype/message/chat/s-g-fe')
  await page.reload({ waitUntil: 'domcontentloaded' }); await wait(page, 1200)
  ok('18 Vue 子路由刷新可恢复',
    /\/app\/prototype\/message\/(chat\/s-g-fe|)$/.test(await url(page)) &&
    await page.evaluate(() => !!document.querySelector('.ijx-prototype')), await url(page))

  ok('19 图片资源全部加载', await imagesLoaded(page))
  ok('20 无新增 console / pageerror', errors.length === 0, errors.slice(0, 3).join(' | '))

  console.log(`\n=== ${results.filter(Boolean).length}/${results.length} PASS, errors=${errors.length} ===`)
  errors.slice(0, 8).forEach((e) => console.log('  ' + e))
  process.exitCode = results.every(Boolean) ? 0 : 1
} finally {
  await browser.close()
}
