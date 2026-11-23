/**
 * 统一登录原型共享模拟 Store
 * - Web 与 PC 客户端两个独立原型登录态（channel）
 * - 与 Admin「安全管理 · 设备管理」共享设备与会话演示数据
 * - 原型持久化：localStorage `ijx-prototype-session-v1`，版本化，跨标签页经 storage 事件同步
 * 只保存模拟状态，不保存用户输入的密码；页面瞬时的登录中/失败/拉起中状态不进入本 Store。
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  formatPrototypeTimestamp,
  initialDeviceUsers,
  PROTOTYPE_CLIENT_DEVICE_ID,
  PROTOTYPE_MAIN_USER_ID,
  PROTOTYPE_WEB_DEVICE_ID,
  type DeviceUser,
} from '../data/deviceManagement';

export type AuthChannel = 'web' | 'client';

export type ChannelSession = {
  signedIn: boolean;
  userId: string | null;
  deviceId: string | null;
  sessionId: string | null;
};

export const PROTOTYPE_SESSION_STORAGE_KEY = 'ijx-prototype-session-v1';

/** 各 channel 登录时写入的稳定设备 */
const CHANNEL_DEVICE_ID: Record<AuthChannel, string> = {
  web: PROTOTYPE_WEB_DEVICE_ID,
  client: PROTOTYPE_CLIENT_DEVICE_ID,
};

const SESSION_ID_PREFIX: Record<AuthChannel, string> = {
  web: 'SES-WEB-L',
  client: 'SES-PC-L',
};

const signedOutChannels = (): Record<AuthChannel, ChannelSession> => ({
  web: { signedIn: false, userId: null, deviceId: null, sessionId: null },
  client: { signedIn: false, userId: null, deviceId: null, sessionId: null },
});

const cloneInitialUsers = (): DeviceUser[] =>
  typeof structuredClone === 'function' ? structuredClone(initialDeviceUsers) : JSON.parse(JSON.stringify(initialDeviceUsers));

/** 生成下一个演示会话 ID：SES-WEB-L{n} / SES-PC-L{n}（n 取现有最大序号 + 1） */
const nextSessionId = (users: DeviceUser[], channel: AuthChannel) => {
  const prefix = SESSION_ID_PREFIX[channel];
  let highest = 0;
  for (const user of users) {
    for (const device of user.devices) {
      for (const session of device.sessions) {
        if (session.id.startsWith(prefix)) {
          const value = Number(session.id.slice(prefix.length));
          if (Number.isInteger(value)) highest = Math.max(highest, value);
        }
      }
    }
  }
  return `${prefix}${highest + 1}`;
};

type PrototypeSessionState = {
  schemaVersion: 1;
  channels: Record<AuthChannel, ChannelSession>;
  users: DeviceUser[];
  completeLogin: (channel: AuthChannel) => void;
  logoutChannel: (channel: AuthChannel) => void;
  logoutDevices: (userIds: string[], deviceId?: string) => void;
  setDeviceBound: (userId: string, deviceId: string, bound: boolean) => void;
  setDeviceTrusted: (userId: string, deviceId: string, trusted: boolean) => void;
  resetPrototypeSession: () => void;
};

export const usePrototypeSessionStore = create<PrototypeSessionState>()(
  persist(
    (set) => ({
      schemaVersion: 1,
      channels: signedOutChannels(),
      users: cloneInitialUsers(),

      /**
       * 登录成功写入：仅在最终进入 /pc_web 或 /pc_client 前调用。
       * - 更新设备为在线并刷新最后活跃时间
       * - 旧有效会话标记为已退出
       * - 追加一条新有效会话（不新增重复设备）
       * - 设置对应 channel 已登录
       */
      completeLogin: (channel) => set((state) => {
        const deviceId = CHANNEL_DEVICE_ID[channel];
        const now = formatPrototypeTimestamp();
        const sessionId = nextSessionId(state.users, channel);
        const users = state.users.map((user) => {
          if (user.id !== PROTOTYPE_MAIN_USER_ID) return user;
          return {
            ...user,
            devices: user.devices.map((device) => {
              if (device.id !== deviceId) return device;
              const reference = device.sessions[device.sessions.length - 1];
              const sessions = device.sessions.map((session) => (
                session.status === '有效' ? { ...session, status: '已退出' as const, lastActiveAt: now } : session
              ));
              sessions.push({
                id: sessionId,
                deviceId,
                loginAt: now,
                lastActiveAt: now,
                ip: device.type === '网页浏览器' ? (device.lastIp ?? reference?.ip ?? '172.29.123.124') : (reference?.ip ?? '172.29.123.124'),
                location: reference?.location ?? '上海虹桥',
                status: '有效',
              });
              return {
                ...device,
                status: '在线' as const,
                lastActiveAt: now,
                sessions,
              };
            }),
          };
        });
        return {
          users,
          channels: {
            ...state.channels,
            [channel]: { signedIn: true, userId: PROTOTYPE_MAIN_USER_ID, deviceId, sessionId },
          },
        };
      }),

      /** 主动退出：对应设备有效会话全部失效，无有效会话时设备离线 */
      logoutChannel: (channel) => set((state) => {
        const deviceId = CHANNEL_DEVICE_ID[channel];
        const users = state.users.map((user) => {
          if (user.id !== PROTOTYPE_MAIN_USER_ID) return user;
          return {
            ...user,
            devices: user.devices.map((device) => {
              if (device.id !== deviceId) return device;
              const sessions = device.sessions.map((session) => (
                session.status === '有效' ? { ...session, status: '已退出' as const } : session
              ));
              const hasValidSession = sessions.some((session) => session.status === '有效');
              return { ...device, sessions, status: hasValidSession ? device.status : ('离线' as const) };
            }),
          };
        });
        return {
          users,
          channels: {
            ...state.channels,
            [channel]: { signedIn: false, userId: null, deviceId: null, sessionId: null },
          },
        };
      }),

      /**
       * Admin 远程退出（单设备 / 批量 / 全部）：
       * 相关设备会话失效并离线；若被退出的设备正是某 channel 对应设备，同时清除该 channel 登录态。
       */
      logoutDevices: (userIds, deviceId) => set((state) => {
        const users = state.users.map((user) => {
          if (!userIds.includes(user.id)) return user;
          return {
            ...user,
            devices: user.devices.map((device) => {
              if (deviceId && device.id !== deviceId) return device;
              return {
                ...device,
                status: '离线' as const,
                sessions: device.sessions.map((session) => (
                  session.status === '有效' ? { ...session, status: '已退出' as const } : session
                )),
              };
            }),
          };
        });
        const logoutTarget = (channel: AuthChannel) => {
          const session = state.channels[channel];
          if (!session.signedIn) return session;
          const hitDevice = !deviceId || session.deviceId === deviceId;
          if (hitDevice && userIds.includes(session.userId ?? '')) {
            return { signedIn: false, userId: null, deviceId: null, sessionId: null };
          }
          return session;
        };
        return {
          users,
          channels: { web: logoutTarget('web'), client: logoutTarget('client') },
        };
      }),

      /** 绑定/解绑：解绑沿用既有语义，同时失去可信关系 */
      setDeviceBound: (userId, deviceId, bound) => set((state) => ({
        users: state.users.map((user) => user.id === userId ? {
          ...user,
          devices: user.devices.map((device) => device.id === deviceId
            ? { ...device, bound, trusted: bound ? device.trusted : false }
            : device),
        } : user),
      })),

      setDeviceTrusted: (userId, deviceId, trusted) => set((state) => ({
        users: state.users.map((user) => user.id === userId ? {
          ...user,
          devices: user.devices.map((device) => device.id === deviceId ? { ...device, trusted } : device),
        } : user),
      })),

      /** 恢复初始演示数据与未登录态（自动化回归隔离用） */
      resetPrototypeSession: () => set({ channels: signedOutChannels(), users: cloneInitialUsers() }),
    }),
    {
      name: PROTOTYPE_SESSION_STORAGE_KEY,
      version: 1,
      partialize: (state) => ({ channels: state.channels, users: state.users }),
      migrate: () => ({ channels: signedOutChannels(), users: cloneInitialUsers() }),
    }
  )
);

// 多标签页同步：其他标签页写入存储时重新水合本地 Store
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === PROTOTYPE_SESSION_STORAGE_KEY) {
      void usePrototypeSessionStore.persist.rehydrate();
    }
  });
}
