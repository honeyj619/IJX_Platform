import type { FeedbackCategory } from '../data/feedback';

export type FeedbackIntentResult = {
  intent: 'none' | 'collect' | 'draft';
  category: FeedbackCategory;
  content: string;
  assistantMessage: string;
};

const genericRequests = /^(我要反馈|我想反馈|反馈一下|有个问题|有问题|帮我反馈)[。！!？?\s]*$/;
const suggestionSignals = /(建议|希望|能否|能不能|最好|应该|增加|新增|优化|改进|太难用|不好用|不方便)/;
const failureSignals = /(打不开|进不去|连不上|不能|无法|失败|报错|异常|白屏|闪退|卡住|无响应|不生效|丢失|错乱|重复|显示不全|太慢|被禁用)/;
const productSignals = /(客户端|页面|系统|应用|功能|日历|消息|流程|文档|汇报|门户|如意|VPN|登录|下载|上传|搜索|审批|会议)/i;
const feedbackVerbs = /(反馈|投诉|吐槽|提交问题|提个建议)/;
const pureQuestion = /^(怎么|如何|哪里|什么时候|为什么|是否|能否查询|请问)/;

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
  if (!explicit && !suggestion && !(failure && product)) {
    return { intent: 'none', category: '其他', content, assistantMessage: '' };
  }

  const category: FeedbackCategory = suggestion ? '体验建议' : failure ? '功能异常' : '其他';
  return {
    intent: 'draft',
    category,
    content: content.replace(/^(我要反馈|我想反馈|帮我反馈|反馈一下)[，,:：\s]*/, ''),
    assistantMessage: '我识别到这可能是产品问题或改进建议，已为你整理成反馈表单。确认内容后再提交即可。',
  };
};
