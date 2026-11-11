<template>
  <div class="im-composer">
    <div v-if="quote || reedit" class="im-composer__reply">
      <span>{{ reedit ? '重新编辑：' + (reedit.text || '') : '引用 ' + displayName(state, quote?.from || '') + '：' + (quote?.text || '[消息]') }}</span>
      <button type="button" aria-label="取消引用" @click="clearReply"><ImIcon name="close" :size="16" /></button>
    </div>
    <div v-if="mentionLabel" class="im-composer__reply">
      <span class="im-link">{{ mentionLabel }}</span>
      <button type="button" aria-label="取消提及" @click="mentions = []; mentionAll = false"><ImIcon name="close" :size="16" /></button>
    </div>

    <div class="im-composer__line">
      <textarea
        v-model="text"
        class="im-composer__input"
        rows="1"
        :placeholder="disabled ? '当前不可发送消息' : '输入消息…'"
        :disabled="disabled"
        @keydown.enter.exact.prevent="send"
        @input="saveDraft"
      />
      <button type="button" class="im-composer__send" :disabled="!text.trim() || disabled || sending" :aria-busy="sending ? 'true' : null" @click="send">{{ sending ? '发送中…' : '发送' }}</button>
    </div>

    <div class="im-composer__tools">
      <button v-if="isGroup" type="button" class="im-composer__tool" title="@成员" aria-label="提及成员" @click="emit('mention')"><ImIcon name="at" :size="20" /></button>
      <button type="button" class="im-composer__tool" title="表情" aria-label="表情" @click="togglePanel('emoji')"><ImIcon name="smile" :size="20" /></button>
      <button type="button" class="im-composer__tool" title="更多" aria-label="更多" @click="togglePanel('more')"><ImIcon name="plus" :size="20" /></button>
      <span class="im-flex-1" />
      <button type="button" class="im-composer__tool" title="语音通话" aria-label="语音通话" @click="emit('extra', { type: 'call', mode: 'voice' })"><ImIcon name="phone" :size="20" /></button>
      <button type="button" class="im-composer__tool" title="视频通话" aria-label="视频通话" @click="emit('extra', { type: 'call', mode: 'video' })"><ImIcon name="video" :size="20" /></button>
    </div>

    <div v-if="panel === 'emoji'" class="im-emoji-grid">
      <button v-for="e in EMOJIS" :key="e" type="button" @click="text += e; saveDraft()">{{ e }}</button>
    </div>
    <div v-else-if="panel === 'more'" class="im-composer__panel">
      <button v-for="item in MORE" :key="item.key" type="button" class="im-composer__cell" @click="onMore(item)">
        <ImIcon :name="item.icon" :size="22" /><span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import ImIcon from './ImIcon.vue'
import { computed, ref, watch } from 'vue'
import { imStore } from '../../im/store'
import { displayName } from '../../im/selectors'
import { REACTION_EMOJIS, toast } from '../../im/ui'
import { runTask } from '../../im/task'

const props = defineProps({
  sessionId: { type: String, required: true },
  state: { type: Object, required: true },
  isGroup: { type: Boolean, default: false },
  quote: { type: Object, default: null },
  reedit: { type: Object, default: null },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['sent', 'extra', 'mention', 'cancelReply'])

const EMOJIS = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '🎉', ...REACTION_EMOJIS]
const MORE = [
  { key: 'image', icon: 'image', label: '图片' },
  { key: 'video', icon: 'video', label: '视频' },
  { key: 'voice', icon: 'voice', label: '语音' },
  { key: 'file', icon: 'file', label: '文件' },
  { key: 'card', icon: 'card', label: '名片' },
  { key: 'article', icon: 'article', label: '图文' },
  { key: 'vote', icon: 'vote', label: '投票' },
  { key: 'chain', icon: 'chain', label: '接龙' },
  { key: 'topic', icon: 'chat', label: '话题' },
  { key: 'schedule', icon: 'schedule', label: '定时' },
  { key: 'burn', icon: 'burn', label: '阅后即焚' },
  { key: 'emoji', icon: 'smile', label: '表情消息' }
]

const text = ref('')
const panel = ref('')
const mentions = ref([])
const mentionAll = ref(false)
const burn = ref(false)
const scheduled = ref(false)
const scheduleAt = ref('')

watch(() => props.sessionId, (sid) => {
  text.value = props.state.drafts?.[sid] || ''
  panel.value = ''
  mentions.value = []
  mentionAll.value = false
}, { immediate: true })
watch(() => props.reedit, (m) => { if (m) { text.value = m.text || ''; panel.value = '' } })
watch(() => props.quote, () => { panel.value = '' })

const mentionLabel = computed(() => {
  if (mentionAll.value) return '@所有人'
  if (!mentions.value.length) return ''
  return '提及：' + mentions.value.map((id) => displayName(props.state, id)).join('、')
})

function togglePanel(name) { panel.value = panel.value === name ? '' : name }
function saveDraft() { imStore.getState().setDraft(props.sessionId, text.value) }
function clearReply() { emit('cancelReply'); text.value = ''; saveDraft() }

function onMore(item) {
  panel.value = ''
  if (['vote', 'chain', 'topic', 'schedule', 'card'].includes(item.key)) {
    emit('extra', { type: item.key })
    return
  }
  if (item.key === 'burn') { burn.value = !burn.value; toast(burn.value ? '下一条消息阅后即焚' : '已关闭阅后即焚'); return }
  const map = {
    image: { type: 'image', title: '示例图片.png', w: 720, h: 480 },
    video: { type: 'video', title: '演示视频.mp4', duration: 18 },
    voice: { type: 'voice', duration: 6 },
    file: { type: 'file', title: '项目资料.pdf', size: '2.4 MB' },
    article: { type: 'article', title: '吉祥航空内部通告', desc: '点击查看详情' },
    emoji: { type: 'emoji', text: '🎉' }
  }
  const id = imStore.getState().sendMessage(props.sessionId, map[item.key] || { type: 'text', text: item.label })
  emit('sent', id)
  toast('已发送' + item.label)
}

const sending = ref(false)

async function send() {
  const value = text.value.trim()
  if (!value || props.disabled || sending.value) return
  sending.value = true
  const store = imStore.getState()
  const sentId = await runTask('发送', () => {
    if (props.reedit) {
      store.editMessage(props.sessionId, props.reedit.id, value)
      return null
    }
    const payload = {
      type: 'text',
      text: value,
      quote: props.quote ? { id: props.quote.id, from: props.quote.from, type: props.quote.type, text: props.quote.text } : undefined,
      mentions: mentions.value.length ? [...mentions.value] : undefined,
      mentionAll: mentionAll.value || undefined,
      burn: burn.value || undefined,
      scheduled: scheduled.value || undefined,
      scheduleAt: scheduleAt.value || undefined
    }
    return store.sendMessage(props.sessionId, payload)
  }, '消息已发送')
  text.value = ''
  saveDraft()
  mentions.value = []
  mentionAll.value = false
  burn.value = false
  scheduled.value = false
  scheduleAt.value = ''
  emit('cancelReply')
  emit('sent', sentId || undefined)
  sending.value = false
}

function setMentions(ids, all) { mentions.value = ids; mentionAll.value = all }
function setSchedule(at) { scheduled.value = true; scheduleAt.value = at }
defineExpose({ setMentions, setSchedule })
</script>
