/**
 * 如意助手 mock runtime
 * 确定性规则模拟产品结果，不伪装后端模型。
 */

import type {
  RuyiCapability,
  RuyiConversation,
  RuyiMessage,
  RuyiTaskMock,
  MeetingTaskSlots,
} from '../types/ruyi';
import { getRuyiCapability } from '../data/ruyiCapabilities';

export interface MockRuntimeContext {
  conversation: RuyiConversation;
  activeTask: RuyiTaskMock | null;
  activeCapability: RuyiCapability | null;
  currentDate: Date;
  /** V2：会话内全部可继续任务（多任务歧义判定用；缺省时回退 activeTask） */
  pendingTasks?: RuyiTaskMock[];
}

export interface MockRuntimeResult {
  messages: RuyiMessage[];
  taskUpdate?: Partial<RuyiTaskMock>;
  /** V2：多任务选择——列出候选任务，由用户选择（不自动恢复） */
  multiTaskCandidates?: RuyiTaskMock[];
  /** V2：跨日相对日期——先重新确认，不直接执行 */
  crossDayConfirm?: { taskId: string; dateText: string; resolvedDate: string };
}

function tomorrow(currentDate: Date): string {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function createMessage(
  conversationId: string,
  sender: RuyiMessage['sender'],
  kind: RuyiMessage['kind'],
  content: string,
  options: Partial<RuyiMessage> = {},
): RuyiMessage {
  return {
    id: generateId('msg'),
    conversationId,
    sender,
    kind,
    content,
    createdAt: new Date().toISOString(),
    ...options,
  };
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/[？?，,。.!！]/g, '');
}

function isTaskIntent(text: string): boolean {
  const t = normalizeText(text);
  return (
    t.includes('创建') &&
    (t.includes('会议') || t.includes('日程') || t.includes('预约') || t.includes('安排'))
  );
}

function isTaskInterruptIntent(text: string): boolean {
  const t = normalizeText(text);
  return (
    t.includes('年假') ||
    t.includes('考勤') ||
    t.includes('待办') ||
    t.includes('流程') ||
    t.includes('工资')
  );
}

function isTaskResumeIntent(text: string): boolean {
  const t = normalizeText(text);
  return (
    t.includes('继续') ||
    (t.includes('刚才') && t.includes('会议')) ||
    t.includes('回到会议')
  );
}

/** V2：多任务恢复意图（会话内无活动任务推进时的"继续"请求） */
function isMultiTaskResumeIntent(text: string): boolean {
  const t = normalizeText(text);
  return (
    t.includes('继续刚才的任务') ||
    t.includes('继续处理') ||
    t.includes('恢复任务')
  );
}

/** V2：跨日相对日期判定——恢复日与确认日不同自然日即需重确认 */
export function needsCrossDayReconfirm(task: RuyiTaskMock, currentDate: Date): boolean {
  if (!task.relativeDateConfirmedAt || !task.slots?.dateText) return false;
  const confirmedDay = new Date(task.relativeDateConfirmedAt);
  return confirmedDay.toDateString() !== currentDate.toDateString();
}

/** V2：重新解析相对日期为绝对日期（以当前日期为基准） */
export function resolveRelativeDate(dateText: string, currentDate: Date): string {
  const t = normalizeText(dateText);
  const d = new Date(currentDate);
  if (t.includes('后天')) d.setDate(d.getDate() + 2);
  else if (t.includes('明天')) d.setDate(d.getDate() + 1);
  else if (t.includes('今天')) { /* keep */ }
  else if (t.includes('下周一')) {
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? 1 : 8 - day;
    d.setDate(d.getDate() + diff + (day === 1 ? 0 : 0));
    if (day === 1) d.setDate(d.getDate() + 7); // 周一说的"下周一"是下周一
  }
  return d.toISOString().split('T')[0];
}

function isConfirmIntent(text: string): boolean {
  const t = normalizeText(text);
  return t.includes('确认') || t.includes('创建') || t.includes('确定') || t.includes('提交');
}

function isModifyIntent(text: string): boolean {
  const t = normalizeText(text);
  return t.includes('修改') || t.includes('改成') || t.includes('改') || t.includes('换');
}

function isCancelIntent(text: string): boolean {
  const t = normalizeText(text);
  return t.includes('取消') || t.includes('不开了') || t.includes('算了');
}

function isFeedbackIntent(text: string): boolean {
  const t = normalizeText(text);
  return t.includes('反馈') || t.includes('投诉') || t.includes('建议');
}

const chineseDigitMap: Record<string, number> = { 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 十一: 11, 十二: 12, 十三: 13, 十四: 14, 十五: 15, 十六: 16, 十七: 17, 十八: 18, 十九: 19, 二十: 20, 二十一: 21, 二十二: 22, 二十三: 23 };
const fmtHour = (h: number) => `${String(h).padStart(2, '0')}:00`;

function parseTime(text: string): { startTime: string; endTime: string } | null {
  const patterns = [
    { r: /(\d{1,2}):(\d{2})/, parse: (h: number, m: number) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` },
  ];
  for (const p of patterns) {
    const match = text.match(p.r);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const start = p.parse(h, m);
      const endH = (h + 1) % 24;
      const end = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      return { startTime: start, endTime: end };
    }
  }
  // 中文数字小时（含 两）：上午/下午/晚上 前缀 + "X点[到/至Y点]" 区间
  const parseHourToken = (token: string): number | null => {
    if (/^\d+$/.test(token)) return parseInt(token, 10);
    return chineseDigitMap[token] ?? null;
  };
  const rangeMatch = text.match(/(?:上午|下午|晚上)?\s*([零一二两三四五六七八九十]{1,3}|\d{1,2})\s*点\s*(?:到|至|-|—|~)\s*(?:上午|下午|晚上)?\s*([零一二两三四五六七八九十]{1,3}|\d{1,2})\s*点?/);
  if (rangeMatch) {
    let h1 = parseHourToken(rangeMatch[1]);
    let h2 = parseHourToken(rangeMatch[2]);
    if (h1 !== null && h2 !== null) {
      const prefix1 = text.slice(0, text.indexOf(rangeMatch[0]));
      const hasPM1 = prefix1.includes('下午') || prefix1.includes('晚上') || rangeMatch[0].startsWith('下午') || rangeMatch[0].startsWith('晚上');
      const hasPM2 = /下午|晚上/.test(text.slice(text.indexOf(rangeMatch[0])));
      if (hasPM1 && h1 < 12) h1 += 12;
      if (hasPM2 && h2 < 12) h2 += 12;
      if (h2 <= h1) h2 = h1 + 1;
      return { startTime: fmtHour(h1), endTime: fmtHour(h2) };
    }
  }
  if (/上午\s*(\d{1,2})\s*点?/.test(text)) {
    const h = parseInt(text.match(/上午\s*(\d{1,2})\s*点?/)![1], 10);
    return { startTime: `${String(h).padStart(2, '0')}:00`, endTime: `${String((h + 1) % 24).padStart(2, '0')}:00` };
  }
  if (/下午\s*(\d{1,2})\s*点?/.test(text)) {
    const h = parseInt(text.match(/下午\s*(\d{1,2})\s*点?/)![1], 10) + 12;
    return { startTime: `${String(h).padStart(2, '0')}:00`, endTime: `${String((h + 1) % 24).padStart(2, '0')}:00` };
  }
  if (/(\d{1,2})\s*点/.test(text)) {
    const h = parseInt(text.match(/(\d{1,2})\s*点/)![1], 10);
    return { startTime: `${String(h).padStart(2, '0')}:00`, endTime: `${String((h + 1) % 24).padStart(2, '0')}:00` };
  }
  return null;
}

function parseAttendees(text: string): string[] {
  const names: string[] = [];
  // 支持「叫上/邀请/加上/参会人/参加」引导的人名列表
  const match = text.match(/(?:叫上|邀请|加上|参会人[：:]?\s*|请)\s*(.+)/);
  if (match) {
    const part = match[1];
    return part
      .split(/[,，、和跟]/)
      .map((n) => n.replace(/[过来参加]/g, '').trim())
      .filter(Boolean);
  }
  return names;
}

export function buildMissingPrompt(missing: Array<keyof MeetingTaskSlots>): string {
  if (missing.includes('startTime') || missing.includes('endTime')) {
    return '请问会议开始时间是几点？';
  }
  if (missing.includes('attendeeNames')) {
    return '请问需要邀请哪些人参会？';
  }
  return '请补充其他必要信息。';
}

export function buildConfirmationSummary(slots: Partial<MeetingTaskSlots>): string {
  const title = slots.title || '项目沟通会';
  const date = slots.dateText || slots.resolvedDate || '明天';
  const start = slots.startTime || '待定';
  const end = slots.endTime || '待定';
  const attendees = slots.attendeeNames?.join('、') || '待定';
  const location = slots.location || '线上会议';
  return `请确认会议信息：\n标题：${title}\n日期：${date}\n时间：${start} - ${end}\n参会人：${attendees}\n地点：${location}`;
}

function handleMeetingTask(
  conversationId: string,
  text: string,
  task: RuyiTaskMock,
): MockRuntimeResult {
  const normalized = normalizeText(text);

  if (task.status === 'interrupted') {
    if (isTaskResumeIntent(text)) {
      // 恢复：按参数完整度分流——缺参继续补参；参数完整直接重新出确认卡
      if (task.missingSlots.length === 0) {
        return {
          messages: [
            createMessage(conversationId, 'system', 'resume-task', '继续创建会议', {
              taskId: task.id,
              actions: [{ type: 'resume-task', label: '继续创建会议' }],
            }),
            createMessage(conversationId, 'assistant', 'confirmation', buildConfirmationSummary(task.slots), {
              taskId: task.id,
              actions: [
                { type: 'confirm-task', label: '确认创建' },
                { type: 'modify-task', label: '修改' },
                { type: 'cancel-task', label: '取消' },
              ],
            }),
          ],
          taskUpdate: { status: 'awaiting-confirmation' },
        };
      }
      return {
        messages: [
          createMessage(conversationId, 'system', 'resume-task', '继续创建会议', {
            taskId: task.id,
            actions: [{ type: 'resume-task', label: '继续创建会议' }],
          }),
          createMessage(conversationId, 'assistant', 'text', '好的，继续为您创建会议。' + buildMissingPrompt(task.missingSlots), { taskId: task.id }),
        ],
        taskUpdate: { status: 'collecting' },
      };
    }
    return handleGenericQuery(conversationId, text, task);
  }

  if (task.status === 'awaiting-confirmation') {
    // 方案顺序：确认 → 修改 → 取消 → 切话题 → 其他输入
    if (isConfirmIntent(text)) {
      const demoFail = normalizeText(text).includes('演示失败');
      return {
        messages: [
          createMessage(conversationId, 'assistant', 'text', '正在创建会议，请稍候…', {
            taskId: task.id,
          }),
        ],
        taskUpdate: { status: 'executing', failureReason: demoFail ? '日历服务暂不可用，请稍后重试' : undefined },
      };
    }
    if (isModifyIntent(text)) {
      const time = parseTime(text);
      const updateSlots: Partial<MeetingTaskSlots> = { ...task.slots };
      if (time) {
        updateSlots.startTime = time.startTime;
        updateSlots.endTime = time.endTime;
      }
      const newMissing = task.missingSlots.filter((k) => !updateSlots[k]);
      return {
        messages: [
          // 用户消息由 useRuyiSend 统一添加——runtime 只生成助手消息，避免"改成11点"显示两次
          createMessage(conversationId, 'assistant', 'text', '已更新会议时间。' + buildConfirmationSummary(updateSlots), { taskId: task.id, actions: [{ type: 'confirm-task', label: '确认创建' }, { type: 'modify-task', label: '修改' }, { type: 'cancel-task', label: '取消' }] }),
        ],
        taskUpdate: { status: 'awaiting-confirmation', slots: updateSlots, missingSlots: newMissing },
      };
    }
    if (isCancelIntent(text)) {
      return {
        messages: [
          createMessage(conversationId, 'system', 'text', '会议创建已取消。', { taskId: task.id }),
        ],
        taskUpdate: { status: 'cancelled' },
      };
    }
    // 确认页输入切话题问题（如年假）也必须先回答并暂停任务
    if (isTaskInterruptIntent(text)) {
      return handleInterrupt(conversationId, text, task);
    }
    // 其他输入：重新展示确认卡片，不丢失任务状态
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'confirmation', buildConfirmationSummary(task.slots), {
          taskId: task.id,
          actions: [
            { type: 'confirm-task', label: '确认创建' },
            { type: 'modify-task', label: '修改' },
            { type: 'cancel-task', label: '取消' },
          ],
        }),
      ],
      taskUpdate: { status: 'awaiting-confirmation' },
    };
  }

  // collecting：方案顺序 1/2/3/4 —— 取消 → 补参 → 切话题 → 无法识别时继续提示缺失参数
  if (isCancelIntent(text)) {
    return {
      messages: [
        createMessage(conversationId, 'system', 'text', '会议创建已取消。', { taskId: task.id }),
      ],
      taskUpdate: { status: 'cancelled' },
    };
  }

  const updateSlots: Partial<MeetingTaskSlots> = { ...task.slots };
  const missing = [...task.missingSlots];

  if (missing.includes('startTime') || missing.includes('endTime')) {
    const time = parseTime(text);
    if (time) {
      updateSlots.startTime = time.startTime;
      updateSlots.endTime = time.endTime;
      missing.splice(missing.indexOf('startTime'), 1);
      const endIdx = missing.indexOf('endTime');
      if (endIdx >= 0) missing.splice(endIdx, 1);
    }
  }

  if (missing.includes('attendeeNames')) {
    const attendees = parseAttendees(text);
    if (attendees.length) {
      updateSlots.attendeeNames = attendees;
      missing.splice(missing.indexOf('attendeeNames'), 1);
    }
  }

  if (missing.includes('title') && normalized.includes('会议')) {
    updateSlots.title = '项目沟通会';
    missing.splice(missing.indexOf('title'), 1);
  }

  if (missing.includes('resolvedDate') && (normalized.includes('明天') || normalized.includes('今天'))) {
    updateSlots.dateText = '明天';
    updateSlots.resolvedDate = tomorrow(new Date());
    missing.splice(missing.indexOf('resolvedDate'), 1);
  }

  // 本次输入未命中任何补参内容且为切话题意图 → 先回答新问题并暂停任务（方案顺序第 3 位）
  if (missing.length === task.missingSlots.length && isTaskInterruptIntent(text)) {
    return handleInterrupt(conversationId, text, task);
  }

  if (missing.length === 0) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'confirmation', buildConfirmationSummary(updateSlots), {
          taskId: task.id,
          actions: [
            { type: 'confirm-task', label: '确认创建' },
            { type: 'modify-task', label: '修改' },
            { type: 'cancel-task', label: '取消' },
          ],
        }),
      ],
      taskUpdate: { status: 'awaiting-confirmation', slots: updateSlots, missingSlots: [] },
    };
  }

  return {
    messages: [
      createMessage(conversationId, 'assistant', 'text', buildMissingPrompt(missing), { taskId: task.id }),
    ],
    taskUpdate: { slots: updateSlots, missingSlots: missing },
  };
}

function handleGenericQuery(
  conversationId: string,
  text: string,
  task?: RuyiTaskMock | null,
): MockRuntimeResult {
  const t = normalizeText(text);

  if (task && task.status === 'collecting' && isTaskInterruptIntent(text)) {
    return handleInterrupt(conversationId, text, task);
  }

  if (isTaskIntent(text)) {
    if (task && (task.status === 'collecting' || task.status === 'interrupted')) {
      return {
        messages: [
          createMessage(conversationId, 'assistant', 'text', '您已有一个未完成的创建会议任务，请先继续或取消。', {
            taskId: task.id,
            actions: [{ type: 'resume-task', label: '继续' }, { type: 'cancel-task', label: '取消' }],
          }),
        ],
      };
    }
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '好的，我来帮您创建会议。已识别到会议日期为明天。请问会议开始时间是几点？'),
      ],
      taskUpdate: {
        type: 'create-meeting',
        status: 'collecting',
        slots: {
          title: '项目沟通会',
          dateText: '明天',
          resolvedDate: tomorrow(new Date()),
        },
        missingSlots: ['startTime', 'endTime', 'attendeeNames'],
      },
    };
  }

  if (t.includes('流程') || t.includes('待办') || t.includes('处理')) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '您当前有 3 项待办流程：\n1. 项目立项申请 - 待审批\n2. 预算调整申请 - 待填写\n3. 设备采购申请 - 待确认\n\n可点击入口前往流程中心处理。', {
          actions: [
            { type: 'open-workbench', label: '查看流程中心' },
            { type: 'copy', label: '复制' },
            { type: 'feedback-useful', label: '有用' },
            { type: 'feedback-useless', label: '没用' },
            { type: 'regenerate', label: '重新生成' },
          ],
        }),
      ],
    };
  }

  if (t.includes('考勤')) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '上个月考勤整体表现良好，无异常缺勤。相关制度可查看考勤管理制度 v2.3。', {
          sourceLabel: '考勤管理制度 v2.3',
          sourceHref: '/pc_client/knowledge?doc=attendance-policy&source=ruyi-zone',
        }),
      ],
    };
  }

  if (t.includes('知识') || t.includes('搜索') || t.includes('文章')) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '为您找到 3 篇智能办公相关文章：\n1. 智能办公系统功能介绍\n2. 协同办公平台使用手册\n3. 常见问题 FAQ 汇总', {
          actions: [{ type: 'open-result', label: '查看知识库' }],
        }),
      ],
    };
  }

  if (t.includes('运营') || t.includes('数据') || t.includes('指标')) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '本月运营数据概览：\n- 销售额：1,286 万元，较上月 +12.5%\n- 客户满意度：96.8%，较上月 +2.3%\n- 项目交付及时率：89.2%，较上月 -1.5%', {
          actions: [{ type: 'open-workbench', label: '查看运营看板' }],
        }),
      ],
    };
  }

  if (t.includes('翻译')) {
    const match = text.match(/[“"](.+?)[”"]/);
    const phrase = match ? match[1] : text;
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', `英文译文：\n${phrase}`, { capabilityId: 'translation' }),
      ],
    };
  }

  if (t.includes('公文') || t.includes('会议纪要') || t.includes('通知')) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '好的，我来帮您起草公文。请补充会议主题、参会人员和关键结论，或直接进入公文工作台编辑。', {
          capabilityId: 'document',
          actions: [{ type: 'open-workbench', label: '进入公文工作台' }],
        }),
      ],
    };
  }

  if (t.includes('ppt') || t.includes('演示')) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '好的，我来帮您制作PPT。请补充主题、受众和页数要求，或直接进入PPT工作台配置。', {
          capabilityId: 'presentation',
          actions: [{ type: 'open-workbench', label: '进入PPT工作台' }],
        }),
      ],
    };
  }

  if (t.includes('周报') || t.includes('参谋')) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '好的，我来协助您生成项目周报。请补充周期、关键进展和待跟进事项，或直接进入参谋师工作台。', {
          capabilityId: 'advisor',
          actions: [{ type: 'open-workbench', label: '进入参谋师工作台' }],
        }),
      ],
    };
  }

  if (isFeedbackIntent(text)) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '感谢您的反馈，我们已记录。如您需要提交正式工单，可前往帮助反馈中心。', {
          actions: [
            { type: 'feedback-useful', label: '有用' },
            { type: 'feedback-useless', label: '没用' },
          ],
        }),
      ],
    };
  }

  if (t.includes('vpn') || t.includes('it') || t.includes('网络') || t.includes('无法连接')) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '已收到您的IT反馈，工单号 #IT-20261106-001。您可前往服务台查看处理进度。', {
          capabilityId: 'it-service',
          actions: [{ type: 'open-workbench', label: '查看服务台' }],
        }),
      ],
    };
  }

  return {
    messages: [
      createMessage(conversationId, 'assistant', 'text', '我理解了您的需求，但在当前演示版本中，建议您尝试以下能力：查询工作信息、如意公文、如意PPT、如意参谋、智能翻译或IT服务。', {
        actions: [
          { type: 'feedback-useful', label: '有用' },
          { type: 'feedback-useless', label: '没用' },
          { type: 'regenerate', label: '重新生成' },
        ],
      }),
    ],
  };
}

function handleInterrupt(
  conversationId: string,
  text: string,
  task: RuyiTaskMock,
): MockRuntimeResult {
  const t = normalizeText(text);
  let answer = '我先回答您的问题。';

  if (t.includes('年假')) {
    answer = '您今年剩余年假 5 天。';
  } else if (t.includes('考勤')) {
    answer = '本月考勤正常，无迟到早退记录。';
  } else if (t.includes('待办') || t.includes('流程')) {
    answer = '您当前有 3 项待办流程。';
  }

  return {
    messages: [
      createMessage(conversationId, 'assistant', 'text', answer),
      createMessage(conversationId, 'system', 'resume-task', '原任务「创建会议」已暂停，点击继续可回到参数补充。', {
        taskId: task.id,
        actions: [{ type: 'resume-task', label: '继续创建会议' }],
      }),
    ],
    taskUpdate: { status: 'interrupted' },
  };
}

function handleActiveCapability(
  conversationId: string,
  text: string,
  capability: RuyiCapability,
): MockRuntimeResult {
  const t = normalizeText(text);

  if (capability.id === 'translation') {
    const match = text.match(/[“"](.+?)[”"]/);
    const phrase = match ? match[1] : text;
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', `英文译文：\n${phrase}`, { capabilityId: 'translation' }),
      ],
    };
  }

  if (capability.id === 'it-service') {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '已收到您的IT反馈，工单号 #IT-20261106-001。您可前往服务台查看处理进度。', {
          capabilityId: 'it-service',
          actions: [{ type: 'open-workbench', label: '查看服务台' }],
        }),
      ],
    };
  }

  if (capability.id === 'work-query') {
    if (t.includes('考勤')) {
      return {
        messages: [
          createMessage(conversationId, 'assistant', 'text', '上个月考勤整体表现良好，无异常缺勤。相关制度可查看考勤管理制度 v2.3。', {
            sourceLabel: '考勤管理制度 v2.3',
            sourceHref: '/pc_client/knowledge?doc=attendance-policy&source=ruyi-zone',
          }),
        ],
      };
    }
    if (t.includes('流程') || t.includes('待办') || t.includes('处理')) {
      return {
        messages: [
          createMessage(conversationId, 'assistant', 'text', '您当前有 3 项待办流程：\n1. 项目立项申请 - 待审批\n2. 预算调整申请 - 待填写\n3. 设备采购申请 - 待确认\n\n可点击入口前往流程中心处理。', {
            actions: [
              { type: 'open-workbench', label: '查看流程中心' },
              { type: 'copy', label: '复制' },
              { type: 'feedback-useful', label: '有用' },
              { type: 'feedback-useless', label: '没用' },
              { type: 'regenerate', label: '重新生成' },
            ],
          }),
        ],
      };
    }
    if (t.includes('知识') || t.includes('搜索') || t.includes('文章')) {
      return {
        messages: [
          createMessage(conversationId, 'assistant', 'text', '为您找到 3 篇智能办公相关文章：\n1. 智能办公系统功能介绍\n2. 协同办公平台使用手册\n3. 常见问题 FAQ 汇总', {
            actions: [{ type: 'open-result', label: '查看知识库' }],
          }),
        ],
      };
    }
    if (t.includes('运营') || t.includes('数据') || t.includes('指标')) {
      return {
        messages: [
          createMessage(conversationId, 'assistant', 'text', '本月运营数据概览：\n- 销售额：1,286 万元，较上月 +12.5%\n- 客户满意度：96.8%，较上月 +2.3%\n- 项目交付及时率：89.2%，较上月 -1.5%', {
            actions: [{ type: 'open-workbench', label: '查看运营看板' }],
          }),
        ],
      };
    }
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '当前使用「查询工作信息」能力，您可以询问待办流程、考勤、知识或运营数据。'),
      ],
    };
  }

  if (capability.producesResult) {
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', `当前已激活「${capability.name}」。请确认需求后进入工作台编辑。`, {
          capabilityId: capability.id,
          actions: [{ type: 'open-workbench', label: `进入${capability.name}` }],
        }),
      ],
    };
  }

  return handleGenericQuery(conversationId, text, null);
}

export function routeUserInput(
  text: string,
  context: MockRuntimeContext,
): MockRuntimeResult {
  const { conversation, activeTask, activeCapability, currentDate } = context;
  const conversationId = conversation.id;

  // V2 多任务恢复：'继续刚才的任务'等意图且无活动任务推进时，查会话全部可继续任务
  if (isMultiTaskResumeIntent(text)) {
    const candidates = (context.pendingTasks ?? []).filter(
      (t) => !['completed', 'cancelled', 'executing'].includes(t.status),
    );
    if (candidates.length === 0) {
      return {
        messages: [
          createMessage(conversationId, 'assistant', 'text', '当前没有可继续的任务。您可以从 AI 任务中心查看全部任务，或直接描述新的需求。', {
            actions: [{ type: 'open-task-center', label: '前往 AI 任务中心' }],
          }),
        ],
      };
    }
    if (candidates.length === 1) {
      // 单候选：直接恢复（复用既有恢复逻辑）
      return handleMeetingTask(conversationId, `继续${candidates[0].title ?? ''}`, candidates[0]);
    }
    // 多候选：不自动选择，交由用户
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', '检测到多个可继续的任务，请选择要继续的任务：'),
      ],
      multiTaskCandidates: candidates,
    };
  }

  // V2 跨日恢复：活动任务含未重新确认的相对日期 → 先重确认
  if (
    activeTask &&
    activeTask.status === 'interrupted' &&
    isTaskResumeIntent(text) &&
    needsCrossDayReconfirm(activeTask, currentDate)
  ) {
    const dateText = activeTask.slots?.dateText ?? '明天';
    const newResolved = resolveRelativeDate(dateText, currentDate);
    return {
      messages: [
        createMessage(
          conversationId,
          'assistant',
          'confirmation',
          `该任务包含相对日期，上次确认时间为 ${new Date(activeTask.relativeDateConfirmedAt!).toLocaleDateString('zh-CN')}。\n请重新确认：「${dateText}」对应的实际日期为 ${newResolved}。`,
          {
            taskId: activeTask.id,
            actions: [
              { type: 'confirm-date', label: `确认 ${dateText}（${newResolved}）`, payload: { resolvedDate: newResolved, dateText } },
              { type: 'modify-task', label: '修改日期' },
              { type: 'cancel-task', label: '取消任务' },
            ],
          },
        ),
      ],
      crossDayConfirm: { taskId: activeTask.id, dateText, resolvedDate: newResolved },
      taskUpdate: { status: 'awaiting-confirmation' },
    };
  }

  // 1. 当前有 V1 会议任务时，先判断确认、修改、取消、补参和恢复语句（终态任务不再拦截正常对话）
  const taskActive = activeTask && !['completed', 'cancelled', 'failed'].includes(activeTask.status);
  if (taskActive && activeTask.type === 'create-meeting') {
    return handleMeetingTask(conversationId, text, activeTask);
  }

  // 2. 明确关键词命中翻译、公文、PPT、参谋、IT、会议任务和反馈
  // 注意：翻译需要优先于「汇报」等可能触发参谋的关键词
  if (normalizeText(text).includes('翻译')) {
    const match = text.match(/[“"](.+?)[”"]/);
    const phrase = match ? match[1] : text;
    return {
      messages: [
        createMessage(conversationId, 'assistant', 'text', `英文译文：\n${phrase}`, { capabilityId: 'translation' }),
      ],
    };
  }

  // 3. 当前激活能力
  if (activeCapability) {
    return handleActiveCapability(conversationId, text, activeCapability);
  }

  // 4. 通用意图兜底
  return handleGenericQuery(conversationId, text, activeTask);
}

export function generateWorkbenchResultMessage(
  conversationId: string,
  resultId: string,
  title: string,
  capabilityId: RuyiCapability['id'],
  workbenchHref: string,
): RuyiMessage {
  void workbenchHref; // 保留参数兼容调用方；实际链接由调用方写入 result
  const cap = getRuyiCapability(capabilityId);
  return createMessage(conversationId, 'assistant', 'result', `已完成「${title}」，可在成果卡片中继续打开或编辑。`, {
    resultId,
    capabilityId,
    actions: [{ type: 'open-result', label: `打开${cap?.name || '成果'}` }],
  });
}

export function generateTitleFromText(text: string, maxLength = 18): string {
  const cleaned = text
    .replace(/[？?，,。.!！\s]/g, '')
    .replace(/^(帮我做一份|帮我写一份|帮我生成|帮我制作|做一份|写一份|生成一份|制作一份|制作|生成|把|帮我|给我|请|能否|可以|我想|我要|需要)/, '');
  if (cleaned.length <= maxLength) return cleaned || text.slice(0, maxLength);
  return cleaned.slice(0, maxLength) + '…';
}

export function generateLoadingMessage(conversationId: string): RuyiMessage {
  return createMessage(conversationId, 'assistant', 'loading', '思考中…');
}

export {
  createMessage,
  generateId,
};
