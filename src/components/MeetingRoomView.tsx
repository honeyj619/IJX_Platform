import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Info, Search, Users } from 'lucide-react';
import { DEFAULT_SCROLL_SLOT, MEETING_SLOT_COUNT, meetingRooms, slotToTime } from '../data/meetingRooms';
import { useMeetingStore } from '../store/meetingStore';
import MeetingScheduleDialog, { type MeetingSchedulePreset } from './MeetingScheduleDialog';

const SLOT_WIDTH = 34;
/** 吉祥红（系统品牌色）——当前时间线 */
const NOW_LINE_COLOR = '#d51f5c';
const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/** 当前时间在 48 槽全天轴上的位置（比例）；非当天返回 null 不画线 */
const nowSlotFloat = (date: string) => {
  const today = new Date();
  if (formatDate(today) !== date) return null;
  return (today.getHours() * 60 + today.getMinutes()) / 30;
};

export default function MeetingRoomView() {
  const roomBookings = useMeetingStore((state) => state.roomBookings);
  const [date, setDate] = useState(formatDate(new Date()));
  const [roomSearch, setRoomSearch] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [drag, setDrag] = useState<{ roomId: string; startSlot: number; endSlot: number } | null>(null);
  const [preset, setPreset] = useState<MeetingSchedulePreset | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 默认滚动到 8:00（原会议室页面规范：时间轴 00–24 全天，默认 8 点紧贴房间列；往前滚可见 0–8 点）
  // sticky 房间列宽 168px 遮挡视口左侧，8:00 槽需落在 168px 之后 → scrollLeft = 16 槽 × 34px
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = DEFAULT_SCROLL_SLOT * SLOT_WIDTH;
    }
  }, []);

  // 与原版筛选保持一致：搜索 + 设备下拉（选项沿用原版设备词表）
  const visibleRooms = useMemo(() => meetingRooms.filter((room) => {
    const matchesQuery = room.name.toLowerCase().includes(roomSearch.trim().toLowerCase());
    return matchesQuery && (!equipmentFilter || room.equipment.includes(equipmentFilter));
  }), [equipmentFilter, roomSearch]);

  const changeDate = (offset: number) => {
    const next = new Date(`${date}T00:00:00`);
    next.setDate(next.getDate() + offset);
    setDate(formatDate(next));
  };

  const getBookingForSlot = (roomId: string, slot: number) =>
    roomBookings.some((booking) => booking.roomId === roomId && booking.date === date && slot >= booking.startSlot && slot < booking.endSlot);

  const startDrag = (roomId: string, slot: number) => {
    if (getBookingForSlot(roomId, slot)) return;
    setDrag({ roomId, startSlot: slot, endSlot: slot + 1 });
  };

  const extendDrag = (roomId: string, slot: number) => {
    if (!drag || drag.roomId !== roomId || getBookingForSlot(roomId, slot)) return;
    setDrag({ ...drag, endSlot: Math.max(drag.startSlot + 1, slot + 1) });
  };

  const finishDrag = () => {
    if (!drag) return;
    setPreset({ roomId: drag.roomId, date, startTime: slotToTime(drag.startSlot), endTime: slotToTime(drag.endSlot) });
    setDrag(null);
  };

  const weekdayLabel = weekdayLabels[new Date(`${date}T00:00:00`).getDay()];
  const nowSlot = nowSlotFloat(date); // 当天才画当前时间线

  return (
    <section className="flex h-full flex-col overflow-hidden">
      {/* 筛选行：原版规范 — 设备下拉 + 前后一天 + 日期 + 星期 + 搜索框 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={equipmentFilter}
          onChange={(event) => setEquipmentFilter(event.target.value)}
          className="h-9 w-44 rounded border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200"
        >
          <option value="">请选择会议设备</option>
          <option value="电视">电视</option>
          <option value="投影仪">投影仪</option>
          <option value="白板">白板</option>
          <option value="话筒">话筒</option>
          <option value="投屏">投屏</option>
          <option value="视频会议">视频会议</option>
        </select>
        <button
          onClick={() => changeDate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 hover:border-theme-500 hover:text-theme-600 dark:border-gray-700"
          title="前一天"
        >
          <ChevronLeft size={18} />
        </button>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="h-9 w-36 rounded border border-theme-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-theme-600 dark:border-theme-700 dark:bg-gray-800 dark:text-slate-100"
        />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{weekdayLabel}</span>
        <button
          onClick={() => changeDate(1)}
          className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 hover:border-theme-500 hover:text-theme-600 dark:border-gray-700"
          title="后一天"
        >
          <ChevronRight size={18} />
        </button>
        <div className="relative h-9 w-56">
          <input
            value={roomSearch}
            onChange={(event) => setRoomSearch(event.target.value)}
            placeholder="请搜索会议室"
            className="h-full w-full rounded border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-600 outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100"
          />
          <Search size={16} className="absolute right-3 top-2.5 text-slate-400" />
        </div>
      </div>

      {/* 琥珀色提示条（原版规范） */}
      <div className="mb-4 flex max-w-[820px] items-center gap-2 border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
        <Info size={16} />
        <span>如需预订会议室，可拖动会议室的白色滑块</span>
      </div>

      {/* 会议室网格（原版视觉：蓝粉交替行 / 粉金预约块 / 需审批红标 / 全天时间轴+当前时间红线） */}
      <div ref={scrollRef} className="flex-1 overflow-auto border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900" onMouseUp={finishDrag}>
        <div className="min-w-[848px]">
          <div className={`grid grid-cols-[168px_1fr] border-b border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800`}>
            <div className="sticky left-0 z-30 flex h-12 items-center justify-center border-r border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200">
              会议室地点
            </div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(24, ${SLOT_WIDTH * 2}px)` }}>
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="flex h-12 items-center justify-center border-r border-slate-200 text-sm font-semibold text-slate-700 last:border-r-0 dark:border-gray-700 dark:text-slate-200">
                  {`${String(hour).padStart(2, '0')}:00`}
                </div>
              ))}
            </div>
          </div>

          {visibleRooms.map((room, rowIndex) => {
            const bookings = roomBookings.filter((booking) => booking.roomId === room.id && booking.date === date);
            const roomSelection = drag?.roomId === room.id ? drag : null;
            return (
              <div key={room.id} className={`grid grid-cols-[168px_1fr] border-b border-slate-200 last:border-b-0 dark:border-gray-700`}>
                {/* 房间列：sticky 固定 + 交替行背景 + 需审批红标（原版规范，横向滚动时保持可见） */}
                <div className={`sticky left-0 z-30 min-h-[70px] border-r border-slate-200 px-3 py-2 dark:border-gray-700 ${rowIndex % 2 === 0 ? 'bg-blue-50 dark:bg-blue-950' : 'bg-rose-50 dark:bg-rose-950'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-base font-semibold text-slate-700 dark:text-slate-100">{room.id}</div>
                    {room.approval && <span className="text-xs font-semibold text-red-500">需审批</span>}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{room.equipment.join('-')}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Users size={12} />
                    {room.capacity}
                  </div>
                </div>
                {/* 时间格：虚线分隔 + crosshair + 粉色拖选高亮 */}
                <div className="relative min-h-[70px] select-none">
                  <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${MEETING_SLOT_COUNT}, ${SLOT_WIDTH}px)` }}>
                    {Array.from({ length: MEETING_SLOT_COUNT }, (_, slot) => {
                      const booked = getBookingForSlot(room.id, slot);
                      return (
                        <div
                          key={slot}
                          onMouseDown={() => startDrag(room.id, slot)}
                          onMouseEnter={() => extendDrag(room.id, slot)}
                          className={`min-h-[70px] border-r border-dotted border-slate-200 last:border-r-0 dark:border-gray-700 ${booked ? 'cursor-not-allowed' : 'cursor-crosshair hover:bg-theme-50/50 dark:hover:bg-theme-900/20'}`}
                        />
                      );
                    })}
                  </div>

                  {/* 吉祥红当前时间线（仅选中的是今天时显示，贯穿本行） */}
                  {nowSlot !== null && nowSlot < MEETING_SLOT_COUNT && (
                    <div
                      className="pointer-events-none absolute top-0 z-20 h-full w-0.5"
                      style={{ left: `${nowSlot * SLOT_WIDTH}px`, backgroundColor: NOW_LINE_COLOR }}
                    />
                  )}

                  {roomSelection && (
                    <div
                      className="pointer-events-none absolute top-0 h-full bg-pink-300/70 ring-1 ring-pink-400"
                      style={{
                        left: `${roomSelection.startSlot / MEETING_SLOT_COUNT * 100}%`,
                        width: `${(roomSelection.endSlot - roomSelection.startSlot) / MEETING_SLOT_COUNT * 100}%`,
                      }}
                    />
                  )}

                  {/* 预约块：我的=粉色 / 他人=棕金色，含标题/时间/发起人/部门（原版规范） */}
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`absolute top-0 z-10 h-full overflow-hidden px-2 py-2 text-xs leading-4 ${booking.mine ? 'bg-pink-300 text-theme-700' : 'bg-[#c89a67]'}`}
                      style={{
                        left: `${booking.startSlot / MEETING_SLOT_COUNT * 100}%`,
                        width: `${(booking.endSlot - booking.startSlot) / MEETING_SLOT_COUNT * 100}%`,
                      }}
                      title={`${booking.title} ${slotToTime(booking.startSlot)}-${slotToTime(booking.endSlot)} · ${booking.host}`}
                    >
                      <div className="truncate whitespace-nowrap font-semibold text-white">{booking.title}</div>
                      <div className="truncate whitespace-nowrap text-white/90">{slotToTime(booking.startSlot)}-{slotToTime(booking.endSlot)}</div>
                      <div className="truncate whitespace-nowrap text-white/90">{booking.host}</div>
                      <div className="truncate whitespace-nowrap text-white/90">{booking.department}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {visibleRooms.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Search size={18} />
              未找到符合条件的会议室
            </div>
          )}
        </div>
      </div>

      <MeetingScheduleDialog open={Boolean(preset)} source="room" preset={preset ?? undefined} onClose={() => setPreset(null)} />
    </section>
  );
}
