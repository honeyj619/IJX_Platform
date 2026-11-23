import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePrototypeSessionStore } from '../../store/prototypeSessionStore';
import ClientSignedOut from './ClientSignedOut';

/** 统一登录来源：只允许 web / client 两个枚举值 */
export type LoginSource = 'web' | 'client';

/** Web 来源登录后允许恢复的内部路径白名单（不信任任意 returnTo） */
const WEB_RETURN_PATHS = ['/pc_web', '/pc_web/contacts'];

/** Client 来源：/pc_client 及已登记的 /pc_client/* 内部路由 */
const isClientReturnPath = (path: string) => path === '/pc_client' || path.startsWith('/pc_client/');

/** 校验登录来源页，返回合法内部路径；非法值返回 null（由调用方回退默认入口） */
export function sanitizeReturnPath(source: LoginSource, path: unknown): string | null {
  if (typeof path !== 'string') return null;
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  if (source === 'web') return WEB_RETURN_PATHS.includes(normalized) ? normalized : null;
  return isClientReturnPath(normalized) ? normalized : null;
}

/** 各来源登录成功后的默认入口 */
export const DEFAULT_RETURN_PATH: Record<LoginSource, string> = {
  web: '/pc_web',
  client: '/pc_client',
};

type AuthGateProps = {
  source: LoginSource;
  children: ReactNode;
};

/**
 * 路由门禁（原型）：
 * - source="web"：未登录时 replace 到 /login?source=web，并以路由 state 保存白名单校验后的来源页
 * - source="client"：未登录时渲染客户端未登录页（不短暂渲染业务导航或上一账号数据）
 */
export default function AuthGate({ source, children }: AuthGateProps) {
  const location = useLocation();
  const signedIn = usePrototypeSessionStore(state => state.channels[source].signedIn);

  if (signedIn) {
    return <>{children}</>;
  }

  if (source === 'web') {
    const from = sanitizeReturnPath('web', location.pathname) ?? DEFAULT_RETURN_PATH.web;
    return <Navigate to="/login?source=web" replace state={{ from }} />;
  }

  return <ClientSignedOut />;
}
