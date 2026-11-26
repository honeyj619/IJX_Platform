/**
 * 如意助手与如意空间统一状态层
 * 使用 Zustand persist 持久化，按 ownerId 分区。
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  RuyiCapabilitySubmission,
  RuyiContextReference,
  RuyiConversation,
  RuyiMessage,
  RuyiPrototypeState,
  RuyiResultReference,
  RuyiTaskEvent,
  RuyiTaskMock,
  RuyiTaskStatus,
  RuyiUserState,
  RuyiWorkbenchLaunchContext,
} from '../types/ruyi';
import { ruyiCapabilities } from '../data/ruyiCapabilities';
import { loadRuyiDemoScenario, FIXED_SYSTEM_CONVERSATION_ID } from '../data/ruyiDemoScenarios';
import { buildRuyiShowcaseSeed, ruyiShowcaseDefinitions } from '../data/ruyiShowcaseConversations';
import { MAIN_USER_NAME } from '../data/people';
import { generateTitleFromText, generateWorkbenchResultMessage } from '../services/ruyiMockRuntime';
import { formatSubmissionParams } from '../data/ruyiToolPanel';

/** V3：能力提交摘要（助手确认消息正文用，与 RuyiCapabilitySummary 组件同源） */
function formatSubmissionSummary(submission: RuyiCapabilitySubmission): string {
  const params = formatSubmissionParams(submission.capabilityId, submission.confirmedParams);
  const lines: string[] = [];
  if (params.length > 0) {
    lines.push(`参数摘要：${params.map((p) => `${p.label}=${p.value}`).join('；')}`);
  }
  if (submission.attachments.length > 0) {
    lines.push(`附件：${submission.attachments.join('、')}`);
  }
  return lines.join('\n');
}

const STORAGE_KEY = 'ijx-ruyi-prototype-v1';

/** V4：插件工具集合（工具锁定规则的判定范围） */
const TOOL_CAPABILITY_IDS: ReadonlySet<string> = new Set(['document', 'presentation', 'advisor', 'translation']);

/** V4：会话已使用的插件工具（存在结构化能力提交即视为已使用；返回首个命中的工具） */
function getConversationLockedToolFrom(state: RuyiPrototypeState, conversationId: string): RuyiConversation['activeCapabilityId'] {
  const conversation = state.conversations[conversationId];
  if (!conversation) return null;
  for (const mid of conversation.messageIds) {
    const message = state.messages[mid];
    const submission = message?.capabilitySubmission;
    if (submission && TOOL_CAPABILITY_IDS.has(submission.capabilityId)) {
      return submission.capabilityId;
    }
  }
  return null;
}
// demo 进入前的持久化快照（内存持有，退出恢复）
const demoSnapshotRef = { current: null as string | null };
/** demo 内存模式开关：true 时持久化层完全跳过写入（读写均不落 localStorage）；模块加载时按 URL ?demo= 预判，确保 rehydrate 期间也已拦截 */
const demoMemoryMode = { enabled: typeof window !== 'undefined' && /[?&]demo=/.test(window.location.search) };

/**
 * 自定义持久化 storage：
 * - 正常模式读写 localStorage；
 * - demo 模式跳过 setItem/removeItem（partialize 返回 null 仍会写 {"state":null}，必须从 storage 层拦截）；
 * - demo 模式下 getItem 返回 null：进入 demo 后再刷新，rehydrate 不得用旧持久化覆盖 demo fixture。
 */
const demoAwareStorage = {
  getItem: (name: string) => {
    if (demoMemoryMode.enabled) return null; // demo 态：内存 fixture 为准，不读旧持久化
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (demoMemoryMode.enabled) return; // demo 态：禁止任何写入
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (demoMemoryMode.enabled) return;
    localStorage.removeItem(name);
  },
};
const SCHEMA_VERSION = 4;

export const RUYI_MAIN_OWNER_ID = MAIN_USER_NAME;



function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function createUserState(ownerId: string): RuyiUserState {
  return {
    ownerId,
    conversationIds: [FIXED_SYSTEM_CONVERSATION_ID],
    resultIds: [],
    taskIds: [],
    initializedAt: new Date().toISOString(),
  };
}

/** V3.4：showcase 预置对话版本（内容升级时 +1 触发保留式重合并） */
const SHOWCASE_SEED_VERSION = 1;

function createInitialState(): RuyiPrototypeState {
  // V3.4：默认状态即能力直展示——固定 IM 会话含综合对话 + 空间 13 场景预置会话
  const seed = buildRuyiShowcaseSeed(RUYI_MAIN_OWNER_ID, FIXED_SYSTEM_CONVERSATION_ID);
  return {
    schemaVersion: SCHEMA_VERSION,
    currentOwnerId: RUYI_MAIN_OWNER_ID,
    users: {
      [RUYI_MAIN_OWNER_ID]: {
        ownerId: RUYI_MAIN_OWNER_ID,
        conversationIds: seed.conversationIds,
        resultIds: seed.resultIds,
        taskIds: seed.taskIds,
        initializedAt: new Date().toISOString(),
      },
    },
    conversations: seed.conversations,
    messages: seed.messages,
    results: seed.results,
    tasks: seed.tasks,
    workbenchContexts: {},
    contextReferences: seed.contextReferences,
    demoScenarioId: null,
    showcaseSeedVersion: SHOWCASE_SEED_VERSION,
  };
}

/**
 * V3.4 保留式 showcase 合并（rehydrate 后调用）：
 * - 旧 localStorage（空固定会话/仅欢迎语/已有用户数据）升级为默认能力直展示
 * - 已存在相同稳定 ID 的预置数据不重复添加；用户自建会话/消息/任务/成果全部保留
 * - 固定会话只有旧欢迎语时删除欢迎语写入综合对话；已有用户真实操作时预置示例置前只合并一次
 * - 用户删除的预置会话不复活（通过 showcaseSeedVersion 门控：仅版本升级才重新合并）
 */
function mergeRuyiShowcaseSeed(state: RuyiStore): void {
  if (state.demoMode) return;
  // 门控用独立标记 key（与主 store 解耦）：migrate 自动落盘会把 initial 泄漏的
  // showcaseSeedVersion 写进主 key，主 key 内版本不可信；独立标记只在合并成功后写入。
  const SEED_FLAG_KEY = 'ijx-ruyi-showcase-seed-v1';
  try {
    if (Number(localStorage.getItem(SEED_FLAG_KEY) ?? 0) === SHOWCASE_SEED_VERSION) return;
  } catch {
    // 读取失败按未合并处理
  }

  const seed = buildRuyiShowcaseSeed(state.currentOwnerId ?? RUYI_MAIN_OWNER_ID, FIXED_SYSTEM_CONVERSATION_ID);
  const conversations = { ...state.conversations };
  const messages = { ...state.messages };
  const tasks = { ...state.tasks };
  const results = { ...state.results };
  const users = { ...state.users };
  const owner = users[state.currentOwnerId ?? RUYI_MAIN_OWNER_ID];

  // 固定 IM 会话：旧欢迎语替换 / 用户已有记录时预置置前
  const fixedConv = conversations[FIXED_SYSTEM_CONVERSATION_ID];
  const seedFixed = seed.conversations[FIXED_SYSTEM_CONVERSATION_ID];
  if (!fixedConv) {
    conversations[FIXED_SYSTEM_CONVERSATION_ID] = seedFixed;
  } else {
    const isOnlyOldWelcome =
      fixedConv.messageIds.length <= 1 &&
      fixedConv.messageIds.every((id) => messages[id]?.content?.includes('您好！我是如意助手'));
    if (isOnlyOldWelcome) {
      // 删除旧欢迎语，写入综合对话
      fixedConv.messageIds.forEach((id) => { delete messages[id]; });
      conversations[FIXED_SYSTEM_CONVERSATION_ID] = { ...seedFixed, updatedAt: fixedConv.updatedAt };
    } else if (!fixedConv.messageIds.some((id) => id.startsWith('showcase-im-'))) {
      // 用户已有真实记录：预置示例置前（只合并一次；seedVersion 门控）
      const preIds = seedFixed.messageIds.filter((id) => !messages[id]);
      seedFixed.messageIds.forEach((id) => { if (!messages[id]) messages[id] = seed.messages[id]; });
      conversations[FIXED_SYSTEM_CONVERSATION_ID] = { ...fixedConv, messageIds: [...preIds, ...fixedConv.messageIds] };
    }
  }

  // 空间预置场景：追加缺失项（用户删除的不复活——只补从未存在过的 ID；被用户删除的会话不在 state.conversations，
  // 但我们不追踪"删过哪些"，因此只在 showcaseSeedVersion 升级时全量补缺：用户当前数据不含该 ID 即视为需要补入。
  // 若产品要求"删除后永不复活"，可将 SHOWCASE_SEED_VERSION 保持不变并在删除时记录 tombstone——原型阶段以版本门控为准）
  ruyiShowcaseDefinitions.forEach((def) => {
    if (conversations[def.id]) return;
    const bundle = def.build(state.currentOwnerId ?? RUYI_MAIN_OWNER_ID);
    conversations[def.id] = bundle.conversation;
    bundle.messages.forEach((m) => { if (!messages[m.id]) messages[m.id] = m; });
    (bundle.tasks ?? []).forEach((t) => { if (!tasks[t.id]) tasks[t.id] = t; });
    (bundle.results ?? []).forEach((r) => { if (!results[r.id]) results[r.id] = r; });
  });

  // 预置消息/任务/成果实体补齐（固定会话分支可能只补了 conversation）
  Object.entries(seed.messages).forEach(([id, m]) => { if (!messages[id]) messages[id] = m; });
  Object.entries(seed.tasks).forEach(([id, t]) => { if (!tasks[id]) tasks[id] = t; });
  Object.entries(seed.results).forEach(([id, r]) => { if (!results[id]) results[id] = r; });

  // 用户索引补缺（固定会话 + 未收录场景；不覆盖用户新建顺序——追加在尾部）
  if (owner) {
    const convIds = [...owner.conversationIds];
    seed.conversationIds.forEach((id) => { if (!convIds.includes(id)) convIds.push(id); });
    const taskIds = [...owner.taskIds];
    seed.taskIds.forEach((id) => { if (!taskIds.includes(id)) taskIds.push(id); });
    const resultIds = [...owner.resultIds];
    seed.resultIds.forEach((id) => { if (!resultIds.includes(id)) resultIds.push(id); });
    users[owner.ownerId] = { ...owner, conversationIds: convIds, taskIds, resultIds };
  }

  useRuyiStore.setState({
    conversations,
    messages,
    tasks,
    results,
    users,
    showcaseSeedVersion: SHOWCASE_SEED_VERSION,
  });
  // 独立标记：合并成功后写入（主 key 版本会被 migrate 泄漏污染，不作门控）
  try {
    localStorage.setItem('ijx-ruyi-showcase-seed-v1', String(SHOWCASE_SEED_VERSION));
  } catch {
    // 标记写失败：下次刷新重跑幂等合并，无害
  }
}

interface RuyiStoreActions {
  initializeUser: (ownerId: string) => void;
  createConversation: (ownerId?: string) => RuyiConversation;
  renameConversation: (conversationId: string, title: string) => boolean;
  deleteConversation: (conversationId: string) => void;
  selectCapability: (conversationId: string, capabilityId: RuyiConversation['activeCapabilityId']) => void;
  /** V4：会话已使用插件工具时返回该工具 capabilityId（工具锁定），纯对话会话返回 null */
  getConversationLockedTool: (conversationId: string) => RuyiConversation['activeCapabilityId'];
  sendUserMessage: (conversationId: string, content: string) => RuyiMessage;
  /** V3：统一能力提交（写用户消息+结构化提交+助手确认/结果+工作台上下文，返回用户消息与上下文供跳转） */
  submitCapability: (
    conversationId: string,
    submission: RuyiCapabilitySubmission,
  ) => { userMessage: RuyiMessage; assistantMessage: RuyiMessage; workbenchContext: RuyiWorkbenchLaunchContext | null };
  appendAssistantMessage: (message: RuyiMessage) => void;
  updateMessage: (message: RuyiMessage) => void;
  startMeetingTask: (conversationId: string, initialText: string) => RuyiTaskMock | null;
  updateMeetingTask: (taskId: string, patch: Partial<RuyiTaskMock>) => void;
  interruptTask: (taskId: string) => void;
  resumeTask: (taskId: string) => void;
  confirmTask: (taskId: string) => void;
  cancelTask: (taskId: string) => void;
  failTask: (taskId: string, reason: string) => void;
  completeTask: (taskId: string, resultHref?: string) => void;
  createResult: (reference: Omit<RuyiResultReference, 'id' | 'createdAt'>) => RuyiResultReference;
  /** 生成并保存工作台启动上下文（按来源会话+能力持久化，供工作台带入需求）
   *  V3：sourceMessageId 可选——传入时优先读取该消息的 capabilitySubmission（含参数/附件），
   *  修复"只读最后一条文字消息"导致多条提交互相覆盖的问题 */
  saveWorkbenchLaunchContext: (
    sourceConversationId: string,
    capabilityId: RuyiWorkbenchLaunchContext['capabilityId'],
    sourceMessageId?: string,
  ) => RuyiWorkbenchLaunchContext | null;
  getWorkbenchLaunchContext: (sourceConversationId: string, capabilityId: RuyiWorkbenchLaunchContext['capabilityId']) => RuyiWorkbenchLaunchContext | null;
  /** 刷新恢复：将持久化的 executing 任务转为可重试状态并提示中断，避免永久 loading */
  recoverInterruptedExecutions: () => void;
  recordWorkbenchResult: (
    sourceConversationId: string,
    result: Omit<RuyiResultReference, 'id' | 'conversationId' | 'ownerId' | 'createdAt'>,
  ) => RuyiResultReference;
  resetUserPrototype: (ownerId?: string) => void;
  loadDemoScenario: (scenarioId: string) => boolean;
  exitDemoScenario: () => boolean;
  applyDemoScenario: (scenarioId: string) => boolean;
  /** 切换当前演示用户（仅 user-isolation demo 使用）：owner 必须存在，不复制/不修改任何用户数据 */
  setCurrentOwner: (ownerId: string) => boolean;
  getConversationMessages: (conversationId: string) => RuyiMessage[];
  getOwnerConversations: (ownerId?: string) => RuyiConversation[];
  getConversationById: (conversationId: string) => RuyiConversation | undefined;
  getResultById: (resultId: string) => RuyiResultReference | undefined;
  getTaskById: (taskId: string) => RuyiTaskMock | undefined;
  getActiveTask: (conversationId: string) => RuyiTaskMock | undefined;
  /* ---- V2 任务中心/成果中心/上下文 ---- */
  /** 当前用户任务列表（按 updatedAt 倒序；filter 可选） */
  getOwnerTasks: (ownerId?: string, filter?: { status?: RuyiTaskStatus[]; conversationId?: string }) => RuyiTaskMock[];
  /** 会话内可继续任务（collecting/interrupted/awaiting-confirmation/failed） */
  getConversationPendingTasks: (conversationId: string) => RuyiTaskMock[];
  /** 当前用户成果列表（按 createdAt 倒序） */
  getOwnerResults: (ownerId?: string, filter?: { type?: string; status?: string }) => RuyiResultReference[];
  /** V4：删除成果（软删，status→deleted；成果中心"已删除"筛选可见） */
  deleteResult: (resultId: string) => void;
  /** 追加任务状态事件 */
  appendTaskEvent: (taskId: string, event: Pick<RuyiTaskEvent, 'type' | 'label' | 'status'> & { device?: RuyiTaskEvent['device'] }) => void;
  /** 多任务歧义选择后恢复指定任务：写事件 + 设 activeTaskId，消息由调用方追加 */
  selectTaskToResume: (conversationId: string, taskId: string) => boolean;
  /** 失败重试：仅 failed 可进入执行流程（防连续点击重复提交） */
  retryTask: (taskId: string) => boolean;
  /** 已完成任务"再次处理"：创建新任务（复制目标与参数），原任务保持 completed */
  createFollowUpTask: (taskId: string) => RuyiTaskMock | null;
  /** 绑定业务上下文到会话（同时挂到该会话活动任务并追加事件） */
  attachContext: (conversationId: string, contextId: string) => void;
  /** 取消业务上下文引用（二次确认由 UI 负责；此处写事件与系统消息） */
  removeContext: (conversationId: string) => void;
  /** 注册业务上下文（demo/入口用） */
  registerContextReference: (reference: Omit<RuyiContextReference, 'id' | 'createdAt'> & { id?: string }) => RuyiContextReference;
  getContextReferenceById: (contextId: string) => RuyiContextReference | undefined;
}

type RuyiStore = RuyiPrototypeState & RuyiStoreActions;

export const useRuyiStore = create<RuyiStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      initializeUser: (ownerId) => {
        set((state) => {
          if (state.users[ownerId]) return state;
          return {
            ...state,
            users: {
              ...state.users,
              [ownerId]: createUserState(ownerId),
            },
          };
        });
      },

      createConversation: (ownerId = RUYI_MAIN_OWNER_ID) => {
        const id = generateId('conv');
        const now = new Date().toISOString();
        const conversation: RuyiConversation = {
          id,
          ownerId,
          title: '新对话',
          createdAt: now,
          updatedAt: now,
          activeCapabilityId: null,
          lastCapabilityId: null,
          messageIds: [],
          activeTaskId: null,
        };

        set((state) => ({
          ...state,
          currentOwnerId: ownerId,
          users: {
            ...state.users,
            [ownerId]: {
              ...state.users[ownerId],
              conversationIds: [conversation.id, ...state.users[ownerId].conversationIds],
            },
          },
          conversations: {
            ...state.conversations,
            [conversation.id]: conversation,
          },
        }));

        return conversation;
      },

      renameConversation: (conversationId, title) => {
        // P1：固定系统会话不可重命名
        if (conversationId === FIXED_SYSTEM_CONVERSATION_ID) return false;
        const trimmed = title.trim();
        if (!trimmed || trimmed.length > 40) return false;
        const conversation = get().conversations[conversationId];
        if (!conversation) return false;

        set((state) => ({
          ...state,
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...conversation,
              title: trimmed,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
        return true;
      },

      deleteConversation: (conversationId) => {
        // P1：固定系统会话（PC 消息如意助手）不可删除，保护 IM 连续性
        if (conversationId === FIXED_SYSTEM_CONVERSATION_ID) return;
        set((state) => {
          const conversation = state.conversations[conversationId];
          if (!conversation) return state;

          const { [conversationId]: _, ...remainingConversations } = state.conversations; // eslint-disable-line @typescript-eslint/no-unused-vars
          const owner = state.users[conversation.ownerId];
          const remainingMessageIds = new Set(
            Object.values(remainingConversations).flatMap((c) => c.messageIds),
          );
          const remainingMessages = Object.fromEntries(
            Object.entries(state.messages).filter(([id]) => remainingMessageIds.has(id)),
          );

          // 保留成果，仅清空来源会话关联
          const updatedResults = Object.fromEntries(
            Object.entries(state.results).map(([id, result]) =>
              result.conversationId === conversationId
                ? [id, { ...result, conversationId: null }]
                : [id, result],
            ),
          );

          // 清理仅属于该会话的任务展示引用（任务本身保留）
          const remainingTasks = Object.fromEntries(
            Object.entries(state.tasks).filter(([_, task]) => task.conversationId !== conversationId), // eslint-disable-line @typescript-eslint/no-unused-vars
          );

          return {
            ...state,
            users: {
              ...state.users,
              [conversation.ownerId]: {
                ...owner,
                conversationIds: owner.conversationIds.filter((id) => id !== conversationId),
                taskIds: owner.taskIds.filter((id) => remainingTasks[id]),
              },
            },
            conversations: remainingConversations,
            messages: remainingMessages,
            results: updatedResults,
            tasks: remainingTasks,
          };
        });
      },

      selectCapability: (conversationId, capabilityId) => {
        set((state) => {
          const conversation = state.conversations[conversationId];
          if (!conversation) return state;
          // V4 工具锁定：已使用插件工具的会话固定当前工具——切换其他工具在此拒绝（唯一出口=新建对话）
          const lockedTool = getConversationLockedToolFrom(state, conversationId);
          if (lockedTool && capabilityId && capabilityId !== lockedTool) return state;

          const messages: RuyiMessage[] = [];
          if (capabilityId) {
            const cap = ruyiCapabilities.find((c) => c.id === capabilityId);
            if (cap) {
              messages.push({
                id: generateId('msg'),
                conversationId,
                sender: 'system',
                kind: 'capability-status',
                content: cap.mode === 'agent'
                  ? `已切换调用智能体「${cap.name}」：${cap.shortDescription}。`
                  : `已切换至${cap.name}，${cap.shortDescription}。`,
                createdAt: new Date().toISOString(),
                capabilityId,
              });
            }
          } else if (conversation.activeCapabilityId) {
            const previousCap = ruyiCapabilities.find((c) => c.id === conversation.activeCapabilityId);
            messages.push({
              id: generateId('msg'),
              conversationId,
              sender: 'system',
              kind: 'system',
              content: previousCap?.mode === 'agent'
                ? '已切回「如意助手」，回到普通问答。'
                : '已退出专业能力，回到普通问答。',
              createdAt: new Date().toISOString(),
            });
          }

          const messageIds = messages.map((m) => m.id);
          const messagesRecord = Object.fromEntries(messages.map((m) => [m.id, m]));

          return {
            ...state,
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                activeCapabilityId: capabilityId,
                lastCapabilityId: capabilityId ?? conversation.lastCapabilityId,
                messageIds: [...conversation.messageIds, ...messageIds],
                updatedAt: new Date().toISOString(),
              },
            },
            messages: {
              ...state.messages,
              ...messagesRecord,
            },
          };
        });
      },

      /** V4：查询会话锁定的插件工具（null=纯对话会话，可自由选工具） */
      getConversationLockedTool: (conversationId) => getConversationLockedToolFrom(get(), conversationId),

      sendUserMessage: (conversationId, content) => {
        const trimmed = content.trim();
        if (!trimmed) {
          throw new Error('Cannot send empty message');
        }

        const message: RuyiMessage = {
          id: generateId('msg'),
          conversationId,
          sender: 'user',
          kind: 'text',
          content: trimmed,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const conversation = state.conversations[conversationId];
          if (!conversation) return state;

          const isFirstUserMessage =
            conversation.messageIds.length === 0 ||
            !conversation.messageIds.some((id) => state.messages[id]?.sender === 'user');
          const newTitle = isFirstUserMessage ? generateTitleFromText(trimmed) : conversation.title;

          return {
            ...state,
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                title: newTitle,
                messageIds: [...conversation.messageIds, message.id],
                updatedAt: new Date().toISOString(),
              },
            },
            messages: {
              ...state.messages,
              [message.id]: message,
            },
          };
        });

        return message;
      },

      appendAssistantMessage: (message) => {
        set((state) => {
          const conversation = state.conversations[message.conversationId];
          return {
            ...state,
            conversations: conversation
              ? {
                  ...state.conversations,
                  [message.conversationId]: {
                    ...conversation,
                    messageIds: [...conversation.messageIds, message.id],
                    updatedAt: new Date().toISOString(),
                  },
                }
              : state.conversations,
            messages: {
              ...state.messages,
              [message.id]: message,
            },
          };
        });
      },

      submitCapability: (conversationId, submission) => {
        const prompt = submission.prompt.trim();
        if (!prompt) throw new Error('Cannot submit empty capability request');

        const cap = ruyiCapabilities.find((c) => c.id === submission.capabilityId);
        if (!cap) throw new Error(`Unknown capability: ${submission.capabilityId}`);

        // 1+2. 写用户消息并保存结构化提交信息
        const userMessage = get().sendUserMessage(conversationId, prompt);
        set((state) => ({
          ...state,
          messages: {
            ...state.messages,
            [userMessage.id]: { ...userMessage, capabilitySubmission: submission },
          },
        }));

        // 3. 更新会话当前能力（不重复生成 capability-status 系统消息——提交本身就是能力使用记录）
        set((state) => {
          const conversation = state.conversations[conversationId];
          if (!conversation || conversation.activeCapabilityId === submission.capabilityId) return state;
          return {
            ...state,
            conversations: {
              ...state.conversations,
              [conversationId]: {
                ...conversation,
                activeCapabilityId: submission.capabilityId,
                lastCapabilityId: submission.capabilityId,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });

        // 4~7. 生成助手确认或结果消息（创作类带"进入工作台"操作；即时类直接出结果）
        const nowIso = new Date().toISOString();
        const summaryLines = formatSubmissionSummary(submission);
        let assistantMessage: RuyiMessage;
        if (cap.mode === 'creative' && cap.workbenchPath) {
          // V3.6.1：插件提交直达工作台——卡片不用于此处（卡片服务对话流呈现）。
          // 只写轻量需求记录（参数进 capabilitySubmission 供工作台读取）+ 预写上下文，导航由页面完成
          get().saveWorkbenchLaunchContext(
            conversationId,
            submission.capabilityId as 'document' | 'presentation' | 'advisor',
            userMessage.id,
          );
          if (submission.directWorkbench) {
            return; // 不生成确认消息——页面随后导航到工作台
          }
          assistantMessage = {
            id: generateId('msg'),
            conversationId,
            sender: 'assistant',
            kind: 'text',
            content: `已收到您的${cap.name}需求。${summaryLines ? `\n${summaryLines}` : ''}\n正在为您准备${cap.name}工作台。`,
            createdAt: nowIso,
            capabilityId: submission.capabilityId,
          };
        } else if (submission.capabilityId === 'translation') {
          const lang = String(submission.confirmedParams.targetLanguage ?? '英文');
          assistantMessage = {
            id: generateId('msg'),
            conversationId,
            sender: 'assistant',
            kind: 'text',
            content: `${lang}译文：\n${prompt}`,
            createdAt: nowIso,
            capabilityId: submission.capabilityId,
            actions: [{ type: 'copy', label: '复制' }],
          };
        } else if (submission.capabilityId === 'it-service') {
          const issueType = String(submission.confirmedParams.issueType ?? '');
          assistantMessage = {
            id: generateId('msg'),
            conversationId,
            sender: 'assistant',
            kind: 'text',
            content: `已收到您的IT问题（${issueType}）。排查建议：\n1. 检查网络连接与客户端版本\n2. 重新登录账号后重试\n3. 清理缓存或更换网络环境\n\n若仍未解决，可提交帮助与反馈，工单号 #IT-20261116-001。`,
            createdAt: nowIso,
            capabilityId: submission.capabilityId,
            actions: [
              { type: 'feedback-useful', label: '有用' },
              { type: 'feedback-useless', label: '没用' },
            ],
          };
        } else if (submission.capabilityId === 'work-query') {
          assistantMessage = {
            id: generateId('msg'),
            conversationId,
            sender: 'assistant',
            kind: 'text',
            content: '您当前有 3 项待办流程：\n1. 项目立项申请 - 待审批\n2. 预算调整申请 - 待填写\n3. 设备采购申请 - 待确认\n\n可点击入口前往流程中心处理。',
            createdAt: nowIso,
            capabilityId: submission.capabilityId,
            actions: [{ type: 'open-workbench', label: '查看流程中心' }],
          };
        } else {
          assistantMessage = {
            id: generateId('msg'),
            conversationId,
            sender: 'assistant',
            kind: 'text',
            content: `已收到您的${cap.name}需求，请补充更多信息或直接描述下一步。`,
            createdAt: nowIso,
            capabilityId: submission.capabilityId,
          };
        }
        get().appendAssistantMessage(assistantMessage);

        // 7. 创作类能力生成可供工作台读取的上下文（绑定本次用户消息，工作台按消息取参）
        let workbenchContext: RuyiWorkbenchLaunchContext | null = null;
        if (cap.mode === 'creative' && cap.workbenchPath) {
          workbenchContext = get().saveWorkbenchLaunchContext(
            conversationId,
            submission.capabilityId as 'document' | 'presentation' | 'advisor',
            userMessage.id,
          );
        }

        return { userMessage, assistantMessage, workbenchContext };
      },

      updateMessage: (message) => {
        set((state) => ({
          ...state,
          messages: {
            ...state.messages,
            [message.id]: message,
          },
        }));
      },

      startMeetingTask: (conversationId, initialText: string) => {
        void initialText;
        const state = get();
        const conversation = state.conversations[conversationId];
        if (!conversation) return null;

        const existingActiveTask = conversation.activeTaskId
          ? state.tasks[conversation.activeTaskId]
          : null;
        if (
          existingActiveTask &&
          (existingActiveTask.status === 'collecting' || existingActiveTask.status === 'interrupted')
        ) {
          return existingActiveTask;
        }

        const task: RuyiTaskMock = {
          id: generateId('task'),
          ownerId: conversation.ownerId,
          conversationId,
          type: 'create-meeting',
          status: 'collecting',
          slots: {
            title: '项目沟通会',
            dateText: '明天',
            resolvedDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
          },
          missingSlots: ['startTime', 'endTime', 'attendeeNames'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((s) => ({
          ...s,
          tasks: {
            ...s.tasks,
            [task.id]: task,
          },
          conversations: {
            ...s.conversations,
            [conversationId]: {
              ...conversation,
              activeTaskId: task.id,
              updatedAt: new Date().toISOString(),
            },
          },
          users: {
            ...s.users,
            [conversation.ownerId]: {
              ...s.users[conversation.ownerId],
              taskIds: [...s.users[conversation.ownerId].taskIds, task.id],
            },
          },
        }));

        return task;
      },

      updateMeetingTask: (taskId, patch) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;
          return {
            ...state,
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                ...patch,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      interruptTask: (taskId) => {
        get().updateMeetingTask(taskId, { status: 'interrupted' });
      },

      resumeTask: (taskId) => {
        get().updateMeetingTask(taskId, { status: 'collecting' });
      },

      confirmTask: (taskId) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;
          return {
            ...state,
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                status: 'executing',
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      cancelTask: (taskId) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;
          const conversation = state.conversations[task.conversationId];
          return {
            ...state,
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                status: 'cancelled',
                updatedAt: new Date().toISOString(),
              },
            },
            conversations: conversation
              ? {
                  ...state.conversations,
                  [conversation.id]: {
                    ...conversation,
                    activeTaskId: null,
                    updatedAt: new Date().toISOString(),
                  },
                }
              : state.conversations,
          };
        });
      },

      failTask: (taskId, reason) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;
          const conversation = state.conversations[task.conversationId];
          return {
            ...state,
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                status: 'failed',
                failureReason: reason,
                updatedAt: new Date().toISOString(),
              },
            },
            conversations: conversation
              ? { ...state.conversations, [conversation.id]: { ...conversation, activeTaskId: null } }
              : state.conversations,
          };
        });
      },

      completeTask: (taskId, resultHref) => {
        set((state) => {
          const task = state.tasks[taskId];
          if (!task) return state;
          const conversation = state.conversations[task.conversationId];
          return {
            ...state,
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                status: 'completed',
                resultHref,
                updatedAt: new Date().toISOString(),
              },
            },
            conversations: conversation
              ? { ...state.conversations, [conversation.id]: { ...conversation, activeTaskId: null } }
              : state.conversations,
          };
        });
      },

      createResult: (reference) => {
        const result: RuyiResultReference = {
          ...reference,
          id: generateId('res'),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          ...state,
          results: {
            ...state.results,
            [result.id]: result,
          },
          users: {
            ...state.users,
            [result.ownerId]: {
              ...state.users[result.ownerId],
              resultIds: [...state.users[result.ownerId].resultIds, result.id],
            },
          },
        }));

        return result;
      },

      recordWorkbenchResult: (sourceConversationId, result) => {
        const state = get();
        const conversation = state.conversations[sourceConversationId];
        const ownerId = conversation?.ownerId ?? RUYI_MAIN_OWNER_ID;
        // V4：默认状态收敛为 completed
        const normalized = { ...result, status: result.status ?? 'completed' } as typeof result;

        // 同一工作台会话重复保存时更新同一成果
        const existingResult = Object.values(state.results).find(
          (r) =>
            r.conversationId === sourceConversationId &&
            r.capabilityId === result.capabilityId &&
            r.title === result.title,
        );

        if (existingResult) {
          set((s) => ({
            ...s,
            results: {
              ...s.results,
              [existingResult.id]: {
                ...existingResult,
                ...normalized,
                status: normalized.status,
                workbenchHref: normalized.workbenchHref,
              },
            },
          }));

          // 若已有成果消息则定位，否则追加
          const existingMessage = Object.values(state.messages).find(
            (m) => m.conversationId === sourceConversationId && m.resultId === existingResult.id,
          );
          if (!existingMessage) {
            const msg = generateWorkbenchResultMessage(
              sourceConversationId,
              existingResult.id,
              existingResult.title,
              existingResult.capabilityId,
              existingResult.workbenchHref,
            );
            get().appendAssistantMessage(msg);
          }

          return existingResult;
        }

        const created = get().createResult({
          ...normalized,
          ownerId,
          conversationId: sourceConversationId,
        });

        const msg = generateWorkbenchResultMessage(
          sourceConversationId,
          created.id,
          created.title,
          created.capabilityId,
          created.workbenchHref,
        );
        get().appendAssistantMessage(msg);

        return created;
      },

      saveWorkbenchLaunchContext: (sourceConversationId, capabilityId, sourceMessageId) => {
        const state = get();
        const conversation = state.conversations[sourceConversationId];
        if (!conversation) return null;
        // V3：优先读取指定消息的 capabilitySubmission（参数摘要与附件的唯一可靠来源）
        const messages = state.getConversationMessages(sourceConversationId);
        const sourceMessage = sourceMessageId
          ? messages.find((m) => m.id === sourceMessageId)
          : undefined;
        const submission = sourceMessage?.capabilitySubmission;
        if (submission) {
          const context: RuyiWorkbenchLaunchContext = {
            sourceConversationId,
            capabilityId,
            sourceMessageId: sourceMessage!.id,
            title: submission.title?.trim() || generateTitleFromText(submission.prompt),
            prompt: submission.prompt,
            attachments: submission.attachments.length > 0 ? [...submission.attachments] : undefined,
            confirmedParams: { ...submission.confirmedParams },
            createdAt: new Date().toISOString(),
          };
          const key = `${sourceConversationId}:${capabilityId}`;
          set((s) => ({
            ...s,
            workbenchContexts: { ...s.workbenchContexts, [key]: context },
          }));
          return context;
        }
        // 兼容旧链路：无 submission 时退回最后一条用户消息（仅 title/prompt）
        const lastUserMessage = messages.filter((m) => m.sender === 'user').slice(-1)[0];
        const prompt = lastUserMessage?.content?.trim() ?? '';
        if (!prompt) return null;
        const context: RuyiWorkbenchLaunchContext = {
          sourceConversationId,
          capabilityId,
          sourceMessageId: lastUserMessage.id,
          title: generateTitleFromText(prompt),
          prompt,
          createdAt: new Date().toISOString(),
        };
        const key = `${sourceConversationId}:${capabilityId}`;
        set((s) => ({
          ...s,
          workbenchContexts: { ...s.workbenchContexts, [key]: context },
        }));
        return context;
      },

      getWorkbenchLaunchContext: (sourceConversationId, capabilityId) =>
        get().workbenchContexts[`${sourceConversationId}:${capabilityId}`] ?? null,

      recoverInterruptedExecutions: () => {
        set((state) => {
          const executing = Object.values(state.tasks).filter((t) => t.status === 'executing');
          if (executing.length === 0) return state;
          const tasks = { ...state.tasks };
          const messages = { ...state.messages };
          const conversations = { ...state.conversations };
          for (const task of executing) {
            const notice: RuyiMessage = {
              id: generateId('msg'),
              conversationId: task.conversationId,
              sender: 'assistant',
              kind: 'error',
              content: '处理中断（页面刷新导致任务未完成），请重试。',
              createdAt: new Date().toISOString(),
              taskId: task.id,
              actions: [{ type: 'retry', label: '重试' }],
            };
            tasks[task.id] = {
              ...task,
              status: 'failed',
              failureReason: '页面刷新导致任务中断',
              updatedAt: notice.createdAt,
            };
            messages[notice.id] = notice;
            const conversation = conversations[task.conversationId];
            if (conversation) {
              conversations[task.conversationId] = {
                ...conversation,
                activeTaskId: null,
                messageIds: [...conversation.messageIds, notice.id],
                updatedAt: notice.createdAt,
              };
            }
          }
          return { ...state, tasks, messages, conversations };
        });
      },

      resetUserPrototype: (ownerId = RUYI_MAIN_OWNER_ID) => {
        set((state) => {
          const { [ownerId]: _, ...remainingUsers } = state.users; // eslint-disable-line @typescript-eslint/no-unused-vars
          const newUser = createUserState(ownerId);
          const initial = createInitialState();
          return {
            ...state,
            currentOwnerId: ownerId,
            users: {
              ...remainingUsers,
              [ownerId]: newUser,
            },
            conversations: {
              ...Object.fromEntries(
                Object.entries(state.conversations).filter(([_, c]) => c.ownerId !== ownerId), // eslint-disable-line @typescript-eslint/no-unused-vars
              ),
              ...initial.conversations,
            },
            messages: {
              ...Object.fromEntries(
                Object.entries(state.messages).filter(([_, m]) => { // eslint-disable-line @typescript-eslint/no-unused-vars
                  const conv = state.conversations[m.conversationId];
                  return conv?.ownerId !== ownerId;
                }),
              ),
              ...initial.messages,
            },
            results: Object.fromEntries(
              Object.entries(state.results).filter(([_, r]) => r.ownerId !== ownerId), // eslint-disable-line @typescript-eslint/no-unused-vars
            ),
            tasks: Object.fromEntries(
              Object.entries(state.tasks).filter(([_, t]) => t.ownerId !== ownerId), // eslint-disable-line @typescript-eslint/no-unused-vars
            ),
            demoScenarioId: null,
          };
        });
      },

      loadDemoScenario: (scenarioId) => {
        const scenario = loadRuyiDemoScenario(scenarioId);
        if (!scenario) return false;
        // demo 仅存内存：首次进入备份 localStorage 快照（demo 间切换不覆盖备份）；任何 set 前先开启内存模式拦截写入
        if (!get().demoMode) {
          const raw = localStorage.getItem(STORAGE_KEY);
          demoSnapshotRef.current = raw;
        }
        demoMemoryMode.enabled = true;
        set((state) => ({
          ...state,
          ...scenario,
          demoScenarioId: scenarioId,
          demoMode: true,
        }));
        return true;
      },

      /** 退出 demo：先关内存模式（恢复持久化能力），再恢复进入前的快照 */
      exitDemoScenario: () => {
        // 未知 demo（从未成功加载场景）退出时不得重置当前 store，仅恢复持久化能力
        if (!get().demoMode) {
          demoMemoryMode.enabled = false;
          demoSnapshotRef.current = null;
          return true;
        }
        const raw = demoSnapshotRef.current;
        demoSnapshotRef.current = null;
        demoMemoryMode.enabled = false;
        if (raw) {
          try {
            const restored = JSON.parse(raw) as { state?: Partial<RuyiStore> };
            set((state) => ({ ...state, ...(restored.state as Partial<RuyiStore>), demoMode: false, demoScenarioId: null }));
            // 退出后立即持久化一次，确保 localStorage 与进入前一致
            localStorage.setItem(STORAGE_KEY, raw);
            return true;
          } catch {
            // 快照损坏，回退初始化
          }
        }
        set((state) => ({ ...state, ...createInitialState(), demoMode: false, demoScenarioId: null }));
        return true;
      },

      applyDemoScenario: (scenarioId) => get().loadDemoScenario(scenarioId),

      setCurrentOwner: (ownerId) => {
        // 仅切换 currentOwnerId 指针；会话/任务/成果的 ownerId 一概不动
        if (!get().users[ownerId]) return false;
        set({ currentOwnerId: ownerId });
        return true;
      },

      getConversationMessages: (conversationId) => {
        const state = get();
        const conversation = state.conversations[conversationId];
        if (!conversation) return [];
        return conversation.messageIds
          .map((id) => state.messages[id])
          .filter((m): m is RuyiMessage => !!m)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },

      getOwnerConversations: (ownerId = get().currentOwnerId ?? RUYI_MAIN_OWNER_ID) => {
        const state = get();
        const owner = state.users[ownerId];
        if (!owner) return [];
        return owner.conversationIds
          .map((id) => state.conversations[id])
          .filter((c): c is RuyiConversation => !!c)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      getConversationById: (conversationId) => get().conversations[conversationId],
      getResultById: (resultId) => get().results[resultId],
      getTaskById: (taskId) => get().tasks[taskId],
      getActiveTask: (conversationId) => {
        const state = get();
        const conversation = state.conversations[conversationId];
        if (!conversation?.activeTaskId) return undefined;
        return state.tasks[conversation.activeTaskId];
      },

      /* ---------------- V2 ---------------- */

      getOwnerTasks: (ownerId, filter) => {
        const state = get();
        const owner = state.users[ownerId ?? state.currentOwnerId ?? RUYI_MAIN_OWNER_ID];
        if (!owner) return [];
        let tasks = owner.taskIds
          .map((id) => state.tasks[id])
          .filter((t): t is RuyiTaskMock => !!t);
        if (filter?.status) {
          const allowed = new Set(filter.status);
          tasks = tasks.filter((t) => allowed.has(t.status));
        }
        if (filter?.conversationId) {
          tasks = tasks.filter((t) => t.conversationId === filter.conversationId);
        }
        return tasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      getConversationPendingTasks: (conversationId) => {
        const state = get();
        return Object.values(state.tasks)
          .filter(
            (t) =>
              t.conversationId === conversationId &&
              ['collecting', 'interrupted', 'awaiting-confirmation', 'failed'].includes(t.status),
          )
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      getOwnerResults: (ownerId, filter) => {
        const state = get();
        const owner = state.users[ownerId ?? state.currentOwnerId ?? RUYI_MAIN_OWNER_ID];
        if (!owner) return [];
        let results = owner.resultIds
          .map((id) => state.results[id])
          .filter((r): r is RuyiResultReference => !!r);
        if (filter?.type && filter.type !== 'all') {
          results = results.filter((r) => r.type === filter.type);
        }
        if (filter?.status && filter.status !== 'all') {
          results = results.filter((r) => r.status === filter.status);
        }
        return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      deleteResult: (resultId) => {
        set((state) => {
          const result = state.results[resultId];
          if (!result || result.status === 'deleted') return state;
          return {
            ...state,
            results: {
              ...state.results,
              [resultId]: { ...result, status: 'deleted', updatedAt: new Date().toISOString() },
            },
          };
        });
      },

      appendTaskEvent: (taskId, event) => {
        const state = get();
        const task = state.tasks[taskId];
        if (!task) return;
        const nowIso = new Date().toISOString();
        const fullEvent: RuyiTaskEvent = {
          id: generateId('evt'),
          taskId,
          type: event.type,
          label: event.label,
          status: event.status,
          device: event.device ?? 'pc-client',
          createdAt: nowIso,
        };
        set({
          ...state,
          tasks: {
            ...state.tasks,
            [taskId]: {
              ...task,
              events: [...(task.events ?? []), fullEvent],
              updatedAt: nowIso,
              lastOperatedAt: nowIso,
              lastOperatedDevice: fullEvent.device,
            },
          },
        });
      },

      selectTaskToResume: (conversationId, taskId) => {
        const state = get();
        const conversation = state.conversations[conversationId];
        const task = state.tasks[taskId];
        if (!conversation || !task) return false;
        if (task.conversationId !== conversationId) return false;
        if (!['collecting', 'interrupted', 'awaiting-confirmation', 'failed'].includes(task.status)) return false;
        const nowIso = new Date().toISOString();
        const event: RuyiTaskEvent = {
          id: generateId('evt'),
          taskId,
          type: 'resumed',
          label: `继续任务「${task.title ?? '未命名任务'}」`,
          status: task.status === 'failed' ? 'awaiting-confirmation' : task.status,
          device: 'pc-client',
          createdAt: nowIso,
        };
        set({
          ...state,
          conversations: {
            ...state.conversations,
            [conversationId]: { ...conversation, activeTaskId: taskId, updatedAt: nowIso },
          },
          tasks: {
            ...state.tasks,
            [taskId]: {
              ...task,
              events: [...(task.events ?? []), event],
              updatedAt: nowIso,
              lastOperatedAt: nowIso,
              lastOperatedDevice: 'pc-client',
            },
          },
        });
        return true;
      },

      retryTask: (taskId) => {
        const state = get();
        const task = state.tasks[taskId];
        if (!task || task.status !== 'failed') return false;
        const nowIso = new Date().toISOString();
        const event: RuyiTaskEvent = {
          id: generateId('evt'),
          taskId,
          type: 'retried',
          label: '重试任务',
          status: 'executing',
          device: 'pc-client',
          createdAt: nowIso,
        };
        set({
          ...state,
          tasks: {
            ...state.tasks,
            [taskId]: {
              ...task,
              status: 'executing',
              failureReason: undefined,
              events: [...(task.events ?? []), event],
              updatedAt: nowIso,
              lastOperatedAt: nowIso,
              lastOperatedDevice: 'pc-client',
            },
          },
        });
        return true;
      },

      createFollowUpTask: (taskId) => {
        const state = get();
        const task = state.tasks[taskId];
        if (!task || task.status !== 'completed') return null;
        const nowIso = new Date().toISOString();
        const newTask: RuyiTaskMock = {
          ...task,
          id: generateId('task'),
          status: 'collecting',
          createdAt: nowIso,
          updatedAt: nowIso,
          // 再次处理：参数回到待确认态（已收集参数保留为草稿值）
          events: [
            {
              id: generateId('evt'),
              taskId: taskId,
              type: 'created',
              label: `基于「${task.title ?? '原任务'}」再次处理`,
              status: 'collecting',
              device: 'pc-client',
              createdAt: nowIso,
            },
          ],
          parameters: task.parameters?.map((p) => ({ ...p, confirmed: false })),
          relativeDateConfirmedAt: undefined,
          resultIds: [],
        };
        // 事件归新任务
        newTask.events = (newTask.events ?? []).map((e) => ({ ...e, taskId: newTask.id }));
        const conversation = state.conversations[task.conversationId];
        set({
          ...state,
          tasks: { ...state.tasks, [newTask.id]: newTask },
          users: {
            ...state.users,
            [task.ownerId]: {
              ...state.users[task.ownerId],
              taskIds: [...state.users[task.ownerId].taskIds, newTask.id],
            },
          },
          conversations: conversation
            ? { ...state.conversations, [conversation.id]: { ...conversation, activeTaskId: newTask.id, updatedAt: nowIso } }
            : state.conversations,
        });
        return newTask;
      },

      attachContext: (conversationId, contextId) => {
        const state = get();
        const conversation = state.conversations[conversationId];
        const reference = state.contextReferences[contextId];
        if (!conversation || !reference) return;
        const nowIso = new Date().toISOString();
        const activeTaskId = conversation.activeTaskId;
        const tasks = { ...state.tasks };
        if (activeTaskId && tasks[activeTaskId]) {
          const event: RuyiTaskEvent = {
            id: generateId('evt'),
            taskId: activeTaskId,
            type: 'context-attached',
            label: `引用业务对象「${reference.title}」`,
            status: tasks[activeTaskId].status,
            device: 'pc-client',
            createdAt: nowIso,
          };
          tasks[activeTaskId] = {
            ...tasks[activeTaskId],
            contextReferenceId: contextId,
            events: [...(tasks[activeTaskId].events ?? []), event],
            updatedAt: nowIso,
          };
        }
        set({
          ...state,
          tasks,
          conversations: {
            ...state.conversations,
            [conversationId]: { ...conversation, contextReferenceId: contextId, updatedAt: nowIso },
          },
        });
      },

      removeContext: (conversationId) => {
        const state = get();
        const conversation = state.conversations[conversationId];
        if (!conversation?.contextReferenceId) return;
        const contextId = conversation.contextReferenceId;
        const reference = state.contextReferences[contextId];
        const nowIso = new Date().toISOString();
        const activeTaskId = conversation.activeTaskId;
        const tasks = { ...state.tasks };
        if (activeTaskId && tasks[activeTaskId] && tasks[activeTaskId].contextReferenceId === contextId) {
          const event: RuyiTaskEvent = {
            id: generateId('evt'),
            taskId: activeTaskId,
            type: 'context-removed',
            label: `取消引用业务对象「${reference?.title ?? contextId}」`,
            status: tasks[activeTaskId].status,
            device: 'pc-client',
            createdAt: nowIso,
          };
          tasks[activeTaskId] = {
            ...tasks[activeTaskId],
            contextReferenceId: undefined,
            events: [...(tasks[activeTaskId].events ?? []), event],
            updatedAt: nowIso,
          };
        }
        set({
          ...state,
          tasks,
          conversations: {
            ...state.conversations,
            [conversationId]: { ...conversation, contextReferenceId: null, updatedAt: nowIso },
          },
        });
        // 系统消息由调用方追加（store 不重复生成），此处只清引用
      },

      registerContextReference: (reference) => {
        const full: RuyiContextReference = {
          ...reference,
          id: reference.id ?? generateId('ctx'),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          ...state,
          contextReferences: { ...state.contextReferences, [full.id]: full },
        }));
        return full;
      },

      getContextReferenceById: (contextId) => get().contextReferences[contextId],
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => demoAwareStorage),
      version: SCHEMA_VERSION,
      migrate: (persistedState, _version) => {
        void _version; // 迁移按字段补默认值处理，不依赖版本号清空
        // V2 保留式迁移：schema 1/2 → 3，保留 users/conversations/messages/results/tasks/workbenchContexts，
        // 只补新字段默认值；禁止"版本不一致就 createInitialState()"清空用户数据
        const persisted = (persistedState ?? {}) as Partial<RuyiStore>;
        const safeDefault = <T>(value: T | undefined, fallback: T): T =>
          value === undefined || value === null ? fallback : value;
        // V3.3：会话补 origin/scenarioId/seedRevision（保留式；不重置消息）
        const migratedConversations: Record<string, RuyiConversation> = {};
        for (const [id, conversation] of Object.entries(safeDefault(persisted.conversations, {}))) {
          migratedConversations[id] = {
            ...conversation,
            origin: conversation.origin ?? (id === FIXED_SYSTEM_CONVERSATION_ID ? 'pc-im' : 'ruyi-zone'),
            scenarioId: conversation.scenarioId ?? null,
          };
        }
        // 引用清理：剔除悬挂 messageId/taskId，单条损坏数据不白屏
        const messages = safeDefault(persisted.messages, {});
        const tasks = safeDefault(persisted.tasks, {});
        for (const conversation of Object.values(migratedConversations)) {
          conversation.messageIds = conversation.messageIds.filter((mid) => !!messages[mid]);
          if (conversation.activeTaskId && !tasks[conversation.activeTaskId]) conversation.activeTaskId = null;
        }
        // V4：成果状态收敛——editable→completed；invalid/forbidden→deleted（软删语义）
        const migratedResults: Record<string, RuyiResultReference> = {};
        for (const [id, result] of Object.entries(safeDefault(persisted.results, {}))) {
          const legacyStatus = result.status as string;
          const status: RuyiResultReference['status'] =
            legacyStatus === 'invalid' || legacyStatus === 'forbidden' ? 'deleted' : 'completed';
          migratedResults[id] = { ...result, status };
        }
        return {
          ...persisted,
          conversations: migratedConversations,
          // 迁移后强制写当前 schema 版本（migrate 结果经 partialize 持久化时生效）
          schemaVersion: SCHEMA_VERSION,
          contextReferences: safeDefault(persisted.contextReferences, {}),
          workbenchContexts: safeDefault(persisted.workbenchContexts, {}),
          users: safeDefault(persisted.users, createInitialState().users),
          messages,
          results: migratedResults,
          tasks,
        } as unknown as RuyiStore;
      },
      onRehydrateStorage: () => (state) => {
        if (state && !state.demoMode) {
          // V3.4：showcase 保留式合并（幂等：预置 ID 已存在即跳过；用户数据保留）。
          // 注意：不能在此处 setState(schemaVersion) 提前落盘——会把 initial 泄漏的 showcaseSeedVersion
          // 写上磁盘，令磁盘门控误判已合并。合并成功后由 merge 自身 setState 统一落盘。
          queueMicrotask(() => {
            try {
              mergeRuyiShowcaseSeed(useRuyiStore.getState());
            } catch {
              // 合并失败不阻断应用；下次刷新重试（磁盘标记未写，天然重试）
            }
          });
        }
      },
      partialize: (state) => {
        // demo 态不持久化（storage 层已拦截写入）
        if (state.demoMode) return undefined as unknown as RuyiStore;
        return {
        schemaVersion: state.schemaVersion,
        currentOwnerId: state.currentOwnerId,
        users: state.users,
        conversations: state.conversations,
        messages: state.messages,
        results: state.results,
        tasks: state.tasks,
        workbenchContexts: state.workbenchContexts,
        contextReferences: state.contextReferences,
        showcaseSeedVersion: state.showcaseSeedVersion,
        } as RuyiStore;
      },
    },
  ),
);
