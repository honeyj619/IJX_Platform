/**
 * IJX Platform — 布局常量
 * 全局唯一来源，禁止在组件中硬编码这些值
 */

/** 侧边栏宽度常量 */
export const SIDEBAR = {
  /** 展开宽度 (px) */
  EXPANDED_WIDTH: 256,
  /** 折叠宽度 (px) */
  COLLAPSED_WIDTH: 64,
  /** 展开宽度字符串 */
  EXPANDED: '256px',
  /** 折叠宽度字符串 */
  COLLAPSED: '64px',
  /** 拖动最大宽度 (px) */
  MAX_DRAG_WIDTH: 384,
} as const;

/** 响应式断点（用于 JS 条件判断） */
export const BREAKPOINTS = {
  /** 移动端门禁 — 低于此宽度显示 MobileDevicePrompt */
  MOBILE_MAX: 600,
  /** 移动端横屏门禁 */
  MOBILE_LANDSCAPE_MAX: 800,
  /** 平板/桌面分界点 — sidebar 切换 overlay 模式 */
  TABLET: 1024,
  /** 标准桌面 */
  DESKTOP: 1280,
  /** 宽屏 */
  WIDE: 1440,
} as const;
