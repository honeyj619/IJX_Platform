import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MoreHorizontal, ScanLine, Image as ImageIcon, Users, Pin, PinOff, Trash2, Send, ChevronRight, Check, X } from 'lucide-react';
import { useImStore } from '@/store/imStore';
import { displayName, getSession, groupReceipt, pinnedMessages, sessionTitle, ticketsOf } from '@/store/imSelectors';
import { messagePreview } from '@/data/im/utils';
import { ImAvatar, ImCard, ImConfirm, ImEmpty, ImPageHeader, ImPrimaryButton, ImRow, ImSearchBar, ImSheet, ImToast } from './imComponents';
import { useImSnapshot, useToast } from './imHooks';

/* ------------------------------ 员工服务收件箱 ------------------------------ */

export function ServiceInboxView({ accountId }: { accountId: string }) {
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [query, setQuery] = useState('');
  const account = state.serviceAccounts.find((a) => a.id === accountId);
  const tickets = ticketsOf(state, accountId).filter((t) =>
    [t.fromName, t.subject, t.lastText].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  if (!account) return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="员工服务" /><ImEmpty title="服务号不存在" /></div>;

  const openTicket = (ticketId: string) => {
    const sid = useImStore.getState().openServiceTicket(accountId, ticketId);
    navigate(`/app/messages/session/${sid}`);
  };

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader
        title={`员工服务-${account.name}`}
        right={<button onClick={() => showToast('演示环境未接入真实服务后端')} className="grid h-9 w-9 place-items-center text-[#323233]"><MoreHorizontal size={20} /></button>}
      />
      <div className="shrink-0 bg-white p-3"><ImSearchBar value={query} onChange={setQuery} placeholder="搜索服务咨询" /></div>
      <ImCard className="flex items-center gap-3 p-4">
        <ImAvatar name={account.name} size={44} icon={account.icon} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium text-[#323233]">{account.name}</div>
          <div className="truncate text-[12px] text-[#969799]">{account.desc}</div>
        </div>
      </ImCard>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-4 pb-1 pt-3 text-[12px] text-[#969799]">服务咨询 · {tickets.length}</div>
        <div className="bg-white">
          {tickets.map((t) => (
            <button key={t.id} onClick={() => openTicket(t.id)} className="flex w-full items-start gap-3 border-b border-[#f2f3f5] px-4 py-3 text-left">
              <ImAvatar name={t.fromName} size={40} icon="🎧" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-medium text-[#323233]">{t.fromName}</span>
                  <span className="shrink-0 text-[11px] text-[#969799]">{t.lastTime}</span>
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-[#969799]">{t.subject}</span>
                <span className="mt-0.5 block truncate text-[13px] text-[#646566]">{t.lastText}</span>
              </span>
              {t.unread > 0 && <span className="mt-1 grid h-4 min-w-[16px] shrink-0 place-items-center rounded-full bg-[#f53a71] px-1 text-[10px] text-white">{t.unread}</span>}
            </button>
          ))}
          {tickets.length === 0 && <ImEmpty title="暂无服务咨询" />}
        </div>
        <div className="px-5 py-4 text-center text-[11px] text-[#c8c9cc]">咨询子会话不会出现在消息列表；演示环境未接入真实服务工单系统</div>
      </div>
      <ImToast text={toast} />
    </div>
  );
}

export function ServiceInboxPage() {
  const { accountId = '' } = useParams();
  return <ServiceInboxView accountId={accountId} />;
}

/* ------------------------------ 扫一扫（Mock） ------------------------------ */

export function ScanPage() {
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [result, setResult] = useState<null | { kind: 'group' | 'contact' | 'link'; title: string; desc: string }>(null);
  const scan = () => setResult({ kind: 'contact', title: state.contacts.find((c) => c.id === 'jy-p5')?.name ?? '同事', desc: '识别到个人名片，可查看资料或发起聊天' });
  const groupScan = () => setResult({ kind: 'group', title: '前端组项目群', desc: '识别到群二维码，可进入群聊' });
  const linkScan = () => setResult({ kind: 'link', title: 'office.example.com', desc: '识别到网页链接，演示环境不跳转站外' });
  const openResult = () => {
    if (!result) return;
    if (result.kind === 'group') {
      const g = state.groups.find((x) => x.name === result.title);
      const s = state.sessions.find((x) => x.type === 'group' && x.targetId === g?.id);
      if (s) navigate(`/app/messages/session/${s.id}`);
      else showToast('未找到对应群聊');
    } else if (result.kind === 'contact') {
      const c = state.contacts.find((x) => x.name === result.title);
      if (c) navigate(`/app/messages/contacts/${c.id}`);
    } else showToast('演示链接，不跳转站外');
    setResult(null);
  };

  return (
    <div className="flex h-full flex-col bg-[#323233]">
      <div className="flex h-12 shrink-0 items-center justify-between px-2 text-white">
        <button onClick={() => navigate(-1)} className="grid h-9 w-9 place-items-center" aria-label="返回"><X size={22} /></button>
        <div className="text-[16px] font-medium">扫一扫</div>
        <div className="w-9" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8">
        <div className="relative grid h-56 w-56 place-items-center rounded-2xl border-2 border-white/70">
          <ScanLine size={44} className="text-white/60" />
          <span className="absolute left-0 top-0 h-6 w-6 rounded-tl-2xl border-l-4 border-t-4 border-[#f53a71]" />
          <span className="absolute right-0 top-0 h-6 w-6 rounded-tr-2xl border-r-4 border-t-4 border-[#f53a71]" />
          <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-2xl border-b-4 border-l-4 border-[#f53a71]" />
          <span className="absolute bottom-0 right-0 h-6 w-6 rounded-br-2xl border-b-4 border-r-4 border-[#f53a71]" />
        </div>
        <div className="mt-6 text-center text-[13px] leading-5 text-white/70">将二维码放入框内，即可自动扫描<br />演示环境使用模拟结果，不调用真实摄像头</div>
        {result && (
          <button onClick={openResult} className="mt-5 w-full max-w-[300px] rounded-2xl bg-white p-4 text-left">
            <div className="text-[14px] font-medium text-[#323233]">{result.title}</div>
            <div className="mt-1 text-[12px] text-[#969799]">{result.desc}</div>
            <div className="mt-2 flex items-center gap-1 text-[12px] text-[#2e71ff]">点击打开 <ChevronRight size={13} /></div>
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center justify-center gap-8 bg-black/30 py-5 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <button onClick={scan} className="flex flex-col items-center gap-1.5 text-white/80"><ScanLine size={22} /><span className="text-[12px]">模拟扫码</span></button>
        <button onClick={groupScan} className="flex flex-col items-center gap-1.5 text-white/80"><Users size={22} /><span className="text-[12px]">群二维码</span></button>
        <button onClick={linkScan} className="flex flex-col items-center gap-1.5 text-white/80"><ImageIcon size={22} /><span className="text-[12px]">网页链接</span></button>
        <button onClick={() => navigate('/app/messages/groups/create')} className="flex flex-col items-center gap-1.5 text-white/80"><Pin size={22} /><span className="text-[12px]">建群</span></button>
      </div>
      <ImToast text={toast} />
    </div>
  );
}

/* ------------------------------ 置顶消息列表 ------------------------------ */

export function PinnedListPage() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [confirmAll, setConfirmAll] = useState(false);
  const session = getSession(state, sessionId);
  const pins = pinnedMessages(state, sessionId);
  if (!session) return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="置顶消息" /><ImEmpty title="会话不存在" /></div>;

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title={`置顶消息（${pins.length}）`} right={pins.length ? <button onClick={() => setConfirmAll(true)} className="text-[12px] text-[#f53a71]">全部取消</button> : undefined} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="bg-white">
          {pins.map(({ msg, pinnedAt }) => (
            <div key={msg.id} className="flex items-start gap-3 border-b border-[#f2f3f5] px-4 py-3">
              <ImAvatar id={msg.from} name={displayName(state, msg.from)} size={36} />
              <button onClick={() => navigate(`/app/messages/session/${sessionId}?messageId=${encodeURIComponent(msg.id)}`)} className="min-w-0 flex-1 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] text-[#323233]">{displayName(state, msg.from)}</span>
                  <span className="shrink-0 text-[11px] text-[#969799]">{new Date(pinnedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="mt-0.5 truncate text-[13px] text-[#646566]">{messagePreview(msg)}</div>
                <div className="mt-0.5 text-[11px] text-[#2e71ff]">定位到原消息 ›</div>
              </button>
              <button onClick={() => { useImStore.getState().unpinMessage(sessionId, msg.id); showToast('已取消置顶'); }} className="shrink-0 p-1 text-[#969799]"><PinOff size={16} /></button>
            </div>
          ))}
        </div>
        {pins.length === 0 && <ImEmpty title="暂无置顶消息" desc="在聊天页长按消息可将其置顶" />}
      </div>
      <ImConfirm open={confirmAll} title="取消全部置顶" desc="将移除本会话所有置顶消息，不影响原始消息。" onCancel={() => setConfirmAll(false)} onConfirm={() => { useImStore.getState().unpinAll(sessionId); setConfirmAll(false); showToast('已全部取消'); }} />
      <ImToast text={toast} />
    </div>
  );
}

/* ------------------------------ 话题 ------------------------------ */

export function TopicPage() {
  const { topicId = '' } = useParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [draft, setDraft] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const topic = state.topics[topicId];
  if (!topic) return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="话题" /><ImEmpty title="话题不存在或已解散" /></div>;
  const source = (state.messages[topic.sessionId] ?? []).find((m) => m.id === topic.sourceMsgId);
  const joined = topic.members.includes('me');
  const group = state.groups.find((g) => g.id === topic.groupId);

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title={topic.title} right={<button onClick={() => setMoreOpen(true)} className="grid h-9 w-9 place-items-center text-[#323233]"><MoreHorizontal size={20} /></button>} />
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <div className="rounded-2xl bg-white p-3">
          <div className="text-[11px] text-[#969799]">话题源消息 · {getSession(state, topic.sessionId) ? sessionTitle(state, getSession(state, topic.sessionId) as NonNullable<ReturnType<typeof getSession>>) : ''}</div>
          <div className="mt-1 text-[13px] text-[#646566]">{source ? messagePreview(source) : '源消息已删除'}</div>
        </div>
        <div className="mt-3 flex items-center justify-between px-1 text-[12px] text-[#969799]">
          <span>{topic.replies.length} 条回复 · {topic.members.length} 位成员</span>
          <button onClick={() => setMembersOpen(true)} className="text-[#2e71ff]">查看成员 ›</button>
        </div>
        <div className="mt-2 space-y-2">
          {topic.replies.map((r) => (
            <div key={r.id} className="flex gap-2 rounded-2xl bg-white p-3">
              <ImAvatar id={r.from} name={displayName(state, r.from)} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 text-[11px] text-[#969799]"><span>{displayName(state, r.from)}</span><span>{r.time}</span></div>
                <div className="mt-1 break-words text-[14px] text-[#323233]">{r.text}</div>
              </div>
            </div>
          ))}
          {topic.replies.length === 0 && <ImEmpty title="还没有回复" desc="在下方输入内容参与话题" />}
        </div>
      </div>
      <div className="shrink-0 border-t border-[#ebedf0] bg-white p-3">
        {joined ? (
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) { useImStore.getState().replyTopic(topicId, draft.trim()); setDraft(''); } }} placeholder="回复话题" className="h-9 min-w-0 flex-1 rounded-full bg-[#f2f3f5] px-4 text-[14px] outline-none" />
            <button onClick={() => { if (draft.trim()) { useImStore.getState().replyTopic(topicId, draft.trim()); setDraft(''); } }} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f53a71] text-white"><Send size={16} /></button>
          </div>
        ) : (
          <ImPrimaryButton onClick={() => showToast('你已离开该话题，无法回复')} disabled>已离开话题</ImPrimaryButton>
        )}
      </div>

      <ImSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="话题设置">
        <div className="p-3">
          <ImRow label="编辑话题标题" onClick={() => { setTitleDraft(topic.title); setEditOpen(true); setMoreOpen(false); }} />
          <ImRow label="添加成员" onClick={() => { setMembersOpen(true); setMoreOpen(false); }} />
          <ImRow label="离开话题" danger onClick={() => { useImStore.getState().leaveTopic(topicId); setMoreOpen(false); showToast('已离开话题'); }} />
          {topic.creator === 'me' && <ImRow icon={<Trash2 size={17} />} label="解散话题" danger onClick={() => { useImStore.getState().destroyTopic(topicId); setMoreOpen(false); showToast('话题已解散'); navigate('/app/messages'); }} />}
        </div>
      </ImSheet>

      <ImSheet open={membersOpen} onClose={() => setMembersOpen(false)} title="话题成员">
        <div className="max-h-[55vh] overflow-y-auto p-4">
          {topic.members.map((id) => (
            <div key={id} className="flex items-center gap-3 border-b border-[#f2f3f5] py-2">
              <ImAvatar id={id} name={displayName(state, id)} size={34} />
              <span className="min-w-0 flex-1 truncate text-[14px] text-[#323233]">{displayName(state, id)}</span>
              {topic.creator === id && <span className="text-[11px] text-[#f5bc0e]">创建者</span>}
            </div>
          ))}
          {group && group.members.filter((id) => !topic.members.includes(id)).map((id) => (
            <button key={id} onClick={() => { useImStore.getState().addTopicMembers(topicId, [id]); showToast('已添加'); }} className="flex w-full items-center gap-3 border-b border-[#f2f3f5] py-2 text-left">
              <ImAvatar id={id} name={displayName(state, id)} size={34} />
              <span className="min-w-0 flex-1 truncate text-[14px] text-[#646566]">{displayName(state, id)}</span>
              <span className="text-[12px] text-[#2e71ff]">添加</span>
            </button>
          ))}
        </div>
      </ImSheet>

      <ImSheet open={editOpen} onClose={() => setEditOpen(false)} title="编辑话题标题">
        <div className="space-y-3 p-4">
          <input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} maxLength={30} className="h-10 w-full rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
          <ImPrimaryButton onClick={() => { useImStore.getState().updateTopicTitle(topicId, titleDraft.trim() || topic.title); setEditOpen(false); }}>保存</ImPrimaryButton>
        </div>
      </ImSheet>
      <ImToast text={toast} />
    </div>
  );
}

/* ------------------------------ 已读回执（深链接页） ------------------------------ */

export function ReceiptPage() {
  const { sessionId = '', msgId = '' } = useParams();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const session = getSession(state, sessionId);
  const msg = (state.messages[sessionId] ?? []).find((m) => m.id === msgId);
  const [tab, setTab] = useState<'unread' | 'read'>('unread');
  if (!session || !msg) return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="已读回执" /><ImEmpty title="消息不存在" /></div>;
  const receipt = groupReceipt(state, sessionId, msg);
  const ids = tab === 'unread' ? receipt.unread : receipt.read;

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="已读回执" />
      <div className="flex shrink-0 border-b border-[#ebedf0] bg-white">
        {(['unread', 'read'] as const).map((key) => (
          <button key={key} onClick={() => setTab(key)} className={`flex-1 border-b-2 py-2.5 text-[14px] ${tab === key ? 'border-[#f53a71] font-medium text-[#f53a71]' : 'border-transparent text-[#646566]'}`}>
            {key === 'unread' ? `未读 ${receipt.unread.length}` : `已读 ${receipt.read.length}`}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="bg-white px-4 py-3 text-[12px] text-[#969799]">「{messagePreview(msg)}」</div>
        <div className="bg-white">
          {ids.map((id) => (
            <div key={id} className="flex items-center gap-3 border-b border-[#f2f3f5] px-4 py-2.5">
              <ImAvatar id={id} name={displayName(state, id)} size={34} />
              <span className="min-w-0 flex-1 truncate text-[14px] text-[#323233]">{displayName(state, id)}</span>
              {tab === 'unread' && <button onClick={() => { useImStore.getState().markMessageRead(sessionId, msgId, id); showToast('已标记已读'); }} className="shrink-0 rounded-full border border-[#f53a71] px-2 py-1 text-[11px] text-[#f53a71]">标记已读</button>}
              {tab === 'read' && <Check size={16} className="shrink-0 text-[#67c23a]" />}
            </div>
          ))}
          {ids.length === 0 && <ImEmpty title="暂无成员" />}
        </div>
      </div>
      <ImToast text={toast} />
    </div>
  );
}
