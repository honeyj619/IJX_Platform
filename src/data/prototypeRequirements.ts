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
];

export const prototypeRequirementById = new Map(
  prototypeRequirements.map((requirement) => [requirement.id, requirement]),
);
