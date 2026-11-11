import { useEffect, useState } from 'react';
import {
  Copy, Reply, Trash2, RotateCcw, Forward, ListChecks, Pin, PinOff, Pencil,
  MessageSquarePlus, Users, CheckSquare2, AtSign, Clock, Vote, Link2, X,
} from 'lucide-react';
import { useImStore } from '@/store/imStore';
import { displayName, getGroup, isPinned, sessionTitle, sortedSessions } from '@/store/imSelectors';
import { canRecall, isForwardable, isPinnable, messagePreview, uid } from '@/data/im/utils';
import { ImAvatar, ImPrimaryButton, ImSheet } from './imComponents';
import { REACTION_EMOJIS } from './constants';
import type { ImSnapshot } from '@/store/imSelectors';
import type { ChainData, Message, VoteData } from '@/data/im/types';

/** 消息长按/右键动作面板：所有动作都写回 Store */
export function MessageActionSheet({ open, onClose, msg, state, sessionId, isGroup, onQuote, onReedit, onForward, onMultiForward, onTopic, onReceipt, onToast }: {
  open: boolean;
  onClose: () => void;
  msg: Message | null;
  state: ImSnapshot;
  sessionId: string;
  isGroup: boolean;
  onQuote: (m: Message) => void;
  onReedit: (m: Message) => void;
  onForward: (m: Message) => void;
  onMultiForward: () => void;
  onTopic: (m: Message) => void;
  onReceipt: (m: Message) => void;
  onToast: (s: string) => void;
}) {
  if (!msg) return null;
  const mine = msg.from === 'me';
  const pinned = isPinned(state, sessionId, msg.id);
  const copy = async () => {
    try { await navigator.clipboard.writeText(msg.text ?? messagePreview(msg)); onToast('已复制'); }
    catch { onToast('复制失败'); }
    onClose();
  };
  const items: { icon: React.ReactNode; label: string; onClick: () => void; show: boolean }[] = [
    { icon: <Copy size={16} />, label: '复制', onClick: copy, show: !msg.recalled && msg.type !== 'system' },
    { icon: <Reply size={16} />, label: '引用', onClick: () => { onQuote(msg); onClose(); }, show: !msg.recalled && msg.type === 'text' },
    { icon: <Forward size={16} />, label: '转发', onClick: () => { onForward(msg); onClose(); }, show: isForwardable(msg) },
    { icon: <ListChecks size={16} />, label: '多选转发', onClick: () => { onMultiForward(); onClose(); }, show: true },
    { icon: pinned ? <PinOff size={16} /> : <Pin size={16} />, label: pinned ? '取消置顶' : '置顶', onClick: () => { useImStore.getState()[pinned ? 'unpinMessage' : 'pinMessage'](sessionId, msg.id); onToast(pinned ? '已取消置顶' : '已置顶'); onClose(); }, show: isPinnable(msg) },
    { icon: <Pencil size={16} />, label: '编辑', onClick: () => { onReedit(msg); onClose(); }, show: mine && msg.type === 'text' && !msg.recalled },
    { icon: <RotateCcw size={16} />, label: '撤回', onClick: () => { if (!canRecall(msg)) { onToast('超过 2 分钟，无法撤回'); return; } useImStore.getState().recallMessage(sessionId, msg.id); onToast('已撤回'); onClose(); }, show: mine && canRecall(msg) },
    { icon: <Trash2 size={16} />, label: '删除', onClick: () => { useImStore.getState().deleteMessage(sessionId, msg.id); onToast('已删除'); onClose(); }, show: true },
    { icon: <MessageSquarePlus size={16} />, label: '创建话题', onClick: () => { onTopic(msg); onClose(); }, show: isGroup && !msg.recalled && msg.type !== 'system' },
    { icon: <Users size={16} />, label: '已读回执', onClick: () => { onReceipt(msg); onClose(); }, show: isGroup && mine },
  ];
  return (
    <ImSheet open={open} onClose={onClose}>
      <div className="p-3">
        <div className="mb-3 flex items-center justify-center gap-2">
          {REACTION_EMOJIS.map((e) => (
            <button key={e} onClick={() => { useImStore.getState().toggleReaction(sessionId, msg.id, e); onClose(); }} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f3f5] text-[20px]">{e}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {items.filter((i) => i.show).map((item) => (
            <button key={item.label} onClick={item.onClick} className="flex flex-col items-center gap-1.5 rounded-xl bg-[#f2f3f5] px-2 py-3 text-[12px] text-[#323233]">
              <span className="text-[#646566]">{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      </div>
    </ImSheet>
  );
}

/** 转发目标选择：支持逐条与合并 */
export function ForwardPicker({ open, onClose, state, fromSessionId, msgIds, onDone }: {
  open: boolean;
  onClose: () => void;
  state: ImSnapshot;
  fromSessionId: string;
  msgIds: string[];
  onDone: (mode: 'single' | 'merge') => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => { if (open) setSelected([]); }, [open]);
  const candidates = sortedSessions(state).filter((s) => s.id !== fromSessionId);
  const toggle = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const submit = (mode: 'single' | 'merge') => {
    if (!selected.length) return;
    useImStore.getState().forwardMessages(fromSessionId, msgIds, selected, mode);
    onDone(mode);
    onClose();
  };
  return (
    <ImSheet open={open} onClose={onClose} title={`转发 ${msgIds.length} 条消息`}>
      <div className="max-h-[45vh] overflow-y-auto px-4">
        {candidates.length === 0 && <div className="py-8 text-center text-[13px] text-[#969799]">暂无可转发的会话</div>}
        {candidates.map((s) => (
          <button key={s.id} onClick={() => toggle(s.id)} className="flex w-full items-center gap-3 border-b border-[#f2f3f5] py-2.5 text-left">
            <ImAvatar id={s.targetId} name={sessionTitle(state, s)} size={36} isGroup={s.type === 'group'} icon={s.type === 'im-app' ? '📱' : undefined} />
            <span className="min-w-0 flex-1 truncate text-[14px] text-[#323233]">{sessionTitle(state, s)}</span>
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected.includes(s.id) ? 'border-[#f53a71] bg-[#f53a71] text-white' : 'border-[#c8c9cc]'}`}>
              {selected.includes(s.id) && <CheckSquare2 size={13} />}
            </span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        <button onClick={() => submit('single')} disabled={!selected.length} className="rounded-xl bg-[#f2f3f5] py-2.5 text-[14px] text-[#323233] disabled:opacity-50">逐条转发</button>
        <button onClick={() => submit('merge')} disabled={!selected.length} className="rounded-xl bg-[#f53a71] py-2.5 text-[14px] text-white disabled:opacity-50">合并转发</button>
      </div>
    </ImSheet>
  );
}

/** @成员 / @所有人 */
export function MentionPicker({ open, onClose, state, groupId, onPick }: {
  open: boolean;
  onClose: () => void;
  state: ImSnapshot;
  groupId: string;
  onPick: (text: string, mentions: string[], all: boolean) => void;
}) {
  const group = getGroup(state, groupId);
  const members = (group?.members ?? []).filter((id) => id !== 'me');
  return (
    <ImSheet open={open} onClose={onClose} title="选择提醒的人">
      <div className="max-h-[50vh] overflow-y-auto px-4 pb-4">
        <button onClick={() => { onPick('@所有人 ', [], true); onClose(); }} className="flex w-full items-center gap-3 border-b border-[#f2f3f5] py-3 text-left">
          <span className="grid h-9 w-9 place-items-center rounded-[14px] bg-[#f53a71]/10 text-[#f53a71]"><AtSign size={18} /></span>
          <span className="text-[14px] text-[#323233]">所有人</span>
        </button>
        {members.map((id) => {
          const name = displayName(state, id);
          return (
            <button key={id} onClick={() => { onPick(`@${name} `, [id], false); onClose(); }} className="flex w-full items-center gap-3 border-b border-[#f2f3f5] py-2.5 text-left">
              <ImAvatar id={id} name={name} size={36} />
              <span className="min-w-0 flex-1 truncate text-[14px] text-[#323233]">{name}</span>
              <span className="shrink-0 text-[11px] text-[#969799]">{state.contacts.find((c) => c.id === id)?.job ?? ''}</span>
            </button>
          );
        })}
      </div>
    </ImSheet>
  );
}

/** 发起投票 */
export function VoteCreator({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (vote: VoteData) => void }) {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multiple, setMultiple] = useState(false);
  useEffect(() => { if (open) { setTitle(''); setOptions(['', '']); setMultiple(false); } }, [open]);
  const submit = () => {
    const valid = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim() || valid.length < 2) return;
    onSubmit({ title: title.trim(), multiple, anonymous: false, ended: false, options: valid.map((text, i) => ({ id: `o-${i}-${uid('v')}`, text, voters: [] })) });
    onClose();
  };
  return (
    <ImSheet open={open} onClose={onClose} title="发起投票">
      <div className="space-y-3 p-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="投票标题" className="h-10 w-full rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
        {options.map((o, i) => (
          <div key={i} className="flex gap-2">
            <input value={o} onChange={(e) => setOptions((prev) => prev.map((x, j) => j === i ? e.target.value : x))} placeholder={`选项 ${i + 1}`} className="h-9 min-w-0 flex-1 rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
            {options.length > 2 && <button onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))} className="shrink-0 px-2 text-[#969799]"><X size={16} /></button>}
          </div>
        ))}
        <button onClick={() => setOptions((prev) => [...prev, ''])} className="text-[13px] text-[#2e71ff]">+ 添加选项</button>
        <label className="flex items-center gap-2 text-[13px] text-[#646566]">
          <input type="checkbox" checked={multiple} onChange={(e) => setMultiple(e.target.checked)} /> 允许多选
        </label>
        <ImPrimaryButton onClick={submit} disabled={!title.trim()}>发布投票</ImPrimaryButton>
      </div>
    </ImSheet>
  );
}

/** 发起接龙 */
export function ChainCreator({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (chain: ChainData) => void }) {
  const [title, setTitle] = useState('');
  const [example, setExample] = useState('');
  useEffect(() => { if (open) { setTitle(''); setExample(''); } }, [open]);
  const submit = () => {
    if (!title.trim()) return;
    onSubmit({ chainId: uid('chain'), title: title.trim(), example: example.trim(), starter: 'me', items: [] });
    onClose();
  };
  return (
    <ImSheet open={open} onClose={onClose} title="发起接龙">
      <div className="space-y-3 p-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="接龙主题，如：周五演示人员" className="h-10 w-full rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
        <input value={example} onChange={(e) => setExample(e.target.value)} placeholder="示例格式（选填）" className="h-10 w-full rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
        <ImPrimaryButton onClick={submit} disabled={!title.trim()}>发布接龙</ImPrimaryButton>
      </div>
    </ImSheet>
  );
}

/** 定时消息 */
export function ScheduleSheet({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (label: string) => void }) {
  const [value, setValue] = useState('');
  useEffect(() => { if (open) setValue(''); }, [open]);
  return (
    <ImSheet open={open} onClose={onClose} title="定时消息">
      <div className="space-y-3 p-4">
        <div className="text-[13px] text-[#646566]">选择发送时间后，下一条消息将标记为定时消息（演示状态）。</div>
        <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} className="h-10 w-full rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
        <ImPrimaryButton onClick={() => { onSubmit(value ? value.replace('T', ' ') : '待发送'); onClose(); }}>确定</ImPrimaryButton>
      </div>
    </ImSheet>
  );
}

/** 话题标题 */
export function TopicCreator({ open, onClose, defaultTitle, onSubmit }: { open: boolean; onClose: () => void; defaultTitle: string; onSubmit: (title: string) => void }) {
  const [value, setValue] = useState(defaultTitle);
  useEffect(() => { if (open) setValue(defaultTitle); }, [open, defaultTitle]);
  return (
    <ImSheet open={open} onClose={onClose} title="创建话题">
      <div className="space-y-3 p-4">
        <input value={value} onChange={(e) => setValue(e.target.value)} maxLength={30} placeholder="话题标题（30 字内）" className="h-10 w-full rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
        <ImPrimaryButton onClick={() => { if (value.trim()) { onSubmit(value.trim()); onClose(); } }} disabled={!value.trim()}>创建并进入话题</ImPrimaryButton>
      </div>
    </ImSheet>
  );
}

/** 创建图文消息（Mock 链接，不跳转站外） */
export function ArticleCreator({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (title: string, desc: string) => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  useEffect(() => { if (open) { setTitle(''); setDesc(''); } }, [open]);
  return (
    <ImSheet open={open} onClose={onClose} title="发送图文">
      <div className="space-y-3 p-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="图文标题" className="h-10 w-full rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="摘要描述" className="h-10 w-full rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
        <div className="flex items-center gap-1 text-[12px] text-[#969799]"><Link2 size={13} /> 演示链接：office.example.com</div>
        <ImPrimaryButton onClick={() => { if (title.trim()) { onSubmit(title.trim(), desc.trim()); onClose(); } }} disabled={!title.trim()}>发送图文</ImPrimaryButton>
      </div>
    </ImSheet>
  );
}

export function VoteIcon() { return <Vote size={20} />; }
export function ClockIcon() { return <Clock size={20} />; }
