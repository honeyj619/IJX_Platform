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

export const presentationParamOptions: Record<string, PresentationParamOption> = {
  pageCount: { label: "页数", options: ["10-15页", "6-10页", "15-20页", "单页"] },
  audience: { label: "受众", options: ["大众", "管理层", "业务团队", "技术团队"] },
  scene: { label: "场景", options: ["通用", "工作汇报", "项目汇报", "培训宣讲", "经营分析"] },
  tone: { label: "语气", options: ["专业", "正式", "简洁", "有感染力"] },
  language: { label: "语言", options: ["简体中文", "中英双语", "英文"] },
  textStyle: { label: "文本", options: ["简洁", "标准", "详细"] },
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
