import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { displayName, getSession, searchRecords, sessionTitle } from '@/store/imSelectors';
import { ImAvatar, ImChip, ImEmpty, ImPageHeader, ImSearchBar } from './imComponents';
import { useImSnapshot } from './imHooks';
import type { MessageType, SearchFilters } from '@/data/im/types';

type FilterKey = 'all' | 'at' | MessageType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'text', label: '文本' },
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' },
  { key: 'file', label: '文件' },
  { key: 'voice', label: '语音' },
  { key: 'article', label: '图文' },
  { key: 'at', label: '@消息' },
];

export default function HistoryPage() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [date, setDate] = useState('');
  const [sender, setSender] = useState('');
  const session = getSession(state, sessionId);

  const results = useMemo(() => {
    const filters: SearchFilters = {
      msgType: filter !== 'all' && filter !== 'at' ? filter as MessageType : 'all',
      at: filter === 'at',
      date: date || undefined,
      sender: sender || undefined,
    };
    return searchRecords(state, query, filters, sessionId);
  }, [state, sessionId, query, filter, date, sender]);

  if (!session) {
    return (
      <div className="flex h-full flex-col bg-[#f7f8fa]">
        <ImPageHeader title="历史记录" />
        <ImEmpty title="会话不存在" />
      </div>
    );
  }

  const active = query || filter !== 'all' || date || sender;
  const open = (msgId: string) => navigate(`/app/messages/session/${sessionId}?messageId=${encodeURIComponent(msgId)}`);

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="查找聊天记录" right={<button onClick={() => navigate(`/app/messages/session/${sessionId}`)} className="text-[12px] text-[#646566]">进会话</button>} />
      <div className="shrink-0 bg-white px-3 pb-2 pt-2">
        <ImSearchBar value={query} onChange={setQuery} placeholder={`搜索 ${sessionTitle(state, session)} 的聊天记录`} />
        <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto">
          {FILTERS.map((f) => <ImChip key={f.key} active={filter === f.key} label={f.label} onClick={() => setFilter(f.key)} />)}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="发送人" className="h-8 min-w-0 flex-1 rounded-lg bg-[#f2f3f5] px-2 text-[12px] outline-none" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 w-32 shrink-0 rounded-lg border border-[#ebedf0] bg-white px-2 text-[12px] text-[#646566]" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!active && <ImEmpty title="搜索当前会话的聊天记录" desc="可按关键词、消息类型、发送人与日期筛选；点击结果可定位到原消息" />}
        {active && results.map((r) => (
          <button key={r.msgId} onClick={() => open(r.msgId)} className="flex w-full items-start gap-3 bg-white px-4 py-3 text-left">
            <ImAvatar id={r.from} name={displayName(state, r.from)} size={36} />
            <div className="min-w-0 flex-1 border-b border-[#ebedf0] pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-[14px] text-[#323233]">{displayName(state, r.from)}</div>
                <div className="shrink-0 text-[11px] text-[#969799]">{r.time ?? ''}</div>
              </div>
              <div className="mt-0.5 truncate text-[13px] text-[#646566]">{r.text}</div>
              <div className="mt-0.5 text-[11px] text-[#2e71ff]">定位到原消息 ›</div>
            </div>
          </button>
        ))}
        {active && results.length === 0 && <ImEmpty title="没有匹配的聊天记录" desc="试试更换关键词或清空筛选条件" />}
      </div>
    </div>
  );
}
