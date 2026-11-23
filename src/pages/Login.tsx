import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Ban,
  Clock,
  Download,
  Eye,
  EyeOff,
  Globe2,
  Loader2,
  Lock,
  LogIn,
  MonitorSmartphone,
  RefreshCw,
  ShieldAlert,
  WifiOff,
  XCircle,
} from 'lucide-react';
import logo from '../assets/ijx-logo.jpg';
import { usePrototypeSessionStore } from '../store/prototypeSessionStore';
import { initialDeviceUsers, PROTOTYPE_MAIN_USER_ID } from '../data/deviceManagement';
import { DEFAULT_RETURN_PATH, sanitizeReturnPath, type LoginSource } from '../components/auth/AuthGate';

/** 页面瞬时状态：刷新后回到 idle，不写入长期 Store */
type LoginPhase =
  | 'idle'
  | 'submitting'
  | 'invalid_credentials'
  | 'account_locked'
  | 'account_disabled'
  | 'permission_denied'
  | 'network_error'
  | 'system_error'
  | 'cancelled'
  | 'timed_out'
  | 'web_entering'
  | 'client_authenticated'
  | 'client_syncing'
  | 'client_sync_failed'
  | 'client_launching'
  | 'client_launch_failed';

/** demo 参数 → 失败状态（仅决定原型结果；未知值按成功处理） */
const DEMO_FAILURE: Record<string, LoginPhase | null> = {
  success: null,
  invalid: 'invalid_credentials',
  locked: 'account_locked',
  disabled: 'account_disabled',
  forbidden: 'permission_denied',
  network: 'network_error',
  system: 'system_error',
  timeout: 'timed_out',
  'sync-fail': 'client_sync_failed',
  'launch-fail': 'client_launch_failed',
};

const REMEMBERED_ACCOUNT_KEY = 'ijx-prototype-login-account';

// 自动过渡时长（1.2–2 秒，均提供「立即继续」）
const SUBMIT_MS = 1200;
const STAGE_MS = 1600;

type FailurePhase = Extract<LoginPhase,
  | 'invalid_credentials'
  | 'account_locked'
  | 'account_disabled'
  | 'permission_denied'
  | 'network_error'
  | 'system_error'
  | 'cancelled'
  | 'timed_out'>;

const FAILURE_COPY: Record<FailurePhase, { title: string; desc: string; icon: React.ReactNode }> = {
  invalid_credentials: { title: '账号或密码错误', desc: '账号或密码不正确，请重新输入。', icon: <XCircle size={30} /> },
  account_locked: { title: '账号已锁定', desc: '因多次登录失败，账号已被临时锁定，请稍后重试或联系管理员解锁。', icon: <Lock size={30} /> },
  account_disabled: { title: '账号已停用', desc: '该账号已被停用，请联系管理员恢复后重新登录。', icon: <Ban size={30} /> },
  permission_denied: { title: '当前终端无权限', desc: '当前终端不在允许登录的范围内，请联系管理员调整终端权限。', icon: <ShieldAlert size={30} /> },
  network_error: { title: '网络异常', desc: '网络连接异常，登录请求未完成，请检查网络后重试。', icon: <WifiOff size={30} /> },
  system_error: { title: '系统异常', desc: '登录服务暂时不可用，请稍后重试。', icon: <AlertTriangle size={30} /> },
  cancelled: { title: '已取消登录', desc: '本次登录已取消，可重新登录或返回来源页。', icon: <XCircle size={30} /> },
  timed_out: { title: '登录超时', desc: '登录请求超时未完成，请重新登录。', icon: <Clock size={30} /> },
};

const SOURCE_COPY: Record<LoginSource, { title: string; subtitle: string; entering: string; enteringDesc: string }> = {
  web: {
    title: '登录 i吉祥 PC Web',
    subtitle: '登录后进入 i吉祥企业门户',
    entering: '正在进入 i吉祥 PC Web',
    enteringDesc: '登录成功，正在为你打开企业门户。',
  },
  client: {
    title: '登录 i吉祥 PC 客户端',
    subtitle: '登录完成后将为你打开 i吉祥客户端',
    entering: '正在拉起 i吉祥客户端',
    enteringDesc: '登录信息同步完成，正在为你打开客户端。',
  },
};

const primaryButtonClass = 'inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryButtonClass = 'inline-flex h-10 items-center justify-center rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-card)] px-4 text-sm text-[var(--ui-text-body)] transition-colors hover:bg-[var(--ui-surface-selected)]';
const linkButtonClass = 'text-sm text-[var(--ui-text-weak)] underline-offset-2 transition-colors hover:text-[var(--ui-brand-primary)] hover:underline';

export default function Login() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const completeLogin = usePrototypeSessionStore(state => state.completeLogin);

  // 来源解析：缺省 web；非法来源显示来源异常选择页，不接受任意字符串
  const rawSource = searchParams.get('source');
  const source: LoginSource | 'invalid' = rawSource === 'client' ? 'client' : rawSource === 'web' || !rawSource ? 'web' : 'invalid';
  const demoParam = searchParams.get('demo') ?? 'success';

  const mainAccount = initialDeviceUsers.find(user => user.id === PROTOTYPE_MAIN_USER_ID)?.account ?? 'liangjie';
  const [account, setAccount] = useState(() => window.localStorage.getItem(REMEMBERED_ACCOUNT_KEY) || mainAccount);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberAccount, setRememberAccount] = useState(() => Boolean(window.localStorage.getItem(REMEMBERED_ACCOUNT_KEY)));
  const [fieldError, setFieldError] = useState<{ account?: string; password?: string }>({});
  const [notice, setNotice] = useState('');
  const [phase, setPhase] = useState<LoginPhase>('idle');

  // 可清理定时器：组件卸载、来源变化、重试或取消时全部清理；禁止卸载后 setState
  const timersRef = useRef<number[]>([]);
  const advanceRef = useRef<null | (() => void)>(null);
  const mountedRef = useRef(true);
  const demoArmedRef = useRef(true);
  // 同步防重复提交守卫：登录中重复点击不得创建多条会话
  const busyRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];
    advanceRef.current = null;
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, []);

  // 来源或 demo 参数变化时回到默认态（idle），保留来源
  useEffect(() => {
    clearTimers();
    demoArmedRef.current = true;
    busyRef.current = false;
    setPhase('idle');
    setNotice('');
    setFieldError({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, demoParam]);

  const safeSetPhase = (next: LoginPhase) => {
    if (mountedRef.current) setPhase(next);
  };

  const schedule = (fn: () => void, ms: number) => {
    advanceRef.current = fn;
    const id = window.setTimeout(() => {
      advanceRef.current = null;
      fn();
    }, ms);
    timersRef.current.push(id);
  };

  const runPendingNow = () => {
    const fn = advanceRef.current;
    clearTimers();
    fn?.();
  };

  // 登录成功后的恢复目标：只认 source 枚举 + 内部白名单，不信任任意外部回跳地址
  const returnPath = source === 'client'
    ? (sanitizeReturnPath('client', (location.state as { from?: unknown } | null)?.from) ?? DEFAULT_RETURN_PATH.client)
    : (sanitizeReturnPath('web', (location.state as { from?: unknown } | null)?.from) ?? DEFAULT_RETURN_PATH.web);
  const exitPath = source === 'client' ? '/pc_client' : '/download';

  const effectiveDemoFailure = (): LoginPhase | null => {
    if (!demoArmedRef.current) return null;
    const failure = DEMO_FAILURE[demoParam] ?? null;
    // sync-fail / launch-fail 仅作用于客户端来源；Web 来源按成功处理
    if (source === 'web' && (failure === 'client_sync_failed' || failure === 'client_launch_failed')) return null;
    return failure;
  };

  const finishWebLogin = () => {
    completeLogin('web');
    if (mountedRef.current) navigate(returnPath, { replace: true });
  };

  const finishClientLogin = () => {
    completeLogin('client');
    if (mountedRef.current) navigate(returnPath, { replace: true });
  };

  /** 客户端成功链：登录成功 → 同步中 → 拉起中；pendingFailure 决定同步/拉起阶段失败 */
  const advanceClientChain = (pendingFailure: 'client_sync_failed' | 'client_launch_failed' | null) => {
    safeSetPhase('client_authenticated');
    schedule(() => {
      safeSetPhase('client_syncing');
      schedule(() => {
        if (pendingFailure === 'client_sync_failed') {
          safeSetPhase('client_sync_failed');
          return;
        }
        safeSetPhase('client_launching');
        schedule(() => {
          if (pendingFailure === 'client_launch_failed') {
            safeSetPhase('client_launch_failed');
            return;
          }
          finishClientLogin();
        }, STAGE_MS);
      }, STAGE_MS);
    }, STAGE_MS);
  };

  const resolveSubmit = () => {
    const failure = effectiveDemoFailure();
    if (failure === 'client_sync_failed' || failure === 'client_launch_failed') {
      demoArmedRef.current = false;
      advanceClientChain(failure);
      return;
    }
    if (failure) {
      demoArmedRef.current = false;
      safeSetPhase(failure);
      return;
    }
    if (source === 'web') {
      safeSetPhase('web_entering');
      schedule(finishWebLogin, STAGE_MS);
    } else {
      advanceClientChain(null);
    }
  };

  const startSubmit = () => {
    if (busyRef.current || phase !== 'idle') return; // 登录中重复点击防护
    const trimmedAccount = account.trim();
    const nextFieldError: { account?: string; password?: string } = {};
    if (!trimmedAccount) nextFieldError.account = '请输入账号';
    if (!password) nextFieldError.password = '请输入密码';
    if (nextFieldError.account || nextFieldError.password) {
      setFieldError(nextFieldError);
      return;
    }
    busyRef.current = true;
    setFieldError({});
    setNotice('');
    if (rememberAccount) {
      window.localStorage.setItem(REMEMBERED_ACCOUNT_KEY, trimmedAccount);
    } else {
      window.localStorage.removeItem(REMEMBERED_ACCOUNT_KEY);
    }
    safeSetPhase('submitting');
    schedule(resolveSubmit, SUBMIT_MS);
  };

  const backToForm = () => {
    clearTimers();
    busyRef.current = false;
    setNotice('');
    setFieldError({});
    safeSetPhase('idle');
  };

  const cancelLogin = () => {
    clearTimers();
    safeSetPhase('cancelled');
  };

  const retrySubmit = () => {
    clearTimers();
    safeSetPhase('submitting');
    schedule(resolveSubmit, SUBMIT_MS);
  };

  const retrySync = () => {
    clearTimers();
    safeSetPhase('client_syncing');
    schedule(() => {
      safeSetPhase('client_launching');
      schedule(finishClientLogin, STAGE_MS);
    }, STAGE_MS);
  };

  const retryLaunch = () => {
    clearTimers();
    safeSetPhase('client_launching');
    schedule(finishClientLogin, STAGE_MS);
  };

  const goBackToSourcePage = () => {
    clearTimers();
    if (mountedRef.current) navigate(returnPath, { replace: true });
  };

  const goExit = () => {
    clearTimers();
    if (mountedRef.current) navigate(exitPath, { replace: true });
  };

  const goDownload = () => {
    clearTimers();
    if (mountedRef.current) navigate('/download', { replace: true });
  };

  const showNotice = (message: string) => setNotice(message);

  // ===== 来源异常选择页 =====
  if (source === 'invalid') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[var(--ui-surface-page)] p-6">
        <div className="w-[420px] max-w-full overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-card)] p-8 text-center shadow-[0_1px_3px_rgba(48,49,51,0.06)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[var(--ui-border)] bg-white">
            <img src={logo} alt="i吉祥" className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-5 text-lg font-semibold text-[var(--ui-text-title)]">无法识别登录来源</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--ui-text-weak)]">登录链接中的来源参数不正确，请选择要登录的入口。</p>
          <div className="mt-6 space-y-3">
            <button type="button" onClick={() => navigate('/login?source=web', { replace: true })} className={primaryButtonClass}>
              <Globe2 size={16} />登录 i吉祥 PC Web
            </button>
            <button type="button" onClick={() => navigate('/login?source=client', { replace: true })} className={secondaryButtonClass + ' h-11 w-full'}>
              <MonitorSmartphone size={16} />登录 i吉祥 PC 客户端
            </button>
          </div>
        </div>
      </div>
    );
  }

  const copy = SOURCE_COPY[source];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--ui-surface-page)] p-6" data-requirement-id="custom-20261123-001">
      <div className="w-[420px] max-w-full overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface-card)] shadow-[0_1px_3px_rgba(48,49,51,0.06)]">
        <div className="px-8 pt-8 pb-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[var(--ui-border)] bg-white">
            <img src={logo} alt="i吉祥" className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-[var(--ui-text-title)]">{copy.title}</h1>
          <p className="mt-2 text-sm text-[var(--ui-text-weak)]">{copy.subtitle}</p>
        </div>

        <div className="px-8 pb-8 pt-4">
          {phase === 'idle' && (
            <LoginFormView
              account={account}
              password={password}
              showPassword={showPassword}
              rememberAccount={rememberAccount}
              fieldError={fieldError}
              notice={notice}
              onAccountChange={value => { setAccount(value); setFieldError(current => ({ ...current, account: undefined })); }}
              onPasswordChange={value => { setPassword(value); setFieldError(current => ({ ...current, password: undefined })); }}
              onTogglePassword={() => setShowPassword(current => !current)}
              onToggleRemember={() => setRememberAccount(current => !current)}
              onSubmit={startSubmit}
              showNotice={showNotice}
            />
          )}

          {phase === 'submitting' && (
            <LoginProgressView
              title="登录中"
              desc="正在校验账号信息，请稍候…"
              onCancel={cancelLogin}
            />
          )}

          {(phase === 'invalid_credentials' || phase === 'account_locked' || phase === 'account_disabled'
            || phase === 'permission_denied' || phase === 'network_error' || phase === 'system_error'
            || phase === 'cancelled' || phase === 'timed_out') && (
            <LoginFailureView
              phase={phase}
              source={source}
              onBackToForm={backToForm}
              onRetrySubmit={retrySubmit}
              onGoBackToSourcePage={goBackToSourcePage}
              onGoExit={goExit}
              showNotice={showNotice}
            />
          )}

          {phase === 'web_entering' && (
            <WebEnteringView title={copy.entering} desc={copy.enteringDesc} onContinueNow={runPendingNow} />
          )}

          {phase === 'client_authenticated' && (
            <ClientAuthenticatedView onContinueNow={runPendingNow} />
          )}

          {phase === 'client_syncing' && (
            <ClientSyncView onContinueNow={runPendingNow} />
          )}

          {phase === 'client_sync_failed' && (
            <ClientSyncFailureView
              onRetrySync={retrySync}
              onBackToForm={backToForm}
              onCancel={goExit}
            />
          )}

          {phase === 'client_launching' && (
            <ClientLaunchingView onContinueNow={runPendingNow} />
          )}

          {phase === 'client_launch_failed' && (
            <ClientLaunchFailureView
              onRetryLaunch={retryLaunch}
              onDownload={goDownload}
              onBackToForm={backToForm}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ===== 登录表单 =====

type LoginFormViewProps = {
  account: string;
  password: string;
  showPassword: boolean;
  rememberAccount: boolean;
  fieldError: { account?: string; password?: string };
  notice: string;
  onAccountChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleRemember: () => void;
  onSubmit: () => void;
  showNotice: (message: string) => void;
};

function LoginFormView({ account, password, showPassword, rememberAccount, fieldError, notice, onAccountChange, onPasswordChange, onTogglePassword, onToggleRemember, onSubmit, showNotice }: LoginFormViewProps) {
  return (
    <form
      onSubmit={event => { event.preventDefault(); onSubmit(); }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="login-account" className="mb-1.5 block text-sm font-medium text-[var(--ui-text-title)]">账号</label>
        <input
          id="login-account"
          type="text"
          autoComplete="username"
          value={account}
          onChange={event => onAccountChange(event.target.value)}
          placeholder="请输入账号"
          className="h-11 w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-page)] px-3.5 text-sm text-[var(--ui-text-title)] outline-none transition-colors placeholder:text-[var(--ui-text-weak)] focus:border-[var(--ui-brand-primary)] focus:bg-[var(--ui-surface-card)]"
        />
        {fieldError.account && <p className="mt-1.5 text-xs text-red-600">{fieldError.account}</p>}
      </div>

      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-[var(--ui-text-title)]">密码</label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={event => onPasswordChange(event.target.value)}
            placeholder="请输入密码"
            className="h-11 w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-page)] px-3.5 pr-11 text-sm text-[var(--ui-text-title)] outline-none transition-colors placeholder:text-[var(--ui-text-weak)] focus:border-[var(--ui-brand-primary)] focus:bg-[var(--ui-surface-card)]"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            title={showPassword ? '隐藏密码' : '显示密码'}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--ui-text-weak)] transition-colors hover:bg-[var(--ui-surface-selected)] hover:text-[var(--ui-text-body)]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fieldError.password && <p className="mt-1.5 text-xs text-red-600">{fieldError.password}</p>}
      </div>

      <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-[var(--ui-text-body)]">
        <input
          type="checkbox"
          checked={rememberAccount}
          onChange={onToggleRemember}
          className="h-4 w-4 accent-[var(--ui-brand-primary)]"
        />
        记住账号
        <button
          type="button"
          onClick={() => showNotice('原型演示：忘记密码能力暂未开放，请使用演示账号登录。')}
          className="ml-auto text-xs text-[var(--ui-text-weak)] underline-offset-2 transition-colors hover:text-[var(--ui-brand-primary)] hover:underline"
        >
          忘记密码？
        </button>
      </label>

      <button type="submit" className={primaryButtonClass}>
        <LogIn size={16} />登录
      </button>

      {notice && (
        <p className="rounded-lg bg-[var(--ui-surface-selected)] px-3 py-2 text-xs leading-5 text-[var(--ui-text-weak)]">{notice}</p>
      )}
    </form>
  );
}

// ===== 登录中 =====

function LoginProgressView({ title, desc, onCancel }: { title: string; desc: string; onCancel: () => void }) {
  return (
    <div className="py-6 text-center">
      <Loader2 size={34} className="mx-auto animate-spin text-[var(--ui-brand-primary)]" />
      <h2 className="mt-5 text-lg font-semibold text-[var(--ui-text-title)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--ui-text-weak)]">{desc}</p>
      <div className="mt-6">
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>取消登录</button>
      </div>
    </div>
  );
}

// ===== 失败状态页 =====

function LoginFailureView({ phase, source, onBackToForm, onRetrySubmit, onGoBackToSourcePage, onGoExit, showNotice }: {
  phase: FailurePhase;
  source: LoginSource;
  onBackToForm: () => void;
  onRetrySubmit: () => void;
  onGoBackToSourcePage: () => void;
  onGoExit: () => void;
  showNotice: (message: string) => void;
}) {
  const copy = FAILURE_COPY[phase];
  return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">{copy.icon}</div>
      <h2 className="mt-5 text-lg font-semibold text-[var(--ui-text-title)]">{copy.title}</h2>
      <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-[var(--ui-text-weak)]">{copy.desc}</p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {phase === 'invalid_credentials' && (
          <button type="button" onClick={onBackToForm} className={primaryButtonClass + ' w-auto px-6'}>重新输入</button>
        )}
        {phase === 'account_locked' && (
          <>
            <button type="button" onClick={() => showNotice('原型演示：账号解锁与帮助能力暂未开放。')} className={secondaryButtonClass}>查看帮助</button>
            <button type="button" onClick={onGoExit} className={secondaryButtonClass}>返回</button>
          </>
        )}
        {phase === 'account_disabled' && (
          <>
            <button type="button" onClick={() => showNotice('原型演示：联系管理员能力暂未开放。')} className={secondaryButtonClass}>联系管理员</button>
            <button type="button" onClick={onGoExit} className={secondaryButtonClass}>返回</button>
          </>
        )}
        {phase === 'permission_denied' && (
          <>
            <button type="button" onClick={() => showNotice('原型演示：联系管理员能力暂未开放。')} className={secondaryButtonClass}>联系管理员</button>
            <button type="button" onClick={onGoExit} className={secondaryButtonClass}>返回</button>
          </>
        )}
        {(phase === 'network_error' || phase === 'system_error') && (
          <>
            <button type="button" onClick={onRetrySubmit} className={primaryButtonClass + ' w-auto px-6'}>
              <RefreshCw size={15} />重试
            </button>
            <button type="button" onClick={onBackToForm} className={secondaryButtonClass}>返回登录</button>
          </>
        )}
        {phase === 'cancelled' && (
          <>
            <button type="button" onClick={onBackToForm} className={primaryButtonClass + ' w-auto px-6'}>重新登录</button>
            <button type="button" onClick={onGoBackToSourcePage} className={secondaryButtonClass}>返回来源页</button>
          </>
        )}
        {phase === 'timed_out' && (
          <button type="button" onClick={onBackToForm} className={primaryButtonClass + ' w-auto px-6'}>重新登录</button>
        )}
      </div>

      {source === 'client' && (phase === 'account_locked' || phase === 'account_disabled' || phase === 'permission_denied') && (
        <button type="button" onClick={onGoExit} className={linkButtonClass + ' mt-4 block w-full text-center'}>返回客户端未登录页</button>
      )}
    </div>
  );
}

// ===== Web 进入中 =====

function WebEnteringView({ title, desc, onContinueNow }: { title: string; desc: string; onContinueNow: () => void }) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-theme-50 text-theme-700 dark:bg-theme-700/20">
        <Globe2 size={30} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-[var(--ui-text-title)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--ui-text-weak)]">{desc}</p>
      <div className="mt-6">
        <button type="button" onClick={onContinueNow} className={primaryButtonClass + ' w-auto px-6'}>立即进入</button>
      </div>
    </div>
  );
}

// ===== 客户端：登录成功 =====

function ClientAuthenticatedView({ onContinueNow }: { onContinueNow: () => void }) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
        <LogIn size={30} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-[var(--ui-text-title)]">登录成功</h2>
      <p className="mt-2 text-sm text-[var(--ui-text-weak)]">账号校验通过，准备同步客户端登录信息。</p>
      <div className="mt-6">
        <button type="button" onClick={onContinueNow} className={primaryButtonClass + ' w-auto px-6'}>立即继续</button>
      </div>
    </div>
  );
}

// ===== 客户端：同步中 =====

function ClientSyncView({ onContinueNow }: { onContinueNow: () => void }) {
  return (
    <div className="py-6 text-center">
      <Loader2 size={34} className="mx-auto animate-spin text-[var(--ui-brand-primary)]" />
      <h2 className="mt-5 text-lg font-semibold text-[var(--ui-text-title)]">正在同步登录信息</h2>
      <p className="mt-2 text-sm text-[var(--ui-text-weak)]">正在将登录信息同步到 i吉祥客户端…</p>
      <div className="mt-6">
        <button type="button" onClick={onContinueNow} className={primaryButtonClass + ' w-auto px-6'}>立即继续</button>
      </div>
    </div>
  );
}

// ===== 客户端：同步失败 =====

function ClientSyncFailureView({ onRetrySync, onBackToForm, onCancel }: { onRetrySync: () => void; onBackToForm: () => void; onCancel: () => void }) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
        <RefreshCw size={30} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-[var(--ui-text-title)]">登录信息同步失败</h2>
      <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-[var(--ui-text-weak)]">账号登录成功，但客户端登录信息同步失败。可重试同步或重新登录。</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRetrySync} className={primaryButtonClass + ' w-auto px-6'}>
          <RefreshCw size={15} />重试同步
        </button>
        <button type="button" onClick={onBackToForm} className={secondaryButtonClass}>重新登录</button>
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>取消</button>
      </div>
    </div>
  );
}

// ===== 客户端：拉起中 =====

function ClientLaunchingView({ onContinueNow }: { onContinueNow: () => void }) {
  return (
    <div className="py-6 text-center">
      <Loader2 size={34} className="mx-auto animate-spin text-[var(--ui-brand-primary)]" />
      <h2 className="mt-5 text-lg font-semibold text-[var(--ui-text-title)]">正在拉起 i吉祥客户端</h2>
      <p className="mt-2 text-sm text-[var(--ui-text-weak)]">登录信息同步完成，正在为你打开客户端…</p>
      <div className="mt-6">
        <button type="button" onClick={onContinueNow} className={primaryButtonClass + ' w-auto px-6'}>立即进入</button>
      </div>
    </div>
  );
}

// ===== 客户端：拉起失败 =====

function ClientLaunchFailureView({ onRetryLaunch, onDownload, onBackToForm }: { onRetryLaunch: () => void; onDownload: () => void; onBackToForm: () => void }) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
        <AlertTriangle size={30} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-[var(--ui-text-title)]">客户端拉起失败</h2>
      <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-[var(--ui-text-weak)]">登录信息已同步，但客户端未能启动。可重新打开客户端，或下载最新安装包。</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRetryLaunch} className={primaryButtonClass + ' w-auto px-6'}>
          <RefreshCw size={15} />重新打开
        </button>
        <button type="button" onClick={onDownload} className={secondaryButtonClass}>
          <Download size={15} />下载客户端
        </button>
        <button type="button" onClick={onBackToForm} className={secondaryButtonClass}>返回登录</button>
      </div>
    </div>
  );
}

