import { create } from 'zustand';
import { MAIN_USER_NAME, getDemoPerson } from '../data/people';

export type MeetingStatus = 'scheduled' | 'pending_approval' | 'rejected' | 'ongoing' | 'ended' | 'cancelled' | 'expired';
export type RecordingStatus = 'waiting' | 'processing' | 'completed' | 'failed' | 'unavailable';
export type RecordingSource = 'meeting' | 'screen' | 'imported';
export type OnlineMeetingType = 'none' | 'ruyi' | 'external';
export type ParticipantResponse = 'accepted' | 'declined' | 'tentative' | 'pending';

export interface ParticipantStatus {
  response: ParticipantResponse;
  /** 签到时间（原型演示数据）：线下扫码 'qr' / 线上入会即签到 'online' */
  checkedInAt?: string;
  checkInMethod?: 'qr' | 'online';
}

export interface CalendarEventRecord {
  id: string;
  date: string;
  title: string;
  type: 'meeting' | 'business' | 'vacation' | 'other';
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingId?: string;
}

export interface RoomBookingRecord {
  id: string;
  roomId: string;
  date: string;
  title: string;
  host: string;
  department: string;
  startSlot: number;
  endSlot: number;
  meetingId: string;
  mine?: boolean;
}

export interface ScheduleMeetingDraft {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  organizer: string;
  participants: string[];
  onlineMeetingType: OnlineMeetingType;
  externalMeetingUrl?: string;
  roomId?: string;
  location?: string;
  repeatRule?: string;
  reminder?: string;
  description?: string;
  createMeeting: boolean;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  start: number;
  end: number;
  text: string;
}

export interface MeetingActionItem {
  id: string;
  content: string;
  owner: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

export interface MeetingSummary {
  purpose: string;
  discussions: string[];
  conclusions: string[];
  risks: string[];
  followUps: string[];
}

export interface MeetingRecording {
  id: string;
  name: string;
  source: RecordingSource;
  meetingId?: string;
  createdAt: string;
  duration: number;
  fileSize: string;
  fileName: string;
  status: RecordingStatus;
  /** 录制首帧或演示封面；没有封面时列表不强制占位 */
  coverUrl?: string;
  errorMessage?: string;
  summary?: MeetingSummary;
  transcript: TranscriptSegment[];
  actionItems: MeetingActionItem[];
}

export interface MeetingRecord {
  id: string;
  meetingNo: string;
  title: string;
  organizer: string;
  participants: string[];
  /** 按姓名索引的参会回复与签到状态；旧数据自动补 pending */
  participantStatus?: Record<string, ParticipantStatus>;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  duration?: number;
  status: MeetingStatus;
  password?: string;
  source: 'center' | 'chat' | 'calendar';
  sourceConversation?: string;
  calendarEventId?: string;
  externalMeetingUrl?: string;
  onlineMeetingType?: OnlineMeetingType;
  roomId?: string;
  roomBookingId?: string;
  recordingIds: string[];
  location?: string;
  /** 创建人（默认同发起人） */
  creator?: string;
  reminder?: string;
  repeatRule?: string;
  repeatEndDate?: string;
  description?: string;
  /** 线下或混合会议的扫码签到规则 */
  checkInRule?: string;
  /** 审批中/已驳回会议的审批说明 */
  approvalNote?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  statusChangedAt?: string;
  /** 如意/线上会议房间是否已发起（对应线上会议已开始进行） */
  onlineStarted?: boolean;
  /** 本人是否已进入对应的会议框（在线会议房间） */
  roomOpened?: boolean;
  /** 参会人入会明细（RTC 结束回流）：入会/离会时间，用于会后参会统计 */
  attendance?: Record<string, { joinedAt?: string; leftAt?: string }>;
}

const STORAGE_KEY = 'ijx-ruyi-meeting-store-v1';

const demoTranscript: TranscriptSegment[] = [
  { id: 'ts-1', speaker: getDemoPerson(1), start: 0, end: 28, text: '大家好，今天我们讨论项目最新进展。过去一周里取得了明显成果，也遇到了一些阶段性问题。' },
  { id: 'ts-2', speaker: getDemoPerson(7), start: 28, end: 65, text: '目前核心功能已经完成联调，接下来需要集中处理性能数据和异常场景，确保按计划进入验收。' },
  { id: 'ts-3', speaker: getDemoPerson(11), start: 65, end: 104, text: '测试侧建议补充弱网和高并发场景，并在本周四前完成问题清单确认。' },
  { id: 'ts-4', speaker: getDemoPerson(1), start: 104, end: 151, text: '结论是保持原定上线时间，研发负责修复阻断问题，测试负责回归，项目经理每日同步风险。' },
  { id: 'ts-5', speaker: getDemoPerson(4), start: 151, end: 196, text: '资源方面暂时没有新增诉求，如出现跨部门协调问题，我会统一跟进并在项目群同步。' },
];

const demoSummary: MeetingSummary = {
  purpose: '同步项目阶段进展，确认联调、测试与上线准备工作的责任分工。',
  discussions: ['核心功能联调已完成，仍需覆盖弱网和高并发场景。', '测试问题清单需在本周四前完成确认。'],
  conclusions: ['保持原定上线时间不变。', '每日在项目群同步阻断问题和风险。'],
  risks: ['性能数据尚未完成全量验证。', '跨部门问题可能影响回归节奏。'],
  followUps: ['研发修复阻断问题。', '测试完成回归并输出结果。', '项目经理每日同步风险。'],
};

const defaultMeetings: MeetingRecord[] = [
  {
    id: 'meeting-q4-planning', meetingNo: '418 919 635', title: 'Q4 产品规划讨论会', organizer: getDemoPerson(1),
    participants: [MAIN_USER_NAME, getDemoPerson(1), getDemoPerson(7), getDemoPerson(11)], scheduledStart: '2026-10-30 14:00',
    scheduledEnd: '2026-10-30 15:30', actualStart: '2026-10-30 14:02', status: 'ongoing', source: 'calendar', recordingIds: [], onlineMeetingType: 'ruyi',
    onlineStarted: true, roomOpened: false,
    participantStatus: {
      [getDemoPerson(1)]: { response: 'accepted', checkedInAt: '2026-10-30 14:02', checkInMethod: 'online' },
      [MAIN_USER_NAME]: { response: 'accepted', checkedInAt: '2026-10-30 14:02', checkInMethod: 'online' },
      [getDemoPerson(7)]: { response: 'accepted' },
      [getDemoPerson(11)]: { response: 'pending' },
    },
  },
  // ===== 本轮演示数据：本人发起进行中（线上会议尚未发起 → 展示"发起会议"）=====
  {
    id: 'meeting-demo-ongoing-mine', meetingNo: '617 208 534', title: '月度经营分析会', organizer: MAIN_USER_NAME,
    participants: [MAIN_USER_NAME, getDemoPerson(2), getDemoPerson(7), getDemoPerson(11)],
    scheduledStart: '2026-11-04 09:30', scheduledEnd: '2026-11-04 10:30', actualStart: '2026-11-04 09:31',
    status: 'ongoing', source: 'center', recordingIds: [], onlineMeetingType: 'ruyi', creator: MAIN_USER_NAME,
    onlineStarted: false, roomOpened: false,
  },
  {
    id: 'meeting-weekly-sync', meetingNo: '204 365 818', title: '工作门户体验优化周会', organizer: MAIN_USER_NAME,
    participants: [MAIN_USER_NAME, getDemoPerson(3), getDemoPerson(8)], scheduledStart: '2026-10-31 10:00', scheduledEnd: '2026-10-31 11:00',
    status: 'scheduled', source: 'calendar', recordingIds: [], location: '6407 会议室', roomId: '6407', onlineMeetingType: 'ruyi',
  },
  {
    id: 'meeting-architecture', meetingNo: '119 764 294', title: '技术架构评审会', organizer: getDemoPerson(7),
    participants: [MAIN_USER_NAME, getDemoPerson(7), getDemoPerson(11), getDemoPerson(4), getDemoPerson(9)], scheduledStart: '2026-10-28 10:00',
    scheduledEnd: '2026-10-28 11:20', actualStart: '2026-10-28 10:01', actualEnd: '2026-10-28 11:18', duration: 4620,
    status: 'ended', source: 'calendar', recordingIds: ['recording-architecture-main', 'recording-architecture-backup'], location: '公司第一会议室', roomId: '6502', onlineMeetingType: 'none',
    attendance: {
      [MAIN_USER_NAME]: { joinedAt: '2026-10-28 10:01', leftAt: '2026-10-28 11:18' },
      [getDemoPerson(7)]: { joinedAt: '2026-10-28 10:01', leftAt: '2026-10-28 11:18' },
      [getDemoPerson(11)]: { joinedAt: '2026-10-28 10:05', leftAt: '2026-10-28 11:10' },
      [getDemoPerson(4)]: { joinedAt: '2026-10-28 10:02', leftAt: '2026-10-28 11:15' },
      [getDemoPerson(9)]: { joinedAt: '2026-10-28 10:20', leftAt: '2026-10-28 11:18' },
    },
  },
  {
    id: 'meeting-retrospective', meetingNo: '287 436 905', title: '项目复盘沟通会', organizer: getDemoPerson(4),
    participants: [MAIN_USER_NAME, getDemoPerson(4), getDemoPerson(12)], scheduledStart: '2026-10-25 16:00', scheduledEnd: '2026-10-25 17:00',
    actualStart: '2026-10-25 16:03', actualEnd: '2026-10-25 16:58', duration: 3300, status: 'ended', source: 'center', recordingIds: [], onlineMeetingType: 'ruyi',
  },
  // ===== 本轮演示数据：本人发起待开始（可取消/可修改）=====
  {
    id: 'meeting-demo-cancellable', meetingNo: '356 780 129', title: '新产品发布会筹备会', organizer: MAIN_USER_NAME,
    participants: [MAIN_USER_NAME, getDemoPerson(3), getDemoPerson(5), getDemoPerson(9)],
    scheduledStart: '2026-11-05 14:00', scheduledEnd: '2026-11-05 15:00', status: 'scheduled', source: 'center',
    recordingIds: [], location: '6404 会议室', roomId: '6404', onlineMeetingType: 'ruyi', creator: MAIN_USER_NAME,
    reminder: '提前15分钟', repeatRule: '不重复',
    participantStatus: {
      [MAIN_USER_NAME]: { response: 'accepted' },
      [getDemoPerson(3)]: { response: 'accepted' },
      [getDemoPerson(5)]: { response: 'pending' },
      [getDemoPerson(9)]: { response: 'tentative' },
    },
  },
  // ===== 本轮演示数据：本人发起已结束且有扫码签到（可导出签到明细）=====
  {
    id: 'meeting-demo-exportable', meetingNo: '902 431 567', title: '客户调研总结会', organizer: MAIN_USER_NAME,
    participants: [MAIN_USER_NAME, getDemoPerson(1), getDemoPerson(6), getDemoPerson(10), getDemoPerson(12)],
    scheduledStart: '2026-10-29 09:30', scheduledEnd: '2026-10-29 10:30',
    actualStart: '2026-10-29 09:31', actualEnd: '2026-10-29 10:33', duration: 3720, status: 'ended', source: 'center',
    recordingIds: [], onlineMeetingType: 'ruyi', creator: MAIN_USER_NAME, reminder: '提前15分钟', repeatRule: '不重复',
    participantStatus: {
      [MAIN_USER_NAME]: { response: 'accepted', checkedInAt: '2026-10-29 09:29', checkInMethod: 'qr' },
      [getDemoPerson(1)]: { response: 'accepted', checkedInAt: '2026-10-29 09:30', checkInMethod: 'qr' },
      [getDemoPerson(6)]: { response: 'accepted', checkedInAt: '2026-10-29 09:35', checkInMethod: 'qr' },
      [getDemoPerson(10)]: { response: 'declined' },
      [getDemoPerson(12)]: { response: 'pending' },
    },
    attendance: {
      [MAIN_USER_NAME]: { joinedAt: '2026-10-29 09:31', leftAt: '2026-10-29 10:33' },
      [getDemoPerson(1)]: { joinedAt: '2026-10-29 09:30', leftAt: '2026-10-29 10:30' },
      [getDemoPerson(6)]: { joinedAt: '2026-10-29 09:35', leftAt: '2026-10-29 10:20' },
    },
  },
  // ===== 本轮演示数据：非本人发起（验证权限差异，无更多菜单）=====
  {
    id: 'meeting-demo-others', meetingNo: '745 118 902', title: '跨部门协作沟通会', organizer: getDemoPerson(9),
    participants: [getDemoPerson(9), MAIN_USER_NAME, getDemoPerson(2)], scheduledStart: '2026-11-06 16:00',
    scheduledEnd: '2026-11-06 17:00', status: 'scheduled', source: 'center', recordingIds: [],
    onlineMeetingType: 'ruyi', creator: getDemoPerson(9), reminder: '提前5分钟', repeatRule: '不重复',
    participantStatus: {
      [getDemoPerson(9)]: { response: 'accepted' },
      [MAIN_USER_NAME]: { response: 'pending' },
      [getDemoPerson(2)]: { response: 'accepted' },
    },
  },
  {
    id: 'meeting-demo-approval', meetingNo: '628 304 915', title: '年度预算沟通会', organizer: MAIN_USER_NAME,
    participants: [MAIN_USER_NAME, getDemoPerson(2), getDemoPerson(8)], scheduledStart: '2026-11-07 10:00', scheduledEnd: '2026-11-07 11:30',
    status: 'pending_approval', source: 'calendar', recordingIds: [], location: '6502 会议室', roomId: '6502', onlineMeetingType: 'none', creator: MAIN_USER_NAME,
    checkInRule: '会前30分钟至会议结束可扫码签到', approvalNote: '会议室预约正在等待管理员审批',
  },
  {
    id: 'meeting-demo-rejected', meetingNo: '531 907 246', title: '外部合作方案评审', organizer: MAIN_USER_NAME,
    participants: [MAIN_USER_NAME, getDemoPerson(5)], scheduledStart: '2026-11-01 14:00', scheduledEnd: '2026-11-01 15:00',
    status: 'rejected', statusChangedAt: '2026-10-31 16:20', source: 'calendar', recordingIds: [], location: '6404 会议室', roomId: '6404', onlineMeetingType: 'none', creator: MAIN_USER_NAME,
    checkInRule: '会前30分钟至会议结束可扫码签到', approvalNote: '会议室与高优先级活动时间冲突，请调整时间后重新提交',
  },
  {
    id: 'meeting-demo-expired', meetingNo: '483 126 790', title: '产品需求临时沟通', organizer: getDemoPerson(3),
    participants: [MAIN_USER_NAME, getDemoPerson(3), getDemoPerson(10)], scheduledStart: '2026-10-24 16:00', scheduledEnd: '2026-10-24 16:30',
    status: 'expired', statusChangedAt: '2026-10-24 16:30', source: 'center', recordingIds: [], onlineMeetingType: 'ruyi', creator: getDemoPerson(3),
  },
];

const defaultRoomBookings: RoomBookingRecord[] = [
  { id: 'room-booking-1', roomId: '6502', date: '2026-11-02', title: '技术架构评审会', host: getDemoPerson(7), department: '信息管理部', startSlot: 4, endSlot: 7, meetingId: 'meeting-architecture' },
  { id: 'room-booking-2', roomId: '6407', date: '2026-11-02', title: '工作门户体验优化周会', host: MAIN_USER_NAME, department: '信息管理部', startSlot: 10, endSlot: 12, meetingId: 'meeting-weekly-sync', mine: true },
  { id: 'room-booking-3', roomId: '6404', date: '2026-11-02', title: '营销中台周会', host: getDemoPerson(3), department: '市场部', startSlot: 14, endSlot: 16, meetingId: 'meeting-q4-planning' },
];

const defaultCalendarEvents: CalendarEventRecord[] = [
  { id: 'calendar-1', date: '2025-05-01', title: '项目立项会议', type: 'meeting' },
  { id: 'calendar-2', date: '2025-05-04', title: 'H01253 北京', type: 'business', location: '北京' },
  { id: 'calendar-3', date: '2025-05-04', title: '午餐', type: 'other' },
  { id: 'calendar-4', date: '2025-05-22', title: '值班', type: 'other' },
  { id: 'calendar-5', date: '2025-05-22', title: 'H01253 上海', type: 'business', location: '上海' },
  { id: 'calendar-6', date: '2025-05-29', title: '0.5天休假', type: 'vacation' },
  { id: 'calendar-7', date: '2025-05-31', title: '休', type: 'vacation' },
];

const defaultRecordings: MeetingRecording[] = [
  {
    id: 'recording-architecture-main', name: '技术架构评审会', source: 'meeting', meetingId: 'meeting-architecture', createdAt: '2026-10-28 10:01',
    duration: 4620, fileSize: '486 MB', fileName: '技术架构评审会.mp4', status: 'completed', coverUrl: '/assets/navigation-background.png', summary: demoSummary, transcript: demoTranscript,
    actionItems: [
      { id: 'action-1', content: '完成弱网场景回归测试', owner: getDemoPerson(11), dueDate: '2026-10-31', status: 'pending' },
      { id: 'action-2', content: '整理性能数据并同步项目群', owner: getDemoPerson(7), dueDate: '2026-10-30', status: 'completed' },
      { id: 'action-3', content: '确认上线前阻断问题清单', owner: MAIN_USER_NAME, dueDate: '2026-11-01', status: 'pending' },
    ],
  },
  {
    id: 'recording-architecture-backup', name: '技术架构评审会 - 备用录制', source: 'meeting', meetingId: 'meeting-architecture', createdAt: '2026-10-28 10:35',
    duration: 2580, fileSize: '212 MB', fileName: '技术架构评审会_备用.mp4', status: 'processing', transcript: [], actionItems: [],
  },
  {
    id: 'recording-screen-demo', name: '工作门户操作演示', source: 'screen', createdAt: '2026-10-27 15:20', duration: 1080,
    fileSize: '96 MB', fileName: '工作门户操作演示.webm', status: 'completed', summary: demoSummary, transcript: demoTranscript.slice(0, 3), actionItems: [],
  },
  {
    id: 'recording-import-failed', name: '客服系统需求访谈', source: 'imported', createdAt: '2026-10-26 09:40', duration: 2240,
    fileSize: '128 MB', fileName: '客服系统需求访谈.mp4', status: 'failed', errorMessage: '音轨识别失败，请重新生成纪要。', transcript: [], actionItems: [],
  },
];

interface MeetingStoreState {
  meetings: MeetingRecord[];
  recordings: MeetingRecording[];
  roomBookings: RoomBookingRecord[];
  calendarEvents: CalendarEventRecord[];
  addMeeting: (meeting: MeetingRecord) => void;
  updateMeeting: (id: string, patch: Partial<MeetingRecord>) => void;
  addRecording: (recording: MeetingRecording) => void;
  updateRecording: (id: string, patch: Partial<MeetingRecording>) => void;
  createSchedule: (draft: ScheduleMeetingDraft) => MeetingRecord | undefined;
  /** 取消会议：保留记录标已取消，同步移除日历事件与会议室占用 */
  cancelMeeting: (id: string, operator: string) => void;
  /** 修改会议：同步更新日历事件与会议室占用 */
  modifyMeeting: (id: string, draft: ScheduleMeetingDraft) => void;
  /** 受邀人回复（接受/拒绝/待定） */
  respondMeeting: (id: string, participant: string, response: ParticipantResponse) => void;
  /** 线上入会即签到：首次签到优先，已签到（线下/线上）不覆盖，线上线下同频去重 */
  checkInOnline: (id: string, participant: string) => void;
  /** 结束会议并生成会后产物：会议转 ended、补全参会明细、无录制时生成模拟录制（processing→completed 纪要/逐字稿/待办） */
  endMeetingWithOutputs: (id: string) => void;
}

interface PersistedMeetingState {
  meetings: MeetingRecord[];
  recordings: MeetingRecording[];
  roomBookings: RoomBookingRecord[];
  calendarEvents: CalendarEventRecord[];
}

const normalizeMeeting = (meeting: MeetingRecord): MeetingRecord => ({
  ...meeting,
  onlineMeetingType: meeting.onlineMeetingType ?? (meeting.externalMeetingUrl ? 'external' : 'ruyi'),
  // 旧数据兼容：参与人无状态自动补 pending，发起人默认 accepted
  participantStatus: Object.fromEntries(meeting.participants.map((name) => [
    name,
    meeting.participantStatus?.[name] ?? (name === meeting.organizer ? { response: 'accepted' as const } : { response: 'pending' as const }),
  ])),
  onlineStarted: meeting.onlineStarted ?? false,
  roomOpened: meeting.roomOpened ?? false,
});

const loadState = (): PersistedMeetingState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<PersistedMeetingState>;
      const savedMeetings = saved.meetings ?? defaultMeetings;
      const demosToMerge = defaultMeetings.filter((meeting) => ['pending_approval', 'rejected', 'expired'].includes(meeting.status) || meeting.id === 'meeting-demo-ongoing-mine');
      const meetingsWithDemos = [...savedMeetings, ...demosToMerge.filter((demo) => !savedMeetings.some((meeting) => meeting.id === demo.id))];
      const meetings = meetingsWithDemos
        .map(normalizeMeeting)
        .map((meeting) => meeting.id === 'meeting-q4-planning' ? { ...meeting, onlineStarted: true } : meeting);
      return {
        meetings,
        recordings: (saved.recordings ?? defaultRecordings).map((recording) => recording.id === 'recording-architecture-main' && !recording.coverUrl ? { ...recording, coverUrl: '/assets/navigation-background.png' } : recording),
        roomBookings: saved.roomBookings ?? defaultRoomBookings,
        calendarEvents: saved.calendarEvents ?? defaultCalendarEvents,
      };
    }
  } catch {
    // 损坏的演示数据回退到默认值。
  }
  return {
    meetings: defaultMeetings,
    recordings: defaultRecordings,
    roomBookings: defaultRoomBookings,
    calendarEvents: defaultCalendarEvents,
  };
};

const persist = (state: PersistedMeetingState) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const timeToSlot = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  // 00:00–24:00 全天 48 槽（每槽 30 分钟），8 点前为负则归 0，上限 47
  return Math.max(0, Math.min(47, Math.round(((hour * 60 + minute) - 8 * 60) / 30)));
};

const initial = loadState();

export const useMeetingStore = create<MeetingStoreState>((set) => ({
  meetings: initial.meetings,
  recordings: initial.recordings,
  roomBookings: initial.roomBookings,
  calendarEvents: initial.calendarEvents,
  addMeeting: (meeting) => set((state) => {
    const meetings = [meeting, ...state.meetings];
    persist({ ...state, meetings });
    return { meetings };
  }),
  updateMeeting: (id, patch) => set((state) => {
    const meetings = state.meetings.map((meeting) => meeting.id === id ? { ...meeting, ...patch } : meeting);
    persist({ ...state, meetings });
    return { meetings };
  }),
  addRecording: (recording) => set((state) => {
    const recordings = [recording, ...state.recordings];
    persist({ ...state, recordings });
    return { recordings };
  }),
  updateRecording: (id, patch) => set((state) => {
    const recordings = state.recordings.map((recording) => recording.id === id ? { ...recording, ...patch } : recording);
    persist({ ...state, recordings });
    return { recordings };
  }),
  createSchedule: (draft) => {
    let createdMeeting: MeetingRecord | undefined;
    set((state) => {
      const createdAt = Date.now();
      const shouldCreateMeeting = draft.createMeeting || draft.onlineMeetingType !== 'none' || Boolean(draft.roomId);
      const meetingId = shouldCreateMeeting ? `meeting-${createdAt}` : undefined;
      const eventId = `calendar-${createdAt}`;
      const roomBookingId = draft.roomId && meetingId ? `room-booking-${createdAt}` : undefined;
      const calendarEvent: CalendarEventRecord = {
        id: eventId,
        date: draft.date,
        title: draft.title,
        type: shouldCreateMeeting ? 'meeting' : 'other',
        startTime: draft.startTime,
        endTime: draft.endTime,
        location: draft.location,
        meetingId,
      };
      const calendarEvents = [calendarEvent, ...state.calendarEvents];
      let meetings = state.meetings;
      let roomBookings = state.roomBookings;

      if (meetingId) {
        createdMeeting = {
          id: meetingId,
          meetingNo: draft.onlineMeetingType === 'ruyi' ? createMeetingNo() : '',
          title: draft.title,
          organizer: draft.organizer,
          participants: Array.from(new Set([draft.organizer, ...draft.participants])),
          scheduledStart: `${draft.date} ${draft.startTime}`,
          scheduledEnd: `${draft.date} ${draft.endTime}`,
          status: 'scheduled',
          source: 'calendar',
          calendarEventId: eventId,
          externalMeetingUrl: draft.onlineMeetingType === 'external' ? draft.externalMeetingUrl : undefined,
          onlineMeetingType: draft.onlineMeetingType,
          roomId: draft.roomId,
          roomBookingId,
          location: draft.location,
          recordingIds: [],
        };
        meetings = [createdMeeting, ...meetings];
      }

      if (draft.roomId && meetingId && roomBookingId) {
        const roomBooking: RoomBookingRecord = {
          id: roomBookingId,
          roomId: draft.roomId,
          date: draft.date,
          title: draft.title,
          host: draft.organizer,
          department: '信息管理部',
          startSlot: timeToSlot(draft.startTime),
          endSlot: Math.max(timeToSlot(draft.startTime) + 1, timeToSlot(draft.endTime)),
          meetingId,
          mine: true,
        };
        roomBookings = [roomBooking, ...roomBookings];
      }

      const nextState = { meetings, recordings: state.recordings, roomBookings, calendarEvents };
      persist(nextState);
      return { meetings, roomBookings, calendarEvents };
    });
    return createdMeeting;
  },
  cancelMeeting: (id, operator) => set((state) => {
    const target = state.meetings.find((meeting) => meeting.id === id);
    if (!target) return state;
    const now = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '-');
    const meetings = state.meetings.map((meeting) => meeting.id === id
      ? { ...meeting, status: 'cancelled' as const, cancelledAt: now, cancelledBy: operator }
      : meeting);
    // 已取消：从日历移除、释放会议室占用
    const calendarEvents = state.calendarEvents.filter((event) => event.meetingId !== id);
    const roomBookings = state.roomBookings.filter((booking) => booking.meetingId !== id);
    const nextState = { meetings, recordings: state.recordings, roomBookings, calendarEvents };
    persist(nextState);
    return { meetings, roomBookings, calendarEvents };
  }),
  modifyMeeting: (id, draft) => set((state) => {
    const target = state.meetings.find((meeting) => meeting.id === id);
    if (!target) return state;
    const meetings = state.meetings.map((meeting) => meeting.id === id ? {
      ...meeting,
      title: draft.title,
      scheduledStart: `${draft.date} ${draft.startTime}`,
      scheduledEnd: `${draft.date} ${draft.endTime}`,
      participants: Array.from(new Set([draft.organizer, ...draft.participants])),
      onlineMeetingType: draft.onlineMeetingType,
      externalMeetingUrl: draft.onlineMeetingType === 'external' ? draft.externalMeetingUrl : undefined,
      roomId: draft.roomId,
      location: draft.location,
      reminder: draft.reminder,
      repeatRule: draft.repeatRule,
      description: draft.description,
    } : meeting);
    // 同步日历事件
    const calendarEvents = state.calendarEvents.map((event) => event.meetingId === id ? {
      ...event, date: draft.date, title: draft.title, startTime: draft.startTime, endTime: draft.endTime, location: draft.location,
    } : event);
    // 同步会议室占用：删旧建新
    let roomBookings = state.roomBookings.filter((booking) => booking.meetingId !== id);
    if (draft.roomId) {
      roomBookings = [{
        id: target.roomBookingId ?? `room-booking-${Date.now()}`,
        roomId: draft.roomId, date: draft.date, title: draft.title, host: draft.organizer, department: '信息管理部',
        startSlot: timeToSlot(draft.startTime), endSlot: Math.max(timeToSlot(draft.startTime) + 1, timeToSlot(draft.endTime)),
        meetingId: id, mine: draft.organizer === MAIN_USER_NAME,
      }, ...roomBookings];
    }
    const nextState = { meetings, recordings: state.recordings, roomBookings, calendarEvents };
    persist(nextState);
    return { meetings, roomBookings, calendarEvents };
  }),
  respondMeeting: (id, participant, response) => set((state) => {
    const meetings = state.meetings.map((meeting) => {
      if (meeting.id !== id) return meeting;
      const status = { ...(meeting.participantStatus ?? {}) };
      status[participant] = { ...(status[participant] ?? { response: 'pending' }), response };
      return { ...meeting, participantStatus: status };
    });
    persist({ ...state, meetings });
    return { meetings };
  }),
  checkInOnline: (id, participant) => set((state) => {
    const meetings = state.meetings.map((meeting) => {
      if (meeting.id !== id) return meeting;
      const status = { ...(meeting.participantStatus ?? {}) };
      const current = status[participant] ?? { response: 'pending' };
      // 线上线下签到同频：已签到（任一渠道）则不覆盖，先到先记
      if (current.checkedInAt) return meeting;
      status[participant] = { ...current, checkedInAt: nowText(), checkInMethod: 'online' };
      return { ...meeting, participantStatus: status };
    });
    persist({ ...state, meetings });
    return { meetings };
  }),
  endMeetingWithOutputs: (id) => set((state) => {
    const target = state.meetings.find((meeting) => meeting.id === id);
    if (!target || target.status === 'ended') return state;
    const endedAt = nowText();
    const startedAt = target.actualStart ?? target.scheduledStart;
    const startMs = new Date(startedAt.replace(' ', 'T')).getTime();
    const endMs = new Date(endedAt.replace(' ', 'T')).getTime();
    const scheduledEndMs = new Date(target.scheduledEnd.replace(' ', 'T')).getTime();
    // 原型演示：结束时间超过计划结束时间时按计划窗口截断，避免 mock 数据出现超长时长
    const effectiveEndMs = Number.isFinite(scheduledEndMs) && Number.isFinite(endMs) && endMs > scheduledEndMs ? scheduledEndMs : endMs;
    const duration = Number.isFinite(startMs) && effectiveEndMs > startMs ? Math.floor((effectiveEndMs - startMs) / 1000) : 3600;
    const leftAt = Number.isFinite(scheduledEndMs) && Number.isFinite(endMs) && endMs > scheduledEndMs ? target.scheduledEnd : endedAt;
    const effectiveEndedAt = Number.isFinite(scheduledEndMs) && Number.isFinite(endMs) && endMs > scheduledEndMs ? target.scheduledEnd : endedAt;
    // 会后回流：补全缺失的参会入会/离会明细
    const attendance = { ...(target.attendance ?? {}) };
    for (const name of target.participants) {
      if (!attendance[name]) attendance[name] = { joinedAt: startedAt, leftAt };
    }
    const baseMeetings = state.meetings.map((meeting) => meeting.id === id ? { ...meeting, status: 'ended' as const, actualEnd: effectiveEndedAt, duration, attendance } : meeting);
    // 无录制时生成一条模拟录制（processing → completed），挂到会议 recordingIds
    if (!target.recordingIds.length) {
      const recordingId = `recording-${id}`;
      const recording: MeetingRecording = {
        id: recordingId, name: target.title, source: 'meeting', meetingId: id, createdAt: effectiveEndedAt,
        duration, fileSize: '256 MB', fileName: `${target.title}.mp4`, status: 'processing', transcript: [], actionItems: [],
      };
      const meetings = baseMeetings.map((meeting) => meeting.id === id ? { ...meeting, recordingIds: [recordingId] } : meeting);
      persist({ meetings, recordings: [recording, ...state.recordings], roomBookings: state.roomBookings, calendarEvents: state.calendarEvents });
      window.setTimeout(() => {
        useMeetingStore.getState().updateRecording(recordingId, { status: 'completed', summary: createDemoSummary(), transcript: createDemoTranscript() });
      }, 1600);
      return { meetings, recordings: [recording, ...state.recordings] };
    }
    persist({ meetings: baseMeetings, recordings: state.recordings, roomBookings: state.roomBookings, calendarEvents: state.calendarEvents });
    return { meetings: baseMeetings };
  }),
}));

const nowText = () => new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '-');

export const createMeetingNo = () => Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

export const createDemoSummary = (): MeetingSummary => ({ ...demoSummary });
export const createDemoTranscript = (): TranscriptSegment[] => demoTranscript.map((segment) => ({ ...segment, id: `${segment.id}-${Date.now()}` }));

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
};

export const formatTranscriptTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
