import { useMemo, useState } from 'react';
import { Building2, ChevronRight, MessageCircle, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Enterprise from './Enterprise';
import EnterpriseFloatingBar from '../components/EnterpriseFloatingBar';
import { contactDirectory, contactGroups } from '../data/contactDirectory';
import { getPersonAvatar, MAIN_USER_AVATAR, MAIN_USER_NAME } from '../data/people';

const portalNavItems = ['首页', '文档中心', '流程中心', '协作办公', 'AI门户', '业务系统', '航班动态', '通讯录', '数据看板'];

function buildWebClientUrl() {
  const base = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL;
  return `${window.location.origin}${base}pc_client`;
}

export default function PcWebPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const isContacts = location.pathname.endsWith('/contacts');
  const [selectedDepartment, setSelectedDepartment] = useState(contactGroups[0]);
  const [keyword, setKeyword] = useState('');
  const [revealedMobiles, setRevealedMobiles] = useState<Set<string>>(() => new Set());

  const contacts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return contactDirectory.filter((person) => {
      const departmentMatches = person.department === selectedDepartment;
      const keywordMatches = !normalizedKeyword || [person.name, person.title, person.department, person.email]
        .some((value) => value.toLowerCase().includes(normalizedKeyword));
      return departmentMatches && keywordMatches;
    });
  }, [keyword, selectedDepartment]);

  const openNav = (label: string) => {
    if (label === '首页') navigate('/pc_web');
    if (label === '通讯录') navigate('/pc_web/contacts');
  };

  const startConversation = (name: string) => {
    window.localStorage.setItem('ijx-pcweb-message-target', JSON.stringify({ name, createdAt: Date.now() }));
    window.open(buildWebClientUrl(), '_blank', 'noopener,noreferrer');
  };

  const toggleMobile = (personId: string) => {
    setRevealedMobiles((current) => {
      const next = new Set(current);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });
  };

  return (
    <div className="min-h-full min-w-[1180px] bg-gray-100 text-gray-900">
      <div className="h-6 bg-theme-700" />
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-[88px] max-w-[1240px] items-center gap-7 px-6">
          <button type="button" onClick={() => navigate('/pc_web')} className="flex shrink-0 items-center gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-theme-50 text-theme-700"><Building2 size={21} /></span>
            <span><strong className="block text-sm tracking-wide text-theme-800">JUNEYAO AIR</strong><span className="text-xs text-gray-500">i吉祥 PC Web</span></span>
          </button>
          <nav className="flex min-w-0 flex-1 items-center justify-center gap-1">
            {portalNavItems.map((label) => {
              const active = label === (isContacts ? '通讯录' : '首页');
              const enabled = label === '首页' || label === '通讯录';
              return <button key={label} type="button" onClick={() => openNav(label)} className={`relative whitespace-nowrap px-3 py-8 text-sm font-semibold transition-colors ${active ? 'text-theme-700' : enabled ? 'text-gray-600 hover:text-theme-700' : 'cursor-default text-gray-400'}`}>{label}{active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-theme-600" />}</button>;
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-3 border-l border-gray-200 pl-5">
            <Search size={20} className="text-gray-400" />
            <img src={MAIN_USER_AVATAR} alt="" className="h-9 w-9 rounded-full object-cover" />
            <span className="text-sm font-medium">{MAIN_USER_NAME}</span>
          </div>
        </div>
      </header>

      <div className="bg-gray-700 text-white">
        <div className="mx-auto flex h-9 max-w-[1240px] items-center gap-2 px-6 text-xs"><span>您的位置：首页</span><ChevronRight size={13} /><span>{isContacts ? '通讯录' : '企业门户'}</span></div>
      </div>

      {isContacts ? (
        <main className="mx-auto grid max-w-[1240px] grid-cols-[250px_minmax(0,1fr)] gap-5 px-6 py-7">
          <aside className="min-h-[650px] bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-800">组织架构</h2>
            <div className="space-y-1">
              {contactGroups.map((department) => {
                const count = contactDirectory.filter((person) => person.department === department).length;
                return <button key={department} type="button" onClick={() => setSelectedDepartment(department)} className={`flex w-full items-center gap-2 rounded px-3 py-2.5 text-left text-sm ${selectedDepartment === department ? 'bg-theme-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}><ChevronRight size={14} /><span className="min-w-0 flex-1 truncate">{department}</span><span className={selectedDepartment === department ? 'text-white/75' : 'text-gray-400'}>({count})</span></button>;
              })}
            </div>
          </aside>

          <section className="min-h-[650px] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div><h1 className="text-xl font-semibold">{selectedDepartment}</h1><p className="mt-1 text-xs text-gray-400">共 {contacts.length} 位成员</p></div>
              <label className="relative block w-72"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索姓名、岗位或邮箱" className="h-9 w-full rounded border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-theme-400" /></label>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              {contacts.map((person) => (
                <article key={person.id} className="relative min-h-[238px] rounded border border-gray-200 bg-white p-5 pr-36 transition-shadow hover:shadow-md">
                  <div className="truncate text-sm text-gray-800">{person.company}</div>
                  <div className="mt-5 flex min-w-0 items-baseline gap-4">
                    <h3 className="shrink-0 text-base font-semibold text-gray-950">{person.name}</h3>
                    <span className="truncate text-sm text-gray-800">{person.title}</span>
                  </div>
                  <div className="mt-2 truncate text-sm text-gray-800">{person.department} <span className="px-1 text-gray-300">|</span> {person.organizationUnit}</div>
                  <dl className="mt-6 space-y-2 text-sm">
                    <div className="flex min-w-0"><dt className="w-20 shrink-0 text-gray-400">办公室电话</dt><dd className="truncate text-gray-700">{person.officePhone}</dd></div>
                    <div className="flex min-w-0"><dt className="w-20 shrink-0 text-gray-400">手机号码</dt><dd><button type="button" onClick={() => toggleMobile(person.id)} className="text-blue-600 hover:underline">{revealedMobiles.has(person.id) ? person.mobile : '查看'}</button></dd></div>
                    <div className="flex min-w-0"><dt className="w-20 shrink-0 text-gray-400">工号</dt><dd className="truncate text-gray-700">{person.employeeNo}</dd></div>
                    <div className="flex min-w-0"><dt className="w-20 shrink-0 text-gray-400">电子邮箱</dt><dd className="truncate text-gray-700" title={person.email}>{person.email}</dd></div>
                  </dl>
                  <div className="absolute right-5 top-12 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-theme-500 bg-theme-50 text-2xl font-semibold text-theme-700">
                    <span>{person.name.slice(0, 1)}</span>
                    <img src={getPersonAvatar(person.name)} alt={person.name} className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  </div>
                  <button type="button" onClick={() => startConversation(person.name)} className="absolute bottom-5 right-5 inline-flex h-8 items-center gap-1.5 rounded border border-theme-200 px-2.5 text-xs font-medium text-theme-700 hover:bg-theme-50"><MessageCircle size={14} />发消息</button>
                </article>
              ))}
            </div>
            {contacts.length === 0 && <div className="py-24 text-center text-sm text-gray-400">未找到匹配的人员</div>}
          </section>
        </main>
      ) : (
        <div className="h-[calc(100vh-153px)] min-h-[720px]"><Enterprise embeddedInPcWeb /></div>
      )}

      {/* 右侧悬浮导航栏（通用组件）：PC Web 所有页面统一渲染，上下文按页面区分 */}
      <EnterpriseFloatingBar pageContext={{ title: isContacts ? 'PC Web 通讯录' : 'PC Web 企业门户', path: `${location.pathname}${location.search}` }} />
    </div>
  );
}
