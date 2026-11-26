import { useMemo, useState } from 'react';
import { Headset, Mail, Star, UserPlus, UserRoundPlus, Users } from 'lucide-react';
import {
  contactDirectory, CONTACT_ORG_ROOT,
  type ContactPerson, type ContactOrgNode,
} from '@/data/contactDirectory';
import { useContactDirectoryStore } from '@/store/contactDirectoryStore';
import ContactBrowser from '@/components/contacts/ContactBrowser';
import ContactCategoryNav from '@/components/contacts/ContactCategoryNav';
import ContactDeptRow from '@/components/contacts/ContactDeptRow';
import ContactEmptyScope from '@/components/contacts/ContactEmptyScope';
import ContactPersonRow from '@/components/contacts/ContactPersonRow';
import ContactProfileCard from '@/components/contacts/ContactProfileCard';
import { CONTACT_SCOPES, type ContactScope } from '@/constants/contactScopes';

/** 公司根到目标节点的路径（面包屑）；找不到时回落到根 */
function findNodePath(node: ContactOrgNode, targetId: string): ContactOrgNode[] | null {
  if (node.id === targetId) return [node];
  for (const child of node.children ?? []) {
    const childPath = findNodePath(child, targetId);
    if (childPath) return [node, ...childPath];
  }
  return null;
}

export default function Contacts() {
  const { preferences } = useContactDirectoryStore();

  const [scope, setScope] = useState<ContactScope>('org');
  const [selectedDeptId, setSelectedDeptId] = useState<string>(CONTACT_ORG_ROOT.id);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [toast, setToast] = useState('');
  const showToast = (text: string) => { setToast(text); window.setTimeout(() => setToast(''), 2200); };

  const starredIds = useMemo(
    () => new Set(Object.entries(preferences).filter(([, preference]) => preference.starred).map(([contactId]) => contactId)),
    [preferences],
  );

  const nodeById = useMemo(() => {
    const map = new Map<string, ContactOrgNode>();
    const walk = (node: ContactOrgNode) => { map.set(node.id, node); (node.children ?? []).forEach(walk); };
    walk(CONTACT_ORG_ROOT);
    return map;
  }, []);

  const currentNode = useMemo(() => nodeById.get(selectedDeptId) ?? CONTACT_ORG_ROOT, [nodeById, selectedDeptId]);
  const breadcrumb = useMemo(() => findNodePath(CONTACT_ORG_ROOT, currentNode.id) ?? [CONTACT_ORG_ROOT], [currentNode]);

  const scopeMeta = CONTACT_SCOPES.find((item) => item.key === scope) ?? CONTACT_SCOPES[0];

  /** 星标分类的列表来源：已星标联系人 */
  const starredPeople = useMemo(
    () => contactDirectory.filter((person) => starredIds.has(person.id)),
    [starredIds],
  );

  const selected = selectedContactId ? contactDirectory.find((person) => person.id === selectedContactId) ?? null : null;

  const currentMembers = useMemo(() => {
    const ids = new Set(currentNode.memberIds ?? []);
    return contactDirectory.filter((person) => ids.has(person.id));
  }, [currentNode]);

  const handleScopeChange = (next: ContactScope) => {
    setScope(next);
    setSelectedContactId(null);
    setCardOpen(false);
  };

  const enterNode = (nodeId: string) => setSelectedDeptId(nodeId);

  const enterPerson = (person: ContactPerson) => {
    setSelectedContactId(person.id);
    setCardOpen(true);
  };

  const enterDepartmentOf = (person: ContactPerson) => {
    const target = (CONTACT_ORG_ROOT.children ?? []).find((child) => child.name === person.department);
    setScope('org');
    setSelectedDeptId(target?.id ?? CONTACT_ORG_ROOT.id);
  };

  const listContent = () => {
    if (scope === 'org') {
      if (currentMembers.length === 0 && (currentNode.children ?? []).length === 0) {
        return <ContactEmptyScope icon={Users} title="该部门暂无成员" description="可在左侧分类切换其他分区" />;
      }
      return (
        <>
          {(currentNode.children ?? []).map((child) => (
            <ContactDeptRow key={child.id} node={child} onEnter={(node) => enterNode(node.id)} />
          ))}
          {currentMembers.map((person) => (
            <ContactPersonRow
              key={person.id}
              person={person}
              active={person.id === selectedContactId}
              starred={starredIds.has(person.id)}
              onSelect={enterPerson}
            />
          ))}
        </>
      );
    }

    if (scope === 'starred') {
      if (starredPeople.length === 0) {
        return <ContactEmptyScope icon={Star} title="暂无星标联系人" description="在联系人名片的更多菜单中设为星标后，会出现在这里" />;
      }
      return starredPeople.map((person) => (
        <ContactPersonRow
          key={person.id}
          person={person}
          active={person.id === selectedContactId}
          starred
          onSelect={enterPerson}
        />
      ));
    }

    switch (scope) {
      case 'external':
        return <ContactEmptyScope icon={UserRoundPlus} title="暂无外部联系人" description="外部联系人能力尚未接入真实通讯录服务" showSoon />;
      case 'new':
        return <ContactEmptyScope icon={UserPlus} title="暂无新的联系人" description="好友申请与新的联系人通知尚未接入" showSoon />;
      case 'mail':
        return <ContactEmptyScope icon={Mail} title="暂无邮箱联系人" description="邮箱联系人同步尚未接入" showSoon />;
      case 'groups':
        return <ContactEmptyScope icon={Users} title="我的群组浏览暂未开放" description="群组数据可在消息页查看" showSoon />;
      default:
        return <ContactEmptyScope icon={Headset} title="服务台暂未开放" description="员工服务台入口尚未接入" showSoon />;
    }
  };

  return (
    <div className="flex h-full min-w-0 overflow-hidden">
      <ContactCategoryNav
        company={contactDirectory[0]?.company ?? CONTACT_ORG_ROOT.name}
        companyMark={CONTACT_ORG_ROOT.name.charAt(0) || '企'}
        scope={scope}
        onScopeChange={handleScopeChange}
        onManage={() => showToast('企业管理暂未开放，请在管理后台操作')}
      />

      <ContactBrowser
        title={scopeMeta.label}
        breadcrumb={scope === 'org' ? breadcrumb : undefined}
        onNavigateCrumb={enterNode}
        footerNote={scope === 'org' ? '在线状态为演示数据（mock）' : undefined}
      >
        {listContent()}
      </ContactBrowser>

      <ContactProfileCard
        open={cardOpen}
        person={selected}
        onClose={() => setCardOpen(false)}
        onToast={showToast}
        onEnterDepartment={enterDepartmentOf}
      />

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[130] -translate-x-1/2 rounded-lg bg-gray-900/90 px-4 py-2 text-sm text-white shadow-lg dark:bg-gray-100/95 dark:text-gray-900">{toast}</div>
      )}
    </div>
  );
}
