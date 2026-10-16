import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, Image as ImageIcon, LayoutGrid, Plus, Search, X } from 'lucide-react';
import ContactPicker, { type ContactSelection } from '../ContactPicker';
import { getUserGroups, subscribeUserGroups, type UserGroupRecord } from '../../data/userGroups';
import {
  PC_CARD_TEMPLATES,
  deletePcCard,
  findTemplate,
  getPcCards,
  subscribePcCards,
  upsertPcCards,
  type ComponentCardConfig,
  type PcWorkbenchCardConfig,
} from '../../data/pcWorkbenchCards';

type EditorMode = 'pick-type' | 'pick-template' | 'edit' | null;
type CardDraft = {
  kind: 'component' | 'link';
  id: string;
  componentKey?: string;
  title: string;
  description: string;
  iconUrl?: string;
  availability: 'all' | 'scoped';
  rangeTargets: ContactSelection[];
  entryUrl?: string;
  detailUrl?: string;
  defaultVisible: boolean;
  enabled: boolean;
  sort: number;
};

const emptyDraft = (): CardDraft => ({
  kind: 'link',
  id: `pc-card-link-${Date.now().toString(36)}`,
  title: '',
  description: '',
  iconUrl: '',
  availability: 'all',
  rangeTargets: [],
  entryUrl: '',
  detailUrl: '',
  defaultVisible: true,
  enabled: true,
  sort: 99,
});

const componentDraft = (componentKey: string, sort: number): CardDraft => {
  const template = findTemplate(componentKey) ?? PC_CARD_TEMPLATES[0];
  return {
    kind: 'component',
    id: `pc-card-${template.componentKey}`,
    componentKey: template.componentKey,
    title: template.name,
    description: template.description,
    iconUrl: '',
    availability: 'all',
    rangeTargets: [],
    entryUrl: '',
    detailUrl: template.defaultDetailUrl ?? '',
    defaultVisible: true,
    enabled: true,
    sort,
  };
};

/** 地址校验：站内 /... 路径或合法 http/https */
const isValidAddress = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/')) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const ICON_MAX_BYTES = 512 * 1024;
const ICON_ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];

/** 图片转 Data URL（格式与大小校验；返回错误信息或 null） */
const readIconAsDataUrl = (file: File): Promise<{ dataUrl?: string; error?: string }> => new Promise(resolve => {
  if (!ICON_ACCEPT.includes(file.type)) { resolve({ error: '图标仅支持 PNG、JPEG 或 WebP 格式' }); return; }
  if (file.size > ICON_MAX_BYTES) { resolve({ error: '图标文件不能超过 512KB' }); return; }
  const reader = new FileReader();
  reader.onload = () => resolve({ dataUrl: String(reader.result) });
  reader.onerror = () => resolve({ error: '图标读取失败，请重试' });
  reader.readAsDataURL(file);
});

/** 管理后台-PC 工作台：卡片目录管理（ApplicationManagement 内 Tab 内容） */
export default function PcWorkbenchAdmin() {
  const [cards, setCards] = useState<PcWorkbenchCardConfig[]>(getPcCards);
  const [userGroupsLive, setUserGroupsLive] = useState<UserGroupRecord[]>(getUserGroups);
  const [toast, setToast] = useState('');
  const [toastError, setToastError] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'全部' | 'component' | 'link'>('全部');
  const [rangeFilter, setRangeFilter] = useState<'全部' | 'all' | 'scoped'>('全部');
  const [statusFilter, setStatusFilter] = useState<'全部' | 'enabled' | 'disabled'>('全部');
  const [keyword, setKeyword] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [draft, setDraft] = useState<CardDraft>(emptyDraft);
  const [isCreate, setIsCreate] = useState(false);
  const [rangeTargetsDraft, setRangeTargetsDraft] = useState<ContactSelection[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => subscribePcCards(() => setCards(getPcCards())), []);
  useEffect(() => subscribeUserGroups(() => setUserGroupsLive(getUserGroups())), []);

  const showToast = (message: string, isError = false) => {
    setToast(message);
    setToastError(isError);
    window.setTimeout(() => { setToast(''); setToastError(false); }, 2200);
  };

  const configuredKeys = useMemo(() => new Set(cards.filter((card): card is ComponentCardConfig => card.kind === 'component').map(card => card.componentKey)), [cards]);
  const availableTemplates = PC_CARD_TEMPLATES.filter(template => !configuredKeys.has(template.componentKey));

  const visibleCards = cards
    .filter(card => typeFilter === '全部' || card.kind === typeFilter)
    .filter(card => rangeFilter === '全部' || card.availability === rangeFilter)
    .filter(card => statusFilter === '全部' || (statusFilter === 'enabled' ? card.enabled : !card.enabled))
    .filter(card => {
      const kw = keyword.trim();
      if (!kw) return true;
      const template = card.kind === 'component' ? findTemplate(card.componentKey) : undefined;
      return card.title.includes(kw)
        || card.description.includes(kw)
        || (template?.name ?? '').includes(kw)
        || card.rangeTargets.some(target => target.name.includes(kw));
    })
    .sort((a, b) => a.sort - b.sort);

  const openCreate = () => {
    setDraft(emptyDraft());
    setRangeTargetsDraft([]);
    setIsCreate(true);
    setEditorMode('pick-type');
  };

  const openEdit = (card: PcWorkbenchCardConfig) => {
    setDraft({ ...card });
    setRangeTargetsDraft(card.rangeTargets);
    setIsCreate(false);
    setEditorMode('edit');
  };

  const beginCreateComponent = () => {
    if (availableTemplates.length === 0) { showToast('全部内置组件模板均已配置', true); return; }
    setDraft(componentDraft(availableTemplates[0].componentKey, cards.length + 1));
    setRangeTargetsDraft([]);
    setEditorMode('pick-template');
  };

  const beginCreateLink = () => {
    setDraft({ ...emptyDraft(), sort: cards.length + 1 });
    setRangeTargetsDraft([]);
    setEditorMode('edit');
  };

  const saveDraft = () => {
    if (!draft.title.trim()) { showToast('请输入卡片标题', true); return; }
    if (!isValidAddress(draft.entryUrl ?? '')) { showToast('主地址仅支持站内 /... 路径或合法 http/https 地址', true); return; }
    if (!isValidAddress(draft.detailUrl ?? '')) { showToast('详情地址仅支持站内 /... 路径或合法 http/https 地址', true); return; }
    if (draft.kind === 'link' && !(draft.entryUrl ?? '').trim()) { showToast('应用入口卡片必须填写主地址', true); return; }
    if (draft.availability === 'scoped') {
      if (rangeTargetsDraft.length === 0) { showToast('请选择可用范围（至少一项）', true); return; }
      const invalid = rangeTargetsDraft.filter(item => item.kind === 'user-group' && !userGroupsLive.some(group => group.id === item.id.replace(/^group:/, '')));
      if (invalid.length > 0) { showToast('存在已失效的用户组，请移除或重新选择', true); return; }
    }
    const rangeTargets = draft.availability === 'all' ? [] : rangeTargetsDraft;
    const base = { title: draft.title.trim(), description: draft.description.trim(), iconUrl: draft.iconUrl, availability: draft.availability === 'all' ? ('all' as const) : ('scoped' as const), rangeTargets, entryUrl: (draft.entryUrl ?? '').trim(), detailUrl: (draft.detailUrl ?? '').trim(), defaultVisible: draft.defaultVisible, enabled: draft.enabled, sort: draft.sort };
    const next: PcWorkbenchCardConfig = draft.kind === 'component'
      ? { kind: 'component' as const, id: draft.id, componentKey: String(draft.componentKey), ...base }
      : { kind: 'link' as const, id: draft.id, ...base, entryUrl: base.entryUrl };
    upsertPcCards([next]);
    setEditorMode(null);
    showToast(isCreate ? '卡片已创建' : '卡片配置已保存');
  };

  const executeDelete = () => {
    if (!confirmDeleteId) return;
    deletePcCard(confirmDeleteId);
    setConfirmDeleteId(null);
    showToast('卡片已删除');
  };

  const templateName = (card: PcWorkbenchCardConfig) => card.kind === 'component' ? (findTemplate(card.componentKey)?.name ?? `未知模板（${card.componentKey}）`) : '—';
  const templateUnavailable = (card: PcWorkbenchCardConfig) => card.kind === 'component' && !findTemplate(card.componentKey);

  return (
    <div className="grid grid-cols-1 gap-5 p-5">
      {toast && (
        <div className={`fixed right-8 top-20 z-50 flex items-center gap-2 rounded px-4 py-2 text-sm text-white shadow-lg ${toastError ? 'bg-red-600' : 'bg-gray-900'}`}>
          <CheckCircle2 size={16} className={toastError ? 'text-red-100' : 'text-green-300'} />
          {toast}
        </div>
      )}

      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">PC 工作台</h3>
            <p className="mt-1 text-sm text-gray-500">管理 PC 个人门户卡片：内置组件卡片与应用入口卡片。</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center gap-1 rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f]">
            <Plus size={16} />新增卡片
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="搜索卡片、模板或范围对象" className="h-10 w-full rounded border border-gray-300 pl-9 pr-3 outline-none focus:border-[#2f75b5]" />
        </div>
        <select value={typeFilter} onChange={event => setTypeFilter(event.target.value as '全部' | 'component' | 'link')} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#2f75b5]">
          <option value="全部">全部类型</option>
          <option value="component">内置组件卡片</option>
          <option value="link">应用入口卡片</option>
        </select>
        <select value={rangeFilter} onChange={event => setRangeFilter(event.target.value as '全部' | 'all' | 'scoped')} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#2f75b5]">
          <option value="全部">全部范围</option>
          <option value="all">全员</option>
          <option value="scoped">部分成员</option>
        </select>
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as '全部' | 'enabled' | 'disabled')} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#2f75b5]">
          <option value="全部">全部状态</option>
          <option value="enabled">启用</option>
          <option value="disabled">停用</option>
        </select>
        <span className="text-xs text-gray-400">共 {visibleCards.length} / {cards.length} 张卡片</span>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="w-[260px] px-4 py-3 font-medium">卡片</th>
              <th className="w-[130px] px-4 py-3 font-medium">类型</th>
              <th className="w-[170px] px-4 py-3 font-medium">可用范围</th>
              <th className="w-[90px] px-4 py-3 font-medium">默认展示</th>
              <th className="w-[80px] px-4 py-3 font-medium">状态</th>
              <th className="w-[70px] px-4 py-3 font-medium">排序</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {visibleCards.map(card => (
              <tr key={card.id} className="border-b border-gray-100 hover:bg-gray-50/60">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {card.iconUrl
                      ? <img src={card.iconUrl} alt={card.title} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      : <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${card.kind === 'component' ? (findTemplate(card.componentKey)?.defaultIcon.tone ?? 'bg-gray-400') : 'bg-[#2f75b5]'}`}><LayoutGrid size={16} /></div>}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-gray-900">{card.title}</span>
                        {templateUnavailable(card) && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">组件不可用</span>}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-gray-500">{card.description || '—'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-700">{card.kind === 'component' ? `内置组件 · ${templateName(card)}` : '应用入口'}</td>
                <td className="px-4 py-4 text-gray-700">{card.availability === 'all' ? '全员' : `部分成员（${card.rangeTargets.length} 项）`}</td>
                <td className="px-4 py-4">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${card.defaultVisible ? 'bg-blue-50 text-[#2f75b5]' : 'bg-gray-100 text-gray-500'}`}>{card.defaultVisible ? '默认展示' : '默认隐藏'}</span>
                </td>
                <td className="px-4 py-4">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${card.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{card.enabled ? '启用' : '停用'}</span>
                </td>
                <td className="px-4 py-4 text-gray-500">{card.sort}</td>
                <td className="px-4 py-4 text-right">
                  <button onClick={() => openEdit(card)} className="text-[#2f75b5] hover:underline">配置</button>
                  {card.kind === 'link' && (
                    <button onClick={() => setConfirmDeleteId(card.id)} className="ml-3 text-red-500 hover:underline">删除</button>
                  )}
                </td>
              </tr>
            ))}
            {visibleCards.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">暂无符合条件的卡片</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 新增第一步：选择卡片类型 */}
      {editorMode === 'pick-type' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">选择卡片类型</h3>
                <p className="mt-1 text-sm text-gray-500">内置组件卡片绑定前台已注册组件；应用入口卡片配置任意站内或外部地址。</p>
              </div>
              <button onClick={() => setEditorMode(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={beginCreateComponent} disabled={availableTemplates.length === 0} className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-[#2f75b5] hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2f75b5] text-white"><LayoutGrid size={18} /></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">内置组件卡片</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">渲染数据概览、周历等复杂组件；一个模板仅可配置一次，不可删除。</p>
                </div>
              </button>
              <button type="button" onClick={beginCreateLink} className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-[#2f75b5] hover:bg-blue-50/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white"><ChevronRight size={18} /></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">应用入口卡片</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">配置标题、图标与主地址的快捷入口；可创建多条，支持删除。</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 内置组件模板选择 */}
      {editorMode === 'pick-template' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">选择内置组件模板</h3>
                <p className="mt-1 text-sm text-gray-500">仅显示尚未配置的模板；模板绑定后不可修改。</p>
              </div>
              <button onClick={() => setEditorMode(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto">
              {availableTemplates.map(template => (
                <button key={template.componentKey} type="button" onClick={() => { setDraft(componentDraft(template.componentKey, cards.length + 1)); setRangeTargetsDraft([]); setEditorMode('edit'); }} className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-[#2f75b5] hover:bg-blue-50/40">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${template.defaultIcon.tone}`}><LayoutGrid size={18} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{template.description}</p>
                  </div>
                </button>
              ))}
              {availableTemplates.length === 0 && <p className="col-span-2 py-10 text-center text-sm text-gray-400">全部模板均已配置</p>}
            </div>
          </div>
        </div>
      )}

      {/* 卡片配置编辑 */}
      {editorMode === 'edit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{isCreate ? '新增卡片' : '配置卡片'}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {draft.kind === 'component' ? `内置组件卡片 · 模板：${findTemplate(draft.componentKey ?? '')?.name ?? draft.componentKey}（不可修改）` : '应用入口卡片'}
                </p>
              </div>
              <button onClick={() => setEditorMode(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="scrollbar-hover min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <section>
                <p className="mb-2 text-xs font-semibold text-gray-500">基础信息</p>
                <div className={draft.kind === 'component' ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-2 gap-3'}>
                  <label className="block text-sm text-gray-700">卡片标题<span className="text-red-500"> *</span>
                    <input value={draft.title ?? ''} onChange={event => setDraft(prev => ({ ...prev, title: event.target.value }))} placeholder="覆盖模板默认标题" className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
                  </label>
                  {draft.kind === 'component' && (
                    <label className="block text-sm text-gray-700">组件模板（只读）
                      <input value={findTemplate(draft.componentKey ?? '')?.name ?? String(draft.componentKey ?? '')} readOnly className="mt-1.5 h-10 w-full rounded border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500 outline-none" />
                    </label>
                  )}
                </div>
                <label className="mt-3 block text-sm text-gray-700">卡片描述
                  <input value={draft.description ?? ''} onChange={event => setDraft(prev => ({ ...prev, description: event.target.value }))} placeholder="用于后台列表与前台辅助说明" className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
                </label>
                <div className="mt-3">
                  <div className="text-sm text-gray-700">卡片图标<span className="ml-1 text-xs text-gray-400">（PNG / JPEG / WebP，≤512KB）</span></div>
                  {draft.iconUrl ? (
                    <div className="relative mt-1.5 inline-block">
                      <img src={draft.iconUrl} alt="卡片图标" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
                      <button type="button" onClick={() => setDraft(prev => ({ ...prev, iconUrl: '' }))} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:border-red-400 hover:text-red-500"><X size={12} /></button>
                    </div>
                  ) : (
                    <label className="mt-1.5 flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:border-[#2f75b5] hover:bg-blue-50/30">
                      <ImageIcon size={16} className="text-gray-400" />
                      <span className="mt-0.5 text-[10px] text-gray-500">上传图片</span>
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={async event => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const result = await readIconAsDataUrl(file);
                        if (result.error) showToast(result.error, true);
                        else setDraft(prev => ({ ...prev, iconUrl: result.dataUrl }));
                        event.target.value = '';
                      }} />
                    </label>
                  )}
                </div>
              </section>

              <section>
                <p className="mb-2 text-xs font-semibold text-gray-500">入口配置</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-gray-700">主地址{draft.kind === 'link' && <span className="text-red-500"> *</span>}
                    <input value={draft.entryUrl ?? ''} onChange={event => setDraft(prev => ({ ...prev, entryUrl: event.target.value }))} placeholder="站内 /... 或 http(s)://..." className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
                  </label>
                  <label className="block text-sm text-gray-700">详情地址（"更多"）
                    <input value={draft.detailUrl ?? ''} onChange={event => setDraft(prev => ({ ...prev, detailUrl: event.target.value }))} placeholder="为空时隐藏/使用模板默认" className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
                  </label>
                </div>
              </section>

              <section className="text-sm text-gray-700">
                <p className="mb-2 text-xs font-semibold text-gray-500">发布配置</p>
                <span>可用范围</span>
                <select
                  value={draft.availability === 'all' ? 'all' : 'scoped'}
                  onChange={event => {
                    const value = event.target.value === 'all' ? 'all' : 'scoped';
                    setDraft(prev => ({ ...prev, availability: value }));
                    if (value === 'all') setRangeTargetsDraft([]);
                  }}
                  className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]"
                >
                  <option value="all">全员</option>
                  <option value="scoped">部分成员</option>
                </select>
                {draft.availability === 'scoped' && (
                  <div className="mt-2">
                    <ContactPicker
                      selections={rangeTargetsDraft}
                      onSelectionsChange={setRangeTargetsDraft}
                      tabs={['directory', 'user-groups']}
                      allowedKinds={['person', 'department', 'user-group']}
                      defaultTab="directory"
                      placeholder="点击以通讯录选择人员、部门或用户组"
                    />
                    {(() => {
                      const invalid = rangeTargetsDraft.filter(item => item.kind === 'user-group' && !userGroupsLive.some(group => group.id === item.id.replace(/^group:/, '')));
                      return invalid.length > 0 ? <p className="mt-1.5 text-xs text-red-600">用户组「{invalid.map(item => item.name).join('、')}」已失效，请移除或重新选择。</p> : null;
                    })()}
                  </div>
                )}
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <label className="block text-sm text-gray-700">默认展示
                    <select value={draft.defaultVisible ? '展示' : '隐藏'} onChange={event => setDraft(prev => ({ ...prev, defaultVisible: event.target.value === '展示' }))} className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]">
                      <option value="展示">默认展示</option>
                      <option value="隐藏">默认隐藏</option>
                    </select>
                  </label>
                  <label className="block text-sm text-gray-700">启用状态
                    <select value={draft.enabled ? '启用' : '停用'} onChange={event => setDraft(prev => ({ ...prev, enabled: event.target.value === '启用' }))} className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]">
                      <option value="启用">启用</option>
                      <option value="停用">停用</option>
                    </select>
                  </label>
                  <label className="block text-sm text-gray-700">排序
                    <input type="number" value={draft.sort ?? 0} onChange={event => setDraft(prev => ({ ...prev, sort: Number(event.target.value) || 0 }))} className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
                  </label>
                </div>
              </section>
            </div>
            <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button onClick={() => setEditorMode(null)} className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={saveDraft} className="rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f]">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认（仅应用入口卡片） */}
      {confirmDeleteId && (() => {
        const target = cards.find(card => card.id === confirmDeleteId);
        if (!target) return null;
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-950">确认删除卡片</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500">删除后用户个人门户将立即移除该应用入口卡片。</p>
                </div>
                <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" title="关闭"><X size={18} /></button>
              </div>
              <div className="mt-5 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <p><span className="text-gray-400">标题：</span>{target.title}</p>
                <p className="mt-2"><span className="text-gray-400">主地址：</span>{target.entryUrl || '—'}</p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">取消</button>
                <button type="button" onClick={executeDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">确认删除</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
