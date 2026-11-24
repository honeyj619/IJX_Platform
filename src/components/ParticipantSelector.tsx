import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Mail, Plus, Users, X } from 'lucide-react';
import { contactDirectory, type ContactPerson } from '../data/contactDirectory';
import ContactPicker, { type ContactSelection } from './ContactPicker';
import { useImStore } from '../store/imStore';
import type { Group } from '../data/im/types';

/** 参与者类型：联系人 / 群 / 外部邮箱 */
export type ParticipantKind = 'person' | 'group' | 'email';

/** 结构化参与者：日程保存前再展开/转换为姓名或邮箱字符串 */
export interface ParticipantSelection {
  /** 唯一键：person:${联系人id} / group:${群id} / email:${小写邮箱} */
  id: string;
  kind: ParticipantKind;
  label: string;
  email?: string;
  memberIds?: string[];
  description?: string;
}

interface ParticipantSelectorProps {
  value: ParticipantSelection[];
  onChange: (next: ParticipantSelection[]) => void;
  /** 召集人：搜索结果中标记且不允许重复添加 */
  organizerName?: string;
  disabled?: boolean;
  placeholder?: string;
}

/** 邮箱格式（原型演示口径）：local@domain.tld，统一小写判重 */
const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/;

const normalizeEmail = (raw: string) => raw.trim().toLowerCase();

/** 搜索结果上限：联系人 6 + 群 3 + 邮箱 1 = 最多 10 项 */
const MAX_PERSON_RESULTS = 6;
const MAX_GROUP_RESULTS = 3;

const SUGGEST_EMPTY_TEXT = '未找到联系人或群，可输入完整邮箱邀请';
const INVALID_EMAIL_TEXT = '邮箱格式不正确，无法添加外部邮箱';

interface SuggestRow {
  key: string;
  kind: 'person' | 'group' | 'email';
  selection: ParticipantSelection;
  person?: ContactPerson;
  group?: Group;
}

/** 联系人匹配评分：姓名精确 > 姓名前缀 > 账号/邮箱 > 手机号/部门/岗位等辅助字段 */
const scoreContact = (person: ContactPerson, queryLower: string): number => {
  let score = 0;
  if (person.name.toLowerCase() === queryLower) score = Math.max(score, 400);
  else if (person.name.toLowerCase().startsWith(queryLower)) score = Math.max(score, 300);
  else if (person.name.toLowerCase().includes(queryLower)) score = Math.max(score, 240);
  const account = (person.account ?? '').toLowerCase();
  if (account) {
    if (account === queryLower) score = Math.max(score, 280);
    else if (account.includes(queryLower)) score = Math.max(score, 220);
  }
  const email = person.email.toLowerCase();
  if (email === queryLower) score = Math.max(score, 280);
  else if (email.includes(queryLower)) score = Math.max(score, 220);
  if (person.mobile.toLowerCase().includes(queryLower)) score = Math.max(score, 160);
  if (person.department.toLowerCase().includes(queryLower)) score = Math.max(score, 150);
  if (person.title.toLowerCase().includes(queryLower)) score = Math.max(score, 140);
  return score;
};

const scoreGroup = (group: Group, queryLower: string): number => {
  const name = group.name.toLowerCase();
  if (name === queryLower) return 400;
  if (name.startsWith(queryLower)) return 300;
  if (name.includes(queryLower)) return 240;
  return 0;
};

/** 日程/会议参与者选择：输入搜索（联系人/群/邮箱）+ 已选标签 + 批量通讯录 */
export default function ParticipantSelector({
  value,
  onChange,
  organizerName,
  disabled = false,
  placeholder = '添加联系人、群或邮箱',
}: ParticipantSelectorProps) {
  const groups = useImStore((state) => state.groups);
  const [keyword, setKeyword] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [batchOpen, setBatchOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedIds = useMemo(() => new Set(value.map(item => item.id)), [value]);
  const queryLower = keyword.trim().toLowerCase();

  const personRows = useMemo<SuggestRow[]>(() => {
    if (!queryLower) return [];
    return contactDirectory
      .map(person => ({ person, score: scoreContact(person, queryLower) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_PERSON_RESULTS)
      .map(({ person }) => ({
        key: `person:${person.id}`,
        kind: 'person' as const,
        selection: {
          id: `person:${person.id}`,
          kind: 'person' as const,
          label: person.name,
          email: person.email,
          description: `${person.department} · ${person.title}`,
        },
        person,
      }));
  }, [queryLower]);

  const groupRows = useMemo<SuggestRow[]>(() => {
    if (!queryLower) return [];
    return groups
      .map(group => ({ group, score: scoreGroup(group, queryLower) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_GROUP_RESULTS)
      .map(({ group }) => ({
        key: `group:${group.id}`,
        kind: 'group' as const,
        selection: {
          id: `group:${group.id}`,
          kind: 'group' as const,
          label: group.name,
          memberIds: group.members,
          description: `${group.type} · ${group.members.length} 人`,
        },
        group,
      }));
  }, [groups, queryLower]);

  const emailKeyword = normalizeEmail(keyword);
  const isEmail = EMAIL_RE.test(emailKeyword);
  const emailTakenByContact = isEmail && contactDirectory.some(person => person.email.toLowerCase() === emailKeyword);
  const emailRow = useMemo<SuggestRow | null>(() => {
    if (!isEmail || emailTakenByContact) return null;
    return {
      key: `email:${emailKeyword}`,
      kind: 'email' as const,
      selection: { id: `email:${emailKeyword}`, kind: 'email' as const, label: emailKeyword, email: emailKeyword },
    };
  }, [emailKeyword, emailTakenByContact, isEmail]);
  const invalidEmail = emailKeyword.includes('@') && !isEmail;

  const rows = useMemo<SuggestRow[]>(
    () => [...personRows, ...groupRows, ...(emailRow ? [emailRow] : [])],
    [personRows, groupRows, emailRow],
  );
  const safeActiveIndex = rows.length > 0 ? Math.min(activeIndex, rows.length - 1) : -1;

  // 关键词变化后重置高亮，避免越界残留
  useEffect(() => { setActiveIndex(0); }, [keyword]);

  // 点击选择器外部时关闭搜索浮层
  useEffect(() => {
    if (!suggestOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setSuggestOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [suggestOpen]);

  // 键盘上下移动时保持高亮行可见
  useEffect(() => {
    if (!suggestOpen) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [safeActiveIndex, suggestOpen]);

  const isRowBlocked = (row: SuggestRow) =>
    selectedIds.has(row.key)
    || (row.kind === 'person' && Boolean(organizerName) && row.person?.name === organizerName);

  const addSelection = (row: SuggestRow) => {
    if (disabled) return;
    if (isRowBlocked(row)) return;
    onChange([...value, row.selection]);
    setKeyword('');
    setSuggestOpen(false);
    inputRef.current?.focus();
  };

  const removeSelection = (id: string) => {
    if (disabled) return;
    onChange(value.filter(item => item.id !== id));
  };

  const handleInputChange = (raw: string) => {
    setKeyword(raw);
    setSuggestOpen(raw.trim().length > 0);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!suggestOpen || rows.length === 0) return;
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((safeActiveIndex + delta + rows.length) % rows.length);
    } else if (event.key === 'Enter') {
      if (!suggestOpen || rows.length === 0) return;
      event.preventDefault();
      addSelection(rows[safeActiveIndex]);
    } else if (event.key === 'Escape' && suggestOpen) {
      event.stopPropagation();
      setSuggestOpen(false);
    }
  };

  const openBatchPicker = () => {
    if (disabled) return;
    setSuggestOpen(false);
    setBatchOpen(true);
  };

  const personSelections = useMemo<ContactSelection[]>(
    () => value
      .filter(item => item.kind === 'person')
      .map(item => ({ id: item.id, kind: 'person' as const, name: item.label, note: item.description })),
    [value],
  );

  // 批量通讯录确认：仅合并联系人结果，保留已选群和邮箱
  const handleBatchConfirm = (next: ContactSelection[]) => {
    const persons: ParticipantSelection[] = next.map(selection => {
      const person = contactDirectory.find(item => `person:${item.id}` === selection.id);
      return {
        id: selection.id,
        kind: 'person' as const,
        label: selection.name,
        email: person?.email,
        description: person ? `${person.department} · ${person.title}` : selection.note,
      };
    });
    onChange([...persons, ...value.filter(item => item.kind !== 'person')]);
  };

  const sectionClass = 'px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500';
  const rowClass = (row: SuggestRow, index: number) => {
    const active = index === safeActiveIndex;
    const blocked = isRowBlocked(row);
    return [
      'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm outline-none transition-colors',
      active ? 'bg-theme-50 dark:bg-theme-900/30' : '',
      !active && !blocked ? 'hover:bg-slate-50 dark:hover:bg-gray-800' : '',
      blocked ? 'cursor-default' : '',
    ].filter(Boolean).join(' ');
  };

  const renderRow = (row: SuggestRow, index: number) => {
    const blocked = isRowBlocked(row);
    const isOrganizer = row.kind === 'person' && Boolean(organizerName) && row.person?.name === organizerName;
    return (
      <button
        key={row.key}
        type="button"
        role="option"
        id={`participant-option-${index}`}
        aria-selected={index === safeActiveIndex}
        data-active={index === safeActiveIndex}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => addSelection(row)}
        className={rowClass(row, index)}
      >
        {row.kind === 'person' && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 dark:bg-gray-700 dark:text-slate-300">
            {row.person?.name.slice(0, 1)}
          </span>
        )}
        {row.kind === 'group' && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-theme-100 text-theme-700 dark:bg-theme-900/40 dark:text-theme-300">
            <Users size={13} />
          </span>
        )}
        {row.kind === 'email' && (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-gray-700 dark:text-slate-300">
            <Mail size={13} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          {row.kind === 'person' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="truncate font-medium text-slate-800 dark:text-slate-100">{row.person?.name}</span>
                {isOrganizer && <span className="shrink-0 rounded bg-amber-50 px-1 py-0.5 text-[9px] font-semibold text-amber-700">召集人</span>}
              </span>
              <span className="block truncate text-xs text-slate-400 dark:text-slate-500">
                {row.person?.department} · {row.person?.title} · {row.person?.email}
              </span>
            </>
          )}
          {row.kind === 'group' && (
            <>
              <span className="block truncate font-medium text-slate-800 dark:text-slate-100">{row.group?.name}</span>
              <span className="block truncate text-xs text-slate-400 dark:text-slate-500">{row.group?.type} · {row.group?.members.length} 人</span>
            </>
          )}
          {row.kind === 'email' && (
            <span className="block truncate font-medium text-slate-800 dark:text-slate-100">添加邮箱：{row.selection.label}</span>
          )}
        </span>
        {blocked && (
          selectedIds.has(row.key)
            ? <Check size={14} className="shrink-0 text-theme-600" />
            : <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">召集人已含</span>
        )}
      </button>
    );
  };

  const tagIcon = (item: ParticipantSelection) => {
    if (item.kind === 'person') return <span className="flex h-4 w-4 items-center justify-center rounded-full bg-theme-600 text-[9px] font-semibold text-white">{item.label.slice(0, 1)}</span>;
    if (item.kind === 'group') return <Users size={12} className="shrink-0" />;
    return <Mail size={12} className="shrink-0" />;
  };

  return (
    <div className="flex items-start gap-3">
      <div ref={containerRef} className="relative min-w-0 flex-1">
        {/* 高度约定（border-box）：容器总高 36px = 边框2 + py-1×2 + 内容32，内部输入行 h-6，与右侧 h-9 按钮精确等高；多行标签时按钮保持顶对齐 */}
        <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded border border-slate-200 bg-white px-2 py-1 focus-within:border-theme-500 dark:border-gray-700 dark:bg-gray-800 dark:focus-within:border-theme-500">
          {value.map(item => (
            <span
              key={item.id}
              title={item.kind === 'email' ? item.email : item.description}
              className="flex max-w-[240px] items-center gap-1 rounded bg-theme-50 px-1.5 py-0.5 text-xs text-theme-700 dark:bg-theme-900/40 dark:text-theme-300"
            >
              {tagIcon(item)}
              <span className="truncate">{item.label}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeSelection(item.id)}
                aria-label={`移除${item.label}`}
                title="移除"
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-theme-500/70 hover:bg-theme-100 hover:text-theme-700 disabled:cursor-not-allowed dark:hover:bg-theme-900/60"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={suggestOpen}
            aria-autocomplete="list"
            aria-controls="participant-suggest-list"
            aria-activedescendant={suggestOpen && safeActiveIndex >= 0 ? `participant-option-${safeActiveIndex}` : undefined}
            value={keyword}
            disabled={disabled}
            onChange={(event) => handleInputChange(event.target.value)}
            onFocus={() => setSuggestOpen(keyword.trim().length > 0)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            className="h-6 min-w-[140px] flex-1 border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        {suggestOpen && (
          <div
            id="participant-suggest-list"
            role="listbox"
            ref={listRef}
            className="absolute left-0 top-[calc(100%+4px)] z-40 max-h-72 w-full overflow-y-auto rounded border border-slate-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
          >
            {personRows.length > 0 && <div className={sectionClass}>联系人</div>}
            {personRows.map((row, index) => renderRow(row, index))}
            {groupRows.length > 0 && <div className={sectionClass}>群</div>}
            {groupRows.map((row, index) => renderRow(row, personRows.length + index))}
            {emailRow && <div className={sectionClass}>邮箱</div>}
            {emailRow && renderRow(emailRow, rows.length - 1)}
            {invalidEmail && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-red-500">{INVALID_EMAIL_TEXT}</div>
            )}
            {rows.length === 0 && !invalidEmail && (
              <div className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500">{SUGGEST_EMPTY_TEXT}</div>
            )}
          </div>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={openBatchPicker}
        className="flex h-9 shrink-0 items-center gap-1 rounded border border-theme-200 px-3 text-sm font-medium text-theme-600 transition-colors hover:bg-theme-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-theme-700 dark:text-theme-300 dark:hover:bg-theme-900/20"
      >
        <Plus size={14} />
        批量添加
      </button>
      <ContactPicker
        open={batchOpen}
        onOpenChange={setBatchOpen}
        hideTrigger
        tabs={['directory']}
        allowedKinds={['person']}
        selections={personSelections}
        onSelectionsChange={handleBatchConfirm}
        placeholder="请选择参与者"
      />
    </div>
  );
}
