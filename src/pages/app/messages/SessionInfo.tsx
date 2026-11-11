import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pin, Star, BellOff, Trash2, Eraser, Users, FileText, Search, Megaphone, Settings2, MessageSquare, ShieldCheck } from 'lucide-react';
import { useImStore } from '@/store/imStore';
import { getSession, sessionIcon, sessionTitle } from '@/store/imSelectors';
import { ImAvatar, ImCard, ImConfirm, ImEmpty, ImPageHeader, ImRow, ImToast, ImToggleRow } from './imComponents';
import { useImSnapshot, useToast } from './imHooks';

export default function SessionInfo() {
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const state = useImSnapshot();
  const { toast, showToast } = useToast();
  const [confirm, setConfirm] = useState<null | { action: 'clear' | 'remove'; title: string; desc: string }>(null);
  const session = getSession(state, sessionId);

  if (!session) {
    return (
      <div className="flex h-full flex-col bg-[#f7f8fa]">
        <ImPageHeader title="会话信息" />
        <ImEmpty title="会话不存在" />
      </div>
    );
  }

  const isGroup = session.type === 'group';
  const isApp = session.type === 'im-app';
  const group = isGroup ? state.groups.find((g) => g.id === session.targetId) : undefined;
  const person = !isGroup ? state.contacts.find((c) => c.id === session.targetId) : undefined;
  const app = isApp ? state.imApps.find((a) => a.id === session.targetId) : undefined;
  const title = sessionTitle(state, session);
  const icon = sessionIcon(state, session);

  const doAction = () => {
    if (confirm?.action === 'clear') useImStore.getState().clearSession(sessionId);
    if (confirm?.action === 'remove') useImStore.getState().removeSession(sessionId);
    setConfirm(null);
    showToast(confirm?.action === 'clear' ? '聊天记录已清空' : '会话已删除');
    navigate('/app/messages');
  };

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      <ImPageHeader title={isApp ? '应用消息设置' : isGroup ? '群信息' : '会话信息'} backTo={`/app/messages/session/${sessionId}`} />

      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
        <ImCard className="flex flex-col items-center px-4 py-6 text-center">
          <ImAvatar id={session.targetId} name={title} isGroup={isGroup} size={64} icon={icon || undefined} />
          <div className="mt-3 max-w-full truncate text-[16px] font-medium text-[#323233]">{title}</div>
          {person && <div className="mt-1 text-[13px] text-[#969799]">{person.job} · {person.deptPath}</div>}
          {group && (
            <div className="mt-1 flex items-center gap-1 text-[13px] text-[#969799]">
              <Users size={14} /> {group.members.length} 人 · {group.type}
            </div>
          )}
          {app && <div className="mt-1 text-[13px] text-[#969799]">{app.desc}</div>}
        </ImCard>

        {/* 群资料完整入口 */}
        {isGroup && group && (
          <ImCard>
            <ImRow icon={<Users size={17} />} label="群成员" value={`${group.members.length} 人`} onClick={() => navigate(`/app/messages/group/${group.id}/members`)} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow icon={<Settings2 size={17} />} label="群资料" value={group.name} onClick={() => navigate(`/app/messages/group/${group.id}`)} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow icon={<Megaphone size={17} />} label="群公告" value={group.notice || '暂无'} onClick={() => navigate(`/app/messages/group/${group.id}/notice`)} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow icon={<FileText size={17} />} label="群文件" value={`${group.files.length} 个`} onClick={() => navigate(`/app/messages/group/${group.id}/files`)} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow icon={<ShieldCheck size={17} />} label="加群设置" onClick={() => navigate(`/app/messages/group/${group.id}/join-settings`)} />
          </ImCard>
        )}

        {!isGroup && !isApp && person && (
          <ImCard>
            <ImRow icon={<Users size={17} />} label="联系人资料" value={person.name} onClick={() => navigate(`/app/messages/contacts/${person.id}`)} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <ImRow icon={<MessageSquare size={17} />} label="发送消息" onClick={() => navigate(`/app/messages/session/${sessionId}`)} />
          </ImCard>
        )}

        {isApp && (
          <ImCard>
            <ImToggleRow icon={<BellOff size={17} />} label="接收应用消息" checked={!!session.receive} onChange={() => { useImStore.getState().setAppReceive(sessionId, !session.receive); showToast(session.receive ? '已关闭接收' : '已开启接收'); }} />
            <div className="mx-4 h-px bg-[#ebedf0]" />
            <div className="px-4 py-3 text-[12px] leading-5 text-[#969799]">关闭后不再接收该应用推送，已有消息仍可查看。应用菜单接口为演示数据。</div>
          </ImCard>
        )}

        <ImCard>
          <ImToggleRow icon={<Pin size={17} />} label="置顶会话" checked={!!session.pinned} onChange={() => useImStore.getState().togglePin(sessionId)} />
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <ImToggleRow icon={<Star size={17} />} label="星标会话" checked={!!session.starred} onChange={() => useImStore.getState().toggleStar(sessionId)} />
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <ImToggleRow icon={<BellOff size={17} />} label="消息免打扰" checked={!!session.mute} onChange={() => useImStore.getState().toggleMute(sessionId)} />
        </ImCard>

        <ImCard>
          <ImRow icon={<Search size={17} />} label="查找聊天记录" onClick={() => navigate(`/app/messages/history/${sessionId}`)} />
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <ImRow icon={<Pin size={17} />} label="置顶消息" value={`${session.pins?.length ?? 0} 条`} onClick={() => navigate(`/app/messages/pins/${sessionId}`)} />
          {isGroup && (
            <>
              <div className="mx-4 h-px bg-[#ebedf0]" />
              <ImRow icon={<Users size={17} />} label="已读回执说明" value="群消息可见" onClick={() => showToast('在聊天页点击自己消息下方的「N 人未读」可查看回执')} />
            </>
          )}
        </ImCard>

        <ImCard>
          <button onClick={() => setConfirm({ title: '清空聊天记录', desc: '清空后将删除本会话全部消息，且无法恢复。', action: 'clear' })} className="flex w-full items-center gap-2 px-4 py-3 text-[14px] text-[#f53a71]">
            <Eraser size={17} /> 清空聊天记录
          </button>
          <div className="mx-4 h-px bg-[#ebedf0]" />
          <button onClick={() => setConfirm({ title: '删除会话', desc: '删除后将从消息列表移除该会话。', action: 'remove' })} className="flex w-full items-center gap-2 px-4 py-3 text-[14px] text-[#f53a71]">
            <Trash2 size={17} /> 删除会话
          </button>
        </ImCard>

        <div className="px-5 py-4 text-center text-[11px] text-[#c8c9cc]">设置已本地保存，刷新页面后仍保留</div>
      </div>

      <ImConfirm
        open={!!confirm}
        title={confirm?.title ?? ''}
        desc={confirm?.desc ?? ''}
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={doAction}
      />
      <ImToast text={toast} />
    </div>
  );
}
