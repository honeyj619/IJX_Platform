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

export const MEETING_SLOT_COUNT = 48;

export const slotToTime = (slot: number) => {
  const minutes = slot * 30; // 00:00–24:00 全天 48 槽，每槽 30 分钟
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
};

