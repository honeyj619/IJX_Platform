#!/usr/bin/env node
/**
 * 项目体检与清理（给非技术使用者的一条命令）
 *
 * 默认只「体检」不删除：把仓库、收件箱、系统临时区的中间产物按类别列出来，附大小与建议。
 * 加 --apply 才真正删除，而且只删三类：可重建的构建产物、超期的临时文件、超期的一次性中间目录。
 *
 * 用法：
 *   node tools/maintenance/cleanup.mjs                # 体检（只读）
 *   node tools/maintenance/cleanup.mjs --apply        # 清理可重建产物 + 超期临时文件
 *   node tools/maintenance/cleanup.mjs --apply --all  # 额外清理超期的一次性中间目录
 *   --days N      判定「超期」的天数，默认 14
 *   --inbox PATH  收件箱目录，默认 C:\Users\jjie6\Documents\new ijx()
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const all = args.includes('--all');
const inboxClean = args.includes('--inbox-clean');
const daysIndex = args.indexOf('--days');
const days = daysIndex >= 0 ? Number(args[daysIndex + 1]) || 14 : 14;
const inboxIndex = args.indexOf('--inbox');
const inbox = inboxIndex >= 0 ? args[inboxIndex + 1] : 'C:\\Users\\jjie6\\Documents\\new ijx()';
const cutoff = Date.now() - days * 24 * 3600 * 1000;

const MB = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const KB = (bytes) => `${Math.round(bytes / 1024)} KB`;

function sizeOf(target) {
  try {
    const stat = fs.statSync(target);
    if (stat.isFile()) return stat.size;
    let total = 0;
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const next = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(next);
        else if (entry.isFile()) total += fs.statSync(next).size;
      }
    };
    walk(target);
    return total;
  } catch {
    return 0;
  }
}

const portBusy = () => {
  try {
    const out = execFileSync('netstat', ['-ano'], { encoding: 'utf8', timeout: 8000 });
    return out.split(/\r?\n/).some((line) => /:5173\b/.test(line) && /LISTENING/.test(line));
  } catch {
    return false;
  }
};

const previewRunning = portBusy();
const report = [];
const push = (group, item, bytes, note = '') => report.push({ group, item, bytes, note });

// 1) 仓库内可重建产物
const repoArtifacts = [
  ['dist', '构建产物（npm run build 重生成）'],
  ['.vite-react-cache', 'Vite 预构建缓存（下次启动重建）'],
  ['node_modules/.prototype-check-dist', 'check:build 的临时产物'],
  ['node_modules/.reqmode-check-dist', 'check:req-mode 的临时产物'],
  ['.dev-server.log', '开发服务器日志'],
  ['.preview-shots', '临时截图目录'],
];
for (const [rel, note] of repoArtifacts) {
  const target = path.join(repo, rel);
  if (!fs.existsSync(target)) continue;
  if (rel === '.vite-react-cache' && previewRunning) {
    push('仓库构建产物（预览运行中，本次跳过）', rel, sizeOf(target), note);
    continue;
  }
  push('仓库构建产物（可安全删除，可重建）', rel, sizeOf(target), note);
}

// 2) 收件箱：超期的一次性文件
const KNOWN_ONESHOT_DIRS = [
  'merge_task', 'merge_tmp', 'merge_tmp2', 'resolved-rebase', 'resolved-rebase-2',
  'work_patch', 'ijx-vite-cache', '.screenshots',
];
const SKIP_EXT = new Set(['.md', '.patch']); // 方案文档与补丁单独按更长周期

if (fs.existsSync(inbox)) {
  for (const entry of fs.readdirSync(inbox, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const full = path.join(inbox, entry.name);
    const stat = fs.statSync(full);
    const ext = path.extname(entry.name).toLowerCase();
    const stale = stat.mtimeMs < cutoff;
    const patchStale = stat.mtimeMs < Date.now() - 30 * 24 * 3600 * 1000;
    if (!stale) continue;
    if (ext === '.md') continue;
    if (ext === '.patch' ? !patchStale : false) continue;
    if (ext === '.patch' && !patchStale) continue;
    if (SKIP_EXT.has(ext) && ext !== '.patch') continue;
    push('收件箱超期中间文件（脚本/日志/结果图）', entry.name, stat.size, `${new Date(stat.mtimeMs).toISOString().slice(0, 10)}（>${days} 天）`);
  }

  for (const entry of fs.readdirSync(inbox, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!KNOWN_ONESHOT_DIRS.includes(entry.name) && !/^chrome-ruyi-/.test(entry.name)) continue;
    const full = path.join(inbox, entry.name);
    const stat = fs.statSync(full);
    if (stat.mtimeMs >= cutoff) continue;
    push(all ? '收件箱超期一次性目录（--all 才会删）' : '收件箱超期一次性目录（加 --all 才删）', entry.name, sizeOf(full),
      `${new Date(stat.mtimeMs).toISOString().slice(0, 10)}（>${days} 天）`);
  }
}

// 3) 系统临时区
const tempRoot = process.env.TEMP || path.join(path.sep, 'Windows', 'Temp');
if (fs.existsSync(tempRoot)) {
  for (const entry of fs.readdirSync(tempRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!/^ijx/.test(entry.name)) continue;
    if (/^codex-chrome/.test(entry.name)) continue; // 正在被其它工具占用的 Chrome 配置
    const full = path.join(tempRoot, entry.name);
    const stat = fs.statSync(full);
    if (stat.mtimeMs >= cutoff) continue;
    push('系统临时区（e2e 留下的浏览器目录）', entry.name, sizeOf(full), `>${days} 天`);
  }
}

// 4) 仓库外的历史副本（只提示，不自动删）
const externalCopies = [
  ['D:\\Codex\\github-ijx-platform-im-web\\work\\push\\IJX_Platform_archived_20261125', '旧 Codex 副本，改动已并入主仓'],
  ['D:\\Codex\\github-ijx-platform-app', 'IJX_App 退役仓，GitHub 远端仍有'],
];
for (const [target, note] of externalCopies) {
  if (!fs.existsSync(target)) continue;
  push('仓库外历史副本（需要你点头才删）', target, sizeOf(target), note);
}

// 输出
console.log(`\n项目体检报告（${new Date().toLocaleString('zh-CN')}）`);
console.log(`仓库：${repo}`);
console.log(`判定超期：${days} 天${all ? '　（--all：含一次性目录）' : ''}\n`);

const groups = [...new Set(report.map((item) => item.group))];
let total = 0;
for (const group of groups) {
  const items = report.filter((item) => item.group === group);
  const subtotal = items.reduce((sum, item) => sum + item.bytes, 0);
  total += subtotal;
  console.log(`【${group}】 ${items.length} 项，共 ${MB(subtotal)}`);
  for (const item of items) {
    console.log(`  ${item.item.padEnd(52, ' ')} ${(item.bytes > 1024 * 1024 ? MB(item.bytes) : KB(item.bytes)).padStart(8)}  ${item.note}`);
  }
  console.log('');
}
console.log(`合计：${MB(total)}`);

if (!apply) {
  console.log('\n以上只是体检结果，没有删除任何文件。');
  console.log('要清理：node tools/maintenance/cleanup.mjs --apply　（一次性目录需再加 --all）');
  process.exit(0);
}

// 执行删除
let freed = 0;
const skipPreviewCache = previewRunning;
for (const item of report) {
  const target = item.group.startsWith('仓库') ? path.join(repo, item.item)
    : item.group.startsWith('系统临时区') ? path.join(tempRoot, item.item)
      : path.join(inbox, item.item);
  if (item.group.includes('历史副本') || item.group.includes('需要你点头')) continue;
  if (item.group.includes('本次跳过')) continue;
  if (item.group.includes('--all 才会删') || item.group.includes('加 --all 才删')) {
    if (!all) continue;
  }
  if (item.group.startsWith('收件箱') && !inboxClean) continue;
  try {
    fs.rmSync(target, { recursive: true, force: true });
    freed += item.bytes;
    console.log(`已删除 ${item.item}（${MB(item.bytes)}）`);
  } catch (error) {
    console.log(`跳过 ${item.item}：${error.message.slice(0, 80)}`);
  }
}
console.log(`\n本次释放约 ${MB(freed)}${skipPreviewCache ? '（.vite-react-cache 因预览在跑已跳过）' : ''}`);
