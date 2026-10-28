import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, FileText, MessageCircle, Search, X } from 'lucide-react';
import {
  getFeedbackRecords,
  subscribeFeedbackRecords,
  updateFeedbackStatus,
  type FeedbackCategory,
  type FeedbackRecord,
  type FeedbackSource,
  type FeedbackStatus,
} from '../../data/feedback';

const statuses: Array<'全部' | FeedbackStatus> = ['全部', '待处理', '处理中', '已解决'];
const categories: Array<'全部' | FeedbackCategory> = ['全部', '功能异常', '使用咨询', '体验建议', '其他'];
const sources: Array<'全部' | FeedbackSource> = ['全部', '页面提交', '消息页如意助手', '如意空间'];
const statusStyle: Record<FeedbackStatus, string> = {
  '待处理': 'bg-amber-50 text-amber-700',
  '处理中': 'bg-blue-50 text-blue-700',
  '已解决': 'bg-emerald-50 text-emerald-700',
};

const buildClientPageHref = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path}`;

export default function FeedbackManagement() {
  const [records, setRecords] = useState(() => getFeedbackRecords());
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<(typeof statuses)[number]>('全部');
  const [category, setCategory] = useState<(typeof categories)[number]>('全部');
  const [source, setSource] = useState<(typeof sources)[number]>('全部');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [showResolve, setShowResolve] = useState(false);

  useEffect(() => subscribeFeedbackRecords(() => setRecords(getFeedbackRecords())), []);
  const selected = records.find(record => record.id === selectedId) || null;
  const filtered = useMemo(() => records.filter(record => {
    const query = keyword.trim().toLowerCase();
    const matchKeyword = !query || [record.feedbackNo, record.userName, record.departmentName, record.content, record.featureEntry || ''].some(value => value.toLowerCase().includes(query));
    return matchKeyword && (status === '全部' || record.status === status) && (category === '全部' || record.category === category) && (source === '全部' || record.source === source);
  }), [category, keyword, records, source, status]);

  const refresh = () => setRecords(getFeedbackRecords());
  const accept = (record: FeedbackRecord) => {
    updateFeedbackStatus(record.id, '处理中');
    refresh();
  };
  const contact = (record: FeedbackRecord) => {
    const state = {
      feedbackContact: {
        requestId: `feedback-contact-${Date.now()}`,
        userName: record.userName,
        draft: `关于反馈 ${record.feedbackNo}：`,
      },
    };
    window.localStorage.setItem('ijx-feedback-contact-draft', JSON.stringify(state.feedbackContact));
    window.open(`${import.meta.env.BASE_URL}web_client`, '_blank', 'noopener,noreferrer');
    if (record.status === '待处理') accept(record);
  };
  const resolve = () => {
    if (!selected) return;
    updateFeedbackStatus(selected.id, '已解决', resolution);
    setResolution('');
    setShowResolve(false);
    refresh();
  };

  return (
    <div className="min-w-0 bg-white" data-requirement-id="custom-20261028-003">
      <div className="border-b border-gray-100 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">帮助与反馈</h1>
        <p className="mt-1 text-sm text-gray-500">查看用户反馈并跟踪处理状态</p>
      </div>
      <div className="grid grid-cols-4 gap-4 border-b border-gray-100 px-6 py-5">
        <label className="relative col-span-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="反馈编号、内容或用户" className="h-9 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-[#2f75b5]" />
        </label>
        <FilterSelect value={status} onChange={value => setStatus(value as (typeof statuses)[number])} options={statuses} />
        <FilterSelect value={category} onChange={value => setCategory(value as (typeof categories)[number])} options={categories} />
        <FilterSelect value={source} onChange={value => setSource(value as (typeof sources)[number])} options={sources} />
      </div>
      <div className="overflow-x-auto px-6 py-5">
        <table className="w-full min-w-[1060px] border-collapse text-sm">
          <thead><tr className="bg-gray-50 text-left text-gray-600"><Th>反馈编号</Th><Th>用户 / 部门</Th><Th>类型</Th><Th>反馈内容</Th><Th>来源</Th><Th>提交时间</Th><Th>状态</Th><Th>处理人</Th><Th>操作</Th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(record => (
              <tr key={record.id} className="hover:bg-gray-50/70">
                <Td><span className="font-medium text-gray-700">{record.feedbackNo}</span></Td>
                <Td><div className="font-medium text-gray-800">{record.userName}</div><div className="mt-0.5 max-w-[180px] truncate text-xs text-gray-400">{record.departmentName}</div></Td>
                <Td>{record.category}</Td>
                <Td><div className="max-w-[260px] truncate text-gray-700">{record.content}</div></Td>
                <Td>{record.source}</Td><Td>{record.createdAt}</Td>
                <Td><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyle[record.status]}`}>{record.status}</span></Td>
                <Td>{record.handlerName || '-'}</Td>
                <Td><button onClick={() => setSelectedId(record.id)} className="text-[#2f75b5] hover:underline">查看</button></Td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5 flex items-center justify-end gap-2 text-sm text-gray-500"><span>共 {filtered.length} 条</span><button className="rounded border border-gray-200 p-1.5 text-gray-300"><ChevronLeft size={16} /></button><button className="rounded border border-[#2f75b5] px-3 py-1.5 text-[#2f75b5]">1</button><button className="rounded border border-gray-200 p-1.5 text-gray-300"><ChevronRight size={16} /></button></div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[90] flex justify-end bg-black/30" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedId(null); }}>
          <aside className="flex h-full w-[620px] flex-col bg-white shadow-2xl">
            <div className="flex items-start border-b border-gray-100 px-6 py-5"><div><div className="text-xs text-gray-400">{selected.feedbackNo}</div><h2 className="mt-1 text-lg font-semibold text-gray-900">反馈详情</h2></div><button onClick={() => setSelectedId(null)} className="ml-auto rounded p-1.5 text-gray-400 hover:bg-gray-100"><X size={19} /></button></div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-gray-100 pb-5 text-sm">
                <Info label="用户" value={selected.userName} />
                <Info label="部门" value={selected.departmentName} />
                <Info label="反馈类型" value={selected.category} />
                <Info label="提交来源" value={selected.source} />
                <Info label="提交时间" value={selected.createdAt} />
                <Info label="页面环境" value={`${selected.clientType} / ${selected.browserInfo}`} />
                <Info
                  label="相关页面"
                  value={selected.sourcePagePath ? (
                    <a href={buildClientPageHref(selected.sourcePagePath)} target="_blank" rel="noreferrer" className="text-[#2f75b5] hover:underline">
                      <span className="block">{selected.sourcePageTitle || '相关页面'}</span>
                      <span className="block max-w-[250px] truncate text-xs text-gray-400">{selected.sourcePagePath}</span>
                    </a>
                  ) : '未记录'}
                />
                <Info label="功能入口" value={selected.featureEntry ? <span className="block max-w-[250px] break-words">{selected.featureEntry}</span> : '未填写'} />
              </div>
              <section className="py-5"><h3 className="text-sm font-semibold text-gray-900">反馈内容</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{selected.content}</p>{selected.attachments.length > 0 && <div className="mt-4 space-y-2">{selected.attachments.map(item => <div key={item.id} className="flex items-center gap-2 rounded border border-gray-200 px-3 py-2 text-sm text-gray-600"><FileText size={15} />{item.name}<span className="ml-auto text-xs text-gray-400">{item.size}</span></div>)}</div>}</section>
              <section className="border-t border-gray-100 py-5"><h3 className="text-sm font-semibold text-gray-900">处理记录</h3><div className="mt-4 space-y-4">{selected.timeline.map(item => <div key={item.id} className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2f75b5]" /><div><div className="text-sm text-gray-700">{item.title}</div>{item.description && <p className="mt-1 text-sm text-gray-500">{item.description}</p>}<div className="mt-1 text-xs text-gray-400">{item.operator} · {item.createdAt}</div></div></div>)}</div></section>
              {selected.resolution && <div className="border-l-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{selected.resolution}</div>}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button onClick={() => contact(selected)} className="inline-flex items-center gap-1.5 rounded border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><MessageCircle size={15} /> 联系用户</button>
              {selected.status === '待处理' && <button onClick={() => accept(selected)} className="rounded bg-[#2f75b5] px-4 py-2 text-sm font-medium text-white hover:bg-[#286ca0]">受理</button>}
              {selected.status !== '已解决' && <button onClick={() => setShowResolve(true)} className="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"><CheckCircle2 size={15} /> 标记已解决</button>}
            </div>
          </aside>
        </div>
      )}

      {selected && showResolve && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl"><h3 className="font-semibold text-gray-900">标记已解决</h3><p className="mt-1 text-sm text-gray-500">处理说明可选，填写后会同步给用户。</p><textarea value={resolution} onChange={event => setResolution(event.target.value)} rows={4} placeholder="填写处理结果" className="mt-4 w-full resize-none rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2f75b5]" /><div className="mt-4 flex justify-end gap-2"><button onClick={() => setShowResolve(false)} className="rounded border border-gray-200 px-4 py-2 text-sm text-gray-600">取消</button><button onClick={resolve} className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white">确认解决</button></div></div>
        </div>
      )}
    </div>
  );
}

function FilterSelect<T extends string>({ value, onChange, options }: { value: T; onChange: (value: T) => void; options: readonly T[] }) {
  return <select value={value} onChange={event => onChange(event.target.value as T)} className="h-9 rounded border border-gray-200 bg-white px-3 text-sm text-gray-600 outline-none focus:border-[#2f75b5]">{options.map(option => <option key={option}>{option}</option>)}</select>;
}
function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-3 py-3 font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="whitespace-nowrap px-3 py-3 text-gray-600">{children}</td>; }
function Info({ label, value }: { label: string; value: React.ReactNode }) { return <div><div className="text-xs text-gray-400">{label}</div><div className="mt-1 text-gray-700">{value}</div></div>; }
