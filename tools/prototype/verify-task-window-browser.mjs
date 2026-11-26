import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('D:/NodeJs/node_global/node_modules/openclaw/node_modules/playwright-core');

const BASE = process.env.TASK_WINDOW_BASE || 'http://127.0.0.1:5173';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const screenshotPath = process.env.TASK_WINDOW_SCREENSHOT;
const failures = [];
const pass = (name, condition, detail = '') => {
  console.log(`${condition ? 'PASS' : 'FAIL'} | ${name}${detail ? ` | ${detail}` : ''}`);
  if (!condition) failures.push(name);
};

const browser = await chromium.launch({ headless: true, executablePath: CHROME });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

try {
  await page.goto(`${BASE}/login?source=client`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  if (await page.locator('#login-password').count() === 0) {
    const bodyPreview = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 500);
    console.error(`登录页未渲染：url=${page.url()} body=${bodyPreview || '<empty>'} errors=${errors.join(' | ') || '<none>'}`);
    if (screenshotPath) await page.screenshot({ path: screenshotPath.replace(/\.png$/i, '-login-error.png'), fullPage: true });
  }
  await page.fill('#login-password', 'demo-password');
  await page.click('button[type=submit]');
  await page.waitForURL((url) => url.pathname.endsWith('/pc_client') || url.pathname.endsWith('/pc_client/'), { timeout: 15000 });

  await page.goto(`${BASE}/pc_client/calendar`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '创建日程', exact: true }).click();
  await page.waitForURL((url) => url.pathname.endsWith('/pc_client/calendar/create'), { timeout: 8000 });
  pass('创建日程在当前页面进入任务窗口', context.pages().length === 1, `pages=${context.pages().length}`);
  const frame = page.locator('section[aria-label$="任务窗口"]');
  const stageBackground = await frame.locator('..').evaluate((element) => getComputedStyle(element).backgroundImage);
  pass('任务窗口舞台与窗口框存在', await frame.count() === 1 && stageBackground.includes('client-task-stage'), stageBackground);
  pass('Windows 标题栏没有 macOS 交通灯', await page.locator('[aria-label="窗口控制"] .rounded-full').count() === 0);
  pass('任务窗口标题为创建日程', (await page.locator('h1').first().innerText()) === '创建日程');

  await page.getByPlaceholder('请输入日程或会议主题').fill('Windows 任务窗口验证');
  await page.getByTitle('关闭窗口').click();
  pass('脏数据关闭显示 Modal', await page.getByText('放弃未保存的修改？', { exact: true }).isVisible());
  pass('Modal 叠加在任务窗口内', await page.locator('.task-window-frame').isVisible() && await page.locator('[role="dialog"]').isVisible());
  await page.getByRole('button', { name: '继续编辑' }).click();

  await page.getByTitle('最大化窗口').click();
  pass('最大化在客户端舞台内模拟', await page.locator('.task-window-frame--maximized').count() === 1);
  // 需求模式浮动工具在开发环境可能覆盖右上角；程序触发用于验证窗口自身的还原处理。
  await page.getByTitle('还原窗口').evaluate((element) => element.click());
  if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.getByTitle('关闭窗口').click();
  await page.getByRole('button', { name: '放弃修改' }).click();
  await page.waitForURL((url) => url.pathname.endsWith('/pc_client/calendar'), { timeout: 8000 });
  pass('关闭任务窗口返回来源页', page.url().includes('/pc_client/calendar'));

  await page.goto(`${BASE}/pc_client/meetings`, { waitUntil: 'domcontentloaded' });
  await page.getByText('预定会议', { exact: true }).click();
  await page.waitForURL((url) => url.pathname.endsWith('/pc_client/meetings/create'), { timeout: 8000 });
  pass('预定会议复用创建日程窗口', (await page.locator('h1').first().innerText()) === '创建日程');
  pass('预定会议不打开浏览器新页', context.pages().length === 1, `pages=${context.pages().length}`);
  pass('运行时无新增控制台错误', errors.length === 0, errors.join(' | '));
} finally {
  await context.close();
  await browser.close();
}

if (failures.length) {
  console.error(`任务窗口浏览器回归失败（${failures.length} 项）`);
  process.exit(1);
}
console.log('任务窗口浏览器回归通过。');
