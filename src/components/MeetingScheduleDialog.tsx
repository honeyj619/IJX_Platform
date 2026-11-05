import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Link2, MapPin, X } from 'lucide-react';
import ContactPicker from './ContactPicker';
import { meetingRooms } from '../data/meetingRooms';
import { MAIN_USER_NAME } from '../data/people';
import { type MeetingRecord, type OnlineMeetingType, type ScheduleMeetingDraft, useMeetingStore } from '../store/meetingStore';

export interface MeetingSchedulePreset {
  date?: string;
  startTime?: string;
  endTime?: string;
  roomId?: string;
}

interface Props {
  open: boolean;
  source: 'calendar' | 'meetings' | 'room';
  preset?: MeetingSchedulePreset;
  /** 编辑既有会议：传入后弹框为修改模式，保存走 modifyMeeting */
  editRecord?: MeetingRecord | null;
  onClose: () => void;
  onSaved?: (meetingId?: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function MeetingScheduleDialog({ open, source, preset, editRecord, onClose, onSaved }: Props) {
  const createSchedule = useMeetingStore((state) => state.createSchedule);
  const modifyMeeting = useMeetingStore((state) => state.modifyMeeting);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [participants, setParticipants] = useState<string[]>([]);
  const [onlineType, setOnlineType] = useState<OnlineMeetingType>('none');
  const [externalUrl, setExternalUrl] = useState('');
  const [roomId, setRoomId] = useState('');
  const [location, setLocation] = useState('');
  const [repeatRule, setRepeatRule] = useState('不重复');
  const [reminder, setReminder] = useState('提前15分钟');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editRecord) {
      // 修改模式：用既有会议预填
      setTitle(editRecord.title);
      setDate(editRecord.scheduledStart.slice(0, 10));
      setStartTime(editRecord.scheduledStart.slice(11, 16));
      setEndTime(editRecord.scheduledEnd.slice(11, 16));
      setParticipants(editRecord.participants.filter((name) => name !== editRecord.organizer));
      setOnlineType(editRecord.onlineMeetingType ?? 'none');
      setExternalUrl(editRecord.externalMeetingUrl ?? '');
      setRoomId(editRecord.roomId ?? '');
      setLocation(editRecord.location && !editRecord.roomId ? editRecord.location : '');
      setRepeatRule(editRecord.repeatRule ?? '不重复');
      setReminder(editRecord.reminder ?? '提前15分钟');
      setDescription(editRecord.description ?? '');
      return;
    }
    setTitle('');
    setDate(preset?.date ?? today());
    setStartTime(preset?.startTime ?? '10:00');
    setEndTime(preset?.endTime ?? '11:00');
    setParticipants([]);
    setOnlineType(source === 'meetings' ? 'ruyi' : 'none');
    setExternalUrl('');
    setRoomId(preset?.roomId ?? '');
    setLocation('');
    setRepeatRule('不重复');
    setReminder('提前15分钟');
    setDescription('');
  }, [open, editRecord, preset?.date, preset?.endTime, preset?.roomId, preset?.startTime, source]);

  const selectedRoom = useMemo(() => meetingRooms.find((room) => room.id === roomId), [roomId]);
  const invalidExternalUrl = onlineType === 'external' && !/^https?:\/\//i.test(externalUrl.trim());
  const invalidTime = endTime <= startTime;
  const disabled = !title.trim() || invalidExternalUrl || invalidTime || (source === 'room' && !roomId);

  if (!open) return null;

  const save = () => {
    if (disabled) return;
    if (editRecord) {
      const draft: ScheduleMeetingDraft = {
        title: title.trim(), date, startTime, endTime, organizer: editRecord.organizer,
        participants: Array.from(new Set([editRecord.organizer, ...participants])),
        onlineMeetingType: onlineType, externalMeetingUrl: externalUrl.trim() || undefined,
        roomId: roomId || undefined,
        location: selectedRoom?.name ?? (location.trim() || undefined),
        repeatRule, reminder, description: description.trim() || undefined,
        createMeeting: false,
      };
      modifyMeeting(editRecord.id, draft);
      onSaved?.(editRecord.id);
      onClose();
      return;
    }
    const meeting = createSchedule({
      title: title.trim(), date, startTime, endTime, organizer: MAIN_USER_NAME, participants,
      onlineMeetingType: onlineType, externalMeetingUrl: externalUrl.trim() || undefined,
      roomId: roomId || undefined,
      location: selectedRoom?.name ?? (location.trim() || undefined),
      repeatRule, reminder, description: description.trim() || undefined,
      createMeeting: source !== 'calendar' || onlineType !== 'none' || Boolean(roomId),
    });
    onSaved?.(meeting?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-6" data-requirement-id="ruyi-meetings-schedule">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <div><h2 className="text-base font-semibold text-gray-900 dark:text-white">{editRecord ? '修改会议' : source === 'calendar' ? '创建日程' : '预约会议'}</h2><p className="mt-1 text-xs text-gray-500">{editRecord ? '保存后同步更新日历与会议室占用' : '会议室与线上会议可以独立或组合使用'}</p></div>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100" title="关闭"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <label className="block"><span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">主题</span><input value={title} onChange={(event) => setTitle(event.target.value)} autoFocus placeholder="请输入日程或会议主题" className="h-10 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800" /></label>
          <div><div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">参与人</div><ContactPicker selected={participants} onChange={setParticipants} placeholder="选择参与人" /></div>
          <div className="grid grid-cols-[1.35fr_1fr_1fr] gap-3"><label><span className="mb-2 block text-sm font-medium text-gray-700">日期</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-10 w-full rounded border border-gray-200 px-3 text-sm" /></label><label><span className="mb-2 block text-sm font-medium text-gray-700">开始时间</span><input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className="h-10 w-full rounded border border-gray-200 px-3 text-sm" /></label><label><span className="mb-2 block text-sm font-medium text-gray-700">结束时间</span><input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className="h-10 w-full rounded border border-gray-200 px-3 text-sm" /></label></div>
          <div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-sm font-medium text-gray-700">重复</span><select value={repeatRule} onChange={(event) => setRepeatRule(event.target.value)} className="h-10 w-full rounded border border-gray-200 px-3 text-sm"><option>不重复</option><option>每天</option><option>每周</option><option>每月</option></select></label><label><span className="mb-2 block text-sm font-medium text-gray-700">提醒</span><select value={reminder} onChange={(event) => setReminder(event.target.value)} className="h-10 w-full rounded border border-gray-200 px-3 text-sm"><option>不提醒</option><option>提前5分钟</option><option>提前15分钟</option><option>提前30分钟</option></select></label></div>
          <div><span className="mb-2 block text-sm font-medium text-gray-700">会议方式</span><div className="grid grid-cols-3 gap-2">{([['none', '不使用线上会议'], ['ruyi', '如意会议'], ['external', '其他视频会议']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setOnlineType(value)} className={`h-10 rounded border text-sm ${onlineType === value ? 'border-theme-500 bg-theme-50 text-theme-700' : 'border-gray-200 text-gray-600'}`}>{label}</button>)}</div>{onlineType === 'ruyi' && <p className="mt-2 text-xs text-gray-500">保存后自动生成会议号和入会链接。</p>}{onlineType === 'external' && <div className="relative mt-2"><Link2 size={16} className="absolute left-3 top-3 text-gray-400" /><input value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="请输入以 http:// 或 https:// 开头的会议链接" className="h-10 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-theme-500" />{invalidExternalUrl && externalUrl && <p className="mt-1 text-xs text-red-500">请输入有效的会议链接</p>}</div>}</div>
          <div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-sm font-medium text-gray-700">会议室</span><select value={roomId} onChange={(event) => setRoomId(event.target.value)} className="h-10 w-full rounded border border-gray-200 px-3 text-sm"><option value="">不使用会议室</option>{meetingRooms.map((room) => <option key={room.id} value={room.id}>{room.name} · {room.capacity}人</option>)}</select></label><label><span className="mb-2 block text-sm font-medium text-gray-700">地点</span><div className="relative"><MapPin size={16} className="absolute left-3 top-3 text-gray-400" /><input value={location} onChange={(event) => setLocation(event.target.value)} disabled={Boolean(roomId)} placeholder={selectedRoom?.name ?? '填写其他地点'} className="h-10 w-full rounded border border-gray-200 pl-9 pr-3 text-sm disabled:bg-gray-50" /></div></label></div>
          <label className="block"><span className="mb-2 block text-sm font-medium text-gray-700">描述</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="补充会议议题或日程说明" className="w-full resize-none rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-theme-500" /></label>
          {invalidTime && <p className="text-sm text-red-500">结束时间必须晚于开始时间</p>}
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-6 py-4"><button type="button" onClick={onClose} className="h-9 rounded border border-gray-200 px-5 text-sm text-gray-600">取消</button><button type="button" onClick={save} disabled={disabled} className="flex h-9 items-center gap-2 rounded bg-theme-600 px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300"><CalendarDays size={16} />{editRecord ? '保存修改' : '保存'}</button></div>
      </div>
    </div>
  );
}
