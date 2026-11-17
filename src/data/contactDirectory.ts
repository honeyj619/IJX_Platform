// 平台内通讯录（原型 mock）：人名统一取自 people.ts（三国人物），按部门分组
import { THREE_KINGDOMS_NAMES, getInitialsAvatar } from './people';

export interface ContactPerson {
  id: string;
  name: string;
  company: string;
  /** 展示用邮箱（选中后由系统关联，无需用户录入） */
  email: string;
  department: string;
  organizationUnit: string;
  title: string;
  officePhone: string;
  mobile: string;
  employeeNo: string;
  /** 域账号（2026-11-17 PC Client 通讯录：由邮箱前缀派生，演示数据） */
  account?: string;
  /** 在线状态（2026-11-17 PC Client 通讯录：无真实在线服务，固定 mock 派生） */
  status?: 'online' | 'busy' | 'away' | 'offline';
}

/** PC 通讯录组织树节点：只存联系人 ID，人员资料统一由 contactDirectory 读取 */
export interface ContactOrgNode {
  id: string;
  name: string;
  parentId?: string;
  memberIds?: string[];
  children?: ContactOrgNode[];
}

const buildEmail = (name: string) => {
  const pinyin: Record<string, string> = {
    刘备: 'liubei', 关羽: 'guanyu', 张飞: 'zhangfei', 诸葛亮: 'zhugeliang', 赵云: 'zhaoyun',
    马超: 'machao', 黄忠: 'huangzhong', 曹操: 'caocao', 司马懿: 'simayi', 郭嘉: 'guojia',
    荀彧: 'xunyu', 夏侯惇: 'xiahoudun', 张辽: 'zhangliao', 许褚: 'xuchu', 孙权: 'sunquan',
    周瑜: 'zhouyu', 鲁肃: 'lusu', 陆逊: 'luxun', 吕蒙: 'lvmeng', 甘宁: 'ganning',
    黄盖: 'huanggai', 吕布: 'lvbu', 貂蝉: 'diaochan', 董卓: 'dongzhuo', 袁绍: 'yuanshao',
    袁术: 'yuanshu', 庞统: 'pangtong', 姜维: 'jiangwei', 魏延: 'weiyan', 徐庶: 'xushu',
    接总: 'jiezong', 任总: 'renzong', 孔丰汇: 'kongfenghui',
  };
  return `${pinyin[name] || 'member'}@juneyaoair.com`;
};

/** 平台演示通讯录；业务明确指定的固定推送人不进组织树（仅企微收件人规则使用，见 AdvisorWorkbench/WorkReport）。 */
const directoryDefinition: Array<[string, string, Array<[string, string]>]> = [
  ['公司领导', '决策层', [
    ['刘备', '项目发起人'], ['孙权', '分管领导'],
  ]],
  ['信息技术部', 'IT 研发', [
    ['诸葛亮', '项目经理'], ['司马懿', 'IT项目经理'], ['张飞', '开发工程师'], ['赵云', '开发工程师'],
    ['马超', '测试工程师'], ['黄忠', '测试工程师'], ['姜维', '前端工程师'], ['魏延', '后端工程师'],
  ]],
  ['IT-PMO', '项目管理办公室', [
    ['曹操', 'PMO负责人'], ['荀彧', '项目管理工程师'], ['郭嘉', '项目管理工程师'],
  ]],
  ['市场部', '品牌市场', [
    ['周瑜', '市场总监'], ['鲁肃', '品牌经理'], ['陆逊', '渠道经理'],
  ]],
  ['财务部', '财务', [
    ['张辽', '财务分析'], ['吕蒙', '预算管理'],
  ]],
  ['运营部', '运营', [
    ['甘宁', '运营主管'], ['黄盖', '用户运营'],
  ]],
  ['人力资源部', 'HR', [
    ['徐庶', 'HRBP'], ['庞统', '培训经理'],
  ]],
];

export const contactDirectory: ContactPerson[] = directoryDefinition.flatMap(([department, organizationUnit, members], departmentIndex) =>
  members.map(([name, title], memberIndex) => {
    const sequence = departmentIndex * 100 + memberIndex;
    const email = buildEmail(name);
    // 演示状态：按序取模固定派生，标注为 mock（无真实在线服务）
    const demoStatuses = ['online', 'busy', 'away', 'offline'] as const;
    return {
      id: `c-${name}`,
      name,
      company: '上海吉祥航空股份有限公司',
      email,
      department,
      organizationUnit,
      title,
      officePhone: `66${String(3200 + sequence).padStart(4, '0')}`,
      mobile: `138****${String(4200 + sequence).slice(-4)}`,
      employeeNo: `H000-${String(6700 + sequence).padStart(7, '0')}`,
      account: email.split('@')[0],
      status: demoStatuses[sequence % 4],
    };
  })
);

export const contactGroups = Array.from(new Set(contactDirectory.map(person => person.department)));

export const findContactByName = (name: string) => contactDirectory.find(person => person.name === name);

/** PC Client 通讯录组织树：公司根 → 部门（directoryDefinition 顺序），节点只存联系人 ID */
export const CONTACT_ORG_ROOT: ContactOrgNode = {
  id: 'pc-org-root',
  name: '吉祥航空',
  memberIds: [],
  children: directoryDefinition.map(([department]) => ({
    id: `pc-org-${department}`,
    name: department,
    parentId: 'pc-org-root',
    memberIds: contactDirectory.filter(p => p.department === department).map(p => p.id),
  })),
};

/** 展平组织树 */
export const flattenContactOrg = (node: ContactOrgNode): ContactOrgNode[] => [
  node,
  ...(node.children ?? []).flatMap(flattenContactOrg),
];

/** 部门节点成员数（含子部门） */
export const countContactOrgMembers = (node: ContactOrgNode): number =>
  (node.memberIds?.length ?? 0) + (node.children ?? []).reduce((sum, c) => sum + countContactOrgMembers(c), 0);

/** 企微群组（原型 mock） */
export const wecomGroups = [
  '旅游度假平台项目群',
  '信息技术部大群',
  'IT-PMO 协作群',
];

/** 校验人名是否来自统一人名池 */
export const isKnownPerson = (name: string) => THREE_KINGDOMS_NAMES.includes(name);

export { getInitialsAvatar };
