export const APP_ENTRY = '/app'
export const APP_PROTOTYPE_BASE = '/app/prototype'
export const APP_PROTOTYPE_HOME = `${APP_PROTOTYPE_BASE}/`
export const APP_PROTOTYPE_MESSAGE = `${APP_PROTOTYPE_BASE}/message`
export const APP_DOWNLOAD = '/download'
export const PC_CLIENT_HOME = '/pc_client'
export const PC_WEB_HOME = '/pc_web'

export type AppPlatform = 'ios' | 'android'

export function appPrototypeUrl(platform?: AppPlatform): string {
  return platform ? `${APP_PROTOTYPE_HOME}?platform=${platform}` : APP_PROTOTYPE_HOME
}
