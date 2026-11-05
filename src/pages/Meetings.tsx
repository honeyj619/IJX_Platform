import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Camera, Check, ChevronLeft, ChevronRight, CircleAlert, Download, FileVideo, Fullscreen, ListChecks, Mic, MicOff, Pause, Play,
  RefreshCw, Search, Share2, SlidersHorizontal, Users, Video, VideoOff, Volume2, X,
} from 'lucide-react';
import ContactPicker from '../components/ContactPicker';
import MeetingDetailDialog from '../components/MeetingDetailDialog';
import MeetingRtcSimulation from '../components/MeetingRtcSimulation';
import MeetingScheduleDialog from '../components/MeetingScheduleDialog';
import MeetingShell, { type MeetingShellAction } from '../components/MeetingShell';
import { MAIN_USER_NAME, getDemoPerson } from '../data/people';
import {
  createDemoSummary, createDemoTranscript, createMeetingNo, formatDuration, formatTranscriptTime,
  type MeetingRecord, type MeetingRecording, type MeetingSummary, type RecordingSource, type RecordingStatus, useMeetingStore,
} from '../store/meetingStore';

const statusMeta = {
  scheduled: { label: '待开始', className: 'bg-blue-50 text-blue-700' },
  pending_approval: { label: '审批中', className: 'bg-amber-50 text-amber-700' },
  rejected: { label: '已驳回', className: 'bg-red-50 text-red-700' },
  ongoing: { label: '进行中', className: 'bg-emerald-50 text-emerald-700' },
  ended: { label: '已结束', className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: '已取消', className: 'bg-red-50 text-red-600' },
  expired: { label: '已失效', className: 'bg-gray-100 text-gray-500' },
};

const formatDateStr = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number) => { const next = new Date(date); next.setDate(next.getDate() + days); return next; };
type TimeRangePreset = '8d' | '30d' | 'all' | 'custom';

const recordingStatusMeta: Record<RecordingStatus, { label: string; className: string }> = {
  waiting: { label: '等待处理', className: 'bg-amber-50 text-amber-700' },
  processing: { label: '生成中', className: 'bg-blue-50 text-blue-700' },
  completed: { label: '已完成', className: 'bg-emerald-50 text-emerald-700' },
  failed: { label: '生成失败', className: 'bg-red-50 text-red-700' },
  unavailable: { label: '原文件失效', className: 'bg-gray-100 text-gray-600' },
};

const sourceLabels: Record<RecordingSource, string> = {
  meeting: '会议录制',
  screen: '屏幕录制',
  imported: '导入文件',
};

const nowText = () => new Date().toLocaleString('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/\//g, '-');

/** 录制文件在列表中展示的会议名称：优先关联会议的标题，未关联时回退到录制名称 */
const recordingMeetingTitle = (meetings: MeetingRecord[], recording: MeetingRecording) => meetings.find((meeting) => meeting.id === recording.meetingId)?.title ?? recording.name;

function Modal({ title, children, onClose, width = 'max-w-xl' }: { title: string; children: React.ReactNode; onClose: () => void; width?: string }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
      <div className={`w-full ${width} overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800" title="关闭"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DeviceToggles({ micOn, cameraOn, onMicChange, onCameraChange }: {
  micOn: boolean; cameraOn: boolean; onMicChange: (value: boolean) => void; onCameraChange: (value: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          {micOn ? <Mic size={19} className="text-theme-600" /> : <MicOff size={19} className="text-gray-400" />}
          <div><div className="text-sm font-medium text-gray-900 dark:text-white">麦克风</div><select className="mt-1 bg-transparent text-xs text-gray-500 outline-none"><option>系统麦克风</option><option>耳机麦克风</option></select></div>
        </div>
        <button type="button" onClick={() => onMicChange(!micOn)} className={`relative h-6 w-11 rounded-full transition ${micOn ? 'bg-theme-600' : 'bg-gray-300'}`} aria-label="切换麦克风"><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${micOn ? 'left-[22px]' : 'left-0.5'}`} /></button>
      </div>
      <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">{cameraOn ? <Camera size={19} className="text-theme-600" /> : <VideoOff size={19} className="text-gray-400" />}<div className="text-sm font-medium text-gray-900 dark:text-white">摄像头</div></div>
        <button type="button" onClick={() => onCameraChange(!cameraOn)} className={`relative h-6 w-11 rounded-full transition ${cameraOn ? 'bg-theme-600' : 'bg-gray-300'}`} aria-label="切换摄像头"><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${cameraOn ? 'left-[22px]' : 'left-0.5'}`} /></button>
      </div>
    </div>
  );
}

export default function MeetingCenter() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const meetings = useMeetingStore((state) => state.meetings);
  const recordings = useMeetingStore((state) => state.recordings);
  const addMeeting = useMeetingStore((state) => state.addMeeting);
  const updateMeeting = useMeetingStore((state) => state.updateMeeting);
  const updateRecording = useMeetingStore((state) => state.updateRecording);
  const checkInOnline = useMeetingStore((state) => state.checkInOnline);
  const [view, setView] = useState<'meetings' | 'recordings'>(() => routeLocation.pathname.endsWith('/recordings') ? 'recordings' : 'meetings');
  const [dialog, setDialog] = useState<'start' | 'join' | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [detailMeeting, setDetailMeeting] = useState<MeetingRecord | null>(null);
  const [rtcMeeting, setRtcMeeting] = useState<MeetingRecord | null>(null);
  /** 列表"发起会议"的目标会议：非空时开始弹框为"启动已有会议"模式（主题/参与人预填） */
  const [startTarget, setStartTarget] = useState<MeetingRecord | null>(null);
  const [meetingTitle, setMeetingTitle] = useState(`${MAIN_USER_NAME}发起的会议`);
  const [participants, setParticipants] = useState<string[]>([getDemoPerson(1), getDemoPerson(7)]);
  const [password, setPassword] = useState('');
  const [meetingNo, setMeetingNo] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [meetingQuery, setMeetingQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [mineFilter, setMineFilter] = useState<'all' | 'mine'>('all');
  const [formFilter, setFormFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MeetingRecord['status']>('all');
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('all');
  const [customStart, setCustomStart] = useState(formatDateStr(new Date()));
  const [customEnd, setCustomEnd] = useState(formatDateStr(addDays(new Date(), 7)));
  const [recordingQuery, setRecordingQuery] = useState('');
  const [recordingStatusFilter, setRecordingStatusFilter] = useState<'all' | RecordingStatus>('all');
  const [chatContext, setChatContext] = useState<{ conversationName: string } | null>(null);
  const [toast, setToast] = useState('');
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2200); return () => window.clearTimeout(timer); }, [toast]);

  // 聊天跳转上下文（消息页发起会议）
  useEffect(() => {
    const context = (routeLocation.state as { startMeeting?: { conversationName: string; participants: string[] } } | null)?.startMeeting;
    if (!context) return;
    setChatContext({ conversationName: context.conversationName });
    setMeetingTitle(`${context.conversationName}视频会议`);
    setParticipants(context.participants);
    setDialog('start');
    navigate(routeLocation.pathname, { replace: true, state: null });
  }, [navigate, routeLocation.pathname, routeLocation.state]);

  // 录制详情返回恢复
  const returnState = routeLocation.state as { returnView?: 'meetings' | 'recordings'; returnMeetingId?: string } | null;
  useEffect(() => {
    if (returnState?.returnView) setView(returnState.returnView);
    if (returnState?.returnMeetingId) {
      const target = useMeetingStore.getState().meetings.find((m) => m.id === returnState.returnMeetingId);
      if (target) setDetailMeeting(target);
      navigate(routeLocation.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meetingForm = (meeting: MeetingRecord): 'online' | 'offline' | 'hybrid' =>
    meeting.roomId && meeting.onlineMeetingType !== 'none' ? 'hybrid' : meeting.roomId ? 'offline' : 'online';
  const todayStr = formatDateStr(new Date());
  const checkedInCount = (meeting: MeetingRecord) => Object.values(meeting.participantStatus ?? {}).filter((s) => s.checkedInAt).length;

  const activeFilterCount = (mineFilter !== 'all' ? 1 : 0) + (formFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (timeRange !== 'all' ? 1 : 0);

  const filtered = useMemo(() => meetings
    .filter((meeting) => `${meeting.title}${meeting.organizer}${meeting.participants.join('')}`.toLowerCase().includes(meetingQuery.trim().toLowerCase()))
    .filter((meeting) => mineFilter === 'all' || meeting.organizer === MAIN_USER_NAME)
    .filter((meeting) => {
      if (formFilter === 'all') return true;
      const form = meetingForm(meeting);
      return formFilter === 'online' ? form === 'online' || form === 'hybrid' : form === 'offline' || form === 'hybrid';
    })
    .filter((meeting) => statusFilter === 'all' || meeting.status === statusFilter)
    .filter((meeting) => {
      const date = meeting.scheduledStart.slice(0, 10);
      if (timeRange === '8d') return date >= todayStr && date <= formatDateStr(addDays(new Date(), 7));
      if (timeRange === '30d') return date >= todayStr && date <= formatDateStr(addDays(new Date(), 29));
      if (timeRange === 'custom') return date >= customStart && date <= customEnd;
      return true;
    }), [meetings, meetingQuery, mineFilter, formFilter, statusFilter, timeRange, customStart, customEnd, todayStr]);

  // 当前会议按“进行中 > 待开始 > 审批中”排列，终态会议统一进入历史。
  const currentPriority: Record<'ongoing' | 'scheduled' | 'pending_approval', number> = { ongoing: 0, scheduled: 1, pending_approval: 2 };
  const currentMeetings = filtered
    .filter((m): m is MeetingRecord & { status: 'ongoing' | 'scheduled' | 'pending_approval' } => ['ongoing', 'scheduled', 'pending_approval'].includes(m.status))
    .sort((a, b) => currentPriority[a.status] - currentPriority[b.status] || a.scheduledStart.localeCompare(b.scheduledStart));
  const history = filtered.filter((m) => ['ended', 'cancelled', 'rejected', 'expired'].includes(m.status)).sort((a, b) => {
    const keyA = a.actualEnd ?? a.cancelledAt ?? a.statusChangedAt ?? a.scheduledEnd;
    const keyB = b.actualEnd ?? b.cancelledAt ?? b.statusChangedAt ?? b.scheduledEnd;
    return keyB.localeCompare(keyA);
  });

  const clearFilters = () => { setMineFilter('all'); setFormFilter('all'); setStatusFilter('all'); setTimeRange('all'); setMeetingQuery(''); };

  const filteredRecordings = useMemo(() => recordings.filter((recording) => {
    const matchesQuery = recordingMeetingTitle(meetings, recording).toLowerCase().includes(recordingQuery.trim().toLowerCase());
    return matchesQuery && (recordingStatusFilter === 'all' || recording.status === recordingStatusFilter);
  }), [recordings, meetings, recordingQuery, recordingStatusFilter]);

  const startMeeting = () => {
    // 列表"发起会议"：预填弹框确认后启动已有会议（转进行中），不新建
    if (startTarget) {
      const nextTitle = meetingTitle.trim() || startTarget.title;
      const nextParticipants = [MAIN_USER_NAME, ...participants.filter((name) => name !== MAIN_USER_NAME)];
      updateMeeting(startTarget.id, { title: nextTitle, participants: nextParticipants, status: 'ongoing', actualStart: nowText(), onlineStarted: true, roomOpened: true });
      checkInOnline(startTarget.id, MAIN_USER_NAME);
      const started = useMeetingStore.getState().meetings.find((meeting) => meeting.id === startTarget.id);
      setDialog(null);
      setStartTarget(null);
      if (started) setRtcMeeting(started);
      return;
    }
    const id = `meeting-${Date.now()}`;
    const meeting: MeetingRecord = {
      id, meetingNo: createMeetingNo(), title: meetingTitle.trim() || `${MAIN_USER_NAME}发起的会议`, organizer: MAIN_USER_NAME,
      participants: [MAIN_USER_NAME, ...participants.filter((name) => name !== MAIN_USER_NAME)], scheduledStart: nowText(), scheduledEnd: nowText(),
      actualStart: nowText(), status: 'ongoing', password: password || undefined, source: chatContext ? 'chat' : 'center', sourceConversation: chatContext?.conversationName, recordingIds: [],
      onlineMeetingType: 'ruyi', onlineStarted: true, roomOpened: true,
    };
    addMeeting(meeting);
    checkInOnline(id, MAIN_USER_NAME);
    if (chatContext) {
      window.localStorage.setItem('ijx-chat-meeting-card', JSON.stringify({ conversationName: chatContext.conversationName, meetingId: meeting.id, meetingNo: meeting.meetingNo, title: meeting.title, organizer: meeting.organizer, createdAt: Date.now() }));
    }
    setDialog(null);
    setRtcMeeting(meeting);
  };

  const joinMeeting = () => {
    const normalized = meetingNo.replace(/\s/g, '');
    const target = meetings.find((meeting) => meeting.meetingNo.replace(/\s/g, '') === normalized);
    if (target) { setDialog(null); checkInOnline(target.id, MAIN_USER_NAME); updateMeeting(target.id, { onlineStarted: true, roomOpened: true }); setRtcMeeting(target); }
  };

  const downloadRecording = (recording: MeetingRecording) => {
    if (recording.status === 'unavailable') return;
    const blob = new Blob([`如意会议演示文件：${recording.name}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `${recording.fileName}.txt`; anchor.click(); URL.revokeObjectURL(url);
  };

  const shellAction = (action: MeetingShellAction) => {
    if (action === 'schedule') setScheduleOpen(true);
    else if (action === 'join') setDialog('join');
    else if (action === 'start') { setStartTarget(null); setMeetingTitle(`${MAIN_USER_NAME}发起的会议`); setParticipants([getDemoPerson(1), getDemoPerson(7)]); setPassword(''); setDialog('start'); }
  };

  const meetingRow = (meeting: MeetingRecord, historical = false) => {
    const meta = statusMeta[meeting.status];
    const form = meetingForm(meeting);
    const place = meeting.roomId ? `${meeting.roomId} 会议室` : meeting.onlineMeetingType === 'external' ? '外部链接' : meeting.location ?? '--';
    const muted = ['cancelled', 'rejected', 'expired'].includes(meeting.status);
    const meetingRecordings = meeting.recordingIds.map((id) => recordings.find((item) => item.id === id)).filter((item): item is MeetingRecording => Boolean(item));
    const cover = meetingRecordings.find((item) => item.status === 'completed' && item.coverUrl);
    const isOnline = meeting.onlineMeetingType !== 'none';
    const isOrganizer = meeting.organizer === MAIN_USER_NAME;
    // 右侧操作按钮：仅线上会议提供发起/进入；按归属与线上会议状态区分，审批中/终态不展示
    let action: { label: string; kind: 'recording' | 'detail' | 'join' | 'start' } | null = null;
    if (historical && cover) action = { label: '查看录制', kind: 'recording' };
    else if (meeting.status === 'ongoing' && isOnline) {
      if (isOrganizer) action = meeting.onlineStarted ? { label: '进入会议', kind: 'join' } : { label: '发起会议', kind: 'start' };
      else if (meeting.onlineStarted) action = { label: '进入会议', kind: 'join' };
      else action = { label: '加入会议', kind: 'detail' };
    } else if (meeting.status === 'scheduled' && isOnline) {
      action = isOrganizer ? { label: '发起会议', kind: 'start' } : { label: '加入会议', kind: 'detail' };
    }
    const openPrimary = (event: React.MouseEvent) => {
      event.stopPropagation();
      if (action?.kind === 'recording' && cover) { navigate(`/pc_client/meetings/recordings/${cover.id}`, { state: { returnView: 'meetings' } }); return; }
      if (action?.kind === 'join') {
        if (meeting.roomOpened) setToast('已在会议中');
        else { updateMeeting(meeting.id, { onlineStarted: true, roomOpened: true }); checkInOnline(meeting.id, MAIN_USER_NAME); setRtcMeeting(meeting); }
        return;
      }
      if (action?.kind === 'start') { setStartTarget(meeting); setMeetingTitle(meeting.title); setParticipants(meeting.participants.filter((name) => name !== MAIN_USER_NAME)); setPassword(''); setDialog('start'); return; }
      setDetailMeeting(meeting);
    };
    return <div key={meeting.id} role="button" tabIndex={0} onClick={() => setDetailMeeting(meeting)} onKeyDown={(event) => { if (event.key === 'Enter') setDetailMeeting(meeting); }} className={`group flex min-h-[108px] w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-4 text-left transition-colors hover:bg-[#EBEDF0] dark:hover:bg-gray-700/60 ${muted ? 'opacity-65' : ''}`}>
      <div className="w-[88px] shrink-0">
        <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{historyDateLabel(meeting)}</div>
        <div className="mt-1 text-xs text-gray-500">{meeting.scheduledStart.slice(11, 16)} - {meeting.scheduledEnd.slice(11, 16)}</div>
      </div>
      {historical && cover && <button type="button" onClick={openPrimary} className="relative h-[72px] w-[128px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 text-left dark:border-gray-700" title="查看录制">
        <img src={cover.coverUrl} alt="" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-gray-900/25 text-white"><Play size={22} fill="currentColor" /></span>
        {meetingRecordings.length > 1 && <span className="absolute bottom-1.5 right-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10px] text-white">{meetingRecordings.length} 个录制</span>}
      </button>}
      <div className="min-w-0 flex-1 self-stretch py-0.5">
        <div className="flex items-center gap-2"><span className="truncate text-base font-semibold text-gray-900 dark:text-white" title={meeting.title}>{meeting.title}</span><span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${meta.className}`}>{meta.label}</span></div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{form === 'hybrid' ? '混合会议' : form === 'online' ? '线上会议' : '线下会议'} · {place}</div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>召集人 {meeting.organizer}</span><span className="flex items-center gap-1"><Users size={13} />{meeting.participants.length} 人参与</span>
          {checkedInCount(meeting) > 0 && <span>签到 {checkedInCount(meeting)}/{meeting.participants.length}</span>}
          {meeting.duration && <span>时长 {formatDuration(meeting.duration)}</span>}
          {meetingRecordings.length > 0 && <span className="flex items-center gap-1"><FileVideo size={13} />{meetingRecordings.length} 个录制</span>}
        </div>
      </div>
      {action && <button type="button" onClick={openPrimary} className={`h-9 shrink-0 rounded-lg px-4 text-sm font-medium opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 ${['join', 'start'].includes(action.kind) ? 'bg-theme-600 text-white hover:bg-theme-700' : 'border border-gray-200 bg-white text-gray-600 hover:border-theme-300 hover:text-theme-700 dark:border-gray-600 dark:bg-gray-800'}`} data-requirement-id="custom-20261104-002">{action.label}</button>}
    </div>;
  };

  const historyDateLabel = (meeting: MeetingRecord) => (meeting.actualEnd ?? meeting.scheduledEnd).slice(5, 11).replace('-', '/');

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[#F5F7FA] dark:bg-gray-950">
      <MeetingShell onAction={shellAction}>
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 dark:border-gray-700">
          <div className="flex items-center gap-6" data-requirement-id="ruyi-meetings-tabs">
            <button type="button" onClick={() => setView('meetings')} className={`relative h-11 text-sm font-medium ${view === 'meetings' ? 'text-theme-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>我的会议<span className="ml-1 text-xs font-normal text-gray-400">{filtered.length}</span>{view === 'meetings' && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-t bg-theme-600" />}</button>
            <button type="button" onClick={() => setView('recordings')} className={`relative h-11 text-sm font-medium ${view === 'recordings' ? 'text-theme-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>回顾文件<span className="ml-1 text-xs font-normal text-gray-400">{filteredRecordings.length}</span>{view === 'recordings' && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-t bg-theme-600" />}</button>
          </div>
          {view === 'meetings' ? (
            <div className="flex items-center gap-2">
              <div className="relative w-[260px]"><Search size={15} className="absolute left-3 top-2 text-gray-400" /><input value={meetingQuery} onChange={(event) => setMeetingQuery(event.target.value)} placeholder="搜索会议、召集人、参与人" className="h-8 w-full rounded-lg border border-gray-200 bg-[#F5F7FA] pl-8 pr-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-900" /></div>
              <div className="relative">
                <button onClick={() => setFilterOpen(!filterOpen)} className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm ${activeFilterCount > 0 || filterOpen ? 'border-theme-500 text-theme-700' : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300'}`}><SlidersHorizontal size={14} />筛选{activeFilterCount > 0 && <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-theme-600 px-1 text-[10px] font-medium text-white">{activeFilterCount}</span>}</button>
                {filterOpen && <div className="absolute right-0 top-10 z-30 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800" onMouseDown={(event) => event.stopPropagation()}>
                  <div className="space-y-3">
                    <div><div className="mb-1.5 text-xs text-gray-500">会议归属</div><div className="flex gap-1.5">{([['all', '全部'], ['mine', '我发起的']] as const).map(([v, l]) => <button key={v} onClick={() => setMineFilter(v)} className={`h-7 rounded px-2.5 text-xs ${mineFilter === v ? 'border border-theme-500 bg-theme-50 text-theme-700' : 'border border-gray-200 text-gray-600 hover:text-theme-700 dark:border-gray-600 dark:text-gray-300'}`}>{l}</button>)}</div></div>
                    <div><div className="mb-1.5 text-xs text-gray-500">会议形式</div><div className="flex gap-1.5">{([['all', '全部'], ['online', '线上'], ['offline', '线下']] as const).map(([v, l]) => <button key={v} onClick={() => setFormFilter(v)} className={`h-7 rounded px-2.5 text-xs ${formFilter === v ? 'border border-theme-500 bg-theme-50 text-theme-700' : 'border border-gray-200 text-gray-600 hover:text-theme-700 dark:border-gray-600 dark:text-gray-300'}`}>{l}</button>)}</div></div>
                    <div><div className="mb-1.5 text-xs text-gray-500">状态</div><div className="flex flex-wrap gap-1.5">{([['all', '全部'], ['ongoing', '进行中'], ['scheduled', '待开始'], ['pending_approval', '审批中'], ['ended', '已结束'], ['cancelled', '已取消'], ['rejected', '已驳回'], ['expired', '已失效']] as const).map(([v, l]) => <button key={v} onClick={() => setStatusFilter(v as typeof statusFilter)} className={`h-7 rounded px-2.5 text-xs ${statusFilter === v ? 'border border-theme-500 bg-theme-50 text-theme-700' : 'border border-gray-200 text-gray-600 hover:text-theme-700 dark:border-gray-600 dark:text-gray-300'}`}>{l}</button>)}</div></div>
                    <div><div className="mb-1.5 text-xs text-gray-500">时间</div><div className="flex flex-wrap gap-1.5">{([['8d', '近8天'], ['30d', '近30天'], ['all', '全部'], ['custom', '自定义']] as const).map(([v, l]) => <button key={v} onClick={() => setTimeRange(v)} className={`h-7 rounded px-2.5 text-xs ${timeRange === v ? 'border border-theme-500 bg-theme-50 text-theme-700' : 'border border-gray-200 text-gray-600 hover:text-theme-700 dark:border-gray-600 dark:text-gray-300'}`}>{l}</button>)}</div>
                      {timeRange === 'custom' && <div className="mt-2 flex items-center gap-1.5"><input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="h-7 rounded border border-gray-200 bg-white px-1.5 text-xs dark:border-gray-600 dark:bg-gray-900" aria-label="开始日期" /><span className="text-xs text-gray-400">至</span><input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="h-7 rounded border border-gray-200 bg-white px-1.5 text-xs dark:border-gray-600 dark:bg-gray-900" aria-label="结束日期" /></div>}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 dark:border-gray-700"><button onClick={clearFilters} className="text-xs text-gray-500 hover:text-theme-700">清空筛选</button><button onClick={() => setFilterOpen(false)} className="h-7 rounded bg-theme-600 px-3 text-xs font-medium text-white hover:bg-theme-700">完成</button></div>
                  </div>
                </div>}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative w-[240px]"><Search size={15} className="absolute left-3 top-2 text-gray-400" /><input value={recordingQuery} onChange={(event) => setRecordingQuery(event.target.value)} placeholder="搜索会议名称" className="h-8 w-full rounded-lg border border-gray-200 bg-[#F5F7FA] pl-8 pr-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-900" /></div>
              <select value={recordingStatusFilter} onChange={(event) => setRecordingStatusFilter(event.target.value as 'all' | RecordingStatus)} className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-sm dark:border-gray-700 dark:bg-gray-900"><option value="all">全部状态</option>{Object.entries(recordingStatusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select>
            </div>
          )}
        </header>
        {view === 'meetings' ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4" data-requirement-id="custom-20261104-001">
            {currentMeetings.length > 0 && <section>
              <div className="mb-2 flex items-end gap-3"><h2 className="text-base font-semibold text-gray-900 dark:text-white">当前会议 <span className="text-xs font-normal text-gray-400">{currentMeetings.length} 场</span></h2><span className="text-xs text-gray-400">进行中、待开始和审批中的会议</span></div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700/60">{currentMeetings.map((m) => meetingRow(m))}</div>
            </section>}
            {history.length > 0 && <section className="mt-5">
              <h2 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">历史会议</h2>
              <div className="relative ml-1 border-l border-gray-200 pl-4 dark:border-gray-700">
                {history.map((m) => <div key={m.id} className="relative"><span className={`absolute -left-[21px] top-8 h-2 w-2 rounded-full ${m.status === 'ended' ? 'bg-theme-500' : 'bg-gray-300'}`} />{meetingRow(m, true)}</div>)}
              </div>
            </section>}
            {filtered.length === 0 && <div className="py-20 text-center text-sm text-gray-400">{activeFilterCount > 0 || meetingQuery ? '没有符合条件的会议' : '暂无会议，点击左侧「预定会议」开始'}</div>}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400"><CircleAlert size={13} />签到人数为“已扫码签到 / 总人数”；线上含如意会议与外部视频，混合会议同时命中线上与线下筛选</div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            {filteredRecordings.length === 0 ? <div className="py-20 text-center text-sm text-gray-400">没有符合条件的录制文件</div> : <div className="divide-y divide-gray-100 dark:divide-gray-700/60" data-requirement-id="ruyi-meetings-recordings">{filteredRecordings.map((recording) => {
              const meta = recordingStatusMeta[recording.status];
              return <div key={recording.id} className="grid grid-cols-[minmax(240px,1.4fr)_150px_100px_90px_170px] items-center py-3">
                <div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-12 shrink-0 items-center justify-center rounded bg-gray-900 text-white"><Video size={16} /></div><div className="min-w-0"><button onClick={() => navigate(`/pc_client/meetings/recordings/${recording.id}`, { state: { returnView: 'recordings' } })} title={recordingMeetingTitle(meetings, recording)} className="max-w-full truncate text-left text-sm font-medium text-gray-900 hover:text-theme-700 dark:text-white">{recordingMeetingTitle(meetings, recording)}</button></div></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{recording.createdAt}</span>
                <div className="text-xs text-gray-500"><div>{recording.duration ? formatDuration(recording.duration) : '--:--'}</div><div className="mt-0.5">{recording.fileSize}</div></div>
                <span className={`w-fit rounded px-2 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>
                <div className="flex items-center justify-end gap-3"><button onClick={() => navigate(`/pc_client/meetings/recordings/${recording.id}`, { state: { returnView: 'recordings' } })} className="text-sm text-theme-600 hover:text-theme-700">查看</button><button onClick={() => downloadRecording(recording)} disabled={recording.status === 'unavailable'} className="text-sm text-gray-600 hover:text-theme-700 disabled:cursor-not-allowed disabled:opacity-40">下载</button>{recording.status === 'failed' && <button onClick={() => { updateRecording(recording.id, { status: 'processing', errorMessage: undefined }); window.setTimeout(() => useMeetingStore.getState().updateRecording(recording.id, { status: 'completed', summary: createDemoSummary(), transcript: createDemoTranscript() }), 1200); }} className="text-sm text-theme-600 hover:text-theme-700">重新生成</button>}</div>
              </div>;
            })}</div>}
          </div>
        )}
      </MeetingShell>

      {detailMeeting && <MeetingDetailDialog meeting={detailMeeting} onClose={() => setDetailMeeting(null)} onEnterRtc={(meeting) => { setDetailMeeting(null); setRtcMeeting(meeting); }} />}

      {rtcMeeting && <MeetingRtcSimulation meeting={rtcMeeting} onClose={() => setRtcMeeting(null)} onEnded={(ended) => { setRtcMeeting(null); setDetailMeeting(null); setToast(`会议已结束，录制与纪要已生成（${ended.title}）`); }} />}

      <MeetingScheduleDialog open={scheduleOpen} source="meetings" onClose={() => setScheduleOpen(false)} onSaved={(id) => { const target = useMeetingStore.getState().meetings.find((m) => m.id === id); if (target) setDetailMeeting(target); }} />

      {toast && <div className="fixed right-8 top-20 z-[95] flex items-center gap-2 rounded bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg"><Check size={15} className="text-emerald-300" />{toast}</div>}

      {dialog === 'start' && <Modal title="发起如意会议" onClose={() => { setDialog(null); setStartTarget(null); }} width="max-w-2xl"><div className="space-y-5 p-6">{startTarget && <p className="rounded-lg bg-theme-50 px-4 py-2.5 text-xs leading-5 text-theme-700">即将启动「{startTarget.title}」，主题与参与人已带入，可调整后点击「开始会议」真正开始。</p>}<label className="block text-sm"><span className="mb-2 block font-medium text-gray-700 dark:text-gray-200">会议主题</span><input value={meetingTitle} onChange={(event) => setMeetingTitle(event.target.value)} className="h-10 w-full rounded border border-gray-200 px-3 outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800" /></label><div><div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">参与人</div><ContactPicker selected={participants} onChange={setParticipants} placeholder="请选择参与人" /></div><label className="block text-sm"><span className="mb-2 block font-medium text-gray-700 dark:text-gray-200">会议密码 <span className="font-normal text-gray-400">选填，6位数字</span></span><input value={password} onChange={(event) => setPassword(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="请输入会议密码" className="h-10 w-full rounded border border-gray-200 px-3 outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800" /></label><DeviceToggles micOn={micOn} cameraOn={cameraOn} onMicChange={setMicOn} onCameraChange={setCameraOn} /></div><div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700"><button onClick={() => { setDialog(null); setStartTarget(null); }} className="h-9 rounded border border-gray-200 px-5 text-sm text-gray-600">取消</button><button onClick={startMeeting} className="h-9 rounded bg-theme-600 px-5 text-sm font-medium text-white hover:bg-theme-700">开始会议</button></div></Modal>}

      {dialog === 'join' && <Modal title="加入如意会议" onClose={() => setDialog(null)}><div className="space-y-5 p-6"><label className="block text-sm"><span className="mb-2 block font-medium text-gray-700 dark:text-gray-200">会议号</span><input value={meetingNo} onChange={(event) => setMeetingNo(event.target.value.replace(/\D/g, '').slice(0, 9).replace(/(\d{3})(?=\d)/g, '$1 '))} placeholder="请输入9位会议号" className="h-10 w-full rounded border border-gray-200 px-3 outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800" /></label><label className="block text-sm"><span className="mb-2 block font-medium text-gray-700 dark:text-gray-200">会议密码 <span className="font-normal text-gray-400">选填</span></span><input value={password} onChange={(event) => setPassword(event.target.value.replace(/\D/g, '').slice(0, 6))} className="h-10 w-full rounded border border-gray-200 px-3 outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800" /></label><DeviceToggles micOn={micOn} cameraOn={cameraOn} onMicChange={setMicOn} onCameraChange={setCameraOn} /></div><div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700"><button onClick={() => setDialog(null)} className="h-9 rounded border border-gray-200 px-5 text-sm text-gray-600">取消</button><button onClick={joinMeeting} disabled={meetingNo.replace(/\s/g, '').length !== 9} className="h-9 rounded bg-theme-600 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300">加入会议</button></div></Modal>}
    </div>
  );
}


export function MeetingRecordingDetail() {
  const { recordingId } = useParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const recording = useMeetingStore((state) => state.recordings.find((item) => item.id === recordingId));
  const meeting = useMeetingStore((state) => state.meetings.find((item) => item.id === recording?.meetingId));
  const updateRecording = useMeetingStore((state) => state.updateRecording);
  const [activeTab, setActiveTab] = useState<'summary' | 'info' | 'actions'>('summary');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [query, setQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState<MeetingSummary | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const returnState = routeLocation.state as { returnView?: 'meetings' | 'recordings'; returnMeetingId?: string } | null;
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 2200); return () => window.clearTimeout(timer); }, [toast]);
  const goBack = () => {
    if (returnState?.returnView === 'meetings') {
      navigate('/pc_client/meetings', returnState.returnMeetingId ? { state: { returnView: 'meetings', returnMeetingId: returnState.returnMeetingId } } : { state: { returnView: 'meetings' } });
      return;
    }
    navigate('/pc_client/meetings/recordings', { state: { returnView: 'recordings' } });
  };

  useEffect(() => {
    if (!playing || !recording || recording.status === 'unavailable') return;
    const timer = window.setInterval(() => setCurrentTime((time) => time >= recording.duration ? 0 : time + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing, recording]);

  const activeSegment = recording?.transcript.find((segment) => currentTime >= segment.start && currentTime < segment.end);
  useEffect(() => { if (activeSegment) segmentRefs.current[activeSegment.id]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [activeSegment?.id]);
  const matches = useMemo(() => recording?.transcript.filter((segment) => segment.text.toLowerCase().includes(query.trim().toLowerCase())) ?? [], [recording, query]);
  if (!recording) return <div className="flex h-full items-center justify-center text-sm text-gray-500">录制文件不存在</div>;
  const meta = recordingStatusMeta[recording.status];
  const jumpTo = (seconds: number) => { setCurrentTime(seconds); setPlaying(true); };
  const retry = () => { updateRecording(recording.id, { status: 'processing', errorMessage: undefined }); window.setTimeout(() => useMeetingStore.getState().updateRecording(recording.id, { status: 'completed', summary: createDemoSummary(), transcript: createDemoTranscript() }), 1400); };
  const downloadCurrentRecording = () => {
    const content = `Recording: ${recording.name}\nFile: ${recording.fileName}\nCreated: ${recording.createdAt}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${recording.fileName}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'));
    return parts.map((part, index) => part.toLowerCase() === query.toLowerCase() ? <mark key={index} className="bg-yellow-200 text-gray-900">{part}</mark> : part);
  };
  const navigateMatch = (direction: number) => { if (!matches.length) return; const next = (matchIndex + direction + matches.length) % matches.length; setMatchIndex(next); jumpTo(matches[next].start); };
  // 纪要分发：复制链接 / 分享给参会人（原型演示）
  const copySummaryLink = async () => {
    try { await navigator.clipboard?.writeText(`${recording.name}\n${window.location.origin}/pc_client/meetings/recordings/${recording.id}`); } catch { /* 无焦点环境忽略剪贴板拒绝 */ }
    setShareOpen(false); setToast('纪要链接已复制');
  };
  const shareToParticipants = () => { setShareOpen(false); setToast('已分享给参会人（原型演示）'); };
  // 纪要编辑：对齐妙记二创，编辑摘要后写回 store
  const startEditSummary = () => { setEditingSummary(true); setSummaryDraft(recording.summary ? JSON.parse(JSON.stringify(recording.summary)) as MeetingSummary : null); };
  const saveSummary = () => { if (summaryDraft) updateRecording(recording.id, { summary: summaryDraft }); setEditingSummary(false); setToast('纪要已更新'); };
  return <div className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50 dark:bg-gray-950"><header className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900"><div className="flex min-w-0 items-center gap-3"><button onClick={() => goBack()} className="rounded p-1.5 text-gray-500 hover:bg-gray-100" title="返回"><ArrowLeft size={19} /></button><div className="min-w-0"><div className="flex items-center gap-2"><h1 className="truncate text-lg font-semibold text-gray-900 dark:text-white">{recording.name}</h1><span className={`shrink-0 rounded px-2 py-1 text-xs ${meta.className}`}>{meta.label}</span></div><p className="mt-1 text-xs text-gray-500">{recording.createdAt} · {sourceLabels[recording.source]} · {recording.fileSize}</p></div></div><div className="flex gap-2"><div className="relative"><button onClick={() => setShareOpen(!shareOpen)} data-requirement-id="ruyi-meetings-post-outputs" className="flex h-9 items-center gap-2 rounded border border-gray-200 px-3 text-sm text-gray-600 hover:text-theme-700 dark:border-gray-600 dark:text-gray-300"><Share2 size={15} />分享纪要</button>{shareOpen && <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"><button onClick={copySummaryLink} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">复制纪要链接</button><button onClick={shareToParticipants} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">分享给参会人</button></div>}</div><button onClick={downloadCurrentRecording} disabled={recording.status === 'unavailable'} className="flex h-9 items-center gap-2 rounded border border-gray-200 px-3 text-sm text-gray-600 hover:text-theme-700 disabled:cursor-not-allowed disabled:text-gray-300"><Download size={15} />下载原文件</button><button onClick={retry} className="flex h-9 items-center gap-2 rounded border border-gray-200 px-3 text-sm text-gray-600 hover:text-theme-700"><RefreshCw size={15} />重新生成纪要</button></div></header><main data-requirement-id="ruyi-meetings-recording-detail" className="grid min-h-0 flex-1 grid-cols-[minmax(0,55%)_minmax(360px,45%)] overflow-hidden"><section className="min-h-0 overflow-y-auto border-r border-gray-200 p-5 dark:border-gray-700"><div ref={playerRef} className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_50%_30%,#334155,#0f172a_70%)] text-white"><div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,transparent_49%,rgba(255,255,255,.08)_50%,transparent_51%),linear-gradient(0deg,transparent_49%,rgba(255,255,255,.06)_50%,transparent_51%)] [background-size:56px_56px]" />{recording.status === 'unavailable' ? <div className="relative text-center"><CircleAlert size={36} className="mx-auto mb-3 text-gray-400" /><div className="font-medium">原始录制文件已失效</div><div className="mt-1 text-sm text-gray-400">已生成的纪要和逐字稿仍可查看</div></div> : <button onClick={() => setPlaying(!playing)} className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25">{playing ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}</button>}<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10"><input type="range" min={0} max={Math.max(recording.duration, 1)} value={currentTime} onChange={(event) => setCurrentTime(Number(event.target.value))} disabled={recording.status === 'unavailable'} className="h-1 w-full accent-theme-500" /><div className="mt-2 flex items-center gap-3 text-xs"><button onClick={() => setPlaying(!playing)} disabled={recording.status === 'unavailable'}>{playing ? <Pause size={16} /> : <Play size={16} />}</button><span>{formatDuration(currentTime)} / {formatDuration(recording.duration)}</span><Volume2 size={16} className="ml-auto" /><button onClick={() => playerRef.current?.requestFullscreen()}><Fullscreen size={16} /></button></div></div></div>{recording.status === 'processing' || recording.status === 'waiting' ? <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-5 py-8 text-center"><RefreshCw size={24} className="mx-auto mb-3 animate-spin text-blue-600" /><div className="font-medium text-blue-900">正在生成会议纪要与逐字稿</div><div className="mt-1 text-sm text-blue-700">处理完成后将自动展示会议产物</div></div> : recording.status === 'failed' ? <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-5 py-6"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 text-red-600" size={20} /><div><div className="font-medium text-red-900">纪要生成失败</div><p className="mt-1 text-sm text-red-700">{recording.errorMessage || '生成过程中发生错误，请重新尝试。'}</p><button onClick={retry} className="mt-3 rounded bg-red-600 px-3 py-1.5 text-sm text-white">重新生成</button></div></div></div> : <div className="mt-5 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"><div className="flex border-b border-gray-100 px-5 pt-3 dark:border-gray-800">{([['summary', '会议纪要'], ['info', '会议信息'], ['actions', '待办事项']] as const).map(([value, label]) => <button key={value} onClick={() => setActiveTab(value)} className={`mr-6 border-b-2 px-1 pb-3 text-sm font-medium ${activeTab === value ? 'border-theme-600 text-theme-700' : 'border-transparent text-gray-500'}`}>{label}</button>)}</div><div className="p-5">{activeTab === 'summary' && (editingSummary && summaryDraft ? <div className="space-y-4 text-sm"><div><h3 className="font-semibold text-gray-900">会议目的</h3><textarea value={summaryDraft.purpose} onChange={(event) => setSummaryDraft({ ...summaryDraft, purpose: event.target.value })} rows={2} className="mt-2 w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800" /></div>{([['discussions', '核心讨论内容'], ['conclusions', '主要结论'], ['risks', '风险与待确认事项'], ['followUps', '后续行动']] as const).map(([key, label]) => <div key={key}><h3 className="font-semibold text-gray-900">{label}</h3><div className="mt-2 space-y-2">{(summaryDraft[key] as string[]).map((item, index) => <input key={index} value={item} onChange={(event) => { const list = [...(summaryDraft[key] as string[])]; list[index] = event.target.value; setSummaryDraft({ ...summaryDraft, [key]: list }); }} className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800" />)}</div></div>)}<div className="flex justify-end gap-2"><button onClick={() => setEditingSummary(false)} className="h-8 rounded border border-gray-200 px-4 text-sm text-gray-600">取消</button><button onClick={saveSummary} className="h-8 rounded bg-theme-600 px-4 text-sm font-medium text-white">保存纪要</button></div></div> : recording.summary ? <div className="space-y-5 text-sm"><div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900">会议纪要</h3><button onClick={startEditSummary} className="text-xs text-theme-600 hover:text-theme-700">编辑纪要</button></div><div><h3 className="font-semibold text-gray-900">会议目的</h3><p className="mt-2 leading-6 text-gray-600">{recording.summary.purpose}</p></div>{[['核心讨论内容', recording.summary.discussions], ['主要结论', recording.summary.conclusions], ['风险与待确认事项', recording.summary.risks], ['后续行动', recording.summary.followUps]].map(([title, items]) => <div key={title as string}><h3 className="font-semibold text-gray-900">{title as string}</h3><ul className="mt-2 space-y-2">{(items as string[]).map((item, index) => <li key={item} className="flex gap-2 leading-6 text-gray-600"><span className="font-medium text-theme-600">{index + 1}.</span>{item}</li>)}</ul></div>)}</div> : <div className="py-8 text-center text-sm text-gray-500">暂无会议纪要</div>)}{activeTab === 'info' && <dl className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">{meeting ? [['会议主题', meeting.title], ['会议号', meeting.meetingNo], ['发起人', meeting.organizer], ['参会人', meeting.participants.join('、')], ['计划时间', `${meeting.scheduledStart} - ${meeting.scheduledEnd.slice(11)}`], ['实际时间', meeting.actualStart || '--'], ['会议地点', meeting.location || '线上会议'], ['持续时长', formatDuration(recording.duration)]] .map(([label, value]) => <div key={label}><dt className="text-gray-400">{label}</dt><dd className="mt-1.5 font-medium text-gray-800">{value}</dd></div>) : [['文件名称', recording.fileName], ['录制来源', sourceLabels[recording.source]], ['创建时间', recording.createdAt], ['文件大小', recording.fileSize], ['持续时长', formatDuration(recording.duration)], ['处理状态', meta.label]].map(([label, value]) => <div key={label}><dt className="text-gray-400">{label}</dt><dd className="mt-1.5 font-medium text-gray-800">{value}</dd></div>)}</dl>}{activeTab === 'actions' && <div>{recording.actionItems.length > 0 && <div className="mb-3 flex items-center justify-between"><span className="text-xs text-gray-400">共 {recording.actionItems.length} 项待办</span><button onClick={() => setToast('已同步到我的待办（原型演示）')} className="text-sm text-theme-600 hover:text-theme-700">同步到我的待办</button></div>}{recording.actionItems.length ? <div className="space-y-3">{recording.actionItems.map((item) => <div key={item.id} className="grid grid-cols-[24px_1fr_100px_100px] items-center gap-3 border-b border-gray-100 pb-3 text-sm"><span className={`flex h-5 w-5 items-center justify-center rounded border ${item.status === 'completed' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300'}`}>{item.status === 'completed' && <Check size={13} />}</span><span className={item.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}>{item.content}</span><span className="text-gray-500">{item.owner}</span><span className="text-gray-400">{item.dueDate.slice(5)}</span></div>)}</div> : <div className="py-10 text-center"><ListChecks size={30} className="mx-auto mb-2 text-gray-300" /><p className="text-sm text-gray-500">未识别到待办事项</p></div>}</div>}</div></div>}</section><aside className="flex min-h-0 flex-col bg-white dark:bg-gray-900"><div className="shrink-0 border-b border-gray-100 p-5 dark:border-gray-800"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-gray-900 dark:text-white">会议逐字稿</h2><span className="text-xs text-gray-400">{recording.transcript.length} 个片段</span></div><div className="flex items-center gap-2"><div className="relative min-w-0 flex-1"><Search size={15} className="absolute left-3 top-2.5 text-gray-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setMatchIndex(0); }} placeholder="搜索逐字稿" className="h-9 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800" /></div>{query && <><span className="shrink-0 text-xs text-gray-400">{matches.length ? `${matchIndex + 1}/${matches.length}` : '0/0'}</span><button onClick={() => navigateMatch(-1)} className="rounded border border-gray-200 p-1.5 text-gray-500"><ChevronLeft size={15} /></button><button onClick={() => navigateMatch(1)} className="rounded border border-gray-200 p-1.5 text-gray-500"><ChevronRight size={15} /></button></>}</div></div><div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">{recording.transcript.length === 0 ? <div className="py-16 text-center text-sm text-gray-500">逐字稿尚未生成</div> : recording.transcript.map((segment) => { const active = activeSegment?.id === segment.id; return <button key={segment.id} ref={(node) => { segmentRefs.current[segment.id] = node; }} onClick={() => jumpTo(segment.start)} className={`relative flex w-full gap-3 border-b border-gray-100 py-4 text-left transition ${active ? 'bg-theme-50/70' : 'hover:bg-gray-50'}`}><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 ${active ? 'border-theme-600 bg-theme-600' : 'border-theme-400 bg-white'}`} /><div className="min-w-0 flex-1"><div className="flex items-center gap-3"><span className="text-sm font-medium text-gray-800">{segment.speaker}</span><span className="text-xs text-theme-600">{formatTranscriptTime(segment.start)}</span></div><p className="mt-2 text-sm leading-6 text-gray-600">{highlight(segment.text)}</p></div></button>; })}</div></aside></main>{toast && <div className="fixed right-8 top-20 z-[95] flex items-center gap-2 rounded bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg"><Check size={15} className="text-emerald-300" />{toast}</div>}</div>;
}
