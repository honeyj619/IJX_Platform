import { create } from 'zustand';

interface LayoutState {
  // 左侧导航栏是否显示
  showNavigation: boolean;
  // 中间列表栏是否显示
  showSidebar: boolean;
  // 是否为响应式模式（窄屏）
  isResponsive: boolean;
  
  // 切换左侧导航栏
  toggleNavigation: () => void;
  // 切换中间列表栏
  toggleSidebar: () => void;
  // 设置响应式模式
  setIsResponsive: (isResponsive: boolean) => void;
  // 重置到默认状态
  resetLayout: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  showNavigation: true,
  showSidebar: true,
  isResponsive: false,
  
  toggleNavigation: () => set((state) => ({ showNavigation: !state.showNavigation })),
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
  setIsResponsive: (isResponsive) => set({ isResponsive }),
  resetLayout: () => set({ showNavigation: true, showSidebar: true }),
}));
