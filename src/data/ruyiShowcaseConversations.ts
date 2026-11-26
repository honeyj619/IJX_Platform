/**
 * V3.4 如意助手能力直展示——预置对话唯一事实源
 *
 * - 既是能力清单，也直接生成页面中的 RuyiConversation/RuyiMessage/RuyiTaskMock/RuyiResultReference
 * - 所有 ID 稳定（showcase-* 前缀），禁止 Date.now()/随机数——否则刷新、迁移和去重失败
 * - 业务操作卡片复用 businessMessageCards.ts 五类 + IT 卡；渲染复用 BusinessMessageCard
 * - updatedAt 使用固定可排序的演示时间，不在每次加载时变成"刚刚"
 */

import type {
  RuyiContextReference,
  RuyiConversation,
  RuyiMessage,
  RuyiResultReference,
  RuyiTaskMock,
} from '../types/ruyi';
import { buildMeetingCreatedCard, buildWorkbenchEntryCard } from './businessMessageCards';
import {
  approvalMessageCard,
  attendanceMessageCard,
  scheduleMessageCard,
  projectMessageCard,
  knowledgeMessageCard,
  itServiceMessageCard,
} from './businessMessageCards';

export const FIXED_IM_CONVERSATION_TITLE = '如意助手';

/** 默认打开的预置会话（如意空间 /ruyi-zone 无会话时进入） */
export const DEFAULT_RUYI_SHOWCASE_CONVERSATION_ID = 'showcase-work-approval';

/** 固定演示时间基准：今天 09:00 起的相对序列（构建时一次性计算，stable within session；ID 恒定保证去重） */
function demoClock(minutesOffset: number, daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(9, 0, 0, 0);
  d.setMinutes(d.getMinutes() + minutesOffset);
  return d.toISOString();
}

export interface RuyiShowcaseConversationBundle {
  conversation: RuyiConversation;
  messages: RuyiMessage[];
  tasks?: RuyiTaskMock[];
  results?: RuyiResultReference[];
  contextReferences?: RuyiContextReference[];
}

export interface RuyiShowcaseConversationDefinition {
  id: string;
  title: string;
  summary: string;
  displayOrder: number;
  build: (ownerId: string) => RuyiShowcaseConversationBundle;
}

function mkConversation(
  id: string,
  ownerId: string,
  title: string,
  messageIds: string[],
  options: Partial<RuyiConversation> = {},
): RuyiConversation {
  return {
    id,
    ownerId,
    title,
    createdAt: demoClock(0),
    updatedAt: demoClock(60),
    activeCapabilityId: null,
    lastCapabilityId: null,
    messageIds,
    activeTaskId: null,
    origin: 'ruyi-zone',
    scenarioId: null,
    ...options,
  };
}

function mkMessage(
  id: string,
  conversationId: string,
  sender: RuyiMessage['sender'],
  content: string,
  createdAt: string,
  options: Partial<RuyiMessage> = {},
): RuyiMessage {
  return {
    id,
    conversationId,
    sender,
    kind: 'text',
    content,
    createdAt,
    ...options,
  };
}

/* ================= IM 固定会话综合对话 ================= */

function buildImShowcase(ownerId: string, conversationId: string): RuyiShowcaseConversationBundle {
  const cid = conversationId;
  const m: RuyiMessage[] = [
    mkMessage('showcase-im-m01', cid, 'user', '今天有哪些工作需要我关注？', demoClock(5)),
    mkMessage('showcase-im-m02', cid, 'assistant', '我已为你整理好今天需要关注的工作，重点在流程处理：', demoClock(6), { businessCard: approvalMessageCard }),
    mkMessage('showcase-im-m03', cid, 'user', '看一下我上个月的考勤和剩余年假', demoClock(12)),
    mkMessage('showcase-im-m04', cid, 'assistant', '上月考勤整体正常，年假使用情况如下：', demoClock(13), { businessCard: attendanceMessageCard }),
    mkMessage('showcase-im-m05', cid, 'user', '帮我看看今明两天的安排', demoClock(20)),
    mkMessage('showcase-im-m06', cid, 'assistant', '今明两日共 3 个日程：', demoClock(21), { businessCard: scheduleMessageCard }),
    mkMessage('showcase-im-m07', cid, 'user', '我负责的项目进展怎么样？', demoClock(28)),
    mkMessage('showcase-im-m08', cid, 'assistant', '您负责的项目均按计划推进：', demoClock(29), { businessCard: projectMessageCard }),
    mkMessage('showcase-im-m09', cid, 'user', '搜索智能办公相关资料', demoClock(35)),
    mkMessage('showcase-im-m10', cid, 'assistant', '为您找到以下智能办公相关内容：', demoClock(36), { businessCard: knowledgeMessageCard }),
    mkMessage('showcase-im-m11', cid, 'user', '帮我创建明天下午的项目会议', demoClock(45)),
    mkMessage('showcase-im-m12', cid, 'assistant', '好的，我来帮您创建会议。已识别到会议日期为明天。请问会议开始时间是几点？', demoClock(46)),
    mkMessage('showcase-im-m13', cid, 'user', '下午3点，叫上张飞和赵云', demoClock(52)),
    mkMessage(
      'showcase-im-m14',
      cid,
      'assistant',
      '请确认会议信息：\n标题：项目沟通会\n日期：明天\n时间：15:00 - 16:00\n参会人：张飞、赵云\n地点：线上会议',
      demoClock(53),
      {
        kind: 'confirmation',
        actions: [
          { type: 'confirm-task', label: '确认创建', disabled: true, completedLabel: '已确认' },
          { type: 'modify-task', label: '修改', disabled: true },
          { type: 'cancel-task', label: '取消', disabled: true },
        ],
      },
    ),
    mkMessage('showcase-im-m15', cid, 'user', '确认创建', demoClock(58)),
    mkMessage('showcase-im-m16', cid, 'assistant', '正在创建会议，请稍候…', demoClock(59)),
    mkMessage(
      'showcase-im-m17',
      cid,
      'assistant',
      '会议创建成功：\n标题：项目沟通会\n日期：明天\n时间：15:00 - 16:00\n参会人：张飞、赵云\n地点：线上会议',
      demoClock(64),
      { businessCard: buildMeetingCreatedCard({ title: '项目沟通会', dateText: '明天', startTime: '15:00', endTime: '16:00', attendeeNames: ['张飞', '赵云'], location: '线上会议' }) },
    ),
    mkMessage('showcase-im-m18', cid, 'user', '帮我生成本周的项目周报', demoClock(72)),
    mkMessage(
      'showcase-im-m19',
      cid,
      'assistant',
      '好的，我来协助您整理汇报。已按您的需求预填了参谋配置，可点击卡片直接进入参谋师工作台：',
      demoClock(73),
      {
        capabilityId: 'advisor',
        businessCard: buildWorkbenchEntryCard('如意参谋', '/pc_client/ruyi-zone/advisor', cid, {
          resultTitle: '本周项目周报',
          fields: [
            { label: '汇报类型', value: '项目周报' },
            { label: '汇报周期', value: '本周' },
            { label: '数据来源', value: '项目管理平台' },
          ],
          timestamp: '今天 10:15',
        }),
      },
    ),
  ];

  const task: RuyiTaskMock = {
    id: 'showcase-task-im-meeting',
    ownerId,
    conversationId: cid,
    type: 'create-meeting',
    status: 'completed',
    slots: {
      title: '项目沟通会',
      dateText: '明天',
      resolvedDate: demoClock(0, -1).slice(0, 10),
      startTime: '15:00',
      endTime: '16:00',
      attendeeNames: ['张飞', '赵云'],
      location: '线上会议',
    },
    missingSlots: [],
    createdAt: demoClock(45),
    updatedAt: demoClock(64),
    title: '创建项目沟通会',
    goal: '创建明天的项目会议并通知参会人',
    source: { entry: 'pc-im', label: 'PC 消息 · 如意助手', device: 'pc-web' },
    lastOperatedDevice: 'pc-web',
    resultIds: [],
    events: [
      { id: 'showcase-task-im-meeting-evt-1', taskId: 'showcase-task-im-meeting', type: 'created', label: '创建任务「创建项目沟通会」', status: 'collecting', device: 'pc-web', createdAt: demoClock(45) },
      { id: 'showcase-task-im-meeting-evt-2', taskId: 'showcase-task-im-meeting', type: 'confirmed', label: '确认执行', status: 'executing', device: 'pc-web', createdAt: demoClock(58) },
      { id: 'showcase-task-im-meeting-evt-3', taskId: 'showcase-task-im-meeting', type: 'completed', label: '任务已完成', status: 'completed', device: 'pc-web', createdAt: demoClock(64) },
    ],
  };

  const conversation: RuyiConversation = {
    ...mkConversation(cid, ownerId, FIXED_IM_CONVERSATION_TITLE, m.map((x) => x.id), {
      createdAt: demoClock(5),
      updatedAt: demoClock(73),
      origin: 'pc-im',
    }),
    activeTaskId: null,
  };

  return { conversation, messages: m, tasks: [task] };
}

/* ================= 如意空间 13 场景 ================= */

/** 查询类场景工厂：用户问 → 助手答（带卡） */
function buildQueryScenario(
  id: string,
  title: string,
  userText: string,
  assistantText: string,
  card: RuyiMessage['businessCard'],
  lastCapabilityId: RuyiShowcaseDefCapability,
  order: number,
): RuyiShowcaseConversationDefinition {
  return {
    id,
    title,
    summary: userText,
    displayOrder: order,
    build: (ownerId) => {
      const messages = [
        mkMessage(`showcase-${id}-m1`, id, 'user', userText, demoClock(10 + order)),
        mkMessage(`showcase-${id}-m2`, id, 'assistant', assistantText, demoClock(11 + order), { businessCard: card, capabilityId: lastCapabilityId }),
      ];
      return {
        conversation: mkConversation(id, ownerId, title, messages.map((m) => m.id), { lastCapabilityId, updatedAt: demoClock(11 + order) }),
        messages,
      };
    },
  };
}

type RuyiShowcaseDefCapability = RuyiConversation['lastCapabilityId'];

const queryScenarios: RuyiShowcaseConversationDefinition[] = [
  buildQueryScenario('showcase-work-approval', '今日待办与审批', '今天有哪些待办流程需要处理？', '您当前有 3 项待办流程，其中 2 项已等待超过 24 小时：', approvalMessageCard, 'work-query', 1),
  buildQueryScenario('showcase-attendance', '考勤与年假查询', '看一下我上个月的考勤和剩余年假', '上月考勤整体正常，无异常缺勤；有 2 次迟到和 1 天年假记录：', attendanceMessageCard, 'work-query', 2),
  buildQueryScenario('showcase-schedule', '今明日程安排', '帮我看看今明两天的安排', '今天有 2 个日程，明天有 1 个日程：', scheduleMessageCard, 'work-query', 3),
  buildQueryScenario('showcase-project', '项目进度跟进', '我负责的项目进展怎么样？', '您负责的 3 个项目均按计划进行：', projectMessageCard, 'work-query', 4),
  buildQueryScenario('showcase-knowledge', '智能知识检索', '搜索智能办公相关资料', '根据您的搜索和工作内容，推荐以下文章：', knowledgeMessageCard, 'work-query', 5),
  buildQueryScenario('showcase-it-service', 'IT 服务与故障处理', 'VPN 无法连接，帮我排查一下', '已收到您的 VPN 故障反馈（工单号 #IT-20261118-001）。建议按以下步骤排查：', itServiceMessageCard, 'it-service', 11),
];

/* 翻译场景 */
function buildTranslationScenario(): RuyiShowcaseConversationDefinition {
  const id = 'showcase-translation';
  return {
    id,
    title: '智能翻译',
    summary: '翻译“项目进展顺利”',
    displayOrder: 6,
    build: (ownerId) => {
      const messages = [
        mkMessage('showcase-translation-m1', id, 'user', '翻译“项目进展顺利”', demoClock(70)),
        mkMessage('showcase-translation-m2', id, 'assistant', '英文译文：\nThe project is progressing smoothly.\n\n可直接在输入框继续发送修改要求（如更换语气、目标语言）。', demoClock(71), { capabilityId: 'translation' }),
      ];
      return {
        conversation: mkConversation(id, ownerId, '智能翻译', messages.map((m) => m.id), { lastCapabilityId: 'translation', updatedAt: demoClock(71) }),
        messages,
      };
    },
  };
}

/* 会议场景（完整链路：发起→补时间→补人→确认→已确认→成功） */
function buildMeetingScenario(): RuyiShowcaseConversationDefinition {
  const id = 'showcase-meeting';
  const taskId = 'showcase-task-meeting';
  return {
    id,
    title: '创建项目会议',
    summary: '帮我创建明天下午的项目会议',
    displayOrder: 7,
    build: (ownerId) => {
      const messages = [
        mkMessage('showcase-meeting-m1', id, 'user', '帮我创建明天下午的项目会议', demoClock(80)),
        mkMessage('showcase-meeting-m2', id, 'assistant', '好的，我来帮您创建会议。已识别到会议日期为明天。请问会议开始时间是几点？', demoClock(81), { taskId }),
        mkMessage('showcase-meeting-m3', id, 'user', '下午3点', demoClock(85)),
        mkMessage('showcase-meeting-m4', id, 'assistant', '好的，会议时间为 15:00 - 16:00。请问需要邀请哪些人参会？', demoClock(86), { taskId }),
        mkMessage('showcase-meeting-m5', id, 'user', '叫上张飞和赵云', demoClock(90)),
        mkMessage(
          'showcase-meeting-m6',
          id,
          'assistant',
          '请确认会议信息：\n标题：项目沟通会\n日期：明天\n时间：15:00 - 16:00\n参会人：张飞、赵云\n地点：线上会议',
          demoClock(91),
          {
            kind: 'confirmation',
            taskId,
            actions: [
              { type: 'confirm-task', label: '确认创建', disabled: true, completedLabel: '已确认' },
              { type: 'modify-task', label: '修改', disabled: true },
              { type: 'cancel-task', label: '取消', disabled: true },
            ],
          },
        ),
        mkMessage('showcase-meeting-m7', id, 'user', '确认创建', demoClock(95)),
        mkMessage('showcase-meeting-m8', id, 'assistant', '正在创建会议，请稍候…', demoClock(96), { taskId }),
        mkMessage(
          'showcase-meeting-m9',
          id,
          'assistant',
          '会议创建成功：\n标题：项目沟通会\n日期：明天\n时间：15:00 - 16:00\n参会人：张飞、赵云\n地点：线上会议',
          demoClock(100),
          { taskId, businessCard: scheduleMessageCard },
        ),
      ];
      const task: RuyiTaskMock = {
        id: taskId,
        ownerId,
        conversationId: id,
        type: 'create-meeting',
        status: 'completed',
        slots: {
          title: '项目沟通会',
          dateText: '明天',
          resolvedDate: demoClock(0, -1).slice(0, 10),
          startTime: '15:00',
          endTime: '16:00',
          attendeeNames: ['张飞', '赵云'],
          location: '线上会议',
        },
        missingSlots: [],
        createdAt: demoClock(80),
        updatedAt: demoClock(100),
        title: '创建项目沟通会',
        goal: '创建明天下午的项目会议',
        source: { entry: 'ruyi-zone', label: '如意空间对话', device: 'pc-client' },
        events: [
          { id: `${taskId}-evt-1`, taskId, type: 'created', label: '创建任务「创建项目沟通会」', status: 'collecting', device: 'pc-client', createdAt: demoClock(80) },
          { id: `${taskId}-evt-2`, taskId, type: 'confirmed', label: '确认执行', status: 'executing', device: 'pc-client', createdAt: demoClock(95) },
          { id: `${taskId}-evt-3`, taskId, type: 'completed', label: '任务已完成', status: 'completed', device: 'pc-client', createdAt: demoClock(100) },
        ],
      };
      return {
        conversation: mkConversation(id, ownerId, '创建项目会议', messages.map((m) => m.id), { updatedAt: demoClock(100) }),
        messages,
        tasks: [task],
      };
    },
  };
}


/** 创作场景工厂：需求 → 确认+工作台入口 → 成果卡（成果入库并关联会话） */
function buildCreationScenario(
  id: string,
  title: string,
  capabilityId: 'document' | 'presentation' | 'advisor',
  capName: string,
  userText: string,
  resultTitle: string,
  resultType: 'document' | 'presentation' | 'report',
  workbenchPath: string,
  order: number,
): RuyiShowcaseConversationDefinition {
  const resultId = `showcase-res-${id}`;
  return {
    id,
    title,
    summary: userText,
    displayOrder: order,
    build: (ownerId) => {
      const messages = [
        mkMessage(`showcase-${id}-m1`, id, 'user', userText, demoClock(110 + order)),
        mkMessage(
          `showcase-${id}-m2`,
          id,
          'assistant',
          `已收到您的${capName}需求（参数摘要见消息记录），已为您打开${capName}工作台。`,
          demoClock(111 + order),
          { capabilityId },
        ),
        mkMessage(`showcase-${id}-m3`, id, 'user', '按默认参数生成', demoClock(115 + order)),
        mkMessage(
          `showcase-${id}-m4`,
          id,
          'assistant',
          `已完成「${resultTitle}」，可在成果卡片中继续打开或编辑。`,
          demoClock(120 + order),
          {
            kind: 'result',
            resultId,
            capabilityId,
          },
        ),
      ];
      const result: RuyiResultReference = {
        id: resultId,
        ownerId,
        conversationId: id,
        type: resultType,
        title: resultTitle,
        capabilityId,
        status: 'completed',
        workbenchHref: `${workbenchPath}?sourceConversationId=${id}`,
        createdAt: demoClock(120 + order),
        updatedAt: demoClock(120 + order),
      };
      return {
        conversation: mkConversation(id, ownerId, title, messages.map((m) => m.id), { lastCapabilityId: capabilityId, updatedAt: demoClock(120 + order) }),
        messages,
        results: [result],
      };
    },
  };
}

const creationScenarios: RuyiShowcaseConversationDefinition[] = [
  buildCreationScenario('showcase-document', '起草会议通知', 'document', '如意公文', '帮我起草一份数字化转型推进会议通知', '数字化转型推进会议通知', 'document', '/pc_client/ruyi-zone/document', 8),
  buildCreationScenario('showcase-presentation', '生成经营分析 PPT', 'presentation', '如意PPT', '做一份季度经营分析PPT', '季度经营分析演示文稿', 'presentation', '/pc_client/ruyi-zone/presentation', 9),
  buildCreationScenario('showcase-advisor', '生成项目周报', 'advisor', '如意参谋', '生成本周项目周报', '本周项目周报', 'report', '/pc_client/ruyi-zone/advisor', 10),
];

/* 任务恢复与异常场景 */
function buildTaskRecoveryScenario(): RuyiShowcaseConversationDefinition {
  const id = 'showcase-task-recovery';
  const taskId = 'showcase-task-recovery-meeting';
  return {
    id,
    title: '任务恢复与异常处理',
    summary: '任务中断恢复与失败重试全过程',
    displayOrder: 12,
    build: (ownerId) => {
      const messages = [
        mkMessage('showcase-task-recovery-m1', id, 'user', '帮我创建明天的部门例会', demoClock(130)),
        mkMessage('showcase-task-recovery-m2', id, 'assistant', '好的，已识别会议日期为明天。请问会议开始时间是几点？', demoClock(131), { taskId }),
        mkMessage('showcase-task-recovery-m3', id, 'user', '我还有多少年假？', demoClock(135)),
        mkMessage('showcase-task-recovery-m4', id, 'assistant', '您今年剩余年假 5 天。', demoClock(136), { businessCard: attendanceMessageCard }),
        mkMessage(
          'showcase-task-recovery-m5',
          id,
          'system',
          '原任务「创建部门例会」已暂停，点击继续可回到参数补充。',
          demoClock(137),
          {
            kind: 'resume-task',
            taskId,
            actions: [{ type: 'resume-task', label: '继续创建会议', disabled: true, completedLabel: '已继续' }],
          },
        ),
        mkMessage('showcase-task-recovery-m6', id, 'user', '继续创建会议，上午10点，叫上张飞', demoClock(140)),
        mkMessage(
          'showcase-task-recovery-m7',
          id,
          'assistant',
          '请确认会议信息：\n标题：部门例会\n日期：明天\n时间：10:00 - 11:00\n参会人：张飞\n地点：线上会议',
          demoClock(141),
          {
            kind: 'confirmation',
            taskId,
            actions: [
              { type: 'confirm-task', label: '确认创建', disabled: true, completedLabel: '已确认' },
              { type: 'modify-task', label: '修改', disabled: true },
              { type: 'cancel-task', label: '取消', disabled: true },
            ],
          },
        ),
        mkMessage('showcase-task-recovery-m8', id, 'user', '确认创建，演示失败', demoClock(145)),
        mkMessage(
          'showcase-task-recovery-m9',
          id,
          'assistant',
          '会议创建失败：会议室服务暂不可用，请稍后重试',
          demoClock(148),
          {
            kind: 'error',
            taskId,
            actions: [{ type: 'retry', label: '重试', disabled: true, completedLabel: '已重试' }],
          },
        ),
        mkMessage('showcase-task-recovery-m10', id, 'user', '重试', demoClock(152)),
        mkMessage(
          'showcase-task-recovery-m11',
          id,
          'assistant',
          '会议创建成功：\n标题：部门例会\n日期：明天\n时间：10:00 - 11:00\n参会人：张飞\n地点：线上会议',
          demoClock(156),
          { taskId, businessCard: buildMeetingCreatedCard({ title: '部门例会', dateText: '明天', startTime: '10:00', endTime: '11:00', attendeeNames: ['张飞'], location: '线上会议' }) },
        ),
      ];
      const task: RuyiTaskMock = {
        id: taskId,
        ownerId,
        conversationId: id,
        type: 'create-meeting',
        status: 'completed',
        slots: {
          title: '部门例会',
          dateText: '明天',
          resolvedDate: demoClock(0, -1).slice(0, 10),
          startTime: '10:00',
          endTime: '11:00',
          attendeeNames: ['张飞'],
          location: '线上会议',
        },
        missingSlots: [],
        createdAt: demoClock(130),
        updatedAt: demoClock(156),
        title: '创建部门例会',
        goal: '创建明天部门例会（含中断恢复与失败重试演示）',
        source: { entry: 'ruyi-zone', label: '如意空间对话', device: 'pc-client' },
        events: [
          { id: `${taskId}-evt-1`, taskId, type: 'created', label: '创建任务「创建部门例会」', status: 'collecting', device: 'pc-client', createdAt: demoClock(130) },
          { id: `${taskId}-evt-2`, taskId, type: 'interrupted', label: '用户切换话题，任务暂停', status: 'interrupted', device: 'pc-client', createdAt: demoClock(135) },
          { id: `${taskId}-evt-3`, taskId, type: 'resumed', label: '继续任务并补齐参数', status: 'awaiting-confirmation', device: 'pc-client', createdAt: demoClock(140) },
          { id: `${taskId}-evt-4`, taskId, type: 'failed', label: '执行失败：会议室服务暂不可用', status: 'failed', device: 'pc-client', createdAt: demoClock(148) },
          { id: `${taskId}-evt-5`, taskId, type: 'retried', label: '重试执行中', status: 'executing', device: 'pc-client', createdAt: demoClock(152) },
          { id: `${taskId}-evt-6`, taskId, type: 'completed', label: '任务已完成', status: 'completed', device: 'pc-client', createdAt: demoClock(156) },
        ],
      };
      return {
        conversation: mkConversation(id, ownerId, '任务恢复与异常处理', messages.map((m) => m.id), { updatedAt: demoClock(156) }),
        messages,
        tasks: [task],
      };
    },
  };
}

/* 成果权限场景（可打开/失效/无权限——脱敏） */
function buildResultStatesScenario(): RuyiShowcaseConversationDefinition {
  const id = 'showcase-result-states';
  return {
    id,
    title: 'AI 成果与权限状态',
    summary: '成果状态示例',
    displayOrder: 13,
    build: (ownerId) => {
      const results: RuyiResultReference[] = [
        {
          id: 'showcase-res-states-editable',
          ownerId,
          conversationId: id,
          type: 'document',
          title: '新版智能办公系统方案',
          capabilityId: 'document',
          status: 'completed',
          workbenchHref: `/pc_client/ruyi-zone/document?sourceConversationId=${id}`,
          createdAt: demoClock(160),
        },
        {
          id: 'showcase-res-states-invalid',
          ownerId,
          conversationId: id,
          type: 'presentation',
          title: '旧版协同平台介绍',
          capabilityId: 'presentation',
          status: 'deleted',
          workbenchHref: `/pc_client/ruyi-zone/presentation?sourceConversationId=${id}`,
          createdAt: demoClock(161),
          statusReason: '该成果已被删除',
        },
        {
          id: 'showcase-res-states-forbidden',
          ownerId,
          conversationId: id,
          type: 'report',
          title: '季度经营分析报告',
          capabilityId: 'advisor',
          status: 'deleted',
          workbenchHref: '/pc_client/ruyi-zone/advisor',
          createdAt: demoClock(162),
          statusReason: '该成果已被删除',
        },
      ];
      const messages = results.map((r, i) =>
        mkMessage(
          `showcase-result-states-m${i + 1}`,
          id,
          'assistant',
          r.status === 'deleted' ? `成果「${r.title}」已删除。` : `成果「${r.title}」已生成，可预览或下载。`,
          demoClock(160 + i),
          { kind: 'result', resultId: r.id, capabilityId: r.capabilityId },
        ),
      );
      // 前置一条用户消息使场景成立
      messages.unshift(mkMessage('showcase-result-states-m0', id, 'user', '看看我最近生成的成果', demoClock(159)));
      return {
        conversation: mkConversation(id, ownerId, 'AI 成果与权限状态', messages.map((m) => m.id), { updatedAt: demoClock(162) }),
        messages,
        results,
      };
    },
  };
}

/** 全部空间场景（13 条），按 displayOrder 排序 */
export const ruyiShowcaseDefinitions: RuyiShowcaseConversationDefinition[] = [
  ...queryScenarios.slice(0, 5),
  buildTranslationScenario(),
  ...queryScenarios.slice(5), // it-service（order 11）
  buildMeetingScenario(),
  ...creationScenarios,
  buildTaskRecoveryScenario(),
  buildResultStatesScenario(),
].sort((a, b) => a.displayOrder - b.displayOrder);

/* ================= Seed 组装 ================= */

export interface RuyiShowcaseSeed {
  conversations: Record<string, RuyiConversation>;
  messages: Record<string, RuyiMessage>;
  tasks: Record<string, RuyiTaskMock>;
  results: Record<string, RuyiResultReference>;
  contextReferences: Record<string, RuyiContextReference>;
  conversationIds: string[];
  taskIds: string[];
  resultIds: string[];
}

/** 生成完整 showcase seed（固定 IM 会话 + 13 场景）；ownerId 由调用方传入 */
export function buildRuyiShowcaseSeed(ownerId: string, imConversationId: string): RuyiShowcaseSeed {
  const seed: RuyiShowcaseSeed = {
    conversations: {},
    messages: {},
    tasks: {},
    results: {},
    contextReferences: {},
    conversationIds: [],
    taskIds: [],
    resultIds: [],
  };
  const absorb = (bundle: RuyiShowcaseConversationBundle) => {
    seed.conversations[bundle.conversation.id] = bundle.conversation;
    bundle.messages.forEach((m) => { seed.messages[m.id] = m; });
    (bundle.tasks ?? []).forEach((t) => { seed.tasks[t.id] = t; });
    (bundle.results ?? []).forEach((r) => { seed.results[r.id] = r; });
    (bundle.contextReferences ?? []).forEach((c) => { seed.contextReferences[c.id] = c; });
  };

  // IM 固定会话
  absorb(buildImShowcase(ownerId, imConversationId));
  // 空间场景（IM 会话也出现在空间历史列表，但不占 showcase 场景位）
  ruyiShowcaseDefinitions.forEach((def) => absorb(def.build(ownerId)));

  // 索引：固定会话在前，场景按 displayOrder
  seed.conversationIds = [imConversationId, ...ruyiShowcaseDefinitions.map((d) => d.id)];
  seed.taskIds = Object.keys(seed.tasks);
  seed.resultIds = Object.keys(seed.results);
  return seed;
}
