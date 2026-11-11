<template>
  <div class="im-page">
    <!-- 扫一扫 -->
    <template v-if="name === 'MessageScan'">
      <ImNavBar title="扫一扫" />
      <div class="im-scroll">
        <div class="im-state-banner">
          <ImIcon name="shield" :size="20" />
          <span><span class="im-state-banner__title">扫一扫 · 暂未开放</span><span class="im-state-banner__desc">摄像头能力尚未接入，以下为原型流程示例，不代表功能已开放</span></span>
        </div>
        <div class="im-card" style="padding: 28px 16px; text-align: center">
          <ImIcon name="camera" :size="64" />
          <div style="margin-top: 12px">摄像头能力尚未接入</div>
          <div class="im-small im-muted" style="margin-top: 6px">以下为原型流程示例，不代表功能已开放</div>
        </div>
        <div class="im-card">
          <button v-for="r in SCAN_RESULTS" :key="r.label" type="button" class="im-row" @click="scan(r)">
            <span class="im-row__main"><span class="im-row__title">{{ r.label }}</span><span class="im-row__desc">{{ r.desc }}</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
          </button>
        </div>
        <div v-if="scanResult" class="im-card im-pad">
          <div class="im-card-title">扫描结果（原型示例 · 暂未开放）</div>
          <div class="im-small">{{ scanResult }}</div>
        </div>
        <div class="im-tabbar-space" />
      </div>
    </template>

    <!-- 置顶消息 -->
    <template v-else-if="name === 'MessagePins'">
      <ImNavBar title="置顶消息">
        <template #right><button type="button" class="im-nav__text" @click="clearPins">清空</button></template>
      </ImNavBar>
      <div class="im-scroll">
        <div v-for="p in pins" :key="p.msg.id" class="im-row">
          <span class="im-row__main" @click="jump(p.msg.id)">
            <span class="im-row__title">{{ displayName(state, p.msg.from) }}</span>
            <span class="im-row__desc im-truncate">{{ preview(p.msg) }}</span>
          </span>
          <button type="button" class="im-nav__btn" aria-label="取消置顶" @click="imStore.getState().unpinMessage(sessionId, p.msg.id); toast('已取消置顶')"><ImIcon name="close" :size="16" /></button>
        </div>
        <ImEmpty v-if="!pins.length" title="暂无置顶消息" />
        <div class="im-tabbar-space" />
      </div>
    </template>

    <!-- 话题 -->
    <template v-else-if="name === 'MessageTopic'">
      <ImNavBar title="话题讨论">
        <template #right><button type="button" class="im-nav__text" @click="leave">退出</button></template>
      </ImNavBar>
      <div class="im-scroll">
        <div class="im-card im-pad">
          <div class="im-flex"><input v-model="topicTitle" class="im-input im-flex-1"><button type="button" class="im-btn im-btn--primary" @click="saveTitle">保存</button></div>
          <div class="im-small im-muted" style="margin-top: 8px">{{ topic?.members?.length || 0 }} 位成员 · 由 {{ displayName(state, topic?.creator || '') }} 创建</div>
        </div>
        <div v-for="r in (topic?.replies || [])" :key="r.id" class="im-row">
          <ImAvatar :name="displayName(state, r.from)" :size="36" />
          <span class="im-row__main"><span class="im-row__title">{{ displayName(state, r.from) }} <span class="im-small im-muted">{{ r.time }}</span></span><span class="im-row__desc">{{ r.text }}</span></span>
        </div>
        <ImEmpty v-if="!topic?.replies?.length" title="暂无回复" />
        <div class="im-tabbar-space" />
      </div>
      <div class="im-composer">
        <div class="im-composer__line">
          <input v-model="replyText" class="im-composer__input" placeholder="回复话题…" @keydown.enter="sendReply">
          <button type="button" class="im-composer__send" @click="sendReply">发送</button>
        </div>
        <div class="im-composer__tools">
          <button type="button" class="im-composer__tool" @click="pickerMode = 'members'"><ImIcon name="card" :size="20" /> 添加成员</button>
          <button v-if="topic?.creator === 'me'" type="button" class="im-composer__tool" @click="destroy"><ImIcon name="trash" :size="20" /> 解散</button>
        </div>
      </div>
    </template>

    <!-- 已读回执 -->
    <template v-else-if="name === 'MessageReceipt'">
      <ImNavBar title="已读回执" />
      <div class="im-scroll">
        <div class="im-card im-pad">
          <div class="im-card-title">{{ preview(targetMsg) }}</div>
          <div class="im-small im-muted">{{ receipt.read.length }} / {{ receipt.total }} 人已读</div>
        </div>
        <div class="im-section-title">已读（{{ receipt.read.length }}）</div>
        <div v-for="id in receipt.read" :key="id" class="im-row"><ImAvatar :name="displayName(state, id)" :size="34" /><span class="im-row__main"><span class="im-row__title">{{ displayName(state, id) }}</span></span><span class="im-tag">已读</span></div>
        <div class="im-section-title">未读（{{ receipt.unread.length }}）</div>
        <div v-for="id in receipt.unread" :key="id" class="im-row"><ImAvatar :name="displayName(state, id)" :size="34" /><span class="im-row__main"><span class="im-row__title">{{ displayName(state, id) }}</span></span><span class="im-tag im-tag--muted">未读</span></div>
        <div class="im-tabbar-space" />
      </div>
    </template>

    <!-- 服务收件箱 -->
    <template v-else>
      <ImNavBar :title="account?.name || '员工服务'" />
      <div class="im-scroll">
        <div class="im-card im-pad">
          <div class="im-card-title">{{ account?.name }}</div>
          <div class="im-small im-muted">{{ account?.desc }}</div>
        </div>
        <div class="im-section-title">服务咨询（{{ tickets.length }}）</div>
        <button v-for="t in tickets" :key="t.id" type="button" class="im-row" @click="openTicket(t.id)">
          <ImAvatar :name="t.fromName" :icon="account?.icon" :badge="t.unread" :size="42" />
          <span class="im-row__main"><span class="im-row__title">{{ t.subject }}</span><span class="im-row__desc">{{ t.lastText }}</span></span>
          <span class="im-row__value">{{ t.lastTime }}</span>
        </button>
        <div class="im-card">
          <button type="button" class="im-row" @click="newTicket"><span class="im-row__main"><span class="im-row__title"><ImIcon name="plus" :size="16" /> 发起新的服务咨询 <span class="im-soon">暂未开放</span></span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span></button>
        </div>
        <ImEmpty v-if="!tickets.length" title="暂无服务咨询" />
        <div class="im-tabbar-space" />
      </div>
    </template>

    <ImPicker :open="!!pickerMode" :mode="pickerMode" :state="state" :group-id="topic?.groupId || ''" @close="pickerMode = ''" @confirm="addMembers" />
  </div>
</template>

<script setup>
import ImIcon from '../../components/im/ImIcon.vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImAvatar from '../../components/im/ImAvatar.vue'
import ImEmpty from '../../components/im/ImEmpty.vue'
import ImPicker from '../../components/im/ImPicker.vue'
import { useImState, imStore } from '../../im/store'
import { displayName, groupReceipt, pinnedMessages, sessionMessages, ticketsOf } from '../../im/selectors'
import { confirmBox, preview, toast } from '../../im/ui'
import { runTask } from '../../im/task'

const route = useRoute()
const router = useRouter()
const state = useImState()
const name = computed(() => String(route.name || ''))
const sessionId = computed(() => String(route.params.sessionId || ''))
const accountId = computed(() => String(route.params.accountId || ''))
const topicId = computed(() => String(route.params.topicId || ''))
const msgId = computed(() => String(route.params.msgId || ''))

const SCAN_RESULTS = [
  { label: '扫描群二维码', desc: '演示加入一个已有群聊', text: '已识别群二维码：前端组项目群（演示环境不执行真实加群）' },
  { label: '扫描个人名片', desc: '演示打开联系人资料', text: '已识别名片：诸葛亮 · 产品前端双人组' },
  { label: '扫描文件码', desc: '演示打开群文件', text: '已识别文件：登录页用例.xlsx（1.8 MB）' },
  { label: '扫描登录码', desc: '演示 PC 端扫码登录', text: '已识别登录请求：请在 PC 端确认（演示）' }
]
const scanResult = ref('')
function scan(r) { scanResult.value = r.text; toast('扫一扫暂未开放（原型示例）') }

const pins = computed(() => name.value === 'MessagePins' ? pinnedMessages(state.value, sessionId.value) : [])
function jump(id) { router.push({ path: '/message/chat/' + sessionId.value, query: { messageId: id } }) }
async function clearPins() {
  if (!await confirmBox('清空置顶消息', '将取消本会话的全部置顶。', '清空')) return
  await runTask('清空置顶消息', () => imStore.getState().unpinAll(sessionId.value), '已清空')
}

const topic = computed(() => state.value.topics[topicId.value])
const topicTitle = ref('')
const replyText = ref('')
const pickerMode = ref('')
watch(topic, (t) => { topicTitle.value = t?.title || '' }, { immediate: true })
async function saveTitle() {
  await runTask('保存话题标题', () => imStore.getState().updateTopicTitle(topicId.value, topicTitle.value.trim() || '未命名话题'), '标题已保存')
}
async function sendReply() {
  const text = replyText.value.trim()
  if (!text) return
  await runTask('发送回复', () => imStore.getState().replyTopic(topicId.value, text), '回复已发送')
  replyText.value = ''
}
async function addMembers(payload) {
  await runTask('添加成员', () => imStore.getState().addTopicMembers(topicId.value, payload.ids), '成员已添加')
}
async function leave() {
  if (!await confirmBox('退出话题', '退出后将不再接收话题回复。', '退出')) return
  imStore.getState().leaveTopic(topicId.value)
  router.back()
}
async function destroy() {
  if (!await confirmBox('解散话题', '所有回复将被移除，操作不可撤销。', '解散')) return
  imStore.getState().destroyTopic(topicId.value)
  router.push('/message')
}

const targetMsg = computed(() => sessionMessages(state.value, sessionId.value).find((m) => m.id === msgId.value))
const receipt = computed(() => targetMsg.value ? groupReceipt(state.value, sessionId.value, targetMsg.value) : { read: [], unread: [], total: 0 })

const account = computed(() => state.value.serviceAccounts.find((a) => a.id === accountId.value))
const tickets = computed(() => ticketsOf(state.value, accountId.value))
function openTicket(id) {
  const sid = imStore.getState().openServiceTicket(accountId.value, id)
  router.push('/message/chat/' + sid)
}
function newTicket() { toast('发起服务咨询暂未开放') }
</script>
