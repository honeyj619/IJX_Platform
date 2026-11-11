<template>
  <div class="im-page">
    <ImNavBar title="搜索">
      <template #right><button type="button" class="im-nav__text" @click="advanced = !advanced">{{ advanced ? '收起' : '筛选' }}</button></template>
    </ImNavBar>

    <div class="im-searchbar">
      <ImIcon name="search" :size="18" /><input v-model="q" placeholder="搜索联系人、群聊、聊天记录" autofocus><button v-if="q" type="button" class="im-searchbar__clear" aria-label="清除" @click="q = ''"><ImIcon name="close" :size="16" /></button>
    </div>

    <div v-if="advanced" class="im-card">
      <div class="im-pad" style="display: grid; gap: 8px">
        <ImField label="发送人" :filled="!!filters.sender"><input v-model="filters.sender" class="im-input" placeholder="发送人（姓名）"></ImField>
        <ImField label="群成员" :filled="!!filters.member"><input v-model="filters.member" class="im-input" placeholder="群成员（姓名）"></ImField>
        <ImField label="日期" :filled="!!filters.date"><input v-model="filters.date" class="im-input" placeholder="日期（如 2026-11-11）"></ImField>
        <div class="im-flex" style="flex-wrap: wrap; gap: 6px">
          <button v-for="t in CHAT_TYPES" :key="t.key" type="button" class="im-chip" :class="{ active: filters.chatType === t.key }" @click="filters.chatType = t.key">{{ t.label }}</button>
        </div>
        <div class="im-flex" style="flex-wrap: wrap; gap: 6px">
          <button v-for="t in MSG_TYPES" :key="t.key" type="button" class="im-chip" :class="{ active: filters.msgType === t.key }" @click="filters.msgType = t.key">{{ t.label }}</button>
        </div>
        <button type="button" class="im-chip" :class="{ active: filters.at }" @click="filters.at = !filters.at">仅看 @消息</button>
      </div>
    </div>

    <div class="im-scroll">
      <template v-if="q.trim() || hasFilter">
        <template v-if="contacts.length">
          <div class="im-section-title">联系人</div>
          <button v-for="c in contacts" :key="c.id" type="button" class="im-row" @click="openContact(c.id)">
            <ImAvatar :name="c.name" :size="38" />
            <span class="im-row__main"><span class="im-row__title">{{ c.name }}</span><span class="im-row__desc">{{ c.dept || c.job || '' }}</span></span>
            <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
          </button>
        </template>
        <template v-if="groups.length">
          <div class="im-section-title">群聊</div>
          <button v-for="g in groups" :key="g.id" type="button" class="im-row" @click="openGroup(g.id)">
            <ImAvatar :name="g.name" icon="群" :size="38" />
            <span class="im-row__main"><span class="im-row__title">{{ g.name }}</span><span class="im-row__desc">{{ g.members.length }} 位成员</span></span>
            <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
          </button>
        </template>
        <template v-if="sessions.length">
          <div class="im-section-title">会话</div>
          <button v-for="s in sessions" :key="s.id" type="button" class="im-row" @click="router.push('/message/chat/' + s.id)">
            <ImAvatar :name="sessionTitle(state, s)" :size="38" />
            <span class="im-row__main"><span class="im-row__title">{{ sessionTitle(state, s) }}</span></span>
            <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
          </button>
        </template>
        <template v-if="apps.length || services.length">
          <div class="im-section-title">应用与服务</div>
          <button v-for="a in apps" :key="a.id" type="button" class="im-row" @click="openApp(a.id)">
            <ImAvatar :name="a.name" :icon="a.icon" :size="38" />
            <span class="im-row__main"><span class="im-row__title">{{ a.name }}</span><span class="im-row__desc">{{ a.desc }}</span></span>
          </button>
          <button v-for="a in services" :key="a.id" type="button" class="im-row" @click="router.push('/message/service/' + a.id)">
            <ImAvatar :name="a.name" :icon="a.icon" :size="38" />
            <span class="im-row__main"><span class="im-row__title">{{ a.name }}</span><span class="im-row__desc">{{ a.desc }}</span></span>
          </button>
        </template>
        <template v-if="records.length">
          <div class="im-section-title">聊天记录（{{ records.length }}）</div>
          <button v-for="(h, i) in records.slice(0, 60)" :key="h.msgId + i" type="button" class="im-row" @click="openRecord(h)">
            <span class="im-row__main">
              <span class="im-row__title">{{ h.title }} · {{ displayName(state, h.from) }}</span>
              <span class="im-row__desc im-truncate">{{ h.text }}</span>
            </span>
            <span class="im-row__value">{{ h.time }}</span>
          </button>
        </template>
        <ImEmpty v-if="!total" title="没有匹配结果" desc="换个关键词，或调整高级筛选条件" action-text="清空搜索条件" @action="resetAll" />
      </template>
      <ImEmpty v-else title="搜索消息" desc="支持联系人、群聊、消息类型、日期与 @消息" action-text="开始搜索" @action="focusSearch" />
      <div class="im-tabbar-space" />
    </div>
  </div>
</template>

<script setup>
import ImField from '../../components/im/ImField.vue'
import ImIcon from '../../components/im/ImIcon.vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImAvatar from '../../components/im/ImAvatar.vue'
import ImEmpty from '../../components/im/ImEmpty.vue'
import { useImState, imStore } from '../../im/store'
import {
  appSessionId, displayName, searchContacts, searchGroups, searchRecords, searchSessions, sessionTitle
} from '../../im/selectors'
import { toast } from '../../im/ui'

const router = useRouter()
const state = useImState()
const q = ref('')
const advanced = ref(false)
const filters = reactive({ sender: '', member: '', chatType: 'all', msgType: 'all', date: '', at: false })
const CHAT_TYPES = [{ key: 'all', label: '全部会话' }, { key: 'single', label: '单聊' }, { key: 'group', label: '群聊' }]
const MSG_TYPES = [
  { key: 'all', label: '全部类型' }, { key: 'text', label: '文本' }, { key: 'image', label: '图片' },
  { key: 'file', label: '文件' }, { key: 'voice', label: '语音' }, { key: 'video', label: '视频' },
  { key: 'vote', label: '投票' }, { key: 'chain', label: '接龙' }
]
const hasFilter = computed(() => Object.entries(filters).some(([k, v]) => v && !(k === 'chatType' || k === 'msgType') ? true : (k === 'chatType' || k === 'msgType') && v !== 'all'))

function focusSearch() { document.querySelector('.im-searchbar input')?.focus() }
function resetAll() {
  q.value = ''
  Object.assign(filters, { sender: '', member: '', chatType: 'all', msgType: 'all', date: '', at: false })
  focusSearch()
}

const contacts = computed(() => q.value.trim() ? searchContacts(state.value, q.value.trim()) : [])
const groups = computed(() => q.value.trim() ? searchGroups(state.value, q.value.trim()) : [])
const sessions = computed(() => q.value.trim() ? searchSessions(state.value, q.value.trim()) : [])
const apps = computed(() => q.value.trim() ? state.value.imApps.filter((a) => a.name.includes(q.value.trim()) || a.desc.includes(q.value.trim())) : [])
const services = computed(() => q.value.trim() ? state.value.serviceAccounts.filter((a) => a.name.includes(q.value.trim())) : [])
const records = computed(() => (q.value.trim() || hasFilter.value) ? searchRecords(state.value, q.value.trim(), { ...filters }) : [])
const total = computed(() => contacts.value.length + groups.value.length + sessions.value.length + apps.value.length + services.value.length + records.value.length)

function openContact(id) {
  const sid = imStore.getState().createSingleSession(id)
  router.push('/message/chat/' + sid)
}
function openGroup(id) {
  const s = state.value.sessions.find((x) => x.type === 'group' && x.targetId === id)
  if (s) router.push('/message/chat/' + s.id)
  else toast('该群暂无会话')
}
function openApp(id) {
  const sid = appSessionId(id)
  const s = state.value.sessions.find((x) => x.id === sid)
  if (s) router.push('/message/chat/' + sid)
  else toast('未找到应用会话')
}
function openRecord(hit) {
  router.push({ path: '/message/chat/' + hit.sessionId, query: { messageId: hit.msgId } })
}
</script>
