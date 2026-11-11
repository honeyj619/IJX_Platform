import { useRef, useState } from 'react';
import { Play, FileText, ExternalLink, Eye, Pin, Check, ChevronRight, Radio } from 'lucide-react';
import { useImStore } from '@/store/imStore';
import { displayName, groupReceipt, pinnedMessages } from '@/store/imSelectors';
import { messagePreview } from '@/data/im/utils';
import { ImAvatar, ImSheet } from './imComponents';
import { REACTION_EMOJIS } from './constants';
import type { ImSnapshot } from '@/store/imSelectors';
import type { Message } from '@/data/im/types';

export type BubbleOpen =
  | { kind: 'merge'; msg: Message }
  | { kind: 'topic'; topicId: string }
  | { kind: 'contact'; contactId: string }
  | { kind: 'article'; url?: string }
  | { kind: 'file'; name: string }
  | { kind: 'receipt'; msg: Message }
  | { kind: 'media'; label: string };

interface BubbleProps {
  msg: Message;
  mine: boolean;
  isGroup: boolean;
  state: ImSnapshot;
  sessionId: string;
  highlighted?: boolean;
  onMenu: (m: Message) => void;
  onReedit?: (m: Message) => void;
  onOpen: (t: BubbleOpen) => void;
  onToast: (s: string) => void;
}

/** 单条消息：头像 + 气泡 + 回应 + 已读回执入口 */
export function MessageBubble(props: BubbleProps) {
  const { msg, mine, isGroup, state, sessionId, highlighted, onMenu, onOpen } = props;
  const pressTimer = useRef<number | null>(null);
  const clearPress = () => { if (pressTimer.current !== null) { window.clearTimeout(pressTimer.current); pressTimer.current = null; } };
  const sender = displayName(state, msg.from);
  const reactions = Object.entries(msg.reactions ?? {}).filter(([, users]) => users.length > 0);
  const receipt = mine && isGroup ? groupReceipt(state, sessionId, msg) : undefined;

  if (msg.type === 'system' && !msg.burn && !msg.recalled) {
    return (
      <div className="flex justify-center py-1" id={`msg-${msg.id}`}>
        <div className="max-w-[86%] rounded-full bg-[#ebedf0] px-3 py-1 text-center text-[11px] leading-4 text-[#969799]">
          {msg.text}
          {msg.topicId && (
            <button onClick={() => onOpen({ kind: 'topic', topicId: msg.topicId ?? '' })} className="ml-1 text-[#2e71ff]">查看详情</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id={`msg-${msg.id}`} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''} ${highlighted ? 'rounded-xl ring-2 ring-[#f5bc0e] ring-offset-2 ring-offset-[#f7f8fa]' : ''}`}>
      <ImAvatar id={msg.from} name={sender} size={36} />
      <div className={`flex min-w-0 max-w-[74%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
        {isGroup && !mine && <div className="mb-0.5 px-1 text-[11px] text-[#969799]">{sender}</div>}
        <div
          onContextMenu={(e) => { e.preventDefault(); onMenu(msg); }}
          onTouchStart={() => { pressTimer.current = window.setTimeout(() => onMenu(msg), 480); }}
          onTouchEnd={clearPress}
          onTouchMove={clearPress}
          onClick={() => { if (msg.recalled || msg.burned) onMenu(msg); }}
          className="max-w-full cursor-pointer"
        >
          <BubbleInner {...props} />
        </div>
        {reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {REACTION_EMOJIS.filter((e) => reactions.some(([k]) => k === e)).map((emoji) => {
              const users = (msg.reactions ?? {})[emoji] ?? [];
              return (
                <button
                  key={emoji}
                  onClick={() => useImStore.getState().toggleReaction(sessionId, msg.id, emoji)}
                  className={`flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] ${users.includes('me') ? 'border-[#f53a71]/40 bg-[#f53a71]/10 text-[#f53a71]' : 'border-[#ebedf0] bg-white text-[#646566]'}`}
                >
                  <span>{emoji}</span><span>{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
        {receipt && msg.status !== 'sending' && (
          <button onClick={() => onOpen({ kind: 'receipt', msg })} className="mt-0.5 flex items-center gap-1 text-[10px] text-[#969799]">
            <Check size={11} />
            {receipt.unread.length === 0 ? '全部已读' : `${receipt.unread.length} 人未读`}
          </button>
        )}
        {msg.status === 'sending' && <div className="mt-0.5 text-[10px] text-[#969799]">发送中…</div>}
        {msg.status === 'failed' && <div className="mt-0.5 text-[10px] text-[#f35f5f]">发送失败</div>}
      </div>
    </div>
  );
}

function BubbleInner({ msg, mine, state, sessionId, onReedit, onOpen, onToast }: BubbleProps) {
  if (msg.recalled) {
    return (
      <div className="text-[12px] text-[#969799]">
        {mine ? '你撤回了一条消息' : '对方撤回了一条消息'}
        {mine && onReedit && (
          <button onClick={(e) => { e.stopPropagation(); onReedit(msg); }} className="ml-2 text-[#2e71ff]">重新编辑</button>
        )}
      </div>
    );
  }
  if (msg.burned) return <div className="text-[12px] text-[#c8c9cc]">[阅后即焚已销毁]</div>;
  if (msg.burn && !msg.burnRevealed) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          useImStore.getState().revealBurn(sessionId, msg.id);
          setTimeout(() => useImStore.getState().burnMessage(sessionId, msg.id), 3000);
        }}
        className="rounded-2xl border border-dashed border-[#f53a71] bg-white px-4 py-3 text-[13px] text-[#f53a71]"
      >
        <Eye size={16} className="mx-auto mb-1" />点击查看阅后即焚消息
      </button>
    );
  }

  const isCard = ['file', 'card', 'article', 'vote', 'chain', 'merge'].includes(msg.type);
  const solid = mine && !isCard;
  // 卡片类消息用白底 + 玫红细描边，避免大面积实心玫红压过内容
  const shell = isCard
    ? 'rounded-2xl border border-[#f53a71]/25 bg-white text-[#323233]'
    : mine
      ? 'rounded-2xl rounded-tr-md bg-[#f53a71] text-white'
      : 'rounded-2xl rounded-tl-md border border-[#ebedf0] bg-white text-[#323233]';
  const meta = solid ? 'text-white/80' : 'text-[#969799]';

  return (
    <div className={`${isCard ? 'px-1.5 py-1.5' : 'px-3 py-2'} max-w-full text-[14px] leading-6 shadow-sm ${shell}`}>
      {msg.quote && (
        <div className={`mb-1 truncate rounded px-2 py-1 text-[11px] ${solid ? 'bg-black/15 text-white/90' : 'bg-[#f2f3f5] text-[#646566]'}`}>
          {displayName(state, msg.quote.from)}：{msg.quote.text ? messagePreview({ ...msg, text: msg.quote.text, type: 'text' }) : ''}
        </div>
      )}
      <MessageBody msg={msg} mine={mine} state={state} sessionId={sessionId} onOpen={onOpen} onToast={onToast} />
      <div className={`mt-0.5 flex items-center justify-end gap-2 px-1 text-[10px] ${meta}`}>
        {msg.scheduled && <span>定时{msg.scheduleAt ? ` ${msg.scheduleAt}` : ''}</span>}
        {msg.burn && msg.burnRevealed && <span>阅后即焚</span>}
        {msg.edited && <span>已编辑</span>}
        {msg.time && <span>{msg.time}</span>}
      </div>
    </div>
  );
}

export function MessageBody({ msg, mine, state, sessionId, onOpen, onToast }: {
  msg: Message;
  mine: boolean;
  state: ImSnapshot;
  sessionId: string;
  onOpen: (t: BubbleOpen) => void;
  onToast: (s: string) => void;
}) {
  switch (msg.type) {
    case 'image':
      return (
        <button onClick={() => onOpen({ kind: 'media', label: msg.text ?? '图片' })} className={`grid h-32 w-44 place-items-center rounded-xl bg-gradient-to-br text-[28px] text-white/80 ${msg.tone === 'violet' ? 'from-violet-300 to-fuchsia-400' : msg.tone === 'amber' ? 'from-amber-300 to-orange-400' : 'from-[#9dc8f5] to-[#6fa8e8]'}`}>
          🖼
        </button>
      );
    case 'video':
      return (
        <button onClick={() => onOpen({ kind: 'media', label: msg.text ?? '视频' })} className="relative grid h-32 w-44 place-items-center rounded-xl bg-[#323233] text-white">
          <Play size={26} />
          <span className="absolute bottom-1 right-1.5 text-[10px]">{msg.duration ?? 0}s</span>
        </button>
      );
    case 'voice':
      return (
        <button onClick={() => onToast('语音播放（演示）')} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] ${mine ? 'bg-black/10 text-white' : 'bg-[#f2f3f5] text-[#323233]'}`}>
          <Play size={14} />
          <span>{msg.duration ?? 0}″</span>
        </button>
      );
    case 'file':
      return (
        <button onClick={() => onOpen({ kind: 'file', name: msg.text ?? '文件' })} className="flex w-52 items-center gap-2 rounded-xl border border-[#ebedf0] bg-white p-3 text-left">
          <FileText size={22} className="shrink-0 text-[#2e71ff]" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-[#323233]">{msg.text}</span>
            <span className="block text-[11px] text-[#969799]">{msg.size ?? ''} · 点击下载</span>
          </span>
        </button>
      );
    case 'card': {
      const id = msg.card?.id ?? '';
      const person = state.contacts.find((c) => c.id === id);
      return (
        <button onClick={() => onOpen({ kind: 'contact', contactId: id })} className="flex w-52 items-center gap-2 rounded-xl border border-[#ebedf0] bg-white p-3 text-left">
          <ImAvatar id={id} name={person?.name ?? msg.text ?? '人'} size={34} />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-[#323233]">{person?.name ?? msg.text}</span>
            <span className="block truncate text-[11px] text-[#969799]">{person?.job ?? '个人名片'}</span>
          </span>
        </button>
      );
    }
    case 'article':
      return (
        <button onClick={() => onOpen({ kind: 'article', url: msg.url })} className="w-56 overflow-hidden rounded-xl border border-[#ebedf0] bg-white text-left">
          <div className="h-20 bg-gradient-to-r from-[#f53a71]/70 to-[#f5bc0e]/60" />
          <div className="p-2.5">
            <div className="line-clamp-2 text-[13px] font-medium text-[#323233]">{msg.title ?? msg.text}</div>
            {msg.desc && <div className="mt-1 line-clamp-2 text-[11px] text-[#969799]">{msg.desc}</div>}
            <div className="mt-1 flex items-center gap-1 text-[11px] text-[#2e71ff]">查看图文 <ExternalLink size={11} /></div>
          </div>
        </button>
      );
    case 'emoji':
      return <div className="text-[32px] leading-9">{msg.text}</div>;
    case 'call':
      return (
        <div className={`flex w-48 items-center gap-2 rounded-xl px-3 py-2 text-[13px] ${mine ? 'bg-black/10 text-white' : 'bg-[#f2f3f5] text-[#323233]'}`}>
          <Radio size={16} /> {msg.mode === 'video' ? '视频通话' : '语音通话'} · {msg.text}
        </div>
      );
    case 'vote':
      return <VoteCard msg={msg} sessionId={sessionId} onToast={onToast} />;
    case 'chain':
      return <ChainCard msg={msg} sessionId={sessionId} state={state} />;
    case 'merge':
      return (
        <button onClick={() => onOpen({ kind: 'merge', msg })} className="w-56 rounded-xl border border-[#ebedf0] bg-white p-3 text-left">
          <div className="text-[13px] font-medium text-[#323233]">{msg.merge?.title ?? '聊天记录'}</div>
          <div className="mt-1.5 space-y-0.5">
            {(msg.merge?.items ?? []).slice(0, 3).map((item, i) => (
              <div key={i} className="truncate text-[11px] text-[#969799]">{item.fromName ?? displayName(state, item.from ?? '')}：{item.text}</div>
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#2e71ff]">
            <span>共 {msg.merge?.items.length ?? 0} 条</span><ChevronRight size={13} />
          </div>
        </button>
      );
    case 'system':
      return <div className="text-center text-[12px] text-[#969799]">{msg.text}</div>;
    default:
      return <div className="whitespace-pre-wrap break-words">{renderMentionText(msg.text ?? '', mine)}</div>;
  }
}

function renderMentionText(text: string, mine: boolean) {
  const parts = text.split(/(@所有人|@[^\s@，。]+)/g);
  return parts.map((part, i) => part.startsWith('@')
    ? <span key={i} className={mine ? 'font-medium text-white' : 'font-medium text-[#2e71ff]'}>{part}</span>
    : <span key={i}>{part}</span>);
}

/** 投票：写回 Store，非组件局部状态 */
export function VoteCard({ msg, sessionId, onToast }: { msg: Message; sessionId: string; onToast: (s: string) => void }) {
  const vote = msg.vote;
  if (!vote) return null;
  const myOptions = vote.options.filter((o) => o.voters.includes('me')).map((o) => o.id);
  const cast = (optionId: string) => {
    if (vote.ended) { onToast('投票已结束'); return; }
    const next = vote.multiple
      ? myOptions.includes(optionId) ? myOptions.filter((id) => id !== optionId) : [...myOptions, optionId]
      : [optionId];
    useImStore.getState().submitVote(sessionId, msg.id, next);
    onToast('投票已提交');
  };
  const total = vote.options.reduce((sum, o) => sum + o.voters.length, 0);
  return (
    <div className="w-60 rounded-xl border border-[#ebedf0] bg-white p-3 text-left text-[#323233]">
      <div className="text-[13px] font-medium">{vote.title}</div>
      <div className="mt-0.5 text-[11px] text-[#969799]">{vote.ended ? '已结束' : vote.multiple ? '多选' : '单选'} · {total} 人参与</div>
      <div className="mt-2 space-y-1.5">
        {vote.options.map((o) => {
          const voted = o.voters.includes('me');
          return (
            <button key={o.id} onClick={() => cast(o.id)} className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-[13px] ${voted ? 'border-[#f53a71] bg-[#f53a71]/5 text-[#f53a71]' : 'border-[#ebedf0] text-[#323233]'}`}>
              <span className="min-w-0 truncate">{o.text}</span>
              <span className="shrink-0 text-[12px] text-[#969799]">{o.voters.length} 票</span>
            </button>
          );
        })}
      </div>
      {msg.from === 'me' && !vote.ended && (
        <button onClick={() => { useImStore.getState().endVote(sessionId, msg.id); onToast('投票已结束'); }} className="mt-2 text-[11px] text-[#2e71ff]">结束投票</button>
      )}
    </div>
  );
}

/** 接龙：写回 Store */
export function ChainCard({ msg, sessionId, state }: { msg: Message; sessionId: string; state: ImSnapshot }) {
  const chain = msg.chain;
  const [joining, setJoining] = useState(false);
  const [text, setText] = useState('');
  if (!chain) return null;
  const submit = () => {
    const value = text.trim();
    if (!value) return;
    useImStore.getState().upsertChainItem(sessionId, msg.id, `${displayName(state, 'me')} ${value}`);
    setText('');
    setJoining(false);
  };
  return (
    <div className="w-60 rounded-xl border border-[#ebedf0] bg-white p-3 text-left text-[#323233]">
      <div className="flex items-center justify-between">
        <div className="min-w-0 truncate text-[13px] font-medium">{chain.title}</div>
        <span className="shrink-0 text-[11px] text-[#2e71ff]">{chain.items.length} 人</span>
      </div>
      <div className="mt-2 space-y-1">
        {chain.items.map((item, i) => (
          <div key={item.id} className="truncate text-[12px] text-[#646566]">
            <span className="font-medium text-[#323233]">{i + 1}. {displayName(state, item.from)}：</span>{item.text}
          </div>
        ))}
      </div>
      {joining ? (
        <div className="mt-2 flex gap-1.5">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="输入接龙内容" className="h-8 min-w-0 flex-1 rounded-lg border border-[#ebedf0] px-2 text-[12px] outline-none" />
          <button onClick={submit} className="shrink-0 rounded-lg bg-[#f53a71] px-2 text-[12px] text-white">提交</button>
        </div>
      ) : (
        <button onClick={() => setJoining(true)} className="mt-2 w-full rounded-lg bg-[#f53a71]/10 py-1.5 text-[13px] text-[#f53a71]">参与接龙</button>
      )}
    </div>
  );
}

/** 置顶消息条 */
export function PinnedMessageBar({ state, sessionId, onOpenList, onJump }: {
  state: ImSnapshot;
  sessionId: string;
  onOpenList: () => void;
  onJump: (msgId: string) => void;
}) {
  const pins = pinnedMessages(state, sessionId);
  if (!pins.length) return null;
  const latest = pins[0];
  return (
    <div className="flex w-full items-center gap-2 border-b border-[#ebedf0] bg-[#fffbe8] px-3 py-2">
      <Pin size={14} className="shrink-0 text-[#f5bc0e]" />
      <button onClick={() => onJump(latest.msg.id)} className="min-w-0 flex-1 truncate text-left text-[12px] text-[#646566]">
        <span className="font-medium text-[#323233]">置顶：</span>{messagePreview(latest.msg)}
      </button>
      <button onClick={onOpenList} className="shrink-0 text-[12px] text-[#2e71ff]">{pins.length} 条 ›</button>
    </div>
  );
}

/** 已读回执面板 */
export function ReceiptPanel({ open, onClose, state, sessionId, msg }: {
  open: boolean;
  onClose: () => void;
  state: ImSnapshot;
  sessionId: string;
  msg: Message | null;
}) {
  const [tab, setTab] = useState<'unread' | 'read'>('unread');
  if (!msg) return null;
  const receipt = groupReceipt(state, sessionId, msg);
  const ids = tab === 'unread' ? receipt.unread : receipt.read;
  return (
    <ImSheet open={open} onClose={onClose} title="消息已读回执">
      <div className="flex border-b border-[#ebedf0]">
        {(['unread', 'read'] as const).map((key) => (
          <button key={key} onClick={() => setTab(key)} className={`flex-1 border-b-2 py-2.5 text-[14px] ${tab === key ? 'border-[#f53a71] font-medium text-[#f53a71]' : 'border-transparent text-[#646566]'}`}>
            {key === 'unread' ? `未读 ${receipt.unread.length}` : `已读 ${receipt.read.length}`}
          </button>
        ))}
      </div>
      <div className="max-h-[50vh] overflow-y-auto px-4 pb-4">
        {ids.length === 0 && <div className="py-8 text-center text-[13px] text-[#969799]">暂无成员</div>}
        {ids.map((id) => {
          const person = state.contacts.find((c) => c.id === id);
          return (
            <div key={id} className="flex items-center gap-2 border-b border-[#f2f3f5] py-2.5">
              <ImAvatar id={id} name={person?.name ?? id} size={32} />
              <span className="min-w-0 flex-1 truncate text-[14px] text-[#323233]">{person?.name ?? id}</span>
              {tab === 'unread' && (
                <button onClick={() => useImStore.getState().markMessageRead(sessionId, msg.id, id)} className="shrink-0 rounded-full border border-[#f53a71] px-2 py-1 text-[11px] text-[#f53a71]">标记已读</button>
              )}
            </div>
          );
        })}
      </div>
    </ImSheet>
  );
}

/** 合并转发详情 */
export function MergeDetail({ open, onClose, msg, state, onToast }: {
  open: boolean;
  onClose: () => void;
  msg: Message | null;
  state: ImSnapshot;
  onToast: (s: string) => void;
}) {
  return (
    <ImSheet open={open} onClose={onClose} title={msg?.merge?.title ?? '聊天记录'}>
      <div className="max-h-[65vh] overflow-y-auto px-4 pb-4">
        {(msg?.merge?.items ?? []).map((item, i) => (
          <div key={i} className="border-b border-[#f2f3f5] py-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#969799]">
              <span>{item.fromName ?? displayName(state, item.from ?? '')}</span>
              <span>{item.time}</span>
            </div>
            <div className="mt-1 break-words text-[13px] text-[#323233]">{item.text}</div>
            {item.merge && (
              <button onClick={() => onToast('嵌套聊天记录为演示内容')} className="mt-1 text-[11px] text-[#2e71ff]">查看嵌套记录 ›</button>
            )}
          </div>
        ))}
        {(msg?.merge?.items.length ?? 0) === 0 && <div className="py-8 text-center text-[13px] text-[#969799]">暂无记录</div>}
      </div>
    </ImSheet>
  );
}
