import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * PC 端联系人偏好（2026-11-17 PC Client 通讯录）：
 * 备注与特别提醒按联系人 ID 持久化，基础 contactDirectory fixture 不被运行时修改。
 * 持久化失败（隐私模式等）时保持会话内可用，由 persist 中间件静默降级。
 */
export type ContactPreference = {
  note: string;
  specialReminder: boolean;
};

interface ContactDirectoryState {
  preferences: Record<string, ContactPreference>;
  setNote: (contactId: string, note: string) => void;
  toggleSpecialReminder: (contactId: string) => void;
  getPreference: (contactId: string) => ContactPreference;
}

const EMPTY: ContactPreference = { note: '', specialReminder: false };

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
      getPreference: (contactId) => get().preferences[contactId] ?? EMPTY,
    }),
    { name: 'ijx-contact-preferences-v1' },
  ),
);
