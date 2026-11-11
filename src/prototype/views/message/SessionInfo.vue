<template>
  <div class="im-page">
    <ImNavBar title="会话设置" />
    <div class="im-scroll">
      <div class="im-card" style="display: flex; align-items: center; gap: 12px; padding: 16px">
        <ImAvatar :name="session ? sessionTitle(state, session) : ''" :icon="session ? sessionIcon(state, session) : ''" :size="52" />
        <div class="im-flex-1">
          <div>{{ session ? sessionTitle(state, session) : '' }}</div>
          <div class="im-small im-muted">{{ typeLabel }} · 未读 {{ session?.unread || 0 }}</div>
        </div>
      </div>

      <div class="im-card">
        <button v-for="sw in SWITCHES" :key="sw.key" type="button" class="im-row" @click="onSwitch(sw.key)">
          <span class="im-row__main"><span class="im-row__title">{{ sw.label }}</span></span>
          <span class="im-row__value">{{ sw.get() ? '已开启' : '未开启' }}</span>
          <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
      </div>

      <div v-if="groupId" class="im-card">
        <button type="button" class="im-row" @click="router.push('/message/group/' + groupId)">
          <span class="im-row__main"><span class="im-row__title">群资料</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
        <button v-for="tab in GROUP_TABS" :key="tab.key" type="button" class="im-row" @click="router.push('/message/group/' + groupId + '?tab=' + tab.key)">
          <span class="im-row__main"><span class="im-row__title">{{ tab.label }}</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
      </div>

      <div class="im-card">
        <button type="button" class="im-row" @click="router.push('/message/history/' + sessionId)">
          <span class="im-row__main"><span class="im-row__title">查找聊天记录</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
        <button type="button" class="im-row" @click="router.push('/message/pins/' + sessionId)">
          <span class="im-row__main"><span class="im-row__title">置顶消息</span></span><span class="im-row__value">{{ pins.length }} 条</span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
      </div>

      <div v-if="app" class="im-card">
        <div class="im-section-title">应用菜单</div>
        <button v-for="m in app.menus" :key="m.id" type="button" class="im-row" @click="onAppMenu(m)">
          <span class="im-row__main"><span class="im-row__title">{{ m.label }}</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
      </div>

      <div class="im-card">
        <button type="button" class="im-row" @click="doClear"><span class="im-row__main"><span class="im-row__title im-btn--danger">清空聊天记录</span></span></button>
        <button type="button" class="im-row" @click="doRemove"><span class="im-row__main"><span class="im-row__title im-btn--danger">删除会话</span></span></button>
      </div>

      <div class="im-card">
        <button type="button" class="im-row" :disabled="busy" @click="doReset">
          <span class="im-row__main"><span class="im-row__title">恢复演示数据</span><span class="im-row__desc">清空本地改动，回到初始会话与消息</span></span>
          <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
      </div>
      <div class="im-tabbar-space" />
    </div>
  </div>
</template>

<script setup>
import ImIcon from '../../components/im/ImIcon.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImAvatar from '../../components/im/ImAvatar.vue'
import { useImState, imStore } from '../../im/store'
import { getApp, getSession, pinnedMessages, sessionIcon, sessionTitle } from '../../im/selectors'
import { confirmBox, toast } from '../../im/ui'
import { useImTask } from '../../im/task'

const route = useRoute()
const router = useRouter()
const state = useImState()
const sessionId = computed(() => String(route.params.sessionId || ''))
const session = computed(() => getSession(state.value, sessionId.value))
const groupId = computed(() => session.value?.type === 'group' ? session.value.targetId : '')
const app = computed(() => session.value?.type === 'im-app' ? getApp(state.value, session.value.targetId) : null)
const pins = computed(() => pinnedMessages(state.value, sessionId.value))
const typeLabel = computed(() => ({ single: '单聊', group: '群聊', 'service-inbox': '服务收件箱', 'service-ticket': '服务咨询', 'im-app': '消息应用' })[session.value?.type] || '会话')

const GROUP_TABS = [
  { key: 'members', label: '群成员' }, { key: 'notice', label: '群公告' },
  { key: 'files', label: '群文件' }, { key: 'settings', label: '加群设置' },
  { key: 'requests', label: '加群审批' }
]
const SWITCHES = [
  { key: 'pin', label: '置顶会话', get: () => !!session.value?.pinned },
  { key: 'star', label: '星标会话', get: () => !!session.value?.starred },
  { key: 'mute', label: '消息免打扰', get: () => !!session.value?.mute },
  { key: 'hidden', label: '隐藏会话', get: () => !!session.value?.hidden },
  { key: 'receive', label: '接收应用消息', get: () => session.value?.receive !== false }
]

function onSwitch(key) {
  const s = imStore.getState()
  if (key === 'pin') s.togglePin(sessionId.value)
  else if (key === 'star') s.toggleStar(sessionId.value)
  else if (key === 'mute') s.toggleMute(sessionId.value)
  else if (key === 'hidden') s.setSessionHidden(sessionId.value, !session.value?.hidden)
  else if (key === 'receive') s.setAppReceive(sessionId.value, session.value?.receive === false)
  toast('设置已更新')
}
const { busy, run } = useImTask()

function onAppMenu(menu) {
  if (menu.type === 'message') {
    imStore.getState().simulateIncoming(sessionId.value, { type: 'text', text: menu.text || menu.label, from: session.value?.targetId || 'app' })
    toast('已收到应用消息')
    router.push('/message/chat/' + sessionId.value)
  } else {
    toast('该菜单暂未开放')
  }
}
async function doClear() {
  if (!await confirmBox('清空聊天记录', '清空后会话预览也会同步清空。', '清空')) return
  await run('清空聊天记录', () => imStore.getState().clearSession(sessionId.value), '聊天记录已清空')
}
async function doRemove() {
  if (!await confirmBox('删除会话', '会话将从列表移除，可通过「恢复演示数据」恢复。', '删除')) return
  await run('删除会话', () => imStore.getState().removeSession(sessionId.value), '会话已删除')
  router.push('/message')
}
async function doReset() {
  if (!await confirmBox('恢复演示数据', '将清除本机新增与修改的消息、会话、群资料，回到初始演示数据。', '恢复')) return
  await run('恢复演示数据', () => imStore.getState().resetDemoData(), '演示数据已恢复')
  router.push('/message')
}
</script>
