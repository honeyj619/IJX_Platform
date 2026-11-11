import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/** 消息子页隐藏底部五 Tab；仅五个 Tab 根路径显示 */
const hideTab = { meta: { hideTab: true } }

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/schedule', name: 'Schedule', component: () => import('../views/Schedule.vue') },
  { path: '/workspace', name: 'Workspace', component: () => import('../views/Workspace.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue') },
  { path: '/message', name: 'Message', component: () => import('../views/Message.vue') },

  { path: '/message/search', name: 'MessageSearch', component: () => import('../views/message/Search.vue'), ...hideTab },
  { path: '/message/chat/:sessionId', name: 'MessageChat', component: () => import('../views/message/Chat.vue'), ...hideTab },
  { path: '/message/info/:sessionId', name: 'MessageInfo', component: () => import('../views/message/SessionInfo.vue'), ...hideTab },
  { path: '/message/history/:sessionId', name: 'MessageHistory', component: () => import('../views/message/History.vue'), ...hideTab },
  { path: '/message/contacts', name: 'MessageContacts', component: () => import('../views/message/Contacts.vue'), ...hideTab },
  { path: '/message/contact/:contactId', name: 'MessageContact', component: () => import('../views/message/Contacts.vue'), ...hideTab },
  { path: '/message/group/create', name: 'MessageGroupCreate', component: () => import('../views/message/GroupCreate.vue'), ...hideTab },
  { path: '/message/group/:groupId', name: 'MessageGroup', component: () => import('../views/message/GroupDetail.vue'), ...hideTab },
  { path: '/message/scan', name: 'MessageScan', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/message/pins/:sessionId', name: 'MessagePins', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/message/topic/:topicId', name: 'MessageTopic', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/message/receipt/:sessionId/:msgId', name: 'MessageReceipt', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/message/service/:accountId', name: 'MessageService', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/message/:pathMatch(.*)*', redirect: '/message' }
]

/**
 * 原型作为 React 项目 /app/prototype/* 下的子应用挂载。
 * base 必须同时包含部署 base（本地 '/'、Pages '/IJX_Platform/'）与子应用前缀，
 * 否则 Vue Router 会把路径解析成根路由或跳回门户。
 */
export function createPrototypeRouter() {
  const base = `${import.meta.env.BASE_URL}app/prototype/`.replace(/\/{2,}/g, '/')
  return createRouter({
    history: createWebHistory(base),
    routes
  })
}

export default createPrototypeRouter
