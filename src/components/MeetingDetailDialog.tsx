import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { Check, Copy, FileVideo, MoreHorizontal, Pencil, Play, X } from 'lucide-react';
import { MAIN_USER_NAME } from '../data/people';
import { formatDuration, type MeetingRecord, useMeetingStore } from '../store/meetingStore';
import MeetingScheduleDialog from './MeetingScheduleDialog';

const responseLabels: Record<string, { label: string; textClass: string }> = {
  accepted: { label: '已接受', textClass: 'text-emerald-600' },
  declined: { label: '已拒绝', textClass: 'text-red-500' },
  tentative: { label: '待定', textClass: 'text-amber-600' },
  pending: { label: '未回复', textClass: 'text-gray-400' },
};
const statusMeta = {
  scheduled: { label: '待开始', className: 'bg-blue-50 text-blue-700' },
  pending_approval: { label: '审批中', className: 'bg-amber-50 text-amber-700' },
  rejected: { label: '已驳回', className: 'bg-red-50 text-red-700' },
  ongoing: { label: '进行中', className: 'bg-emerald-50 text-emerald-700' },
  ended: { label: '已结束', className: 'bg-gray-100 text-gray-600' },
  cancelled: { label: '已取消', className: 'bg-red-50 text-red-600' },
  expired: { label: '已失效', className: 'bg-gray-100 text-gray-500' },
} as const;

interface Props {
  meeting: MeetingRecord;
  onClose: () => void;
  /** 进入会议时由父组件接管：关闭弹框并打开 RTC 桥接浮层 */
  onEnterRtc?: (meeting: MeetingRecord) => void;
}

function PersonAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-theme-50 font-semibold text-theme-700 ${size === 'lg' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs'}`}>{name.slice(0, 1)}</span>;
}

/** 会议详情居中弹框：头部/底部固定，中部独立滚动；替代原独立详情路由页 */
export default function MeetingDetailDialog({ meeting: initial, onClose, onEnterRtc }: Props) {
  const navigate = useNavigate();
  const meeting = useMeetingStore((state) => state.meetings.find((item) => item.id === initial.id)) ?? initial;
  const recordings = useMeetingStore(useShallow((state) => state.recordings.filter((item) => item.meetingId === meeting.id)));
  const respondMeeting = useMeetingStore((state) => state.respondMeeting);
  const cancelMeetingAction = useMeetingStore((state) => state.cancelMeeting);
  const updateMeeting = useMeetingStore((state) => state.updateMeeting);
  const checkInOnline = useMeetingStore((state) => state.checkInOnline);
  const endMeetingWithOutputs = useMeetingStore((state) => state.endMeetingWithOutputs);
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(''), 2200); return () => window.clearTimeout(t); }, [toast]);

  // Esc 关闭最上层弹框；外点关闭菜单
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (confirmCancel) setConfirmCancel(false);
      else if (editOpen) setEditOpen(false);
      else if (menuOpen) setMenuOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmCancel, editOpen, menuOpen, onClose]);

  const meta = statusMeta[meeting.status];
  const isCancelled = meeting.status === 'cancelled';
  const isTerminal = ['ended', 'cancelled', 'rejected', 'expired'].includes(meeting.status);
  const isMine = meeting.organizer === MAIN_USER_NAME;
  const isInvitee = !isMine && meeting.participants.includes(MAIN_USER_NAME);
  const canRespond = isInvitee && meeting.status === 'scheduled' && !isCancelled;
  const canCancel = isMine && ['scheduled', 'pending_approval'].includes(meeting.status) && new Date() < new Date(meeting.scheduledStart.replace(' ', 'T'));
  const canExport = isMine && Object.values(meeting.participantStatus ?? {}).some((status) => status.checkedInAt);
  const canEdit = !isTerminal && canCancel;
  const canJoin = ['scheduled', 'ongoing'].includes(meeting.status);
  const statusEntries = Object.entries(meeting.participantStatus ?? {});
  const counts = {
    accepted: statusEntries.filter(([, s]) => s.response === 'accepted').length,
    declined: statusEntries.filter(([, s]) => s.response === 'declined').length,
    tentative: statusEntries.filter(([, s]) => s.response === 'tentative').length,
    pending: statusEntries.filter(([, s]) => s.response === 'pending').length,
  };
  const checkedIn = statusEntries.filter(([, s]) => s.checkedInAt).length;
  const typeLabel = meeting.roomId && meeting.onlineMeetingType !== 'none' ? '混合会议' : meeting.roomId ? '线下会议' : meeting.onlineMeetingType === 'external' ? '外部视频会议' : '如意会议';
  const onlineText = meeting.onlineMeetingType === 'ruyi' ? '如意会议' : meeting.onlineMeetingType === 'external' ? (meeting.externalMeetingUrl ?? '--') : '不使用线上会议';
  const sourceLabel = meeting.source === 'chat' ? '会话发起' : meeting.source === 'calendar' ? '日历预约' : '会议中心';
  const actualTime = meeting.actualStart ? `${meeting.actualStart}${meeting.actualEnd ? ` - ${meeting.actualEnd.slice(11)}` : ' - 进行中'}` : '尚未开始';
  const detailFields: { label: string; value: string; wide?: boolean }[] = [
    { label: '会议类型', value: typeLabel },
    { label: '会议来源', value: sourceLabel },
    { label: '计划时间', value: `${meeting.scheduledStart} - ${meeting.scheduledEnd.slice(11)}`, wide: true },
    { label: '实际时间', value: actualTime, wide: true },
    { label: '会议室', value: meeting.roomId ? `${meeting.roomId} 会议室` : meeting.location ?? '未预定会议室' },
    { label: '线上会议', value: onlineText },
    { label: '会议号', value: meeting.meetingNo || '无' },
    { label: '入会密码', value: meeting.password ? '已设置' : '未设置' },
    { label: '提醒', value: meeting.reminder ?? '不提醒' },
    { label: '重复规则', value: meeting.repeatRule ?? '不重复' },
    ...(meeting.repeatRule && meeting.repeatRule !== '不重复' ? [{ label: '周期结束', value: meeting.repeatEndDate ?? '未设置' }] : []),
    { label: '签到规则', value: meeting.checkInRule ?? (meeting.roomId && meeting.onlineMeetingType !== 'none' ? '线上线下同频签到：会前30分钟至会议结束，先到先记不重复' : meeting.roomId ? '会前30分钟至会议结束可扫码签到' : meeting.onlineMeetingType !== 'none' ? '线上会议入会即签到，签到时间=首次入会时间' : '不需要签到') },
    ...(meeting.duration ? [{ label: '会议时长', value: formatDuration(meeting.duration) }] : []),
    { label: '签到人数', value: `${checkedIn}/${meeting.participants.length}` },
  ];
  const myResponse = meeting.participantStatus?.[MAIN_USER_NAME]?.response ?? 'pending';
  // 参会统计：由 RTC 会后回流 attendance 计算入会/离会/时长
  const attendanceDuration = (joinedAt?: string, leftAt?: string) => {
    if (!joinedAt || !leftAt) return null;
    const start = new Date(joinedAt.replace(' ', 'T')).getTime();
    const end = new Date(leftAt.replace(' ', 'T')).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
    const minutes = Math.round((end - start) / 60000);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return hours > 0 ? `${hours}小时${rest ? `${rest}分` : ''}` : `${minutes}分钟`;
  };
  const attendanceRows = meeting.participants.map((name) => ({ name, record: meeting.attendance?.[name] }));
  const joinedCount = attendanceRows.filter((row) => row.record?.joinedAt).length;
  const avgAttendanceMinutes = (() => {
    const durations = attendanceRows.map((row) => {
      if (!row.record?.joinedAt || !row.record?.leftAt) return null;
      const start = new Date(row.record.joinedAt.replace(' ', 'T')).getTime();
      const end = new Date(row.record.leftAt.replace(' ', 'T')).getTime();
      return Number.isFinite(start) && Number.isFinite(end) && end > start ? Math.round((end - start) / 60000) : null;
    }).filter((value): value is number => value !== null);
    return durations.length ? `${Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)}分钟` : '--';
  })();
  const visible = showAll ? meeting.participants : meeting.participants.slice(0, 9);
  const statusNotice = meeting.status === 'pending_approval'
    ? meeting.approvalNote ?? '会议正在审批，审批通过后将自动确认会议室。'
    : meeting.status === 'rejected'
      ? meeting.approvalNote ?? '会议审批未通过，请调整会议信息后重新提交。'
      : meeting.status === 'cancelled'
        ? `${meeting.cancelledBy ?? meeting.organizer} 于 ${meeting.cancelledAt ?? '未知时间'} 取消了会议。`
        : meeting.status === 'expired'
          ? '会议已超过计划时间且未开始，当前入会信息已失效。'
          : '';

  const copyInvite = async () => {
    await navigator.clipboard?.writeText(`${meeting.title}\n${meeting.meetingNo ? `会议号：${meeting.meetingNo}` : meeting.externalMeetingUrl ? `会议链接：${meeting.externalMeetingUrl}` : `地点：${meeting.location || '待定'}`}`);
    setCopied(true); window.setTimeout(() => setCopied(false), 1200);
  };
  const endMeeting = () => endMeetingWithOutputs(meeting.id);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-6 py-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex max-h-[90vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900" onKeyDown={(event) => event.stopPropagation()}>
        {/* 头部：名称/时间/状态 + 图标操作 */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-7 py-5 dark:border-gray-800">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="truncate text-xl font-semibold text-gray-900 dark:text-white" title={meeting.title}>{meeting.title}</h2>
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${meta.className}`}>{meta.label}</span>
              {isCancelled && meeting.cancelledAt && <span className="text-xs text-gray-400">{meeting.cancelledAt} 取消</span>}
            </div>
            <p className="mt-1.5 text-sm text-gray-500">{meeting.scheduledStart.slice(0, 16)} - {meeting.scheduledEnd.slice(11)} · {typeLabel}{meeting.roomId ? ` · ${meeting.roomId} 会议室` : ''}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button onClick={copyInvite} title={copied ? '已复制邀请' : '复制邀请'} data-requirement-id="ruyi-meetings-invite" className={`flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#EBEDF0] dark:hover:bg-gray-700 ${copied ? 'text-emerald-500' : 'text-gray-500 hover:text-theme-700 dark:text-gray-400'}`}><Copy size={16} />{copied && <Check size={10} className="absolute" />}</button>
            {canEdit && <button onClick={() => setEditOpen(true)} title="编辑会议" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-[#EBEDF0] hover:text-theme-700 dark:text-gray-400 dark:hover:bg-gray-700"><Pencil size={16} /></button>}
            {isMine && !isCancelled && <div className="relative">
              <button onClick={(event) => { event.stopPropagation(); setMenuOpen(!menuOpen); }} title="更多" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-[#EBEDF0] hover:text-theme-700 dark:text-gray-400 dark:hover:bg-gray-700"><MoreHorizontal size={18} /></button>
              {menuOpen && <div className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <button disabled={!canCancel} title={canCancel ? '' : '仅本人发起且未开始的会议可取消'} onClick={() => { setMenuOpen(false); setConfirmCancel(true); }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-200 dark:hover:bg-gray-700">取消会议</button>
                <button disabled={!canExport} title={canExport ? '' : '需本人发起且至少一人已扫码签到'} onClick={() => { setMenuOpen(false); setToast('签到明细.xlsx 已导出'); }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-200 dark:hover:bg-gray-700">导出签到明细</button>
              </div>}
            </div>}
            <button onClick={onClose} title="关闭" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-[#EBEDF0] hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"><X size={16} /></button>
          </div>
        </div>

        {/* 中部：人物、参与反馈、会议信息与会议产物 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
          <section className="border-b border-gray-100 pb-5 dark:border-gray-800">
            <div className="grid grid-cols-2 gap-8">
              {([['召集人', meeting.organizer], ['创建人', meeting.creator ?? meeting.organizer]] as const).map(([label, name]) => (
                <div key={label}>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className="mt-2 flex items-center gap-3"><PersonAvatar name={name} size="lg" /><div><div className="text-sm font-medium text-gray-900 dark:text-white">{name}</div><div className="mt-0.5 text-xs text-gray-400">{label === '召集人' ? '负责会议组织与管理' : '创建此会议'}</div></div></div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5"><h3 className="text-base font-semibold text-gray-900 dark:text-white">参与人</h3><span className="text-sm text-gray-500">共 {meeting.participants.length} 人 · 已签到 {checkedIn}</span></div>
              <div className="flex flex-wrap gap-x-3 text-xs text-gray-500">
                {([['accepted', counts.accepted], ['declined', counts.declined], ['tentative', counts.tentative], ['pending', counts.pending]] as const).map(([key, count]) => <span key={key}>{responseLabels[key].label} {count}</span>)}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-1 lg:grid-cols-3">
              {visible.map((name) => {
                const status = meeting.participantStatus?.[name] ?? { response: 'pending' as const };
                return <div key={name} className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[#F5F7FA] dark:hover:bg-gray-700/50">
                  <PersonAvatar name={name} />
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5"><span className="truncate text-sm text-gray-700 dark:text-gray-200" title={name}>{name}</span>{name === meeting.organizer && <span className="shrink-0 rounded bg-theme-50 px-1.5 py-0.5 text-[10px] text-theme-700">召集人</span>}</div><div className="mt-0.5 flex items-center gap-1.5 text-xs"><span className={responseLabels[status.response].textClass}>{responseLabels[status.response].label}</span>{status.checkedInAt && <span className="truncate text-emerald-600" title={status.checkedInAt}>· 已签到 {status.checkedInAt.slice(11)}</span>}</div></div>
                </div>;
              })}
            </div>
            {meeting.participants.length > 9 && <button onClick={() => setShowAll(!showAll)} className="mt-3 text-sm text-theme-600 hover:text-theme-700">{showAll ? '收起参与人' : `展开全部 ${meeting.participants.length} 人`}</button>}
            {meeting.onlineMeetingType !== 'none' && <div className="mt-2.5 text-xs text-gray-400" data-requirement-id="ruyi-meetings-online-checkin">{meeting.roomId ? '线上线下同频签到：会前30分钟至会议结束，先到先记不重复' : '线上会议入会即签到，签到时间=首次入会时间'}</div>}
          </section>

          <section className="border-b border-gray-100 py-5 dark:border-gray-800" data-requirement-id="ruyi-meetings-attendance">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">参会统计</h3>
              <span className="text-xs text-gray-400">入会明细来自 RTC 会后回流</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-gray-50 px-4 py-2.5 text-sm dark:bg-gray-800">
              <span className="text-gray-500">已入会 <span className="font-medium text-gray-800 dark:text-gray-100">{joinedCount}/{meeting.participants.length}</span> 人</span>
              <span className="text-gray-500">平均时长 <span className="font-medium text-gray-800 dark:text-gray-100">{avgAttendanceMinutes}</span></span>
              <span className="text-gray-500">已签到 <span className="font-medium text-emerald-600">{checkedIn}</span></span>
            </div>
            <div className="mt-3">
              <div className="grid grid-cols-[minmax(0,1fr)_110px_110px_110px] items-center gap-3 border-b border-gray-100 pb-2 text-xs text-gray-400 dark:border-gray-800"><span>姓名</span><span>入会时间</span><span>离会时间</span><span>参会时长</span></div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {attendanceRows.map(({ name, record }) => (
                  <div key={name} className="grid grid-cols-[minmax(0,1fr)_110px_110px_110px] items-center gap-3 py-2.5 text-sm">
                    <span className="truncate text-gray-700 dark:text-gray-200">{name}</span>
                    <span className="text-gray-500">{record?.joinedAt ? record.joinedAt.slice(11) : '--'}</span>
                    <span className="text-gray-500">{record?.leftAt ? record.leftAt.slice(11) : '--'}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-200">{attendanceDuration(record?.joinedAt, record?.leftAt) ?? '--'}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-b border-gray-100 py-5 dark:border-gray-800">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">会议信息</h3>
            {statusNotice && <div className={`mt-3 rounded-lg border px-4 py-3 text-sm leading-5 ${meeting.status === 'rejected' || meeting.status === 'cancelled' ? 'border-red-100 bg-red-50 text-red-700' : meeting.status === 'pending_approval' ? 'border-amber-100 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>{statusNotice}</div>}
            <dl className="mt-3 grid grid-cols-2 gap-x-10">
              {detailFields.map((field) => <div key={field.label} className={`flex min-h-11 items-start gap-4 border-b border-gray-100 py-3 dark:border-gray-800 ${field.wide ? 'col-span-2' : ''}`}><dt className="w-20 shrink-0 text-sm text-gray-500">{field.label}</dt><dd className="min-w-0 flex-1 break-words text-sm font-medium text-gray-800 dark:text-gray-100" title={field.value}>{field.value}</dd></div>)}
            </dl>
          </section>

          {meeting.description && <section className="border-b border-gray-100 py-5 dark:border-gray-800"><h3 className="text-base font-semibold text-gray-900 dark:text-white">会议描述</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-300">{meeting.description}</p></section>}

          <section className="pt-5">
            <div className="flex items-center justify-between"><h3 className="text-base font-semibold text-gray-900 dark:text-white">录制文件</h3>{recordings.length > 0 && <span className="text-xs text-gray-400">共 {recordings.length} 个</span>}</div>
            {recordings.length === 0 ? <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-gray-50 py-7 text-sm text-gray-400 dark:bg-gray-800"><FileVideo size={18} />本次会议暂无录制文件</div> : (
              <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
                {recordings.map((recording) => (
                  <button key={recording.id} onClick={() => navigate(`/pc_client/meetings/recordings/${recording.id}`, { state: { returnView: 'meetings', returnMeetingId: meeting.id } })} className="group flex w-full items-center gap-4 py-3 text-left">
                    <span className="relative flex h-[54px] w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800">{recording.coverUrl ? <img src={recording.coverUrl} alt="" className="h-full w-full object-cover" /> : <FileVideo size={20} />}<span className="absolute inset-0 flex items-center justify-center bg-black/15 text-white opacity-0 transition group-hover:opacity-100"><Play size={18} fill="currentColor" /></span></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-gray-800 group-hover:text-theme-700 dark:text-gray-100">{recording.name}</span><span className="mt-1 block truncate text-xs text-gray-400">{recording.createdAt} · {formatDuration(recording.duration)} · {recording.fileSize}</span></span>
                    <span className="shrink-0 text-xs text-gray-500">{recording.status === 'completed' ? '已完成' : recording.status === 'processing' ? '生成中' : recording.status === 'failed' ? '生成失败' : recording.status === 'unavailable' ? '原文件失效' : '等待处理'}</span>
                    <span className="shrink-0 text-sm text-theme-600">查看</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 底部：受邀回复 + 加入会议 */}
        {(canRespond || (canJoin && meeting.onlineMeetingType === 'ruyi') || (canJoin && meeting.onlineMeetingType === 'external' && meeting.externalMeetingUrl)) && (
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-3 dark:border-gray-800">
            <div className="flex flex-wrap items-center gap-2.5">
              {canRespond && <>
                <span className="text-sm text-gray-600 dark:text-gray-300">你收到会议邀请（当前：{responseLabels[myResponse].label}）</span>
                <div className="flex gap-2">
                  <button onClick={() => respondMeeting(meeting.id, MAIN_USER_NAME, 'accepted')} className={`h-8 rounded px-3 text-xs font-medium ${myResponse === 'accepted' ? 'bg-theme-600 text-white' : 'border border-gray-200 bg-white text-gray-700 hover:border-theme-500 hover:text-theme-700'}`}>接受</button>
                  <button onClick={() => respondMeeting(meeting.id, MAIN_USER_NAME, 'declined')} className={`h-8 rounded px-3 text-xs font-medium ${myResponse === 'declined' ? 'border border-theme-500 bg-theme-50 text-theme-700' : 'border border-gray-200 bg-white text-gray-700 hover:text-theme-700'}`}>拒绝</button>
                  <button onClick={() => respondMeeting(meeting.id, MAIN_USER_NAME, 'tentative')} className={`h-8 rounded px-3 text-xs font-medium ${myResponse === 'tentative' ? 'border border-theme-500 bg-theme-50 text-theme-700' : 'border border-gray-200 bg-white text-gray-700 hover:text-theme-700'}`}>待定</button>
                </div>
              </>}
            </div>
            <div className="flex items-center gap-2">
              {isMine && meeting.status === 'ongoing' && <button onClick={endMeeting} className="h-9 rounded border border-red-200 px-4 text-sm text-red-600 hover:bg-red-50">结束会议</button>}
              {canJoin && meeting.onlineMeetingType === 'ruyi' && <button data-requirement-id="ruyi-meetings-rtc-bridge" onClick={() => { if (meeting.roomOpened) setToast('已在会议中'); else { updateMeeting(meeting.id, { onlineStarted: true, roomOpened: true }); checkInOnline(meeting.id, MAIN_USER_NAME); onEnterRtc?.(meeting); } }} className="h-9 rounded bg-theme-600 px-4 text-sm font-medium text-white hover:bg-theme-700">{meeting.status === 'ongoing' ? '进入会议' : '加入会议'}</button>}
              {canJoin && meeting.onlineMeetingType === 'external' && meeting.externalMeetingUrl && <button onClick={() => window.open(meeting.externalMeetingUrl, '_blank', 'noopener,noreferrer')} className="h-9 rounded bg-theme-600 px-4 text-sm font-medium text-white hover:bg-theme-700">打开会议链接</button>}
            </div>
          </div>
        )}
      </div>

      {toast && <div className="fixed right-8 top-20 z-[95] flex items-center gap-2 rounded bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg"><Check size={15} className="text-emerald-300" />{toast}</div>}

      {confirmCancel && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmCancel(false); }}>
        <div className="w-full max-w-[420px] overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
          <div className="px-6 py-5"><h2 className="text-left text-base font-semibold text-gray-900 dark:text-white">取消会议</h2><p className="mt-3 text-left text-sm leading-6 text-gray-600 dark:text-gray-300">确认取消「{meeting.title}」？取消后将通知全部参会人，并释放会议室占用与日历日程。</p></div>
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700">
            <button onClick={() => setConfirmCancel(false)} className="h-9 rounded border border-gray-200 px-5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">暂不取消</button>
            <button onClick={() => { cancelMeetingAction(meeting.id, MAIN_USER_NAME); setConfirmCancel(false); setToast('会议已取消'); }} className="h-9 rounded bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700">确认取消</button>
          </div>
        </div>
      </div>}

      {editOpen && <MeetingScheduleDialog open source="meetings" editRecord={meeting} onClose={() => setEditOpen(false)} onSaved={() => setToast('会议已更新，日历与会议室已同步')} />}
    </div>
  );
}
