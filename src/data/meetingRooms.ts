export interface MeetingRoomDefinition {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  equipment: string[];
  /** 需审批房间在列表中展示红色标记（原会议室页面规范） */
  approval?: boolean;
}

/** 8:00 对应的槽位（时间轴默认滚动位置） */
export const DEFAULT_SCROLL_SLOT = 16;

export const meetingRooms: MeetingRoomDefinition[] = [
  { id: '6404', name: '6404 会议室', floor: '6F', capacity: 8, equipment: ['电视', '白板'] },
  { id: '6407', name: '6407 会议室', floor: '6F', capacity: 12, equipment: ['投屏', '视频会议'] },
  { id: '6502', name: '公司第一会议室', floor: '6F', capacity: 24, equipment: ['投屏', '视频会议', '白板'] },
  { id: '2801', name: '2801 会议室', floor: '28F', capacity: 16, equipment: ['投屏', '视频会议'], approval: true },
];

/** 会议室固定占用（原型演示：每天重复的时段槽，用于预约时闲忙校验） */
export interface MeetingRoomOccupancy {
  roomId: string;
  startTime: string;
  endTime: string;
  title: string;
}

export const roomOccupancies: MeetingRoomOccupancy[] = [
  { roomId: '6404', startTime: '09:00', endTime: '09:30', title: '晨会' },
  { roomId: '6404', startTime: '12:00', endTime: '13:00', title: '午间例会' },
  { roomId: '6404', startTime: '15:00', endTime: '17:00', title: '项目评审会' },
  { roomId: '6407', startTime: '10:00', endTime: '11:30', title: '跨部门周会' },
  { roomId: '6407', startTime: '14:00', endTime: '15:30', title: '方案评审会' },
  { roomId: '6502', startTime: '11:00', endTime: '12:00', title: '经营分析会' },
  { roomId: '6502', startTime: '16:00', endTime: '17:30', title: '战略沟通会' },
];

/** 区间重叠判断（左闭右开） */
const overlaps = (startA: string, endA: string, startB: string, endB: string) => startA < endB && startB < endA;

export interface RoomConflictQuery {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  /** 待排除的会议 id（编辑既有会议时排除自身占用） */
  excludeMeetingId?: string;
}

/**
 * 闲忙校验：静态占用（每日重复）+ 已预约会议（store meetings）任一命中即冲突。
 * 用于选择会议室时对已选时间段冲突的房间置灰不可选择。
 */
export const isRoomTimeConflict = (
  query: RoomConflictQuery,
  meetings: ReadonlyArray<{ id: string; roomId?: string; status: string; scheduledStart?: string; scheduledEnd?: string }>,
): boolean => {
  if (query.endTime <= query.startTime) return false;
  const staticHit = roomOccupancies.some(
    (occupancy) => occupancy.roomId === query.roomId && overlaps(query.startTime, query.endTime, occupancy.startTime, occupancy.endTime),
  );
  if (staticHit) return true;
  return meetings.some((meeting) => {
    if (meeting.id === query.excludeMeetingId || meeting.roomId !== query.roomId || meeting.status === 'cancelled') return false;
    if (!meeting.scheduledStart || !meeting.scheduledEnd) return false;
    if (meeting.scheduledStart.slice(0, 10) !== query.date) return false;
    return overlaps(query.startTime, query.endTime, meeting.scheduledStart.slice(11, 16), meeting.scheduledEnd.slice(11, 16));
  });
};

export const MEETING_SLOT_COUNT = 48;

export const slotToTime = (slot: number) => {
  const minutes = slot * 30; // 00:00–24:00 全天 48 槽，每槽 30 分钟
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
};

