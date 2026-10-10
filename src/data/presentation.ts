export type PresentationModeId = "ai" | "document" | "import" | "single";

export interface PresentationMode {
  id: PresentationModeId;
  name: string;
  desc: string;
}

export interface PresentationParamOption {
  label: string;
  options: string[];
}

export interface PresentationSlide {
  id: number;
  title: string;
  subtitle: string;
  bullets: string[];
}

export const presentationModes: PresentationMode[] = [
  { id: "ai", name: "AI智能生成", desc: "输入主题后生成完整演示文稿" },
  { id: "document", name: "文档生成PPT", desc: "基于参考文档提炼结构和页面" },
  { id: "import", name: "导入PPT生成", desc: "导入已有PPT并按要求优化" },
  { id: "single", name: "AI生成单页", desc: "快速生成一页可复用页面" },
];

export interface PresentationTemplateRule {
  label: string;
  value: string;
}

export interface PresentationTemplate {
  id: string;
  name: string;
  desc: string;
  category: '品牌' | '商务' | '学术';
  /** 强调色（tailwind class） */
  accent: string;
  /** 浅底色 */
  surface: string;
  /** 辅助线色 */
  line: string;
  /** 选中边框色 */
  border: string;
  /** 预览示例页 */
  sampleSlides: { title: string; bullets: string[] }[];
  /** 模板规范说明 */
  rules: PresentationTemplateRule[];
}

export const presentationTemplateList: PresentationTemplate[] = [
  {
    id: 'tpl-brand',
    name: '吉祥主题',
    desc: '品牌红主色，适合对外汇报与宣传',
    category: '品牌',
    accent: 'bg-[#d51f5c]',
    surface: 'bg-[#fdf2f6]',
    line: 'bg-[#f3c6d8]',
    border: 'border-[#f0aecb]',
    sampleSlides: [
      { title: 'AI赋能：企业效率革新', bullets: ['统一入口', '智能辅助', '流程提效'] },
      { title: '业务背景', bullets: ['系统入口分散', '知识获取成本高', '流程推进依赖人工'] },
      { title: '推进路径', bullets: ['第一阶段：内容创作', '第二阶段：流程协同', '第三阶段：经营分析'] },
    ],
    rules: [
      { label: '主色调', value: '品牌红 #D51F5C，突出企业识别' },
      { label: '标题版式', value: '大标题居中，副标题灰字紧随其下' },
      { label: '页面结构', value: '封面 + 目录 + 章节页 + 总结页，16:9' },
      { label: '适用场景', value: '对外汇报、品牌宣传、发布会材料' },
    ],
  },
  {
    id: 'tpl-business',
    name: '吉祥IT主题',
    desc: '深蓝主色，适合工作汇报与方案评审',
    category: '商务',
    accent: 'bg-[#2563eb]',
    surface: 'bg-[#eff6ff]',
    line: 'bg-[#bfdbfe]',
    border: 'border-[#93c5fd]',
    sampleSlides: [
      { title: '季度工作汇报', bullets: ['目标回顾', '关键进展', '风险与计划'] },
      { title: '关键进展', bullets: ['门户改版上线', '协同效率提升 32%', '接入 6 个业务系统'] },
      { title: '风险与计划', bullets: ['跨系统数据口径待统一', '下季度推进真实数据联调'] },
    ],
    rules: [
      { label: '主色调', value: '深蓝 #2563EB，沉稳专业' },
      { label: '标题版式', value: '左对齐标题 + 色块强调条' },
      { label: '页面结构', value: '封面 + 议程 + 数据页 + 结论页，16:9' },
      { label: '适用场景', value: '工作汇报、方案评审、项目复盘' },
    ],
  },
  {
    id: 'tpl-academic',
    name: 'IT项目立项主题',
    desc: '翠绿主色，适合学术汇报与研究报告',
    category: '学术',
    accent: 'bg-[#059669]',
    surface: 'bg-[#ecfdf5]',
    line: 'bg-[#a7f3d0]',
    border: 'border-[#6ee7b7]',
    sampleSlides: [
      { title: '研究背景与问题', bullets: ['研究动机', '核心问题', '文献基础'] },
      { title: '研究方法', bullets: ['数据采集', '模型构建', '对照实验'] },
      { title: '结论与展望', bullets: ['主要结论', '局限性', '后续方向'] },
    ],
    rules: [
      { label: '主色调', value: '翠绿 #059669，清新简洁' },
      { label: '标题版式', value: '章节编号 + 标题，正文层级分明' },
      { label: '页面结构', value: '封面 + 大纲 + 方法 + 结论，16:9' },
      { label: '适用场景', value: '学术会议、研究报告、课程讲义' },
    ],
  },
  {
    id: 'tpl-aoc',
    name: '吉祥AOC主题',
    desc: '运行控制场景演示模板',
    category: '商务',
    accent: 'bg-[#2563eb]',
    surface: 'bg-[#eff6ff]',
    line: 'bg-[#bfdbfe]',
    border: 'border-[#93c5fd]',
    sampleSlides: [
      { title: 'AOC 智能运行', bullets: ['航班保障', '动态监控', '协同指挥'] },
      { title: '运行概览', bullets: ['航班正常率提升', '保障节点全流程可视', '异常处置时长缩短'] },
      { title: '协同机制', bullets: ['空地一体化联动', '信息实时共享', '决策支持辅助'] },
    ],
    rules: [],
  },
  {
    id: 'tpl-20th',
    name: '吉祥二十周年主题',
    desc: '二十周年庆典演示模板',
    category: '品牌',
    accent: 'bg-[#d51f5c]',
    surface: 'bg-[#fdf2f6]',
    line: 'bg-[#f3c6d8]',
    border: 'border-[#f0aecb]',
    sampleSlides: [
      { title: '廿载同行 · 展翼未来', bullets: ['发展历程', '里程碑成果', '未来展望'] },
      { title: '发展历程', bullets: ['1996 创业起步', '2010 上市跨越', '2026 廿载新程'] },
      { title: '未来展望', bullets: ['智慧航空', '绿色飞行', '全球网络'] },
    ],
    rules: [],
  },
  {
    id: 'tpl-brand2',
    name: '吉祥品牌主题',
    desc: '品牌对外演示模板',
    category: '品牌',
    accent: 'bg-[#059669]',
    surface: 'bg-[#ecfdf5]',
    line: 'bg-[#a7f3d0]',
    border: 'border-[#6ee7b7]',
    sampleSlides: [
      { title: '品牌焕新', bullets: ['品牌主张', '视觉体系', '传播策略'] },
      { title: '视觉体系', bullets: ['主视觉延展', '辅助图形', '应用规范'] },
      { title: '传播策略', bullets: ['整合传播', '场景渗透', '效果评估'] },
    ],
    rules: [],
  },
];

export const presentationTemplates = presentationTemplateList.map(template => template.name);

export const presentationParamOptions: Record<string, PresentationParamOption> = {
  pageCount: { label: "页数", options: ["3-5页", "6-10页", "11-15页", "16-20页"] },
  textStyle: { label: "文本量", options: ["简洁", "中等", "详细"] },
  audience: { label: "受众", options: ["大众", "投资者", "商业", "学生", "教师", "老板/领导", "员工", "同事同行", "用户", "组员"] },
  scene: { label: "场景", options: ["通用", "个人介绍", "年度计划", "分析报告", "公告", "商业计划书", "年度总结", "研究报告", "解决方案", "宣传材料", "学术会议", "产品介绍", "财务报告", "公众演讲", "项目汇报", "会议流程", "项目计划"] },
  tone: { label: "语气", options: ["专业", "励志", "幽默", "亲切", "自信", "温柔"] },
  language: { label: "语言", options: ["中文", "英文", "中英双语"] },
};

export const presentationRecommendedTopics = [
  "数字化转型的下半场布局",
  "Q4战略规划与风险防控",
  "ESG与绿色可持续发展战略",
];

export const presentationOutline = [
  "封面：AI赋能企业效率革新与未来",
  "背景：企业协同效率面临的新挑战",
  "洞察：AI在流程、知识和决策中的价值",
  "方案：如意空间智能办公能力布局",
  "路径：从试点场景到规模化应用",
  "风险：数据安全、权限边界和使用规范",
  "总结：下一阶段推进计划与预期收益",
];

export const presentationSlides: PresentationSlide[] = [
  {
    id: 1,
    title: "AI赋能：企业效率革新与未来",
    subtitle: "从协同入口到智能工作流",
    bullets: ["统一入口", "智能辅助", "流程提效"],
  },
  {
    id: 2,
    title: "业务背景",
    subtitle: "效率提升进入精细化阶段",
    bullets: ["系统入口分散", "知识获取成本高", "流程推进依赖人工跟进"],
  },
  {
    id: 3,
    title: "核心方案",
    subtitle: "围绕员工日常工作建立AI协同能力",
    bullets: ["如意助手承接问答和任务", "插件化覆盖公文、PPT等高频创作", "结合门户数据形成闭环"],
  },
  {
    id: 4,
    title: "推进路径",
    subtitle: "先验证高频场景，再扩展到更多业务系统",
    bullets: ["第一阶段：内容创作", "第二阶段：流程协同", "第三阶段：经营分析"],
  },
  {
    id: 5,
    title: "预期收益",
    subtitle: "让员工少切系统，把时间留给判断和协作",
    bullets: ["减少重复录入", "缩短材料准备周期", "提升跨系统响应效率"],
  },
];
