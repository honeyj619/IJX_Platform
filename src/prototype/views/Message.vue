<template>
  <div class="im-page">
    <ImNavBar title="消息" :back="false">
      <template #right>
        <button type="button" class="im-nav__btn" aria-label="搜索" @click="router.push('/message/search')"><ImIcon name="search" :size="20" /></button>
        <button type="button" class="im-nav__btn" aria-label="新建" @click="menuOpen = true"><ImIcon name="plus" :size="22" /></button>
      </template>
    </ImNavBar>

    <div class="im-filters">
      <button
        v-for="f in FILTERS"
        :key="f.key"
        type="button"
        class="im-filter"
        :class="{ active: filter === f.key }"
        :aria-selected="filter === f.key"
        @click="filter = f.key"
      >{{ f.label }}<span v-if="f.key === 'all' && unreadTotal" class="im-filter__count">{{ unreadTotal }}</span></button>
    </div>

    <div class="im-scroll">
      <template v-if="list.length">
        <button
          v-for="s in list"
          :key="s.id"
          type="button"
          class="im-session"
          :class="{ pinned: s.pinned }"
          @click="router.push('/message/chat/' + s.id)"
        >
          <ImAvatar :name="sessionAvatarLabel(state, s)" :icon="sessionIcon(state, s)" :badge="s.unread || 0" :size="46" />
          <span class="im-session__main">
            <span class="im-session__top">
              <span class="im-session__name">{{ sessionTitle(state, s) }}</span>
              <span class="im-session__time">{{ sessionLastLabel(s.lastTs) || s.lastTime }}</span>
            </span>
            <span class="im-session__bottom">
              <span class="im-session__preview" :class="{ 'im-session__mention': hasUnreadMention(state, s) }">{{ sessionPreview(state, s.id) }}</span>
              <span class="im-session__flags">
                <ImIcon v-if="s.pinned" name="pin" :size="14" /> <ImIcon v-if="s.mute" name="mute" :size="14" /> <ImIcon v-if="s.starred" name="star" :size="14" />
              </span>
            </span>
          </span>
        </button>
      </template>
      <ImEmpty v-else :title="emptyTitle" desc="切换筛选条件或发起新会话" :action-text="emptyActionText" @action="onEmptyAction" />
      <div class="im-tabbar-space" />
    </div>

    <ImSheet :open="menuOpen" title="消息" @close="menuOpen = false">
      <div class="im-sheet__grid">
        <button v-for="item in MENU" :key="item.label" type="button" class="im-sheet__cell" @click="go(item)">
          <ImIcon :name="item.icon" :size="24" class="im-sheet__icon" /><span>{{ item.label }}</span>
        </button>
      </div>
    </ImSheet>
  </div>
</template>

<script setup>
import ImIcon from '../components/im/ImIcon.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ImNavBar from '../components/im/ImNavBar.vue'
import ImAvatar from '../components/im/ImAvatar.vue'
import ImSheet from '../components/im/ImSheet.vue'
import ImEmpty from '../components/im/ImEmpty.vue'
import { useImState, imStore, sessionLastLabel } from '../im/store'
import {
  filterSessions, hasUnreadMention, sessionAvatarLabel, sessionIcon, sessionPreview, sessionTitle
} from '../im/selectors'
import { totalUnread } from '../im/data/utils'
import { confirmBox } from '../im/ui'
import { useImTask } from '../im/task'

const router = useRouter()
const state = useImState()
const filter = ref('all')
const menuOpen = ref(false)
const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'mention', label: '@消息' }
]
const MENU = [
  { icon: 'scan', label: '扫一扫', path: '/message/scan' },
  { icon: 'group', label: '创建群聊', path: '/message/group/create' },
  { icon: 'contacts', label: '通讯录', path: '/message/contacts' },
  { icon: 'chat', label: '我的群聊', path: '/message/contacts?scope=groups' },
  { icon: 'service', label: '员工服务', path: '/message/contacts?scope=service' },
  { icon: 'apps', label: '消息应用', path: '/message/contacts?scope=apps' },
  { icon: 'tools', label: '恢复演示数据', action: 'reset' }
]
const list = computed(() => filterSessions(state.value, filter.value))
const unreadTotal = computed(() => totalUnread(state.value.sessions))
const emptyTitle = computed(() => filter.value === 'mention' ? '暂无未读的 @消息' : filter.value === 'unread' ? '暂无未读会话' : '暂无会话')
const emptyActionText = computed(() => filter.value === 'all' ? '发起新会话' : '查看全部会话')

const { run } = useImTask()

function onEmptyAction() {
  if (filter.value === 'all') router.push('/message/contacts')
  else filter.value = 'all'
}

async function resetDemo() {
  if (!await confirmBox('恢复演示数据', '将清除本机新增与修改的消息、会话、群资料，回到初始演示数据。', '恢复')) return
  await run('恢复演示数据', () => imStore.getState().resetDemoData(), '演示数据已恢复')
}

function go(item) {
  menuOpen.value = false
  if (item.action === 'reset') { resetDemo(); return }
  router.push(item.path)
}
</script>
