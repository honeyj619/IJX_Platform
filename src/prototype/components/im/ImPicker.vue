<template>
  <ImSheet :open="open" :title="title" @close="emit('close')">
    <!-- 转发 / 加成员：多选 -->
    <template v-if="mode === 'forward' || mode === 'members' || mode === 'mention' || mode === 'card'">
      <div v-if="mode === 'mention'" class="im-pad">
        <button type="button" class="im-chip" :class="{ active: all }" @click="all = !all; picked = []">@所有人</button>
      </div>
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="im-row"
        @click="toggle(item.id)"
      >
        <ImAvatar :name="item.name" :size="36" />
        <span class="im-row__main">
          <span class="im-row__title">{{ item.name }}</span>
          <span v-if="item.desc" class="im-row__desc">{{ item.desc }}</span>
        </span>
        <span class="im-checkbox" :class="{ checked: picked.includes(item.id) }"><ImIcon v-if="picked.includes(item.id)" name="check" :size="12" /></span>
      </button>
      <div class="im-pad im-flex">
        <button type="button" class="im-btn im-btn--ghost im-flex-1" @click="emit('close')">取消</button>
        <button type="button" class="im-btn im-btn--primary im-flex-1" @click="submitPick">确认（{{ picked.length }}）</button>
      </div>
    </template>

    <!-- 投票 -->
    <template v-else-if="mode === 'vote'">
      <div class="im-pad">
        <input v-model="voteTitle" class="im-input" placeholder="投票标题">
        <div class="im-flex" style="margin-top: 10px; gap: 16px">
          <label class="im-small"><input v-model="voteMultiple" type="checkbox"> 多选</label>
          <label class="im-small"><input v-model="voteAnonymous" type="checkbox"> 匿名</label>
        </div>
        <div style="margin-top: 12px">
          <div v-for="(opt, i) in voteOptions" :key="i" class="im-flex" style="margin-bottom: 8px">
            <input v-model="voteOptions[i]" class="im-input" :placeholder="'选项 ' + (i + 1)">
            <button v-if="voteOptions.length > 2" type="button" @click="voteOptions.splice(i, 1)"><ImIcon name="close" :size="16" /></button>
          </div>
          <button type="button" class="im-link im-small" @click="voteOptions.push('')"><ImIcon name="plus" :size="16" /> 添加选项</button>
        </div>
      </div>
      <div class="im-pad"><ImButton variant="primary" block @click="submitVote">发布投票</ImButton></div>
    </template>

    <!-- 接龙 -->
    <template v-else-if="mode === 'chain' || mode === 'chain-join'">
      <div class="im-pad">
        <template v-if="mode === 'chain'">
          <input v-model="chainTitle" class="im-input" placeholder="接龙标题">
          <input v-model="chainExample" class="im-input" style="margin-top: 8px" placeholder="示例（如：姓名 + 部门）">
        </template>
        <input v-model="chainText" class="im-input" style="margin-top: 8px" :placeholder="mode === 'chain' ? '第一条接龙内容' : '输入接龙内容'">
      </div>
      <div class="im-pad"><button type="button" class="im-btn im-btn--primary im-btn--block" @click="submitChain">提交</button></div>
    </template>

    <!-- 话题 / 定时 -->
    <template v-else-if="mode === 'topic' || mode === 'schedule'">
      <div class="im-pad">
        <input v-if="mode === 'topic'" v-model="topicTitle" class="im-input" placeholder="话题标题">
        <input v-else v-model="scheduleAt" class="im-input" type="datetime-local">
      </div>
      <div class="im-pad">
        <button type="button" class="im-btn im-btn--primary im-btn--block" @click="submitSimple">
          {{ mode === 'topic' ? '创建话题' : '设定定时' }}
        </button>
      </div>
    </template>

    <!-- 通话：Q5 统一「暂未开放」，保留原型流程示例但不作为完成态 -->
    <template v-else-if="mode === 'call'">
      <div class="im-state-banner">
        <ImIcon name="shield" :size="20" />
        <span><span class="im-state-banner__title">语音通话 · 暂未开放</span><span class="im-state-banner__desc">通话能力尚未接入真实媒体流，以下为原型流程示例，不代表功能已开放</span></span>
      </div>
      <button v-for="r in CALL_RESULTS" :key="r.key" type="button" class="im-sheet__action" @click="submitCall(r.key)">{{ r.label }}</button>
    </template>

    <!-- 合并转发详情 -->
    <template v-else-if="mode === 'merge'">
      <div class="im-card-title im-pad">{{ msg?.merge?.title || '合并转发消息' }}</div>
      <div v-for="(item, i) in (msg?.merge?.items || [])" :key="i" class="im-row">
        <span class="im-row__main">
          <span class="im-row__title">{{ item.fromName || displayName(state, item.from || '') }}：{{ item.text || '[消息]' }}</span>
          <span class="im-row__desc">{{ item.time }}</span>
        </span>
      </div>
    </template>
  </ImSheet>
</template>

<script setup>
import ImButton from './ImButton.vue'
import ImIcon from './ImIcon.vue'
import { computed, ref, watch } from 'vue'
import ImSheet from './ImSheet.vue'
import ImAvatar from './ImAvatar.vue'
import { displayName, filterSessions, getGroup, sessionTitle } from '../../im/selectors'
import { toast } from '../../im/ui'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: '' },
  state: { type: Object, required: true },
  sessionId: { type: String, default: '' },
  groupId: { type: String, default: '' },
  msg: { type: Object, default: null }
})
const emit = defineEmits(['close', 'confirm'])

const TITLES = {
  forward: '转发到', members: '选择成员', mention: '@成员', card: '选择名片',
  vote: '发起投票', chain: '发起接龙', 'chain-join': '参与接龙', topic: '创建话题',
  schedule: '定时消息', call: '语音通话 · 暂未开放', merge: '合并转发详情'
}
const title = computed(() => TITLES[props.mode] || '选择')
const CALL_RESULTS = [
  { key: 'ended', label: '已接通并结束（32 秒）' },
  { key: 'rejected', label: '对方拒绝' },
  { key: 'missed', label: '未接听' },
  { key: 'canceled', label: '已取消' }
]

const picked = ref([])
const all = ref(false)
const voteTitle = ref('')
const voteMultiple = ref(false)
const voteAnonymous = ref(false)
const voteOptions = ref(['', ''])
const chainTitle = ref('')
const chainExample = ref('')
const chainText = ref('')
const topicTitle = ref('')
const scheduleAt = ref('')

watch(() => [props.open, props.mode], () => {
  picked.value = []; all.value = false
  voteTitle.value = ''; voteMultiple.value = false; voteAnonymous.value = false; voteOptions.value = ['', '']
  chainTitle.value = ''; chainExample.value = ''; chainText.value = ''
  topicTitle.value = ''; scheduleAt.value = ''
})

const items = computed(() => {
  if (props.mode === 'forward') {
    return filterSessions(props.state, 'all')
      .filter((s) => s.id !== props.sessionId)
      .map((s) => ({ id: s.id, name: sessionTitle(props.state, s), desc: '' }))
  }
  if (props.mode === 'mention' || props.mode === 'members') {
    const g = getGroup(props.state, props.groupId)
    return (g?.members || []).filter((id) => id !== 'me').map((id) => ({ id, name: displayName(props.state, id), desc: '' }))
  }
  if (props.mode === 'card') {
    return props.state.contacts.filter((c) => c.id !== 'me').map((c) => ({ id: c.id, name: c.name, desc: c.job || c.dept || '' }))
  }
  return []
})

function toggle(id) {
  if (picked.value.includes(id)) picked.value = picked.value.filter((x) => x !== id)
  else picked.value = [...picked.value, id]
}
function submitPick() {
  if (!picked.value.length && !all.value) { toast('请先选择'); return }
  const payload = props.mode === 'forward' ? { sessionIds: [...picked.value] }
    : props.mode === 'card' ? { contactId: picked.value[0] }
      : { ids: [...picked.value], all: all.value }
  emit('confirm', payload)
  emit('close')
}
function submitVote() {
  const opts = voteOptions.value.map((x) => x.trim()).filter(Boolean)
  if (!voteTitle.value.trim() || opts.length < 2) { toast('请填写标题和至少两个选项'); return }
  emit('confirm', {
    vote: {
      title: voteTitle.value.trim(), multiple: voteMultiple.value, anonymous: voteAnonymous.value,
      options: opts.map((text, i) => ({ id: `o${i + 1}`, text, voters: [] }))
    }
  })
  emit('close')
}
function submitChain() {
  if (!chainText.value.trim()) { toast('请输入接龙内容'); return }
  emit('confirm', { chain: { title: chainTitle.value.trim(), example: chainExample.value.trim(), text: chainText.value.trim() } })
  emit('close')
}
function submitSimple() {
  if (props.mode === 'topic') {
    if (!topicTitle.value.trim()) { toast('请输入话题标题'); return }
    emit('confirm', { title: topicTitle.value.trim() })
  } else {
    if (!scheduleAt.value) { toast('请选择时间'); return }
    emit('confirm', { at: scheduleAt.value.replace('T', ' ').slice(5, 16) })
  }
  emit('close')
}
function submitCall(result) {
  emit('confirm', { result, duration: result === 'ended' ? 32 : 0 })
  emit('close')
}
</script>
