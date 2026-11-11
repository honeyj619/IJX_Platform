<template>
  <div v-if="msg.type === 'system' || msg.recalled || msg.burned" class="im-msg-system">
    <template v-if="msg.type === 'system'">{{ msg.text }}</template>
    <template v-else-if="msg.burned">消息已焚毁</template>
    <template v-else>
      {{ msg.from === 'me' ? '你' : displayName(state, msg.from) }}撤回了一条消息
      <button v-if="msg.from === 'me' && canReedit" class="im-link" type="button" @click="emit('reedit', msg)">重新编辑</button>
    </template>
  </div>

  <div v-else class="im-msg-row" :class="{ mine }">
    <ImAvatar :name="displayName(state, msg.from)" :icon="senderIcon" :size="36" />
    <div class="im-msg-wrap">
      <div v-if="isGroup && !mine" class="im-msg-sender im-truncate">{{ displayName(state, msg.from) }}</div>
      <div
        class="im-bubble"
        :class="[mine ? 'mine' : 'other', isCard ? 'card' : '', highlighted ? 'highlight' : '']"
        @click="onTap"
        @contextmenu.prevent="emit('menu', msg)"
      >
        <div v-if="msg.quote" class="im-bubble__quote">
          {{ displayName(state, msg.quote.from) }}：{{ msg.quote.text || '[消息]' }}
        </div>

        <!-- 文本 / 表情 -->
        <div v-if="msg.type === 'text'">{{ msg.text }}</div>
        <div v-else-if="msg.type === 'emoji'" style="font-size: var(--t10-size); line-height: 1.3">{{ msg.text || '😀' }}</div>

        <!-- 图片 / 视频 / 语音 / 文件 -->
        <div v-else-if="msg.type === 'image'" class="im-flex" style="gap: 10px">
          <ImIcon name="image" :size="26" />
          <span>{{ msg.title || '图片' }}<span class="im-small im-muted"> · {{ msg.w || 720 }}×{{ msg.h || 480 }}</span></span>
        </div>
        <div v-else-if="msg.type === 'video'" class="im-flex" style="gap: 10px">
          <ImIcon name="video" :size="26" />
          <span>{{ msg.title || '视频' }}<span class="im-small im-muted"> · {{ formatClock(msg.duration || 0) }}</span></span>
        </div>
        <div v-else-if="msg.type === 'voice'" class="im-flex" style="gap: 8px">
          <ImIcon name="voice" :size="20" /><span>{{ msg.duration || 5 }}″</span>
        </div>
        <div v-else-if="msg.type === 'file'" class="im-flex" style="gap: 10px">
          <ImIcon name="file" :size="26" />
          <span class="im-flex-1">
            <span class="im-truncate" style="display: block">{{ msg.title || msg.text || '文件' }}</span>
            <span class="im-small im-muted">{{ msg.size || '1.2 MB' }}</span>
          </span>
        </div>

        <!-- 名片 / 图文 / 通话 / 合并 -->
        <div v-else-if="msg.type === 'card'" class="im-flex" style="gap: 10px">
          <ImAvatar :name="cardName" :size="34" />
          <span><span style="display: block">{{ cardName }}</span><span class="im-small im-muted">{{ msg.desc || '个人名片' }}</span></span>
        </div>
        <div v-else-if="msg.type === 'article'">
          <div class="im-card-title im-truncate">{{ msg.title || '图文消息' }}</div>
          <div class="im-card-sub">{{ msg.desc || '点击查看图文详情' }}</div>
        </div>
        <div v-else-if="msg.type === 'call'" class="im-flex" style="gap: 8px">
          <ImIcon :name="msg.mode === 'video' ? 'video' : 'phone'" :size="20" />
          <span>{{ callLabel }}</span>
        </div>
        <div v-else-if="msg.type === 'merge'" @click.stop="emit('open', { type: 'merge', msg })">
          <div class="im-card-title im-truncate"><ImIcon name="merge" :size="16" /> {{ msg.merge?.title || '合并转发消息' }}</div>
          <div class="im-card-sub">{{ msg.merge?.items?.length || 0 }} 条消息 · 点击查看</div>
        </div>

        <!-- 投票 -->
        <div v-else-if="msg.type === 'vote'">
          <div class="im-card-title">{{ msg.vote?.title || '群投票' }}</div>
          <div class="im-card-sub">
            {{ msg.vote?.multiple ? '多选' : '单选' }} · {{ msg.vote?.anonymous ? '匿名' : '实名' }}
            <span v-if="msg.vote?.ended"> · 已结束</span>
          </div>
          <div class="im-card-list">
            <button
              v-for="opt in (msg.vote?.options || [])"
              :key="opt.id"
              type="button"
              class="im-card-item"
              :class="{ checked: isVoteChecked(msg, opt.id) }"
              @click.stop="onVoteOption(msg, opt.id)"
            >
              <span class="im-flex-1">{{ opt.text }}</span>
              <span class="im-small">{{ opt.voters.length }} 票</span>
              <span class="im-card-progress" style="width: 46px"><i :style="{ width: votePercent(msg, opt) + '%' }" /></span>
            </button>
          </div>
          <div class="im-flex" style="justify-content: space-between; margin-top: 8px">
            <button v-if="msg.vote?.multiple && !msg.vote?.ended" type="button" class="im-link im-small" @click.stop="submitMultiVote(msg)">提交投票</button>
            <span v-else />
            <button v-if="mine && !msg.vote?.ended" type="button" class="im-link im-small" @click.stop="imStore.getState().endVote(sessionId, msg.id); toast('投票已结束')">结束投票</button>
          </div>
        </div>

        <!-- 接龙 -->
        <div v-else-if="msg.type === 'chain'">
          <div class="im-card-title"><ImIcon name="chain" :size="16" /> {{ msg.chain?.title || '群接龙' }}</div>
          <div v-if="msg.chain?.example" class="im-card-sub">示例：{{ msg.chain.example }}</div>
          <div class="im-card-list">
            <div v-for="(item, i) in (msg.chain?.items || [])" :key="item.id" class="im-card-item">
              <span class="im-tag im-tag--muted">{{ i + 1 }}</span>
              <span class="im-flex-1">{{ displayName(state, item.from) }}：{{ item.text }}</span>
            </div>
          </div>
          <button type="button" class="im-link im-small" style="margin-top: 8px" @click.stop="emit('chain', msg)">参与接龙 ›</button>
        </div>

        <div v-else>{{ preview(msg) }}</div>

        <!-- 话题入口 -->
        <button v-if="msg.topicId" type="button" class="im-link im-small" style="margin-top: 6px" @click.stop="emit('openTopic', msg.topicId)">查看话题讨论 ›</button>

        <div class="im-bubble__meta">
          <span v-if="msg.scheduled">定时{{ msg.scheduleAt ? ' ' + msg.scheduleAt : '' }}</span>
          <span v-if="msg.burn">阅后即焚</span>
          <span v-if="msg.edited">已编辑</span>
          <span v-if="msg.status === 'sending'">发送中</span>
          <span v-if="msg.status === 'failed'">发送失败</span>
          <span v-if="msg.status === 'read'">已读</span>
          <span>{{ msg.time }}</span>
        </div>
      </div>

      <div v-if="reactionList.length" class="im-bubble__reactions" :style="mine ? 'justify-content: flex-end' : ''">
        <button
          v-for="r in reactionList"
          :key="r.emoji"
          type="button"
          class="im-bubble__reaction"
          @click="imStore.getState().toggleReaction(sessionId, msg.id, r.emoji)"
        >{{ r.emoji }} {{ r.count }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import ImIcon from './ImIcon.vue'
import { computed, reactive } from 'vue'
import ImAvatar from './ImAvatar.vue'
import { displayName } from '../../im/selectors'
import { imStore } from '../../im/store'
import { formatClock } from '../../im/data/utils'
import { preview, toast } from '../../im/ui'

const props = defineProps({
  msg: { type: Object, required: true },
  state: { type: Object, required: true },
  sessionId: { type: String, required: true },
  mine: { type: Boolean, default: false },
  isGroup: { type: Boolean, default: false },
  highlighted: { type: Boolean, default: false },
  canReedit: { type: Boolean, default: true }
})
const emit = defineEmits(['menu', 'open', 'reedit', 'chain', 'openTopic'])

const CARD_TYPES = ['file', 'card', 'article', 'merge', 'call']
const isCard = computed(() => CARD_TYPES.includes(props.msg.type) || ['vote', 'chain'].includes(props.msg.type))
const senderIcon = computed(() => props.msg.from === 'me' ? '梁' : '')
const cardName = computed(() => props.msg.card?.id ? displayName(props.state, props.msg.card.id) : (props.msg.title || '联系人'))
const callLabel = computed(() => {
  const m = props.msg
  const base = m.mode === 'video' ? '视频通话' : '语音通话'
  const map = { ended: '已结束', rejected: '已拒绝', missed: '未接听', canceled: '已取消', ignored: '已忽略' }
  return `${base} · ${map[m.result] || '已结束'}${m.duration ? ' · ' + formatClock(m.duration) : ''}`
})
const reactionList = computed(() => Object.entries(props.msg.reactions || {}).filter(([, users]) => users.length).map(([emoji, users]) => ({ emoji, count: users.length })))

const multiSelections = reactive({})
function isVoteChecked(msg, optionId) {
  const vote = msg.vote
  if (!vote) return false
  if (vote.multiple && !vote.ended) return (multiSelections[msg.id] || []).includes(optionId)
  return (vote.options || []).some((o) => o.id === optionId && o.voters.includes('me'))
}
function votePercent(msg, opt) {
  const total = (msg.vote?.options || []).reduce((n, o) => n + o.voters.length, 0)
  return total ? Math.round(opt.voters.length / total * 100) : 0
}
function onVoteOption(msg, optionId) {
  if (msg.vote?.ended) { toast('投票已结束'); return }
  if (msg.vote?.multiple) {
    const list = multiSelections[msg.id] || (multiSelections[msg.id] = [])
    const i = list.indexOf(optionId)
    if (i >= 0) list.splice(i, 1); else list.push(optionId)
  } else {
    imStore.getState().submitVote(props.sessionId, msg.id, [optionId])
    toast('已投票')
  }
}
function submitMultiVote(msg) {
  const ids = multiSelections[msg.id] || []
  if (!ids.length) { toast('请先选择选项'); return }
  imStore.getState().submitVote(props.sessionId, msg.id, ids)
  multiSelections[msg.id] = []
  toast('已投票')
}
function onTap() {
  if (props.msg.burn && !props.msg.burnRevealed) {
    imStore.getState().revealBurn(props.sessionId, props.msg.id)
    toast('消息已展示，退出后焚毁')
    return
  }
  if (props.msg.type === 'merge') { emit('open', { type: 'merge', msg: props.msg }); return }
  emit('menu', props.msg)
}
</script>
