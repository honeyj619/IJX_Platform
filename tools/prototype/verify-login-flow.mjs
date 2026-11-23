// 统一登录专项回归（check:login）
// 覆盖开发方案 §16.1 的 17 项登录流程合同：
//   来源解析、Web/Client 成功链、全失败分支、sync-fail/launch-fail 不写有效会话、
//   Admin 设备会话联动（单设备退出 / 全部退出 / 重复登录 / 重复提交）、
//   刷新恢复默认态、前进后退不绕过门禁、console/pageerror 零新增。
// 运行前置：dev server 已在 BASE 上运行（默认 http://localhost:5173/）。
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require('D:/NodeJs/node_global/node_modules/openclaw/node_modules/playwright-core')

const BASE = process.env.LOGIN_FLOW_BASE || 'http://localhost:5173'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const STORAGE_KEY = 'ijx-prototype-session-v1'

const results = []
const errors = []
const ok = (n, p, d = '') => { results.push(p); console.log(`${p ? 'PASS' : 'FAIL'} | ${n} | ${d}`) }

const wait = (page, ms) => page.waitForTimeout(ms)
const url = (page) => page.evaluate(() => location.pathname + location.search)
const body = (page) => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))

async function goto(page, path) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' })
  await wait(page, 900)
}

async function clickText(page, text, container = 'button, a') {
  return page.evaluate(([t, sel]) => {
    const el = [...document.querySelectorAll(sel)].find((e) => e.textContent.includes(t))
    if (!el) return false
    el.click()
    return true
  }, [text, container])
}

/** 等待页面文本出现（默认 8s） */
async function waitForText(page, text, timeout = 8000) {
  try {
    await page.waitForFunction((t) => document.body.innerText.includes(t), text, { timeout, polling: 120 })
    return true
  } catch {
    return false
  }
}

/** 等待 URL 满足谓词（默认 10s） */
async function waitForUrl(page, predicate, timeout = 10000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const u = await url(page)
    if (predicate(u)) return u
    await wait(page, 200)
  }
  return await url(page)
}

/** 读取原型登录 Store 持久化状态 */
const readStore = (page) => page.evaluate((key) => {
  try { return JSON.parse(window.localStorage.getItem(key) || 'null') } catch { return null }
}, STORAGE_KEY)

const channelSignedIn = (store, channel) => store?.state?.channels?.[channel]?.signedIn === true

const findDevice = (store, deviceId) => {
  for (const user of store?.state?.users ?? []) {
    const device = user.devices.find((d) => d.id === deviceId)
    if (device) return device
  }
  return null
}

/** 在登录页填入密码并提交（账号已预填主用户模拟账号） */
async function submitLogin(page, password = 'demo-password') {
  await page.fill('#login-password', password)
  await page.click('button[type=submit]')
}

/** 等待登录 Store 写入（completeLogin 后 persist 落盘） */
async function waitForStore(page, predicate, timeout = 8000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const store = await readStore(page)
    if (predicate(store)) return store
    await wait(page, 200)
  }
  return await readStore(page)
}

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-proxy-server', '--proxy-bypass-list=*']
})

/** 新建隔离场景：独立 context（localStorage 隔离，等价清理 ijx-prototype-session-v1） */
async function newScenario() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)))
  page.on('console', (m) => {
    const t = m.text()
    if (m.type() === 'error' && !/favicon|dicebear|Failed to load resource/.test(t)) errors.push('console: ' + t.slice(0, 160))
  })
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY)
  return { context, page }
}

try {
  // ===== 1. /login 缺省为 Web 来源 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login')
    ok('1 /login 缺省为 Web 来源', (await body(page)).includes('登录 i吉祥 PC Web'), await url(page))
    await context.close()
  }

  // ===== 2. source=web 与 source=client 标题和说明不同 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=web')
    const webText = await body(page)
    await goto(page, '/login?source=client')
    const clientText = await body(page)
    ok('2 Web/Client 登录页标题与说明不同',
      webText.includes('登录 i吉祥 PC Web') && webText.includes('登录后进入 i吉祥企业门户')
      && clientText.includes('登录 i吉祥 PC 客户端') && clientText.includes('登录完成后将为你打开 i吉祥客户端')
      && !clientText.includes('登录 i吉祥 PC Web'),
      `web=${webText.includes('登录 i吉祥 PC Web')} client=${clientText.includes('登录 i吉祥 PC 客户端')}`)
    await context.close()
  }

  // ===== 3. 非法来源显示来源选择，不白屏 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=xyz')
    const text = await body(page)
    ok('3 非法来源显示来源选择页，不白屏',
      text.includes('无法识别登录来源') && text.includes('登录 i吉祥 PC Web') && text.includes('登录 i吉祥 PC 客户端') && text.length > 20,
      await url(page))
    await context.close()
  }

  // ===== 4. Web 成功：登录中 → Web 进入中 → /pc_web =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=web')
    await submitLogin(page)
    const sawSubmitting = await waitForText(page, '登录中', 4000)
    const sawEntering = await waitForText(page, '正在进入 i吉祥 PC Web', 6000)
    const finalUrl = await waitForUrl(page, (u) => u.startsWith('/pc_web'))
    const store = await waitForStore(page, (s) => channelSignedIn(s, 'web'))
    ok('4 Web 成功链路：登录中 → 进入中 → /pc_web + 写入登录态',
      sawSubmitting && sawEntering && finalUrl.startsWith('/pc_web') && channelSignedIn(store, 'web'),
      `submitting=${sawSubmitting} entering=${sawEntering} url=${finalUrl}`)
    await context.close()
  }

  // ===== 5. Client 成功：未登录页 → /login?source=client → 登录中 → 同步中 → 拉起中 → /pc_client =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/pc_client')
    const signedOutText = await body(page)
    const gateOk = signedOutText.includes('使用浏览器登录') && !signedOutText.includes('打开的页面')
    await clickText(page, '使用浏览器登录')
    const loginUrl = await waitForUrl(page, (u) => u.startsWith('/login?source=client'))
    await submitLogin(page)
    const sawAuth = await waitForText(page, '登录成功', 4000)
    const sawSync = await waitForText(page, '正在同步登录信息', 8000)
    const sawLaunch = await waitForText(page, '正在拉起 i吉祥客户端', 8000)
    const finalUrl = await waitForUrl(page, (u) => u.startsWith('/pc_client'), 12000)
    const store = await waitForStore(page, (s) => channelSignedIn(s, 'client'))
    ok('5 Client 成功链路：未登录页 → 登录中 → 登录成功 → 同步中 → 拉起中 → /pc_client',
      gateOk && loginUrl.startsWith('/login?source=client') && sawAuth && sawSync && sawLaunch
      && finalUrl.startsWith('/pc_client') && channelSignedIn(store, 'client'),
      `gate=${gateOk} auth=${sawAuth} sync=${sawSync} launch=${sawLaunch} url=${finalUrl}`)
    await context.close()
  }

  // ===== 6. 失败分支文案与恢复按钮 =====
  const failureCases = [
    ['invalid', '账号或密码错误', '重新输入'],
    ['locked', '账号已锁定', '查看帮助'],
    ['disabled', '账号已停用', '联系管理员'],
    ['forbidden', '当前终端无权限', '联系管理员'],
    ['network', '网络异常', '重试'],
    ['system', '系统异常', '重试'],
    ['timeout', '登录超时', '重新登录'],
  ]
  for (const [demo, title, recovery] of failureCases) {
    const { context, page } = await newScenario()
    await goto(page, `/login?source=web&demo=${demo}`)
    await submitLogin(page)
    const sawFailure = await waitForText(page, title, 6000)
    const text = await body(page)
    const currentUrl = await url(page)
    const store = await readStore(page)
    ok(`6 demo=${demo} 失败文案与恢复按钮（不写会话）`,
      sawFailure && text.includes(recovery) && currentUrl.startsWith('/login') && !channelSignedIn(store, 'web'),
      `title=${sawFailure} recovery=${text.includes(recovery)} url=${currentUrl}`)
    await context.close()
  }

  // ===== 7. sync-fail：不进入客户端、不生成有效设备会话 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=client&demo=sync-fail')
    await submitLogin(page)
    const sawSyncFail = await waitForText(page, '登录信息同步失败', 12000)
    const text = await body(page)
    const finalUrl = await waitForUrl(page, (u) => u.startsWith('/login'), 4000)
    const store = await waitForStore(page, () => true, 3000)
    const clientDevice = findDevice(store, 'device-pc-liang')
    const validSessions = (clientDevice?.sessions ?? []).filter((s) => s.status === '有效').filter((s) => s.id.startsWith('SES-PC-L')).length
    ok('7 sync-fail 不进入客户端、不生成有效会话（可重试/重新登录/取消）',
      sawSyncFail && text.includes('重试同步') && text.includes('重新登录') && text.includes('取消')
      && finalUrl.startsWith('/login') && !channelSignedIn(store, 'client') && validSessions === 0,
      `syncFail=${sawSyncFail} url=${finalUrl} valid=${validSessions}`)
    await context.close()
  }

  // ===== 8. launch-fail：不进入客户端、不生成有效设备会话；重试后可成功 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=client&demo=launch-fail')
    await submitLogin(page)
    const sawLaunchFail = await waitForText(page, '客户端拉起失败', 14000)
    const text = await body(page)
    const failUrl = await waitForUrl(page, (u) => u.startsWith('/login'), 4000)
    const failStore = await waitForStore(page, () => true, 3000)
    const failDevice = findDevice(failStore, 'device-pc-liang')
    const failValid = (failDevice?.sessions ?? []).filter((s) => s.status === '有效' && s.id.startsWith('SES-PC-L')).length
    await clickText(page, '重新打开')
    const sawLaunching = await waitForText(page, '正在拉起 i吉祥客户端', 6000)
    const successUrl = await waitForUrl(page, (u) => u.startsWith('/pc_client'), 12000)
    const successStore = await waitForStore(page, (s) => channelSignedIn(s, 'client'))
    ok('8 launch-fail 不进入客户端且无有效会话；重试后成功',
      sawLaunchFail && text.includes('重新打开') && text.includes('下载客户端') && failUrl.startsWith('/login')
      && !channelSignedIn(failStore, 'client') && failValid === 0
      && sawLaunching && successUrl.startsWith('/pc_client') && channelSignedIn(successStore, 'client'),
      `launchFail=${sawLaunchFail} failUrl=${failUrl} failValid=${failValid} retryUrl=${successUrl}`)
    await context.close()
  }

  // ===== 9. Web 登录后 Admin 出现最新「网页浏览器」有效会话 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=web')
    await submitLogin(page)
    await waitForUrl(page, (u) => u.startsWith('/pc_web'))
    await goto(page, '/admin/security/devices')
    await waitForText(page, '按人员统一查看', 12000)
    await clickText(page, '详情')
    await waitForText(page, '登录记录', 6000)
    await clickText(page, '登录记录')
    await waitForText(page, 'SES-WEB-L1', 6000)
    const text = await body(page)
    ok('9 Web 登录后 Admin 登录记录出现最新网页浏览器有效会话',
      text.includes('SES-WEB-L1') && text.includes('网页浏览器') && text.includes('有效'),
      `hasL1=${text.includes('SES-WEB-L1')}`)
    await context.close()
  }

  // ===== 10. Client 登录后 Admin 出现最新「PC客户端」有效会话 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=client')
    await submitLogin(page)
    await waitForUrl(page, (u) => u.startsWith('/pc_client'), 12000)
    await goto(page, '/admin/security/devices')
    await waitForText(page, '按人员统一查看', 12000)
    await clickText(page, '详情')
    await waitForText(page, '登录记录', 6000)
    await clickText(page, '登录记录')
    await waitForText(page, 'SES-PC-L1', 6000)
    const text = await body(page)
    ok('10 Client 登录后 Admin 登录记录出现最新 PC 客户端有效会话',
      text.includes('SES-PC-L1') && text.includes('PC客户端') && text.includes('有效'),
      `hasL1=${text.includes('SES-PC-L1')}`)
    await context.close()
  }

  // ===== 11. Admin 单设备退出（另一标签页 storage 同步）使受保护页面回到未登录态 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=web')
    await submitLogin(page)
    await waitForUrl(page, (u) => u.startsWith('/pc_web'))
    const adminPage = await context.newPage()
    await goto(adminPage, '/admin/security/devices')
    await waitForText(adminPage, '按人员统一查看', 12000)
    await clickText(adminPage, '详情')
    await waitForText(adminPage, 'Chrome 141', 6000)
    // 设备列表中 Chrome 141（device-web-liang-1）行内「退出」
    const loggedOut = await adminPage.evaluate(() => {
      const row = [...document.querySelectorAll('tr')].find((tr) => tr.textContent.includes('Chrome 141'))
      if (!row) return false
      const btn = [...row.querySelectorAll('button')].find((b) => b.textContent.trim() === '退出' && !b.disabled)
      if (!btn) return false
      btn.click()
      return true
    })
    await waitForText(adminPage, '退出该设备登录', 4000)
    await clickText(adminPage, '确认执行')
    // 原 PC Web 标签页应经 storage 事件回到未登录态（门禁重定向）
    const redirected = await waitForUrl(page, (u) => u.startsWith('/login?source=web'), 8000)
    ok('11 Admin 单设备退出后 PC Web 标签页回到未登录（多标签页同步）',
      loggedOut && redirected.startsWith('/login?source=web'),
      `clicked=${loggedOut} pcwebUrl=${redirected}`)
    await context.close()
  }

  // ===== 12. Admin 全部退出同时清除 Web 与 Client 登录态 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=web')
    await submitLogin(page)
    await waitForUrl(page, (u) => u.startsWith('/pc_web'))
    await goto(page, '/pc_client')
    await clickText(page, '使用浏览器登录')
    await waitForUrl(page, (u) => u.startsWith('/login?source=client'))
    await submitLogin(page)
    await waitForUrl(page, (u) => u.startsWith('/pc_client'), 12000)
    const adminPage = await context.newPage()
    await goto(adminPage, '/admin/security/devices')
    await waitForText(adminPage, '按人员统一查看', 12000)
    await waitForText(adminPage, '全部退出', 6000)
    await clickText(adminPage, '全部退出')
    await waitForText(adminPage, '确认后相关设备的有效会话将立即失效', 4000)
    await clickText(adminPage, '确认执行')
    // 客户端标签页应回到未登录页（同 URL 渲染 ClientSignedOut）
    const clientSignedOut = await waitForText(page, '使用浏览器登录', 8000)
    await goto(page, '/pc_web')
    const webRedirect = await waitForUrl(page, (u) => u.startsWith('/login?source=web'), 8000)
    ok('12 Admin 全部退出同时清除 Web 与 Client 登录态',
      clientSignedOut && webRedirect.startsWith('/login?source=web'),
      `clientSignedOut=${clientSignedOut} webUrl=${webRedirect}`)
    await context.close()
  }

  // ===== 13. 重复登录不重复新增设备，但追加会话 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=web')
    await submitLogin(page)
    await waitForUrl(page, (u) => u.startsWith('/pc_web'))
    await goto(page, '/login?source=web')
    await submitLogin(page)
    await waitForUrl(page, (u) => u.startsWith('/pc_web'))
    const store = await waitForStore(page, (s) => channelSignedIn(s, 'web'))
    const mainUser = store?.state?.users?.find((u) => u.id === 'user-liang')
    const webDevice = findDevice(store, 'device-web-liang-1')
    const webDeviceCount = (mainUser?.devices ?? []).filter((d) => d.type === '网页浏览器').length
    const sessionIds = (webDevice?.sessions ?? []).map((s) => s.id)
    const validIds = (webDevice?.sessions ?? []).filter((s) => s.status === '有效').map((s) => s.id)
    ok('13 重复登录不新增设备、追加会话且仅一条有效',
      webDeviceCount === 4 && sessionIds.includes('SES-WEB-L1') && sessionIds.includes('SES-WEB-L2')
      && validIds.length === 1 && validIds[0] === 'SES-WEB-L2',
      `devices=${webDeviceCount} sessions=${sessionIds.join(',')} valid=${validIds.join(',')}`)
    await context.close()
  }

  // ===== 14. 登录中重复点击不会创建多条会话 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=web')
    await page.fill('#login-password', 'demo-password')
    await page.evaluate(() => {
      const btn = document.querySelector('button[type=submit]')
      btn.click()
      btn.click()
    })
    await waitForUrl(page, (u) => u.startsWith('/pc_web'), 12000)
    const store = await waitForStore(page, (s) => channelSignedIn(s, 'web'))
    const webDevice = findDevice(store, 'device-web-liang-1')
    const appended = (webDevice?.sessions ?? []).filter((s) => s.id.startsWith('SES-WEB-L')).length
    ok('14 登录中重复点击不创建多条会话', appended === 1, `appended=${appended}`)
    await context.close()
  }

  // ===== 15. 刷新登录页回到默认态并保留来源 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/login?source=client')
    await submitLogin(page)
    await waitForText(page, '登录成功', 6000)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await wait(page, 1000)
    const text = await body(page)
    const finalUrl = await url(page)
    ok('15 刷新登录页回到默认态并保留来源',
      finalUrl.startsWith('/login?source=client') && text.includes('登录 i吉祥 PC 客户端')
      && text.includes('记住账号') && !text.includes('原型演示环境'),
      `url=${finalUrl}`)
    await context.close()
  }

  // ===== 16. 浏览器前进/后退不会绕过门禁 =====
  {
    const { context, page } = await newScenario()
    await goto(page, '/download')
    await clickText(page, 'PC Web进入')
    await waitForUrl(page, (u) => u.startsWith('/login?source=web'))
    await submitLogin(page)
    await waitForUrl(page, (u) => u.startsWith('/pc_web'))
    // 头像区最小退出菜单（header 内含头像的按钮）
    await page.click('header button:has(img)')
    await wait(page, 300)
    await clickText(page, '退出登录', 'button')
    await waitForText(page, '退出后将离开 i吉祥 PC Web', 4000)
    await clickText(page, '确认退出')
    await waitForUrl(page, (u) => u.startsWith('/login?source=web'), 8000)
    await page.goBack()
    await wait(page, 1000)
    const backUrl = await url(page)
    const backText = await body(page)
    const backSafe = !backUrl.startsWith('/pc_web') || backText.includes('登录 i吉祥')
    await page.goForward()
    await wait(page, 1000)
    const forwardUrl = await waitForUrl(page, (u) => !u.startsWith('/pc_web') || u.startsWith('/login'), 6000)
    const forwardText = await body(page)
    ok('16 浏览器后退/前进不绕过门禁',
      backSafe && (forwardUrl.startsWith('/login') || forwardUrl.startsWith('/download')) && !forwardText.includes('您的位置：首页 · 企业门户'),
      `back=${backUrl} forward=${forwardUrl}`)
    await context.close()
  }

  // ===== 17. 控制台无新增 error，页面无 pageerror =====
  ok('17 控制台无新增 error / pageerror', errors.length === 0, errors.slice(0, 5).join(' | '))

  console.log(`\n=== ${results.filter(Boolean).length}/${results.length} PASS, errors=${errors.length} ===`)
  errors.slice(0, 10).forEach((e) => console.log('  ' + e))
  process.exitCode = results.every(Boolean) ? 0 : 1
} finally {
  await browser.close()
}
