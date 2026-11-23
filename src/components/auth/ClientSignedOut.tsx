import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import ClientWindowBar from '../ClientWindowBar';
import { sanitizeReturnPath, DEFAULT_RETURN_PATH } from './AuthGate';
import { WEB_CLIENT_MIN_WIDTH } from '../../constants/layout';
import logo from '../../assets/ijx-logo.jpg';

/**
 * PC 客户端未登录页（原型）：
 * - 视觉上属于 PC 客户端窗口（复用 ClientWindowBar 的窗口表现），不渲染用户头像、侧边导航和业务内容
 * - 点击「使用浏览器登录」在当前原型页跳转 /login?source=client（不调用 window.open）
 */
export default function ClientSignedOut() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = sanitizeReturnPath('client', location.pathname) ?? DEFAULT_RETURN_PATH.client;

  const openBrowserLogin = () => {
    navigate('/login?source=client', { state: { from } });
  };

  return (
    <div className="web-client-viewport">
      <div
        className="client-app-shell flex h-screen w-full overflow-hidden p-2 bg-[var(--ui-surface-page)]"
        style={{ '--ui-client-min-width': `${WEB_CLIENT_MIN_WIDTH}px` } as React.CSSProperties}
      >
        <div className="flex min-w-0 flex-1 flex-col" style={{ height: '100%' }}>
          <ClientWindowBar pageTitle="i吉祥客户端" />
          <div className="client-main-shell flex min-w-0 flex-1 flex-col rounded-xl border border-white/60 bg-white dark:bg-gray-900">
            <div className="flex flex-1 items-center justify-center overflow-y-auto">
              <div className="w-[420px] max-w-full px-8 py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-white shadow-sm">
                  <img src={logo} alt="i吉祥" className="h-full w-full object-cover" />
                </div>
                <h1 className="mt-6 text-xl font-semibold text-[var(--ui-text-title)]">即刻登录i吉祥</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--ui-text-weak)]">
                  开启吉祥生活 如意人生
                </p>
                <button
                  type="button"
                  onClick={openBrowserLogin}
                  className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-theme-700"
                >
                  <LogIn size={17} />
                  使用浏览器登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
