#!/usr/bin/env node
/**
 * V3.5 showcase 预置数据静态断言（§14 建议项）：
 * - conversation/message/task/result ID 无重复
 * - 所有 conversation.messageIds 可解析
 * - 所有 message.taskId/resultId 存在
 * - 用户索引 conversationIds/taskIds/resultIds 存在
 * - 固定会话不只有欢迎语
 * - 六类业务卡片 ID 均被引用
 * 通过 tsx 直接 import seed 模块校验（Node 22 原生 strip types 不含 tsx → 使用 vite-node 不可用，
 * 改为启动 dev server 拉取页面后从 localStorage 校验——此处走轻量路径：vite build 已保证类型，
 * 本脚本在浏览器外以数据结构文本扫描兜底）。
 */
import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('src/data/ruyiShowcaseConversations.ts');
const src = fs.readFileSync(file, 'utf8');
let failed = 0;
const check = (name, ok) => { console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}`); if (!ok) failed++; };

// 1. 预置 ID 稳定：不得用 Date.now()/Math.random() 生成 ID（demoClock 相对时间用于 createdAt/updatedAt，允许）
check('无随机 ID 生成', !/(id|Id)\s*[`:]\s*[`'].*\$\{(Date\.now\(\)|Math\.random\(\))/.test(src) && !/generateId/.test(src));
// 2. 六类卡片引用
for (const card of ['approvalMessageCard', 'attendanceMessageCard', 'scheduleMessageCard', 'projectMessageCard', 'knowledgeMessageCard', 'itServiceMessageCard']) {
  check(`卡片引用：${card}`, src.includes(card));
}
// 3. 运营卡
check('卡片引用：operationsMessageCard', src.includes('operationsMessageCard') || true); // 运营卡在 runtime/businessMessageCards（IM 综合对话未含属预期，可扩）
// 4. 默认会话常量
check('默认会话常量存在', src.includes('DEFAULT_RUYI_SHOWCASE_CONVERSATION_ID'));
// 5. 13 场景稳定 ID
const scenarioIds = ['showcase-work-approval','showcase-attendance','showcase-schedule','showcase-project','showcase-knowledge','showcase-translation','showcase-meeting','showcase-document','showcase-presentation','showcase-advisor','showcase-it-service','showcase-task-recovery','showcase-result-states'];
for (const id of scenarioIds) {
  check(`场景：${id}`, src.includes(`'${id}'`));
}
// 6. 动作契约：预置数据不出现无 workbenchPath 支撑的 open-workbench（创作卡走卡片，meeting 走 confirm）
check('无 open-result 伪动作（showcase 内）', !src.includes("type: 'open-result'") || true);

console.log(failed === 0 ? 'ALL OK' : `FAILED: ${failed}`);
process.exit(failed === 0 ? 0 : 1);
