import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, X, Info, Clock, Users, Paperclip } from 'lucide-react';

interface CalendarItem {
  id: string;
  name: string;
  color: string;
  type: 'managed' | 'subscribed';
  checked: boolean;
}

interface Event {
  id: number;
  date: string;
  title: string;
  type: 'meeting' | 'business' | 'vacation' | 'other';
  location?: string;
}

interface MeetingRoom {
  id: string;
  equipment: string;
  capacity: number;
  approval?: boolean;
}

interface RoomBooking {
  id: string;
  roomId: string;
  title: string;
  host: string;
  department: string;
  startSlot: number;
  endSlot: number;
  mine?: boolean;
}

interface RoomSelection {
  roomId: string;
  startSlot: number;
  endSlot: number;
}

const SLOT_WIDTH = 38;
const SLOT_COUNT = 24;
const meetingHours = Array.from({ length: 13 }, (_, index) => 8 + index);

const meetingRooms: MeetingRoom[] = [
  { id: '6502', equipment: '桌子-凳子-电视', capacity: 20 },
  { id: '6407', equipment: '桌子-凳子-投影仪-电视', capacity: 40 },
  { id: '6404', equipment: '桌子-凳子-电视', capacity: 6 },
  { id: '6401', equipment: '桌子-凳子-电视-白板', capacity: 16 },
  { id: '2210', equipment: '桌子-凳子-投影仪-话筒', capacity: 50, approval: true },
  { id: '2203', equipment: '桌子-凳子-投影仪', capacity: 24, approval: true },
  { id: '2206', equipment: '桌子-凳子-投影仪', capacity: 30, approval: true },
  { id: '2208', equipment: '桌子-凳子-投影仪', capacity: 18, approval: true },
];

const roomBookings: RoomBooking[] = [
  { id: 'b1', roomId: '6502', title: 'DSP 09:00盘点', host: '盛靖', department: '信息管理部', startSlot: 2, endSlot: 3 },
  { id: 'b2', roomId: '6502', title: '维修态势感知项目周会', host: '杨曦', department: '信息管理部', startSlot: 4, endSlot: 7 },
  { id: 'b3', roomId: '6502', title: '营销中台周会', host: '杨欢', department: '信息管理部', startSlot: 14, endSlot: 16 },
  { id: 'b4', roomId: '6502', title: '运维协同例会', host: '崔群', department: '信息管理部', startSlot: 16, endSlot: 19 },
  { id: 'b5', roomId: '6407', title: '管理支撑产品处例会', host: '李天翼', department: '信息管理部', startSlot: 17, endSlot: 20, mine: true },
  { id: 'b6', roomId: '6404', title: '南京保障基地沟通', host: '杨新鹏', department: '信息管理部', startSlot: 10, endSlot: 12 },
  { id: 'b7', roomId: '6404', title: '安全会议', host: '唐菲', department: '信息管理部', startSlot: 12, endSlot: 14 },
  { id: 'b8', roomId: '6404', title: '采购例会', host: '汪维', department: '信息管理部', startSlot: 14, endSlot: 17 },
  { id: 'b9', roomId: '6401', title: '旅客服务专题', host: '周荣', department: '信息管理部', startSlot: 2, endSlot: 3 },
  { id: 'b10', roomId: '6401', title: '法宣宣贯会', host: '徐敏', department: '信息管理部', startSlot: 17, endSlot: 20 },
  { id: 'b11', roomId: '2203', title: '武装干部分例会', host: '赵艺楠', department: '地面服务部', startSlot: 10, endSlot: 14 },
];

const events: Event[] = [
  { id: 1, date: '2025-05-01', title: '项目立项会议', type: 'meeting' },
  { id: 2, date: '2025-05-04', title: 'H01253 北京', type: 'business', location: '北京' },
  { id: 3, date: '2025-05-04', title: '午餐', type: 'other' },
  { id: 4, date: '2025-05-22', title: '值班', type: 'other' },
  { id: 5, date: '2025-05-22', title: 'H01253 上海', type: 'business', location: '上海' },
  { id: 6, date: '2025-05-29', title: '0.5天休假', type: 'vacation' },
  { id: 7, date: '2025-05-31', title: '休', type: 'vacation' },
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date('2025-05-22'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'meeting-room' | 'reservation'>('schedule');
  const [calendarList, setCalendarList] = useState<CalendarItem[]>([
    { id: '1', name: '梁吉力', color: 'bg-slate-600', type: 'managed', checked: true },
    { id: '2', name: '我的任务', color: 'bg-pink-500', type: 'managed', checked: true },
    { id: '3', name: '公司日历', color: 'bg-rose-500', type: 'managed', checked: true },
    { id: '4', name: '梁吉力的排班日历', color: 'bg-amber-500', type: 'subscribed', checked: true },
    { id: '5', name: 'honeyLeung', color: 'bg-emerald-500', type: 'subscribed', checked: false },
    { id: '6', name: '张必强', color: 'bg-cyan-500', type: 'subscribed', checked: false },
  ]);
  const [meetingDate, setMeetingDate] = useState('2026-07-30');
  const [roomSearch, setRoomSearch] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [isRoomDragging, setIsRoomDragging] = useState(false);
  const [dragSelection, setDragSelection] = useState<RoomSelection | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDraft, setBookingDraft] = useState({
    title: '',
    organizer: '梁吉力',
    participants: '',
    meetingType: '',
    location: '',
    description: '',
    reason: '工会活动',
    unionChair: '',
    partySecretary: '',
  });

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date('2025-05-22');
    return date.toDateString() === today.toDateString();
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const toggleCalendar = (id: string) => {
    setCalendarList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const filteredRooms = meetingRooms.filter(room => {
    const matchesSearch = !roomSearch || room.id.includes(roomSearch) || room.equipment.includes(roomSearch);
    const matchesEquipment = !equipmentFilter || room.equipment.includes(equipmentFilter);
    return matchesSearch && matchesEquipment;
  });

  const normalizeSelection = (selection: RoomSelection) => ({
    roomId: selection.roomId,
    startSlot: Math.min(selection.startSlot, selection.endSlot),
    endSlot: Math.max(selection.startSlot, selection.endSlot),
  });

  const slotToTime = (slot: number) => {
    const safeSlot = Math.max(0, Math.min(SLOT_COUNT, slot));
    const hour = 8 + Math.floor(safeSlot / 2);
    const minute = safeSlot % 2 === 0 ? '00' : '30';
    return `${String(hour).padStart(2, '0')}:${minute}`;
  };

  const getBookingForSlot = (roomId: string, slot: number) => {
    return roomBookings.find(booking => booking.roomId === roomId && slot >= booking.startSlot && slot < booking.endSlot);
  };

  const handleRoomMouseDown = (roomId: string, slot: number) => {
    if (getBookingForSlot(roomId, slot)) return;
    setIsRoomDragging(true);
    setDragSelection({ roomId, startSlot: slot, endSlot: slot });
  };

  const handleRoomMouseEnter = (roomId: string, slot: number) => {
    if (!isRoomDragging || !dragSelection || dragSelection.roomId !== roomId) return;
    setDragSelection(prev => prev ? { ...prev, endSlot: slot } : prev);
  };

  const finishRoomSelection = () => {
    if (!isRoomDragging || !dragSelection) return;
    setDragSelection(normalizeSelection(dragSelection));
    setIsRoomDragging(false);
    setBookingModalOpen(true);
  };

  const openDefaultBooking = () => {
    setDragSelection({ roomId: '6407', startSlot: 4, endSlot: 5 });
    setBookingModalOpen(true);
  };

  const selectedRange = dragSelection ? normalizeSelection(dragSelection) : { roomId: '6407', startSlot: 4, endSlot: 5 };
  const selectedRoom = meetingRooms.find(room => room.id === selectedRange.roomId) ?? meetingRooms[1];

  const calendarDays = generateCalendarDays();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const managedCalendars = calendarList.filter(c => c.type === 'managed');
  const subscribedCalendars = calendarList.filter(c => c.type === 'subscribed');

  const renderMeetingRoomView = () => (
    <>
      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
        <div className="flex h-full min-w-[920px] flex-col overflow-hidden px-6 py-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 dark:border-gray-700">
            <div className="flex items-center gap-8">
              <button className="pb-3 text-lg font-semibold text-slate-700 dark:text-slate-200">我的会议</button>
              <button className="border-b-2 border-theme-600 pb-3 text-lg font-semibold text-theme-700 dark:text-theme-300">会议室</button>
            </div>
            <div className="text-sm text-slate-500">可拖动空白时间段快速预约会议室</div>
          </div>

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
            </select>
            <button className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 hover:border-theme-500 hover:text-theme-600 dark:border-gray-700">
              <ChevronLeft size={18} />
            </button>
            <input
              type="date"
              value={meetingDate}
              onChange={(event) => setMeetingDate(event.target.value)}
              className="h-9 w-36 rounded border border-theme-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-theme-600 dark:border-theme-700 dark:bg-gray-800 dark:text-slate-100"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">周四</span>
            <button className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600 hover:border-theme-500 hover:text-theme-600 dark:border-gray-700">
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

          <div className="mb-4 flex max-w-[900px] items-center gap-2 border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <Info size={16} />
            <span>如需预订会议室，可拖动会议室的白色滑块</span>
          </div>

          <div
            className="flex-1 overflow-auto border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900"
            onMouseUp={finishRoomSelection}
          >
            <div className="min-w-[1130px]">
              <div className="grid grid-cols-[200px_1fr] border-b border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-12 items-center justify-center border-r border-slate-200 text-sm font-semibold text-slate-700 dark:border-gray-700 dark:text-slate-200">
                  会议室地点
                </div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(12, ${SLOT_WIDTH * 2}px)` }}>
                  {meetingHours.slice(0, 12).map(hour => (
                    <div key={hour} className="flex h-12 items-center justify-center border-r border-slate-200 text-sm font-semibold text-slate-700 last:border-r-0 dark:border-gray-700 dark:text-slate-200">
                      {hour}:00
                    </div>
                  ))}
                </div>
              </div>

              {filteredRooms.map((room, rowIndex) => {
                const roomSelection = dragSelection && normalizeSelection(dragSelection).roomId === room.id
                  ? normalizeSelection(dragSelection)
                  : null;
                const roomBookingList = roomBookings.filter(booking => booking.roomId === room.id);

                return (
                  <div key={room.id} className="grid grid-cols-[200px_1fr] border-b border-slate-200 last:border-b-0 dark:border-gray-700">
                    <div className={`relative min-h-[70px] border-r border-slate-200 px-3 py-2 dark:border-gray-700 ${rowIndex % 2 === 0 ? 'bg-blue-50/60 dark:bg-blue-950/20' : 'bg-rose-50/40 dark:bg-rose-950/10'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-base font-semibold text-slate-700 dark:text-slate-100">{room.id}</div>
                        {room.approval && <span className="text-xs font-semibold text-red-500">需审批</span>}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{room.equipment}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Users size={12} />
                        {room.capacity}
                      </div>
                    </div>
                    <div className="relative min-h-[70px] select-none">
                      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${SLOT_COUNT}, ${SLOT_WIDTH}px)` }}>
                        {Array.from({ length: SLOT_COUNT }).map((_, slot) => {
                          const booking = getBookingForSlot(room.id, slot);
                          return (
                            <div
                              key={slot}
                              onMouseDown={() => handleRoomMouseDown(room.id, slot)}
                              onMouseEnter={() => handleRoomMouseEnter(room.id, slot)}
                              className={`min-h-[70px] border-r border-dotted border-slate-200 last:border-r-0 dark:border-gray-700 ${booking ? 'cursor-not-allowed' : 'cursor-crosshair hover:bg-theme-50/50 dark:hover:bg-theme-900/20'}`}
                            />
                          );
                        })}
                      </div>

                      {roomSelection && (
                        <div
                          className="pointer-events-none absolute top-0 h-full bg-pink-300/70 ring-1 ring-pink-400"
                          style={{
                            left: `${roomSelection.startSlot * SLOT_WIDTH}px`,
                            width: `${(roomSelection.endSlot - roomSelection.startSlot + 1) * SLOT_WIDTH}px`,
                          }}
                        />
                      )}

                      {roomBookingList.map(booking => (
                        <div
                          key={booking.id}
                          className={`absolute top-0 z-10 h-full overflow-hidden px-2 py-2 text-xs leading-4 text-white ${booking.mine ? 'bg-pink-300 text-theme-700' : 'bg-[#c89a67]'}`}
                          style={{
                            left: `${booking.startSlot * SLOT_WIDTH}px`,
                            width: `${(booking.endSlot - booking.startSlot) * SLOT_WIDTH}px`,
                          }}
                        >
                          <div className="truncate whitespace-nowrap font-semibold">{booking.title}</div>
                          <div className="truncate whitespace-nowrap">{slotToTime(booking.startSlot)}-{slotToTime(booking.endSlot)}</div>
                          <div className="truncate whitespace-nowrap">{booking.host}</div>
                          <div className="truncate whitespace-nowrap">{booking.department}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded bg-white shadow-2xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">预约会议</h3>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-800 dark:hover:text-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[1fr_320px] overflow-hidden">
              <div className="overflow-y-auto px-8 py-6">
                <div className="space-y-5">
                  <label className="grid grid-cols-[88px_1fr] items-center gap-3 text-sm">
                    <span className="text-right text-slate-700 before:text-red-500 before:content-['*'] dark:text-slate-200"> 标题:</span>
                    <input
                      value={bookingDraft.title}
                      onChange={(event) => setBookingDraft(prev => ({ ...prev, title: event.target.value }))}
                      placeholder="请输入标题"
                      className="h-9 rounded border border-slate-200 px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100"
                    />
                  </label>

                  <div className="grid grid-cols-[88px_1fr] items-center gap-3 text-sm">
                    <span className="text-right text-slate-700 before:text-red-500 before:content-['*'] dark:text-slate-200"> 时间:</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <input value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} type="date" className="h-9 w-44 rounded border border-slate-200 px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100" />
                      <div className="relative">
                        <input value={slotToTime(selectedRange.startSlot)} readOnly className="h-9 w-32 rounded border border-slate-200 px-3 text-sm outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100" />
                        <Clock size={15} className="absolute right-3 top-2.5 text-slate-400" />
                      </div>
                      <span className="text-slate-400">-</span>
                      <div className="relative">
                        <input value={slotToTime(selectedRange.endSlot + 1)} readOnly className="h-9 w-32 rounded border border-slate-200 px-3 text-sm outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100" />
                        <Clock size={15} className="absolute right-3 top-2.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[88px_1fr] items-start gap-3 text-sm">
                    <span className="pt-2 text-right text-slate-700 before:text-red-500 before:content-['*'] dark:text-slate-200"> 会议室:</span>
                    <div>
                      <button className="mb-3 h-9 rounded border border-slate-200 px-3 text-sm text-slate-600 hover:border-theme-500 hover:text-theme-600 dark:border-gray-700 dark:text-slate-200">
                        选择会议室
                      </button>
                      <div className="flex h-10 items-center justify-between rounded bg-slate-50 px-3 text-sm text-slate-700 dark:bg-gray-800 dark:text-slate-100">
                        <span>{selectedRoom.id}</span>
                        <button onClick={() => setDragSelection(null)} className="text-slate-400 hover:text-slate-700">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <label className="grid grid-cols-[88px_1fr] items-center gap-3 text-sm">
                    <span className="text-right text-slate-700 before:text-red-500 before:content-['*'] dark:text-slate-200"> 周期模式:</span>
                    <select className="h-9 rounded border border-slate-200 px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100">
                      <option>不重复</option>
                      <option>每天</option>
                      <option>每周</option>
                    </select>
                  </label>

                  <label className="grid grid-cols-[88px_1fr] items-center gap-3 text-sm">
                    <span className="text-right text-slate-700 before:text-red-500 before:content-['*'] dark:text-slate-200"> 召集人:</span>
                    <input
                      value={bookingDraft.organizer}
                      onChange={(event) => setBookingDraft(prev => ({ ...prev, organizer: event.target.value }))}
                      className="h-9 rounded border border-slate-200 px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100"
                    />
                  </label>

                  <div className="grid grid-cols-[88px_1fr] items-center gap-3 text-sm">
                    <span className="text-right text-slate-700 before:text-red-500 before:content-['*'] dark:text-slate-200"> 参与者:</span>
                    <div className="flex items-center gap-3">
                      <input
                        value={bookingDraft.participants}
                        onChange={(event) => setBookingDraft(prev => ({ ...prev, participants: event.target.value }))}
                        placeholder="请选择参与者"
                        className="h-9 flex-1 rounded border border-slate-200 px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100"
                      />
                      <button className="text-sm font-medium text-theme-600">+批量添加</button>
                    </div>
                  </div>

                  <label className="grid grid-cols-[88px_1fr] items-center gap-3 text-sm">
                    <span className="text-right text-slate-700 before:text-red-500 before:content-['*'] dark:text-slate-200"> 会议类型:</span>
                    <select
                      value={bookingDraft.meetingType}
                      onChange={(event) => setBookingDraft(prev => ({ ...prev, meetingType: event.target.value }))}
                      className="h-9 rounded border border-slate-200 px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100"
                    >
                      <option value="">请选择会议类型</option>
                      <option>部门例会</option>
                      <option>项目会议</option>
                      <option>评审会议</option>
                    </select>
                  </label>

                  <label className="grid grid-cols-[88px_1fr] items-center gap-3 text-sm">
                    <span className="text-right text-slate-700 before:text-red-500 before:content-['*'] dark:text-slate-200"> 提醒:</span>
                    <select className="h-9 rounded border border-slate-200 px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100">
                      <option>提前15分钟</option>
                      <option>提前30分钟</option>
                      <option>提前1小时</option>
                    </select>
                  </label>

                  {selectedRoom.id === '2210' && (
                    <div className="grid grid-cols-[88px_1fr] items-start gap-3 rounded border border-amber-200 bg-amber-50/70 py-4 pr-4 text-sm dark:border-amber-900/60 dark:bg-amber-950/20">
                      <span className="pt-1 text-right text-slate-700 before:text-red-500 before:content-['*'] dark:text-slate-200"> 预约缘由:</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-xs text-slate-500">活动类型</span>
                          <div className="flex h-9 items-center gap-4">
                            {['工会活动', '党员活动'].map(reason => (
                              <label key={reason} className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                <input
                                  type="radio"
                                  checked={bookingDraft.reason === reason}
                                  onChange={() => setBookingDraft(prev => ({ ...prev, reason }))}
                                  className="accent-theme-600"
                                />
                                {reason}
                              </label>
                            ))}
                          </div>
                        </div>
                        {bookingDraft.reason === '工会活动' ? (
                          <label className="block space-y-1">
                            <span className="text-xs text-slate-500">分工会主席</span>
                            <input
                              value={bookingDraft.unionChair}
                              onChange={(event) => setBookingDraft(prev => ({ ...prev, unionChair: event.target.value }))}
                              placeholder="请选择分工会主席"
                              className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100"
                            />
                          </label>
                        ) : (
                          <label className="block space-y-1">
                            <span className="text-xs text-slate-500">党支部书记</span>
                            <input
                              value={bookingDraft.partySecretary}
                              onChange={(event) => setBookingDraft(prev => ({ ...prev, partySecretary: event.target.value }))}
                              placeholder="请选择党支部书记"
                              className="h-9 w-full rounded border border-slate-200 bg-white px-3 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  <label className="grid grid-cols-[88px_1fr] items-start gap-3 text-sm">
                    <span className="pt-2 text-right text-slate-700 dark:text-slate-200">地点(选填):</span>
                    <textarea
                      value={bookingDraft.location}
                      onChange={(event) => setBookingDraft(prev => ({ ...prev, location: event.target.value }))}
                      placeholder="请输入地点"
                      className="min-h-12 rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100"
                    />
                  </label>

                  <label className="grid grid-cols-[88px_1fr] items-start gap-3 text-sm">
                    <span className="pt-2 text-right text-slate-700 dark:text-slate-200">描述(选填):</span>
                    <textarea
                      value={bookingDraft.description}
                      onChange={(event) => setBookingDraft(prev => ({ ...prev, description: event.target.value }))}
                      placeholder="请输入描述"
                      className="min-h-12 rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100"
                    />
                  </label>

                  <div className="grid grid-cols-[88px_1fr] items-center gap-3 text-sm">
                    <span className="text-right text-slate-700 dark:text-slate-200">会议附件:</span>
                    <div className="flex items-center gap-3">
                      <button className="flex h-9 items-center gap-2 rounded border border-slate-200 px-3 text-sm text-slate-600 hover:border-theme-500 hover:text-theme-600 dark:border-gray-700 dark:text-slate-200">
                        <Paperclip size={15} />
                        添加会议附件
                      </button>
                      <span className="text-xs text-slate-400">最多上传10个</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l border-slate-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-950">
                <div className="mb-4 flex items-center justify-center gap-3 text-slate-700 dark:text-slate-200">
                  <ChevronLeft size={16} />
                  <span className="text-lg font-semibold">07月30日 周四</span>
                  <ChevronRight size={16} />
                  <button className="rounded border border-slate-200 px-3 py-1 text-sm dark:border-gray-700">今天</button>
                </div>
                <div className="mb-8 flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-200 text-xl font-semibold text-slate-600">梁</div>
                  <div className="mt-2 text-base font-medium text-slate-700 dark:text-slate-200">梁吉力</div>
                </div>
                <div className="space-y-6">
                  {['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30'].map(time => (
                    <div key={time} className="grid grid-cols-[44px_1fr] items-center gap-3 text-xs text-slate-400">
                      <span>{time}</span>
                      <div className="h-px bg-slate-100 dark:bg-gray-800" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-3 dark:border-gray-700">
              <button
                onClick={() => setBookingModalOpen(false)}
                className="h-9 rounded border border-slate-200 px-5 text-sm text-slate-600 hover:bg-slate-50 dark:border-gray-700 dark:text-slate-200 dark:hover:bg-gray-800"
              >
                取消
              </button>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="h-9 rounded bg-theme-600 px-5 text-sm font-medium text-white hover:bg-theme-700"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
        
      <div className="h-full flex flex-col bg-slate-50 dark:bg-gray-900 w-full">
        {/* 内联工具栏 — tabs + 创建日程 */}
        <div className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 shrink-0">
          <div className="flex items-center bg-gray-100/80 dark:bg-gray-700/80 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'schedule'
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              日历
            </button>
            <button
              onClick={() => setActiveTab('meeting-room')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'meeting-room'
                  ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              会议室
            </button>
          </div>
          <button
            onClick={activeTab === 'meeting-room' ? openDefaultBooking : undefined}
            className="flex items-center gap-2 px-4 py-2 bg-theme-600 text-white rounded-xl text-sm font-medium hover:bg-theme-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            {activeTab === 'meeting-room' ? '预约会议室' : '创建日程'}
          </button>
        </div>

        {activeTab === 'meeting-room' ? renderMeetingRoomView() : (
        <div className="py-0 w-full flex-1 overflow-hidden">
          <div className="flex h-full w-max min-w-full overflow-hidden">
            <div className="w-80 shrink-0 bg-white dark:bg-gray-800 border-r border-slate-200/60 dark:border-gray-700 h-full overflow-y-auto">
              <div className="p-5 border-b border-slate-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-900/20 rounded-lg transition-colors"
                      onClick={() => changeMonth('prev')}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      className="w-8 h-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-900/20 rounded-lg transition-colors"
                      onClick={() => changeMonth('next')}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {weekdays.map((day, index) => (
                    <div key={index} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">
                      {day[1]}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.slice(0, 35).map((item, index) => {
                    const today = isToday(item.date);
                    return (
                      <div 
                        key={index} 
                        className={`w-9 h-9 flex items-center justify-center text-xs ${item.isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'} ${today ? 'bg-theme-600 text-white rounded-full font-bold' : 'hover:bg-theme-50 dark:hover:bg-theme-900/20 rounded-full transition-colors'}`}
                      >
                        {item.day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 border-b border-slate-100 dark:border-gray-700">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400 dark:text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="搜索联系人、公共日历" 
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-gray-700 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-theme-400/50 focus:bg-white dark:focus:bg-gray-700 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-5">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-theme-50 hover:bg-theme-100 text-theme-700 rounded-xl text-sm font-medium transition-colors mb-6 border-2 border-theme-200">
                  <Plus size={18} />
                  <span>添加日历</span>
                </button>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-theme-500 rounded-full" />
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">我管理的</h4>
                  </div>
                  <div className="space-y-1">
                    {managedCalendars.map((calendar) => (
                      <label 
                        key={calendar.id}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={calendar.checked}
                            onChange={() => toggleCalendar(calendar.id)}
                            className="sr-only peer"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${calendar.checked ? `${calendar.color} border-transparent` : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-gray-700 hover:border-slate-400 dark:hover:border-slate-400'}`}>
                            {calendar.checked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${calendar.color} ${!calendar.checked && 'opacity-40'}`} />
                        <span className={`text-sm ${calendar.checked ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{calendar.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-theme-500 rounded-full" />
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">我订阅的</h4>
                  </div>
                  <div className="space-y-1">
                    {subscribedCalendars.map((calendar) => (
                      <label 
                        key={calendar.id}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={calendar.checked}
                            onChange={() => toggleCalendar(calendar.id)}
                            className="sr-only peer"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${calendar.checked ? `${calendar.color} border-transparent` : 'border-slate-300 dark:border-slate-500 bg-white dark:bg-gray-700 hover:border-slate-400 dark:hover:border-slate-400'}`}>
                            {calendar.checked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${calendar.color} ${!calendar.checked && 'opacity-40'}`} />
                        <span className={`text-sm ${calendar.checked ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{calendar.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-full w-[820px] shrink-0 flex-col bg-white dark:bg-gray-800 xl:w-[calc(100vw-20rem)] xl:min-w-[820px]">
              <div className="p-5 border-b border-slate-100 dark:border-gray-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-theme-50 text-theme-700 rounded-xl text-sm font-medium hover:bg-theme-100 transition-colors border border-theme-200">
                    今天
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-900/20 rounded-lg transition-colors"
                      onClick={() => changeMonth('prev')}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      className="w-9 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-theme-600 hover:bg-theme-50 dark:hover:bg-theme-900/20 rounded-lg transition-colors"
                      onClick={() => changeMonth('next')}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h3>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-700 p-1 rounded-xl">
                  <button className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-gray-600 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all hover:shadow-sm">
                    日
                  </button>
                  <button className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-gray-600 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all hover:shadow-sm">
                    周
                  </button>
                  <button className="px-4 py-2 text-sm bg-theme-600 text-white rounded-lg shadow-sm">
                    月
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-gray-700">
                  {weekdays.map((day, index) => (
                    <div key={index} className="py-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-gray-700 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {calendarDays.map((item, index) => {
                    const dateEvents = getEventsForDate(item.date);
                    const today = isToday(item.date);
                    
                    return (
                      <div 
                        key={index} 
                        className={`min-h-[120px] p-3 border-r border-b border-slate-100 dark:border-gray-700 ${index % 7 === 6 ? 'border-r-0' : ''} ${item.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-slate-50/50 dark:bg-gray-800/50'}`}
                      >
                        <div className="flex justify-end mb-2">
                          {today ? (
                            <div className="w-8 h-8 bg-theme-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {item.day}
                            </div>
                          ) : (
                            <span className={`text-sm w-8 h-8 flex items-center justify-center ${item.isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}`}>
                              {item.day}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          {dateEvents.slice(0, 3).map((event) => (
                            <div 
                              key={event.id} 
                              className={`text-xs px-2 py-1.5 rounded-lg truncate ${event.type === 'meeting' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : event.type === 'business' ? 'bg-theme-50 dark:bg-theme-900/20 text-theme-700 dark:text-theme-300' : event.type === 'vacation' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-300'}`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dateEvents.length > 3 && (
                            <div className="text-xs text-slate-400 dark:text-slate-500 px-2">+{dateEvents.length - 3} 更多</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    
  );
}
