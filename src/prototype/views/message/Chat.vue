<template>
  <div class="im-page">
    <ImNavBar :title="session ? sessionTitle(state, session) : '会话'">
      <template #right>
        <button type="button" class="im-nav__btn" aria-label="搜索" @click="router.push('/message/history/' + sessionId)"><ImIcon name="search" :size="20" /></button>
        <button type="button" class="im-nav__btn" aria-label="会话设置" @click="router.push('/message/info/' + sessionId)"><ImIcon name="more" :size="20" /></button>
      </template>
    </ImNavBar>

    <div v-if="pins.length" class="im-notice-bar">
      <ImIcon name="pin" :size="16" />
      <span class="im-notice-bar__text im-truncate">置顶：{{ preview(pins[pins.length - 1].msg) }}</span>
      <button type="button" class="im-notice-bar__link" @click="router.push('/message/pins/' + sessionId)">{{ pins.length }} 条 ›</button>
    </div>
    <div v-if="isGroup && mentionMsg && !mentionHidden" class="im-notice-bar">
      <ImIcon name="at" :size="16" />
      <span class="im-notice-bar__text im-truncate">{{ mentionMsg.mentionAll ? '有人 @了所有人' : displayName(state, mentionMsg.from) + ' @了你' }}</span>
      <button type="button" class="im-notice-bar__link" @click="jumpTo(mentionMsg.id)">查看</button>
      <button type="button" class="im-nav__btn" aria-label="关闭提醒" @click="mentionHidden = true"><ImIcon name="close" :size="18" /></button>
    </div>

    <div ref="scroller" class="im-chat-scroll">
      <div v-if="!messages.length" class="im-msg-system">暂无消息，发送一条开始聊天</div>
      <template v-for="msg in messages" :key="msg.id">
        <div :id="'msg-' + msg.id" class="im-flex" style="align-items: flex-start; gap: 6px">
          <button v-if="multiMode" type="button" class="im-checkbox" style="margin-top: 18px" :class="{ checked: selected.includes(msg.id) }" @click="toggleSelect(msg.id)"><ImIcon v-if="selected.includes(msg.id)" name="check" :size="12" /></button>
          <div class="im-flex-1">
            <ImBubble
              :msg="msg"
              :state="state"
              :session-id="sessionId"
              :mine="msg.from === 'me'"
              :is-group="isGroup"
              :highlighted="highlightId === msg.id"
              @menu="onMenu"
              @open="onBubbleOpen"
              @reedit="reeditMsg = $event"
              @chain="onChain"
              @open-topic="router.push('/message/topic/' + $event)"
            />
          </div>
        </div>
      </template>
    </div>

    <div v-if="multiMode" class="im-multibar">
      <button type="button" @click="startForward('single')">逐条转发</button>
      <button type="button" @click="startForward('merge')">合并转发</button>
      <button type="button" class="primary" @click="exitMulti">取消</button>
    </div>

    <ImComposer
      v-else
      ref="composerRef"
      :session-id="sessionId"
      :state="state"
      :is-group="isGroup"
      :quote="quoteMsg"
      :reedit="reeditMsg"
      :disabled="muted"
      @extra="onExtra"
      @mention="pickerMode = 'mention'"
      @cancel-reply="quoteMsg = null; reeditMsg = null"
      @sent="scrollBottom"
    />

    <ImActionSheet
      :open="sheetOpen"
      :msg="actionMsg"
      :state="state"
      :session-id="sessionId"
      :mine="actionMsg?.from === 'me'"
      :is-group="isGroup"
      @close="sheetOpen = false"
      @action="onAction"
    />

    <ImPicker
      :open="!!pickerMode"
      :mode="pickerMode"
      :state="state"
      :session-id="sessionId"
      :group-id="groupId"
      :msg="pickerMsg"
      @close="pickerMode = ''"
      @confirm="onPickerConfirm"
    />
  </div>
</template>

<script setup>
import ImIcon from '../../components/im/ImIcon.vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImBubble from '../../components/im/ImBubble.vue'
import ImComposer from '../../components/im/ImComposer.vue'
import ImActionSheet from '../../components/im/ImActionSheet.vue'
import ImPicker from '../../components/im/ImPicker.vue'
import { useImState, imStore } from '../../im/store'
import {
  displayName, getSession, isMutedInGroup, latestMention, pinnedMessages, sessionMessages, sessionTitle
} from '../../im/selectors'
import { confirmBox, preview, toast } from '../../im/ui'
import { runTask } from '../../im/task'

const route = useRoute()
const router = useRouter()
const state = useImState()
const sessionId = computed(() => String(route.params.sessionId || ''))
const session = computed(() => getSession(state.value, sessionId.value))
const isGroup = computed(() => session.value?.type === 'group')
const groupId = computed(() => isGroup.value ? session.value.targetId : '')
const messages = computed(() => sessionMessages(state.value, sessionId.value))
const pins = computed(() => pinnedMessages(state.value, sessionId.value))
const mentionMsg = computed(() => session.value ? latestMention(state.value, session.value) : null)
const muted = computed(() => isGroup.value ? isMutedInGroup(state.value, groupId.value) : false)

const scroller = ref(null)
const composerRef = ref(null)
const sheetOpen = ref(false)
const actionMsg = ref(null)
const quoteMsg = ref(null)
const reeditMsg = ref(null)
const pickerMode = ref('')
const pickerMsg = ref(null)
const mentionHidden = ref(false)
const highlightId = ref('')
const multiMode = ref(false)
const selected = ref([])
const forwardIds = ref([])
const forwardMode = ref('single')
const chainMsg = ref(null)
const topicMsg = ref(null)
const callMode = ref('voice')

function scrollBottom() {
  nextTick(() => { const el = scroller.value; if (el) el.scrollTop = el.scrollHeight })
}
function jumpTo(id) {
  highlightId.value = id
  nextTick(() => {
    document.getElementById('msg-' + id)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    window.setTimeout(() => { highlightId.value = '' }, 1900)
  })
}

onMounted(() => {
  imStore.getState().markRead(sessionId.value)
  if (route.query.messageId) window.setTimeout(() => jumpTo(String(route.query.messageId)), 260)
  else scrollBottom()
})
watch(sessionId, () => {
  mentionHidden.value = false
  quoteMsg.value = null
  reeditMsg.value = null
  exitMulti()
  imStore.getState().markRead(sessionId.value)
  scrollBottom()
})
watch(() => messages.value.length, () => { if (!highlightId.value) scrollBottom() })

function onMenu(msg) { actionMsg.value = msg; sheetOpen.value = true }
function onBubbleOpen({ msg }) { pickerMsg.value = msg; pickerMode.value = 'merge' }
function onChain(msg) { chainMsg.value = msg; pickerMsg.value = msg; pickerMode.value = 'chain-join' }

function onAction(name, msg) {
  actionMsg.value = msg
  if (name === 'quote') quoteMsg.value = msg
  else if (name === 'forward') { forwardIds.value = [msg.id]; forwardMode.value = 'single'; pickerMode.value = 'forward' }
  else if (name === 'multi') { multiMode.value = true; selected.value = [msg.id] }
  else if (name === 'receipt') router.push(`/message/receipt/${sessionId.value}/${msg.id}`)
  else if (name === 'topic') { topicMsg.value = msg; pickerMode.value = 'topic' }
  else if (name === 'merge') { pickerMsg.value = msg; pickerMode.value = 'merge' }
}

function onExtra({ type, mode }) {
  if (type === 'call') { callMode.value = mode || 'voice'; pickerMode.value = 'call'; return }
  pickerMode.value = type
}

function toggleSelect(id) {
  selected.value = selected.value.includes(id) ? selected.value.filter((x) => x !== id) : [...selected.value, id]
}
function exitMulti() { multiMode.value = false; selected.value = [] }
function startForward(mode) {
  if (!selected.value.length) { toast('请先选择消息'); return }
  forwardIds.value = [...selected.value]
  forwardMode.value = mode
  pickerMode.value = 'forward'
}

/** P2-1：核心写操作统一走「处理中 → 结果 / 错误」反馈 */
function commit(label, work, okText) { return runTask(label, work, okText) }

async function onPickerConfirm(payload) {
  const s = imStore.getState()
  const mode = pickerMode.value
  pickerMode.value = ''
  if (mode === 'forward') {
    await commit('转发消息', () => s.forwardMessages(sessionId.value, forwardIds.value, payload.sessionIds, forwardMode.value), `已转发到 ${payload.sessionIds.length} 个会话`)
    exitMulti()
  } else if (mode === 'mention') {
    composerRef.value?.setMentions(payload.ids, payload.all)
    toast('已添加提及对象')
  } else if (mode === 'vote') {
    await commit('发布投票', () => s.publishVote(sessionId.value, payload.vote), '投票已发布')
    scrollBottom()
  } else if (mode === 'chain') {
    await commit('发起接龙', () => s.publishChain(sessionId.value, {
      chainId: `c${Date.now()}`, title: payload.chain.title || '群接龙',
      example: payload.chain.example, starter: 'me',
      items: [{ id: `i${Date.now()}`, from: 'me', text: payload.chain.text }]
    }), '接龙已发起')
    scrollBottom()
  } else if (mode === 'chain-join' && chainMsg.value) {
    await commit('参与接龙', () => s.upsertChainItem(sessionId.value, chainMsg.value.id, payload.chain.text), '已参与接龙')
  } else if (mode === 'topic' && topicMsg.value) {
    const id = await commit('创建话题', () => s.createTopic(sessionId.value, topicMsg.value.id, payload.title), '话题已创建')
    if (id) router.push('/message/topic/' + id)
  } else if (mode === 'schedule') {
    composerRef.value?.setSchedule(payload.at)
    toast('已设定发送时间：' + payload.at)
  } else if (mode === 'call') {
    await commit('通话记录', () => s.appendCallRecord(sessionId.value, callMode.value, payload.result, payload.duration), '语音通话暂未开放（原型记录）')
    scrollBottom()
  } else if (mode === 'card') {
    await commit('发送名片', () => s.sendMessage(sessionId.value, { type: 'card', card: { kind: 'contact', id: payload.contactId }, title: displayName(state.value, payload.contactId) }), '名片已发送')
    scrollBottom()
  } else if (mode === 'members') {
    await commit('添加成员', () => s.addGroupMembers(groupId.value, payload.ids), '已添加成员')
  }
}

async function clearAll() {
  if (!await confirmBox('清空聊天记录', '该操作只影响本机演示数据。', '清空')) return
  await commit('清空聊天记录', () => imStore.getState().clearSession(sessionId.value), '聊天记录已清空')
}
defineExpose({ clearAll })
</script>
