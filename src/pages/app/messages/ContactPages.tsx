import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, UserPlus, Headphones, AppWindow, Star, MessageSquare, Phone, Video, Check, ChevronRight } from 'lucide-react';
import { useImStore } from '@/store/imStore';
import { appSessionId, displayName, inboxSessionId } from '@/store/imSelectors';
import { ImAvatar, ImCard, ImEmpty, ImPageHeader, ImPrimaryButton, ImRow, ImSearchBar, ImToast, StatusDot } from './imComponents';
import { useImSnapshot, useToast } from './imHooks';

/* ------------------------------ 通讯录 ------------------------------ */

export function ContactsPage() {
  const navigate = useNavigate();
  const state = useImSnapshot();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const people = state.contacts.filter((c) => c.id !== 'me' && !c.isFileHelper
    && [c.name, c.job, c.dept, c.account, c.phone, state.notes[c.id]].some((v) => v && v.toLowerCase().includes(q)));
  const grouped = useMemo(() => {
    const map = new Map<string, typeof people>();
    for (const p of people) {
      const key = p.dept || '其他';
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    return [...map.entries()];
  }, [people]);
  const accounts = state.serviceAccounts.filter((a) => [a.name, a.desc].join(' ').toLowerCase().includes(q));
  const apps = state.imApps.filter((a) => [a.name, a.desc].join(' ').toLowerCase().includes(q));

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="通讯录" right={<button onClick={() => navigate('/app/messages/groups')} className="text-[12px] text-[#646566]">我的群聊</button>} />
      <div className="shrink-0 bg-white p-3"><ImSearchBar value={query} onChange={setQuery} placeholder="搜索姓名、部门、账号或手机号" /></div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {!q && (
          <ImCard className="grid grid-cols-4 gap-2 p-3">
            {[
              { icon: <Users size={20} />, label: '我的群聊', path: '/app/messages/groups' },
              { icon: <UserPlus size={20} />, label: '创建群聊', path: '/app/messages/groups/create' },
              { icon: <Headphones size={20} />, label: '员工服务', path: '/app/messages/service/sa-hr' },
              { icon: <AppWindow size={20} />, label: '消息应用', path: '/app/messages/session/s-im-app-todo' },
            ].map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1.5 rounded-xl bg-[#f7f8fa] py-3">
                <span className="text-[#f53a71]">{item.icon}</span><span className="text-[12px] text-[#323233]">{item.label}</span>
              </button>
            ))}
          </ImCard>
        )}

        {grouped.map(([dept, list]) => (
          <div key={dept} className="mt-3">
            <div className="px-4 pb-1 text-[12px] text-[#969799]">{dept} · {list.length}</div>
            <div className="bg-white">
              {list.map((c) => (
                <button key={c.id} onClick={() => navigate(`/app/messages/contacts/${c.id}`)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left">
                  <ImAvatar id={c.id} name={displayName(state, c.id)} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5"><span className="truncate text-[14px] text-[#323233]">{displayName(state, c.id)}</span><StatusDot status={c.status} /></span>
                    <span className="block truncate text-[12px] text-[#969799]">{c.job}</span>
                  </span>
                  <ChevronRight size={15} className="shrink-0 text-[#c8c9cc]" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {accounts.length > 0 && (
          <div className="mt-3">
            <div className="px-4 pb-1 text-[12px] text-[#969799]">员工服务</div>
            <div className="bg-white">
              {accounts.map((a) => (
                <button key={a.id} onClick={() => navigate(`/app/messages/service/${a.id}`)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left">
                  <ImAvatar name={a.name} size={38} icon={a.icon} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[14px] text-[#323233]">{a.name}</span><span className="block truncate text-[12px] text-[#969799]">{a.desc}</span></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {apps.length > 0 && (
          <div className="mt-3">
            <div className="px-4 pb-1 text-[12px] text-[#969799]">消息应用</div>
            <div className="bg-white">
              {apps.map((a) => (
                <button key={a.id} onClick={() => navigate(`/app/messages/session/${appSessionId(a.id)}`)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left">
                  <ImAvatar name={a.name} size={38} icon={a.icon} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[14px] text-[#323233]">{a.name}</span><span className="block truncate text-[12px] text-[#969799]">{a.desc}</span></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {q && grouped.length === 0 && accounts.length === 0 && apps.length === 0 && <ImEmpty title="没有匹配的联系人" />}
      </div>
    </div>
  );
}

/* ------------------------------ 联系人详情 ------------------------------ */

export function ContactDetailPage() {
  const { contactId = '' } = useParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [editingNote, setEditingNote] = useState(false);
  const [note, setNote] = useState('');
  const person = state.contacts.find((c) => c.id === contactId);
  const account = state.serviceAccounts.find((a) => a.id === contactId);

  if (!person && !account) {
    return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="联系人" /><ImEmpty title="联系人不存在" /></div>;
  }

  const name = person ? displayName(state, person.id) : account?.name ?? '';
  const startChat = () => {
    if (account) { navigate(`/app/messages/service/${account.id}`); return; }
    const sid = useImStore.getState().createSingleSession(contactId);
    navigate(`/app/messages/session/${sid}`);
  };

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="联系人资料" />
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <ImCard className="flex flex-col items-center px-4 py-6 text-center">
          <ImAvatar id={person?.id} name={name} size={64} icon={account?.icon} />
          <div className="mt-3 text-[17px] font-medium text-[#323233]">{name}</div>
          {person && <div className="mt-1 text-[13px] text-[#969799]">{person.job} · {person.deptPath}</div>}
          {account && <div className="mt-1 text-[13px] text-[#969799]">{account.desc}</div>}
          <div className="mt-4 grid w-full grid-cols-2 gap-3">
            <button onClick={startChat} className="flex items-center justify-center gap-2 rounded-xl bg-[#f53a71] py-2.5 text-[14px] text-white"><MessageSquare size={16} /> 发消息</button>
            <button onClick={() => { showToast('演示通话已发起（未接入真实媒体流）'); }} className="flex items-center justify-center gap-2 rounded-xl bg-[#f2f3f5] py-2.5 text-[14px] text-[#323233]"><Video size={16} /> 视频会议</button>
          </div>
        </ImCard>

        {person && (
          <ImCard>
            <ImRow label="部门" value={person.deptPath} right={<span />} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow label="手机" value={person.phone} right={<span />} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow label="邮箱" value={person.email} right={<span />} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow label="账号" value={person.account} right={<span />} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow icon={<Star size={17} />} label={person.starred ? '取消特别提醒' : '设为特别提醒'} onClick={() => { useImStore.getState().toggleContactStar(person.id); showToast(person.starred ? '已取消' : '已设置'); }} right={<span />} />
          </ImCard>
        )}

        {person && (
          <ImCard>
            {editingNote ? (
              <div className="flex gap-2 p-3">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="输入备注" className="h-9 min-w-0 flex-1 rounded-lg bg-[#f2f3f5] px-3 text-[14px] outline-none" />
                <button onClick={() => { useImStore.getState().setContactNote(person.id, note.trim()); setEditingNote(false); showToast('备注已保存'); }} className="shrink-0 rounded-lg bg-[#f53a71] px-3 text-[13px] text-white">保存</button>
              </div>
            ) : (
              <ImRow label="备注" value={state.notes[person.id] || '点击添加'} onClick={() => { setNote(state.notes[person.id] ?? ''); setEditingNote(true); }} />
            )}
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow icon={<Phone size={17} />} label="语音通话（演示）" onClick={() => showToast('演示环境暂不接入真实通话')} right={<span />} />
          </ImCard>
        )}

        {account && (
          <ImCard>
            <ImRow label="服务咨询" value={`${state.serviceTickets.filter((t) => t.accountId === account.id).length} 条`} onClick={() => navigate(`/app/messages/service/${account.id}`)} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow label="收件箱会话" value="查看" onClick={() => navigate(`/app/messages/session/${inboxSessionId(account.id)}`)} />
          </ImCard>
        )}
      </div>
      <ImToast text={toast} />
    </div>
  );
}

/* ------------------------------ 创建群聊 ------------------------------ */

export function GroupCreatePage() {
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const candidates = state.contacts.filter((c) => c.id !== 'me' && !c.isFileHelper
    && [c.name, c.job, c.dept, c.account].some((v) => v && v.toLowerCase().includes(q)));

  const toggle = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const submit = () => {
    if (!selected.length) { showToast('请至少选择一位成员'); return; }
    const { sessionId } = useImStore.getState().createGroup(name.trim() || `${displayName(state, 'me')}的群聊`, selected);
    navigate(`/app/messages/session/${sessionId}`, { replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="创建群聊" right={<button onClick={submit} className="text-[13px] font-medium text-[#f53a71]">完成</button>} />
      <div className="shrink-0 space-y-2 bg-white p-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="群聊名称（选填）" maxLength={30} className="h-9 w-full rounded-lg bg-[#f2f3f5] px-3 text-[14px] outline-none" />
        <ImSearchBar value={query} onChange={setQuery} placeholder="搜索成员" />
        {selected.length > 0 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto pt-1">
            {selected.map((id) => (
              <button key={id} onClick={() => toggle(id)} className="flex shrink-0 flex-col items-center gap-1">
                <ImAvatar id={id} name={displayName(state, id)} size={38} />
                <span className="max-w-[48px] truncate text-[11px] text-[#646566]">{displayName(state, id)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-[12px] text-[#969799]">已选 {selected.length} 人 · 选择成员</div>
        <div className="bg-white">
          {candidates.map((c) => (
            <button key={c.id} onClick={() => toggle(c.id)} className="flex w-full items-center gap-3 border-b border-[#f2f3f5] px-4 py-2.5 text-left">
              <ImAvatar id={c.id} name={displayName(state, c.id)} size={38} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] text-[#323233]">{displayName(state, c.id)}</span>
                <span className="block truncate text-[12px] text-[#969799]">{c.job} · {c.dept}</span>
              </span>
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected.includes(c.id) ? 'border-[#f53a71] bg-[#f53a71] text-white' : 'border-[#c8c9cc]'}`}>
                {selected.includes(c.id) && <Check size={13} />}
              </span>
            </button>
          ))}
          {candidates.length === 0 && <ImEmpty title="没有匹配的成员" />}
        </div>
      </div>
      <div className="shrink-0 border-t border-[#ebedf0] bg-white p-3"><ImPrimaryButton onClick={submit} disabled={!selected.length}>创建群聊（{selected.length} 人）</ImPrimaryButton></div>
      <ImToast text={toast} />
    </div>
  );
}
