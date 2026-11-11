<template>
  <div class="im-page">
    <ImNavBar :title="'聊天记录 · ' + (session ? sessionTitle(state, session) : '')" />
    <div class="im-searchbar">
      <ImIcon name="search" :size="18" /><input v-model="q" placeholder="搜索本会话的聊天记录"><button v-if="q" type="button" class="im-searchbar__clear" aria-label="清除" @click="q = ''"><ImIcon name="close" :size="16" /></button>
    </div>
    <div class="im-flex" style="padding: 0 var(--gutter) 8px; flex-wrap: wrap; gap: 6px">
      <button v-for="t in TYPES" :key="t.key" type="button" class="im-chip" :class="{ active: msgType === t.key }" @click="msgType = t.key">{{ t.label }}</button>
    </div>
    <div class="im-scroll">
      <button v-for="(h, i) in hits" :key="h.msgId + i" type="button" class="im-row" @click="open(h)">
        <ImAvatar :name="displayName(state, h.from)" :size="38" />
        <span class="im-row__main">
          <span class="im-row__title">{{ displayName(state, h.from) }} <span class="im-small im-muted">{{ h.time }}</span></span>
          <span class="im-row__desc im-truncate">{{ h.text }}</span>
        </span>
        <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
      </button>
      <ImEmpty v-if="!hits.length" :title="q.trim() ? '没有匹配记录' : '输入关键词查找消息'" desc="支持文本、文件、图片、投票、接龙等类型" />
      <div class="im-tabbar-space" />
    </div>
  </div>
</template>

<script setup>
import ImIcon from '../../components/im/ImIcon.vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImAvatar from '../../components/im/ImAvatar.vue'
import ImEmpty from '../../components/im/ImEmpty.vue'
import { useImState } from '../../im/store'
import { displayName, getSession, searchRecords, sessionTitle } from '../../im/selectors'

const route = useRoute()
const router = useRouter()
const state = useImState()
const q = ref('')
const msgType = ref('all')
const TYPES = [
  { key: 'all', label: '全部' }, { key: 'text', label: '文本' }, { key: 'image', label: '图片' },
  { key: 'file', label: '文件' }, { key: 'voice', label: '语音' }, { key: 'vote', label: '投票' },
  { key: 'chain', label: '接龙' }, { key: 'card', label: '名片' }
]
const sessionId = computed(() => String(route.params.sessionId || ''))
const session = computed(() => getSession(state.value, sessionId.value))
const hits = computed(() => (q.value.trim() || msgType.value !== 'all')
  ? searchRecords(state.value, q.value.trim(), { msgType: msgType.value }, sessionId.value)
  : [])
function open(hit) {
  router.push({ path: '/message/chat/' + hit.sessionId, query: { messageId: hit.msgId } })
}
</script>
