import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const requireText = (file, text, label) => {
  if (!read(file).includes(text)) failures.push(`${label}: ${file} 缺少 ${JSON.stringify(text)}`);
};
const forbidText = (file, text, label) => {
  if (read(file).includes(text)) failures.push(`${label}: ${file} 不应包含 ${JSON.stringify(text)}`);
};

for (const route of [
  '/pc_client/calendar/create',
  '/pc_client/calendar/events/:eventId/edit',
  '/pc_client/meetings/create',
  '/pc_client/meetings/:meetingId/edit',
]) requireText('src/App.tsx', route, '任务窗口路由契约');

requireText('src/utils/taskWindow.ts', 'window.location.assign(href)', '同页任务窗口入口');
requireText('src/utils/taskWindow.ts', 'returnTo=', '来源页返回契约');
forbidText('src/utils/taskWindow.ts', 'window.open(', '禁止浏览器弹窗');

for (const color of ['#ed6a5e', '#f4bf4f', '#61c554']) {
  forbidText('src/components/interaction/TaskWindowShell.tsx', color, '禁止 macOS 交通灯');
}
requireText('src/components/interaction/TaskWindowShell.tsx', 'title="关闭窗口"', 'Windows 标题栏控制');
requireText('src/index.css', "url('./assets/client-task-stage.png')", '任务窗口舞台背景');

for (const file of [
  'src/pages/Calendar.tsx',
  'src/pages/Meetings.tsx',
  'src/components/MeetingRoomView.tsx',
  'src/components/MeetingDetailDialog.tsx',
]) {
  requireText(file, 'openScheduleTaskWindow', '统一任务窗口入口');
  forbidText(file, 'MeetingScheduleDialog', '移除旧预约弹框入口');
}
forbidText('src/pages/Calendar.tsx', 'bookingModalOpen', '移除日历重复大型弹框');
requireText('docs/CLIENT_INTERACTION_SURFACES.md', '不调用 `window.open`', 'Harness 原型边界');
requireText('docs/CLIENT_INTERACTION_SURFACES.md', '禁止出现 macOS 红黄绿交通灯', 'Harness 平台规范');

if (failures.length) {
  console.error(`任务窗口契约检查失败（${failures.length} 项）`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('任务窗口契约检查通过：路由、同页打开、Windows 标题栏、统一入口与 Harness 规则一致。');
