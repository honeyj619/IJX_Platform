import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Star, Pin, BellOff, ScanLine, Users, FolderOpen, UserPlus, Check, EyeOff, Trash2, AtSign } from 'lucide-react';
import { useImStore } from '@/store/imStore';
import { filterSessions, hasUnreadMention, sessionIcon, sessionPreview, sessionTitle } from '@/store/imSelectors';
import { timeLabel, totalUnread } from '@/data/im/utils';
import { ImAvatar, ImChip, ImEmpty, ImSearchBar, ImSheet, ImToast } from './imComponents';
import { useImSnapshot, useToast } from './imHooks';
import type { Session, SessionFilter } from '@/data/im/types';

const FILTERS: { key: SessionFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'mention', label: '@消息' },
];

export default function MessagesHome() {
  const navigate = useNavigate();
  const state = useImSnapshot();
  const [filter, setFilter] = useState<SessionFilter>('all');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const list = useMemo(() => filterSessions(state, filter, query), [state, filter, query]);
  const unread = totalUnread(state.sessions);
  const plusItems = [
    { icon: <ScanLine size={20} />, label: '扫一扫', path: '/app/messages/scan' },
    { icon: <Users size={20} />, label: '创建群聊', path: '/app/messages/groups/create' },
    { icon: <UserPlus size={20} />, label: '通讯录', path: '/app/messages/contacts' },
    { icon: <FolderOpen size={20} />, label: '我的群聊', path: '/app/messages/groups' },
  ];
  const sheetSession = sheetId ? state.sessions.find((s) => s.id === sheetId) : undefined;

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#ebedf0] bg-white px-3">
        <div className="text-[16px] font-semibold text-[#323233]">吉祥航空</div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/app/messages/search')} className="grid h-8 w-8 place-items-center rounded-full text-[#646566] hover:bg-[#f2f3f5]" aria-label="全局搜索"><Search size={20} /></button>
          <button onClick={() => setPlusOpen(true)} className="grid h-8 w-8 place-items-center rounded-full text-[#f53a71] hover:bg-[#f2f3f5]" aria-label="新建"><Plus size={20} /></button>
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-2 bg-white px-3 pb-2 pt-2">
        {FILTERS.map((f) => <ImChip key={f.key} active={filter === f.key} label={f.label} onClick={() => setFilter(f.key)} />)}
        <div className="flex-1" />
        <button onClick={() => { setSearchOpen((v) => !v); setQuery(''); }} className="grid h-7 w-7 place-items-center text-[#646566]" aria-label="搜索会话"><Search size={16} /></button>
        {unread > 0 && <button onClick={() => setFilter('unread')} className="shrink-0 text-[12px] text-[#f53a71]">未读 {unread > 99 ? '99+' : unread}</button>}
      </div>

      {searchOpen && <div className="shrink-0 bg-white px-3 pb-2"><ImSearchBar value={query} onChange={setQuery} placeholder="搜索会话名称或最后消息" /></div>}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {list.map((s) => (
          <SessionRow
            key={s.id}
            session={s}
            state={state}
            onClick={() => navigate(s.type === 'service-inbox'
              ? `/app/messages/service/${s.targetId}`
              : `/app/messages/session/${s.id}`)}
            onLongPress={() => setSheetId(s.id)}
          />
        ))}
        {list.length === 0 && (
          <ImEmpty
            title={query ? '没有匹配的会话' : filter === 'mention' ? '暂无未读的 @消息' : filter === 'unread' ? '暂无未读会话' : '暂无会话'}
            desc={filter === 'mention' ? '只有未读区间内被 @ 的群聊会出现在这里' : undefined}
          />
        )}
      </div>

      {/* + 操作菜单 */}
      <ImSheet open={plusOpen} onClose={() => setPlusOpen(false)} title="发起">
        <div className="grid grid-cols-4 gap-2 p-4">
          {plusItems.map((item) => (
            <button key={item.label} onClick={() => { setPlusOpen(false); navigate(item.path); }} className="flex flex-col items-center gap-2 rounded-xl bg-[#f2f3f5] py-3">
              <span className="text-[#f53a71]">{item.icon}</span>
              <span className="text-[12px] text-[#323233]">{item.label}</span>
            </button>
          ))}
        </div>
      </ImSheet>

      {/* 会话长按操作 */}
      <ImSheet open={!!sheetSession} onClose={() => setSheetId(null)} title={sheetSession ? sessionTitle(state, sheetSession) : ''}>
        {sheetSession && (
          <div className="grid grid-cols-1 gap-1 p-3">
            <SheetItem icon={<Pin size={16} />} label={sheetSession.pinned ? '取消置顶' : '置顶会话'} onClick={() => { useImStore.getState().togglePin(sheetSession.id); setSheetId(null); }} />
            <SheetItem icon={<Star size={16} />} label={sheetSession.starred ? '取消星标' : '星标会话'} onClick={() => { useImStore.getState().toggleStar(sheetSession.id); setSheetId(null); }} />
            <SheetItem icon={<BellOff size={16} />} label={sheetSession.mute ? '关闭免打扰' : '消息免打扰'} onClick={() => { useImStore.getState().toggleMute(sheetSession.id); setSheetId(null); }} />
            <SheetItem icon={<Check size={16} />} label="标为已读" onClick={() => { useImStore.getState().markRead(sheetSession.id); setSheetId(null); showToast('已标为已读'); }} />
            <SheetItem icon={<EyeOff size={16} />} label="隐藏会话" onClick={() => { useImStore.getState().setSessionHidden(sheetSession.id, true); setSheetId(null); showToast('会话已隐藏'); }} />
            <SheetItem icon={<Trash2 size={16} />} label="删除会话" danger onClick={() => { useImStore.getState().removeSession(sheetSession.id); setSheetId(null); showToast('会话已删除'); }} />
          </div>
        )}
      </ImSheet>

      <ImToast text={toast} />
    </div>
  );
}

function SessionRow({ session, state, onClick, onLongPress }: {
  session: Session;
  state: ReturnType<typeof useImSnapshot>;
  onClick: () => void;
  onLongPress: () => void;
}) {
  const timer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const preview = sessionPreview(state, session.id);
  const mentioned = hasUnreadMention(state, session);
  const icon = sessionIcon(state, session);

  const clear = () => { if (timer.current !== null) { window.clearTimeout(timer.current); timer.current = null; } };
  return (
    <button
      onClick={() => { if (longPressed.current) { longPressed.current = false; return; } onClick(); }}
      onContextMenu={(e) => { e.preventDefault(); onLongPress(); }}
      onTouchStart={() => { longPressed.current = false; timer.current = window.setTimeout(() => { longPressed.current = true; onLongPress(); }, 480); }}
      onTouchEnd={clear}
      onTouchMove={clear}
      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors active:bg-[#f2f3f5] ${session.pinned ? 'bg-white' : ''}`}
    >
      <div className="relative shrink-0">
        <ImAvatar id={session.targetId} name={sessionTitle(state, session)} isGroup={session.type === 'group'} icon={icon || undefined} />
        {session.unread > 0 && !session.mute && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#f53a71] px-1 text-[10px] font-medium leading-none text-white">
            {session.unread > 99 ? '99+' : session.unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 border-b border-[#ebedf0] pb-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <div className="truncate text-[15px] font-medium text-[#323233]">{sessionTitle(state, session)}</div>
            {session.starred && <Star size={13} className="shrink-0 fill-[#f5bc0e] text-[#f5bc0e]" />}
            {session.pinned && <Pin size={13} className="shrink-0 text-[#f53a71]" />}
          </div>
          <div className="shrink-0 text-[11px] text-[#969799]">{timeLabel(session.lastTs) || session.lastTime}</div>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className={`min-w-0 truncate text-[13px] ${session.unread > 0 ? 'text-[#323233]' : 'text-[#969799]'}`}>
            {mentioned && <span className="mr-1 font-medium text-[#f53a71]">[有人@我]</span>}
            {preview || <span className="text-[#c8c9cc]">暂无消息</span>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {mentioned && <AtSign size={13} className="text-[#f53a71]" />}
            {session.mute && <BellOff size={13} className="text-[#969799]" />}
            {session.unread > 0 && session.mute && (
              <span className="grid h-4 min-w-[16px] place-items-center rounded-full bg-[#c8c9cc] px-1 text-[10px] leading-none text-white">{session.unread > 99 ? '99+' : session.unread}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function SheetItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] ${danger ? 'text-[#f35f5f]' : 'text-[#323233]'}`}>
      <span className={danger ? 'text-[#f35f5f]' : 'text-[#646566]'}>{icon}</span>{label}
    </button>
  );
}
