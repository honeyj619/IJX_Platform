import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CircleCheck, Clock3, FileText, Link2, LogIn, MessageSquareText, Plus, X } from 'lucide-react';
import FeedbackComposer from '../components/FeedbackComposer';
import { getFeedbackRecords, subscribeFeedbackRecords, type FeedbackPageContext, type FeedbackRecord, type FeedbackStatus } from '../data/feedback';
import { consumeFeedbackPageContext } from '../utils/feedbackPageContext';

const statusStyle: Record<FeedbackStatus, string> = {
  '待处理': 'bg-amber-50 text-amber-700 ring-amber-200',
  '处理中': 'bg-blue-50 text-blue-700 ring-blue-200',
  '已解决': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export default function HelpFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { feedbackId } = useParams();
  const [records, setRecords] = useState(() => getFeedbackRecords());
  const [showComposer, setShowComposer] = useState(false);
  const [pageContext] = useState<FeedbackPageContext | null>(() => {
    const routeContext = (location.state as { feedbackPageContext?: FeedbackPageContext } | null)?.feedbackPageContext || null;
    const storedContext = consumeFeedbackPageContext();
    return routeContext || storedContext;
  });

  useEffect(() => subscribeFeedbackRecords(() => setRecords(getFeedbackRecords())), []);
  const selected = useMemo(() => records.find(record => record.id === feedbackId), [feedbackId, records]);

  if (feedbackId) {
    if (!selected) {
      return <div className="p-8 text-sm text-gray-500">未找到该反馈记录。</div>;
    }
    return <FeedbackDetail record={selected} onBack={() => navigate('/pc_client/help-feedback')} />;
  }

  return (
    <div className="min-h-full bg-gray-50 px-8 py-7">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">帮助与反馈</h1>
            <p className="mt-1 text-sm text-gray-500">查看我提交的问题和处理进度</p>
          </div>
          <button onClick={() => setShowComposer(true)} className="inline-flex items-center gap-1.5 rounded-md bg-theme-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-theme-700">
            <Plus size={17} /> 我要反馈
          </button>
        </div>

        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">我的反馈</h2>
            <span className="text-sm text-gray-400">共 {records.length} 条</span>
          </div>
          <div className="divide-y divide-gray-100">
            {records.map(record => (
              <button key={record.id} type="button" onClick={() => navigate(`/pc_client/help-feedback/${record.id}`)} className="grid w-full grid-cols-[minmax(0,1fr)_120px_150px_110px_24px] items-center gap-4 px-5 py-4 text-left hover:bg-gray-50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{record.feedbackNo}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{record.category}</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-gray-800">{record.content}</p>
                </div>
                <span className="text-sm text-gray-500">{record.source}</span>
                <span className="text-sm text-gray-500">{record.createdAt}</span>
                <span className={`justify-self-start rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusStyle[record.status]}`}>{record.status}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        </section>
      </div>

      {showComposer && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/30" onMouseDown={event => { if (event.target === event.currentTarget) setShowComposer(false); }}>
          <aside className="flex h-full w-[520px] flex-col bg-white shadow-2xl">
            <div className="flex items-center border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">我要反馈</h2>
                <p className="mt-1 text-xs text-gray-400">页面和客户端环境将自动随反馈提交</p>
              </div>
              <button onClick={() => setShowComposer(false)} className="ml-auto rounded-md p-1.5 text-gray-400 hover:bg-gray-100"><X size={19} /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <FeedbackComposer
                source="页面提交"
                pageContext={pageContext}
                onCancel={() => setShowComposer(false)}
                onSubmitted={record => navigate(`/pc_client/help-feedback/${record.id}`)}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function FeedbackDetail({ record, onBack }: { record: FeedbackRecord; onBack: () => void }) {
  return (
    <div className="min-h-full bg-gray-50 px-8 py-7">
      <div className="mx-auto max-w-5xl">
        <button onClick={onBack} className="mb-5 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={16} /> 返回我的反馈</button>
        <div className="border-b border-gray-200 bg-white px-7 py-6">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400"><span>{record.feedbackNo}</span><span>·</span><span>{record.category}</span></div>
              <h1 className="mt-2 text-xl font-semibold text-gray-900">{record.content}</h1>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${statusStyle[record.status]}`}>{record.status}</span>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-5 bg-white p-7">
          <main className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">反馈内容</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{record.content}</p>
            {record.attachments.length > 0 && <div className="mt-5 space-y-2">{record.attachments.map(item => <div key={item.id} className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600"><FileText size={15} />{item.name}<span className="ml-auto text-xs text-gray-400">{item.size}</span></div>)}</div>}
            {record.resolution && <div className="mt-7 border-l-2 border-emerald-500 bg-emerald-50 px-4 py-3"><div className="text-sm font-semibold text-emerald-800">处理结果</div><p className="mt-1 text-sm leading-6 text-emerald-700">{record.resolution}</p></div>}
            <h2 className="mt-8 text-sm font-semibold text-gray-900">处理记录</h2>
            <div className="mt-4 space-y-0">
              {record.timeline.map((item, index) => (
                <div key={item.id} className="relative flex gap-3 pb-5">
                  {index < record.timeline.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-gray-200" />}
                  <span className={`relative mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-white ${index === record.timeline.length - 1 ? 'bg-theme-500' : 'bg-gray-300'}`} />
                  <div><div className="text-sm font-medium text-gray-800">{item.title}</div>{item.description && <p className="mt-1 text-sm text-gray-500">{item.description}</p>}<div className="mt-1 text-xs text-gray-400">{item.operator} · {item.createdAt}</div></div>
                </div>
              ))}
            </div>
          </main>
          <aside className="border-l border-gray-100 pl-6 text-sm">
            <InfoRow icon={<Clock3 size={15} />} label="提交时间" value={record.createdAt} />
            <InfoRow icon={<MessageSquareText size={15} />} label="提交来源" value={record.source} />
            <InfoRow icon={<Link2 size={15} />} label="相关页面" value={record.sourcePageTitle ? `${record.sourcePageTitle}\n${record.sourcePagePath || ''}` : '未记录'} />
            <InfoRow icon={<LogIn size={15} />} label="功能入口" value={record.featureEntry || '未填写'} />
            <InfoRow icon={<CircleCheck size={15} />} label="最后更新" value={record.updatedAt} />
            <InfoRow icon={<FileText size={15} />} label="页面环境" value={`${record.clientType}\n${record.browserInfo}`} />
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="mb-5 flex items-start gap-3"><span className="mt-0.5 text-gray-400">{icon}</span><div><div className="text-xs text-gray-400">{label}</div><div className="mt-1 whitespace-pre-line leading-6 text-gray-700">{value}</div></div></div>;
}
