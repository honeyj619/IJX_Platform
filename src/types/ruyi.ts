/**
 * 如意助手与如意空间统一数据类型
 * 字段命名与语义以 docs/RUYI_ASSISTANT_FRONTEND_DEVELOPMENT_PLAN.md §4 为准
 */

export type RuyiCapabilityMode = 'qa' | 'instant' | 'creative' | 'transaction';

export interface RuyiCapability {
  id: 'work-query' | 'document' | 'presentation' | 'advisor' | 'translation' | 'it-service';
  name: string;
  shortDescription: string;
  promptPlaceholder: string;
  mode: RuyiCapabilityMode;
  producesResult: boolean;
  workbenchPath?: string;
}

export interface RuyiConversation {
  id: string;
  ownerId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  activeCapabilityId: RuyiCapability['id'] | null;
  lastCapabilityId: RuyiCapability['id'] | null;
  messageIds: string[];
  activeTaskId: string | null;
  /** V2：当前绑定的业务上下文引用（只对当前会话生效，切页不自动沿用） */
  contextReferenceId?: string | null;
}

export type RuyiMessageKind =
  | 'text'
  | 'capability-status'
  | 'loading'
  | 'confirmation'
  | 'resume-task'
  | 'result'
  | 'error'
  | 'system';

export type RuyiMessageActionType =
  | 'open-result'
  | 'open-workbench'
  | 'confirm-task'
  | 'modify-task'
  | 'cancel-task'
  | 'resume-task'
  | 'retry'
  | 'feedback-useful'
  | 'feedback-useless'
  | 'copy'
  | 'regenerate'
  /* V2 */
  | 'confirm-date'
  | 'open-task-center'
  | 'select-task';

export interface RuyiMessageAction {
  type: RuyiMessageActionType;
  label: string;
  payload?: Record<string, unknown>;
}

export interface RuyiMessageFeedback {
  rating: 'useful' | 'useless';
  reason?: '答非所问' | '信息不准确' | '操作失败' | '其他原因';
}

export interface RuyiMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant' | 'system';
  kind: RuyiMessageKind;
  content: string;
  createdAt: string;
  capabilityId?: RuyiCapability['id'];
  resultId?: string;
  taskId?: string;
  actions?: RuyiMessageAction[];
  sourceLabel?: string;
  sourceHref?: string;
  /** 用户对该条助手回复的反馈（记录在消息上，不追加系统消息） */
  feedback?: RuyiMessageFeedback;
  /** V2：多任务选择候选（该消息渲染歧义选择卡片） */
  multiTaskCandidates?: Array<{ taskId: string; title: string; status: string; updatedAt: string; nextAction?: string }>;
  /** V2：该选择消息已被用户选择过（保留历史，操作置为完成，避免重复选择） */
  selectionResolved?: string | null;
}

export type RuyiResultType = 'document' | 'presentation' | 'report' | 'translation';
export type RuyiResultStatus = 'editable' | 'completed' | 'invalid' | 'forbidden';

export interface RuyiResultReference {
  id: string;
  ownerId: string;
  conversationId: string | null;
  type: RuyiResultType;
  title: string;
  capabilityId: RuyiCapability['id'];
  status: RuyiResultStatus;
  workbenchHref: string;
  createdAt: string;
  statusReason?: string;
  /* ---- V2 兼容扩展 ---- */
  /** 关联任务 */
  taskId?: string | null;
  /** 最后更新时间 */
  updatedAt?: string;
  /** 来源（会话删除/迁移后标记，成果保留） */
  sourceDeleted?: boolean;
}

export type RuyiTaskStatus =
  | 'collecting'
  | 'interrupted'
  | 'awaiting-confirmation'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

/** V2：任务类型扩展（保持 create-meeting 语义；非会议任务 slots 保持空对象、通过 parameters 表达参数） */
export type RuyiTaskType =
  | 'create-meeting'
  | 'generate-report'
  | 'prepare-presentation'
  | 'draft-document';

/** V2：设备与来源 */
export type RuyiClientDevice = 'pc-client' | 'pc-web' | 'app';

export interface RuyiTaskSource {
  entry: 'ruyi-zone' | 'pc-im' | 'business-context';
  label: string;
  device: RuyiClientDevice;
}

/** 设备显示名：代码值不得直接作为中文文案展示 */
export const RUYI_DEVICE_LABELS: Record<RuyiClientDevice, string> = {
  'pc-client': 'PC 客户端',
  'pc-web': 'PC Web',
  app: 'App',
};

/** V2：业务上下文引用（仅保存摘要与原型路由，不保存真实附件/正文/凭据） */
export type RuyiContextType = 'calendar' | 'meeting' | 'document' | 'approval' | 'work-item';

export interface RuyiContextReference {
  id: string;
  ownerId: string;
  type: RuyiContextType;
  title: string;
  summary: string;
  sourceRoute: string;
  createdAt: string;
}

/** V2：任务参数（非会议任务的通用参数表达） */
export interface RuyiTaskParameter {
  key: string;
  label: string;
  value: string;
  required: boolean;
  confirmed: boolean;
}

/** V2：任务状态事件 */
export interface RuyiTaskEvent {
  id: string;
  taskId: string;
  type:
    | 'created'
    | 'parameter-updated'
    | 'interrupted'
    | 'resumed'
    | 'confirmed'
    | 'executing'
    | 'failed'
    | 'retried'
    | 'completed'
    | 'cancelled'
    | 'context-attached'
    | 'context-removed';
  label: string;
  status: RuyiTaskStatus;
  device: RuyiClientDevice;
  createdAt: string;
}

export interface MeetingTaskSlots {
  title: string;
  dateText: string;
  resolvedDate: string;
  startTime: string;
  endTime: string;
  attendeeNames: string[];
  location: string;
}

export interface RuyiTaskMock {
  id: string;
  ownerId: string;
  conversationId: string;
  type: RuyiTaskType;
  status: RuyiTaskStatus;
  slots: Partial<MeetingTaskSlots>;
  missingSlots: Array<keyof MeetingTaskSlots>;
  createdAt: string;
  updatedAt: string;
  resultHref?: string;
  failureReason?: string;
  /* ---- V2 兼容扩展（可选字段；V1 语义不变） ---- */
  /** 任务展示名称 */
  title?: string;
  /** 任务目标摘要 */
  goal?: string;
  /** 通用参数表达（非会议任务使用；会议任务继续用 slots） */
  parameters?: RuyiTaskParameter[];
  /** 来源（入口 + 设备） */
  source?: RuyiTaskSource;
  /** 最后操作端 */
  lastOperatedDevice?: RuyiClientDevice;
  /** 最后操作时间 */
  lastOperatedAt?: string;
  /** 下一步提示 */
  nextAction?: string;
  /** 关联成果 */
  resultIds?: string[];
  /** 关联业务上下文 */
  contextReferenceId?: string;
  /** 状态记录时间线 */
  events?: RuyiTaskEvent[];
  /** 相对日期确认时间（跨日恢复需重新确认） */
  relativeDateConfirmedAt?: string;
  /** 来源会话已删除（任务保留） */
  sourceConversationDeleted?: boolean;
}

export interface RuyiUserState {
  ownerId: string;
  conversationIds: string[];
  resultIds: string[];
  taskIds: string[];
  initializedAt: string;
}

/** 工作台启动上下文：从对话进入工作台时携带已确认需求，按"来源会话+能力"持久化 */
export interface RuyiWorkbenchLaunchContext {
  sourceConversationId: string;
  capabilityId: 'document' | 'presentation' | 'advisor';
  sourceMessageId?: string;
  title: string;
  prompt: string;
  attachments?: string[];
  confirmedParams?: Record<string, unknown>;
  createdAt: string;
}

export interface RuyiPrototypeState {
  schemaVersion: number;
  currentOwnerId: string | null;
  users: Record<string, RuyiUserState>;
  conversations: Record<string, RuyiConversation>;
  messages: Record<string, RuyiMessage>;
  results: Record<string, RuyiResultReference>;
  tasks: Record<string, RuyiTaskMock>;
  workbenchContexts: Record<string, RuyiWorkbenchLaunchContext>;
  /** V2：业务上下文引用登记表 */
  contextReferences: Record<string, RuyiContextReference>;
  demoScenarioId: string | null;
  /** demo fixture 模式：仅内存，不写入持久化 */
  demoMode?: boolean;
}
