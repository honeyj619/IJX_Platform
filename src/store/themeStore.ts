import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

export type Skin = 'pink' | 'blue' | 'purple' | 'green' | 'orange';

interface ThemeState {
  mode: ThemeMode;
  skin: Skin;
  setMode: (mode: ThemeMode) => void;
  setSkin: (skin: Skin) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',
      skin: 'pink',
      setMode: (mode) => {
        set({ mode });
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(mode);
      },
      setSkin: (skin) => {
        set({ skin });
        document.documentElement.classList.remove('skin-pink', 'skin-blue', 'skin-purple', 'skin-green', 'skin-orange');
        document.documentElement.classList.add(`skin-${skin}`);
      },
      toggleMode: () => {
        const newMode = get().mode === 'light' ? 'dark' : 'light';
        set({ mode: newMode });
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newMode);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(state.mode);
          document.documentElement.classList.remove('skin-pink', 'skin-blue', 'skin-purple', 'skin-green', 'skin-orange');
          document.documentElement.classList.add(`skin-${state.skin}`);
        }
      }
    }
  )
);
