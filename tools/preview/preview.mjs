#!/usr/bin/env node
/**
 * 预览服务统一入口（所有 agent 共用，配合 Agents.md §2.2）
 *
 * 目的：把「每次都要检查预览」的成本压到最低——
 *   - 探测很便宜（只看端口 + 进程，毫秒级）；
 *   - 有预览且是这份仓库的，就直接沿用，绝不重复起第二个；
 *   - 没预览才拉起，并写成常驻进程（本轮结束、会话结束都不关）。
 * 源码改动由 Vite HMR 自动推送，同目录改代码不需要重启。
 *
 * 用法：
 *   node tools/preview/preview.mjs ensure    # 有就沿用、没有就启动（每轮跑这一条即可）
 *   node tools/preview/preview.mjs status    # 只看当前状态与地址
 *   node tools/preview/preview.mjs stop      # 显式关闭（默认不要关）
 *   node tools/preview/preview.mjs restart   # 改了 vite 配置/依赖后才需要
 *
 * 端口可用 PREVIEW_PORT 覆盖，默认 5173。
 */
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = Number(process.env.PREVIEW_PORT || 5173);
const BASE = `http://127.0.0.1:${PORT}`;
const STATE_FILE = path.join(root, '.preview-state.json');
const LOG_FILE = path.join(root, '.dev-server.log');
const viteEntry = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const readState = () => {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return null; }
};
const writeState = (state) => fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

/** 端口监听者 PID（netstat，毫秒级，不依赖任何 agent 的上下文） */
function listenerPids(port) {
  try {
    const out = execFileSync('netstat', ['-ano'], { encoding: 'utf8', timeout: 8000 });
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      const cols = line.trim().split(/\s+/);
      if (cols.length < 5 || cols[0] !== 'TCP') continue;
      if (cols[3] !== 'LISTENING') continue;
      if (!cols[1].endsWith(`:${port}`)) continue;
      const pid = Number(cols[4]);
      if (pid > 0) pids.add(pid);
    }
    return [...pids];
  } catch {
    return [];
  }
}

function processInfo(pid) {
  try {
    const script = [
      '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8',
      `$p = Get-CimInstance Win32_Process -Filter "ProcessId=${pid}"`,
      'if (-not $p) { exit 0 }',
      `$s = (Get-Process -Id ${pid} -ErrorAction SilentlyContinue).StartTime`,
      "@{ startedAt = if ($s) { $s.ToString('yyyy-MM-dd HH:mm:ss') } else { '' }; commandLine = $p.CommandLine } | ConvertTo-Json -Compress",
    ].join('; ');
    const out = execFileSync('powershell', ['-NoProfile', '-Command', script], { encoding: 'utf8', timeout: 12000 }).trim();
    if (!out) return null;
    const parsed = JSON.parse(out);
    return { pid, startedAt: parsed.startedAt || '', commandLine: parsed.commandLine || '' };
  } catch {
    // 进程存在但取不到命令行时，退化为只确认存活
    try { process.kill(pid, 0); return { pid, startedAt: '', commandLine: '' }; } catch { return null; }
  }
}

const alive = (pid) => {
  try { process.kill(pid, 0); return true; } catch { return false; }
};

async function probeHttp() {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/download`);
      if (res.ok) return true;
    } catch {
      // 还没起来
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return false;
}

function describe(pid) {
  const info = processInfo(pid);
  const ownedByRepo = Boolean(info?.commandLine) && info.commandLine.includes(root);
  const isVite = Boolean(info?.commandLine) && info.commandLine.includes('vite');
  return {
    pid,
    port: PORT,
    url: BASE,
    startedAt: info?.startedAt || '',
    ownedByRepo,
    isVite,
    commandLine: info?.commandLine ? info.commandLine.slice(0, 220) : '',
  };
}

function print(report, extra = '') {
  const lines = [
    `预览地址：${report.url}`,
    `端口：${report.port}　PID：${report.pid ?? '无'}`,
    `启动时间：${report.startedAt || '未知'}`,
    `归属：${report.ownedByRepo ? '本仓库' : '非本仓库或取不到命令行'}`,
    `状态：${report.alive ? '运行中' : '未运行'}${extra ? `　${extra}` : ''}`,
  ];
  console.log(lines.join('\n'));
}

function startDetached() {
  if (!fs.existsSync(viteEntry)) {
    console.error(`找不到 vite：${viteEntry}（先在本目录 npm install）`);
    process.exit(1);
  }
  const log = fs.openSync(LOG_FILE, 'a');
  const child = spawn(process.execPath, [
    viteEntry,
    '--config', 'vite.react.config.mjs',
    '--configLoader', 'runner',
    '--host', '127.0.0.1',
    '--port', String(PORT),
    '--strictPort',
  ], { cwd: root, detached: true, stdio: ['ignore', log, log] });
  child.unref();
  fs.closeSync(log);
  return child.pid;
}

async function ensure() {
  const pids = listenerPids(PORT);
  if (pids.length > 0) {
    const reports = pids.map(describe);
    const ours = reports.find((item) => item.ownedByRepo && item.isVite);
    if (!ours) {
      console.error(`端口 ${PORT} 已被其它进程占用，且不是本仓库的 vite：`);
      console.error(JSON.stringify(reports, null, 2));
      console.error('请先处理占用，或用 PREVIEW_PORT 换端口。');
      process.exit(2);
    }
    const up = await probeHttp();
    writeState({ ...ours, alive: up, adopted: true, checkedAt: new Date().toISOString() });
    print({ ...ours, alive: up }, up ? '已沿用（无需重启，源码改动由 HMR 生效）' : '端口在听但页面打不开');
    process.exit(up ? 0 : 3);
  }

  const pid = startDetached();
  const up = await probeHttp();
  const info = up ? describe(pid) : { pid, port: PORT, url: BASE, startedAt: '', ownedByRepo: true, isVite: true };
  writeState({ ...info, alive: up, startedAt: info.startedAt || new Date().toISOString(), log: LOG_FILE });
  print({ ...info, alive: up }, up ? '已启动常驻预览' : `启动超时，看日志 ${LOG_FILE}`);
  process.exit(up ? 0 : 1);
}

function status() {
  const pids = listenerPids(PORT);
  const state = readState();
  if (pids.length === 0) {
    print({ pid: state?.pid, port: PORT, url: BASE, startedAt: state?.startedAt, ownedByRepo: false, alive: false }, '没有预览在跑');
    process.exit(4);
  }
  const report = describe(pids[0]);
  print({ ...report, alive: alive(pids[0]) }, '');
}

function stop() {
  const pids = listenerPids(PORT).map(describe).filter((item) => item.ownedByRepo);
  if (pids.length === 0) {
    console.log(`端口 ${PORT} 上没有本仓库的预览进程`);
    try { fs.unlinkSync(STATE_FILE); } catch { /* 无状态文件 */ }
    return;
  }
  for (const item of pids) {
    try { execFileSync('taskkill', ['/PID', String(item.pid), '/T', '/F'], { stdio: 'ignore' }); } catch { /* 已退出 */ }
    console.log(`已关闭 PID ${item.pid}`);
  }
  try { fs.unlinkSync(STATE_FILE); } catch { /* 忽略 */ }
}

const command = process.argv[2] || 'ensure';
if (command === 'ensure') ensure();
else if (command === 'status') status();
else if (command === 'stop') stop();
else if (command === 'restart') { stop(); setTimeout(ensure, 1200); }
else {
  console.log('用法：node tools/preview/preview.mjs [ensure|status|stop|restart]');
  process.exit(1);
}
