<template>
  <div class="im-page">
    <ImNavBar :title="group?.name || '群资料'" />
    <div class="im-filters" style="gap: 14px; overflow-x: auto">
      <button v-for="t in TABS" :key="t.key" type="button" class="im-filter" :class="{ active: tab === t.key }" style="white-space: nowrap" @click="switchTab(t.key)">{{ t.label }}</button>
    </div>
    <div class="im-scroll">
      <!-- 群资料 -->
      <template v-if="tab === 'info'">
        <div class="im-card" style="display: flex; align-items: center; gap: 12px; padding: 16px">
          <ImAvatar :name="group?.name || '群'" icon="群" :size="56" />
          <div class="im-flex-1">
            <div style="font-size: var(--t7-size)">{{ group?.name }}</div>
            <div class="im-small im-muted">{{ group?.members?.length || 0 }} 位成员 · {{ group?.type }} · 我的角色：{{ roleLabel }}</div>
          </div>
        </div>
        <div class="im-card">
          <ImField label="群名称" :filled="!!groupName.trim()" :disabled="!canManage" :error="nameError">
            <div class="im-flex"><input v-model="groupName" class="im-input im-flex-1" :disabled="!canManage"><button type="button" class="im-btn im-btn--primary" :disabled="!canManage || busy" @click="saveName">{{ busy ? '处理中…' : '保存' }}</button></div>
          </ImField>
          <button type="button" class="im-row" @click="switchTab('notice')"><span class="im-row__main"><span class="im-row__title">群公告</span><span class="im-row__desc">{{ group?.notice || '暂无公告' }}</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span></button>
          <button type="button" class="im-row" @click="switchTab('members')"><span class="im-row__main"><span class="im-row__title">群成员</span></span><span class="im-row__value">{{ group?.members?.length || 0 }}</span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span></button>
          <button type="button" class="im-row" @click="switchTab('files')"><span class="im-row__main"><span class="im-row__title">群文件</span></span><span class="im-row__value">{{ group?.files?.length || 0 }}</span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span></button>
          <button type="button" class="im-row" @click="openChat"><span class="im-row__main"><span class="im-row__title">进入群聊</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span></button>
        </div>
        <div class="im-card">
          <button type="button" class="im-row" :disabled="!isOwner" @click="toggleMuteAll">
            <span class="im-row__main"><span class="im-row__title">全员禁言</span></span><span class="im-row__value">{{ group?.muteAll ? '已开启' : '未开启' }}</span>
          </button>
        </div>
        <div class="im-card">
          <button type="button" class="im-row" @click="leave"><span class="im-row__main"><span class="im-row__title im-btn--danger">退出群聊</span></span></button>
          <button v-if="isOwner" type="button" class="im-row" @click="dissolve"><span class="im-row__main"><span class="im-row__title im-btn--danger">解散群聊</span></span></button>
        </div>
      </template>

      <!-- 群成员 -->
      <template v-else-if="tab === 'members'">
        <div class="im-pad"><button type="button" class="im-btn im-btn--primary im-btn--block" @click="pickerMode = 'members'"><ImIcon name="plus" :size="18" /> 添加成员</button></div>
        <button v-for="id in (group?.members || [])" :key="id" type="button" class="im-row" @click="memberSheet = id">
          <ImAvatar :name="displayName(state, id)" :size="38" />
          <span class="im-row__main"><span class="im-row__title">{{ displayName(state, id) }} <span v-if="id === group?.owner" class="im-tag">群主</span><span v-else-if="group?.admins?.includes(id)" class="im-tag">管理员</span></span><span class="im-row__desc">{{ group?.muted?.includes(id) ? '已禁言' : '成员' }}</span></span>
          <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
      </template>

      <!-- 群公告 -->
      <template v-else-if="tab === 'notice'">
        <div class="im-card im-pad">
          <textarea v-model="notice" class="im-textarea" rows="6" placeholder="输入群公告" :disabled="!canManage" />
          <ImButton variant="primary" block style="margin-top: 10px" :disabled="!canManage" :loading="busy" @click="saveNotice">发布公告</ImButton>
        </div>
      </template>

      <!-- 群文件 -->
      <template v-else-if="tab === 'files'">
        <div class="im-pad"><button type="button" class="im-btn im-btn--ghost im-btn--block" @click="uploadFile"><ImIcon name="plus" :size="18" /> 上传演示文件</button><div class="im-small im-muted" style="margin-top: 6px; text-align: center"><span class="im-soon">真实文件存储暂未开放</span> · 当前仅写入本机演示数据</div></div>
        <div v-for="f in (group?.files || [])" :key="f.id" class="im-row">
          <ImIcon name="file" :size="24" />
          <span class="im-row__main"><span class="im-row__title">{{ f.name }}</span><span class="im-row__desc">{{ f.size }} · {{ displayName(state, f.from) }} · {{ f.time }}</span></span>
          <button type="button" class="im-nav__btn" aria-label="删除文件" @click="imStore.getState().removeGroupFile(groupId, f.id); toast('已删除')"><ImIcon name="close" :size="16" /></button>
        </div>
        <ImEmpty v-if="!group?.files?.length" title="暂无群文件" action-text="上传演示文件" @action="uploadFile" />
      </template>

      <!-- 加群设置 -->
      <template v-else-if="tab === 'settings'">
        <div class="im-card">
          <div class="im-section-title">加群方式</div>
          <button v-for="opt in JOIN_OPTIONS" :key="opt.key" type="button" class="im-row" @click="setJoin(opt.key)">
            <span class="im-row__main"><span class="im-row__title">{{ opt.label }}</span></span>
            <span class="im-checkbox" :class="{ checked: joinSetting === opt.key }"><ImIcon v-if="joinSetting === opt.key" name="check" :size="12" /></span>
          </button>
        </div>
        <div class="im-card">
          <button type="button" class="im-row" @click="setSearchable"><span class="im-row__main"><span class="im-row__title">允许被搜索</span></span><span class="im-row__value">{{ group?.searchable ? '是' : '否' }}</span></button>
          <ImField label="成员上限" :filled="!!memberCap">
            <div class="im-flex"><input v-model="memberCap" class="im-input im-flex-1" type="number" min="2"><button type="button" class="im-btn im-btn--primary" @click="saveCap">保存</button></div>
          </ImField>
        </div>
        <div class="im-card">
          <div class="im-section-title">黑名单（{{ group?.blacklist?.length || 0 }}）</div>
          <div v-for="id in (group?.blacklist || [])" :key="id" class="im-row"><span class="im-row__main"><span class="im-row__title">{{ displayName(state, id) }}</span></span></div>
          <ImEmpty v-if="!group?.blacklist?.length" title="暂无黑名单成员" desc="移出成员时可加入黑名单" />
        </div>
      </template>

      <!-- 加群审批 -->
      <template v-else>
        <div v-for="r in pendingRequests" :key="r.id" class="im-card im-pad">
          <div class="im-flex"><ImAvatar :name="displayName(state, r.userId)" :size="36" /><span class="im-flex-1">{{ displayName(state, r.userId) }} 申请加入</span><span class="im-small im-muted">{{ r.time }}</span></div>
          <div class="im-small im-muted" style="margin: 8px 0">理由：{{ r.reason }}</div>
          <div class="im-flex">
            <button type="button" class="im-btn im-btn--primary im-flex-1" @click="approve(r.id, true)">同意</button>
            <button type="button" class="im-btn im-btn--ghost im-flex-1" @click="approve(r.id, false)">拒绝</button>
          </div>
        </div>
        <ImEmpty v-if="!pendingRequests.length" title="暂无待审批申请" />
      </template>
      <div class="im-tabbar-space" />
    </div>

    <ImSheet :open="!!memberSheet" title="成员操作" @close="memberSheet = ''">
      <button v-for="act in MEMBER_ACTS" :key="act.key" type="button" class="im-sheet__action" :class="{ danger: act.danger }" @click="doMemberAct(act.key)">{{ act.label }}</button>
      <button type="button" class="im-sheet__action im-muted" @click="memberSheet = ''">取消</button>
    </ImSheet>

    <ImPicker :open="!!pickerMode" :mode="pickerMode" :state="state" :group-id="groupId" @close="pickerMode = ''" @confirm="onAddMembers" />
  </div>
</template>

<script setup>
import ImButton from '../../components/im/ImButton.vue'
import ImField from '../../components/im/ImField.vue'
import ImIcon from '../../components/im/ImIcon.vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImAvatar from '../../components/im/ImAvatar.vue'
import ImSheet from '../../components/im/ImSheet.vue'
import ImPicker from '../../components/im/ImPicker.vue'
import ImEmpty from '../../components/im/ImEmpty.vue'
import { useImState, imStore } from '../../im/store'
import { displayName, getGroup, groupRole } from '../../im/selectors'
import { confirmBox, toast } from '../../im/ui'
import { useImTask } from '../../im/task'

const route = useRoute()
const router = useRouter()
const state = useImState()
const groupId = computed(() => String(route.params.groupId || ''))
const group = computed(() => getGroup(state.value, groupId.value))
const tab = computed(() => String(route.query.tab || 'info'))
const TABS = [
  { key: 'info', label: '资料' }, { key: 'members', label: '成员' }, { key: 'notice', label: '公告' },
  { key: 'files', label: '文件' }, { key: 'settings', label: '设置' }, { key: 'requests', label: '审批' }
]
const JOIN_OPTIONS = [
  { key: 'all', label: '所有人可加入' }, { key: 'approve', label: '需群主审批' },
  { key: 'admin-only', label: '仅管理员邀请' }, { key: 'member-invite', label: '成员邀请确认' }
]
const MEMBER_ACTS = [
  { key: 'admin', label: '设为/取消管理员' }, { key: 'mute', label: '禁言/解除禁言' },
  { key: 'transfer', label: '转让群主' }, { key: 'remove', label: '移出群聊', danger: true }
]
const role = computed(() => groupRole(state.value, groupId.value))
const isOwner = computed(() => role.value === 'owner')
const canManage = computed(() => role.value === 'owner' || role.value === 'admin')
const roleLabel = computed(() => ({ owner: '群主', admin: '管理员', member: '成员', none: '非成员' })[role.value])
const joinSetting = computed(() => group.value?.joinSetting || group.value?.joinMode || 'approve')
const pendingRequests = computed(() => state.value.joinRequests.filter((r) => r.groupId === groupId.value && r.status === 'pending'))

const groupName = ref('')
const notice = ref('')
const memberCap = ref(200)
const memberSheet = ref('')
const pickerMode = ref('')
watch(group, (g) => {
  groupName.value = g?.name || ''
  notice.value = g?.notice || ''
  memberCap.value = g?.memberCap || 200
}, { immediate: true })

function switchTab(key) { router.replace({ query: { tab: key } }) }
function openChat() {
  const s = state.value.sessions.find((x) => x.type === 'group' && x.targetId === groupId.value)
  if (s) router.push('/message/chat/' + s.id)
  else toast('该群暂无会话')
}
const { busy, error, run } = useImTask()
const nameError = computed(() => (error.value.includes('群名称') ? error.value : ''))

async function saveName() {
  await run('保存群名称', () => {
    const next = groupName.value.trim()
    if (!next) throw new Error('群名称不能为空')
    imStore.getState().updateGroup(groupId.value, { name: next })
  }, '群名称已更新，会话标题同步生效')
}
async function saveNotice() {
  await run('发布公告', () => imStore.getState().updateGroup(groupId.value, { notice: notice.value.trim() }), '公告已发布')
}
function toggleMuteAll() { imStore.getState().toggleMuteAll(groupId.value); toast('已更新全员禁言') }
function setJoin(key) { imStore.getState().setGroupJoinSetting(groupId.value, { joinSetting: key }); toast('加群方式已保存') }
function setSearchable() { imStore.getState().setGroupJoinSetting(groupId.value, { searchable: !group.value?.searchable }); toast('已更新') }
function saveCap() { imStore.getState().setGroupJoinSetting(groupId.value, { memberCap: Number(memberCap.value) || 200 }); toast('成员上限已保存') }
async function uploadFile() {
  await run('上传文件', () => imStore.getState().addGroupFile(groupId.value, {
    name: `演示文件_${Date.now().toString().slice(-4)}.pdf`, size: '1.1 MB', from: 'me', time: '刚刚'
  }), '已写入本机演示数据（真实存储暂未开放）')
}
function approve(id, yes) {
  const s = imStore.getState()
  if (yes) s.approveJoinRequest(id); else s.rejectJoinRequest(id)
  toast(yes ? '已同意申请' : '已拒绝申请')
}
function doMemberAct(key) {
  const id = memberSheet.value
  memberSheet.value = ''
  if (!id) return
  const s = imStore.getState()
  if (key === 'admin') { s.setGroupAdmin(groupId.value, id, !group.value?.admins?.includes(id)); toast('管理员权限已更新') }
  else if (key === 'mute') { s.muteGroupMember(groupId.value, id, !group.value?.muted?.includes(id)); toast('禁言状态已更新') }
  else if (key === 'transfer') { if (!isOwner.value) { toast('仅群主可转让'); return } s.transferOwner(groupId.value, id); toast('群主已转让') }
  else if (key === 'remove') { s.removeGroupMember(groupId.value, id); toast('成员已移出') }
}
function onAddMembers(payload) {
  imStore.getState().addGroupMembers(groupId.value, payload.ids)
  toast(`已添加 ${payload.ids.length} 位成员`)
}
async function leave() {
  if (!await confirmBox('退出群聊', '退出后将从成员列表移除。', '退出')) return
  imStore.getState().leaveGroup(groupId.value)
  toast('已退出群聊')
  router.push('/message')
}
async function dissolve() {
  if (!await confirmBox('解散群聊', '解散后群会话与成员数据将移除，操作不可撤销。', '解散')) return
  imStore.getState().dissolveGroup(groupId.value)
  toast('群聊已解散')
  router.push('/message')
}
</script>
