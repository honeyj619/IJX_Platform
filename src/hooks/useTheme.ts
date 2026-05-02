import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const { mode, skin, setMode, setSkin, toggleMode } = useThemeStore();

  return {
    theme: mode,
    mode,
    skin,
    setTheme: setMode,
    setMode,
    setSkin,
    toggleTheme: toggleMode,
    toggleMode,
    isDark: mode === 'dark'
  };
} 