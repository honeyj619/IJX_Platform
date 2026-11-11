<template>
  <ImSheet :open="open" title="消息操作" @close="emit('close')">
    <template v-if="msg">
      <div class="im-small im-muted im-pad im-truncate">{{ preview(msg) }}</div>
      <div v-if="showReactions" class="im-emoji-grid" style="padding: 4px 8px 12px">
        <button v-for="e in REACTION_EMOJIS" :key="e" type="button" @click="react(e)">{{ e }}</button>
      </div>
      <button type="button" class="im-sheet__action" @click="copy">复制</button>
      <button type="button" class="im-sheet__action" @click="act('quote')">引用</button>
      <button type="button" class="im-sheet__action" @click="showReactions = !showReactions">回应</button>
      <button type="button" class="im-sheet__action" @click="act('forward')">转发</button>
      <button type="button" class="im-sheet__action" @click="act('multi')">多选</button>
      <button v-if="isGroup && mine" type="button" class="im-sheet__action" @click="act('receipt')">查看已读回执</button>
      <button v-if="isPinnableMsg(msg)" type="button" class="im-sheet__action" @click="togglePinMsg">{{ pinnedNow ? '取消置顶' : '置顶消息' }}</button>
      <button v-if="isGroup" type="button" class="im-sheet__action" @click="act('topic')">创建话题</button>
      <button v-if="msg.type === 'merge'" type="button" class="im-sheet__action" @click="act('merge')">查看合并详情</button>
      <button v-if="mine && canRecall(msg)" type="button" class="im-sheet__action" @click="doRecall">撤回</button>
      <button v-if="msg.burn && msg.burnRevealed" type="button" class="im-sheet__action" @click="doBurn">立即焚毁</button>
      <button type="button" class="im-sheet__action danger" @click="doDelete">删除</button>
      <button type="button" class="im-sheet__action im-muted" @click="emit('close')">取消</button>
    </template>
  </ImSheet>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ImSheet from './ImSheet.vue'
import { imStore } from '../../im/store'
import { isPinned } from '../../im/selectors'
import { canRecall, isPinnable } from '../../im/data/utils'
import { confirmBox, preview, REACTION_EMOJIS, toast } from '../../im/ui'

const props = defineProps({
  open: { type: Boolean, default: false },
  msg: { type: Object, default: null },
  state: { type: Object, required: true },
  sessionId: { type: String, required: true },
  mine: { type: Boolean, default: false },
  isGroup: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'action'])
const showReactions = ref(false)
watch(() => props.open, (v) => { if (!v) showReactions.value = false })

const pinnedNow = computed(() => props.msg ? isPinned(props.state, props.sessionId, props.msg.id) : false)
const isPinnableMsg = isPinnable

function close() { emit('close') }
function act(name) { emit('action', name, props.msg); close() }
function react(emoji) {
  imStore.getState().toggleReaction(props.sessionId, props.msg.id, emoji)
  toast('已回应 ' + emoji)
  close()
}
function togglePinMsg() {
  const s = imStore.getState()
  if (pinnedNow.value) { s.unpinMessage(props.sessionId, props.msg.id); toast('已取消置顶') }
  else { s.pinMessage(props.sessionId, props.msg.id); toast('消息已置顶') }
  close()
}
async function doRecall() {
  if (!await confirmBox('撤回消息', '撤回后对方将看到「已撤回」，可重新编辑。', '撤回')) return
  imStore.getState().recallMessage(props.sessionId, props.msg.id)
  toast('已撤回')
  close()
}
async function doDelete() {
  if (!await confirmBox('删除消息', '删除后本机会话中不再显示该消息。', '删除')) return
  imStore.getState().deleteMessage(props.sessionId, props.msg.id)
  toast('已删除')
  close()
}
function doBurn() {
  imStore.getState().burnMessage(props.sessionId, props.msg.id)
  toast('消息已焚毁')
  close()
}
function copy() {
  const text = props.msg?.text || preview(props.msg)
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => {})
  toast('已复制')
  close()
}
</script>
