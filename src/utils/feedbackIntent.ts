import type { FeedbackCategory } from '../data/feedback';

export type FeedbackIntentResult = {
  /**
   * none=普通消息；
   * collect=泛反馈请求，先追问收集信息；
   * troubleshoot=疑似问题，第一步先给排查建议（两步流程）；
   * draft=用户确认后生成可编辑反馈草稿
   */
  intent: 'none' | 'collect' | 'troubleshoot' | 'draft';
  category: FeedbackCategory;
  /** 用户原始描述（去触发词） */
  content: string;
  /** 助手回复内容（排查建议或追问） */
  assistantMessage: string;
  /** 如意助手整理后的问题摘要（草稿阶段带入表单） */
  summary?: string;
};

const genericRequests = /^(我要反馈|我想反馈|反馈一下|有个问题|有问题|帮我反馈)[。！!？?\s]*$/;
const suggestionSignals = /(建议|希望|能否|能不能|最好|应该|增加|新增|优化|改进|太难用|不好用|不方便)/;
const failureSignals = /(打不开|进不去|连不上|不能|无法|失败|报错|异常|白屏|闪退|卡住|无响应|不生效|丢失|错乱|重复|显示不全|太慢|被禁用)/;
const productSignals = /(客户端|页面|系统|应用|功能|日历|消息|流程|文档|汇报|门户|如意|VPN|登录|下载|上传|搜索|审批|会议)/i;
const feedbackVerbs = /(反馈|投诉|吐槽|提交问题|提个建议)/;
const pureQuestion = /^(怎么|如何|哪里|什么时候|为什么|是否|能否查询|请问)/;

/** 常见问题排查建议（关键词匹配，演示用） */
const buildTroubleshootAdvice = (content: string): string => {
  if (/VPN|vpn/.test(content)) {
    return [
      '先帮你快速排查 VPN 问题：',
      '1. 确认已连接公司内网或全局加速；',
      '2. 尝试断开后重新连接；',
      '3. 检查账号是否被锁（连续输错密码会锁定 30 分钟）。',
      '如果以上仍未解决，我可以帮你整理成反馈提交给 IT。',
    ].join('\n');
  }
  if (/登录/.test(content)) {
    return [
      '先帮你快速排查登录问题：',
      '1. 确认账号密码输入正确（注意大小写与输入法）；',
      '2. 清除客户端缓存后重试；',
      '3. 如提示账号锁定，等待 30 分钟或联系服务台解锁。',
      '如果仍无法登录，我可以帮你整理成反馈提交给 IT。',
    ].join('\n');
  }
  if (/白屏|打不开|闪退/.test(content)) {
    return [
      '先帮你快速排查应用启动问题：',
      '1. 完全退出应用后重新打开；',
      '2. 检查网络连接是否正常；',
      '3. 更新到最新版本后再试。',
      '如果问题依旧，我可以帮你整理成反馈提交给 IT。',
    ].join('\n');
  }
  return [
    '先帮你快速排查：',
    '1. 确认网络连接正常；',
    '2. 尝试刷新页面或重启应用；',
    '3. 检查是否为权限不足（部分功能需申请开通）。',
    '如果以上未能解决，我可以帮你整理成反馈提交给 IT。',
  ].join('\n');
};

/** 从用户原话提炼问题摘要（截断+去触发词） */
const buildSummary = (content: string): string => {
  const cleaned = content.replace(/^(我要反馈|我想反馈|帮我反馈|反馈一下)[，,:：\s]*/, '').trim();
  return cleaned.length > 60 ? `${cleaned.slice(0, 60)}…` : cleaned;
};

export const resolveFeedbackIntent = (raw: string): FeedbackIntentResult => {
  const content = raw.trim();
  if (!content) return { intent: 'none', category: '其他', content: '', assistantMessage: '' };
  if (genericRequests.test(content)) {
    return {
      intent: 'collect',
      category: '其他',
      content: '',
      assistantMessage: '可以，请描述具体遇到的问题或希望改进的地方，我会帮你整理成反馈表单。',
    };
  }

  const suggestion = suggestionSignals.test(content);
  const failure = failureSignals.test(content);
  const product = productSignals.test(content);
  const explicit = feedbackVerbs.test(content);
  if (pureQuestion.test(content) && !failure && !suggestion && !explicit) {
    return { intent: 'none', category: '使用咨询', content, assistantMessage: '' };
  }

  const isFeedbackIntent = explicit || suggestion || (failure && product);
  if (!isFeedbackIntent) {
    return { intent: 'none', category: '其他', content, assistantMessage: '' };
  }

  const category: FeedbackCategory = suggestion ? '体验建议' : failure ? '功能异常' : '其他';
  const cleaned = content.replace(/^(我要反馈|我想反馈|帮我反馈|反馈一下)[，,:：\s]*/, '');

  // 两步流程第一步：功能异常且用户未明确要求直接反馈 → 先给排查建议
  if (failure && !explicit) {
    return {
      intent: 'troubleshoot',
      category,
      content: cleaned,
      summary: buildSummary(content),
      assistantMessage: buildTroubleshootAdvice(content),
    };
  }

  // 明确要求反馈（"帮我反馈"）或建议类 → 直接生成草稿
  return {
    intent: 'draft',
    category,
    content: cleaned,
    summary: buildSummary(content),
    assistantMessage: '我识别到这可能是产品问题或改进建议，已为你整理成反馈表单。确认内容后再提交即可。',
  };
};
