import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MoreHorizontal, AtSign, Megaphone, X, Phone, PhoneOff, Check } from 'lucide-react';
import { useImStore, imSnapshot } from '@/store/imStore';
import { displayName, getSession, latestMention, sessionTitle, sessionMessages } from '@/store/imSelectors';
import { ImAvatar, ImPageHeader, ImSheet, ImToast, ImEmpty, ImPrimaryButton } from './imComponents';
import { useImSnapshot, useToast } from './imHooks';
import { MessageBubble, MergeDetail, PinnedMessageBar, ReceiptPanel, type BubbleOpen } from './messageParts';
import { ForwardPicker, MessageActionSheet, TopicCreator } from './actionParts';
import Composer from './Composer';
import { ServiceInboxView } from './extraPages';
import type { Message } from '@/data/im/types';

export default function SessionChat() {
  const { sessionId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const session = getSession(state, sessionId);
  const list = sessionMessages(state, sessionId);

  const [quote, setQuote] = useState<Message | null>(null);
  const [editing, setEditing] = useState<Message | null>(null);
  const [sheetMsg, setSheetMsg] = useState<Message | null>(null);
  const [forwardIds, setForwardIds] = useState<string[]>([]);
  const [forwardOpen, setForwardOpen] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [receiptMsg, setReceiptMsg] = useState<Message | null>(null);
  const [mergeMsg, setMergeMsg] = useState<Message | null>(null);
  const [topicSource, setTopicSource] = useState<Message | null>(null);
  const [mentionBarHidden, setMentionBarHidden] = useState(false);
  const [highlightId, setHighlightId] = useState('');
  const [callOpen, setCallOpen] = useState(false);
  const [callMode, setCallMode] = useState<'voice' | 'video'>('voice');
  const [callStatus, setCallStatus] = useState<'calling' | 'active' | 'ended'>('calling');
  const mentionRef = useRef<Message | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const jumpId = searchParams.get('messageId');

  // 进入会话：记录待查看 @，随后清未读（@筛选立即消失，但聊天页仍可查看提醒）
  useEffect(() => {
    const snap = imSnapshot();
    const target = getSession(snap, sessionId);
    if (target?.unread) {
      const mention = latestMention(snap, target);
      if (mention) mentionRef.current = mention;
    }
    useImStore.getState().markRead(sessionId);
    setMentionBarHidden(false);
    setMultiSelect(false);
    setSelectedIds([]);
  }, [sessionId]);

  // 搜索/历史结果精确定位 + 短暂高亮
  useEffect(() => {
    if (!jumpId) return;
    let tries = 0;
    const locate = () => {
      const el = document.getElementById(`msg-${jumpId}`);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        setHighlightId(jumpId);
        window.setTimeout(() => setHighlightId(''), 2200);
      } else if (tries++ < 8) {
        window.setTimeout(locate, 80);
      }
    };
    locate();
    return () => setHighlightId('');
  }, [jumpId, sessionId, list.length]);

  // 普通进入时滚到底部（不覆盖精确定位）
  useEffect(() => {
    if (jumpId) return;
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [sessionId, list.length, jumpId]);

  if (!session) {
    return (
      <div className="flex h-full flex-col bg-[#f7f8fa]">
        <ImPageHeader title="会话不存在" />
        <ImEmpty title="会话不存在或已被删除" desc="返回消息列表查看其他会话" action={<button onClick={() => navigate('/app/messages')} className="text-[13px] text-[#2e71ff]">返回消息列表</button>} />
      </div>
    );
  }

  const title = sessionTitle(state, session);
  const isGroup = session.type === 'group';
  const group = isGroup ? state.groups.find((g) => g.id === session.targetId) : undefined;
  const app = session.type === 'im-app' ? state.imApps.find((a) => a.id === session.targetId) : undefined;
  const icon = session.type === 'im-app' ? app?.icon : session.type === 'service-ticket' ? '🎧' : '';

  if (session.type === 'service-inbox') {
    return <ServiceInboxView accountId={session.targetId} />;
  }

  const jumpTo = (msgId: string) => {
    navigate(`/app/messages/session/${sessionId}?messageId=${encodeURIComponent(msgId)}`, { replace: true });
    setMentionBarHidden(true);
    const el = document.getElementById(`msg-${msgId}`);
    if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); setHighlightId(msgId); window.setTimeout(() => setHighlightId(''), 2200); }
  };

  const onOpen = (target: BubbleOpen) => {
    switch (target.kind) {
      case 'merge': setMergeMsg(target.msg); break;
      case 'topic': navigate(`/app/messages/topic/${target.topicId}`); break;
      case 'contact': navigate(`/app/messages/contacts/${target.contactId}`); break;
      case 'receipt': setReceiptMsg(target.msg); break;
      case 'article': showToast('演示图文：office.example.com/article'); break;
      case 'file': showToast(`演示下载：${target.name}`); break;
      case 'media': showToast(`预览${target.label}（演示）`); break;
    }
  };

  const toggleSelect = (id: string) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const finishCall = (result: Message['result']) => {
    const duration = result === 'ended' ? 42 : 0;
    useImStore.getState().appendCallRecord(sessionId, callMode, result, duration);
    setCallOpen(false);
    showToast(result === 'ended' ? '通话结束，已生成通话记录' : '通话已取消');
  };

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader
        title={multiSelect ? `已选 ${selectedIds.length} 条` : title}
        right={multiSelect
          ? <button onClick={() => { setMultiSelect(false); setSelectedIds([]); }} className="text-[13px] text-[#646566]">取消</button>
          : <button onClick={() => navigate(isGroup ? `/app/messages/group/${session.targetId}` : `/app/messages/session-info/${sessionId}`)} className="grid h-9 w-9 place-items-center rounded-full text-[#323233]" aria-label="会话信息"><MoreHorizontal size={20} /></button>}
      />

      {/* 群公告 */}
      {isGroup && group?.notice && !multiSelect && (
        <button onClick={() => navigate(`/app/messages/group/${group.id}/notice`)} className="flex w-full items-center gap-2 border-b border-[#ebedf0] bg-[#fffbe8] px-3 py-1.5 text-left">
          <Megaphone size={13} className="shrink-0 text-[#f5bc0e]" />
          <span className="min-w-0 flex-1 truncate text-[12px] text-[#646566]">群公告：{group.notice}</span>
        </button>
      )}

      {/* 待查看 @ 提醒 */}
      {isGroup && mentionRef.current && !mentionBarHidden && !multiSelect && (
        <div className="flex w-full items-center gap-2 border-b border-[#ebedf0] bg-white px-3 py-2">
          <AtSign size={14} className="shrink-0 text-[#f53a71]" />
          <button onClick={() => jumpTo(mentionRef.current?.id ?? '')} className="min-w-0 flex-1 truncate text-left text-[12px] text-[#323233]">
            {mentionRef.current.mentionAll ? '有人 @了所有人' : `${displayName(state, mentionRef.current.from)} @了你`} · 查看
          </button>
          <button onClick={() => setMentionBarHidden(true)} className="shrink-0 text-[#969799]" aria-label="关闭提醒"><X size={14} /></button>
        </div>
      )}

      {!multiSelect && <PinnedMessageBar state={state} sessionId={sessionId} onOpenList={() => navigate(`/app/messages/pins/${sessionId}`)} onJump={jumpTo} />}

      {/* 消息流 */}
      <div ref={scrollerRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {list.map((msg) => (
          <div key={msg.id} className="relative">
            {multiSelect && (
              <button
                onClick={() => toggleSelect(msg.id)}
                className={`absolute -left-1 top-3 z-10 grid h-5 w-5 place-items-center rounded-full border ${selectedIds.includes(msg.id) ? 'border-[#f53a71] bg-[#f53a71] text-white' : 'border-[#c8c9cc] bg-white'}`}
                aria-label="选择消息"
              >
                {selectedIds.includes(msg.id) && <Check size={12} />}
              </button>
            )}
            <div className={multiSelect ? 'pl-5' : ''}>
              <MessageBubble
                msg={msg}
                mine={msg.from === 'me'}
                isGroup={isGroup}
                state={state}
                sessionId={sessionId}
                highlighted={highlightId === msg.id}
                onMenu={setSheetMsg}
                onReedit={(m) => { setEditing(m); useImStore.getState().setDraft(sessionId, m.text ?? ''); showToast('已放入输入框，可重新编辑'); }}
                onOpen={onOpen}
                onToast={showToast}
              />
            </div>
          </div>
        ))}
        {list.length === 0 && <ImEmpty title="暂无消息" desc="发送一条消息开始聊天" />}
      </div>

      {/* 应用消息菜单 */}
      {app && !multiSelect && (
        <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-[#ebedf0] bg-white px-3 py-2">
          {app.menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => {
                if (menu.children?.length) { showToast(`${menu.label}：${menu.children[0].text}`); return; }
                if (menu.type === 'link') { showToast(`演示链接：${menu.url ?? ''}`); return; }
                useImStore.getState().simulateIncoming(sessionId, { from: app.id, type: 'text', text: menu.text ?? menu.label });
                useImStore.getState().markRead(sessionId);
                showToast('已收到应用回复');
              }}
              className="shrink-0 rounded-full border border-[#ebedf0] px-3 py-1.5 text-[13px] text-[#323233]"
            >
              {menu.label}
            </button>
          ))}
        </div>
      )}

      {/* 输入区 / 多选转发条 */}
      {multiSelect ? (
        <div className="shrink-0 border-t border-[#ebedf0] bg-white p-3">
          <ImPrimaryButton onClick={() => { if (selectedIds.length) { setForwardIds(selectedIds); setForwardOpen(true); } else showToast('请先选择消息'); }} disabled={!selectedIds.length}>
            转发 {selectedIds.length || ''} 条消息
          </ImPrimaryButton>
        </div>
      ) : (
        <Composer
          sessionId={sessionId}
          session={session}
          state={state}
          quote={quote}
          editing={editing}
          onClearQuote={() => setQuote(null)}
          onClearEditing={() => setEditing(null)}
          onToast={showToast}
          onCall={() => { setCallOpen(true); setCallStatus('calling'); setCallMode(isGroup ? 'video' : 'voice'); }}
          onSent={() => { const el = scrollerRef.current; if (el) window.setTimeout(() => { el.scrollTop = el.scrollHeight; }, 30); }}
        />
      )}

      {/* 动作与弹层 */}
      <MessageActionSheet
        open={!!sheetMsg}
        onClose={() => setSheetMsg(null)}
        msg={sheetMsg}
        state={state}
        sessionId={sessionId}
        isGroup={isGroup}
        onQuote={setQuote}
        onReedit={(m) => { setEditing(m); useImStore.getState().setDraft(sessionId, m.text ?? ''); }}
        onForward={(m) => { setForwardIds([m.id]); setForwardOpen(true); }}
        onMultiForward={() => setMultiSelect(true)}
        onTopic={setTopicSource}
        onReceipt={setReceiptMsg}
        onToast={showToast}
      />
      <ForwardPicker open={forwardOpen} onClose={() => setForwardOpen(false)} state={state} fromSessionId={sessionId} msgIds={forwardIds} onDone={(mode) => { showToast(mode === 'merge' ? '已合并转发' : '已逐条转发'); setMultiSelect(false); setSelectedIds([]); }} />
      <ReceiptPanel open={!!receiptMsg} onClose={() => setReceiptMsg(null)} state={state} sessionId={sessionId} msg={receiptMsg} />
      <MergeDetail open={!!mergeMsg} onClose={() => setMergeMsg(null)} msg={mergeMsg} state={state} onToast={showToast} />
      <TopicCreator
        open={!!topicSource}
        onClose={() => setTopicSource(null)}
        defaultTitle={(topicSource?.text ?? '新话题').slice(0, 30)}
        onSubmit={(name) => {
          const id = useImStore.getState().createTopic(sessionId, topicSource?.id ?? '', name);
          setTopicSource(null);
          if (id) navigate(`/app/messages/topic/${id}`);
          else showToast('该消息无法创建话题');
        }}
      />

      {/* 通话 Mock：真实媒体流延期，但入口有明确演示状态 */}
      <ImSheet open={callOpen} onClose={() => { setCallOpen(false); finishCall('canceled'); }} title={callMode === 'video' ? '视频通话（演示）' : '语音通话（演示）'}>
        <div className="flex flex-col items-center gap-3 p-6">
          <ImAvatar id={session.targetId} name={title} size={72} isGroup={isGroup} icon={icon || undefined} />
          <div className="text-[15px] text-[#323233]">{title}</div>
          <div className="text-[12px] text-[#969799]">{callStatus === 'calling' ? '正在呼叫…' : callStatus === 'active' ? '通话中 00:42' : '通话已结束'}</div>
          <div className="mt-2 grid w-full grid-cols-2 gap-3">
            <button onClick={() => setCallStatus('active')} className="flex items-center justify-center gap-2 rounded-xl bg-[#67c23a] py-2.5 text-[14px] text-white"><Phone size={16} /> 模拟接听</button>
            <button onClick={() => finishCall(callStatus === 'active' ? 'ended' : 'canceled')} className="flex items-center justify-center gap-2 rounded-xl bg-[#f35f5f] py-2.5 text-[14px] text-white"><PhoneOff size={16} /> 挂断</button>
          </div>
          <div className="text-[11px] text-[#c8c9cc]">演示环境不接入真实摄像头与麦克风，结束后生成通话记录消息</div>
        </div>
      </ImSheet>

      <ImToast text={toast} />
    </div>
  );
}
