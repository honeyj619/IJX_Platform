import { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, FolderTree, Search, UserPlus, UserRound, X } from 'lucide-react';
import { contactDirectory, contactGroups, type ContactPerson } from '../data/contactDirectory';

interface ContactPickerProps {
  selected: string[];
  onChange: (next: string[]) => void;
  kind?: 'member' | 'wecom';
  placeholder?: string;
  disabledNames?: string[];
  /** 已选且不可移除的成员，例如系统规则要求的固定接收人 */
  lockedNames?: string[];
  selectionMode?: 'people' | 'people-and-departments';
  triggerVariant?: 'field' | 'button';
  triggerLabel?: string;
}

type DirectoryNode = ContactPerson;

/** 平台通用通讯录：支持按部门浏览、搜索以及选择人员或部门。 */
export default function ContactPicker({
  selected,
  onChange,
  kind = 'member',
  placeholder = '点击选择通讯录成员',
  disabledNames = [],
  lockedNames = [],
  selectionMode = 'people',
  triggerVariant = 'field',
  triggerLabel = '选择通讯录',
}: ContactPickerProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [draft, setDraft] = useState<string[]>(selected);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const disabledSet = useMemo(() => new Set(disabledNames), [disabledNames]);
  const lockedSet = useMemo(() => new Set(lockedNames), [lockedNames]);
  const allowDepartments = selectionMode === 'people-and-departments';
  const visibleGroups = useMemo(() => {
    const kw = keyword.trim();
    return contactGroups
      .map(group => ({
        group,
        members: contactDirectory.filter(person => {
          if (person.department !== group) return false;
          if (!kw || group.includes(kw)) return true;
          return person.name.includes(kw) || person.title.includes(kw) || person.email.includes(kw);
        }),
      }))
      .filter(({ group, members }) => members.length > 0 || (allowDepartments && group.includes(kw)));
  }, [allowDepartments, keyword]);

  const openPicker = () => {
    setDraft([...new Set([...lockedNames, ...selected])]);
    setKeyword('');
    setOpen(true);
  };
  const closePicker = () => {
    setDraft([...new Set([...lockedNames, ...selected])]);
    setOpen(false);
  };
  const confirmPicker = () => {
    onChange([...new Set([...lockedNames, ...draft])]);
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
  const expandedFor = (group: string) => keyword.trim() ? true : expandedGroups.has(group);

  return (
    <>
      {triggerVariant === 'button' ? (
        <button type="button" onClick={openPicker} className="inline-flex h-9 shrink-0 items-center gap-2 rounded bg-[#2f75b5] px-4 text-sm font-medium text-white hover:bg-[#28669f]">
          <UserPlus size={15} />
          {triggerLabel}
        </button>
      ) : (
        <button type="button" onClick={openPicker} className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-theme-300">
          {selected.length > 0 ? selected.map(name => (
            <span key={name} className="rounded-md bg-theme-50 px-2 py-0.5 text-xs font-medium text-theme-700">{name}</span>
          )) : <span className="text-gray-400">{placeholder}</span>}
          <span className="ml-auto shrink-0 text-xs text-gray-400">{selected.length} 项</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-950/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget) closePicker(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="contact-picker-title" className="flex max-h-[min(640px,calc(100vh-32px))] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <h3 id="contact-picker-title" className="text-base font-bold text-gray-900">
                  {allowDepartments ? '选择用户或部门' : kind === 'wecom' ? '选择企微接收人' : '选择通讯录成员'}
                </h3>
                <p className="mt-1 text-xs text-gray-400">按部门浏览或搜索，确认后加入已选清单</p>
              </div>
              <button type="button" onClick={closePicker} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" title="关闭"><X size={18} /></button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_260px] overflow-hidden max-sm:grid-cols-1">
              <div className="flex min-h-0 flex-col border-r border-gray-100 max-sm:border-r-0">
                <div className="shrink-0 px-4 pt-4">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="搜索姓名、部门、职务或邮箱" className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs outline-none focus:border-theme-300 focus:bg-white" autoFocus />
                  </div>
                </div>
                <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto p-3">
                  {visibleGroups.map(({ group, members }) => {
                    const expanded = expandedFor(group);
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
                  {visibleGroups.length === 0 && <div className="flex items-center justify-center gap-1.5 px-3 py-8 text-xs text-gray-400"><UserRound size={13} />未找到匹配的联系人或部门</div>}
                </div>
              </div>

              <div className="flex min-h-0 flex-col bg-gray-50/50 max-sm:hidden">
                <div className="flex shrink-0 items-center justify-between px-4 py-3">
                  <span className="text-xs font-semibold text-gray-600">已选 {draft.length} 项</span>
                  {draft.length > lockedNames.length && <button type="button" onClick={() => setDraft([...lockedNames])} className="text-[11px] text-gray-400 hover:text-red-500">清空可选项</button>}
                </div>
                <div className="scrollbar-hover min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
                  {draft.length === 0 && <div className="px-2 py-8 text-center text-xs text-gray-300">尚未选择</div>}
                  {draft.map(name => {
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
              <span className="text-xs text-gray-400">已选 {draft.length} 项</span>
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
