import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronRight, ChevronDown, Building2, MessageSquare, Users, Video, Star,
} from 'lucide-react';
import {
  contactDirectory, CONTACT_ORG_ROOT, countContactOrgMembers,
  type ContactPerson, type ContactOrgNode,
} from '@/data/contactDirectory';
import { getInitialsAvatar } from '@/data/people';
import { useContactDirectoryStore } from '@/store/contactDirectoryStore';
import { openChatWithContact } from '@/utils/contactMessaging';
import ContactPicker from '@/components/ContactPicker';

/** 在线状态演示标注（无真实在线服务） */
const STATUS_META: Record<NonNullable<ContactPerson['status']>, { label: string; dot: string; text: string }> = {
  online: { label: '在线', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  busy: { label: '忙碌', dot: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  away: { label: '离开', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  offline: { label: '离线', dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-400' },
};

const SEARCH_LIMIT = 100;

type SearchHit = { person: ContactPerson; hitField: string };

/** 搜索：姓名完整优先 → 手机号/账号 → 部门/职位；trim + 忽略大小写 */
function searchContacts(keywordRaw: string): SearchHit[] {
  const kw = keywordRaw.trim().toLowerCase();
  if (!kw) return [];
  const hits: SearchHit[] = [];
  for (const person of contactDirectory) {
    const account = person.account ?? '';
    let hitField = '';
    if (person.name.toLowerCase() === kw) hitField = '姓名完整命中';
    else if (person.name.toLowerCase().includes(kw)) hitField = '姓名';
    else if (person.mobile.replace(/\*/g, '').includes(kw.replace(/\*/g, ''))) hitField = '手机号';
    else if (account.toLowerCase().includes(kw)) hitField = '账号';
    else if (person.email.toLowerCase().includes(kw)) hitField = '邮箱';
    else if (person.department.toLowerCase().includes(kw)) hitField = '部门';
    else if (person.title.toLowerCase().includes(kw)) hitField = '职位';
    if (hitField) hits.push({ person, hitField });
    if (hits.length >= SEARCH_LIMIT) break;
  }
  return hits;
}

export default function Contacts() {
  const navigate = useNavigate();
  const { preferences, setNote, toggleSpecialReminder } = useContactDirectoryStore();

  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState<'org' | 'groups'>('org');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([CONTACT_ORG_ROOT.id]));
  const [selectedDeptId, setSelectedDeptId] = useState<string>(CONTACT_ORG_ROOT.id);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [groupPickerOpen, setGroupPickerOpen] = useState(false);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const showToast = (text: string) => { setToast(text); window.setTimeout(() => setToast(''), 2200); };

  const isSearching = keyword.trim().length > 0;
  const searchHits = useMemo(() => searchContacts(keyword), [keyword]);

  const flattenNodes = useMemo(() => {
    const out: ContactOrgNode[] = [];
    const walk = (node: ContactOrgNode) => { out.push(node); (node.children ?? []).forEach(walk); };
    walk(CONTACT_ORG_ROOT);
    return out;
  }, []);
  const nodeById = useMemo(() => new Map(flattenNodes.map(n => [n.id, n])), [flattenNodes]);

  /** 当前部门成员（搜索态下为搜索结果） */
  const members: Array<{ person: ContactPerson; hitField?: string }> = useMemo(() => {
    if (isSearching) return searchHits.map(h => ({ person: h.person, hitField: h.hitField }));
    const node = nodeById.get(selectedDeptId) ?? CONTACT_ORG_ROOT;
    const ids = new Set(node.memberIds ?? []);
    (node.children ?? []).forEach(c => (c.memberIds ?? []).forEach(id => ids.add(id)));
    return contactDirectory.filter(p => ids.has(p.id)).map(person => ({ person }));
  }, [isSearching, searchHits, selectedDeptId, nodeById]);

  // 部门切换/搜索后默认选中第一位；保持选中有效性
  const effectiveSelectedId = selectedContactId && members.some(m => m.person.id === selectedContactId)
    ? selectedContactId
    : members[0]?.person.id ?? null;
  const selected = effectiveSelectedId ? contactDirectory.find(p => p.id === effectiveSelectedId) ?? null : null;
  const pref = selected ? preferences[selected.id] ?? { note: '', specialReminder: false } : { note: '', specialReminder: false };
  const noteValue = noteDraft ?? pref.note;

  const selectDept = (id: string) => { setSelectedDeptId(id); setSelectedContactId(null); };
  const toggleExpand = (id: string) => setExpandedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const openOrgNode = (node: ContactOrgNode) => {
    if (node.children?.length && !expandedIds.has(node.id)) toggleExpand(node.id);
    selectDept(node.id);
  };

  const startMeeting = (person: ContactPerson) => {
    navigate('/pc_client/meetings', {
      state: {
        startMeeting: {
          conversationName: person.name,
          participants: [person.name],
        },
      },
    });
  };

  const createGroupChat = () => {
    if (!selected) return;
    if (groupMembers.length < 2) { showToast('请至少再选择一名成员'); return; }
    // 消息模块现阶段没有可复用的真实群聊创建模型（2026-11-17 整改）：
    // 保留按钮与选人弹窗，确认时诚实提示暂未开放；不落单聊、不伪造群名、不写入会话数据。
    showToast('群聊创建功能暂未开放');
    setGroupPickerOpen(false);
    setGroupMembers([]);
  };

  return (
    <div className="flex h-full min-w-0 gap-0 overflow-hidden">
      {/* ===== 第一栏：组织与搜索 ===== */}
      <aside className="flex w-[280px] min-w-[240px] flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-100 p-3 dark:border-gray-800">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索姓名、手机号、账号"
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-8 text-sm text-gray-900 outline-none focus:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              aria-label="搜索联系人"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="清空搜索"
              >×</button>
            )}
          </div>
        </div>

        {!isSearching && (
          <div className="flex gap-1 px-3 pt-3">
            {([['org', '组织架构'], ['groups', '我的群组']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${tab === key
                  ? 'bg-theme-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
              >{label}</button>
            ))}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          {isSearching ? (
            <p className="px-4 py-6 text-center text-xs text-gray-400">
              搜索结果 {searchHits.length} 人{searchHits.length >= SEARCH_LIMIT ? `（已达 ${SEARCH_LIMIT} 人上限）` : ''}
            </p>
          ) : tab === 'org' ? (
            <OrgTree
              node={CONTACT_ORG_ROOT}
              depth={0}
              expandedIds={expandedIds}
              selectedDeptId={selectedDeptId}
              onToggle={toggleExpand}
              onOpen={openOrgNode}
            />
          ) : (
            <div className="px-3 py-6 text-center text-xs text-gray-400">
              我的群组浏览暂未开放<br />（群组数据可在消息页查看）
            </div>
          )}
        </div>
      </aside>

      {/* ===== 第二栏：成员列表 ===== */}
      <section className="flex w-[260px] min-w-[220px] flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {isSearching ? '搜索结果' : nodeById.get(selectedDeptId)?.name ?? '成员'}
          </span>
          <span className="text-xs text-gray-400">{members.length} 人</span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {members.map(({ person, hitField }) => {
            const active = person.id === effectiveSelectedId;
            const status = person.status ?? 'offline';
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => { setSelectedContactId(person.id); setNoteDraft(null); }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${active
                  ? 'bg-theme-50 dark:bg-theme-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <span className="relative">
                  <img src={getInitialsAvatar(person.name, 'ec4899')} alt="" className="h-9 w-9 rounded-full" />
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900 ${STATUS_META[status].dot}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{person.name}</span>
                  <span className="block truncate text-xs text-gray-400">
                    {hitField ? <span className="text-theme-600 dark:text-theme-400">{hitField} · </span> : null}
                    {person.title} · {person.department}
                  </span>
                </span>
              </button>
            );
          })}
          {members.length === 0 && (
            <div className="px-4 py-10 text-center text-xs text-gray-400">
              {isSearching ? '未找到相关联系人' : '该部门暂无成员'}
              {isSearching && (
                <button type="button" onClick={() => setKeyword('')} className="mt-2 block w-full text-theme-600 hover:underline dark:text-theme-400">清空搜索</button>
              )}
            </div>
          )}
        </div>
        <p className="border-t border-gray-100 px-4 py-1.5 text-center text-[10px] text-gray-300 dark:border-gray-800 dark:text-gray-600">在线状态为演示数据（mock）</p>
      </section>

      {/* ===== 第三栏：联系人详情 ===== */}
      <section className="min-w-[460px] flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        {selected ? (
          <div className="mx-auto max-w-2xl p-6">
            {/* 头部 */}
            <div className="flex items-center gap-4">
              <span className="relative">
                <img src={getInitialsAvatar(selected.name, 'ec4899')} alt="" className="h-16 w-16 rounded-full" />
                <span className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-950 ${STATUS_META[selected.status ?? 'offline'].dot}`} />
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {selected.name}
                  {pref.specialReminder && <Star size={15} className="fill-amber-400 text-amber-400" aria-label="特别提醒已开启" />}
                </h1>
                <p className={`text-sm ${STATUS_META[selected.status ?? 'offline'].text}`}>{STATUS_META[selected.status ?? 'offline'].label} · 演示状态</p>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{selected.title} · {selected.department} · {selected.organizationUnit}</p>
              </div>
            </div>

            {/* 资料字段 */}
            <dl className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              {([
                ['账号', selected.account ?? '-'],
                ['手机', selected.mobile],
                ['座机', selected.officePhone],
                ['邮箱', selected.email],
                ['部门', `${selected.department} / ${selected.organizationUnit}`],
                ['工号', selected.employeeNo],
              ] as const).map(([label, value], i) => (
                <div key={label} className={`flex items-center justify-between gap-6 px-5 py-3 ${i > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}>
                  <dt className="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
                  <dd className="truncate text-sm text-gray-900 dark:text-gray-100">{value}</dd>
                </div>
              ))}
              {/* 备注：行内编辑 */}
              <div className="flex items-center justify-between gap-6 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
                <dt className="text-sm text-gray-500 dark:text-gray-400">备注</dt>
                <dd className="flex min-w-0 flex-1 justify-end">
                  <input
                    value={noteValue}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    onBlur={() => { if (noteDraft !== null && noteDraft !== pref.note) { setNote(selected.id, noteDraft); showToast('备注已保存'); } setNoteDraft(null); }}
                    placeholder="点击添加备注"
                    className="w-full max-w-[280px] rounded border border-transparent bg-transparent px-2 py-1 text-right text-sm text-gray-900 outline-none hover:border-gray-200 focus:border-theme-500 dark:text-gray-100 dark:hover:border-gray-700"
                  />
                </dd>
              </div>
              {/* 特别提醒 */}
              <div className="flex items-center justify-between gap-6 border-t border-gray-100 px-5 py-3 dark:border-gray-800">
                <dt className="text-sm text-gray-500 dark:text-gray-400">特别提醒</dt>
                <dd>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={pref.specialReminder}
                    aria-label="特别提醒"
                    onClick={() => toggleSpecialReminder(selected.id)}
                    className={`relative h-6 w-11 rounded-full transition ${pref.specialReminder ? 'bg-theme-600' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${pref.specialReminder ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                </dd>
              </div>
            </dl>

            {/* 底部操作 */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => openChatWithContact(selected.name, (path) => navigate(path))}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-theme-600 text-sm font-medium text-white transition hover:bg-theme-700"
              ><MessageSquare size={16} /> 发消息</button>
              <button
                type="button"
                onClick={() => { setGroupMembers([selected.name]); setGroupPickerOpen(true); }}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-theme-600 text-sm font-medium text-theme-600 transition hover:bg-theme-50 dark:text-theme-400 dark:hover:bg-theme-900/20"
              ><Users size={16} /> 发起群聊</button>
              <button
                type="button"
                onClick={() => startMeeting(selected)}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-theme-600 text-sm font-medium text-theme-600 transition hover:bg-theme-50 dark:text-theme-400 dark:hover:bg-theme-900/20"
              ><Video size={16} /> 视频会议</button>
            </div>
            <p className="mt-3 text-center text-[11px] text-gray-400">视频会议将带入当前联系人为参会人 · 群聊创建功能暂未开放</p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            {isSearching ? '无匹配联系人' : '请选择部门或成员'}
          </div>
        )}
      </section>

      {/* 群聊选人弹层：ContactPicker（当前联系人锁定） */}
      {groupPickerOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setGroupPickerOpen(false)}>
          <div className="w-[480px] max-w-[90vw] rounded-xl bg-white p-5 shadow-xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">发起群聊</h2>
            <p className="mb-4 text-xs text-gray-400">群聊创建功能暂未开放 · 当前联系人「{selected.name}」已锁定，可先选择成员</p>
            <ContactPicker
              selected={groupMembers}
              onChange={setGroupMembers}
              lockedNames={[selected.name]}
              placeholder="搜索添加成员"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setGroupPickerOpen(false)} className="h-9 rounded border border-gray-200 px-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">取消</button>
              <button
                type="button"
                onClick={createGroupChat}
                disabled={groupMembers.length < 2}
                className="h-9 rounded bg-theme-600 px-5 text-sm font-medium text-white transition hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-50"
              >确认创建（暂未开放）</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900/90 px-4 py-2 text-sm text-white shadow-lg dark:bg-gray-100/95 dark:text-gray-900">{toast}</div>
      )}
    </div>
  );
}

/** 组织树（递归渲染） */
function OrgTree({
  node, depth, expandedIds, selectedDeptId, onToggle, onOpen,
}: {
  node: ContactOrgNode;
  depth: number;
  expandedIds: Set<string>;
  selectedDeptId: string;
  onToggle: (id: string) => void;
  onOpen: (node: ContactOrgNode) => void;
}) {
  const hasChildren = !!node.children?.length;
  const expanded = expandedIds.has(node.id);
  const selected = selectedDeptId === node.id;
  return (
    <div>
      <div
        className={`flex items-center gap-1 rounded-md pr-2 transition ${selected
          ? 'bg-theme-50 dark:bg-theme-900/25'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-label={expanded ? `收起${node.name}` : `展开${node.name}`}
            aria-expanded={expanded}
            className="flex h-8 w-6 items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-6" />
        )}
        <button
          type="button"
          onClick={() => onOpen(node)}
          className={`flex min-w-0 flex-1 items-center gap-2 py-2 text-left text-sm ${selected
            ? 'font-medium text-theme-700 dark:text-theme-300'
            : 'text-gray-700 dark:text-gray-200'}`}
        >
          {depth === 0 ? <Building2 size={15} className="flex-none text-gray-400" /> : null}
          <span className="truncate">{node.name}</span>
          <span className="ml-auto flex-none text-xs text-gray-400">{countContactOrgMembers(node)} 人</span>
        </button>
      </div>
      {expanded && node.children?.map(child => (
        <OrgTree
          key={child.id}
          node={child}
          depth={depth + 1}
          expandedIds={expandedIds}
          selectedDeptId={selectedDeptId}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
