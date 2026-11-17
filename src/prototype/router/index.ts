import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/** 二级页隐藏底部 Tab；仅六个 Tab 根路径显示 */
const hideTab = { meta: { hideTab: true } }

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/schedule', name: 'Schedule', component: () => import('../views/Schedule.vue') },
  { path: '/workspace', name: 'Workspace', component: () => import('../views/Workspace.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue') },
  { path: '/profile/feedback', name: 'ProfileFeedback', component: () => import('../views/Feedback.vue'), ...hideTab },
  { path: '/profile/feedback/:feedbackId', name: 'ProfileFeedbackDetail', component: () => import('../views/FeedbackDetail.vue'), ...hideTab },
  { path: '/message', name: 'Message', component: () => import('../views/Message.vue') },

  // 通讯录一级域（2026-11-17）：组织架构/搜索/我的群组；二级页隐藏底部导航
  { path: '/contacts', name: 'Contacts', component: () => import('../views/Contacts.vue') },
  { path: '/contacts/dept/:departmentId', name: 'ContactsDept', component: () => import('../views/contacts/Department.vue'), ...hideTab },
  { path: '/contacts/:contactId', name: 'ContactDetail', component: () => import('../views/contacts/ContactDetail.vue'), ...hideTab },

  { path: '/message/search', name: 'MessageSearch', component: () => import('../views/message/Search.vue'), ...hideTab },
  { path: '/message/chat/:sessionId', name: 'MessageChat', component: () => import('../views/message/Chat.vue'), ...hideTab },
  { path: '/message/info/:sessionId', name: 'MessageInfo', component: () => import('../views/message/SessionInfo.vue'), ...hideTab },
  { path: '/message/history/:sessionId', name: 'MessageHistory', component: () => import('../views/message/History.vue'), ...hideTab },
  // 旧路由兼容：无 scope 或 scope 非 service/apps 时重定向到 /contacts（保留查询参数）；scope=service/apps 留在本页（消息域子视图）
  {
    path: '/message/contacts',
    name: 'MessageContacts',
    component: () => import('../views/message/Contacts.vue'),
    ...hideTab,
    beforeEnter: (to) => {
      const scope = String(to.query.scope || '')
      if (scope !== 'service' && scope !== 'apps') {
        const query = { ...to.query }
        if ('scope' in query) {
          // 旧 scope=groups 已并入 /contacts?tab=groups
          if (scope === 'groups') query.tab = 'groups'
          delete query.scope
        }
        return { path: '/contacts', query }
      }
      return true
    },
  },
  { path: '/message/contact/:contactId', redirect: (to) => `/contacts/${to.params.contactId}` },
  { path: '/message/group/create', name: 'MessageGroupCreate', component: () => import('../views/message/GroupCreate.vue'), ...hideTab },
  { path: '/message/group/:groupId', name: 'MessageGroup', component: () => import('../views/message/GroupDetail.vue'), ...hideTab },
  { path: '/message/scan', name: 'MessageScan', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/message/pins/:sessionId', name: 'MessagePins', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/message/topic/:topicId', name: 'MessageTopic', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/message/receipt/:sessionId/:msgId', name: 'MessageReceipt', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/message/service/:accountId', name: 'MessageService', component: () => import('../views/message/Misc.vue'), ...hideTab },
  { path: '/contacts/:pathMatch(.*)*', redirect: '/contacts' },
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
