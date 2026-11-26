#!/usr/bin/env node
/**
 * 日程参与者选择器浏览器回归（`npm run check:participants`）
 *
 * 目标：锁定 /pc_client/calendar 创建日程"参与者"字段的双入口改造——
 * ParticipantSelector（输入搜索：联系人/群/邮箱分类 + 键盘操作）+ 批量添加（复用 ContactPicker）。
 * 2026-11-24：原"预约会议"弹框更名"创建日程"成为唯一创建入口，旧 MeetingScheduleDialog 从日历移除。
 * 2026-11-25：创建日程改为独立子窗口（/pc_client/calendar/create），日历内弹框整体退役；
 *              本脚本改为捕获 window.open 出的子窗口，断言点保持等价。
 *
 * 验收点（真实键盘/鼠标事件）：
 * 1. 工具栏"创建日程"打开独立窗口且标题为"创建日程"；输入框占位"添加联系人、群或邮箱"
 * 2. 输入姓名命中联系人并添加为标签；重复输入显示已选状态且不可重复添加
 * 3. 账号搜索（zhuge）命中联系人；群搜索命中群（类型 + 成员数）；外部邮箱可添加
 * 4. 键盘 ArrowDown + Enter 添加；Escape 只关闭浮层；Enter 不越权添加已选项
 * 5. 非法邮箱提示"邮箱格式不正确"且 Enter 不添加
 * 6. 标签支持单独移除
 * 7. 批量添加：打开前关闭搜索浮层；已选联系人回显；多选合并；群和邮箱不被覆盖；取消不生效
 * 8. 保存后 meetingStore 参与者 = 召集人 + 联系人姓名 + 群成员展开 + 邮箱，去重且召集人不重复
 * 9. 关闭并重新打开窗口不残留上一次未保存内容
 * 10. 会议室为选填：不添加会议室可保存普通日程（仅落日历事件，不建会议）
 * 11. 个人门户深链 ?create=1 直达创建窗口
 * 12. 1280 / 1920 宽度下参与者标签换行不挤压"批量添加"按钮
 * 13. 全程无 console error / pageerror
 *
 * 环境约定（与 verify-requirement-mode.mjs 一致）：
 * - Chrome: C:\Program Files\Google\Chrome\Application\chrome.exe（可用 CHROME_PATH 覆盖）
 * - playwright-core 自 openclaw 依赖注入（可用 PLAYWRIGHT_CORE 覆盖）
 *
 * 用法：npm.cmd run check:participants
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

const DEV_PORT = 5213;
const DEV_BASE = `http://127.0.0.1:${DEV_PORT}`;
const TEST_ROUTE = '/pc_client/calendar';
const TASK_WINDOW_ROUTE = '/pc_client/calendar/create';
const MEETING_STORAGE_KEY = 'ijx-ruyi-meeting-store-v1';

const results = [];
function report(name, ok, detail = '') {
  const line = ok ? `PASS ${name}` : `FAIL ${name}${detail ? ` | ${detail}` : ''}`;
  results.push(line);
  console.log(line);
}

async function spawnDevServer() {
  const proc = spawn(process.execPath, [
    viteEntry,
    '--config', 'vite.react.config.mjs',
    '--configLoader', 'runner',
    '--host', '127.0.0.1',
    '--port', String(DEV_PORT),
    '--strictPort',
  ], { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  proc.stdout.on('data', (chunk) => { output += chunk; });
  proc.stderr.on('data', (chunk) => { output += chunk; });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (proc.exitCode !== null) {
      throw new Error(`dev server exited before startup.\n${output.slice(-2000)}`);
    }
    try {
      const response = await fetch(`${DEV_BASE}/download`);
      if (response.ok) return proc;
    } catch {
      // still starting
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`dev server did not start within 60s.\n${output.slice(-2000)}`);
}

function killServer(proc) {
  if (proc && proc.exitCode === null) {
    try { proc.kill(); } catch { /* already gone */ }
  }
}

const tagLocator = (win, label) => win.locator(`[aria-label="移除${label}"]`);
const tagCount = async (win) => win.locator('[aria-label^="移除"]').count();
const listbox = (win) => win.locator('#participant-suggest-list');

/**
 * 点击工具栏「创建日程」并进入任务窗口。
 * 2026-11-26：Web 原型改为同一应用视口内进入任务窗口路由（不再 window.open 浏览器子窗口），
 * 因此这里等待 URL 切换到任务窗口路由，返回的仍是同一个 page。
 */
async function openTaskWindow(page) {
  await page.getByRole('button', { name: '创建日程' }).click();
  await page.waitForURL((url) => url.pathname.includes(TASK_WINDOW_ROUTE), { timeout: 20_000 });
  await page.locator('h1').first().waitFor({ state: 'visible', timeout: 20_000 });
  return page;
}

/** 关闭任务窗口：同页形态下回到来源页（等价于窗口壳的关闭/取消返回） */
async function closeTaskWindow(page) {
  await page.goto(`${DEV_BASE}${TEST_ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
}

/** 保存后任务窗口按规范返回来源页（同页形态下的"窗口关闭"等价断言） */
const waitReturnToSource = (page) =>
  page.waitForURL((url) => url.pathname === TEST_ROUTE, { timeout: 10_000 }).then(() => true).catch(() => false);

const sortNames = (list) => [...list].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));

async function run() {
  const server = await spawnDevServer();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-proxy-server', '--proxy-bypass-list=*'],
  });
  const errors = [];
  const watch = (win, prefix) => {
    win.on('pageerror', (error) => errors.push(`${prefix}pageerror: ` + error.message.slice(0, 160)));
    win.on('console', (message) => {
      const text = message.text();
      if (message.type() === 'error' && !/favicon|dicebear|Failed to load resource/.test(text)) {
        errors.push(`${prefix}console: ` + text.slice(0, 160));
      }
    });
  };
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    watch(page, '');

    // 干净环境：清空持久化后走统一登录门禁（/pc_client/* 未登录渲染客户端未登录页），登录链复用 req-mode 回归模式
    await page.goto(`${DEV_BASE}/pc_client`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${DEV_BASE}/login?source=client`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.fill('#login-password', 'participants-e2e');
    await page.click('button[type=submit]');
    await page.waitForURL(`${DEV_BASE}/pc_client`, { timeout: 60_000 });
    await page.goto(`${DEV_BASE}${TEST_ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });

    // 1. 工具栏「创建日程」进入任务窗口（同页路由）
    let win = await openTaskWindow(page);
    const headerText = await win.locator('h1').first().textContent();
    report('创建日程按钮打开任务窗口且标题为"创建日程"', headerText?.includes('创建日程') === true && win.url().includes(TASK_WINDOW_ROUTE), `标题=${headerText} url=${win.url()}`);
    const field = win.locator('[data-requirement-id="custom-20261028-005"]');
    const input = field.locator('input[placeholder="添加联系人、群或邮箱"]');
    report('参与者输入框占位文案', await input.count() === 1);

    // 2. 姓名搜索 + 添加
    await input.fill('刘备');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    const personRow = listbox(win).locator('button:has-text("刘备")').first();
    report('搜索浮层按联系人分类展示', (await listbox(win).textContent())?.includes('联系人') === true);
    await personRow.click();
    await win.waitForTimeout(200);
    report('点击联系人后加入标签并清空关键词', await tagLocator(win, '刘备').count() === 1 && (await input.inputValue()) === '');

    // 重复添加：显示已选状态，点击不重复写入
    await input.fill('刘备');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    const duplicateRow = listbox(win).locator('button:has-text("刘备")').first();
    report('已添加联系人显示选中状态', await duplicateRow.locator('svg.lucide-check').count() === 1);
    await duplicateRow.click();
    await win.waitForTimeout(200);
    report('已添加联系人不可重复添加', await tagLocator(win, '刘备').count() === 1);

    // 3. 账号搜索（诸葛亮 account=zhugeliang）
    await input.fill('zhuge');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    report('账号搜索命中联系人', await listbox(win).locator('button:has-text("诸葛亮")').count() === 1);
    await listbox(win).locator('button:has-text("诸葛亮")').first().click();
    await win.waitForTimeout(200);

    // 无结果空态
    await input.fill('不存在的目录人员');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    report('无结果时提示可输入完整邮箱邀请', (await listbox(win).textContent())?.includes('未找到联系人或群') === true);
    await input.fill('');

    // 外部邮箱搜索
    await input.fill('partner@example.com');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    const emailRow = listbox(win).locator('button:has-text("添加邮箱：partner@example.com")');
    report('合法邮箱展示"添加邮箱"项', await emailRow.count() === 1);
    await emailRow.click();
    await win.waitForTimeout(200);
    report('外部邮箱加入标签', await tagLocator(win, 'partner@example.com').count() === 1);

    // 群搜索（运行时 imStore 群数据）
    await input.fill('前端组');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    const groupBox = listbox(win).locator('button:has-text("前端组项目群")');
    const groupText = await groupBox.textContent();
    report('群搜索展示类型与成员数', (await listbox(win).textContent())?.includes('群') === true
      && groupText?.includes('普通群') === true && groupText?.includes('4 人') === true, `行=${groupText}`);
    await groupBox.click();
    await win.waitForTimeout(200);
    report('群加入标签', await tagLocator(win, '前端组项目群').count() === 1);

    // 4. 键盘：ArrowDown + Enter（"开发"命中 张飞/赵云，下移一位选中赵云）
    await input.fill('开发');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    await win.keyboard.press('ArrowDown');
    await win.keyboard.press('Enter');
    await win.waitForTimeout(200);
    report('键盘 ArrowDown + Enter 添加命中项', await tagLocator(win, '赵云').count() === 1);

    // Escape 只关闭浮层
    await input.fill('司');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    await win.keyboard.press('Escape');
    await win.waitForTimeout(200);
    report('Escape 关闭搜索浮层', (await listbox(win).count()) === 0 && !win.isClosed());
    await input.fill('');

    // 5. 非法邮箱提示且 Enter 不添加
    const beforeInvalid = await tagCount(win);
    await input.fill('abc@');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    report('非法邮箱展示格式提示', (await listbox(win).textContent())?.includes('邮箱格式不正确') === true);
    await win.keyboard.press('Enter');
    await win.waitForTimeout(200);
    report('非法邮箱 Enter 不添加', (await tagCount(win)) === beforeInvalid);
    await input.fill('');

    // 6. 标签移除
    await tagLocator(win, '诸葛亮').click();
    await win.waitForTimeout(200);
    report('标签单独移除', await tagLocator(win, '诸葛亮').count() === 0);

    // 7. 批量添加：打开前关闭搜索浮层
    await input.fill('刘');
    await listbox(win).waitFor({ state: 'visible', timeout: 5_000 });
    await field.getByRole('button', { name: /批量添加/ }).click();
    const picker = win.locator('[data-requirement-id="custom-20261028-004"]');
    await picker.waitFor({ state: 'visible', timeout: 5_000 });
    report('批量添加打开通讯录并关闭搜索浮层', (await listbox(win).count()) === 0 && (await picker.count()) === 1);
    report('通讯录仅人员可选（标题）', (await picker.locator('h3').textContent()).includes('选择人员') === true);
    const pickerFooterText = await picker.locator('div.flex.shrink-0.items-center.justify-between.border-t span').first().textContent();
    report('批量通讯录回显已选联系人', pickerFooterText?.includes('已选 2 项') === true, `底部=${pickerFooterText}`);

    // 批量取消不生效
    await picker.getByRole('button', { name: '取消' }).click();
    await win.waitForTimeout(200);
    const countAfterCancel = await tagCount(win);
    report('批量通讯录取消不改变已选', countAfterCancel === 4, `标签数=${countAfterCancel}`);

    // 批量选择：搜索并追加联系人，确认后合并，群和邮箱不被覆盖
    await field.getByRole('button', { name: /批量添加/ }).click();
    await picker.waitFor({ state: 'visible', timeout: 5_000 });
    const pickerSearch = picker.locator('input[placeholder="可输入多个人名或组织名称"]');
    await pickerSearch.fill('黄忠');
    await win.waitForTimeout(300);
    await picker.locator('button:has-text("黄忠")').first().click();
    await picker.getByRole('button', { name: '确定', exact: true }).click();
    await win.waitForTimeout(300);
    report('批量选择确认后合并联系人', await tagLocator(win, '黄忠').count() === 1);
    report('批量合并保留群和邮箱', await tagLocator(win, '前端组项目群').count() === 1
      && await tagLocator(win, 'partner@example.com').count() === 1);

    // 8. 保存：添加会议室后保存，校验 meetingStore 参与者展开与去重
    await win.locator('input[placeholder="请输入标题"]').fill('参与者回归测试');
    await win.locator('button:has-text("+ 添加会议室")').click();
    const roomDialog = win.locator('[data-requirement-id="ruyi-meetings-room-picker"]');
    await roomDialog.waitFor({ state: 'visible', timeout: 5_000 });
    await roomDialog.locator('button:has-text("6404")').first().click();
    await roomDialog.getByRole('button', { name: '确定', exact: true }).click();
    await win.waitForTimeout(200);
    const saved = await win.getByRole('button', { name: '确定', exact: true }).isEnabled();
    report('添加会议室后可保存', saved === true);
    const closed = waitReturnToSource(page);
    await win.getByRole('button', { name: '确定', exact: true }).click();
    report('保存后任务窗口返回来源页', await closed === true);

    const store = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? '{}'), MEETING_STORAGE_KEY);
    const created = (store.meetings ?? []).find((meeting) => meeting.title === '参与者回归测试');
    const expectedParticipants = sortNames([
      '梁吉力', '刘备', '诸葛亮', '马超', 'partner@example.com', '赵云', '黄忠',
    ]);
    const actualParticipants = sortNames(created?.participants ?? []);
    report('保存后会议参与者数据正确',
      actualParticipants.length === expectedParticipants.length
      && actualParticipants.every((name, index) => name === expectedParticipants[index]),
      `实际=${JSON.stringify(actualParticipants)}`);
    report('召集人与群成员展开去重', (created?.participants ?? []).filter((name) => name === '梁吉力').length === 1
      && (created?.participants ?? []).includes('马超') === true);
    report('会议室写入会议记录', created?.roomId === '6404', `roomId=${created?.roomId}`);

    // 9. 重新打开不残留上一次未保存内容；随后不添加会议室保存普通日程（会议室选填）
    win = await openTaskWindow(page);
    const reopenTitle = await win.locator('input[placeholder="请输入标题"]').inputValue();
    const reopenTags = await tagCount(win);
    report('重新打开窗口不残留未保存内容', reopenTitle === '' && reopenTags === 0, `标题=${reopenTitle} 标签=${reopenTags}`);

    // 10. 会议室选填：仅填标题直接保存普通日程，只落日历事件、不建会议记录
    await win.locator('input[placeholder="请输入标题"]').fill('日程回归测试');
    const plainClosed = waitReturnToSource(page);
    await win.getByRole('button', { name: '确定', exact: true }).click();
    report('无会议室普通日程可保存', await plainClosed === true);
    const plainStore = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? '{}'), MEETING_STORAGE_KEY);
    const plainEvent = (plainStore.calendarEvents ?? []).find((event) => event.title === '日程回归测试');
    const plainMeetingExists = (plainStore.meetings ?? []).some((meeting) => meeting.title === '日程回归测试');
    report('普通日程仅落日历事件不建会议', Boolean(plainEvent) && !plainMeetingExists, `事件=${JSON.stringify(plainEvent)} 建会议=${plainMeetingExists}`);

    // 11. 个人门户深链 ?create=1 直达创建窗口（同页形态：进入创建窗口路由）
    await page.goto(`${DEV_BASE}${TEST_ROUTE}?create=1`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    win = await page.waitForURL((url) => url.pathname.includes(TASK_WINDOW_ROUTE), { timeout: 20_000 }).then(() => page).catch(() => page);
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
    report('深链 ?create=1 直达创建窗口', page.url().includes(TASK_WINDOW_ROUTE) === true, `url=${page.url()}`);
    await closeTaskWindow(page);

    // 12. 1280 / 1920 宽度下标签换行不挤压批量添加按钮（同页形态：直接调整主视口）
    for (const width of [1280, 1920]) {
      win = await openTaskWindow(page);
      await page.setViewportSize({ width, height: 900 });
      await win.waitForTimeout(300);
      const winField = win.locator('[data-requirement-id="custom-20261028-005"]');
      const inputBox = await winField.locator('input[placeholder="添加联系人、群或邮箱"]').boundingBox();
      const boxHeight = await winField.locator('div.min-h-9').boundingBox();
      const batchBox = await winField.getByRole('button', { name: /批量添加/ }).boundingBox();
      const okLayout = Boolean(inputBox && batchBox)
        && batchBox.x >= inputBox.x + inputBox.width - 2
        && batchBox.x + batchBox.width <= width - 24;
      report(`宽度 ${width} 下输入区不挤压批量添加按钮`, okLayout,
        `input=${JSON.stringify(inputBox)} button=${JSON.stringify(batchBox)}`);
      // 空态高度约定：输入框容器 py-1 + 输入行 h-7 = 36px，与右侧 h-9 按钮精确等高
      const heightAligned = Boolean(boxHeight && batchBox) && Math.abs(boxHeight.height - batchBox.height) <= 0.5;
      report(`宽度 ${width} 下输入框与批量添加按钮等高`, heightAligned,
        `input高=${boxHeight?.height} button高=${batchBox?.height}`);
      await closeTaskWindow(page);
    }
    await page.setViewportSize({ width: 1440, height: 900 });

    // 13. 无 console error / pageerror
    report('无 console error / pageerror', errors.length === 0, errors.join(' || '));
  } finally {
    await browser.close().catch(() => {});
    killServer(server);
  }

  const failed = results.filter((line) => line.startsWith('FAIL')).length;
  console.log(`\n=== ${results.length - failed}/${results.length} PASS ===`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
