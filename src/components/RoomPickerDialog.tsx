import { useMemo, useState } from 'react';
import { Search, Users, X } from 'lucide-react';
import { isRoomTimeConflict } from '../data/meetingRooms';
import { useMeetingStore } from '../store/meetingStore';

/** 调用方会议室条目（RoomPickerDialog 不关心具体数据源，样式与闲忙校验统一） */
export interface RoomPickerItem {
  id: string;
  name?: string;
  capacity: number;
  equipment: string[];
  approval?: boolean;
  imageTone?: string;
}

interface Props {
  open: boolean;
  rooms: RoomPickerItem[];
  /** 预约的日期与时间段，用于闲忙校验 */
  date: string;
  startTime: string;
  endTime: string;
  selectedRoomId: string;
  /** 编辑既有会议时排除该会议自身占用 */
  excludeMeetingId?: string;
  onSelect: (roomId: string) => void;
  onClose: () => void;
}

/** 会议室设备维度（与会议室数据中的设备清单对齐） */
const ROOM_EQUIPMENT_OPTIONS = ['电视', '投屏', '视频会议', '白板'];

export default function RoomPickerDialog({ open, rooms, date, startTime, endTime, selectedRoomId, excludeMeetingId, onSelect, onClose }: Props) {
  const meetings = useMeetingStore((state) => state.meetings);
  const [search, setSearch] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');

  const conflictMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const room of rooms) {
      map[room.id] = isRoomTimeConflict({ roomId: room.id, date, startTime, endTime, excludeMeetingId }, meetings);
    }
    return map;
  }, [date, endTime, excludeMeetingId, meetings, rooms, startTime]);

  const filteredRooms = useMemo(() => {
    const keyword = search.trim();
    return rooms.filter((room) => {
      const matchesSearch = !keyword || room.id.includes(keyword) || (room.name ?? '').includes(keyword) || room.equipment.some((item) => item.includes(keyword));
      const matchesEquipment = !equipmentFilter || room.equipment.includes(equipmentFilter);
      return matchesSearch && matchesEquipment;
    });
  }, [equipmentFilter, rooms, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 px-4 py-6" data-requirement-id="ruyi-meetings-room-picker">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">选择会议室</h3>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-gray-800 dark:hover:text-slate-100" title="关闭"><X size={24} /></button>
        </div>

        <div className="flex flex-wrap items-center gap-8 border-b border-slate-100 px-8 py-5 dark:border-gray-800">
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <span className="shrink-0">搜索:</span>
            <div className="relative h-10 w-72">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索房间号/名称/设备" className="h-full w-full rounded border border-slate-200 bg-white pl-4 pr-10 text-sm outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100" />
              <Search size={18} className="absolute right-3 top-2.5 text-slate-400" />
            </div>
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <span className="shrink-0">按设备筛选:</span>
            <select value={equipmentFilter} onChange={(event) => setEquipmentFilter(event.target.value)} className="h-10 w-72 rounded border border-slate-200 bg-white px-4 text-sm text-slate-500 outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-100">
              <option value="">全部设备</option>
              {ROOM_EQUIPMENT_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-4">
          <div className="space-y-3 pr-3">
            {filteredRooms.map((room) => {
              const occupied = conflictMap[room.id] ?? false;
              const selected = selectedRoomId === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => { if (!occupied) onSelect(room.id); }}
                  disabled={occupied}
                  className={`grid w-full grid-cols-[180px_1fr_auto] items-center gap-6 rounded border px-4 py-4 text-left transition-colors ${
                    occupied
                      ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-70 dark:border-gray-800 dark:bg-gray-900/60'
                      : selected
                        ? 'border-theme-500 bg-theme-50/70 dark:border-theme-500 dark:bg-theme-900/20'
                        : 'border-slate-200 bg-white hover:border-theme-300 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`relative h-24 overflow-hidden rounded bg-gradient-to-br ${room.imageTone ?? 'from-slate-200 to-slate-100'} ${occupied ? 'grayscale' : ''}`}>
                    <div className="absolute inset-x-4 top-6 h-8 skew-x-[-18deg] rounded bg-white/60 shadow-sm" />
                    <div className="absolute inset-x-5 bottom-5 h-6 skew-x-[18deg] rounded bg-black/10" />
                    <div className="absolute left-6 top-3 h-16 w-2 rounded bg-black/20" />
                    <div className="absolute right-8 top-4 h-16 w-2 rounded bg-black/15" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className={`text-xl font-semibold ${occupied ? 'text-slate-400 dark:text-slate-500' : 'text-slate-950 dark:text-white'}`}>{room.id}</div>
                      {room.approval && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-500 dark:bg-red-950/40">需审批</span>}
                      {occupied && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-gray-800 dark:text-slate-400">该时段已占用</span>}
                    </div>
                    <div className="mt-3 truncate text-sm text-slate-500 dark:text-slate-400">{room.equipment.join(' · ')}</div>
                    <div className="mt-2 flex items-center gap-1 text-sm text-slate-400">
                      <Users size={15} /> 可容纳 {room.capacity} 人
                    </div>
                  </div>
                  <div className={`h-5 w-5 rounded-full border ${selected ? 'border-theme-600 bg-theme-600 shadow-[inset_0_0_0_4px_white]' : 'border-slate-300 dark:border-gray-600'}`} />
                </button>
              );
            })}
            {filteredRooms.length === 0 && <div className="py-10 text-center text-sm text-slate-400">未找到符合条件的会议室</div>}
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-slate-200 px-8 py-4 dark:border-gray-700">
          <div className="text-slate-800 dark:text-slate-100">
            <div className="text-lg font-semibold">已选择： {selectedRoomId || '未选择'}</div>
            <div className="mt-1 text-sm">时间： {date} {startTime}-{endTime}</div>
          </div>
          <button type="button" onClick={onClose} className="h-10 rounded bg-theme-600 px-8 text-base font-medium text-white hover:bg-theme-700">确定</button>
        </div>
      </div>
    </div>
  );
}
