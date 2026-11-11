import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users, UserPlus, Megaphone, FileText, Search, ShieldCheck, BellOff, Pin, Eraser,
  LogOut, Trash2, ChevronRight, Check, Crown, VolumeX, Plus,
} from 'lucide-react';
import { useImStore } from '@/store/imStore';
import { displayName, getGroup, groupRole, isMutedInGroup, myGroups } from '@/store/imSelectors';
import { ImAvatar, ImCard, ImConfirm, ImEmpty, ImPageHeader, ImPrimaryButton, ImRow, ImSheet, ImToast, ImToggleRow } from './imComponents';
import { useImSnapshot, useToast } from './imHooks';
import type { JoinSetting } from '@/data/im/types';

/** 通用输入弹层 */
function PromptSheet({ open, title, initial = '', placeholder, onClose, onSubmit }: {
  open: boolean; title: string; initial?: string; placeholder?: string;
  onClose: () => void; onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  useEffect(() => { if (open) setValue(initial); }, [open, initial]);
  return (
    <ImSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-3 p-4">
        <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl bg-[#f2f3f5] px-3 text-[14px] outline-none" />
        <ImPrimaryButton onClick={() => { if (value.trim()) { onSubmit(value.trim()); onClose(); setValue(''); } }}>保存</ImPrimaryButton>
      </div>
    </ImSheet>
  );
}

/* ------------------------------ 我的群聊 ------------------------------ */

export function GroupsPage() {
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const groups = myGroups(state);
  const pending = state.joinRequests.filter((r) => r.status === 'pending' && ['owner', 'admin'].includes(groupRole(state, r.groupId)));

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="我的群聊" right={<button onClick={() => navigate('/app/messages/groups/create')} className="text-[13px] text-[#f53a71]">新建</button>} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <ImCard>
          <ImRow icon={<Users size={17} />} label="我加入的群聊" value={`${groups.length} 个`} right={<span />} />
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <ImRow icon={<ShieldCheck size={17} />} label="群组消息" value={pending.length ? `${pending.length} 条待审批` : '暂无待办'} right={<ChevronRight size={16} className="text-[#c8c9cc]" />} />
        </ImCard>

        {pending.length > 0 && (
          <div className="mt-3">
            <div className="px-4 pb-1 text-[12px] text-[#969799]">加群审批</div>
            <div className="bg-white">
              {pending.map((r) => (
                <div key={r.id} className="border-b border-[#f2f3f5] px-4 py-3">
                  <div className="text-[14px] text-[#323233]">{displayName(state, r.userId)} 申请加入「{getGroup(state, r.groupId)?.name}」</div>
                  <div className="mt-0.5 text-[12px] text-[#969799]">{r.reason} · {r.time}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => { useImStore.getState().approveJoinRequest(r.id); showToast('已同意申请'); }} className="rounded-lg bg-[#f53a71] px-3 py-1.5 text-[12px] text-white">同意</button>
                    <button onClick={() => { useImStore.getState().rejectJoinRequest(r.id); showToast('已拒绝申请'); }} className="rounded-lg bg-[#f2f3f5] px-3 py-1.5 text-[12px] text-[#323233]">拒绝</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3">
          <div className="px-4 pb-1 text-[12px] text-[#969799]">全部群聊</div>
          <div className="bg-white">
            {groups.map((g) => {
              const session = state.sessions.find((s) => s.type === 'group' && s.targetId === g.id);
              return (
                <div key={g.id} className="flex items-center gap-3 border-b border-[#f2f3f5] px-4 py-3">
                  <ImAvatar name={g.name} isGroup size={40} />
                  <button onClick={() => session && navigate(`/app/messages/session/${session.id}`)} className="min-w-0 flex-1 text-left">
                    <div className="truncate text-[14px] text-[#323233]">{g.name}</div>
                    <div className="text-[12px] text-[#969799]">{g.members.length} 人 · {g.type} · {groupRole(state, g.id) === 'owner' ? '群主' : groupRole(state, g.id) === 'admin' ? '管理员' : '成员'}</div>
                  </button>
                  <button onClick={() => navigate(`/app/messages/group/${g.id}`)} className="shrink-0 text-[12px] text-[#2e71ff]">资料</button>
                </div>
              );
            })}
            {groups.length === 0 && <ImEmpty title="还没有加入群聊" />}
          </div>
        </div>
      </div>
      <ImToast text={toast} />
    </div>
  );
}

/* ------------------------------ 群资料 ------------------------------ */

export function GroupDetailPage() {
  const { groupId = '' } = useParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [prompt, setPrompt] = useState<null | 'name' | 'nick'>(null);
  const [sheet, setSheet] = useState<null | 'mute' | 'allow' | 'black' | 'add'>(null);
  const [confirm, setConfirm] = useState<null | 'clear' | 'leave' | 'dissolve'>(null);
  const group = getGroup(state, groupId);
  const session = state.sessions.find((s) => s.type === 'group' && s.targetId === groupId);
  const role = groupRole(state, groupId);
  const canManage = role === 'owner' || role === 'admin';

  if (!group || !session) {
    return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="群资料" /><ImEmpty title="群聊不存在" /></div>;
  }

  const listUsers = sheet === 'mute' ? group.muted : sheet === 'allow' ? group.allowlist ?? [] : sheet === 'black' ? group.blacklist : [];
  const confirmText = confirm === 'clear'
    ? { title: '清空聊天记录', desc: '将删除本群全部消息，且无法恢复。', ok: () => { useImStore.getState().clearSession(session.id); setConfirm(null); showToast('已清空'); navigate('/app/messages'); } }
    : confirm === 'leave'
      ? { title: '退出群聊', desc: '退出后将不再接收该群消息。', ok: () => { useImStore.getState().leaveGroup(groupId); setConfirm(null); showToast('已退出群聊'); navigate('/app/messages'); } }
      : { title: '解散群聊', desc: '解散后所有成员将无法继续查看该群，且无法恢复。', ok: () => { useImStore.getState().dissolveGroup(groupId); setConfirm(null); showToast('群聊已解散'); navigate('/app/messages'); } };

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="群资料" right={<button onClick={() => navigate(`/app/messages/session/${session.id}`)} className="text-[12px] text-[#646566]">进群聊</button>} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <ImCard className="flex flex-col items-center px-4 py-5 text-center">
          <ImAvatar name={group.name} isGroup size={60} />
          <button onClick={() => canManage && setPrompt('name')} className="mt-2 max-w-full truncate text-[16px] font-medium text-[#323233]">
            {group.name} {canManage && <span className="text-[12px] text-[#2e71ff]">编辑</span>}
          </button>
          <div className="mt-1 text-[12px] text-[#969799]">{group.members.length} 人 · {group.type} · {role === 'owner' ? '群主' : role === 'admin' ? '管理员' : '成员'}</div>
        </ImCard>

        <ImCard>
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="text-[14px] text-[#323233]">群成员</span>
            <button onClick={() => navigate(`/app/messages/group/${groupId}/members`)} className="text-[12px] text-[#2e71ff]">查看全部 ›</button>
          </div>
          <div className="grid grid-cols-5 gap-2 px-4 py-3">
            {group.members.slice(0, 9).map((id) => (
              <button key={id} onClick={() => id !== 'me' && navigate(`/app/messages/contacts/${id}`)} className="flex flex-col items-center gap-1">
                <ImAvatar id={id} name={displayName(state, id)} size={42} />
                <span className="w-full truncate text-center text-[11px] text-[#646566]">{displayName(state, id)}</span>
              </button>
            ))}
            <button onClick={() => setSheet('add')} className="flex flex-col items-center gap-1">
              <span className="grid h-[42px] w-[42px] place-items-center rounded-[14px] bg-[#f2f3f5] text-[#969799]"><Plus size={18} /></span>
              <span className="text-[11px] text-[#646566]">添加</span>
            </button>
          </div>
        </ImCard>

        <ImCard>
          <ImRow icon={<Megaphone size={17} />} label="群公告" value={group.notice || '暂无'} onClick={() => navigate(`/app/messages/group/${groupId}/notice`)} />
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <ImRow icon={<FileText size={17} />} label="群文件" value={`${group.files.length} 个`} onClick={() => navigate(`/app/messages/group/${groupId}/files`)} />
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <ImRow icon={<Search size={17} />} label="查找聊天记录" onClick={() => navigate(`/app/messages/history/${session.id}`)} />
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <ImRow icon={<Pin size={17} />} label="置顶消息" value={`${session.pins?.length ?? 0} 条`} onClick={() => navigate(`/app/messages/pins/${session.id}`)} />
        </ImCard>

        <ImCard>
          <ImRow label="我在本群的昵称" value={group.nicks?.['me'] || displayName(state, 'me')} onClick={() => setPrompt('nick')} />
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <ImRow icon={<ShieldCheck size={17} />} label="加群设置" value={group.joinSetting === 'all' ? '无需审批' : '需要审批'} onClick={() => navigate(`/app/messages/group/${groupId}/join-settings`)} />
        </ImCard>

        <ImCard>
          <ImToggleRow icon={<Pin size={17} />} label="置顶会话" checked={!!session.pinned} onChange={() => useImStore.getState().togglePin(session.id)} />
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <ImToggleRow icon={<BellOff size={17} />} label="消息免打扰" checked={!!session.mute} onChange={() => useImStore.getState().toggleMute(session.id)} />
        </ImCard>

        {canManage && (
          <ImCard>
            <ImToggleRow icon={<VolumeX size={17} />} label="全员禁言" checked={group.muteAll} onChange={() => { useImStore.getState().toggleMuteAll(groupId); showToast(group.muteAll ? '已关闭全员禁言' : '已开启全员禁言'); }} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow label="禁言名单" value={`${group.muted.length} 人`} onClick={() => setSheet('mute')} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow label="发言白名单" value={`${group.allowlist?.length ?? 0} 人`} onClick={() => setSheet('allow')} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow label="黑名单" value={`${group.blacklist.length} 人`} onClick={() => setSheet('black')} />
          </ImCard>
        )}

        <ImCard>
          <button onClick={() => setConfirm('clear')} className="flex w-full items-center gap-2 px-4 py-3 text-[14px] text-[#f53a71]"><Eraser size={17} /> 清空聊天记录</button>
          <div className="mx-4 h-px bg-[#ebedf0]" />
          {role === 'owner'
            ? <button onClick={() => setConfirm('dissolve')} className="flex w-full items-center gap-2 px-4 py-3 text-[14px] text-[#f53a71]"><Trash2 size={17} /> 解散群聊</button>
            : <button onClick={() => setConfirm('leave')} className="flex w-full items-center gap-2 px-4 py-3 text-[14px] text-[#f53a71]"><LogOut size={17} /> 退出群聊</button>}
        </ImCard>
      </div>

      <PromptSheet
        open={prompt === 'name'}
        title="修改群名称"
        initial={group.name}
        placeholder="输入群名称"
        onClose={() => setPrompt(null)}
        onSubmit={(v) => { useImStore.getState().updateGroup(groupId, { name: v }); showToast('群名称已更新'); }}
      />
      <PromptSheet
        open={prompt === 'nick'}
        title="我在本群的昵称"
        initial={group.nicks?.['me'] ?? ''}
        placeholder="输入昵称"
        onClose={() => setPrompt(null)}
        onSubmit={(v) => { useImStore.getState().setGroupNick(groupId, 'me', v); showToast('昵称已保存'); }}
      />

      {/* 名单管理 */}
      <ImSheet open={!!sheet} onClose={() => setSheet(null)} title={sheet === 'add' ? '添加成员' : sheet === 'mute' ? '禁言名单' : sheet === 'allow' ? '发言白名单' : '黑名单'}>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {sheet === 'add' ? (
            <div className="space-y-1">
              {state.contacts.filter((c) => c.id !== 'me' && !group.members.includes(c.id)).map((c) => (
                <button key={c.id} onClick={() => { useImStore.getState().addGroupMembers(groupId, [c.id]); showToast(`已添加 ${displayName(state, c.id)}`); setSheet(null); }} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left">
                  <ImAvatar id={c.id} name={displayName(state, c.id)} size={34} />
                  <span className="min-w-0 flex-1 truncate text-[14px] text-[#323233]">{displayName(state, c.id)}</span>
                  <UserPlus size={16} className="text-[#f53a71]" />
                </button>
              ))}
              {state.contacts.filter((c) => c.id !== 'me' && !group.members.includes(c.id)).length === 0 && <ImEmpty title="没有可添加的成员" />}
            </div>
          ) : (
            <>
              {listUsers.map((id) => (
                <div key={id} className="flex items-center gap-3 border-b border-[#f2f3f5] py-2">
                  <ImAvatar id={id} name={displayName(state, id)} size={34} />
                  <span className="min-w-0 flex-1 truncate text-[14px] text-[#323233]">{displayName(state, id)}</span>
                  <button onClick={() => {
                    if (sheet === 'mute') useImStore.getState().muteGroupMember(groupId, id, false);
                    if (sheet === 'allow') useImStore.getState().updateGroup(groupId, { allowlist: (group.allowlist ?? []).filter((x) => x !== id) });
                    if (sheet === 'black') useImStore.getState().updateGroup(groupId, { blacklist: group.blacklist.filter((x) => x !== id) });
                    showToast('已移出名单');
                  }} className="shrink-0 rounded-lg bg-[#f2f3f5] px-2 py-1 text-[12px] text-[#646566]">移出</button>
                </div>
              ))}
              {listUsers.length === 0 && <ImEmpty title="名单为空" desc="可在群成员页长按成员加入名单" />}
            </>
          )}
        </div>
      </ImSheet>

      <ImConfirm open={!!confirm} title={confirmText.title} desc={confirmText.desc} danger onCancel={() => setConfirm(null)} onConfirm={confirmText.ok} />
      <ImToast text={toast} />
    </div>
  );
}

/* ------------------------------ 群成员 ------------------------------ */

export function GroupMembersPage() {
  const { groupId = '' } = useParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [sheetUser, setSheetUser] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const group = getGroup(state, groupId);
  if (!group) return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="群成员" /><ImEmpty title="群聊不存在" /></div>;
  const role = groupRole(state, groupId);
  const canManage = role === 'owner' || role === 'admin';

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title={`群成员（${group.members.length}）`} right={<button onClick={() => setAddOpen(true)} className="text-[13px] text-[#f53a71]">添加</button>} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="bg-white">
          {group.members.map((id) => {
            const muted = isMutedInGroup(state, groupId, id);
            return (
              <button key={id} onClick={() => id !== 'me' && canManage && setSheetUser(id)} onContextMenu={(e) => { e.preventDefault(); setSheetUser(id); }} className="flex w-full items-center gap-3 border-b border-[#f2f3f5] px-4 py-2.5 text-left">
                <ImAvatar id={id} name={displayName(state, id)} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[14px] text-[#323233]">{group.nicks?.[id] || displayName(state, id)}</span>
                    {group.owner === id && <span className="flex items-center gap-0.5 rounded bg-[#fffbe8] px-1 text-[10px] text-[#f5bc0e]"><Crown size={10} /> 群主</span>}
                    {group.admins.includes(id) && <span className="rounded bg-[#f2f3f5] px-1 text-[10px] text-[#646566]">管理员</span>}
                    {muted && <span className="rounded bg-[#f2f3f5] px-1 text-[10px] text-[#969799]">禁言</span>}
                  </span>
                  <span className="block truncate text-[12px] text-[#969799]">{state.contacts.find((c) => c.id === id)?.job ?? '成员'}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ImSheet open={!!sheetUser} onClose={() => setSheetUser(null)} title={sheetUser ? displayName(state, sheetUser) : ''}>
        {sheetUser && (
          <div className="grid grid-cols-2 gap-2 p-4">
            <SheetBtn label="发消息" onClick={() => { const sid = useImStore.getState().createSingleSession(sheetUser); setSheetUser(null); navigate(`/app/messages/session/${sid}`); }} />
            <SheetBtn label={group.admins.includes(sheetUser) ? '取消管理员' : '设为管理员'} onClick={() => { useImStore.getState().setGroupAdmin(groupId, sheetUser, !group.admins.includes(sheetUser)); showToast('已更新'); setSheetUser(null); }} />
            <SheetBtn label={group.muted.includes(sheetUser) ? '解除禁言' : '禁言'} onClick={() => { useImStore.getState().muteGroupMember(groupId, sheetUser, !group.muted.includes(sheetUser)); showToast('已更新'); setSheetUser(null); }} />
            <SheetBtn label="加入白名单" onClick={() => { useImStore.getState().updateGroup(groupId, { allowlist: Array.from(new Set([...(group.allowlist ?? []), sheetUser])) }); showToast('已加入'); setSheetUser(null); }} />
            <SheetBtn label="移出群聊" danger onClick={() => { useImStore.getState().removeGroupMember(groupId, sheetUser); showToast('已移出'); setSheetUser(null); }} />
            <SheetBtn label="拉入黑名单" danger onClick={() => { useImStore.getState().updateGroup(groupId, { blacklist: Array.from(new Set([...group.blacklist, sheetUser])) }); useImStore.getState().removeGroupMember(groupId, sheetUser); showToast('已拉黑'); setSheetUser(null); }} />
          </div>
        )}
      </ImSheet>

      <ImSheet open={addOpen} onClose={() => setAddOpen(false)} title="添加成员">
        <div className="max-h-[55vh] overflow-y-auto p-4">
          {state.contacts.filter((c) => c.id !== 'me' && !group.members.includes(c.id)).map((c) => (
            <button key={c.id} onClick={() => { useImStore.getState().addGroupMembers(groupId, [c.id]); showToast('已添加'); setAddOpen(false); }} className="flex w-full items-center gap-3 py-2 text-left">
              <ImAvatar id={c.id} name={displayName(state, c.id)} size={34} />
              <span className="min-w-0 flex-1 truncate text-[14px] text-[#323233]">{displayName(state, c.id)}</span>
              <Plus size={16} className="text-[#f53a71]" />
            </button>
          ))}
        </div>
      </ImSheet>
      <ImToast text={toast} />
    </div>
  );
}

function SheetBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return <button onClick={onClick} className={`rounded-xl py-2.5 text-[13px] ${danger ? 'bg-[#f35f5f]/10 text-[#f35f5f]' : 'bg-[#f2f3f5] text-[#323233]'}`}>{label}</button>;
}

/* ------------------------------ 群文件 ------------------------------ */

export function GroupFilesPage() {
  const { groupId = '' } = useParams();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const group = getGroup(state, groupId);
  if (!group) return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="群文件" /><ImEmpty title="群聊不存在" /></div>;
  const upload = () => {
    useImStore.getState().addGroupFile(groupId, { name: `共享文件-${Date.now().toString().slice(-4)}.pdf`, size: '256 KB', from: 'me', time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) });
    showToast('演示文件已上传');
  };

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title={`群文件（${group.files.length}）`} right={<button onClick={upload} className="text-[13px] text-[#f53a71]">上传</button>} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="bg-white">
          {group.files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 border-b border-[#f2f3f5] px-4 py-3">
              <FileText size={22} className="shrink-0 text-[#2e71ff]" />
              <button onClick={() => showToast(`演示下载：${f.name}`)} className="min-w-0 flex-1 text-left">
                <div className="truncate text-[14px] text-[#323233]">{f.name}</div>
                <div className="text-[11px] text-[#969799]">{f.size} · {displayName(state, f.from)} · {f.time}</div>
              </button>
              <button onClick={() => { useImStore.getState().removeGroupFile(groupId, f.id); showToast('已移除'); }} className="shrink-0 text-[12px] text-[#969799]">删除</button>
            </div>
          ))}
          {group.files.length === 0 && <ImEmpty title="暂无群文件" desc="点击右上角上传演示文件" />}
        </div>
      </div>
      <div className="shrink-0 border-t border-[#ebedf0] bg-white p-3"><ImPrimaryButton onClick={upload}>上传演示文件</ImPrimaryButton></div>
      <ImToast text={toast} />
    </div>
  );
}

/* ------------------------------ 群公告 ------------------------------ */

export function GroupNoticePage() {
  const { groupId = '' } = useParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const group = getGroup(state, groupId);
  const [value, setValue] = useState(group?.notice ?? '');
  if (!group) return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="群公告" /><ImEmpty title="群聊不存在" /></div>;
  const canEdit = ['owner', 'admin'].includes(groupRole(state, groupId));

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="群公告" />
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!canEdit}
          placeholder="输入群公告"
          className="h-48 w-full resize-none rounded-2xl bg-white p-4 text-[14px] leading-6 text-[#323233] outline-none disabled:opacity-70"
        />
        {!canEdit && <div className="mt-2 text-center text-[12px] text-[#969799]">仅群主或管理员可编辑公告</div>}
      </div>
      <div className="shrink-0 border-t border-[#ebedf0] bg-white p-3">
        <ImPrimaryButton onClick={() => { useImStore.getState().updateGroup(groupId, { notice: value.trim() }); showToast('公告已发布'); navigate(`/app/messages/group/${groupId}`); }} disabled={!canEdit}>发布公告</ImPrimaryButton>
      </div>
      <ImToast text={toast} />
    </div>
  );
}

/* ------------------------------ 加群设置 ------------------------------ */

const JOIN_OPTIONS: { key: JoinSetting; label: string; desc: string }[] = [
  { key: 'all', label: '无需审批', desc: '任何人可直接加入' },
  { key: 'approve', label: '需要审批', desc: '由群主或管理员确认' },
  { key: 'admin-only', label: '仅管理员邀请', desc: '不允许主动申请' },
  { key: 'member-invite', label: '成员邀请', desc: '群成员可邀请好友' },
];

export function GroupJoinSettingsPage() {
  const { groupId = '' } = useParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const group = getGroup(state, groupId);
  const [setting, setSetting] = useState<JoinSetting>(group?.joinSetting ?? 'approve');
  const [searchable, setSearchable] = useState(group?.searchable ?? true);
  const [cap, setCap] = useState(String(group?.memberCap ?? 500));
  if (!group) return <div className="flex h-full flex-col bg-[#f7f8fa]"><ImPageHeader title="加群设置" /><ImEmpty title="群聊不存在" /></div>;

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title="加群设置" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ImCard><ImToggleRow label="允许被搜索到" checked={searchable} onChange={() => setSearchable((v) => !v)} /></ImCard>
        <ImCard>
          {JOIN_OPTIONS.map((o, i) => (
            <div key={o.key}>
              {i > 0 && <div className="mx-4 h-px bg-[#ebedf0]" />}
              <button onClick={() => setSetting(o.key)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] text-[#323233]">{o.label}</span>
                  <span className="block text-[12px] text-[#969799]">{o.desc}</span>
                </span>
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${setting === o.key ? 'border-[#f53a71] bg-[#f53a71] text-white' : 'border-[#c8c9cc]'}`}>
                  {setting === o.key && <Check size={13} />}
                </span>
              </button>
            </div>
          ))}
        </ImCard>
        <ImCard>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] text-[#323233]">成员上限</span>
            <input value={cap} onChange={(e) => setCap(e.target.value.replace(/\D/g, ''))} className="h-8 w-20 rounded-lg bg-[#f2f3f5] px-2 text-right text-[14px] outline-none" />
          </div>
        </ImCard>
        <div className="px-5 py-3 text-center text-[11px] text-[#c8c9cc]">上限范围 2 ~ 2000 人</div>
      </div>
      <div className="shrink-0 border-t border-[#ebedf0] bg-white p-3">
        <ImPrimaryButton onClick={() => {
          const value = Math.min(2000, Math.max(2, Number(cap) || 500));
          useImStore.getState().setGroupJoinSetting(groupId, { joinSetting: setting, searchable, memberCap: value });
          showToast('加群设置已保存');
          navigate(`/app/messages/group/${groupId}`);
        }}>保存设置</ImPrimaryButton>
      </div>
      <ImToast text={toast} />
    </div>
  );
}

