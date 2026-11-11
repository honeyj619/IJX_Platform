import type {
  RuyiContextReference,
  RuyiConversation,
  RuyiMessage,
  RuyiPrototypeState,
  RuyiResultReference,
  RuyiTaskEvent,
  RuyiTaskMock,
} from '../types/ruyi';
import { ruyiCapabilities } from './ruyiCapabilities';

const DEMO_OWNER_ID = 'demo-user';
const FIXED_SYSTEM_CONVERSATION_ID = 'ruyi-system-assistant';

function makeId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

function now(plusMinutes = 0): string {
  const base = new Date('2026-11-06T10:00:00.000+08:00');
  base.setMinutes(base.getMinutes() + plusMinutes);
  return base.toISOString();
}

function tomorrow(): string {
  const d = new Date('2026-11-06T10:00:00.000+08:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/** V2：动态日期生成器——demo 断言可预测，不把易过期日期硬编码到普通数据 */
function dynamicNow(): Date {
  return new Date();
}

function dynamicIso(daysAgo = 0, hour = 10, minute = 0): string {
  const d = dynamicNow();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dynamicDateOffset(days: number): string {
  const d = dynamicNow();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function createMessage(
  id: string,
  conversationId: string,
  sender: RuyiMessage['sender'],
  kind: RuyiMessage['kind'],
  content: string,
  options: Partial<RuyiMessage> = {},
): RuyiMessage {
  return {
    id,
    conversationId,
    sender,
    kind,
    content,
    createdAt: now(),
    ...options,
  };
}

function createConversation(
  id: string,
  title: string,
  messageIds: string[],
  options: Partial<RuyiConversation> = {},
): RuyiConversation {
  return {
    id,
    ownerId: DEMO_OWNER_ID,
    title,
    createdAt: now(),
    updatedAt: now(),
    activeCapabilityId: null,
    lastCapabilityId: null,
    messageIds,
    activeTaskId: null,
    contextReferenceId: null,
    ...options,
  };
}

/** V2 fixture 辅助：任务工厂（带事件时间线） */
function createV2Task(
  id: string,
  conversationId: string,
  options: Partial<RuyiTaskMock> & { status: RuyiTaskMock['status'] },
): RuyiTaskMock {
  const created = options.createdAt ?? dynamicIso(1, 9);
  const updated = options.updatedAt ?? dynamicIso(0, 9, 30);
  const baseEvent: RuyiTaskEvent = {
    id: `${id}-evt-0`,
    taskId: id,
    type: 'created',
    label: `创建任务「${options.title ?? id}」`,
    status: 'collecting',
    device: 'pc-client',
    createdAt: created,
  };
  return {
    id,
    ownerId: DEMO_OWNER_ID,
    conversationId,
    type: 'create-meeting',
    slots: {},
    missingSlots: [],
    createdAt: created,
    updatedAt: updated,
    title: options.title ?? '未命名任务',
    goal: options.goal ?? '',
    parameters: options.parameters ?? [],
    source: options.source ?? { entry: 'ruyi-zone', label: '如意空间对话', device: 'pc-client' },
    lastOperatedDevice: options.lastOperatedDevice ?? 'pc-client',
    lastOperatedAt: updated,
    nextAction: options.nextAction,
    resultIds: options.resultIds ?? [],
    contextReferenceId: options.contextReferenceId,
    events: [baseEvent, ...(options.events ?? [])],
    relativeDateConfirmedAt: options.relativeDateConfirmedAt,
    ...options,
  };
}

export type RuyiDemoScenarioId =
  | 'first-use'
  | 'default'
  | 'conversation-management'
  | 'capability-states'
  | 'task-poc'
  | 'result-states'
  | 'failure-states'
  | 'user-isolation'
  /* ---- V2 ---- */
  | 'v2-task-center'
  | 'v2-task-detail'
  | 'v2-multi-task'
  | 'v2-cross-day-resume'
  | 'v2-result-center'
  | 'v2-cross-device'
  | 'v2-conversation-filter'
  | 'v2-task-empty'
  | 'v2-result-empty'
  | 'v2-task-error';

export const ruyiDemoScenarioIds: RuyiDemoScenarioId[] = [
  'first-use',
  'default',
  'conversation-management',
  'capability-states',
  'task-poc',
  'result-states',
  'failure-states',
  'user-isolation',
  'v2-task-center',
  'v2-task-detail',
  'v2-multi-task',
  'v2-cross-day-resume',
  'v2-result-center',
  'v2-cross-device',
  'v2-conversation-filter',
  'v2-task-empty',
  'v2-result-empty',
  'v2-task-error',
];

function buildDefaultState(): RuyiPrototypeState {
  const messages: Record<string, RuyiMessage> = {};
  const conversations: Record<string, RuyiConversation> = {};
  const results: Record<string, RuyiResultReference> = {};
  const tasks: Record<string, RuyiTaskMock> = {};

  // 默认系统会话：PC 消息中的如意助手
  const systemMessages: RuyiMessage[] = [
    createMessage(
      makeId('msg', 1),
      FIXED_SYSTEM_CONVERSATION_ID,
      'assistant',
      'text',
      '您好！我是如意助手，请问有什么可以帮您？',
    ),
  ];
  systemMessages.forEach((m) => {
    messages[m.id] = m;
  });
  conversations[FIXED_SYSTEM_CONVERSATION_ID] = createConversation(
    FIXED_SYSTEM_CONVERSATION_ID,
    '如意助手',
    systemMessages.map((m) => m.id),
  );

  // 默认普通会话 1：待办查询
  const c1Messages: RuyiMessage[] = [
    createMessage(makeId('msg', 10), makeId('conv', 1), 'user', 'text', '我还有什么流程没有处理？'),
    createMessage(
      makeId('msg', 11),
      makeId('conv', 1),
      'assistant',
      'text',
      '您当前有 3 项待办流程：\n1. 项目立项申请 - 待审批\n2. 预算调整申请 - 待填写\n3. 设备采购申请 - 待确认\n\n可点击入口前往流程中心处理。',
      { actions: [{ type: 'open-workbench', label: '查看流程中心' }] },
    ),
  ];
  c1Messages.forEach((m) => {
    messages[m.id] = m;
  });
  conversations[makeId('conv', 1)] = createConversation(
    makeId('conv', 1),
    '我还有什么流程没有处理？',
    c1Messages.map((m) => m.id),
    { lastCapabilityId: 'work-query' },
  );

  // 默认普通会话 2：翻译 + PPT
  const c2Messages: RuyiMessage[] = [
    createMessage(
      makeId('msg', 20),
      makeId('conv', 2),
      'user',
      'text',
      '把“会议改到下午三点”翻译成英文',
    ),
    createMessage(
      makeId('msg', 21),
      makeId('conv', 2),
      'assistant',
      'text',
      'The meeting has been rescheduled to 3 PM.',
      { capabilityId: 'translation' },
    ),
  ];
  c2Messages.forEach((m) => {
    messages[m.id] = m;
  });
  conversations[makeId('conv', 2)] = createConversation(
    makeId('conv', 2),
    '翻译：会议改到下午三点',
    c2Messages.map((m) => m.id),
    { lastCapabilityId: 'translation' },
  );

  return {
    schemaVersion: 1,
    currentOwnerId: DEMO_OWNER_ID,
    users: {
      [DEMO_OWNER_ID]: {
        ownerId: DEMO_OWNER_ID,
        conversationIds: [FIXED_SYSTEM_CONVERSATION_ID, makeId('conv', 1), makeId('conv', 2)],
        resultIds: [],
        taskIds: [],
        initializedAt: now(),
      },
    },
    conversations,
    messages,
    results,
    tasks,
    workbenchContexts: {},
    contextReferences: {},
    demoScenarioId: 'default',
  };
}

function buildFirstUseState(): RuyiPrototypeState {
  return {
    schemaVersion: 1,
    currentOwnerId: DEMO_OWNER_ID,
    users: {
      [DEMO_OWNER_ID]: {
        ownerId: DEMO_OWNER_ID,
        conversationIds: [FIXED_SYSTEM_CONVERSATION_ID],
        resultIds: [],
        taskIds: [],
        initializedAt: now(),
      },
    },
    conversations: {
      [FIXED_SYSTEM_CONVERSATION_ID]: createConversation(
        FIXED_SYSTEM_CONVERSATION_ID,
        '如意助手',
        [
          createMessage(
            makeId('msg', 1),
            FIXED_SYSTEM_CONVERSATION_ID,
            'assistant',
            'text',
            '您好！我是如意助手，请问有什么可以帮您？',
          ).id,
        ],
      ),
    },
    messages: {
      [makeId('msg', 1)]: createMessage(
        makeId('msg', 1),
        FIXED_SYSTEM_CONVERSATION_ID,
        'assistant',
        'text',
        '您好！我是如意助手，请问有什么可以帮您？',
      ),
    },
    results: {},
    tasks: {},
    workbenchContexts: {},
    contextReferences: {},
    demoScenarioId: 'first-use',
  };
}

function buildConversationManagementState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'conversation-management';

  // 增加一个含成果的会话，用于验证删除会话不删除成果
  const convId = makeId('conv', 3);
  const resultId = makeId('res', 1);
  const msgId = makeId('msg', 30);

  state.results[resultId] = {
    id: resultId,
    ownerId: DEMO_OWNER_ID,
    conversationId: convId,
    type: 'document',
    title: '项目沟通会议纪要',
    capabilityId: 'document',
    status: 'editable',
    workbenchHref: `/pc_client/ruyi-zone/document?sourceConversationId=${convId}`,
    createdAt: now(),
  };

  state.messages[msgId] = createMessage(
    msgId,
    convId,
    'assistant',
    'result',
    '已生成会议纪要，可在成果卡片中继续编辑。',
    { resultId },
  );

  state.conversations[convId] = createConversation(
    convId,
    '项目沟通会议纪要',
    [msgId],
    { lastCapabilityId: 'document' },
  );

  state.users[DEMO_OWNER_ID].conversationIds.push(convId);
  state.users[DEMO_OWNER_ID].resultIds.push(resultId);

  return state;
}

function buildCapabilityStatesState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'capability-states';

  const convId = makeId('conv', 4);
  const m1 = createMessage(
    makeId('msg', 40),
    convId,
    'user',
    'text',
    '把“会议改到下午三点”翻译成英文',
  );
  const m2 = createMessage(
    makeId('msg', 41),
    convId,
    'assistant',
    'text',
    'The meeting has been rescheduled to 3 PM.',
    { capabilityId: 'translation' },
  );
  const m3 = createMessage(
    makeId('msg', 42),
    convId,
    'system',
    'capability-status',
    '已切换至如意PPT，可直接描述演示文稿需求。',
    { capabilityId: 'presentation' },
  );

  state.messages[m1.id] = m1;
  state.messages[m2.id] = m2;
  state.messages[m3.id] = m3;

  state.conversations[convId] = createConversation(
    convId,
    '翻译与PPT需求',
    [m1.id, m2.id, m3.id],
    { activeCapabilityId: 'presentation', lastCapabilityId: 'presentation' },
  );

  state.users[DEMO_OWNER_ID].conversationIds.push(convId);

  return state;
}

function buildTaskPocState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'task-poc';

  const convId = makeId('conv', 5);
  const taskId = makeId('task', 1);
  const m1 = createMessage(
    makeId('msg', 50),
    convId,
    'user',
    'text',
    '帮我创建明天的会议',
  );
  const m2 = createMessage(
    makeId('msg', 51),
    convId,
    'assistant',
    'text',
    '好的，我来帮您创建会议。已识别到会议日期为明天。请问会议开始时间是几点？',
    { taskId },
  );

  state.messages[m1.id] = m1;
  state.messages[m2.id] = m2;

  state.conversations[convId] = createConversation(
    convId,
    '创建明天的会议',
    [m1.id, m2.id],
    { activeTaskId: taskId },
  );

  state.tasks[taskId] = {
    id: taskId,
    ownerId: DEMO_OWNER_ID,
    conversationId: convId,
    type: 'create-meeting',
    status: 'collecting',
    slots: {
      title: '项目沟通会',
      dateText: '明天',
      resolvedDate: tomorrow(),
    },
    missingSlots: ['startTime', 'endTime', 'attendeeNames'],
    createdAt: now(),
    updatedAt: now(),
  };

  state.users[DEMO_OWNER_ID].conversationIds.push(convId);
  state.users[DEMO_OWNER_ID].taskIds.push(taskId);

  return state;
}

function buildResultStatesState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'result-states';

  const results: RuyiResultReference[] = [
    {
      id: makeId('res', 10),
      ownerId: DEMO_OWNER_ID,
      conversationId: null,
      type: 'document',
      title: '新版智能办公系统方案',
      capabilityId: 'document',
      status: 'editable',
      workbenchHref: `/pc_client/ruyi-zone/document?sourceResultId=${makeId('res', 10)}`,
      createdAt: now(),
    },
    {
      id: makeId('res', 11),
      ownerId: DEMO_OWNER_ID,
      conversationId: null,
      type: 'presentation',
      title: 'AI办公汇报PPT',
      capabilityId: 'presentation',
      status: 'completed',
      workbenchHref: `/pc_client/ruyi-zone/presentation?sourceResultId=${makeId('res', 11)}`,
      createdAt: now(),
    },
    {
      id: makeId('res', 12),
      ownerId: DEMO_OWNER_ID,
      conversationId: null,
      type: 'document',
      title: '旧版协同平台方案',
      capabilityId: 'document',
      status: 'invalid',
      workbenchHref: `/pc_client/ruyi-zone/document?sourceResultId=${makeId('res', 12)}`,
      createdAt: now(),
      statusReason: '源文件已被删除或迁移，无法继续编辑',
    },
    {
      id: makeId('res', 13),
      ownerId: DEMO_OWNER_ID,
      conversationId: null,
      type: 'report',
      title: '经营分析报告',
      capabilityId: 'advisor',
      status: 'forbidden',
      workbenchHref: `/pc_client/ruyi-zone/advisor?sourceResultId=${makeId('res', 13)}`,
      createdAt: now(),
      statusReason: '无权限查看该报告内容',
    },
  ];

  const convId = makeId('conv', 6);
  const msgIds: string[] = [];

  results.forEach((result) => {
    state.results[result.id] = result;
    state.users[DEMO_OWNER_ID].resultIds.push(result.id);

    const msg = createMessage(
      makeId('msg', 60 + results.indexOf(result)),
      convId,
      'assistant',
      'result',
      result.status === 'forbidden' ? '该成果暂无查看权限。' : `成果「${result.title}」已记录。`,
      { resultId: result.id },
    );
    state.messages[msg.id] = msg;
    msgIds.push(msg.id);
  });

  state.conversations[convId] = createConversation(convId, '成果状态演示', msgIds);
  state.users[DEMO_OWNER_ID].conversationIds.push(convId);

  return state;
}

function buildFailureStatesState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'failure-states';

  const convId = makeId('conv', 7);
  const taskId = makeId('task', 10);
  const m1 = createMessage(makeId('msg', 70), convId, 'user', 'text', '帮我创建明天的会议');
  const m2 = createMessage(
    makeId('msg', 71),
    convId,
    'assistant',
    'text',
    '会议信息已确认，正在创建…',
    { taskId },
  );
  const m3 = createMessage(
    makeId('msg', 72),
    convId,
    'assistant',
    'error',
    '创建会议超时，请稍后重试或前往日历手动创建。',
    { taskId, actions: [{ type: 'retry', label: '重试' }] },
  );

  state.messages[m1.id] = m1;
  state.messages[m2.id] = m2;
  state.messages[m3.id] = m3;

  state.conversations[convId] = createConversation(convId, '会议创建失败演示', [
    m1.id,
    m2.id,
    m3.id,
  ]);

  state.tasks[taskId] = {
    id: taskId,
    ownerId: DEMO_OWNER_ID,
    conversationId: convId,
    type: 'create-meeting',
    status: 'failed',
    slots: {
      title: '项目沟通会',
      dateText: '明天',
      resolvedDate: tomorrow(),
      startTime: '10:00',
      endTime: '11:00',
      attendeeNames: ['张飞', '赵云'],
      location: '线上会议',
    },
    missingSlots: [],
    createdAt: now(),
    updatedAt: now(),
    failureReason: '创建会议超时',
  };

  state.users[DEMO_OWNER_ID].conversationIds.push(convId);
  state.users[DEMO_OWNER_ID].taskIds.push(taskId);

  return state;
}

function buildUserIsolationState(): RuyiPrototypeState {
  const ownerA = 'user-a';
  const ownerB = 'user-b';
  const messages: Record<string, RuyiMessage> = {};
  const conversations: Record<string, RuyiConversation> = {};

  const convA = createConversation(makeId('conv', 100), '用户A的会话', [], { ownerId: ownerA });
  const convB = createConversation(makeId('conv', 101), '用户B的会话', [], { ownerId: ownerB });

  conversations[convA.id] = convA;
  conversations[convB.id] = convB;

  return {
    schemaVersion: 1,
    currentOwnerId: ownerA,
    users: {
      [ownerA]: {
        ownerId: ownerA,
        conversationIds: [convA.id],
        resultIds: [],
        taskIds: [],
        initializedAt: now(),
      },
      [ownerB]: {
        ownerId: ownerB,
        conversationIds: [convB.id],
        resultIds: [],
        taskIds: [],
        initializedAt: now(),
      },
    },
    conversations,
    messages,
    results: {},
    tasks: {},
    workbenchContexts: {},
    contextReferences: {},
    demoScenarioId: 'user-isolation',
  };
}

/* ================= V2 场景构建器 ================= */

/** v2-task-center：7 种状态任务 + 各自来源会话 */
function buildV2TaskCenterState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'v2-task-center';
  const t = (n: number) => dynamicIso(0, 9, n);

  // 会话：任务中心演示（每任务一条来源会话消息）
  const convIds = {
    collecting: 'conv-v2-collecting',
    confirm: 'task-v2-confirm-conv',
    interrupted: 'conv-v2-interrupted',
    executing: 'conv-v2-executing',
    failed: 'conv-v2-failed',
    completed: 'conv-v2-completed',
    cancelled: 'conv-v2-cancelled',
  };

  // 1. 待补参：安排项目复盘会
  const m1 = createMessage(makeId('msg', 200), convIds.collecting, 'user', 'text', '帮我安排项目复盘会');
  state.messages[m1.id] = m1;
  state.conversations[convIds.collecting] = createConversation(convIds.collecting, '安排项目复盘会', [m1.id], { activeTaskId: 'task-v2-collecting' });
  state.tasks['task-v2-collecting'] = createV2Task('task-v2-collecting', convIds.collecting, {
    status: 'collecting',
    title: '安排项目复盘会',
    goal: '创建项目复盘会议并通知参会人',
    type: 'create-meeting',
    slots: { title: '项目复盘会', dateText: '明天', resolvedDate: dynamicDateOffset(1) },
    missingSlots: ['startTime', 'endTime', 'attendeeNames'],
    nextAction: '还需补充会议时间与参会人',
    createdAt: t(0),
    updatedAt: t(5),
    events: [{
      id: 'task-v2-collecting-evt-1', taskId: 'task-v2-collecting', type: 'parameter-updated',
      label: '识别到会议日期为明天', status: 'collecting', device: 'pc-client', createdAt: t(1),
    }],
  });
  state.users[DEMO_OWNER_ID].conversationIds.push(convIds.collecting);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-collecting');

  // 2. 待确认：发送本周项目周报（参数齐全）——详情 demo 也复用该任务 ID task-v2-confirm
  const m2 = createMessage(makeId('msg', 201), convIds.confirm, 'user', 'text', '生成本周项目周报并发给张飞');
  state.messages[m2.id] = m2;
  state.conversations[convIds.confirm] = createConversation(convIds.confirm, '本周项目周报', [m2.id], { activeTaskId: 'task-v2-confirm' });
  state.tasks['task-v2-confirm'] = createV2Task('task-v2-confirm', convIds.confirm, {
    status: 'awaiting-confirmation',
    title: '发送本周项目周报',
    goal: '汇总本周进展生成周报并发送给张飞',
    type: 'generate-report',
    parameters: [
      { key: 'reportType', label: '报告类型', value: '项目周报', required: true, confirmed: true },
      { key: 'period', label: '统计周期', value: '本周（周一至周五）', required: true, confirmed: true },
      { key: 'receiver', label: '发送对象', value: '张飞', required: true, confirmed: true },
    ],
    nextAction: '等待确认后生成并发送',
    createdAt: t(10),
    updatedAt: t(15),
    events: [{
      id: 'task-v2-confirm-evt-1', taskId: 'task-v2-confirm', type: 'parameter-updated',
      label: '参数收集完成', status: 'awaiting-confirmation', device: 'pc-client', createdAt: t(14),
    }],
  });
  state.users[DEMO_OWNER_ID].conversationIds.push(convIds.confirm);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-confirm');

  // 3. 中断：准备季度经营分析 PPT
  const m3 = createMessage(makeId('msg', 202), convIds.interrupted, 'user', 'text', '做一份季度经营分析PPT');
  state.messages[m3.id] = m3;
  state.conversations[convIds.interrupted] = createConversation(convIds.interrupted, '季度经营分析PPT', [m3.id], { activeTaskId: 'task-v2-interrupted' });
  state.tasks['task-v2-interrupted'] = createV2Task('task-v2-interrupted', convIds.interrupted, {
    status: 'interrupted',
    title: '准备季度经营分析 PPT',
    goal: '生成 Q3 经营分析演示文稿',
    type: 'prepare-presentation',
    parameters: [
      { key: 'topic', label: '主题', value: 'Q3 经营分析', required: true, confirmed: true },
      { key: 'audience', label: '受众', value: '管理层', required: true, confirmed: true },
      { key: 'pageCount', label: '页数', value: '', required: true, confirmed: false },
    ],
    nextAction: '可恢复：继续补充页数要求',
    createdAt: dynamicIso(1, 14),
    updatedAt: dynamicIso(1, 15),
    events: [{
      id: 'task-v2-interrupted-evt-1', taskId: 'task-v2-interrupted', type: 'interrupted',
      label: '用户切换话题，任务暂停', status: 'interrupted', device: 'pc-web', createdAt: dynamicIso(1, 15),
    }],
  });
  state.users[DEMO_OWNER_ID].conversationIds.push(convIds.interrupted);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-interrupted');

  // 4. 执行中：起草制度通知
  const m4 = createMessage(makeId('msg', 203), convIds.executing, 'user', 'text', '起草考勤制度修订通知');
  state.messages[m4.id] = m4;
  state.conversations[convIds.executing] = createConversation(convIds.executing, '考勤制度修订通知', [m4.id], { activeTaskId: 'task-v2-executing' });
  state.tasks['task-v2-executing'] = createV2Task('task-v2-executing', convIds.executing, {
    status: 'executing',
    title: '起草制度通知',
    goal: '生成考勤制度修订通知初稿',
    type: 'draft-document',
    parameters: [
      { key: 'docType', label: '公文类型', value: '通知', required: true, confirmed: true },
      { key: 'topic', label: '主题', value: '考勤制度修订', required: true, confirmed: true },
    ],
    nextAction: '正在生成，请稍候',
    createdAt: t(20),
    updatedAt: t(22),
    events: [{
      id: 'task-v2-executing-evt-1', taskId: 'task-v2-executing', type: 'executing',
      label: '开始生成通知草稿', status: 'executing', device: 'pc-client', createdAt: t(22),
    }],
  });
  state.users[DEMO_OWNER_ID].conversationIds.push(convIds.executing);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-executing');

  // 5. 失败：创建跨部门会议
  const m5 = createMessage(makeId('msg', 204), convIds.failed, 'user', 'text', '创建跨部门协调会');
  state.messages[m5.id] = m5;
  state.conversations[convIds.failed] = createConversation(convIds.failed, '跨部门协调会', [m5.id], { activeTaskId: 'task-v2-failed' });
  state.tasks['task-v2-failed'] = createV2Task('task-v2-failed', convIds.failed, {
    status: 'failed',
    title: '创建跨部门会议',
    goal: '邀请市场部与研发部参加协调会',
    type: 'create-meeting',
    slots: {
      title: '跨部门协调会',
      dateText: '今天',
      resolvedDate: dynamicDateOffset(0),
      startTime: '15:00',
      endTime: '16:00',
      attendeeNames: ['张飞', '赵云'],
      location: '3 号会议室',
    },
    missingSlots: [],
    failureReason: '会议室 3 号厅该时段已被占用',
    nextAction: '可重试或修改会议室后重试',
    createdAt: t(30),
    updatedAt: t(35),
    events: [{
      id: 'task-v2-failed-evt-1', taskId: 'task-v2-failed', type: 'failed',
      label: '会议室占用导致创建失败', status: 'failed', device: 'pc-client', createdAt: t(35),
    }],
  });
  state.users[DEMO_OWNER_ID].conversationIds.push(convIds.failed);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-failed');

  // 6. 已完成：生成客户沟通汇报（关联成果）
  const resultId = 'res-v2-completed';
  const convCompleted = convIds.completed;
  const m6 = createMessage(makeId('msg', 205), convCompleted, 'user', 'text', '整理客户沟通要点汇报');
  state.messages[m6.id] = m6;
  state.conversations[convCompleted] = createConversation(convCompleted, '客户沟通汇报', [m6.id], { lastCapabilityId: 'advisor' });
  state.results[resultId] = {
    id: resultId,
    ownerId: DEMO_OWNER_ID,
    conversationId: convCompleted,
    type: 'report',
    title: '客户沟通汇报',
    capabilityId: 'advisor',
    status: 'completed',
    workbenchHref: `/pc_client/ruyi-zone/advisor?sourceConversationId=${convCompleted}`,
    createdAt: dynamicIso(2, 16),
    updatedAt: dynamicIso(2, 16),
    taskId: 'task-v2-completed',
  };
  state.tasks['task-v2-completed'] = createV2Task('task-v2-completed', convCompleted, {
    status: 'completed',
    title: '生成客户沟通汇报',
    goal: '汇总客户沟通要点形成汇报',
    type: 'generate-report',
    parameters: [
      { key: 'reportType', label: '报告类型', value: '客户沟通汇报', required: true, confirmed: true },
      { key: 'receiver', label: '发送对象', value: '诸葛亮', required: true, confirmed: true },
    ],
    nextAction: '已完成，可打开成果或再次处理',
    resultIds: [resultId],
    createdAt: dynamicIso(2, 15),
    updatedAt: dynamicIso(2, 16),
    events: [{
      id: 'task-v2-completed-evt-1', taskId: 'task-v2-completed', type: 'completed',
      label: '汇报已生成', status: 'completed', device: 'pc-web', createdAt: dynamicIso(2, 16),
    }],
  });
  state.users[DEMO_OWNER_ID].conversationIds.push(convCompleted);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-completed');
  state.users[DEMO_OWNER_ID].resultIds.push(resultId);

  // 7. 已取消：整理会议纪要（只在"全部"出现）
  const convCancelled = convIds.cancelled;
  const m7 = createMessage(makeId('msg', 206), convCancelled, 'user', 'text', '帮我整理会议纪要');
  state.messages[m7.id] = m7;
  state.conversations[convCancelled] = createConversation(convCancelled, '会议纪要整理', [m7.id]);
  state.tasks['task-v2-cancelled'] = createV2Task('task-v2-cancelled', convCancelled, {
    status: 'cancelled',
    title: '整理会议纪要',
    goal: '根据录音整理会议纪要',
    type: 'draft-document',
    createdAt: dynamicIso(3, 11),
    updatedAt: dynamicIso(3, 12),
    events: [{
      id: 'task-v2-cancelled-evt-1', taskId: 'task-v2-cancelled', type: 'cancelled',
      label: '用户取消任务', status: 'cancelled', device: 'pc-client', createdAt: dynamicIso(3, 12),
    }],
  });
  state.users[DEMO_OWNER_ID].conversationIds.push(convCancelled);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-cancelled');

  return state;
}

/** v2-task-detail：聚焦待确认任务的详情操作演示（复用 task-v2-confirm） */
function buildV2TaskDetailState(): RuyiPrototypeState {
  return buildV2TaskCenterState();
}

/** v2-multi-task：同会话两个可继续任务，输入"继续刚才的任务"触发选择 */
function buildV2MultiTaskState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'v2-multi-task';
  const convId = 'conv-v2-multi';

  const m1 = createMessage(makeId('msg', 210), convId, 'user', 'text', '帮我创建明天的部门例会');
  const m2 = createMessage(makeId('msg', 211), convId, 'assistant', 'text', '好的，已识别会议日期为明天。请问会议开始时间是几点？', { taskId: 'task-v2-multi-meeting' });
  const m3 = createMessage(makeId('msg', 212), convId, 'user', 'text', '顺便生成上周的工作总结');
  const m4 = createMessage(makeId('msg', 213), convId, 'assistant', 'text', '好的，我来帮您整理工作总结。请补充重点关注的项目。', { taskId: 'task-v2-multi-report' });
  [m1, m2, m3, m4].forEach((m) => { state.messages[m.id] = m; });

  state.conversations[convId] = createConversation(convId, '多任务演示会话', [m1.id, m2.id, m3.id, m4.id], {
    activeTaskId: 'task-v2-multi-report',
  });

  state.tasks['task-v2-multi-meeting'] = createV2Task('task-v2-multi-meeting', convId, {
    status: 'collecting',
    title: '创建部门例会',
    goal: '创建明天部门例会并通知团队',
    type: 'create-meeting',
    slots: { title: '部门例会', dateText: '明天', resolvedDate: dynamicDateOffset(1) },
    missingSlots: ['startTime', 'endTime', 'attendeeNames'],
    nextAction: '还需补充会议时间',
    createdAt: dynamicIso(0, 9),
    updatedAt: dynamicIso(0, 9, 20),
  });
  state.tasks['task-v2-multi-report'] = createV2Task('task-v2-multi-report', convId, {
    status: 'collecting',
    title: '生成工作总结',
    goal: '整理上周工作形成总结',
    type: 'generate-report',
    parameters: [
      { key: 'period', label: '统计周期', value: '上周', required: true, confirmed: true },
      { key: 'focus', label: '重点项目', value: '', required: true, confirmed: false },
    ],
    nextAction: '还需补充重点项目',
    createdAt: dynamicIso(0, 9, 25),
    updatedAt: dynamicIso(0, 9, 40),
  });

  state.users[DEMO_OWNER_ID].conversationIds.push(convId);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-multi-meeting', 'task-v2-multi-report');
  return state;
}

/** v2-cross-day-resume：相对日期任务跨日恢复需重新确认 */
function buildV2CrossDayResumeState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'v2-cross-day-resume';
  const convId = 'conv-v2-cross-day';

  const m1 = createMessage(makeId('msg', 220), convId, 'user', 'text', '帮我创建明天的复盘会');
  const m2 = createMessage(makeId('msg', 221), convId, 'assistant', 'text', '已识别日期为明天。请问开始时间？', { taskId: 'task-v2-cross-day' });
  const m3 = createMessage(makeId('msg', 222), convId, 'user', 'text', '上午10点，叫上张飞');
  const m4 = createMessage(makeId('msg', 223), convId, 'system', 'resume-task', '任务已暂停（会话隔日恢复），继续前需重新确认日期。', { taskId: 'task-v2-cross-day' });
  [m1, m2, m3, m4].forEach((m) => { state.messages[m.id] = m; });

  state.conversations[convId] = createConversation(convId, '跨日恢复演示', [m1.id, m2.id, m3.id, m4.id], {
    activeTaskId: 'task-v2-cross-day',
  });

  state.tasks['task-v2-cross-day'] = createV2Task('task-v2-cross-day', convId, {
    status: 'interrupted',
    title: '创建复盘会',
    goal: '创建复盘会议（含相对日期）',
    type: 'create-meeting',
    slots: {
      title: '复盘会',
      dateText: '明天',
      // 注意：fixture 中 resolvedDate 是"昨天视角的明天"——恢复时已过期，必须重新确认
      resolvedDate: dynamicDateOffset(-1),
      startTime: '10:00',
      endTime: '11:00',
      attendeeNames: ['张飞'],
    },
    missingSlots: [],
    nextAction: '跨日恢复：请重新确认"明天"对应的实际日期',
    // 相对日期在两天前确认——与当前不同自然日
    relativeDateConfirmedAt: dynamicIso(2, 9),
    createdAt: dynamicIso(2, 9),
    updatedAt: dynamicIso(2, 9, 30),
  });

  state.users[DEMO_OWNER_ID].conversationIds.push(convId);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-cross-day');
  return state;
}

/** v2-result-center：成果索引状态全覆盖 */
function buildV2ResultCenterState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'v2-result-center';

  const convAlive = 'conv-v2-res-alive';
  const convDeleted = 'conv-v2-res-deleted';
  const mAlive = createMessage(makeId('msg', 230), convAlive, 'user', 'text', '帮我写一份立项申请公文');
  state.messages[mAlive.id] = mAlive;
  state.conversations[convAlive] = createConversation(convAlive, '立项申请公文', [mAlive.id], { lastCapabilityId: 'document' });

  const results: RuyiResultReference[] = [
    {
      id: 'res-v2-doc-editable',
      ownerId: DEMO_OWNER_ID,
      conversationId: convAlive,
      type: 'document',
      title: '智能平台立项申请',
      capabilityId: 'document',
      status: 'editable',
      workbenchHref: `/pc_client/ruyi-zone/document?sourceConversationId=${convAlive}`,
      createdAt: dynamicIso(1, 10),
      updatedAt: dynamicIso(1, 11),
      taskId: 'task-v2-res-doc',
    },
    {
      id: 'res-v2-ppt-completed',
      ownerId: DEMO_OWNER_ID,
      conversationId: convAlive,
      type: 'presentation',
      title: '产品发布演示文稿',
      capabilityId: 'presentation',
      status: 'completed',
      workbenchHref: `/pc_client/ruyi-zone/presentation?sourceConversationId=${convAlive}`,
      createdAt: dynamicIso(3, 15),
      updatedAt: dynamicIso(3, 16),
    },
    {
      id: 'res-v2-report-invalid',
      ownerId: DEMO_OWNER_ID,
      conversationId: null,
      type: 'report',
      title: '月度经营分析报告',
      capabilityId: 'advisor',
      status: 'invalid',
      workbenchHref: `/pc_client/ruyi-zone/advisor`,
      createdAt: dynamicIso(10, 14),
      updatedAt: dynamicIso(8, 9),
      statusReason: '源文件已删除',
    },
    {
      id: 'res-v2-doc-forbidden',
      ownerId: DEMO_OWNER_ID,
      conversationId: null,
      type: 'document',
      // F2 测试敏感标题：UI 必须脱敏为"受限成果"，DOM 不得出现该字符串
      title: '薪酬调整方案（敏感测试）',
      capabilityId: 'document',
      status: 'forbidden',
      // F2 测试敏感路径：DOM 的 href 不得出现 restricted=salary-plan
      workbenchHref: '/pc_client/ruyi-zone/document?restricted=salary-plan',
      createdAt: dynamicIso(5, 10),
      statusReason: '涉密文档，仅限 HR 目录内可见',
      taskId: 'task-v2-res-doc',
    },
    {
      id: 'res-v2-source-deleted',
      ownerId: DEMO_OWNER_ID,
      // 来源会话已删除：conversationId 置 null，sourceDeleted 标记
      conversationId: null,
      type: 'translation',
      title: '产品手册英文译稿',
      capabilityId: 'translation',
      status: 'editable',
      workbenchHref: `/pc_client/ruyi-zone/document`,
      createdAt: dynamicIso(6, 13),
      updatedAt: dynamicIso(6, 14),
      sourceDeleted: true,
    },
  ];

  results.forEach((r) => {
    state.results[r.id] = r;
    state.users[DEMO_OWNER_ID].resultIds.push(r.id);
  });
  // 保留被删除会话的痕迹：不创建 convDeleted 会话实体，只通过 sourceDeleted 标记

  // 关联任务（res-v2-doc-editable 的任务；F2：同时挂 forbidden 成果验证任务详情脱敏）
  state.tasks['task-v2-res-doc'] = createV2Task('task-v2-res-doc', convAlive, {
    status: 'completed',
    title: '起草立项申请公文',
    goal: '生成智能平台立项申请初稿',
    type: 'draft-document',
    resultIds: ['res-v2-doc-editable', 'res-v2-doc-forbidden'],
    createdAt: dynamicIso(1, 9),
    updatedAt: dynamicIso(1, 11),
  });
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-res-doc');
  state.users[DEMO_OWNER_ID].conversationIds.push(convAlive);
  void convDeleted;
  return state;
}

/** v2-cross-device：跨端状态与业务上下文演示 */
function buildV2CrossDeviceState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'v2-cross-device';
  const convId = 'conv-v2-cross-device';
  const ctxId = 'ctx-v2-calendar';

  const m1 = createMessage(makeId('msg', 240), convId, 'user', 'text', '基于产品复盘会帮我准备汇报');
  const m2 = createMessage(makeId('msg', 241), convId, 'assistant', 'text', '已关联日历事件「产品复盘会」，可基于会议内容准备汇报。', { taskId: 'task-v2-cross-device' });
  const m3 = createMessage(makeId('msg', 242), convId, 'system', 'system', '（模拟）在 App 补充了参会人字段。');
  [m1, m2, m3].forEach((m) => { state.messages[m.id] = m; });

  const contextRef: RuyiContextReference = {
    id: ctxId,
    ownerId: DEMO_OWNER_ID,
    type: 'calendar',
    title: '产品复盘会',
    summary: '11 月 10 日 10:00-11:30 · 3 号会议室 · 8 人参加',
    sourceRoute: '/pc_client/calendar?event=product-review',
    createdAt: dynamicIso(0, 8, 30),
  };
  state.contextReferences[ctxId] = contextRef;

  state.conversations[convId] = createConversation(convId, '产品复盘汇报准备', [m1.id, m2.id, m3.id], {
    activeTaskId: 'task-v2-cross-device',
    contextReferenceId: ctxId,
  });

  state.tasks['task-v2-cross-device'] = createV2Task('task-v2-cross-device', convId, {
    status: 'awaiting-confirmation',
    title: '准备产品复盘汇报',
    goal: '基于产品复盘会内容生成汇报材料',
    type: 'prepare-presentation',
    parameters: [
      { key: 'topic', label: '主题', value: '产品复盘汇报', required: true, confirmed: true },
      { key: 'attendees', label: '参会人', value: '张飞、赵云、马超', required: true, confirmed: true },
      { key: 'pageCount', label: '页数', value: '8-12页', required: true, confirmed: true },
    ],
    source: { entry: 'business-context', label: '日历 · 产品复盘会详情页', device: 'app' },
    lastOperatedDevice: 'pc-web',
    nextAction: '等待确认后生成汇报大纲',
    contextReferenceId: ctxId,
    createdAt: dynamicIso(0, 8, 30),
    updatedAt: dynamicIso(0, 9, 50),
    events: [
      { id: 'task-v2-cross-device-evt-1', taskId: 'task-v2-cross-device', type: 'context-attached', label: '引用业务对象「产品复盘会」', status: 'collecting', device: 'app', createdAt: dynamicIso(0, 8, 35) },
      { id: 'task-v2-cross-device-evt-2', taskId: 'task-v2-cross-device', type: 'parameter-updated', label: '在 App 补充参会人（模拟）', status: 'collecting', device: 'app', createdAt: dynamicIso(0, 9, 20) },
      { id: 'task-v2-cross-device-evt-3', taskId: 'task-v2-cross-device', type: 'parameter-updated', label: '在 PC Web 确认页数要求', status: 'awaiting-confirmation', device: 'pc-web', createdAt: dynamicIso(0, 9, 50) },
    ],
  });

  state.users[DEMO_OWNER_ID].conversationIds.push(convId);
  state.users[DEMO_OWNER_ID].taskIds.push('task-v2-cross-device');
  return state;
}

/** v2-conversation-filter：搜索/筛选演示（含任务与成果关联的会话） */
function buildV2ConversationFilterState(): RuyiPrototypeState {
  const state = buildV2TaskCenterState();
  state.demoScenarioId = 'v2-conversation-filter';
  // buildV2TaskCenterState 已含：带任务会话（7 个）+ 成果会话（conv-v2-completed）
  return state;
}

/** v2-task-empty：任务空状态 */
function buildV2TaskEmptyState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'v2-task-empty';
  return state;
}

/** v2-result-empty：成果空状态 */
function buildV2ResultEmptyState(): RuyiPrototypeState {
  const state = buildDefaultState();
  state.demoScenarioId = 'v2-result-empty';
  return state;
}

/** v2-task-error：任务中心错误状态（点击"重新加载模拟数据"后进入正常确定性列表） */
function buildV2TaskErrorState(): RuyiPrototypeState {
  const state = buildV2TaskCenterState();
  state.demoScenarioId = 'v2-task-error';
  return state;
}

const scenarioBuilders: Record<RuyiDemoScenarioId, () => RuyiPrototypeState> = {
  'first-use': buildFirstUseState,
  default: buildDefaultState,
  'conversation-management': buildConversationManagementState,
  'capability-states': buildCapabilityStatesState,
  'task-poc': buildTaskPocState,
  'result-states': buildResultStatesState,
  'failure-states': buildFailureStatesState,
  'user-isolation': buildUserIsolationState,
  'v2-task-center': buildV2TaskCenterState,
  'v2-task-detail': buildV2TaskDetailState,
  'v2-multi-task': buildV2MultiTaskState,
  'v2-cross-day-resume': buildV2CrossDayResumeState,
  'v2-result-center': buildV2ResultCenterState,
  'v2-cross-device': buildV2CrossDeviceState,
  'v2-conversation-filter': buildV2ConversationFilterState,
  'v2-task-empty': buildV2TaskEmptyState,
  'v2-result-empty': buildV2ResultEmptyState,
  'v2-task-error': buildV2TaskErrorState,
};

export function loadRuyiDemoScenario(scenarioId: string): RuyiPrototypeState | null {
  if (!ruyiDemoScenarioIds.includes(scenarioId as RuyiDemoScenarioId)) {
    return null;
  }
  return scenarioBuilders[scenarioId as RuyiDemoScenarioId]();
}

export { FIXED_SYSTEM_CONVERSATION_ID, DEMO_OWNER_ID };
