#!/usr/bin/env node
/**
 * F3：全项目需求 surface 编号扫描（只读校验）
 * 输出：surface / requirement count / orders / duplicate / gap
 */
import fs from 'node:fs';
import path from 'node:path';

const md = fs.readFileSync(path.resolve('docs/PROTOTYPE_REQUIREMENTS.md'), 'utf8');
const entries = [];
const re = /^id: (.+)$\nsurface: (.+)$\nroute: (.+)$\norder: (\d+)$/gm;
let m;
while ((m = re.exec(md)) !== null) {
  entries.push({ id: m[1], surface: m[2], route: m[3], order: Number(m[4]) });
}

const bySurface = new Map();
for (const e of entries) {
  if (!bySurface.has(e.surface)) bySurface.set(e.surface, []);
  bySurface.get(e.surface).push(e);
}

let allOk = true;
const idCount = new Map();
for (const e of entries) idCount.set(e.id, (idCount.get(e.id) ?? 0) + 1);
const dupIds = [...idCount.entries()].filter(([, n]) => n > 1);

for (const [surface, items] of bySurface) {
  items.sort((a, b) => a.order - b.order);
  const orders = items.map((i) => i.order);
  const dup = orders.filter((o, i) => orders.indexOf(o) !== i);
  const gaps = [];
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) gaps.push(orders[i]);
  }
  const ok = dup.length === 0 && gaps.length === 0 && orders[0] === 1;
  if (!ok) allOk = false;
  console.log(
    `${ok ? 'OK ' : 'BAD'} | ${surface} | count=${items.length} | orders=[${orders.join(',')}] | dup=[${dup.join(',')}] | gap=[${gaps.join(',')}]`,
  );
}
if (dupIds.length) { allOk = false; console.log('BAD | 重复需求 ID:', dupIds.map(([id, n]) => `${id}×${n}`).join(', ')); }

// frontmatter order 与正文"模块内序号"一致性
let mismatch = 0;
for (const e of entries) {
  // 找正文段落（id 之后的第一个 ## 段落中的 模块内序号）
  const sectionRe = new RegExp(`id: ${e.id}[\\s\\S]*?模块内序号.*?(\\d+)`, 'm');
  const sm = md.match(sectionRe);
  if (sm && Number(sm[1]) !== e.order) { mismatch++; console.log(`BAD | ${e.id}: frontmatter order=${e.order} 正文序号=${sm[1]}`); }
}
if (mismatch) allOk = false;
console.log(`\n总计 ${entries.length} 条 / ${bySurface.size} 个 surface / ID重复=${dupIds.length} / 序号不一致=${mismatch}`);
console.log(allOk ? 'ALL OK' : 'FAILED');
process.exit(allOk ? 0 : 1);
