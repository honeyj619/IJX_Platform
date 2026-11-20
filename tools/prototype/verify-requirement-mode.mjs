#!/usr/bin/env node
/**
 * 需求模式入口浏览器回归（`npm run check:req-mode`）
 *
 * 目标：锁定 2026-11-16 引入的"需求模式入口可拖动"点击回归——
 * 外层工具条对任意子元素 pointerdown 都立即 setPointerCapture，导致按钮点击失效。
 * 修复后拖拽只从独立手柄启动，业务按钮保持标准事件链。
 *
 * 验收点（必须使用真实 pointer/mouse/touch/keyboard 事件，不能只调用 DOM .click()）：
 * 1. 点击按钮内部文字/图标后 aria-pressed false -> true，localStorage 同步
 * 2. 再次点击可关闭，状态与 localStorage 一致
 * 3. 生产构建开启后能看到需求角标并打开详情
 * 4. 生产构建不存在 新增/编辑/删除/排序/重新定位/导入 入口
 * 5. 本机开发环境存在维护入口（新增按钮），且维护 API 可达
 * 6. 拖动手柄超过阈值会移动并持久化位置，但不会切换需求模式
 * 7. 拖动结束后立即点击开关仍然有效
 * 8. 键盘 Enter/Space、触控 tap 各覆盖一次
 * 9. 路由切换后需求模式状态保持、详情面板关闭
 *
 * 环境约定（与 .workbuddy/scripts 既有 e2e 脚本一致）：
 * - Chrome: C:\Program Files\Google\Chrome\Application\chrome.exe（可用 CHROME_PATH 覆盖）
 * - playwright-core 自 openclaw 依赖注入（可用 PLAYWRIGHT_CORE 覆盖）
 *
 * 用法：npm.cmd run check:req-mode
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.PLAYWRIGHT_CORE || 'D:/NodeJs/node_global/node_modules/openclaw/node_modules/playwright-core',
);
const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rootDir, '..', '..');
const viteEntry = path.join(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js');
const buildOutDir = path.join(repoRoot, 'node_modules', '.reqmode-check-dist');

const PREVIEW_PORT = 4188;
const DEV_PORT = 5199;
const PREVIEW_BASE = `http://127.0.0.1:${PREVIEW_PORT}`;
const DEV_BASE = `http://127.0.0.1:${DEV_PORT}`;
const TEST_ROUTE = '/pc_client/ruyi-zone';
const TEST_ROUTE_HOME = '/pc_client';
const ENTRY_MODE_KEY = 'ijx-prototype-requirement-mode';
const ENTRY_POS_KEY = 'ijx-requirement-entry-pos-v1';

const results = [];
function report(name, ok, detail = '') {
  const line = ok ? `PASS ${name}` : `FAIL ${name}${detail ? ` | ${detail}` : ''}`;
  results.push(line);
  console.log(line);
}

async function spawnServer(args, label) {
  const proc = spawn(process.execPath, args, { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  proc.stdout.on('data', (chunk) => { output += chunk; });
  proc.stderr.on('data', (chunk) => { output += chunk; });
  const waitForServer = async (url, timeoutMs = 60_000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (proc.exitCode !== null) {
        throw new Error(`${label} exited before startup.\n${output.slice(-2000)}`);
      }
      try {
        const response = await fetch(url);
        if (response.ok) return;
      } catch {
        // still starting
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`${label} did not start within ${timeoutMs}ms.\n${output.slice(-2000)}`);
  };
  return { proc, output, waitForServer };
}

function killServer(proc) {
  if (proc && proc.exitCode === null) {
    try { proc.kill('SIGTERM'); } catch { /* already gone */ }
  }
}

async function waitForEntry(page, baseUrl, timeoutMs = 60_000) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${baseUrl}${TEST_ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.locator('[data-requirement-ui] button[aria-pressed]').first().waitFor({ timeout: timeoutMs });
}

async function freshPage(browser, opts = {}) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    hasTouch: Boolean(opts.hasTouch),
  });
  const apiRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('/__ijx/requirements')) apiRequests.push(request.url());
  });
  return { page, apiRequests };
}

const toggleButton = (page) => page.locator('[data-requirement-ui] button[aria-pressed]').first();
const dragHandle = (page) => page.locator('[data-requirement-ui] button[aria-label="拖动需求模式入口"]').first();
const addButton = (page) => page.locator('[data-requirement-ui] button[title="新增原型需求"]');

async function runProductionPhase(browser, baseUrl) {
  console.log('--- Phase A: 生产构建（只读） ---');
  const { page, apiRequests } = await freshPage(browser);
  await waitForEntry(page, baseUrl);

  // 4. 生产构建不存在维护入口（含开启后）
  const maintenanceBefore = await addButton(page).count();
  if (maintenanceBefore !== 0) {
    report('生产无维护入口（开启前）', false, `新增按钮出现 ${maintenanceBefore} 个`);
  } else {
    report('生产无维护入口（开启前）', true);
  }

  // 1. 真实点击按钮内部文字：aria-pressed false -> true，localStorage 同步
  await page.locator('[data-requirement-ui] button[aria-pressed] span').first().click();
  await page.waitForTimeout(150);
  const pressedOn = await toggleButton(page).getAttribute('aria-pressed');
  const storageOn = await page.evaluate((key) => window.localStorage.getItem(key), ENTRY_MODE_KEY);
  if (pressedOn !== 'true' || storageOn !== 'true') {
    report('真实点击开启需求模式', false, `aria-pressed=${pressedOn} localStorage=${storageOn}`);
  } else {
    report('真实点击开启需求模式', true);
  }

  // 3. 生产构建开启后能看到角标并打开详情
  // 角标 aria-label 形如 "{surface}需求 {序号}：{title}"；带空格以排除拖拽手柄的 "拖动需求模式入口"
  const badgeLocator = page.locator('div[data-requirement-ui] button[aria-label*="需求 "]');
  let badgeCount = 0;
  try {
    await badgeLocator.first().waitFor({ timeout: 8_000 });
    badgeCount = await badgeLocator.count();
  } catch {
    badgeCount = 0;
  }
  if (badgeCount < 1) {
    report('开启后出现需求角标', false, `角标数=${badgeCount}`);
  } else {
    report('开启后出现需求角标', true, `角标数=${badgeCount}`);
    await badgeLocator.first().click();
    await page.locator('aside[data-requirement-ui]').first().waitFor({ timeout: 10_000 });
    const panelTitle = await page.locator('aside[data-requirement-ui] h2').first().textContent();
    if (!panelTitle || panelTitle.trim() !== '原型需求') {
      report('打开需求详情面板', false, `面板标题=${panelTitle}`);
    } else {
      report('打开需求详情面板', true);
    }
    await page.locator('aside[data-requirement-ui] button[title="关闭需求面板"]').first().click();
  }

  // 4b. 开启后生产仍无维护入口
  if ((await addButton(page).count()) !== 0) {
    report('生产无维护入口（开启后）', false);
  } else {
    report('生产无维护入口（开启后）', true);
  }

  // 2. 再次真实点击关闭
  await toggleButton(page).click();
  await page.waitForTimeout(150);
  const pressedOff = await toggleButton(page).getAttribute('aria-pressed');
  const storageOff = await page.evaluate((key) => window.localStorage.getItem(key), ENTRY_MODE_KEY);
  if (pressedOff !== 'false' || storageOff !== 'false') {
    report('真实点击关闭需求模式', false, `aria-pressed=${pressedOff} localStorage=${storageOff}`);
  } else {
    report('真实点击关闭需求模式', true);
  }

  // 网络：生产绝不请求维护 API
  if (apiRequests.length !== 0) {
    report('生产不请求 /__ijx/requirements', false, apiRequests.join(','));
  } else {
    report('生产不请求 /__ijx/requirements', true);
  }

  // 6. 拖动手柄超过阈值：移动并持久化位置，不切换需求模式
  const handle = dragHandle(page);
  const beforeBox = await handle.boundingBox();
  if (!beforeBox) {
    report('拖拽手柄存在', false, '未找到手柄');
    await page.close();
    return;
  }
  report('拖拽手柄存在', true);
  const startX = beforeBox.x + beforeBox.width / 2;
  const startY = beforeBox.y + beforeBox.height / 2;
  // 入口默认在右上角（right:16），向右拖会被窗口夹紧；向左上方拖 140/60px 确保可见位移
  const targetX = startX - 140;
  const targetY = startY + 60;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(80);
  await page.mouse.move(targetX, targetY, { steps: 8 });
  await page.waitForTimeout(80);
  await page.mouse.up();
  await page.waitForTimeout(200);
  const afterBox = await handle.boundingBox();
  const posRaw = await page.evaluate((key) => window.localStorage.getItem(key), ENTRY_POS_KEY);
  const movedDistance = Math.hypot((afterBox?.x ?? 0) - beforeBox.x, (afterBox?.y ?? 0) - beforeBox.y);
  if (movedDistance < 60) {
    report('拖动后入口移动', false, `位移=${Math.round(movedDistance)}px localStorage=${posRaw}`);
  } else {
    report('拖动后入口移动', true, `位移=${Math.round(movedDistance)}px`);
  }
  const posParsed = posRaw ? JSON.parse(posRaw) : null;
  if (!posParsed || !Number.isFinite(posParsed.x) || !Number.isFinite(posParsed.y)) {
    report('拖动位置持久化', false, `localStorage=${posRaw}`);
  } else {
    report('拖动位置持久化', true, `(${Math.round(posParsed.x)}, ${Math.round(posParsed.y)})`);
  }
  const pressedAfterDrag = await toggleButton(page).getAttribute('aria-pressed');
  if (pressedAfterDrag !== 'false') {
    report('拖动不切换需求模式', false, `aria-pressed=${pressedAfterDrag}`);
  } else {
    report('拖动不切换需求模式', true);
  }

  // 7. 拖动结束后立即点击开关仍然有效
  await toggleButton(page).click();
  await page.waitForTimeout(150);
  if ((await toggleButton(page).getAttribute('aria-pressed')) !== 'true') {
    report('拖后立即点击开关有效', false);
  } else {
    report('拖后立即点击开关有效', true);
  }
  await toggleButton(page).click();
  await page.waitForTimeout(120);

  // 9. 路由切换：模式保持、详情关闭（full-load 等价于路由变更后的状态复位）
  await toggleButton(page).click();
  await page.waitForTimeout(150);
  if ((await addButton(page).count()) !== 0) {
    report('生产开启后无维护入口（再确认）', false);
  } else {
    report('生产开启后无维护入口（再确认）', true);
  }
  await page.goto(`${baseUrl}${TEST_ROUTE_HOME}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.locator('[data-requirement-ui] button[aria-pressed]').first().waitFor({ timeout: 30_000 });
  const pressedAfterNav = await toggleButton(page).getAttribute('aria-pressed');
  const panelAfterNav = await page.locator('aside[data-requirement-ui]').count();
  if (pressedAfterNav !== 'true') {
    report('路由切换后模式保持', false, `aria-pressed=${pressedAfterNav}`);
  } else {
    report('路由切换后模式保持', true);
  }
  if (panelAfterNav !== 0) {
    report('路由切换后详情关闭', false, `面板数=${panelAfterNav}`);
  } else {
    report('路由切换后详情关闭', true);
  }

  await page.close();
}

async function runKeyboardAndTouchPhase(browser, baseUrl) {
  console.log('--- Phase A-2: 键盘与触控 ---');
  // 8a. 键盘 Enter / Space
  const { page } = await freshPage(browser);
  await waitForEntry(page, baseUrl);
  await page.evaluate((key) => window.localStorage.removeItem(key), ENTRY_MODE_KEY);
  await toggleButton(page).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
  const enterOn = await toggleButton(page).getAttribute('aria-pressed');
  if (enterOn !== 'true') {
    report('键盘 Enter 开启', false, `aria-pressed=${enterOn}`);
  } else {
    report('键盘 Enter 开启', true);
  }
  await page.keyboard.press(' ');
  await page.waitForTimeout(120);
  const spaceOff = await toggleButton(page).getAttribute('aria-pressed');
  if (spaceOff !== 'false') {
    report('键盘 Space 关闭', false, `aria-pressed=${spaceOff}`);
  } else {
    report('键盘 Space 关闭', true);
  }
  await page.close();

  // 8b. 触控 tap
  const touch = await freshPage(browser, { hasTouch: true });
  await waitForEntry(touch.page, baseUrl);
  const box = await toggleButton(touch.page).boundingBox();
  if (!box) {
    report('触控 tap 开启', false, '按钮不可见');
  } else {
    await touch.page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await touch.page.waitForTimeout(250);
    const tapOn = await toggleButton(touch.page).getAttribute('aria-pressed');
    if (tapOn !== 'true') {
      report('触控 tap 开启', false, `aria-pressed=${tapOn}`);
    } else {
      report('触控 tap 开启', true);
    }
  }
  await touch.page.close();
}

async function runDevPhase(browser, baseUrl) {
  console.log('--- Phase B: 本机开发环境（维护可见性） ---');
  const { page, apiRequests } = await freshPage(browser);
  await waitForEntry(page, baseUrl);

  // 5. 开启后出现维护入口（新增按钮）
  await toggleButton(page).click();
  await page.waitForTimeout(200);
  const addVisible = await addButton(page).count();
  if (addVisible !== 1) {
    report('开发环境出现维护入口', false, `新增按钮=${addVisible}`);
  } else {
    report('开发环境出现维护入口', true);
  }

  // 维护 API 可达（开启后组件会 GET /__ijx/requirements）
  if (apiRequests.length === 0) {
    report('开发环境维护 API 可达', false, '未捕获到 /__ijx/requirements 请求');
  } else {
    report('开发环境维护 API 可达', true, `${apiRequests.length} 个请求`);
  }

  // 新增入口可进入点选流程（不创建任何数据），Esc 取消
  await addButton(page).click();
  const selectionBar = page.locator('[data-requirement-ui].fixed', { hasText: 'Esc 取消' }).first();
  try {
    await selectionBar.waitFor({ timeout: 8_000 });
    report('进入新增点选流程', true);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    if ((await selectionBar.count()) !== 0) {
      report('Esc 取消点选', false, '点选栏仍存在');
    } else {
      report('Esc 取消点选', true);
    }
  } catch {
    report('进入新增点选流程', false, '未出现点选提示栏');
  }

  // 开关仍可正常关闭
  await toggleButton(page).click();
  await page.waitForTimeout(150);
  if ((await toggleButton(page).getAttribute('aria-pressed')) !== 'false') {
    report('开发环境关闭需求模式', false);
  } else {
    report('开发环境关闭需求模式', true);
  }
  await page.close();
}

async function main() {
  // 1. 生产构建
  const buildProc = spawn(
    process.execPath,
    [viteEntry, 'build', '--config', 'vite.react.config.mjs', '--configLoader', 'runner',
      '--outDir', buildOutDir, '--emptyOutDir'],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let buildOutput = '';
  buildProc.stdout.on('data', (chunk) => { buildOutput += chunk; });
  buildProc.stderr.on('data', (chunk) => { buildOutput += chunk; });
  const buildCode = await new Promise((resolve) => buildProc.on('exit', resolve));
  if (buildCode !== 0) {
    console.error(`生产构建失败（exit ${buildCode}）:\n${buildOutput.slice(-2000)}`);
    process.exitCode = 1;
    return;
  }
  console.log('生产构建完成');

  const preview = await spawnServer(
    [viteEntry, 'preview', '--config', 'vite.react.config.mjs', '--configLoader', 'runner',
      '--outDir', buildOutDir, '--host', '127.0.0.1', '--port', String(PREVIEW_PORT), '--strictPort'],
    'vite preview',
  );
  const dev = await spawnServer(
    [viteEntry, '--config', 'vite.react.config.mjs', '--configLoader', 'runner',
      '--host', '127.0.0.1', '--port', String(DEV_PORT), '--strictPort'],
    'vite dev',
  );

  let browser;
  try {
    await preview.waitForServer(`${PREVIEW_BASE}/`, 30_000);
    await dev.waitForServer(`${DEV_BASE}/`, 90_000);
    browser = await chromium.launch({ headless: true, executablePath: CHROME_PATH, args: ['--no-sandbox'] });

    await runProductionPhase(browser, PREVIEW_BASE);
    await runKeyboardAndTouchPhase(browser, PREVIEW_BASE);
    await runDevPhase(browser, DEV_BASE);
  } catch (error) {
    console.error(`回归执行异常: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    killServer(preview.proc);
    killServer(dev.proc);
  }

  const failed = results.filter((line) => line.startsWith('FAIL')).length;
  console.log(`\n需求模式回归: ${results.length - failed}/${results.length} 项通过`);
  if (failed > 0) {
    results.filter((line) => line.startsWith('FAIL')).forEach((line) => console.error(line));
    process.exitCode = 1;
  }
}

main();
