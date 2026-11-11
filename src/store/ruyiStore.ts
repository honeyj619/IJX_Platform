/**
 * 如意助手与如意空间统一状态层
 * 使用 Zustand persist 持久化，按 ownerId 分区。
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
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
import { MAIN_USER_NAME } from '../data/people';
import { generateTitleFromText, generateWorkbenchResultMessage } from '../services/ruyiMockRuntime';

const STORAGE_KEY = 'ijx-ruyi-prototype-v1';
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
const SCHEMA_VERSION = 2;

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

function createSystemConversation(): RuyiConversation {
  return {
    id: FIXED_SYSTEM_CONVERSATION_ID,
    ownerId: RUYI_MAIN_OWNER_ID,
    title: '如意助手',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeCapabilityId: null,
    lastCapabilityId: null,
    messageIds: [],
    activeTaskId: null,
  };
}

function createInitialState(): RuyiPrototypeState {
  const systemConversation = createSystemConversation();
  const welcomeMessage: RuyiMessage = {
    id: generateId('msg'),
    conversationId: FIXED_SYSTEM_CONVERSATION_ID,
    sender: 'assistant',
    kind: 'text',
    content: '您好！我是如意助手，请问有什么可以帮您？',
    createdAt: new Date().toISOString(),
  };
  systemConversation.messageIds.push(welcomeMessage.id);

  return {
    schemaVersion: SCHEMA_VERSION,
    currentOwnerId: RUYI_MAIN_OWNER_ID,
    users: {
      [RUYI_MAIN_OWNER_ID]: createUserState(RUYI_MAIN_OWNER_ID),
    },
    conversations: {
      [FIXED_SYSTEM_CONVERSATION_ID]: systemConversation,
    },
    messages: {
      [welcomeMessage.id]: welcomeMessage,
    },
    results: {},
    tasks: {},
    workbenchContexts: {},
    contextReferences: {},
    demoScenarioId: null,
  };
}

interface RuyiStoreActions {
  initializeUser: (ownerId: string) => void;
  createConversation: (ownerId?: string) => RuyiConversation;
  renameConversation: (conversationId: string, title: string) => boolean;
  deleteConversation: (conversationId: string) => void;
  selectCapability: (conversationId: string, capabilityId: RuyiConversation['activeCapabilityId']) => void;
  sendUserMessage: (conversationId: string, content: string) => RuyiMessage;
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
  /** 生成并保存工作台启动上下文（按来源会话+能力持久化，供工作台带入需求） */
  saveWorkbenchLaunchContext: (sourceConversationId: string, capabilityId: RuyiWorkbenchLaunchContext['capabilityId']) => RuyiWorkbenchLaunchContext | null;
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

          const { [conversationId]: _, ...remainingConversations } = state.conversations;
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
            Object.entries(state.tasks).filter(([_, task]) => task.conversationId !== conversationId),
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

          const messages: RuyiMessage[] = [];
          if (capabilityId) {
            const cap = ruyiCapabilities.find((c) => c.id === capabilityId);
            if (cap) {
              messages.push({
                id: generateId('msg'),
                conversationId,
                sender: 'system',
                kind: 'capability-status',
                content: `已切换至${cap.name}，${cap.shortDescription}。`,
                createdAt: new Date().toISOString(),
                capabilityId,
              });
            }
          } else if (conversation.activeCapabilityId) {
            messages.push({
              id: generateId('msg'),
              conversationId,
              sender: 'system',
              kind: 'system',
              content: '已退出专业能力，回到普通问答。',
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

      updateMessage: (message) => {
        set((state) => ({
          ...state,
          messages: {
            ...state.messages,
            [message.id]: message,
          },
        }));
      },

      startMeetingTask: (conversationId, initialText) => {
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
                ...result,
                status: result.status,
                workbenchHref: result.workbenchHref,
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
          ...result,
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

      saveWorkbenchLaunchContext: (sourceConversationId, capabilityId) => {
        const state = get();
        const conversation = state.conversations[sourceConversationId];
        if (!conversation) return null;
        const lastUserMessage = state
          .getConversationMessages(sourceConversationId)
          .filter((m) => m.sender === 'user')
          .slice(-1)[0];
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
          const { [ownerId]: _, ...remainingUsers } = state.users;
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
                Object.entries(state.conversations).filter(([_, c]) => c.ownerId !== ownerId),
              ),
              ...initial.conversations,
            },
            messages: {
              ...Object.fromEntries(
                Object.entries(state.messages).filter(([_, m]) => {
                  const conv = state.conversations[m.conversationId];
                  return conv?.ownerId !== ownerId;
                }),
              ),
              ...initial.messages,
            },
            results: Object.fromEntries(
              Object.entries(state.results).filter(([_, r]) => r.ownerId !== ownerId),
            ),
            tasks: Object.fromEntries(
              Object.entries(state.tasks).filter(([_, t]) => t.ownerId !== ownerId),
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
        // V2 保留式迁移：schema 1 → 2，保留 users/conversations/messages/results/tasks/workbenchContexts，
        // 只补新字段默认值；禁止"版本不一致就 createInitialState()"清空用户数据
        const persisted = (persistedState ?? {}) as Partial<RuyiStore>;
        const safeDefault = <T>(value: T | undefined, fallback: T): T =>
          value === undefined || value === null ? fallback : value;
        return {
          ...persisted,
          // 迁移后强制写当前 schema 版本（migrate 结果经 partialize 持久化时生效）
          schemaVersion: SCHEMA_VERSION,
          contextReferences: safeDefault(persisted.contextReferences, {}),
          workbenchContexts: safeDefault(persisted.workbenchContexts, {}),
          users: safeDefault(persisted.users, createInitialState().users),
          conversations: safeDefault(persisted.conversations, {}),
          messages: safeDefault(persisted.messages, {}),
          results: safeDefault(persisted.results, {}),
          tasks: safeDefault(persisted.tasks, {}),
        } as unknown as RuyiStore;
      },
      onRehydrateStorage: () => (state) => {
        // 迁移补字段后立即落盘一次，确保 schema 版本与新字段写回 localStorage
        if (state && !state.demoMode) {
          void useRuyiStore.persist.rehydrate;
          // 触发一次轻量 set 使 persist 中间件重写当前完整状态
          useRuyiStore.setState({ schemaVersion: SCHEMA_VERSION });
        }
      },
      partialize: (state) => {
        // demo 态不持久化（storage 层已拦截写入，这里返回上次有效快照形状以保持类型一致）
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
        } as RuyiStore;
      },
    },
  ),
);
