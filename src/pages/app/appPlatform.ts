/**
 * App 端平台工具
 * 规则：Android 与 iOS 默认共用页面（不带平台段）；仅存在明确平台差异的页面
 * 才使用 /app/<platform>/<section> 呈现。
 */
export const APP_PLATFORMS = ['android', 'ios'] as const;
export type AppPlatform = (typeof APP_PLATFORMS)[number];

/** 原型默认平台（未指明平台时使用） */
export const DEFAULT_APP_PLATFORM: AppPlatform = 'android';

export function isAppPlatform(value: string | undefined): value is AppPlatform {
  return value === 'android' || value === 'ios';
}

/**
 * 从路径与查询参数解析当前平台：
 * - 平台差异页：/app/<platform>/… 优先取路径段
 * - 共享页面：支持 ?platform=android|ios 指定；缺省用 DEFAULT_APP_PLATFORM
 */
export function resolveAppPlatform(pathname: string, search: string): AppPlatform {
  const match = pathname.match(/^\/app\/(android|ios)/);
  if (match) return match[1] as AppPlatform;
  const queryPlatform = new URLSearchParams(search).get('platform');
  if (queryPlatform !== null && isAppPlatform(queryPlatform)) return queryPlatform;
  return DEFAULT_APP_PLATFORM;
}
