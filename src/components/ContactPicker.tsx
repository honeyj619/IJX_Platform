import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, FolderTree, Search, UserPlus, UserRound, Users, X } from 'lucide-react';
import { contactDirectory, contactGroups, type ContactPerson } from '../data/contactDirectory';
import { getUserGroups, subscribeUserGroups, type UserGroupRecord } from '../data/userGroups';

/** 选择项类型：人员 / 部门 / 用户组 */
export type ContactSelectionKind = 'person' | 'department' | 'user-group';

/** 通用范围选择项（稳定 ID） */
export interface ContactSelection {
  id: string;
  kind: ContactSelectionKind;
  name: string;
  /** 可选辅助说明（部门人数 / 用户组来源等） */
  note?: string;
}

interface ContactPickerProps {
  selected?: string[];
  onChange?: (next: string[]) => void;
  kind?: 'member' | 'wecom';
  placeholder?: string;
  disabledNames?: string[];
  /** 已选且不可移除的成员，例如系统规则要求的固定接收人 */
  lockedNames?: string[];
  selectionMode?: 'people' | 'people-and-departments';
  triggerVariant?: 'field' | 'button';
  triggerLabel?: string;
  /** ===== 管理后台通用范围选择（新） ===== */
  /** 可配置 Tab（默认仅组织架构） */
  tabs?: Array<'directory' | 'user-groups'>;
  /** 允许选择的类型（默认 person + department） */
  allowedKinds?: ContactSelectionKind[];
  /** 初始 Tab */
  defaultTab?: 'directory' | 'user-groups';
  /** 禁用项 ID */
  disabledIds?: string[];
  /** 锁定项 ID（不可移除） */
  lockedIds?: string[];
  /** 结构化选择回调（与 selected/onChange 二选一使用） */
  selections?: ContactSelection[];
  onSelectionsChange?: (next: ContactSelection[]) => void;
}

type DirectoryNode = ContactPerson;

/** 解析搜索关键词：支持顿号/逗号/空格分隔多个人名，返回去重词表 */
const parseKeywords = (raw: string): string[] => raw.trim()
  .split(/[、，,\s]+/)
  .map(word => word.trim())
  .filter(Boolean);

/** 多关键词匹配：任一关键词命中即返回 true（人员批量查询）；单关键词保持原有语义（姓名/部门/职务/邮箱模糊） */
const matchAnyKeyword = (text: string, keywords: string[]): boolean => keywords.some(word => text.includes(word));

/** 搜索结果最多展示人数（超出截断并提示） */
const SEARCH_RESULT_LIMIT = 100;

/** 全文本匹配：忽略空格后的整串（匹配度最高，排序置顶） */
const normalizeFullText = (raw: string): string => raw.replace(/\s+/g, '');

/** 搜索框统一文案 */
const SEARCH_PLACEHOLDER = '可输入多个人名或组织名称';

/** 匹配度评分：整串忽略空格命中 > 多关键词命中；姓名命中 > 部门/职务/邮箱命中 */
const relevanceScore = (person: ContactPerson, keywords: string[], fullText: string): number => {
  if (keywords.length === 0) return 0;
  let score = 0;
  if (fullText) {
    if (person.name.includes(fullText)) score += 100;
    else if (person.department.includes(fullText) || person.title.includes(fullText) || person.email.includes(fullText)) score += 60;
  }
  keywords.forEach(word => {
    if (person.name.includes(word)) score += 10;
    else if (person.department.includes(word) || person.title.includes(word) || person.email.includes(word)) score += 4;
  });
  return score;
};

const kindLabel: Record<ContactSelectionKind, string> = {
  person: '人员',
  department: '部门',
  'user-group': '用户组',
};

const kindBadgeClass: Record<ContactSelectionKind, string> = {
  person: 'bg-theme-100 text-theme-700',
  department: 'bg-gray-100 text-gray-600',
  'user-group': 'bg-amber-50 text-amber-700',
};

/** 平台通用通讯录：支持按部门浏览、搜索以及选择人员或部门；管理后台可启用用户组 Tab。 */
export default function ContactPicker({
  selected = [],
  onChange = () => {},
  kind = 'member',
  placeholder = '点击选择通讯录成员',
  disabledNames = [],
  lockedNames = [],
  selectionMode = 'people',
  triggerVariant = 'field',
  triggerLabel = '选择通讯录',
  tabs,
  allowedKinds,
  defaultTab,
  disabledIds = [],
  lockedIds = [],
  selections,
  onSelectionsChange,
}: ContactPickerProps) {
  // 新模式判定：传入 selections 即启用结构化（管理后台）
  const structured = Boolean(selections && onSelectionsChange);
  const resolvedTabs: Array<'directory' | 'user-groups'> = tabs && tabs.length > 0 ? tabs : ['directory'];
  const resolvedKinds = allowedKinds && allowedKinds.length > 0 ? allowedKinds : ['person', 'department'];
  const allowPersons = resolvedKinds.includes('person');
  const allowDepartments = structured ? resolvedKinds.includes('department') : selectionMode === 'people-and-departments';

  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [limitToast, setLimitToast] = useState(false);
  const [draft, setDraft] = useState<string[]>(selected);
  const [structuredDraft, setStructuredDraft] = useState<ContactSelection[]>(selections || []);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'directory' | 'user-groups'>(defaultTab && resolvedTabs.includes(defaultTab) ? defaultTab : resolvedTabs[0]);
  const [userGroups, setUserGroups] = useState<UserGroupRecord[]>(getUserGroups);

  useEffect(() => {
    if (!structured) return;
    return subscribeUserGroups(() => setUserGroups(getUserGroups()));
  }, [structured]);

  const disabledSet = useMemo(() => new Set(disabledNames), [disabledNames]);
  const lockedSet = useMemo(() => new Set(lockedNames), [lockedNames]);
  const disabledIdSet = useMemo(() => new Set(disabledIds), [disabledIds]);
  const lockedIdSet = useMemo(() => new Set(lockedIds), [lockedIds]);

  // 搜索结果：按匹配度排序（整串忽略空格命中最优先），搜索态最多展示 SEARCH_RESULT_LIMIT 人
  const searchResult = useMemo(() => {
    const keywords = parseKeywords(keyword);
    const fullText = normalizeFullText(keyword);
    const searching = keywords.length > 0;
    const ranked = contactGroups
      .map(group => {
        const matched = contactDirectory
          .filter(person => {
            if (person.department !== group) return false;
            if (!searching || matchAnyKeyword(group, keywords)) return true;
            return matchAnyKeyword(person.name, keywords) || matchAnyKeyword(person.title, keywords) || matchAnyKeyword(person.email, keywords);
          })
          .map(person => ({ person, score: relevanceScore(person, keywords, fullText) }))
          .sort((a, b) => b.score - a.score);
        const groupScore = searching
          ? (fullText && group.includes(fullText) ? 100 : 0)
            + keywords.reduce((sum, word) => sum + (group.includes(word) ? 20 : 0), 0)
            + matched.reduce((max, entry) => Math.max(max, entry.score), 0)
          : 0;
        return { group, matched, groupScore };
      })
      .sort((a, b) => b.groupScore - a.groupScore);

    let truncated = false;
    let remaining = SEARCH_RESULT_LIMIT;
    const groups = ranked
      .map(({ group, matched }) => {
        const members = matched.map(entry => entry.person);
        let shown = members;
        if (searching) {
          if (members.length > remaining) truncated = true;
          shown = members.slice(0, Math.max(remaining, 0));
          remaining = Math.max(remaining - members.length, 0);
        }
        return { group, members: shown };
      })
      .filter(({ group, members }) => members.length > 0 || (allowDepartments && searching && matchAnyKeyword(group, keywords)));

    const hitCount = groups.reduce((sum, entry) => sum + entry.members.length, 0);
    return { groups, hitCount, truncated };
  }, [allowDepartments, keyword]);
  const visibleGroups = searchResult.groups;

  // 搜索结果超出上限时提示“最多搜索100人”
  useEffect(() => {
    if (!searchResult.truncated) return;
    setLimitToast(true);
    const timer = window.setTimeout(() => setLimitToast(false), 2200);
    return () => window.clearTimeout(timer);
  }, [searchResult.truncated, keyword]);

  const visibleUserGroups = useMemo(() => {
    const keywords = parseKeywords(keyword);
    if (keywords.length === 0) return userGroups;
    return userGroups.filter(group => matchAnyKeyword(group.name, keywords) || matchAnyKeyword(group.description, keywords));
  }, [keyword, userGroups]);

  const openPicker = () => {
    setDraft([...new Set([...lockedNames, ...selected])]);
    setStructuredDraft(selections ? [...selections] : []);
    setKeyword('');
    setOpen(true);
  };
  const closePicker = () => {
    setDraft([...new Set([...lockedNames, ...selected])]);
    setStructuredDraft(selections ? [...selections] : []);
    setOpen(false);
  };
  const confirmPicker = () => {
    if (structured) onSelectionsChange!(structuredDraft);
    else onChange([...new Set([...lockedNames, ...draft])]);
    setOpen(false);
  };
  const toggleGroup = (group: string) => {
    setExpandedGroups(current => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };
  const toggleName = (name: string) => {
    if (disabledSet.has(name) || lockedSet.has(name)) return;
    setDraft(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name]);
  };
  const toggleItem = (node: DirectoryNode) => toggleName(node.name);
  const expandedFor = (group: string) => parseKeywords(keyword).length > 0 ? true : expandedGroups.has(group);

  // ===== 结构化模式操作 =====
  const findDraftItem = (id: string) => structuredDraft.find(item => item.id === id);
  const toggleStructured = (item: ContactSelection) => {
    if (disabledIdSet.has(item.id) || lockedIdSet.has(item.id)) return;
    setStructuredDraft(current => current.some(entry => entry.id === item.id)
      ? current.filter(entry => entry.id !== item.id)
      : [...current, item]);
  };
  const currentTabVisibleDirectorySelections = (): ContactSelection[] => {
    const keywords = parseKeywords(keyword);
    const result: ContactSelection[] = [];
    if (allowDepartments) visibleGroups.forEach(({ group, members }) => {
      if (keywords.length === 0 || matchAnyKeyword(group, keywords)) result.push({ id: `dept:${group}`, kind: 'department', name: group, note: `${members.length} 人` });
    });
    if (allowPersons) visibleGroups.forEach(({ members }) => members.forEach(person => {
      result.push({ id: `person:${person.id}`, kind: 'person', name: person.name, note: person.title });
    }));
    return result;
  };
  const selectAllVisible = () => {
    if (activeTab === 'user-groups') {
      const items = visibleUserGroups.map(group => ({ id: `group:${group.id}`, kind: 'user-group' as const, name: group.name, note: group.source === 'sync' ? '系统同步' : '手动管理' }));
      setStructuredDraft(current => {
        const map = new Map(current.map(item => [item.id, item]));
        items.forEach(item => { if (!disabledIdSet.has(item.id) && !map.has(item.id)) map.set(item.id, item); });
        return [...map.values()];
      });
    } else {
      const items = currentTabVisibleDirectorySelections();
      setStructuredDraft(current => {
        const map = new Map(current.map(item => [item.id, item]));
        items.forEach(item => { if (!disabledIdSet.has(item.id) && !map.has(item.id)) map.set(item.id, item); });
        return [...map.values()];
      });
    }
  };

  const selectedCount = structured ? structuredDraft.length : draft.length;
  const lockedCount = structured ? structuredDraft.filter(item => lockedIdSet.has(item.id)).length : lockedNames.length;

  return (
    <>
      {triggerVariant === 'button' ? (
        <button type="button" onClick={openPicker} className="inline-flex h-9 shrink-0 items-center gap-2 rounded bg-[#2f75b5] px-4 text-sm font-medium text-white hover:bg-[#28669f]">
          <UserPlus size={15} />
          {triggerLabel}
        </button>
      ) : (
        <button type="button" onClick={openPicker} className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-theme-300">
          {structured ? (
            structuredSelectionPreview(structuredDraft, placeholder)
          ) : (
            selected.length > 0 ? selected.map(name => (
              <span key={name} className="rounded-md bg-theme-50 px-2 py-0.5 text-xs font-medium text-theme-700">{name}</span>
            )) : <span className="text-gray-400">{placeholder}</span>
          )}
          <span className="ml-auto shrink-0 text-xs text-gray-400">{selectedCount} 项</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget) closePicker(); }}>
          {limitToast && (
            <div className="fixed left-1/2 top-16 z-[90] -translate-x-1/2 rounded-lg bg-gray-900/90 px-4 py-2 text-xs font-medium text-white shadow-lg">最多搜索100人</div>
          )}
          <div role="dialog" aria-modal="true" aria-labelledby="contact-picker-title" data-requirement-id="contact-picker-search" className="flex max-h-[min(640px,calc(100vh-32px))] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <h3 id="contact-picker-title" className="text-base font-bold text-gray-900">
                  {structured
                    ? resolvedTabs.includes('user-groups') ? '选择人员、部门或用户组' : '选择人员或部门'
                    : allowDepartments ? '选择用户或部门' : kind === 'wecom' ? '选择企微接收人' : '选择通讯录成员'}
                </h3>
                <p className="mt-1 text-xs text-gray-400">按部门浏览或搜索，确认后加入已选清单</p>
              </div>
              <button type="button" onClick={closePicker} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" title="关闭"><X size={18} /></button>
            </div>

            {structured && resolvedTabs.length > 1 && (
              <div className="flex shrink-0 gap-1 border-b border-gray-100 px-5 pt-3">
                {(resolvedTabs as Array<'directory' | 'user-groups'>).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => { setActiveTab(tab); setKeyword(''); }}
                    className={`rounded-t-lg px-4 py-2 text-xs font-semibold transition-colors ${activeTab === tab ? 'border border-b-0 border-gray-100 bg-white text-theme-700' : 'text-gray-500 hover:text-gray-800'}`}
                  >
                    {tab === 'directory' ? '组织架构' : '用户组'}
                  </button>
                ))}
              </div>
            )}

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_260px] overflow-hidden max-sm:grid-cols-1">
              <div className="flex min-h-0 flex-col border-r border-gray-100 max-sm:border-r-0">
                <div className="shrink-0 px-4 pt-4">
                  {parseKeywords(keyword).length > 1 && (
                    <p className="mb-2 text-[10px] text-gray-400">已按 {parseKeywords(keyword).length} 个关键词搜索，命中 {searchResult.hitCount}{searchResult.truncated ? '+' : ''} 人</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder={SEARCH_PLACEHOLDER} className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs outline-none focus:border-theme-300 focus:bg-white" autoFocus />
                    </div>
                    {structured && (
                      <button type="button" onClick={selectAllVisible} className="h-8 shrink-0 rounded-lg border border-gray-200 px-3 text-[11px] font-medium text-gray-600 hover:border-theme-300 hover:text-theme-700">全选</button>
                    )}
                  </div>
                </div>
                <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto p-3">
                  {(!structured || activeTab === 'directory') && visibleGroups.map(({ group, members }) => {
                    const expanded = expandedFor(group);
                    if (structured) {
                      const groupItem: ContactSelection = { id: `dept:${group}`, kind: 'department', name: group, note: `${members.length} 人` };
                      const groupSelected = Boolean(findDraftItem(groupItem.id));
                      const groupDisabled = disabledIdSet.has(groupItem.id);
                      return (
                        <div key={group} className="mb-1">
                          <div className={`flex items-center rounded-md ${groupSelected ? 'bg-theme-50' : 'hover:bg-gray-50'}`}>
                            <button type="button" onClick={() => toggleGroup(group)} className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-2 text-left">
                              {expanded ? <ChevronDown size={13} className="shrink-0 text-gray-400" /> : <ChevronRight size={13} className="shrink-0 text-gray-400" />}
                              <FolderTree size={14} className={groupSelected ? 'text-theme-600' : 'text-gray-400'} />
                              <span className="truncate text-xs font-semibold text-gray-700">{group}</span>
                              <span className="text-[10px] text-gray-300">{members.length} 人</span>
                            </button>
                            {allowDepartments && (
                              <button type="button" disabled={groupDisabled} onClick={() => toggleStructured(groupItem)} title={groupDisabled ? '该部门不可选' : `选择${group}`} className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-gray-300 hover:border-theme-300 hover:text-theme-600 disabled:cursor-not-allowed disabled:opacity-40">
                                {groupSelected && <Check size={13} />}
                              </button>
                            )}
                          </div>
                          {expanded && (
                            <div className="pl-4">
                              {allowPersons && members.map(person => {
                                const personItem: ContactSelection = { id: `person:${person.id}`, kind: 'person', name: person.name, note: person.title };
                                const isSelected = Boolean(findDraftItem(personItem.id));
                                const isDisabled = disabledIdSet.has(personItem.id);
                                const isLocked = lockedIdSet.has(personItem.id);
                                return (
                                  <button key={person.id} type="button" disabled={isDisabled} onClick={() => toggleStructured(personItem)} title={isLocked ? '已锁定，不可移除' : isDisabled ? '该用户不可选' : undefined} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${isSelected ? 'bg-theme-50' : isDisabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-gray-50'}`}>
                                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${isSelected ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{person.name.slice(0, 1)}</span>
                                    <span className="min-w-0 flex-1"><span className="block truncate font-medium text-gray-800">{person.name}</span><span className="block truncate text-[10px] text-gray-400">{person.title}</span></span>
                                    {isLocked ? <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-semibold text-amber-700">固定</span> : isSelected && <Check size={13} className="text-theme-600" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }
                    // 旧模式（保持原逻辑）
                    const groupSelected = draft.includes(group);
                    const groupDisabled = disabledSet.has(group);
                    return (
                      <div key={group} className="mb-1">
                        <div className={`flex items-center rounded-md ${groupSelected ? 'bg-theme-50' : 'hover:bg-gray-50'}`}>
                          <button type="button" onClick={() => toggleGroup(group)} className="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-2 text-left">
                            {expanded ? <ChevronDown size={13} className="shrink-0 text-gray-400" /> : <ChevronRight size={13} className="shrink-0 text-gray-400" />}
                            <FolderTree size={14} className={groupSelected ? 'text-theme-600' : 'text-gray-400'} />
                            <span className="truncate text-xs font-semibold text-gray-700">{group}</span>
                            <span className="text-[10px] text-gray-300">{members.length} 人</span>
                          </button>
                          {allowDepartments && (
                            <button type="button" disabled={groupDisabled} onClick={() => toggleName(group)} title={groupDisabled ? '该部门已在当前用户组中' : `选择${group}`} className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-gray-200 bg-white text-gray-300 hover:border-theme-300 hover:text-theme-600 disabled:cursor-not-allowed disabled:opacity-40">
                              {groupSelected && <Check size={13} />}
                            </button>
                          )}
                        </div>
                        {expanded && (
                          <div className="pl-4">
                            {members.map(person => {
                              const isSelected = draft.includes(person.name);
                              const isDisabled = disabledSet.has(person.name);
                              const isLocked = lockedSet.has(person.name);
                              return (
                                <button key={person.id} type="button" disabled={isDisabled} onClick={() => toggleItem(person)} title={isLocked ? '系统固定推送人，不可移除' : isDisabled ? '该用户已在当前用户组或其他收件字段中' : undefined} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${isSelected ? 'bg-theme-50' : isDisabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-gray-50'}`}>
                                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${isSelected ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{person.name.slice(0, 1)}</span>
                                  <span className="min-w-0 flex-1"><span className="block truncate font-medium text-gray-800">{person.name}</span><span className="block truncate text-[10px] text-gray-400">{person.title}</span></span>
                                  {isLocked ? <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-semibold text-amber-700">固定</span> : isSelected && <Check size={13} className="text-theme-600" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {structured && activeTab === 'user-groups' && visibleUserGroups.map(group => {
                    const item: ContactSelection = { id: `group:${group.id}`, kind: 'user-group', name: group.name, note: group.source === 'sync' ? '系统同步' : '手动管理' };
                    const isSelected = Boolean(findDraftItem(item.id));
                    const isDisabled = disabledIdSet.has(item.id);
                    const personCount = group.members.filter(member => member.kind !== 'department').length;
                    const deptCount = group.members.filter(member => member.kind === 'department').length;
                    return (
                      <button key={group.id} type="button" disabled={isDisabled} onClick={() => toggleStructured(item)} className={`mb-1 flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${isSelected ? 'border-theme-200 bg-theme-50' : isDisabled ? 'cursor-not-allowed border-gray-100 opacity-40' : 'border-gray-100 hover:border-theme-200 hover:bg-theme-50/40'}`}>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${group.source === 'sync' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}><Users size={15} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-gray-800">{group.name}</span>
                          <span className="mt-0.5 block truncate text-[10px] text-gray-400">{group.source === 'sync' ? '系统同步' : '手动管理'} · 成员 {personCount} 人 · 部门 {deptCount} 个</span>
                        </span>
                        {isSelected && <Check size={14} className="shrink-0 text-theme-600" />}
                      </button>
                    );
                  })}
                  {structured && activeTab === 'user-groups' && visibleUserGroups.length === 0 && <div className="flex items-center justify-center gap-1.5 px-3 py-8 text-xs text-gray-400"><Users size={13} />未找到匹配的用户组</div>}
                  {(!structured || activeTab === 'directory') && visibleGroups.length === 0 && <div className="flex items-center justify-center gap-1.5 px-3 py-8 text-xs text-gray-400"><UserRound size={13} />未找到匹配的联系人或部门</div>}
                </div>
              </div>

              <div className="flex min-h-0 flex-col bg-gray-50/50 max-sm:hidden">
                <div className="flex shrink-0 items-center justify-between px-4 py-3">
                  <span className="text-xs font-semibold text-gray-600">已选 {selectedCount} 项</span>
                  {selectedCount > lockedCount && <button type="button" onClick={() => { if (structured) setStructuredDraft(current => current.filter(item => lockedIdSet.has(item.id))); else setDraft([...lockedNames]); }} className="text-[11px] text-gray-400 hover:text-red-500">清空可选项</button>}
                </div>
                <div className="scrollbar-hover min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
                  {selectedCount === 0 && <div className="px-2 py-8 text-center text-xs text-gray-300">尚未选择</div>}
                  {structured ? structuredDraft.map(item => {
                    const isLocked = lockedIdSet.has(item.id);
                    const liveGroup = item.kind === 'user-group' ? userGroups.find(group => group.id === item.id.replace(/^group:/, '')) : null;
                    const displayName = liveGroup ? liveGroup.name : item.name;
                    const invalid = item.kind === 'user-group' && !liveGroup;
                    return (
                      <div key={item.id} className={`flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 shadow-sm ${invalid ? 'ring-1 ring-red-200' : ''}`}>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-semibold ${kindBadgeClass[item.kind]} ${item.kind === 'person' ? 'rounded-full' : 'rounded-md'}`}>
                          {item.kind === 'person' ? displayName.slice(0, 1) : item.kind === 'department' ? <FolderTree size={13} /> : <Users size={13} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium text-gray-800">{displayName}{invalid && <span className="ml-1 text-red-500">（已失效）</span>}</span>
                          <span className="block truncate text-[9px] text-gray-400">{kindLabel[item.kind]}{item.note ? ` · ${item.note}` : ''}</span>
                        </span>
                        {isLocked ? (
                          <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">固定</span>
                        ) : (
                          <button type="button" onClick={() => toggleStructured(item)} className="shrink-0 rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-500" title="移除"><X size={12} /></button>
                        )}
                      </div>
                    );
                  }) : draft.map(name => {
                    const isDepartment = contactGroups.includes(name);
                    const isLocked = lockedSet.has(name);
                    return (
                      <div key={name} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 shadow-sm">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-semibold ${isDepartment ? 'rounded-md bg-gray-100 text-gray-500' : 'rounded-full bg-theme-100 text-theme-700'}`}>{isDepartment ? <FolderTree size={13} /> : name.slice(0, 1)}</span>
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-800">{name}</span>
                        {isLocked ? (
                          <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">固定</span>
                        ) : (
                          <button type="button" onClick={() => toggleName(name)} className="shrink-0 rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-500" title="移除"><X size={12} /></button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-5 py-3">
              <span className="text-xs text-gray-400">已选 {selectedCount} 项</span>
              <div className="flex gap-2">
                <button type="button" onClick={closePicker} className="h-9 rounded-lg border border-gray-200 px-4 text-sm text-gray-600 hover:bg-gray-50">取消</button>
                <button type="button" onClick={confirmPicker} className="h-9 rounded-lg bg-theme-600 px-5 text-sm font-semibold text-white hover:bg-theme-700">确定</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function structuredSelectionPreview(selections: ContactSelection[], placeholder: string) {
  if (selections.length === 0) return <span className="text-gray-400">{placeholder}</span>;
  return selections.slice(0, 8).map(item => (
    <span key={item.id} className={`rounded-md px-2 py-0.5 text-xs font-medium ${kindBadgeClass[item.kind]}`}>{item.name}</span>
  ));
}
