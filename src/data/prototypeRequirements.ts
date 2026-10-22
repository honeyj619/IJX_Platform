export interface PrototypeRequirement {
  id: string;
  surface: string;
  order: number;
  title: string;
  functionalRequirement: string;
  businessRules: string[];
}

export const prototypeRequirements: PrototypeRequirement[] = [
  {
    id: 'ruyi-plugin-state',
    surface: '如意空间首页',
    order: 1,
    title: '插件选择与状态切换',
    functionalRequirement: '插件用于切换当前对话的专业能力，同一时间只激活一个插件。',
    businessRules: [
      '再次点击已激活插件时取消选择并回到普通对话。',
      '切换插件时清空当前输入，避免把上一插件的内容带入新场景。',
      '插件状态只影响当前对话，不改变左侧固定智能体配置。',
    ],
  },
  {
    id: 'ruyi-conversation-input',
    surface: '如意空间首页',
    order: 2,
    title: '对话输入与发送',
    functionalRequirement: '输入区根据当前智能体或插件展示对应提示，并将内容交给当前场景处理。',
    businessRules: [
      '无插件时按普通对话处理；选择插件后按插件场景处理。',
      '发送后清空输入内容，附件入口继续沿用当前场景能力。',
      '空内容不触发普通对话发送。',
    ],
  },
  {
    id: 'ruyi-workbench-navigation',
    surface: '如意空间首页',
    order: 3,
    title: '确认需求后进入专业工作台',
    functionalRequirement: '需要结构化编辑或生成的能力进入对应专业工作台继续完成。',
    businessRules: [
      '公文和 PPT 从对话插件进入各自工作台；参谋师保留固定智能体入口。',
      'PPT 不在左侧固定智能体中重复提供入口。',
      '进入工作台时保留已确认的主题、模式和必要上下文。',
      '返回如意空间后恢复主对话页面，不新增重复导航入口。',
    ],
  },
  {
    id: 'pc-card-type',
    surface: '应用管理 · PC工作台',
    order: 1,
    title: '卡片类型选择',
    functionalRequirement: 'PC 工作台区分内置组件卡片与应用入口卡片，两类卡片采用不同配置约束。',
    businessRules: [
      '内置组件绑定已注册模板，每个模板只能配置一次且不可删除。',
      '应用入口卡片可创建多条，必须配置主地址，并允许删除。',
    ],
  },
  {
    id: 'pc-card-basics',
    surface: '应用管理 · PC工作台',
    order: 2,
    title: '标题、描述与图标校验',
    functionalRequirement: '卡片基础信息用于后台识别和个人门户展示。',
    businessRules: [
      '标题必填，保存时去除首尾空格。',
      '图标仅支持 PNG、JPEG、WebP，文件大小不超过 512KB。',
      '内置组件模板字段只读，不能在编辑时更换。',
    ],
  },
  {
    id: 'pc-card-addresses',
    surface: '应用管理 · PC工作台',
    order: 3,
    title: '卡片地址校验',
    functionalRequirement: '主地址用于点击卡片，详情地址用于卡片的更多入口。',
    businessRules: [
      '地址仅接受站内 / 开头路径或合法 http、https 地址。',
      '应用入口卡片必须填写主地址。',
      '详情地址为空时隐藏更多入口或使用组件模板默认值。',
    ],
  },
  {
    id: 'pc-card-availability',
    surface: '应用管理 · PC工作台',
    order: 4,
    title: '可用范围与通讯录',
    functionalRequirement: '卡片可面向全员，或通过统一通讯录限定人员、部门和用户组。',
    businessRules: [
      '选择全员时清空已选范围对象。',
      '选择部分成员时至少选择一项。',
      '已失效用户组必须移除或重新选择后才能保存。',
    ],
  },
  {
    id: 'pc-card-publishing',
    surface: '应用管理 · PC工作台',
    order: 5,
    title: '展示、启停与排序',
    functionalRequirement: '发布配置控制卡片是否默认展示、是否可用以及在个人门户中的顺序。',
    businessRules: [
      '默认展示只决定首次呈现，不等同于启用状态。',
      '停用卡片不向用户提供入口。',
      '排序使用数字值，数值较小的卡片优先。',
    ],
  },
  {
    id: 'advisor-project-week-number',
    surface: '如意参谋师 · 项目周报',
    order: 1,
    title: '项目周计算',
    functionalRequirement: '项目周报展示项目从立项开始累计推进到当前日期的项目周数。',
    businessRules: [
      '按项目立项日期所在的自然周作为第 1 周，每跨过一个自然周递增 1。',
      '每个项目使用稳定的立项日期，当前日期取浏览器时间。',
      '项目周与邮件主题中的年度自然周是两个独立口径。',
    ],
  },
  {
    id: 'advisor-gantt-progress',
    surface: '如意参谋师 · 项目周报',
    order: 2,
    title: '阶段进度计算',
    functionalRequirement: '甘特图按阶段起止日期和当前日期实时计算阶段及子阶段进度。',
    businessRules: [
      '阶段进度 =（当前时间 - 阶段开始时间）/（阶段完成时间 - 阶段开始时间）。',
      '计算结果四舍五入并限制在 0-100，阶段状态与计算结果保持一致。',
      '仅提供月日的阶段日期使用汇报周期年份；无有效周期年份时使用当前年份。',
    ],
  },
  {
    id: 'advisor-current-stage-status',
    surface: '如意参谋师 · 项目周报',
    order: 3,
    title: '当前阶段展示',
    functionalRequirement: '周报头部右侧集中展示当前阶段、当前子阶段和项目健康灯。',
    businessRules: [
      '左侧仅展示项目名称、项目周和汇报周期。',
      '当前阶段由阶段日期与当前时间匹配，优先展示正在进行的阶段。',
      '当前阶段状态块与健康灯并列呈现，并保持醒目、紧凑。',
    ],
  },
  {
    id: 'advisor-gantt-collapse',
    surface: '如意参谋师 · 项目周报',
    order: 4,
    title: '甘特图子阶段折叠',
    functionalRequirement: '有子阶段的父阶段支持展开或收起子阶段，便于查看阶段整体计划。',
    businessRules: [
      '折叠操作只隐藏或显示子阶段，父阶段行始终保留。',
      '无子阶段的父阶段不显示折叠控件，也不可点击折叠。',
      '控件文案明确显示当前可执行的展开或收起动作。',
    ],
  },
  {
    id: 'advisor-email-subject',
    surface: '如意参谋师 · 项目周报',
    order: 5,
    title: '项目周报邮件主题',
    functionalRequirement: '发送确认预览和实际发送统一使用标准项目周报邮件主题。',
    businessRules: [
      '主题格式为【项目周报】XXXX项目 YYYY年第XX周（MM.DD–MM.DD）。',
      '周次按邮件周期所属的 ISO 年度自然周计算，日期范围固定为周一至周日。',
      '预览、二次确认和发送记录使用同一个主题生成结果。',
    ],
  },
];

export const prototypeRequirementById = new Map(
  prototypeRequirements.map((requirement) => [requirement.id, requirement]),
);
