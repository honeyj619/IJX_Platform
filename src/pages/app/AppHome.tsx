import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  HOME_BANNER_ENTRIES,
  HOME_QUICK_APPS,
  HOME_PROMOS,
  HOME_NOTICES,
  HOME_CULTURE,
  HOME_INFO_NOTICES,
  HOME_WELFARE,
  HOME_GOODS_BRAND,
  HOME_GOODS_TRAVEL,
} from '@/data/app/homeFeed';

const TONE_BG: Record<string, string> = {
  pink: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)',
  blue: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  amber: 'linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)',
  violet: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
};

/** App 首页（参照截图 IMG1：渐变 banner → 宫格 → 运营横幅 → 通知公告 → 企业文化 → 信息通知 → 福利中心 → 精品推荐 → 智能助手） */
export default function AppHome() {
  const navigate = useNavigate();

  const openTile = (route?: string) => {
    if (route) navigate(route);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f7f8fa] pb-4">
      {/* 渐变 banner：定位 + 快捷服务入口 4 卡 */}
      <div className="px-4 pb-7 pt-2" style={{ background: 'linear-gradient(180deg, #c492d1 0%, #d6bae3 58%, #f0e9f4 100%)' }}>
        <div className="flex items-center justify-between text-white/95">
          <span className="text-[13px]">📍 上海市</span>
          <span className="text-[11px]">15:06 · 晴 22℃</span>
        </div>
        <div className="mt-3 text-[18px] font-semibold text-white drop-shadow-sm">快捷服务入口</div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {HOME_BANNER_ENTRIES.map((e) => (
            <button
              key={e.id}
              onClick={() => openTile(e.route)}
              className="flex flex-col items-center gap-1 rounded-xl bg-white/90 py-2.5 shadow-sm"
            >
              <span className="relative grid h-10 w-10 place-items-center rounded-full text-[22px]">
                {e.emoji}
                <span className="absolute -right-1.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#f53a71] px-1 text-[10px] font-medium leading-none text-white">
                  {e.badge}
                </span>
              </span>
              <span className="text-[12px] text-[#323233]">{e.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 快捷服务宫格（2 行 × 4 列） */}
      <div className="-mt-4 rounded-2xl bg-white px-2 pb-3 pt-3 shadow-sm">
        <div className="grid grid-cols-4 gap-y-3">
          {HOME_QUICK_APPS.map((app) => (
            <button key={app.id} onClick={() => openTile(app.route)} className="flex flex-col items-center gap-1.5 py-1">
              <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-[#f2f3f5] text-[22px]">
                {app.emoji}
                {app.badge && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#f53a71] px-1 text-[10px] font-medium leading-none text-white">
                    {app.badge}
                  </span>
                )}
              </span>
              <span className="text-[12px] text-[#323233]">{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 运营横幅（banner 图样式） */}
      <div className="mt-3 space-y-2.5 px-3">
        {HOME_PROMOS.map((p) => (
          <button
            key={p.id}
            className="relative flex h-[56px] w-full items-center overflow-hidden rounded-xl text-left shadow-sm"
            style={{ background: p.tone === 'pink' ? 'linear-gradient(120deg, #f76a8c 0%, #f53a71 100%)' : 'linear-gradient(120deg, #6a9de8 0%, #2e71ff 100%)' }}
          >
            <span className="absolute left-3.5 grid h-9 w-9 place-items-center rounded-lg bg-white/20 text-[20px]">{p.emoji}</span>
            <div className="min-w-0 w-full px-14">
              <div className="truncate text-center text-[14px] font-medium text-white">{p.title}</div>
              <div className="mt-0.5 truncate text-center text-[11px] text-white/85">{p.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* 通知公告 */}
      <div className="mt-3 rounded-2xl bg-white px-4 pb-2 pt-3 shadow-sm">
        <SectionTitle title="通知公告" more />
        <div>
          {HOME_NOTICES.map((n) => (
            <button key={n.id} className="flex w-full items-start gap-2 py-2.5 text-left">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f53a71]" />
              <div className="min-w-0 flex-1 border-b border-[#ebedf0] pb-2.5 last:border-b-0">
                <div className="truncate text-[14px] text-[#323233]">{n.title}</div>
                <div className="mt-0.5 text-[11px] text-[#969799]">{n.docNo}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 企业文化 */}
      <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <SectionTitle title="企业文化" />
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {HOME_CULTURE.map((c) => (
            <div key={c.id} className="flex flex-col items-center rounded-xl bg-[#f2f3f5] py-3 text-center">
              <span className="text-[22px]">{c.emoji}</span>
              <span className="mt-1 text-[12px] font-medium text-[#323233]">{c.name}</span>
              <span className="mt-0.5 text-[10px] text-[#969799]">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 信息通知 */}
      <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <SectionTitle title="信息通知" />
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {HOME_INFO_NOTICES.map((i) => (
            <button key={i.id} className="flex items-center gap-2.5 rounded-xl bg-[#f2f3f5] px-3 py-3 text-left">
              <span className="text-[22px]">{i.emoji}</span>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-[#323233]">{i.name}</div>
                <div className="truncate text-[11px] text-[#969799]">{i.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 福利中心：2×2 宫格 */}
      <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <SectionTitle title="福利中心" more />
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {HOME_WELFARE.map((w) => (
            <button key={w.id} className="flex items-center gap-2.5 rounded-xl border border-[#ebedf0] px-3 py-2.5 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[20px]" style={{ background: TONE_BG[w.tone] }}>
                {w.emoji}
              </span>
              <span className="min-w-0 truncate text-[13px] text-[#323233]">{w.name}</span>
            </button>
          ))}
        </div>
        {/* 生日福利大卡 */}
        <button className="mt-2.5 flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left" style={{ background: 'linear-gradient(120deg, #fff1f2 0%, #ffe4e6 60%, #fde68a 100%)' }}>
          <span className="text-[30px]">🎂</span>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium text-[#323233]">生日福利 · 员工 2026 年 10 月生</div>
            <div className="truncate text-[12px] text-[#646566]">Happy Birthday！吉祥与你同庆 🎉</div>
          </div>
          <ChevronRight size={16} className="shrink-0 text-[#c8c9cc]" />
        </button>
      </div>

      {/* 精品推荐 · 吉祥航空 */}
      <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <SectionTitle title="精品推荐" more />
        <div className="no-scrollbar mt-2.5 flex gap-2.5 overflow-x-auto">
          {HOME_GOODS_BRAND.map((g) => (
            <button key={g.id} className="w-[118px] shrink-0 overflow-hidden rounded-xl border border-[#ebedf0] text-left">
              <div className="flex h-20 w-full items-center justify-center" style={{ background: TONE_BG[g.tone] }}>
                <span className="text-[32px]">{g.emoji}</span>
              </div>
              <div className="px-2 py-1.5">
                <div className="truncate text-[12px] text-[#323233]">{g.name}</div>
                <div className="mt-0.5 text-[12px] font-semibold text-[#f53a71]">{g.price}</div>
              </div>
            </button>
          ))}
        </div>
        {/* 精品推荐 · 休闲度假（横向滚动） */}
        <div className="no-scrollbar mt-2.5 flex gap-2.5 overflow-x-auto">
          {HOME_GOODS_TRAVEL.map((g) => (
            <button key={g.id} className="w-[150px] shrink-0 overflow-hidden rounded-xl border border-[#ebedf0] text-left">
              <div className="flex h-24 w-full items-center justify-center" style={{ background: TONE_BG[g.tone] }}>
                <span className="text-[34px]">{g.emoji}</span>
              </div>
              <div className="px-2 py-1.5">
                <div className="line-clamp-2 text-[12px] leading-4 text-[#323233]">{g.name}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#f53a71]">{g.price}</span>
                  <span className="text-[10px] text-[#969799]">{g.tag}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 智能助手入口 */}
      <button className="mt-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm" style={{ marginLeft: 12 }}>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#c492d1] to-[#d6bae3] text-[20px]">🤖</span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium text-[#323233]">智能助手</div>
          <div className="truncate text-[12px] text-[#969799]">有事找我，一键直达</div>
        </div>
        <ChevronRight size={16} className="shrink-0 text-[#c8c9cc]" />
      </button>
    </div>
  );
}

function SectionTitle({ title, more }: { title: string; more?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[15px] font-semibold text-[#323233]">{title}</span>
      {more && (
        <span className="flex items-center text-[12px] text-[#969799]">
          更多 <ChevronRight size={14} />
        </span>
      )}
    </div>
  );
}
