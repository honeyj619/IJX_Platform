import { useEffect, useState } from 'react';
import { Mic, MicOff, MonitorUp, PhoneOff, Users, Video, VideoOff, X } from 'lucide-react';
import { MAIN_USER_NAME } from '../data/people';
import { useMeetingStore, type MeetingRecord } from '../store/meetingStore';

interface Props {
  meeting: MeetingRecord;
  /** 离开会议（非结束）：关闭弹框回列表，会议保持进行中 */
  onClose: () => void;
  /** 结束会议：由父组件处理会后回流反馈 */
  onEnded?: (meeting: MeetingRecord) => void;
}

/**
 * 如意会议 RTC 会中弹框（原型演示）。
 * 发起会议/开始会议/加入会议/进入会议都会创建并打开该弹框；
 * 真实会中能力由 RTC 提供（参考上传原型 PC端原型.html P07/P22 会中主界面、P20 结束会议确认）。
 * 以居中弹框呈现，不覆盖客户端页面；结束会议二次确认后触发会后数据回流。
 */
export default function MeetingRtcSimulation({ meeting: initial, onClose, onEnded }: Props) {
  const meeting = useMeetingStore((state) => state.meetings.find((item) => item.id === initial.id)) ?? initial;
  const updateMeeting = useMeetingStore((state) => state.updateMeeting);
  const endMeetingWithOutputs = useMeetingStore((state) => state.endMeetingWithOutputs);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Esc：先关闭结束确认，再离开会议
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (confirmEnd) setConfirmEnd(false);
      else { updateMeeting(meeting.id, { roomOpened: false }); onClose(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmEnd, meeting.id, updateMeeting, onClose]);

  const isHost = meeting.organizer === MAIN_USER_NAME;
  const durationText = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  const leaveRoom = () => { updateMeeting(meeting.id, { roomOpened: false }); onClose(); };
  const endMeeting = () => { endMeetingWithOutputs(meeting.id); onEnded?.(meeting); };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/45 px-6 py-6">
      <div className="flex max-h-[90vh] w-full max-w-[960px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* 顶部：会议信息 + 共享状态 + 计时 + 关闭（离开） */}
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="truncate text-base font-semibold text-gray-900 dark:text-white" title={meeting.title}>{meeting.title}</span>
            {meeting.meetingNo && <span className="shrink-0 rounded bg-theme-50 px-2 py-0.5 text-xs font-medium text-theme-700">会议号 {meeting.meetingNo}</span>}
            {isHost && <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300">主持人</span>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {sharing && <span className="flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><MonitorUp size={13} />正在共享</span>}
            <span className="text-sm tabular-nums text-gray-500">{durationText}</span>
            <button onClick={leaveRoom} title="离开会议" className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"><X size={18} /></button>
          </div>
        </header>

        {/* 中部：宫格视图 或 共享画布占位 */}
        <main className="min-h-0 flex-1 overflow-y-auto p-5">
          {sharing ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-lg bg-[radial-gradient(circle_at_50%_30%,#334155,#0f172a_70%)] text-white">
              <MonitorUp size={40} className="mb-3 text-gray-300" />
              <div className="text-base font-medium">正在共享屏幕</div>
              <div className="mt-1 text-sm text-gray-400">{MAIN_USER_NAME} 正在共享「会议演示画面」</div>
              <div className="mt-6 text-xs text-gray-500">原型演示：真实共享画面由 RTC 提供（参考 PC 端原型 P10 共享屏幕）</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {meeting.participants.map((name) => (
                <div key={name} className="flex min-h-[150px] flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-theme-600 text-base font-semibold text-white">{name.slice(0, 1)}</div>
                  <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-800 dark:text-gray-100">
                    <span className="truncate">{name}</span>
                    {name === meeting.organizer && <span className="shrink-0 rounded bg-theme-50 px-1.5 py-0.5 text-[10px] font-medium text-theme-700">主持人</span>}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                    {name === MAIN_USER_NAME ? (micOn ? <Mic size={13} className="text-emerald-600" /> : <MicOff size={13} />) : <Mic size={13} />}
                    {name === MAIN_USER_NAME ? (cameraOn ? <Video size={13} className="text-emerald-600" /> : <VideoOff size={13} />) : <Video size={13} />}
                    {sharing && name === MAIN_USER_NAME && <span className="text-emerald-600">共享中</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* 底部控制条：麦克风 / 摄像头 / 共享屏幕 / 参会人 / 离开 / 结束会议 */}
        <footer className="flex shrink-0 flex-wrap items-center justify-center gap-3 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
          <button onClick={() => setMicOn(!micOn)} title={micOn ? '静音' : '解除静音'} className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${micOn ? 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300' : 'border-red-200 bg-red-50 text-red-600'}`}>{micOn ? <Mic size={18} /> : <MicOff size={18} />}</button>
          <button onClick={() => setCameraOn(!cameraOn)} title={cameraOn ? '关闭摄像头' : '打开摄像头'} className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${cameraOn ? 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300' : 'border-red-200 bg-red-50 text-red-600'}`}>{cameraOn ? <Video size={18} /> : <VideoOff size={18} />}</button>
          <button onClick={() => setSharing(!sharing)} className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-sm transition-colors ${sharing ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300'}`}><MonitorUp size={16} />{sharing ? '停止共享' : '共享屏幕'}</button>
          <button title={`参会人 ${meeting.participants.length} 人`} className="flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"><Users size={15} />{meeting.participants.length}</button>
          <button onClick={leaveRoom} className="flex h-10 items-center gap-2 rounded-lg border border-red-200 px-4 text-sm text-red-600 hover:bg-red-50"><PhoneOff size={16} />离开会议</button>
          {isHost && <button onClick={() => setConfirmEnd(true)} className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700">结束会议</button>}
        </footer>
      </div>

      {/* 结束会议二次确认 */}
      {confirmEnd && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmEnd(false); }}>
          <div className="w-full max-w-[420px] overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
            <div className="px-6 py-5"><h2 className="text-left text-base font-semibold text-gray-900 dark:text-white">结束会议</h2><p className="mt-3 text-left text-sm leading-6 text-gray-600 dark:text-gray-300">结束会议将解散所有参会人，并生成录制与纪要，是否结束？</p></div>
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700">
              <button onClick={() => setConfirmEnd(false)} className="h-9 rounded border border-gray-200 px-5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">暂不结束</button>
              <button onClick={() => { setConfirmEnd(false); endMeeting(); }} className="h-9 rounded bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700">确认结束</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
