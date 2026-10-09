import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search, UserRound, X } from 'lucide-react';
import { contactDirectory, contactGroups, type ContactPerson } from '../data/contactDirectory';

interface ContactPickerProps {
  /** 已选成员姓名列表 */
  selected: string[];
  onChange: (next: string[]) => void;
  /** 选择器类型：成员通讯录 / 企微群+成员 */
  kind?: 'member' | 'wecom';
  /** 输入框占位 */
  placeholder?: string;
  /** 禁选名单（如收件人已选的人在抄送里置灰） */
  disabledNames?: string[];
}

type DirectoryNode = ContactPerson;

/** 平台通讯录选择器：点开文本框弹框，左侧部门树 + 右侧已选清单 */
export default function ContactPicker({ selected, onChange, kind = 'member', placeholder = '点击选择通讯录成员', disabledNames = [] }: ContactPickerProps) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const disabledSet = useMemo(() => new Set(disabledNames), [disabledNames]);

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return contactDirectory;
    return contactDirectory.filter(person => person.name.includes(kw) || person.department.includes(kw) || person.title.includes(kw));
  }, [keyword]);

  const visibleGroups = useMemo(
    () => contactGroups.map(group => ({ group, members: filtered.filter(person => person.department === group) })).filter(entry => entry.members.length > 0),
    [filtered]
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups(current => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const toggleItem = (node: DirectoryNode) => {
    if (disabledSet.has(node.name) || selected.includes(node.name)) {
      onChange(selected.filter(item => item !== node.name));
      return;
    }
    onChange([...selected, node.name]);
  };

  const expandedFor = (group: string) => keyword.trim() ? true : expandedGroups.has(group);

  return (
    <>
      {/* 触发输入框：点击弹框 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm hover:border-theme-300"
      >
        {selected.length > 0 ? (
          selected.map(name => (
            <span key={name} className="rounded-md bg-theme-50 px-2 py-0.5 text-xs font-medium text-theme-700">{name}</span>
          ))
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <span className="ml-auto shrink-0 text-xs text-gray-400">{selected.length} 人</span>
      </button>

      {/* 通讯录弹框：左侧部门树 + 右侧已选 */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4" onClick={() => setOpen(false)}>
          <div className="flex max-h-[min(640px,calc(100vh-32px))] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">{kind === 'wecom' ? '选择企微接收人（成员）' : '选择通讯录成员'}</h3>
                <p className="mt-1 text-xs text-gray-400">左侧按部门选择成员，右侧确认已选清单</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" title="关闭"><X size={18} /></button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_260px] overflow-hidden">
              {/* 左侧：部门树 */}
              <div className="flex min-h-0 flex-col border-r border-gray-100">
                <div className="shrink-0 px-4 pt-4">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={keyword}
                      onChange={event => setKeyword(event.target.value)}
                      placeholder="搜索姓名、部门或职务"
                      className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs outline-none focus:border-theme-300 focus:bg-white"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto p-3">

                  {visibleGroups.map(({ group, members }) => {
                    const expanded = expandedFor(group);
                    return (
                      <div key={group} className="mb-1">
                        <button type="button" onClick={() => toggleGroup(group)} className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left hover:bg-gray-50">
                          {expanded ? <ChevronDown size={13} className="text-gray-400" /> : <ChevronRight size={13} className="text-gray-400" />}
                          <span className="text-xs font-semibold text-gray-600">{group}</span>
                          <span className="text-[10px] text-gray-300">{members.length} 人</span>
                        </button>
                        {expanded && (
                          <div className="pl-4">
                            {members.map(person => {
                              const isSelected = selected.includes(person.name);
                              const isDisabled = disabledSet.has(person.name);
                              return (
                                <button
                                  key={person.id}
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={() => toggleItem(person)}
                                  title={isDisabled ? '已在其他收件字段中选择' : undefined}
                                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${isSelected ? 'bg-theme-50' : isDisabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-gray-50'}`}
                                >
                                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${isSelected ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {person.name.slice(0, 1)}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium text-gray-800">{person.name}</span>
                                    <span className="block truncate text-[10px] text-gray-400">{person.title}</span>
                                  </span>
                                  {isSelected && <span className="text-xs font-bold text-theme-600">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {visibleGroups.length === 0 && (
                    <div className="flex items-center justify-center gap-1.5 px-3 py-8 text-xs text-gray-400"><UserRound size={13} />未找到匹配的联系人</div>
                  )}
                </div>
              </div>

              {/* 右侧：已选清单 */}
              <div className="flex min-h-0 flex-col bg-gray-50/50">
                <div className="flex shrink-0 items-center justify-between px-4 py-3">
                  <span className="text-xs font-semibold text-gray-600">已选 {selected.length} 项</span>
                  {selected.length > 0 && <button type="button" onClick={() => onChange([])} className="text-[11px] text-gray-400 hover:text-red-500">清空</button>}
                </div>
                <div className="scrollbar-hover min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
                  {selected.length === 0 && <div className="px-2 py-8 text-center text-xs text-gray-300">尚未选择</div>}
                  {selected.map(name => (
                    <div key={name} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 shadow-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-theme-100 text-[10px] font-semibold text-theme-700">{name.slice(0, 1)}</span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-800">{name}</span>
                      <button type="button" onClick={() => onChange(selected.filter(item => item !== name))} className="shrink-0 rounded p-0.5 text-gray-300 hover:bg-red-50 hover:text-red-500" title="移除"><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-3">
                  <button type="button" onClick={() => setOpen(false)} className="w-full rounded-lg bg-theme-600 px-3 py-2 text-sm font-semibold text-white hover:bg-theme-700">确定</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
