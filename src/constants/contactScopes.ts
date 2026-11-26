import {
  Building2, Headset, Mail, Star, UserPlus, UserRoundPlus, Users, type LucideIcon,
} from 'lucide-react';

/** 通讯录分区：对齐参考图的分类菜单，其中仅组织内 / 星标为真实数据源 */
export type ContactScope = 'org' | 'external' | 'new' | 'starred' | 'mail' | 'groups' | 'service';

export const CONTACT_SCOPES: Array<{ key: ContactScope; label: string; icon: LucideIcon }> = [
  { key: 'org', label: '组织内联系人', icon: Building2 },
  { key: 'external', label: '外部联系人', icon: UserRoundPlus },
  { key: 'new', label: '新的联系人', icon: UserPlus },
  { key: 'starred', label: '星标联系人', icon: Star },
  { key: 'mail', label: '邮箱联系人', icon: Mail },
  { key: 'groups', label: '我的群组', icon: Users },
  { key: 'service', label: '服务台', icon: Headset },
];
