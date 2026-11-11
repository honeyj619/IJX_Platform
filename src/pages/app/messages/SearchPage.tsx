import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useImStore } from '@/store/imStore';
import { searchContacts, searchGroups, searchRecords, searchSessions, sessionTitle } from '@/store/imSelectors';
import { ImAvatar, ImChip, ImEmpty, ImPageHeader, ImSearchBar, ImToast } from './imComponents';
import { useImSnapshot, useToast } from './imHooks';
import type { MessageType, SearchFilters } from '@/data/im/types';

type Tab = 'all' | 'contact' | 'group' | 'record';

const MSG_TYPES: { key: 'all' | MessageType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'text', label: '文本' },
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' },
  { key: 'file', label: '文件' },
  { key: 'voice', label: '语音' },
  { key: 'article', label: '图文' },
  { key: 'vote', label: '投票' },
  { key: 'chain', label: '接龙' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [advanced, setAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ chatType: 'all', msgType: 'all' });
  const q = query.trim();

  const contacts = useMemo(() => searchContacts(state, q), [state, q]);
  const serviceAccounts = useMemo(() => q
    ? state.serviceAccounts.filter((a) => [a.name, a.desc].join(' ').toLowerCase().includes(q.toLowerCase()))
    : [], [state, q]);
  const apps = useMemo(() => q
    ? state.imApps.filter((a) => [a.name, a.desc].join(' ').toLowerCase().includes(q.toLowerCase()))
    : [], [state, q]);
  const groups = useMemo(() => searchGroups(state, q), [state, q]);
  const sessions = useMemo(() => searchSessions(state, q), [state, q]);
  const records = useMemo(() => q || filters.sender || filters.date || filters.at || (filters.msgType && filters.msgType !== 'all')
    ? searchRecords(state, q, filters)
    : [], [state, q, filters]);

  const openContact = (id: string) => {
    const sid = useImStore.getState().createSingleSession(id);
    navigate(`/app/messages/session/${sid}`);
  };
  const openGroup = (groupId: string) => {
    const session = state.sessions.find((s) => s.type === 'group' && s.targetId === groupId);
    if (session) navigate(`/app/messages/session/${session.id}`);
    else showToast('该群暂无会话');
  };
  const openRecord = (sessionId: string, msgId: string) => navigate(`/app/messages/session/${sessionId}?messageId=${encodeURIComponent(msgId)}`);
  const show = (id: Tab) => tab === 'all' || tab === id;
  const hasResult = contacts.length + groups.length + records.length + sessions.length + apps.length + serviceAccounts.length > 0;
  const tabEmpty = tab === 'all' ? !hasResult
    : tab === 'contact' ? contacts.length + apps.length + serviceAccounts.length === 0
      : tab === 'group' ? groups.length === 0
        : records.length + sessions.length === 0;

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="搜索" />
      <div className="shrink-0 bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1"><ImSearchBar value={query} onChange={setQuery} placeholder="搜索联系人、群聊、聊天记录" /></div>
          <button onClick={() => setAdvanced((v) => !v)} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${advanced ? 'bg-[#f53a71]/10 text-[#f53a71]' : 'bg-[#f2f3f5] text-[#646566]'}`} aria-label="高级筛选"><SlidersHorizontal size={17} /></button>
        </div>
        {advanced && (
          <div className="mt-2 space-y-2 rounded-xl bg-[#f7f8fa] p-3">
            <input value={filters.sender ?? ''} onChange={(e) => setFilters((f) => ({ ...f, sender: e.target.value }))} placeholder="发送人姓名" className="h-8 w-full rounded-lg bg-white px-2 text-[13px] outline-none" />
            <input value={filters.group ?? ''} onChange={(e) => setFilters((f) => ({ ...f, group: e.target.value }))} placeholder="群聊名称" className="h-8 w-full rounded-lg bg-white px-2 text-[13px] outline-none" />
            <div className="flex gap-2">
              <select value={filters.chatType ?? 'all'} onChange={(e) => setFilters((f) => ({ ...f, chatType: e.target.value as SearchFilters['chatType'] }))} className="h-8 min-w-0 flex-1 rounded-lg bg-white px-2 text-[13px]">
                <option value="all">全部会话</option><option value="single">单聊</option><option value="group">群聊</option>
              </select>
              <input type="date" value={filters.date ?? ''} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} className="h-8 w-32 rounded-lg bg-white px-2 text-[12px]" />
            </div>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
              {MSG_TYPES.map((t) => <ImChip key={t.key} active={(filters.msgType ?? 'all') === t.key} label={t.label} onClick={() => setFilters((f) => ({ ...f, msgType: t.key }))} />)}
            </div>
            <label className="flex items-center gap-2 text-[13px] text-[#646566]">
              <input type="checkbox" checked={!!filters.at} onChange={(e) => setFilters((f) => ({ ...f, at: e.target.checked }))} /> 只看 @我的消息
            </label>
            <button onClick={() => setFilters({ chatType: 'all', msgType: 'all' })} className="text-[12px] text-[#2e71ff]">重置筛选</button>
          </div>
        )}
      </div>
      <div className="flex shrink-0 gap-4 bg-white px-4 text-[14px]">
        {([['all', '全部'], ['contact', '联系人'], ['group', '群聊'], ['record', '聊天记录']] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`border-b-2 py-2 ${tab === t ? 'border-[#f53a71] font-medium text-[#f53a71]' : 'border-transparent text-[#646566]'}`}>{label}</button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {!q && !hasResult && <ImEmpty title="输入关键词搜索" desc="支持联系人、群聊、应用消息与聊天记录，可展开高级筛选" />}

        {show('contact') && contacts.length > 0 && (
          <Section label="联系人">
            {contacts.map((c) => (
              <button key={c.id} onClick={() => openContact(c.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <ImAvatar id={c.id} name={c.name} size={40} />
                <div className="min-w-0 flex-1 border-b border-[#ebedf0] pb-3">
                  <div className="text-[15px] text-[#323233]">{c.name}</div>
                  <div className="mt-0.5 truncate text-[12px] text-[#969799]">{c.job} · {c.dept}</div>
                </div>
                <ChevronRight size={15} className="shrink-0 text-[#c8c9cc]" />
              </button>
            ))}
          </Section>
        )}

        {show('contact') && (serviceAccounts.length > 0 || apps.length > 0) && (
          <Section label="应用与服务">
            {serviceAccounts.map((a) => (
              <button key={a.id} onClick={() => navigate(`/app/messages/service/${a.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <ImAvatar name={a.name} size={40} icon={a.icon} />
                <div className="min-w-0 flex-1 truncate text-[15px] text-[#323233]">{a.name}<span className="ml-2 text-[12px] text-[#969799]">{a.desc}</span></div>
              </button>
            ))}
            {apps.map((a) => (
              <button key={a.id} onClick={() => navigate(`/app/messages/session/s-im-${a.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <ImAvatar name={a.name} size={40} icon={a.icon} />
                <div className="min-w-0 flex-1 truncate text-[15px] text-[#323233]">{a.name}<span className="ml-2 text-[12px] text-[#969799]">{a.desc}</span></div>
              </button>
            ))}
          </Section>
        )}

        {show('group') && groups.length > 0 && (
          <Section label="群聊">
            {groups.map((g) => (
              <button key={g.id} onClick={() => openGroup(g.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <ImAvatar name={g.name} isGroup size={40} />
                <div className="min-w-0 flex-1 truncate border-b border-[#ebedf0] pb-3 text-[15px] text-[#323233]">{g.name}</div>
              </button>
            ))}
          </Section>
        )}

        {show('record') && sessions.length > 0 && (
          <Section label="相关会话">
            {sessions.map((s) => (
              <button key={s.id} onClick={() => navigate(`/app/messages/session/${s.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <ImAvatar id={s.targetId} name={sessionTitle(state, s)} isGroup={s.type === 'group'} size={40} />
                <div className="min-w-0 flex-1 truncate text-[14px] text-[#323233]">{sessionTitle(state, s)}</div>
              </button>
            ))}
          </Section>
        )}

        {show('record') && (
          <Section label={`聊天记录${records.length ? ` · ${records.length}` : ''}`}>
            {records.map((r) => (
              <button key={`${r.sessionId}-${r.msgId}`} onClick={() => openRecord(r.sessionId, r.msgId)} className="flex w-full items-start gap-3 px-4 py-3 text-left">
                <ImAvatar id={r.from} name={r.from === 'me' ? '我' : r.from} size={36} />
                <div className="min-w-0 flex-1 border-b border-[#ebedf0] pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[14px] text-[#323233]">{r.title}</div>
                    <div className="shrink-0 text-[11px] text-[#969799]">{r.time ?? ''}</div>
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-[#646566]">{r.text}</div>
                  <div className="mt-0.5 text-[11px] text-[#2e71ff]">定位到原消息 ›</div>
                </div>
              </button>
            ))}
          </Section>
        )}

        {q && tabEmpty && <ImEmpty title="没有匹配结果" desc="换个关键词，或调整高级筛选条件" />}
      </div>
      <ImToast text={toast} />
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 pb-1 pt-3 text-[12px] text-[#969799]">{label}</div>
      <div className="bg-white">{children}</div>
    </div>
  );
}
