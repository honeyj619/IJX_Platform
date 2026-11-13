/**
 * App 端（Vue 员工端原型）路由合同常量。
 *
 * 权威路由文档：docs/APP_ROUTES.md。
 * React 宿主侧（App.tsx、Download.tsx 等）进入 App 一律引用本文件常量，不硬编码字符串；
 * Vue 子应用内部（src/prototype/router/index.ts）继续使用相对路径，不引用 React 部署前缀。
 */

/** App 统一入口（兼容入口，实际重定向到 Vue App 首页） */
export const APP_ENTRY = '/app';

/** Vue App 挂载前缀（宿主路由） */
export const APP_PROTOTYPE_BASE = '/app/prototype';

/** Vue App 首页（规范入口） */
export const APP_PROTOTYPE_HOME = '/app/prototype/';

/** Vue App 消息页 */
export const APP_PROTOTYPE_MESSAGE = '/app/prototype/message';

/** 五个一级入口的规范 URL */
export const appPrototypeRoute = {
  home: '/app/prototype/',
  schedule: '/app/prototype/schedule',
  workspace: '/app/prototype/workspace',
  message: '/app/prototype/message',
  profile: '/app/prototype/profile',
} as const;

/** 下载页平台入口：`platform` 仅表示演示平台上下文，Android/iOS 共用页面 */
export function appPrototypeHomeWithPlatform(platform: 'ios' | 'android'): string {
  return `${APP_PROTOTYPE_HOME}?platform=${platform}`;
}

/** 历史 React App URL → Vue App 兼容目标（仅作入口保留，见 docs/APP_ROUTES.md §4） */
export const APP_LEGACY_COMPAT_ROUTES = {
  appHome: '/app/home',
  appAndroidHome: '/app/android/home',
  appIosHome: '/app/ios/home',
  appMessages: '/app/messages',
} as const;
