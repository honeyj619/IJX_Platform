import type { Message } from './types';

/** 演示消息（参照 store.js DEFAULT_MESSAGES，主用户改为梁吉力） */
export const MESSAGES: Record<string, Message[]> = {
  's-file-helper': [
    { id: 'fh-welcome', from: 'file-helper', type: 'text', text: '可以在这里保存文件、图片和文字，方便在电脑和手机之间传输。', time: '09:00' },
    { id: 'fh-file', from: 'me', type: 'file', text: '工作备忘.txt', size: '4 KB', time: '09:01' },
  ],
  's-g-fe': [
    { id: 'm1', from: 'jy-p7', type: 'text', text: '迭代评审改到下午四点，会议室 A2。详情见 https://office.example.com/review', time: '10:18', reactions: { '👍': ['jy-p5'] } },
    { id: 'm2', from: 'jy-p5', type: 'text', text: '测试环境已经准备好，大家更新一下客户端。', time: '10:21' },
    { id: 'm3', from: 'me', type: 'text', text: '收到，我把原型改动同步到文档。', time: '10:22', readBy: ['jy-p7'], quote: { id: 'm1', from: 'jy-p7', type: 'text', text: '迭代评审改到下午四点，会议室 A2。详情见 https://office.example.com/review' }, reactions: { '🎉': ['jy-p7'] } },
    { id: 'm12', from: 'jy-p7', type: 'image', text: '会议室白板.jpg', time: '10:23', w: 960, h: 640, tone: 'sky' },
    { id: 'm13', from: 'jy-p5', type: 'voice', text: '语音消息', duration: 8, time: '10:23' },
    { id: 'm4', from: 'jy-p7', type: 'file', text: '迭代评审纪要.docx', size: '128 KB', time: '10:24' },
    { id: 'm14', from: 'me', type: 'video', text: '走查录屏.mp4', duration: 42, size: '18 MB', time: '10:25', tone: 'slate', readBy: ['jy-p5', 'jy-p7', 'jy-p1'] },
    { id: 'm15', from: 'jy-p7', type: 'card', text: '马超', card: { kind: 'person', id: 'jy-p7' }, time: '10:26' },
    { id: 'm16', from: 'jy-p5', type: 'emoji', text: '🎉', time: '10:26' },
    { id: 'm-vote1', from: 'jy-p7', type: 'vote', text: '周五评审改到几点合适？', time: '10:27', vote: { title: '周五评审改到几点合适？', multiple: false, anonymous: false, ended: false, options: [{ id: 'o1', text: '16:00', voters: ['jy-p7', 'jy-p5'] }, { id: 'o2', text: '16:30', voters: ['jy-p1'] }, { id: 'o3', text: '保持原时间', voters: [] }] } },
    { id: 'm-chain1', from: 'me', type: 'chain', text: '本周五演示人员接龙', time: '10:28', readBy: ['jy-p7'], chain: { chainId: 'ch-demo1', title: '本周五演示人员接龙', starter: 'me', items: [{ id: 'c1', from: 'me', text: '梁吉力 登录与会话' }, { id: 'c2', from: 'jy-p7', text: '马超 评审范围' }] } },
    { id: 'm-at1', from: 'jy-p7', type: 'text', text: '@梁吉力 评审纪要你看一下，重点是范围变更。', mentions: ['me'], time: '10:29' },
    { id: 'm-at2', from: 'jy-p5', type: 'text', text: '@所有人 测试环境已经更新，请大家回归一遍登录。', mentionAll: true, time: '10:30' },
  ],
  's-jy-p5': [
    { id: 'm5', from: 'jy-p5', type: 'text', text: '梁工，登录页密码规则帮我对一下。', time: '09:42' },
    { id: 'm6', from: 'me', type: 'text', text: '8 位以上，含大小写和特殊字符。', time: '09:45' },
    { id: 'm17', from: 'jy-p5', type: 'image', text: '用例截图.png', time: '09:47', tone: 'violet' },
    { id: 'm7', from: 'jy-p5', type: 'file', text: '登录页用例.xlsx', size: '54 KB', time: '09:48' },
  ],
  's-jy-p7': [
    { id: 'm8', from: 'jy-p7', type: 'text', text: '通讯录搜索支持按账号了吗？', time: '昨天 18:20' },
    { id: 'm9', from: 'me', type: 'text', text: '已经加上了，姓名、手机号、账号都能搜。', time: '昨天 18:26' },
    { id: 'm18', from: 'jy-p7', type: 'voice', text: '语音消息', duration: 5, time: '昨天 18:28' },
  ],
  's-g-all': [
    { id: 'm10', from: 'jy-p1', type: 'text', text: '本周考勤请于周五前提交。', time: '周一 09:00' },
    { id: 'm19', from: 'jy-p1', type: 'file', text: '考勤说明.pdf', size: '240 KB', time: '周一 09:01' },
  ],
  's-g-six': [
    { id: 'm-six', from: 'jy-p5', type: 'text', text: '回归用例已经同步到测试部门群。', time: '周二 15:20' },
  ],
  's-g-pair': [
    { id: 'm-pair', from: 'jy-p7', type: 'text', text: '交互稿今晚给你。', time: '昨天 19:10' },
  ],
  's-g-solo': [
    { id: 'm-solo', from: 'me', type: 'text', text: '把常用资料放到这里。', time: '上周 11:00' },
  ],
  's-jy-p2': [
    { id: 'm11', from: 'jy-p2', type: 'text', text: '工牌已经可以去行政前台领取。', time: '上周 15:10' },
    { id: 'm20', from: 'jy-p2', type: 'card', text: '关羽', card: { kind: 'person', id: 'jy-p2' }, time: '上周 15:11' },
  ],
};

export function getMessages(sessionId: string): Message[] {
  return MESSAGES[sessionId] ?? [];
}
