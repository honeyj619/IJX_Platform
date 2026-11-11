import { useState } from 'react';
import {
  Smile, Plus, AtSign, Send, Image as ImageIcon, Video, FileText, Mic, IdCard,
  Newspaper, Vote, Link2, Clock, Flame, Phone, X, Pencil,
} from 'lucide-react';
import { useImStore } from '@/store/imStore';
import { displayName, isMutedInGroup } from '@/store/imSelectors';
import { messagePreview } from '@/data/im/utils';
import { ArticleCreator, ChainCreator, MentionPicker, ScheduleSheet, VoteCreator } from './actionParts';
import type { ImSnapshot } from '@/store/imSelectors';
import type { Message, Session } from '@/data/im/types';

const QUICK_EMOJIS = ['👍', '🎉', '❤️', '😂', '😮', '🙏', '😀', '👏', '🔥', '✅', '💡', '🙏'];

interface ComposerProps {
  sessionId: string;
  session: Session;
  state: ImSnapshot;
  quote: Message | null;
  editing: Message | null;
  onClearQuote: () => void;
  onClearEditing: () => void;
  onToast: (s: string) => void;
  onCall: () => void;
  onSent?: () => void;
}

export default function Composer({ sessionId, session, state, quote, editing, onClearQuote, onClearEditing, onToast, onCall, onSent }: ComposerProps) {
  const draft = state.drafts[sessionId] ?? '';
  const setDraft = (v: string) => useImStore.getState().setDraft(sessionId, v);
  const [panel, setPanel] = useState<'emoji' | 'plus' | null>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [voteOpen, setVoteOpen] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [burnOn, setBurnOn] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const isGroup = session.type === 'group';
  const muted = isGroup && isMutedInGroup(state, session.targetId);

  const send = (payload: Partial<Message>) => {
    const id = useImStore.getState().sendMessage(sessionId, payload);
    setPanel(null);
    setBurnOn(false);
    setScheduleAt('');
    onSent?.();
    return id;
  };

  const submitText = () => {
    const text = draft.trim();
    if (!text || muted) return;
    if (editing) {
      useImStore.getState().editMessage(sessionId, editing.id, text);
      onClearEditing();
      onToast('已编辑消息');
    } else {
      const mentions = state.contacts.filter((c) => c.id !== 'me' && text.includes(`@${c.name}`)).map((c) => c.id);
      send({
        type: 'text',
        text,
        quote: quote ? { id: quote.id, from: quote.from, type: quote.type, text: messagePreview(quote) } : undefined,
        mentions: mentions.length ? mentions : undefined,
        mentionAll: text.includes('@所有人'),
        burn: burnOn || undefined,
        scheduled: !!scheduleAt || undefined,
        scheduleAt: scheduleAt || undefined,
      });
      onClearQuote();
    }
    setDraft('');
  };

  const quickSend = (payload: Partial<Message>) => {
    send({ time: undefined, ...payload, burn: burnOn || undefined, scheduled: !!scheduleAt || undefined, scheduleAt: scheduleAt || undefined });
    onToast('已发送');
  };

  const plusItems: { icon: React.ReactNode; label: string; onClick: () => void }[] = [
    { icon: <ImageIcon size={20} />, label: '图片', onClick: () => quickSend({ type: 'image', text: '图片消息', tone: 'sky' }) },
    { icon: <Video size={20} />, label: '视频', onClick: () => quickSend({ type: 'video', text: '走查录屏.mp4', duration: 15, size: '8 MB' }) },
    { icon: <FileText size={20} />, label: '文件', onClick: () => quickSend({ type: 'file', text: '新建文档.docx', size: '12 KB' }) },
    { icon: <Mic size={20} />, label: '语音', onClick: () => quickSend({ type: 'voice', text: '语音消息', duration: 6 }) },
    { icon: <IdCard size={20} />, label: '名片', onClick: () => quickSend({ type: 'card', text: state.contacts.find((c) => c.id !== 'me')?.name ?? '同事', card: { kind: 'person', id: state.contacts.find((c) => c.id !== 'me')?.id ?? 'jy-p5' } }) },
    { icon: <Newspaper size={20} />, label: '图文', onClick: () => setArticleOpen(true) },
    { icon: <Vote size={20} />, label: '投票', onClick: () => setVoteOpen(true) },
    { icon: <Link2 size={20} />, label: '接龙', onClick: () => setChainOpen(true) },
    { icon: <Clock size={20} />, label: '定时', onClick: () => setScheduleOpen(true) },
    { icon: <Flame size={20} />, label: '阅后即焚', onClick: () => { setBurnOn((v) => !v); onToast(burnOn ? '已关闭阅后即焚' : '下一条消息阅后即焚'); } },
    { icon: <Phone size={20} />, label: '通话', onClick: onCall },
    { icon: <AtSign size={20} />, label: '@成员', onClick: () => setMentionOpen(true) },
  ];

  return (
    <div className="shrink-0 border-t border-[#ebedf0] bg-white pb-[env(safe-area-inset-bottom)]">
      {/* 群禁言提示 */}
      {muted && (
        <div className="bg-[#fffbe8] px-3 py-1.5 text-center text-[12px] text-[#969799]">群内已开启禁言，仅管理员可发言</div>
      )}

      {/* 引用 / 编辑条 */}
      {(quote || editing) && (
        <div className="flex items-center gap-2 border-b border-[#ebedf0] bg-[#f2f3f5] px-3 py-2">
          <Pencil size={13} className="shrink-0 text-[#f53a71]" />
          <div className="min-w-0 flex-1 truncate text-[12px] text-[#646566]">
            {editing ? '重新编辑：' : `引用 ${displayName(state, quote?.from ?? '')}：`}
            {editing ? editing.text : quote ? messagePreview(quote) : ''}
          </div>
          <button onClick={() => { onClearQuote(); onClearEditing(); }} className="shrink-0 text-[#969799]"><X size={15} /></button>
        </div>
      )}

      {/* 定时 / 焚状态条 */}
      {(burnOn || scheduleAt) && (
        <div className="flex items-center gap-2 bg-[#f53a71]/5 px-3 py-1 text-[11px] text-[#f53a71]">
          {burnOn && <span>下一条：阅后即焚</span>}
          {scheduleAt && <span>下一条：定时 {scheduleAt}</span>}
          <button onClick={() => { setBurnOn(false); setScheduleAt(''); }} className="ml-auto"><X size={13} /></button>
        </div>
      )}

      <div className="flex items-end gap-1 px-2 pb-2 pt-1.5">
        <button onClick={() => setPanel(panel === 'emoji' ? null : 'emoji')} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${panel === 'emoji' ? 'bg-[#f2f3f5] text-[#f53a71]' : 'text-[#646566]'}`} aria-label="表情"><Smile size={22} /></button>
        {isGroup && (
          <button onClick={() => setMentionOpen(true)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#646566]" aria-label="@成员"><AtSign size={20} /></button>
        )}
        <button onClick={() => setPanel(panel === 'plus' ? null : 'plus')} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${panel === 'plus' ? 'bg-[#f2f3f5] text-[#f53a71]' : 'text-[#646566]'}`} aria-label="更多"><Plus size={22} /></button>
        <input
          value={draft}
          disabled={muted}
          onChange={(e) => {
            setDraft(e.target.value);
            if (isGroup && e.target.value.endsWith('@')) setMentionOpen(true);
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') submitText(); }}
          placeholder={muted ? '群内禁言中' : editing ? '编辑消息' : '输入消息'}
          className="h-9 min-w-0 flex-1 rounded-full bg-[#f2f3f5] px-4 text-[14px] text-[#323233] outline-none placeholder:text-[#c8c9cc] disabled:opacity-60"
        />
        <button onClick={submitText} disabled={muted || !draft.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f53a71] text-white disabled:opacity-50" aria-label="发送"><Send size={16} /></button>
      </div>

      {panel === 'emoji' && (
        <div className="grid grid-cols-6 gap-1 px-3 pb-3">
          {QUICK_EMOJIS.map((e) => (
            <button key={e} onClick={() => setDraft(draft + e)} className="py-1 text-[22px]">{e}</button>
          ))}
        </div>
      )}
      {panel === 'plus' && (
        <div className="grid grid-cols-4 gap-2 px-3 pb-3">
          {plusItems.map((item) => (
            <button key={item.label} onClick={item.onClick} className={`flex flex-col items-center gap-1 rounded-xl py-2.5 ${item.label === '阅后即焚' && burnOn ? 'bg-[#f53a71]/10 text-[#f53a71]' : 'bg-[#f2f3f5] text-[#323233]'}`}>
              <span className="text-[#f53a71]">{item.icon}</span>
              <span className="text-[12px]">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      <MentionPicker
        open={mentionOpen}
        onClose={() => setMentionOpen(false)}
        state={state}
        groupId={isGroup ? session.targetId : ''}
        onPick={(text) => setDraft(draft.replace(/@[^\s@]*$/, '') + text)}
      />
      <VoteCreator open={voteOpen} onClose={() => setVoteOpen(false)} onSubmit={(vote) => { useImStore.getState().publishVote(sessionId, vote); onToast('投票已发布'); setPanel(null); }} />
      <ChainCreator open={chainOpen} onClose={() => setChainOpen(false)} onSubmit={(chain) => { useImStore.getState().publishChain(sessionId, chain); onToast('接龙已发布'); setPanel(null); }} />
      <ScheduleSheet open={scheduleOpen} onClose={() => setScheduleOpen(false)} onSubmit={setScheduleAt} />
      <ArticleCreator open={articleOpen} onClose={() => setArticleOpen(false)} onSubmit={(title, desc) => quickSend({ type: 'article', title, desc, url: 'https://office.example.com/article' })} />
    </div>
  );
}
