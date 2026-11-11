import { useState } from 'react';
import { ChevronRight, QrCode, Wifi } from 'lucide-react';
import { MAIN_USER_AVATAR } from '@/data/people';
import { PROFILE_CARD, PROFILE_QUICK, PROFILE_WALLET, PROFILE_JISHIGO, PROFILE_MENU, PROFILE_LOGOUT } from '@/data/app/profile';

const TONE_BG: Record<string, string> = {
  pink: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
  blue: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  amber: 'linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)',
};

/** App 我的（参照截图 IMG6：绿色名片卡 → 三宫格 → 钱包卡 → 吉食GO → 列表 → 退出账号） */
export default function AppMe() {
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  return (
    <div className="h-full overflow-y-auto bg-[#f7f8fa] pb-4">
      {/* 名片卡（绿色渐变 + 名片角标） */}
      <div className="relative mx-3 mt-3 overflow-hidden rounded-2xl px-4 py-5 text-white" style={{ background: 'linear-gradient(120deg, #9db8a0 0%, #7fa88f 60%, #6d9478 100%)' }}>
        <button className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] text-white">
          名片 <ChevronRight size={12} />
        </button>
        <div className="flex items-center gap-3">
          <img src={MAIN_USER_AVATAR} alt="头像" className="h-14 w-14 rounded-full border-2 border-white/70 object-cover" />
          <div className="min-w-0">
            <div className="text-[18px] font-semibold">{PROFILE_CARD.name}</div>
            <div className="mt-0.5 text-[12px] text-white/90">{PROFILE_CARD.job}</div>
            <div className="mt-0.5 truncate text-[12px] text-white/80">{PROFILE_CARD.dept}</div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-white/15 px-3 py-2 text-[12px]">
          {PROFILE_CARD.joinDate} 日加入，您在吉祥第 {PROFILE_CARD.days} 天！吉祥感谢有你！
        </div>
      </div>

      {/* 快捷三宫格：我的薪酬 / 我要打卡 / 我的福利 */}
      <div className="mx-3 mt-3 grid grid-cols-3 gap-2.5">
        {PROFILE_QUICK.map((q) => (
          <button key={q.id} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white py-3.5 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl text-[20px]" style={{ background: TONE_BG[q.tone] }}>
              {q.emoji}
            </span>
            <span className="text-[12px] text-[#323233]">{q.label}</span>
          </button>
        ))}
      </div>

      {/* 我的钱包卡 + Wi-Fi 提示 */}
      <button className="mx-3 mt-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff8e1] text-[20px]">👛</span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-[#323233]">{PROFILE_WALLET.title}</div>
          <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[#969799]">
            <Wifi size={12} className="shrink-0" /> {PROFILE_WALLET.hint}
          </div>
        </div>
        <ChevronRight size={16} className="shrink-0 text-[#c8c9cc]" />
      </button>

      {/* 吉食GO 卡：余额 + 付款码 */}
      <button className="mx-3 mt-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fde68a] text-[20px]">🍜</span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-[#323233]">{PROFILE_JISHIGO.label}</div>
          <div className="mt-0.5 text-[12px] text-[#969799]">
            {PROFILE_JISHIGO.balanceLabel} <span className="font-semibold text-[#f53a71]">{PROFILE_JISHIGO.balance}</span>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#f53a71] px-3 py-1.5 text-[12px] text-white">
          <QrCode size={13} /> {PROFILE_JISHIGO.payLabel}
        </span>
      </button>

      {/* 功能列表 */}
      <div className="mx-3 mt-3 rounded-2xl bg-white shadow-sm">
        {PROFILE_MENU.map((item, i) => (
          <button key={item.id} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${i > 0 ? 'border-t border-[#ebedf0]' : ''}`}>
            <span className="text-[18px]">{item.emoji}</span>
            <span className="flex-1 text-[14px] text-[#323233]">{item.label}</span>
            <ChevronRight size={15} className="shrink-0 text-[#c8c9cc]" />
          </button>
        ))}
      </div>

      {/* 退出账号 */}
      <button
        onClick={() => setLogoutConfirm(true)}
        className="mx-3 mt-3 flex w-[calc(100%-24px)] items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[14px] text-[#f53a71] shadow-sm"
      >
        {PROFILE_LOGOUT.emoji} {PROFILE_LOGOUT.label}
      </button>

      {/* 退出确认 */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={() => setLogoutConfirm(false)}>
          <div className="w-full max-w-[430px] rounded-t-2xl bg-white p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-[16px] font-medium text-[#323233]">退出账号</div>
            <div className="mt-2 text-[13px] text-[#646566]">退出后需重新登录才能使用 i吉祥。</div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setLogoutConfirm(false)} className="rounded-xl bg-[#f2f3f5] py-2.5 text-[14px] text-[#323233]">取消</button>
              <button onClick={() => setLogoutConfirm(false)} className="rounded-xl bg-[#f53a71] py-2.5 text-[14px] text-white">确认退出</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
