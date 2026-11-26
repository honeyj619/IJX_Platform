import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, Info, MapPin, Paperclip, UserPlus, Video, X } from 'lucide-react';
import ParticipantSelector, { type ParticipantSelection } from '../components/ParticipantSelector';
import RoomPickerDialog, { type RoomPickerItem } from '../components/RoomPickerDialog';
import Modal from '../components/interaction/Modal';
import Popover from '../components/interaction/Popover';
import TaskWindowShell from '../components/interaction/TaskWindowShell';
import { MAIN_USER_AVATAR, MAIN_USER_NAME } from '../data/people';
import { useImStore } from '../store/imStore';
import { type OnlineMeetingType, type ScheduleMeetingDraft, useMeetingStore } from '../store/meetingStore';

type RepeatUnit = '天' | '周' | '月' | '年';
type RepeatMonthRule = 'date' | 'weekday';

interface Draft {
  title: string;
  organizer: string;
  participants: ParticipantSelection[];
  date: string;
  startTime: string;
  endTime: string;
  repeatRule: string;
  reminder: string;
  meetingType: string;
  onlineMeetingType: OnlineMeetingType;
  externalMeetingUrl: string;
  roomId: string;
  location: string;
  description: string;
  reason: string;
  unionChair: string;
  partySecretary: string;
  attachmentNames: string[];
}

/** 日历创建入口使用的会议室清单（含需审批的 2210，与历史日历弹窗保持一致） */
const calendarPickerRooms: RoomPickerItem[] = [
  { id: '6502', name: '6502 会议室', capacity: 20, equipment: ['桌子', '凳子', '电视'], imageTone: 'from-slate-200 via-stone-100 to-slate-300' },
  { id: '6407', name: '6407 会议室', capacity: 40, equipment: ['桌子', '凳子', '投影仪', '电视'], imageTone: 'from-stone-200 via-white to-emerald-100' },
  { id: '6404', name: '6404 会议室', capacity: 6, equipment: ['桌子', '凳子', '电视'], imageTone: 'from-slate-100 via-zinc-200 to-stone-300' },
  { id: '6401', name: '6401 会议室', capacity: 16, equipment: ['桌子', '凳子', '电视', '白板'], imageTone: 'from-stone-100 via-rose-50 to-slate-200' },
  { id: '2210', name: '2210 会议室', capacity: 50, equipment: ['桌子', '凳子', '投影仪', '话筒'], approval: true, imageTone: 'from-stone-200 via-stone-100 to-amber-100' },
  { id: '2203', name: '2203 会议室', capacity: 24, equipment: ['桌子', '凳子', '投影仪'], approval: true, imageTone: 'from-neutral-100 via-white to-slate-200' },
  { id: '2206', name: '2206 会议室', capacity: 30, equipment: ['桌子', '凳子', '投影仪'], approval: true, imageTone: 'from-stone-300 via-stone-100 to-slate-200' },
  { id: '2208', name: '2208 会议室', capacity: 18, equipment: ['桌子', '凳子', '投影仪'], approval: true, imageTone: 'from-slate-200 via-white to-blue-100' },
];

const onlineTypeLabels: Record<OnlineMeetingType, string> = { none: '不使用线上会议', ruyi: '如意会议', external: '其他视频会议' };
const repeatWeekdayOptions = ['日', '一', '二', '三', '四', '五', '六'];
const weekdayOrdinalLabels = ['第1个', '第2个', '第3个', '第4个', '第5个'];
const pad = (value: number) => String(value).padStart(2, '0');
const today = () => { const date = new Date(); return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; };
const timeToMinutes = (time: string) => { const [hour, minute] = time.split(':').map(Number); return hour * 60 + minute; };
const formatDateLabel = (value: string) => {
  const date = new Date(`${value}T00:00:00`); if (Number.isNaN(date.getTime())) return value;
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${weekdays[date.getDay()]}`;
};
const shiftDate = (value: string, offset: number) => {
  const date = new Date(`${value}T00:00:00`); date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const createBaseDraft = (mode: 'calendar' | 'meeting', search: URLSearchParams): Draft => ({
  title: '',
  organizer: MAIN_USER_NAME,
  participants: [],
  date: search.get('date') || today(),
  startTime: search.get('start') || '10:00',
  endTime: search.get('end') || '11:00',
  repeatRule: '不重复',
  reminder: '提前15分钟',
  meetingType: '',
  onlineMeetingType: mode === 'meeting' ? 'ruyi' : 'none',
  externalMeetingUrl: '',
  roomId: search.get('roomId') || '',
  location: '',
  description: '',
  reason: '工会活动',
  unionChair: '',
  partySecretary: '',
  attachmentNames: [],
});

/** 已保存的参与者是姓名/邮箱字符串，编辑时回填为结构化选择项 */
const nameToSelection = (name: string): ParticipantSelection => {
  const isEmail = name.includes('@');
  return {
    id: isEmail ? `email:${name.toLowerCase()}` : `person:${name}`,
    kind: isEmail ? 'email' : 'person',
    label: name,
    email: isEmail ? name : undefined,
  };
};

/** 参与者保存转换：联系人→姓名，群→展开成员姓名，邮箱保留原样；排除召集人与当前用户并去重 */
const expandParticipantNames = (selections: ParticipantSelection[], organizer: string): string[] => {
  const contacts = useImStore.getState().contacts;
  const names: string[] = [];
  selections.forEach((item) => {
    if (item.kind === 'person') {
      names.push(item.label);
    } else if (item.kind === 'group') {
      item.memberIds?.forEach((memberId) => {
        names.push(contacts.find((contact) => contact.id === memberId)?.name ?? memberId);
      });
    } else if (item.email) {
      names.push(item.email);
    }
  });
  return Array.from(new Set(names)).filter((name) => name !== organizer && name !== MAIN_USER_NAME);
};

export default function ScheduleTaskWindow() {
  const location = useLocation();
  const navigate = useNavigate();
  const { meetingId, eventId } = useParams<{ meetingId?: string; eventId?: string }>();
  const mode = location.pathname.includes('/meetings/') ? 'meeting' : 'calendar';
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const meeting = useMeetingStore((state) => meetingId ? state.meetings.find((item) => item.id === meetingId) : undefined);
  const calendarEvent = useMeetingStore((state) => eventId ? state.calendarEvents.find((item) => item.id === eventId) : undefined);
  const meetings = useMeetingStore((state) => state.meetings);
  const createSchedule = useMeetingStore((state) => state.createSchedule);
  const modifyMeeting = useMeetingStore((state) => state.modifyMeeting);
  const updateCalendarEvent = useMeetingStore((state) => state.updateCalendarEvent);

  const initialDraft = useMemo<Draft>(() => {
    if (meeting) return {
      ...createBaseDraft(mode, search),
      title: meeting.title,
      organizer: meeting.organizer,
      participants: meeting.participants.filter((name) => name !== meeting.organizer).map(nameToSelection),
      date: meeting.scheduledStart.slice(0, 10),
      startTime: meeting.scheduledStart.slice(11, 16),
      endTime: meeting.scheduledEnd.slice(11, 16),
      repeatRule: meeting.repeatRule ?? '不重复',
      reminder: meeting.reminder ?? '提前15分钟',
      onlineMeetingType: meeting.onlineMeetingType ?? 'none',
      externalMeetingUrl: meeting.externalMeetingUrl ?? '',
      roomId: meeting.roomId ?? '',
      location: meeting.roomId ? '' : (meeting.location ?? ''),
      description: meeting.description ?? '',
    };
    if (calendarEvent) return {
      ...createBaseDraft(mode, search),
      title: calendarEvent.title,
      date: calendarEvent.date,
      startTime: calendarEvent.startTime ?? '10:00',
      endTime: calendarEvent.endTime ?? '11:00',
      location: calendarEvent.location ?? '',
    };
    return createBaseDraft(mode, search);
  // 初始快照不随跨窗口同步变化，避免覆盖正在编辑的内容
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, meetingId, mode]);

  const [draft, setDraft] = useState(initialDraft);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialDraft));
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);
  const [onlineOptionsOpen, setOnlineOptionsOpen] = useState(false);
  const [repeatMode, setRepeatMode] = useState(initialDraft.repeatRule);
  const [customRepeatOpen, setCustomRepeatOpen] = useState(false);
  const [customRepeatDraft, setCustomRepeatDraft] = useState<{ interval: string; unit: RepeatUnit; weekdays: string[]; monthRule: RepeatMonthRule; endDate: string }>(() => {
    const date = new Date(`${initialDraft.date}T00:00:00`);
    return {
      interval: '1',
      unit: '天',
      weekdays: [repeatWeekdayOptions[Number.isNaN(date.getTime()) ? 0 : date.getDay()]],
      monthRule: 'weekday',
      endDate: shiftDate(initialDraft.date, 30),
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [successText, setSuccessText] = useState('');

  const isMissingTarget = Boolean(meetingId && !meeting) || Boolean(eventId && !calendarEvent);
  const selectedRoom = calendarPickerRooms.find((room) => room.id === draft.roomId);
  const invalidTime = draft.endTime <= draft.startTime;
  const invalidExternalUrl = draft.onlineMeetingType === 'external' && !/^https?:\/\//i.test(draft.externalMeetingUrl.trim());
  const submitDisabled = isMissingTarget || !draft.title.trim() || invalidTime || invalidExternalUrl;
  const isDirty = JSON.stringify(draft) !== savedSnapshot || repeatMode !== initialDraft.repeatRule;
  const participantsForContext = useMemo(() => Array.from(new Set([MAIN_USER_NAME, ...draft.participants.map((item) => item.email ?? item.label)])), [draft.participants]);
  const busyMeetings = useMemo(() => meetings.filter((item) => {
    if (item.id === meetingId || ['cancelled', 'rejected', 'expired'].includes(item.status)) return false;
    return item.scheduledStart.slice(0, 10) === draft.date && item.participants.some((name) => participantsForContext.includes(name));
  }), [draft.date, meetingId, meetings, participantsForContext]);

  const selectedDate = new Date(`${draft.date}T00:00:00`);
  const selectedWeekday = Number.isNaN(selectedDate.getTime()) ? '一' : repeatWeekdayOptions[selectedDate.getDay()];
  const selectedMonthDay = Number.isNaN(selectedDate.getTime()) ? 1 : selectedDate.getDate();
  const selectedMonth = Number.isNaN(selectedDate.getTime()) ? 1 : selectedDate.getMonth() + 1;
  const selectedWeekdayOrdinal = Math.ceil(selectedMonthDay / 7);
  const selectedMonthWeekdayLabel = `${weekdayOrdinalLabels[selectedWeekdayOrdinal - 1] ?? `第${selectedWeekdayOrdinal}个`} 周${selectedWeekday}`;
  const repeatOptions = [
    { value: '不重复', label: '不重复' },
    { value: '每天', label: '每天' },
    { value: `每周${selectedWeekday}`, label: `每周${selectedWeekday}` },
    { value: `每月${selectedMonthWeekdayLabel}`, label: `每月${selectedMonthWeekdayLabel}` },
    { value: `每月${selectedMonthDay}日`, label: `每月${selectedMonthDay}日` },
    { value: `每年${selectedMonth}月${selectedMonthDay}日`, label: `每年${selectedMonth}月${selectedMonthDay}日` },
    { value: '每个工作日（周一至周五）', label: '每个工作日（周一至周五）' },
  ];

  const getCustomRepeatLabel = () => {
    const interval = Math.max(1, Number(customRepeatDraft.interval) || 1);
    let ruleText = '';
    if (customRepeatDraft.unit === '周') {
      const weekdays = customRepeatDraft.weekdays.length > 0 ? customRepeatDraft.weekdays : [selectedWeekday];
      ruleText = `，周${weekdays.join('、周')}`;
    }
    if (customRepeatDraft.unit === '月') {
      ruleText = customRepeatDraft.monthRule === 'date'
        ? `，按日期 ${selectedMonthDay}日`
        : `，按星期 ${selectedMonthWeekdayLabel}`;
    }
    return `每 ${interval} ${customRepeatDraft.unit}${ruleText}，截至 ${customRepeatDraft.endDate || shiftDate(draft.date, 30)}`;
  };

  const handleRepeatModeChange = (value: string) => {
    if (value === 'custom') {
      setRepeatMode('custom');
      setCustomRepeatDraft((prev) => ({ ...prev, weekdays: [selectedWeekday] }));
      setCustomRepeatOpen(true);
      return;
    }
    setRepeatMode(value);
  };

  // Web 原型在同一应用视口内进入任务窗口路由（同页），关闭时回到来源页而非 window.close()；
  // 真实客户端接入原生子窗口后，可由客户端壳接管返回行为。
  const closeWindow = () => {
    const returnTo = search.get('returnTo');
    const safeReturnTo = returnTo?.startsWith('/pc_client/')
      ? returnTo
      : mode === 'meeting' ? '/pc_client/meetings' : '/pc_client/calendar';
    navigate(safeReturnTo, { replace: true });
  };

  const save = () => {
    if (submitDisabled || submitting) return;
    setSubmitting(true);
    const organizer = draft.organizer.trim() || MAIN_USER_NAME;
    const payload: ScheduleMeetingDraft = {
      title: draft.title.trim(),
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      organizer,
      participants: expandParticipantNames(draft.participants, organizer),
      onlineMeetingType: draft.onlineMeetingType,
      externalMeetingUrl: draft.externalMeetingUrl.trim() || undefined,
      roomId: draft.roomId || undefined,
      location: draft.roomId ? `${selectedRoom?.name ?? `${draft.roomId} 会议室`}` : (draft.location.trim() || undefined),
      repeatRule: repeatMode === 'custom' ? getCustomRepeatLabel() : repeatMode,
      reminder: draft.reminder,
      description: draft.description.trim() || undefined,
      createMeeting: draft.onlineMeetingType !== 'none' || Boolean(draft.roomId),
      source: mode === 'meeting' ? 'center' : 'calendar',
    };
    if (meetingId && meeting) modifyMeeting(meetingId, payload);
    else if (eventId && calendarEvent) updateCalendarEvent(eventId, { title: payload.title, date: payload.date, startTime: payload.startTime, endTime: payload.endTime, location: payload.location });
    else createSchedule(payload);
    setSavedSnapshot(JSON.stringify(draft));
    setSuccessText(meetingId || eventId ? '日程已更新，相关页面已同步' : '日程已创建，相关页面已同步');
    window.setTimeout(closeWindow, 650);
  };

  const axisStart = 8 * 60;
  const axisEnd = 23 * 60;
  const axisDuration = axisEnd - axisStart;
  const blockStyle = (start: string, end: string) => {
    const startMinutes = Math.max(axisStart, timeToMinutes(start));
    const endMinutes = Math.min(axisEnd, timeToMinutes(end));
    return { top: `${((startMinutes - axisStart) / axisDuration) * 100}%`, height: `${Math.max(2.5, ((endMinutes - startMinutes) / axisDuration) * 100)}%` };
  };

  return (
    <TaskWindowShell title={meetingId || eventId ? '编辑日程' : '创建日程'} isDirty={isDirty} submitLabel="确定" submitDisabled={submitDisabled} submitting={submitting} onSubmit={save} onClose={closeWindow}>
      <div className="grid h-full min-h-0 grid-cols-[minmax(560px,58fr)_minmax(360px,42fr)] gap-2">
        <section data-requirement-id="ruyi-meetings-schedule" className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(48,49,51,.06)] dark:bg-[#141414]">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-28 pt-5 sm:px-8">
            {isMissingTarget ? (
              <div className="rounded-lg border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">未找到需要编辑的日程，可能已被删除或当前窗口数据已失效。</div>
            ) : (
              <div className="space-y-5">
                <Field label="标题" required>
                  <input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="请输入标题" className="field-control" />
                </Field>

                <Field label="时间" required>
                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                    <input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="field-control" />
                    <div className="relative">
                      <input type="time" value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} className="field-control w-32 pr-8" />
                      <Clock size={15} className="pointer-events-none absolute right-2.5 top-3 text-gray-400" />
                    </div>
                    <div className="relative">
                      <input type="time" value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })} className="field-control w-32 pr-8" />
                      <Clock size={15} className="pointer-events-none absolute right-2.5 top-3 text-gray-400" />
                    </div>
                  </div>
                  {invalidTime && <p className="mt-1 text-xs text-red-500">结束时间必须晚于开始时间</p>}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="周期" required>
                    <div className="flex gap-2">
                      <select value={repeatMode} onChange={(event) => handleRepeatModeChange(event.target.value)} className="field-control">
                        {repeatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        <option value="custom">{repeatMode === 'custom' ? getCustomRepeatLabel() : '自定义'}</option>
                      </select>
                      {repeatMode === 'custom' && (
                        <button type="button" onClick={() => setCustomRepeatOpen(true)} className="h-10 shrink-0 rounded-lg border border-theme-200 px-3 text-sm font-medium text-theme-700 hover:bg-theme-50 dark:border-theme-700 dark:text-theme-300">编辑</button>
                      )}
                    </div>
                  </Field>
                  <Field label="提醒" required>
                    <select value={draft.reminder} onChange={(event) => setDraft({ ...draft, reminder: event.target.value })} className="field-control">
                      <option>不提醒</option>
                      <option>提前5分钟</option>
                      <option>提前15分钟</option>
                      <option>提前30分钟</option>
                      <option>提前1小时</option>
                    </select>
                  </Field>
                </div>

                <Field label="召集人" required>
                  <input value={draft.organizer} onChange={(event) => setDraft({ ...draft, organizer: event.target.value })} className="field-control" />
                </Field>

                <div data-requirement-id="custom-20261028-005">
                  <Field label="参与者" required>
                    <ParticipantSelector
                      value={draft.participants}
                      onChange={(participants) => setDraft({ ...draft, participants })}
                      organizerName={draft.organizer.trim() || MAIN_USER_NAME}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="会议类型" required>
                    <select value={draft.meetingType} onChange={(event) => setDraft({ ...draft, meetingType: event.target.value })} className="field-control">
                      <option value="">请选择会议类型</option>
                      <option>部门例会</option>
                      <option>项目会议</option>
                      <option>评审会议</option>
                    </select>
                  </Field>
                  <Field label="线上会议">
                    <div className="relative">
                      <button type="button" onClick={() => setOnlineOptionsOpen((open) => !open)} className="field-control flex items-center gap-3 text-left">
                        <Video size={16} className="shrink-0 text-theme-600" />
                        <span className="flex-1">{onlineTypeLabels[draft.onlineMeetingType]}</span>
                        <ChevronDown size={15} className={`shrink-0 text-gray-400 transition-transform ${onlineOptionsOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <Popover open={onlineOptionsOpen} onClose={() => setOnlineOptionsOpen(false)} className="absolute left-0 top-12 z-30 w-full overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                        {(['none', 'ruyi', 'external'] as OnlineMeetingType[]).map((type) => (
                          <button key={type} type="button" onClick={() => { setDraft({ ...draft, onlineMeetingType: type }); setOnlineOptionsOpen(false); }} className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${draft.onlineMeetingType === type ? 'font-medium text-theme-700' : 'text-gray-600 dark:text-gray-200'}`}>
                            <span className={`h-4 w-4 shrink-0 rounded-full border ${draft.onlineMeetingType === type ? 'border-theme-600 bg-theme-600 shadow-[inset_0_0_0_3px_white]' : 'border-gray-300'}`} />
                            {onlineTypeLabels[type]}
                          </button>
                        ))}
                      </Popover>
                    </div>
                    {draft.onlineMeetingType === 'ruyi' && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-theme-50 px-3 py-2 text-xs text-theme-700 dark:bg-theme-900/20 dark:text-theme-300">
                        <Info size={14} /> 保存日程后自动生成会议号和入会链接
                      </div>
                    )}
                    {draft.onlineMeetingType === 'external' && (
                      <div className="mt-2">
                        <input value={draft.externalMeetingUrl} onChange={(event) => setDraft({ ...draft, externalMeetingUrl: event.target.value })} placeholder="请输入会议链接，例如 https://..." className="field-control" />
                        {invalidExternalUrl && draft.externalMeetingUrl && <p className="mt-1 text-xs text-red-500">请输入以 http:// 或 https:// 开头的会议链接</p>}
                      </div>
                    )}
                  </Field>
                </div>

                <Field label="会议室">
                  {draft.roomId ? (
                    <div className="field-control flex items-center justify-between">
                      <button type="button" onClick={() => setRoomPickerOpen(true)} className="text-left hover:text-theme-700">{selectedRoom?.id ?? draft.roomId} 会议室</button>
                      <button type="button" onClick={() => setDraft({ ...draft, roomId: '' })} title="移除会议室" className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setRoomPickerOpen(true)} className="field-control flex items-center justify-center gap-2 border-dashed text-theme-700 hover:border-theme-400">
                      <CalendarDays size={16} />+ 添加会议室
                    </button>
                  )}
                </Field>

                {draft.roomId === '2210' && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/10">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                      <Info size={15} /> 2210 会议室需审批，请填写预约缘由
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="活动类型" required>
                        <div className="flex h-10 items-center gap-4 text-sm">
                          {['工会活动', '党员活动'].map((reason) => (
                            <label key={reason} className="flex items-center gap-2">
                              <input type="radio" checked={draft.reason === reason} onChange={() => setDraft({ ...draft, reason })} className="accent-theme-600" />
                              {reason}
                            </label>
                          ))}
                        </div>
                      </Field>
                      {draft.reason === '工会活动' ? (
                        <Field label="分工会主席" required>
                          <input value={draft.unionChair} onChange={(event) => setDraft({ ...draft, unionChair: event.target.value })} placeholder="请选择分工会主席" className="field-control" />
                        </Field>
                      ) : (
                        <Field label="党支部书记" required>
                          <input value={draft.partySecretary} onChange={(event) => setDraft({ ...draft, partySecretary: event.target.value })} placeholder="请选择党支部书记" className="field-control" />
                        </Field>
                      )}
                    </div>
                  </div>
                )}

                <Field label="地点（选填）">
                  <div className="relative">
                    <MapPin size={16} className="pointer-events-none absolute left-3 top-3 text-gray-400" />
                    <input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} disabled={Boolean(draft.roomId)} placeholder={draft.roomId ? `${selectedRoom?.name ?? ''}` : '请输入地点'} className="field-control pl-9 disabled:bg-gray-50" />
                  </div>
                </Field>

                <Field label="描述（选填）">
                  <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={4} placeholder="请输入描述" className="field-control h-auto resize-none py-3" />
                </Field>

                <Field label="会议附件">
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setDraft({ ...draft, attachmentNames: [...draft.attachmentNames, `会议附件${draft.attachmentNames.length + 1}.pdf`] })} className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm text-gray-600 hover:border-theme-400 hover:text-theme-700 dark:border-gray-700 dark:text-gray-200">
                      <Paperclip size={15} />添加会议附件
                    </button>
                    <span className="text-xs text-gray-400">最多上传10个</span>
                    {draft.attachmentNames.map((name) => <span key={name} className="rounded bg-gray-100 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">{name}</span>)}
                  </div>
                </Field>
              </div>
            )}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(48,49,51,.06)] dark:bg-[#141414]">
          <div className="flex h-[74px] shrink-0 items-center gap-3 border-b border-[#e4e7ed] px-6 dark:border-[#414243]">
            <button type="button" onClick={() => setDraft({ ...draft, date: today() })} className="h-10 rounded-lg border border-[#dcdfe6] px-4 text-sm font-medium">今天</button>
            <button type="button" onClick={() => setDraft({ ...draft, date: shiftDate(draft.date, -1) })} className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => setDraft({ ...draft, date: shiftDate(draft.date, 1) })} className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight size={20} /></button>
            <span className="ml-1 text-base font-semibold">{formatDateLabel(draft.date)}</span>
          </div>
          <div className="flex h-[92px] shrink-0 items-center gap-3 border-b border-[#e4e7ed] px-6 dark:border-[#414243]">
            <span className="text-xs text-[#909399]">GMT+8</span>
            <img src={MAIN_USER_AVATAR} alt={MAIN_USER_NAME} className="ml-4 h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0">
              <div className="text-sm font-medium">{MAIN_USER_NAME}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {draft.participants.slice(0, 3).map((item) => <span key={item.id} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-300">{item.label}</span>)}
                {draft.participants.length > 3 && <span className="text-[10px] text-gray-400">+{draft.participants.length - 3}</span>}
              </div>
            </div>
            <UserPlus size={17} className="ml-auto text-gray-400" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <div className="relative h-[900px] min-h-full border-l border-[#e4e7ed] pl-16 dark:border-[#414243]">
              {Array.from({ length: 16 }, (_, index) => 8 + index).map((hour) => (
                <div key={hour} className="relative h-[60px] border-b border-[#e4e7ed] dark:border-[#414243]">
                  <span className="absolute -left-14 -top-2 text-xs text-[#909399]">{pad(hour)}:00</span>
                </div>
              ))}
              <div className="absolute left-16 right-2 rounded-md border border-theme-300 bg-theme-100/80 px-2 py-1 text-xs text-theme-800" style={blockStyle(draft.startTime, draft.endTime)}>
                <div className="truncate font-medium">{draft.title || '当前日程'}</div>
                <div>{draft.startTime}-{draft.endTime}</div>
              </div>
              {busyMeetings.map((item) => (
                <div key={item.id} className="absolute left-[45%] right-2 overflow-hidden rounded-md bg-gray-200/90 px-2 py-1 text-[11px] text-gray-600 dark:bg-gray-700/80 dark:text-gray-300" style={blockStyle(item.scheduledStart.slice(11, 16), item.scheduledEnd.slice(11, 16))}>
                  <div className="truncate font-medium">{item.title}</div>
                  <div>{item.scheduledStart.slice(11, 16)}-{item.scheduledEnd.slice(11, 16)}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <RoomPickerDialog
        open={roomPickerOpen}
        rooms={calendarPickerRooms}
        date={draft.date}
        startTime={draft.startTime}
        endTime={draft.endTime}
        selectedRoomId={draft.roomId}
        excludeMeetingId={meetingId}
        onSelect={(roomId) => setDraft({ ...draft, roomId })}
        onClose={() => setRoomPickerOpen(false)}
      />

      <Modal
        open={customRepeatOpen}
        title="自定义重复"
        onClose={() => setCustomRepeatOpen(false)}
        widthClassName="max-w-[480px]"
        footer={(
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setCustomRepeatOpen(false)} className="h-9 rounded border border-gray-200 px-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-200">取消</button>
            <button type="button" onClick={() => { setRepeatMode('custom'); setCustomRepeatOpen(false); }} className="h-9 rounded bg-theme-600 px-5 text-sm font-medium text-white hover:bg-theme-700">确定</button>
          </div>
        )}
      >
        <div className="space-y-6 px-6 py-5 text-sm">
          <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
            <span className="text-gray-600 dark:text-gray-300">重复频率：</span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex h-10 items-center rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-800">
                <span className="mr-2 shrink-0">每</span>
                <select value={customRepeatDraft.interval} onChange={(event) => setCustomRepeatDraft((prev) => ({ ...prev, interval: event.target.value }))} className="min-w-0 flex-1 border-none bg-transparent outline-none dark:text-gray-100">
                  {Array.from({ length: 30 }, (_, index) => String(index + 1)).map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <select value={customRepeatDraft.unit} onChange={(event) => setCustomRepeatDraft((prev) => ({ ...prev, unit: event.target.value as RepeatUnit, weekdays: event.target.value === '周' && prev.weekdays.length === 0 ? [selectedWeekday] : prev.weekdays }))} className="field-control">
                {(['天', '周', '月', '年'] as RepeatUnit[]).map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
          </div>

          {customRepeatDraft.unit === '周' && (
            <div className="grid grid-cols-[88px_1fr] items-start gap-3">
              <span className="pt-2 text-gray-600 dark:text-gray-300">重复日期：</span>
              <div className="grid grid-cols-7 gap-2">
                {repeatWeekdayOptions.map((weekday) => {
                  const selected = customRepeatDraft.weekdays.includes(weekday);
                  return (
                    <button key={weekday} type="button" onClick={() => setCustomRepeatDraft((prev) => {
                      const exists = prev.weekdays.includes(weekday);
                      const next = exists ? prev.weekdays.filter((item) => item !== weekday) : [...prev.weekdays, weekday];
                      return { ...prev, weekdays: next.length > 0 ? next : [weekday] };
                    })} className={`h-8 rounded border text-sm transition-colors ${selected ? 'border-theme-600 bg-theme-600 font-medium text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-theme-300 hover:text-theme-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}>{weekday}</button>
                  );
                })}
              </div>
            </div>
          )}

          {customRepeatDraft.unit === '月' && (
            <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-3">
              <span className="pt-2 text-gray-600 dark:text-gray-300">重复规则：</span>
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_110px]">
                <input readOnly value={customRepeatDraft.monthRule === 'date' ? `${selectedMonthDay}日` : selectedMonthWeekdayLabel} className="field-control bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-300" />
                <select value={customRepeatDraft.monthRule} onChange={(event) => setCustomRepeatDraft((prev) => ({ ...prev, monthRule: event.target.value as RepeatMonthRule }))} className="field-control">
                  <option value="date">按日期</option>
                  <option value="weekday">按星期</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-3">
            <span className="text-gray-600 dark:text-gray-300">截止时间：</span>
            <input type="date" value={customRepeatDraft.endDate} min={draft.date} onChange={(event) => setCustomRepeatDraft((prev) => ({ ...prev, endDate: event.target.value }))} className="field-control" />
          </div>
        </div>
      </Modal>

      {successText && <div className="fixed left-1/2 top-16 z-[130] -translate-x-1/2 rounded-lg bg-gray-900 px-5 py-3 text-sm text-white shadow-xl">{successText}</div>}
    </TaskWindowShell>
  );
}

function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className={`mb-2 block text-sm font-medium text-[#303133] dark:text-[#e5eaf3] ${required ? "before:mr-0.5 before:text-red-500 before:content-['*']" : ''}`}>{label}</span>
      {children}
    </label>
  );
}
