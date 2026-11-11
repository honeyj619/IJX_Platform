import type { ImApp, ServiceAccount, ServiceTicket } from './types';

/** 员工服务账号（Mock，阶段四不接真实后端） */
export const SERVICE_ACCOUNTS: ServiceAccount[] = [
  { id: 'sa-hr', name: '员工服务台', desc: '人事、考勤、IT 服务统一受理', icon: '🎧' },
  { id: 'sa-it', name: 'IT 服务号', desc: '账号、设备与网络问题咨询', icon: '🛠' },
];

/** 服务咨询工单：service-inbox 会话内列表 + 子会话消息 */
export const SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: 't-it-01',
    accountId: 'sa-hr',
    fromName: 'IT 支持 · 王工',
    subject: '笔记本无法连接内网',
    lastText: '已为您登记，工程师会在 30 分钟内联系。',
    lastTime: '09:20',
    unread: 2,
    messages: [
      { id: 'st-1', from: 'sa-hr', type: 'text', text: '您好，员工服务台已收到「笔记本无法连接内网」的咨询。', time: '09:12' },
      { id: 'st-2', from: 'me', type: 'text', text: '今天早上开始连不上，重启过一次。', time: '09:15' },
      { id: 'st-3', from: 'sa-hr', type: 'text', text: '已为您登记，工程师会在 30 分钟内联系。', time: '09:20' },
    ],
  },
  {
    id: 't-hr-02',
    accountId: 'sa-hr',
    fromName: '人事服务 · 李工',
    subject: '年假余额查询',
    lastText: '本年度剩余年假 5 天，可在自助平台查看明细。',
    lastTime: '昨天',
    unread: 0,
    messages: [
      { id: 'st-4', from: 'me', type: 'text', text: '想确认一下今年的年假余额。', time: '昨天 15:02' },
      { id: 'st-5', from: 'sa-hr', type: 'text', text: '本年度剩余年假 5 天，可在自助平台查看明细。', time: '昨天 15:10' },
    ],
  },
  {
    id: 't-it-03',
    accountId: 'sa-it',
    fromName: 'IT 服务号',
    subject: 'VPN 账号解锁',
    lastText: '账号已解锁，请重新登录。',
    lastTime: '周一',
    unread: 1,
    messages: [
      { id: 'st-6', from: 'me', type: 'text', text: 'VPN 账号被锁了，麻烦帮忙解锁。', time: '周一 10:02' },
      { id: 'st-7', from: 'sa-it', type: 'text', text: '账号已解锁，请重新登录。', time: '周一 10:18' },
    ],
  },
];

/** 消息应用：会话 + 底部菜单 + 接收消息开关 */
export const IM_APPS: ImApp[] = [
  {
    id: 'app-todo',
    name: '待办提醒',
    icon: '📌',
    desc: '汇聚各系统的待办与提醒',
    receive: true,
    menus: [
      { id: 'm-todo', label: '我的待办', type: 'message', text: '当前有 3 条待办：迭代评审确认、周报提交、设备归还。' },
      { id: 'm-done', label: '已完成', type: 'message', text: '本周已完成 12 条待办。' },
      { id: 'm-help', label: '使用帮助', type: 'link', url: 'https://office.example.com/todo-help' },
    ],
  },
  {
    id: 'app-approval',
    name: '审批通知',
    icon: '✅',
    desc: '流程审批结果实时推送',
    receive: true,
    menus: [
      { id: 'm-pending', label: '待我审批', type: 'message', text: '有 2 条审批等待处理。' },
      { id: 'm-cc', label: '抄送我的', type: 'message', text: '暂无新的抄送。' },
    ],
  },
  {
    id: 'app-notice',
    name: '公告通知',
    icon: '📢',
    desc: '公司级通知与公告',
    receive: false,
    menus: [
      { id: 'm-latest', label: '最新公告', type: 'message', text: '关于 2026 年度假期安排的通知已发布。' },
    ],
  },
];

export const IM_APP_MESSAGES: Record<string, { from: string; text: string; time: string; type?: 'text' | 'system' }[]> = {
  'app-todo': [
    { from: 'app-todo', text: '待办提醒已开启', time: '09:00', type: 'system' },
    { from: 'app-todo', text: '【待办】迭代评审确认，截止时间今天 16:00。', time: '09:05' },
    { from: 'app-todo', text: '【待办】提交本周项目周报。', time: '09:30' },
  ],
  'app-approval': [
    { from: 'app-approval', text: '审批通知已开启', time: '昨天', type: 'system' },
    { from: 'app-approval', text: '【审批通过】会议室预约申请 A2 已通过。', time: '昨天 14:20' },
  ],
  'app-notice': [
    { from: 'app-notice', text: '【公告】关于 2026 年度假期安排的通知已发布。', time: '周一 09:00' },
  ],
};
