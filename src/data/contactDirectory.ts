// 平台内通讯录（原型 mock）：人名统一取自 people.ts（三国人物），按部门分组
import { THREE_KINGDOMS_NAMES, getInitialsAvatar } from './people';

export interface ContactPerson {
  id: string;
  name: string;
  /** 展示用邮箱（选中后由系统关联，无需用户录入） */
  email: string;
  department: string;
  title: string;
}

const buildEmail = (name: string) => {
  const pinyin: Record<string, string> = {
    刘备: 'liubei', 关羽: 'guanyu', 张飞: 'zhangfei', 诸葛亮: 'zhugeliang', 赵云: 'zhaoyun',
    马超: 'machao', 黄忠: 'huangzhong', 曹操: 'caocao', 司马懿: 'simayi', 郭嘉: 'guojia',
    荀彧: 'xunyu', 夏侯惇: 'xiahoudun', 张辽: 'zhangliao', 许褚: 'xuchu', 孙权: 'sunquan',
    周瑜: 'zhouyu', 鲁肃: 'lusu', 陆逊: 'luxun', 吕蒙: 'lvmeng', 甘宁: 'ganning',
    黄盖: 'huanggai', 吕布: 'lvbu', 貂蝉: 'diaochan', 董卓: 'dongzhuo', 袁绍: 'yuanshao',
    袁术: 'yuanshu', 庞统: 'pangtong', 姜维: 'jiangwei', 魏延: 'weiyan', 徐庶: 'xushu',
  };
  return `${pinyin[name] || 'member'}@juneyaoair.com`;
};

/** 从三国人名池构建通讯录（不自创人名） */
const directoryDefinition: Array<[string, string, Array<[string, string]>]> = [
  ['公司领导', '决策层', [
    ['刘备', '项目发起人'], ['孙权', '分管领导'],
  ]],
  ['信息技术部', 'IT 研发', [
    ['诸葛亮', '项目经理'], ['司马懿', 'IT项目经理'], ['张飞', '开发工程师'], ['赵云', '开发工程师'],
    ['马超', '测试工程师'], ['黄忠', '测试工程师'], ['姜维', '前端工程师'], ['魏延', '后端工程师'],
  ]],
  ['IT-PMO', '项目管理办公室', [
    ['曹操', 'PMO负责人'], ['荀彧', 'PMO专员'], ['郭嘉', '需求分析师'],
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

export const contactDirectory: ContactPerson[] = directoryDefinition.flatMap(([department, , members]) =>
  members.map(([name, title]) => ({ id: `c-${name}`, name, email: buildEmail(name), department, title }))
);

export const contactGroups = Array.from(new Set(contactDirectory.map(person => person.department)));

export const findContactByName = (name: string) => contactDirectory.find(person => person.name === name);

/** 企微群组（原型 mock） */
export const wecomGroups = [
  '旅游度假平台项目群',
  '信息技术部大群',
  'IT-PMO 协作群',
];

/** 校验人名是否来自统一人名池 */
export const isKnownPerson = (name: string) => THREE_KINGDOMS_NAMES.includes(name);

export { getInitialsAvatar };
