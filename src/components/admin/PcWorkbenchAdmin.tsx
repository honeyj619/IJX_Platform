import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, LayoutGrid, PencilLine, Plus, Search, Trash2, X } from 'lucide-react';
import ContactPicker, { type ContactSelection } from '../ContactPicker';
import { getUserGroups, subscribeUserGroups, type UserGroupRecord } from '../../data/userGroups';
import { MAIN_USER_NAME } from '../../data/people';
import {
  PC_CARD_GROUPS,
  PC_CARD_TEMPLATES,
  canUserAccessCard,
  deletePcCard,
  getPcCards,
  subscribePcCards,
  updatePcCard,
  upsertPcCards,
  type PcWorkbenchCardConfig,
} from '../../data/pcWorkbenchCards';

type EditorMode = 'pick-template' | 'edit' | null;

type CardDraft = PcWorkbenchCardConfig;

const defaultDraft = (templateComponentKey: string): CardDraft => {
  const template = PC_CARD_TEMPLATES.find(item => item.componentKey === templateComponentKey) ?? PC_CARD_TEMPLATES[0];
  return {
    id: `pc-card-${template.componentKey}-${Date.now().toString(36)}`,
    componentKey: template.componentKey,
    title: template.name,
    description: template.description,
    icon: { ...template.defaultIcon },
    groupId: PC_CARD_GROUPS[0].id,
    availability: 'all',
    rangeTargets: [],
    openMode: 'auto',
    defaultVisible: true,
    enabled: true,
    sort: 99,
  };
};

/** 管理后台-PC 工作台：卡片分组 + 卡片目录（模板实例），与 APP 应用管理分离 */
export default function PcWorkbenchAdmin() {
  const [cards, setCards] = useState<PcWorkbenchCardConfig[]>(getPcCards);
  const [userGroupsLive, setUserGroupsLive] = useState<UserGroupRecord[]>(getUserGroups);
  const [toast, setToast] = useState('');
  const [groupFilter, setGroupFilter] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [rangeFilter, setRangeFilter] = useState<'全部' | '全员' | '部分成员'>('全部');
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [draft, setDraft] = useState<CardDraft>(() => defaultDraft(PC_CARD_TEMPLATES[0].componentKey));
  const [isCreate, setIsCreate] = useState(false);
  const [rangeTargetsDraft, setRangeTargetsDraft] = useState<ContactSelection[]>([]);
  const [groupManageOpen, setGroupManageOpen] = useState(false);

  useEffect(() => subscribePcCards(() => setCards(getPcCards())), []);
  useEffect(() => subscribeUserGroups(() => setUserGroupsLive(getUserGroups())), []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const configuredKeys = useMemo(() => new Set(cards.map(card => card.componentKey)), [cards]);
  const availableTemplates = PC_CARD_TEMPLATES.filter(template => !configuredKeys.has(template.componentKey));

  const visibleCards = cards
    .filter(card => groupFilter === '全部' || card.groupId === groupFilter)
    .filter(card => rangeFilter === '全部' || (rangeFilter === '全员' ? card.availability === 'all' : card.availability === 'scoped'))
    .filter(card => {
      const kw = keyword.trim();
      if (!kw) return true;
      const template = PC_CARD_TEMPLATES.find(item => item.componentKey === card.componentKey);
      return card.title.includes(kw)
        || card.description.includes(kw)
        || (template?.name ?? '').includes(kw)
        || card.rangeTargets.some(target => target.name.includes(kw));
    })
    .sort((a, b) => a.sort - b.sort);

  const openCreate = () => {
    setDraft(defaultDraft(availableTemplates[0]?.componentKey ?? PC_CARD_TEMPLATES[0].componentKey));
    setRangeTargetsDraft([]);
    setIsCreate(true);
    setEditorMode('pick-template');
  };

  const openEdit = (card: PcWorkbenchCardConfig) => {
    setDraft({ ...card });
    setRangeTargetsDraft(card.rangeTargets);
    setIsCreate(false);
    setEditorMode('edit');
  };

  const saveDraft = () => {
    if (!draft.title.trim()) { showToast('请输入卡片标题'); return; }
    if (draft.availability === 'scoped') {
      if (rangeTargetsDraft.length === 0) { showToast('请选择可用范围（至少一项）'); return; }
      const invalid = rangeTargetsDraft.filter(item => item.kind === 'user-group' && !userGroupsLive.some(group => group.id === item.id.replace(/^group:/, '')));
      if (invalid.length > 0) { showToast('存在已失效的用户组，请移除或重新选择'); return; }
    }
    const next: PcWorkbenchCardConfig = { ...draft, title: draft.title.trim(), availability: draft.availability === 'all' ? 'all' : 'scoped', rangeTargets: draft.availability === 'all' ? [] : rangeTargetsDraft };
    upsertPcCards([next]);
    setEditorMode(null);
    showToast(isCreate ? '卡片已创建' : '卡片配置已保存');
  };

  const templateUnavailable = (componentKey: string) => !PC_CARD_TEMPLATES.some(template => template.componentKey === componentKey);
  const groupName = (id: string) => PC_CARD_GROUPS.find(group => group.id === id)?.name ?? '未分组';
  const templateName = (componentKey: string) => PC_CARD_TEMPLATES.find(template => template.componentKey === componentKey)?.name ?? `未知模板（${componentKey}）`;

  return (
    <div className="min-h-[calc(100vh-7rem)] w-full min-w-0 bg-[#eef1f5] text-sm text-gray-800">
      {toast && (
        <div className="fixed right-8 top-20 z-50 flex items-center gap-2 rounded bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          <CheckCircle2 size={16} className="text-green-300" />
          {toast}
        </div>
      )}

      <div className="bg-white px-8 py-5">
        <div className="mb-4 text-sm text-gray-500">
          首页 <span className="mx-2">/</span> 工作台 <span className="mx-2">/</span>
          <span className="text-gray-800">PC工作台 · 卡片管理</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[26px] font-semibold text-gray-900">PC工作台卡片</h2>
            <p className="mt-2 text-sm text-gray-500">管理个人门户已注册的卡片实例：模板选择、标题覆盖、可用范围与入口配置。</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setGroupManageOpen(true)} className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">卡片分组</button>
            <button onClick={openCreate} disabled={availableTemplates.length === 0} title={availableTemplates.length === 0 ? '全部模板均已配置（一个模板仅允许一个实例）' : undefined} className="inline-flex items-center gap-1 rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f] disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={16} />新增卡片
            </button>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="搜索卡片、模板或范围对象" className="h-10 w-full rounded border border-gray-300 pl-9 pr-3 outline-none focus:border-[#2f75b5]" />
          </div>
          <select value={groupFilter} onChange={event => setGroupFilter(event.target.value)} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#2f75b5]">
            <option value="全部">全部分组</option>
            {PC_CARD_GROUPS.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
          <select value={rangeFilter} onChange={event => setRangeFilter(event.target.value as '全部' | '全员' | '部分成员')} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#2f75b5]">
            <option value="全部">全部范围</option>
            <option value="全员">全员</option>
            <option value="部分成员">部分成员</option>
          </select>
          <span className="text-xs text-gray-400">当前用户可见 {cards.filter(card => card.enabled && canUserAccessCard(card, MAIN_USER_NAME)).length} / {cards.length} 张</span>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="w-[240px] px-4 py-3 font-medium">卡片</th>
                <th className="w-[140px] px-4 py-3 font-medium">组件模板</th>
                <th className="w-[180px] px-4 py-3 font-medium">可用范围</th>
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
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${card.icon.tone}`}><LayoutGrid size={16} /></div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-gray-900">{card.title}</span>
                          {templateUnavailable(card.componentKey) && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">组件不可用</span>}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-gray-500">{card.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-700">{templateName(card.componentKey)}</td>
                  <td className="px-4 py-4 text-gray-700">
                    {card.availability === 'all' ? '全员' : `部分成员（${card.rangeTargets.length} 项）`}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${card.defaultVisible ? 'bg-blue-50 text-[#2f75b5]' : 'bg-gray-100 text-gray-500'}`}>{card.defaultVisible ? '默认展示' : '默认隐藏'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${card.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{card.enabled ? '启用' : '停用'}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{card.sort}</td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => openEdit(card)} className="text-[#2f75b5] hover:underline">配置</button>
                    <button onClick={() => { if (window.confirm(`确认删除卡片「${card.title}」？`)) { deletePcCard(card.id); showToast('卡片已删除'); } }} className="ml-3 text-red-500 hover:underline">删除</button>
                  </td>
                </tr>
              ))}
              {visibleCards.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">暂无符合条件的卡片</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模板选择（新增第一步） */}
      {editorMode === 'pick-template' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">从已注册卡片模板中选择</h3>
                <p className="mt-1 text-sm text-gray-500">一个组件模板仅允许一个有效实例；已配置的模板不再显示。</p>
              </div>
              <button onClick={() => setEditorMode(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto">
              {availableTemplates.map(template => (
                <button key={template.componentKey} type="button" onClick={() => { setDraft(prev => ({ ...defaultDraft(template.componentKey), sort: cards.length + 1 })); setRangeTargetsDraft([]); setEditorMode('edit'); }} className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:border-[#2f75b5] hover:bg-blue-50/40">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${template.defaultIcon.tone}`}><LayoutGrid size={18} /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{template.name}</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">{template.description}</p>
                    <p className="mt-1.5 text-[10px] text-gray-400">componentKey: {template.componentKey} · 能力：{template.capabilities.join(' / ') || '—'}</p>
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
                <p className="mt-1 text-xs text-gray-500">组件模板：{templateName(draft.componentKey)}（创建后不可修改）</p>
              </div>
              <button onClick={() => setEditorMode(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="scrollbar-hover min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <section>
                <p className="mb-2 text-xs font-semibold text-gray-500">基础信息</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-gray-700">卡片标题
                    <input value={draft.title} onChange={event => setDraft(prev => ({ ...prev, title: event.target.value }))} placeholder="覆盖模板默认标题" className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
                  </label>
                  <label className="block text-sm text-gray-700">所属分组
                    <select value={draft.groupId} onChange={event => setDraft(prev => ({ ...prev, groupId: event.target.value }))} className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]">
                      {PC_CARD_GROUPS.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                    </select>
                  </label>
                </div>
                <label className="mt-3 block text-sm text-gray-700">卡片描述
                  <input value={draft.description} onChange={event => setDraft(prev => ({ ...prev, description: event.target.value }))} placeholder="用于后台列表与前台选择卡片时的辅助说明" className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block text-sm text-gray-700">卡片图标（预设）
                    <select value={draft.icon.preset} onChange={event => setDraft(prev => ({ ...prev, icon: { ...prev.icon, preset: event.target.value } }))} className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]">
                      {['trending-up', 'file-text', 'calendar', 'layout', 'clipboard-list', 'bell'].map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm text-gray-700">图标颜色
                    <select value={draft.icon.tone} onChange={event => setDraft(prev => ({ ...prev, icon: { ...prev.icon, tone: event.target.value } }))} className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]">
                      {['bg-pink-600', 'bg-purple-500', 'bg-indigo-500', 'bg-amber-500', 'bg-teal-500', 'bg-rose-500'].map(tone => <option key={tone} value={tone}>{tone.replace('bg-', '')}</option>)}
                    </select>
                  </label>
                </div>
              </section>

              <section>
                <p className="mb-2 text-xs font-semibold text-gray-500">入口配置</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-gray-700">入口地址（主入口）
                    <input value={draft.entryUrl ?? ''} onChange={event => setDraft(prev => ({ ...prev, entryUrl: event.target.value || undefined }))} placeholder="为空时卡片不提供主入口" className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
                  </label>
                  <label className="block text-sm text-gray-700">详情地址（"更多"）
                    <input value={draft.detailUrl ?? ''} onChange={event => setDraft(prev => ({ ...prev, detailUrl: event.target.value || undefined }))} placeholder="为空时隐藏右上角更多按钮" className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
                  </label>
                </div>
                <label className="mt-3 block text-sm text-gray-700">打开方式
                  <select value={draft.openMode} onChange={event => setDraft(prev => ({ ...prev, openMode: event.target.value as 'auto' | 'browser' | 'native' }))} className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]">
                    <option value="auto">自动判断</option>
                    <option value="browser">外部浏览器打开</option>
                    <option value="native">原生能力打开</option>
                  </select>
                </label>
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
                      placeholder="选择人员、部门或用户组"
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
                    <input type="number" value={draft.sort} onChange={event => setDraft(prev => ({ ...prev, sort: Number(event.target.value) || 0 }))} className="mt-1.5 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
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

      {/* 分组管理（只读展示，原型阶段） */}
      {groupManageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">卡片分组</h3>
              <button onClick={() => setGroupManageOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              {[...PC_CARD_GROUPS].sort((a, b) => a.order - b.order).map(group => (
                <div key={group.id} className="flex items-center justify-between rounded border border-gray-100 px-4 py-3">
                  <span className="text-sm font-medium text-gray-800">{group.name}</span>
                  <span className="text-xs text-gray-400">{cards.filter(card => card.groupId === group.id).length} 张卡片</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
