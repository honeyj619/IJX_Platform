import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * PC 端联系人偏好（2026-11-17 PC Client 通讯录；2026-11-26 增加星标）：
 * 备注、特别提醒与星标按联系人 ID 持久化，基础 contactDirectory fixture 不被运行时修改。
 * 持久化失败（隐私模式等）时保持会话内可用，由 persist 中间件静默降级。
 */
export type ContactPreference = {
  note: string;
  specialReminder: boolean;
  /** 星标联系人：纯本地收藏，用于「星标联系人」分类与名片更多菜单 */
  starred: boolean;
};

interface ContactDirectoryState {
  preferences: Record<string, ContactPreference>;
  setNote: (contactId: string, note: string) => void;
  toggleSpecialReminder: (contactId: string) => void;
  toggleStarred: (contactId: string) => void;
  getPreference: (contactId: string) => ContactPreference;
}

const EMPTY: ContactPreference = { note: '', specialReminder: false, starred: false };

/** 存量数据可能缺少 starred（v1），迁移时逐人补齐默认值，不丢备注与特别提醒 */
const migratePreferences = (persisted: unknown): { preferences: Record<string, ContactPreference> } => {
  const source = (persisted as { preferences?: Record<string, Partial<ContactPreference>> } | undefined)?.preferences;
  if (!source) return { preferences: {} };
  const preferences: Record<string, ContactPreference> = {};
  for (const [contactId, preference] of Object.entries(source)) {
    preferences[contactId] = {
      note: preference?.note ?? '',
      specialReminder: preference?.specialReminder ?? false,
      starred: preference?.starred ?? false,
    };
  }
  return { preferences };
};

export const useContactDirectoryStore = create<ContactDirectoryState>()(
  persist(
    (set, get) => ({
      preferences: {},
      setNote: (contactId, note) =>
        set((state) => ({
          preferences: { ...state.preferences, [contactId]: { ...(state.preferences[contactId] ?? EMPTY), note } },
        })),
      toggleSpecialReminder: (contactId) =>
        set((state) => {
          const current = state.preferences[contactId] ?? EMPTY;
          return {
            preferences: { ...state.preferences, [contactId]: { ...current, specialReminder: !current.specialReminder } },
          };
        }),
      toggleStarred: (contactId) =>
        set((state) => {
          const current = state.preferences[contactId] ?? EMPTY;
          return {
            preferences: { ...state.preferences, [contactId]: { ...current, starred: !current.starred } },
          };
        }),
      getPreference: (contactId) => get().preferences[contactId] ?? EMPTY,
    }),
    {
      name: 'ijx-contact-preferences-v1',
      version: 2,
      migrate: (persisted) => migratePreferences(persisted),
    },
  ),
);
