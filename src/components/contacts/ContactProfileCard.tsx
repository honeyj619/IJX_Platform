import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, Copy, Ellipsis, MessageSquare, Phone, Video, X,
} from 'lucide-react';
import type { ContactPerson } from '@/data/contactDirectory';
import { useContactDirectoryStore } from '@/store/contactDirectoryStore';
import { openChatWithContact } from '@/utils/contactMessaging';
import Modal from '@/components/interaction/Modal';
import { CONTACT_STATUS_DOT, CONTACT_STATUS_LABEL } from '@/constants/contactStatus';
import ContactAvatar from './ContactAvatar';
import ContactMoreMenu from './ContactMoreMenu';

const EMPTY_PREF = { note: '', specialReminder: false, starred: false };

interface ContactProfileCardProps {
  open: boolean;
  person: ContactPerson | null;
  onClose: () => void;
  onToast: (text: string) => void;
  /** 关闭名片并定位到该联系人所属部门 */
  onEnterDepartment: (person: ContactPerson) => void;
}

/**
 * 联系人名片弹框卡片（参考飞书联系人名片）：
 * 居中浮层卡片，顶部氛围头 + 大头像 + 身份区，中部三操作块与信息行。
 */
export default function ContactProfileCard({ open, person, onClose, onToast, onEnterDepartment }: ContactProfileCardProps) {
  const navigate = useNavigate();
  const { preferences, setNote, toggleSpecialReminder, toggleStarred } = useContactDirectoryStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  /** 更多资料默认收起：保持名片一屏可见核心信息，详细资料按需展开 */
  const [moreOpen, setMoreOpen] = useState(false);
  /** 手机号默认隐藏，点击「查看」后才显示 */
  const [mobileRevealed, setMobileRevealed] = useState(false);

  const personId = person?.id;
  useEffect(() => {
    setMenuOpen(false);
    setEditingNote(false);
    setNoteDraft('');
    setMoreOpen(false);
    setMobileRevealed(false);
  }, [personId, open]);

  const pref = (person && preferences[person.id]) || EMPTY_PREF;

  const toastUnavailable = (text: string) => {
    setMenuOpen(false);
    onToast(text);
  };

  const copyText = async (value: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(value);
      onToast('已添加到剪贴板');
    } catch {
      onToast('复制失败，请手动选择文本');
    }
  };

  const commitNote = () => {
    if (!person) return;
    if (noteDraft !== pref.note) {
      setNote(person.id, noteDraft);
      onToast('备注已保存');
    }
    setEditingNote(false);
  };

  const sendMessage = () => {
    if (!person) return;
    openChatWithContact(person.name, (path) => navigate(path));
    onClose();
  };

  const startVideoMeeting = () => {
    if (!person) return;
    navigate('/pc_client/meetings', {
      state: { startMeeting: { conversationName: person.name, participants: [person.name] } },
    });
    onClose();
  };

  const header = person ? (
    <div className="shrink-0">
      <div className="ambiance-brand ambiance-brand-lead relative h-[96px]">
        <div className="absolute inset-0 bg-white/25 dark:bg-black/30" aria-hidden="true" />
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              title="更多操作"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-white/75 text-[var(--ui-text-body)] shadow-sm backdrop-blur transition hover:bg-white dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900/85"
            >
              <Ellipsis size={16} />
            </button>
            <ContactMoreMenu
              open={menuOpen}
              starred={pref.starred}
              onClose={() => setMenuOpen(false)}
              onToggleStar={() => {
                toggleStarred(person.id);
                setMenuOpen(false);
                onToast(pref.starred ? '已取消星标' : '已设为星标联系人');
              }}
              onShare={() => toastUnavailable('分享暂未开放')}
              onReport={() => toastUnavailable('举报暂未开放')}
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            title="关闭"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/70 bg-white/75 text-[var(--ui-text-body)] shadow-sm backdrop-blur transition hover:bg-white dark:border-gray-700 dark:bg-gray-900/60 dark:hover:bg-gray-900/85"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="px-5 pb-1">
        <div className="-mt-9 flex items-start gap-3">
          <ContactAvatar name={person.name} size={72} ringClassName="ring-4 ring-white dark:ring-gray-900" />
          <div className="min-w-0 flex-1 pt-10">
            <h2 className="truncate text-xl font-semibold text-[var(--ui-text-title)]">{person.name}</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--ui-text-weak)]">
              <span className={`inline-block h-2 w-2 rounded-full ${CONTACT_STATUS_DOT[person.status ?? 'offline']}`} aria-hidden="true" />
              {CONTACT_STATUS_LABEL[person.status ?? 'offline']}
            </p>
          </div>
        </div>
        {person.signature ? (
          <p className="mt-2 truncate text-sm text-[var(--ui-text-weak)]" title={person.signature}>{person.signature}</p>
        ) : null}
      </div>
    </div>
  ) : null;

  const body = person ? (
    <>
      <div className="grid grid-cols-3 gap-2.5 px-5 pt-4">
        {([
          { key: 'message', label: '消息', icon: MessageSquare, onClick: sendMessage },
          { key: 'voice', label: '语音', icon: Phone, onClick: () => onToast('语音通话暂未开放') },
          { key: 'video', label: '视频', icon: Video, onClick: startVideoMeeting },
        ] as const).map(({ key, label, icon: Icon, onClick }) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            className="flex h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl bg-[var(--ui-surface-selected)] text-[var(--ui-text-body)] transition hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Icon size={18} />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      <section className="mt-2 px-5">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <InfoRow label="日历">
            <button type="button" onClick={() => { navigate('/pc_client/calendar'); onClose(); }} className="text-theme-600 hover:underline dark:text-theme-400">查看日程</button>
          </InfoRow>
          <InfoRow label="部门">
            <button type="button" onClick={() => { onEnterDepartment(person); onClose(); }} className="flex max-w-full items-center gap-1 text-theme-600 hover:underline dark:text-theme-400">
              <span className="min-w-0 truncate">{person.department}</span>
              <ChevronRight size={13} className="shrink-0" />
            </button>
            <p className="mt-0.5 truncate text-sm text-[var(--ui-text-weak)]">{person.organizationUnit}</p>
          </InfoRow>
          <InfoRow label="职位">
            <span className="text-[var(--ui-text-body)]">{person.title}</span>
          </InfoRow>
          <InfoRow label="备注与描述">
            {editingNote ? (
              <input
                autoFocus
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                onBlur={commitNote}
                onKeyDown={(event) => { if (event.key === 'Enter') commitNote(); }}
                placeholder="添加备注"
                className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 text-sm text-[var(--ui-text-title)] outline-none focus:border-theme-400 dark:border-gray-700 dark:bg-gray-800"
              />
            ) : (
              <button
                type="button"
                onClick={() => { setNoteDraft(pref.note); setEditingNote(true); }}
                className={`block w-full truncate text-left hover:underline ${pref.note ? 'text-[var(--ui-text-body)]' : 'text-[var(--ui-text-weak)]'}`}
              >
                {pref.note || '编辑内容'}
              </button>
            )}
          </InfoRow>
          <InfoRow label="特别提醒">
            <button
              type="button"
              role="switch"
              aria-checked={pref.specialReminder}
              aria-label="特别提醒"
              onClick={() => toggleSpecialReminder(person.id)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${pref.specialReminder ? 'bg-theme-600' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${pref.specialReminder ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </InfoRow>
          <InfoRow label="更多资料">
            <button
              type="button"
              onClick={() => setMoreOpen((value) => !value)}
              aria-expanded={moreOpen}
              className="flex items-center gap-1 text-theme-600 hover:underline dark:text-theme-400"
            >
              {moreOpen ? '收起' : '账号、手机、邮箱等'}
              <ChevronDown size={13} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
          </InfoRow>
        </div>
      </section>

      {moreOpen ? (
        <section className="px-5 pb-4">
          <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
            <InfoRow label="账号">
              <ValueWithCopy label="账号" value={person.account ?? '-'} onCopy={copyText} />
            </InfoRow>
            <InfoRow label="手机">
              {mobileRevealed ? (
                <ValueWithCopy label="手机" value={person.mobile} onCopy={copyText} />
              ) : (
                <button
                  type="button"
                  onClick={() => setMobileRevealed(true)}
                  className="text-theme-600 hover:underline dark:text-theme-400"
                >查看</button>
              )}
            </InfoRow>
            {([
              ['座机', person.officePhone],
              ['邮箱', person.email],
              ['工号', person.employeeNo],
            ] as const).map(([label, value]) => (
              <InfoRow key={label} label={label}>
                <ValueWithCopy label={label} value={value} onCopy={copyText} />
              </InfoRow>
            ))}
          </div>
        </section>
      ) : null}
    </>
  ) : null;

  return (
    <Modal
      open={open && !!person}
      title={person?.name ?? '联系人'}
      onClose={onClose}
      widthClassName="max-w-[420px]"
      header={header}
    >
      {body}
    </Modal>
  );
}

/** 值 + 复制按钮：账号/座机/邮箱/工号共用（手机需先点击「查看」） */
function ValueWithCopy({ label, value, onCopy }: { label: string; value: string; onCopy: (value: string) => void }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="min-w-0 truncate text-[var(--ui-text-body)]" title={value}>{value}</span>
      <button
        type="button"
        onClick={() => onCopy(value)}
        title={`复制${label}`}
        aria-label={`复制${label}`}
        disabled={value === '-'}
        className="shrink-0 rounded p-0.5 text-[var(--ui-text-weak)] transition hover:text-[var(--ui-text-body)] disabled:opacity-40"
      >
        <Copy size={13} />
      </button>
    </span>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[46px] items-center gap-4 py-2">
      <span className="w-[86px] shrink-0 text-sm text-[var(--ui-text-weak)]">{label}</span>
      <div className="min-w-0 flex-1 py-0.5 text-sm">{children}</div>
    </div>
  );
}
