<template>
  <div class="detail-page">
    <ImNavBar title="联系人详情" back back-to="/contacts" />

    <div class="detail-scroll">
      <template v-if="contact">
        <!-- 头部：头像/姓名/状态/职位 -->
        <div class="detail-head">
          <ImAvatar :name="contact.name" :size="58" />
          <div class="detail-head__main">
            <div class="detail-head__name">
              {{ contact.name }}
              <span class="detail-head__status" :class="'detail-head__status--' + (contact.status || 'offline')">{{ statusLabel }}</span>
            </div>
            <div class="detail-head__sub">{{ contact.job || '员工' }} · {{ contact.dept || '-' }}</div>
            <div class="detail-head__sig">{{ contact.signature || '专注高效协同' }}</div>
          </div>
          <button type="button" class="detail-star" :aria-label="contact.starred ? '取消星标' : '设为星标'" @click="toggleStar">
            <ImIcon :name="contact.starred ? 'star' : 'star-outline'" :size="20" />
          </button>
        </div>

        <!-- 资料字段 -->
        <div class="detail-card">
          <div class="detail-row"><span class="detail-row__label">账号</span><span class="detail-row__value">{{ contact.account || '-' }}</span></div>
          <div class="detail-row"><span class="detail-row__label">手机</span><span class="detail-row__value">{{ contact.phone || '-' }}</span></div>
          <div class="detail-row"><span class="detail-row__label">座机</span><span class="detail-row__value">{{ contact.landline || '-' }}</span></div>
          <div class="detail-row"><span class="detail-row__label">邮箱</span><span class="detail-row__value">{{ contact.email || '-' }}</span></div>
          <div class="detail-row"><span class="detail-row__label">部门</span><span class="detail-row__value">{{ contact.deptPath || contact.dept || '-' }}</span></div>
        </div>

        <!-- 备注 + 特别提醒 -->
        <div class="detail-card">
          <ImField label="备注" :filled="!!note.trim()">
            <input v-model="note" class="detail-input" placeholder="添加备注" @blur="saveNote">
          </ImField>
          <div class="detail-row">
            <span class="detail-row__label">特别提醒</span>
            <button
              type="button"
              role="switch"
              class="detail-switch"
              :class="{ 'detail-switch--on': reminderOn }"
              :aria-checked="reminderOn"
              aria-label="特别提醒"
              @click="toggleReminder"
            >
              <span class="detail-switch__knob" />
            </button>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="detail-actions">
          <button type="button" class="detail-btn" @click="sendMessage"><ImIcon name="chat" :size="18" /> 发消息</button>
          <button type="button" class="detail-btn" @click="createGroup"><ImIcon name="group" :size="18" /> 发起群聊</button>
          <button type="button" class="detail-btn" @click="toast('视频会议暂未开放')"><ImIcon name="video" :size="18" /> 视频会议</button>
        </div>
        <div class="detail-note">视频会议能力暂未接入，仅保留入口</div>
      </template>

      <ImEmpty v-else title="未找到该联系人" />
      <div class="detail-bottom-space" />
    </div>
  </div>
</template>

<script setup>
/**
 * 联系人详情二级页（2026-11-17）：
 * 资料（账号/手机/座机/邮箱/部门路径）+ 备注（失焦保存）+ 特别提醒（持久化开关）
 * + 发消息（复用单聊，不重复建）+ 发起群聊（预选当前联系人）+ 视频会议（暂未开放提示）。
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImIcon from '../../components/im/ImIcon.vue'
import ImAvatar from '../../components/im/ImAvatar.vue'
import ImEmpty from '../../components/im/ImEmpty.vue'
import ImField from '../../components/im/ImField.vue'
import { useImState, imStore } from '../../im/store'
import { toast } from '../../im/ui'

const route = useRoute()
const router = useRouter()
const state = useImState()

const contactId = computed(() => String(route.params.contactId || ''))
const contact = computed(() => state.value.contacts.find((c) => c.id === contactId.value))

const STATUS_LABELS = { online: '在线', offline: '离线', away: '离开', busy: '忙碌' }
const statusLabel = computed(() => STATUS_LABELS[contact.value?.status] || '离线')

const note = ref('')
watch(contact, (c) => { note.value = c?.note || '' }, { immediate: true })
const reminderOn = computed(() => !!contact.value?.reminderEnabled)

function sendMessage() {
  const sid = imStore.getState().createSingleSession(contactId.value)
  router.push('/message/chat/' + sid)
}
function createGroup() {
  router.push('/message/group/create?member=' + contactId.value)
}
function toggleStar() {
  imStore.getState().toggleContactStar(contactId.value)
  toast('已更新星标')
}
function saveNote() {
  imStore.getState().setContactNote(contactId.value, note.value)
  toast('备注已保存')
}
function toggleReminder() {
  imStore.getState().toggleContactReminder(contactId.value)
}
</script>

<style scoped>
.detail-page {
  min-height: 100dvh;
  background: var(--n1, #f5f6f7);
}
.detail-scroll {
  padding: 0 0 32px;
}

/* 头部 */
.detail-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 16px;
  background: var(--color-card-bg, #fff);
}
.detail-head__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.detail-head__name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--t8-size, 20px);
  font-weight: 600;
  color: var(--n9, #222);
}
.detail-head__status {
  padding: 1px 8px;
  border-radius: 10px;
  font-size: var(--t2-size, 11px);
  font-weight: 400;
  background: var(--n2, #f2f3f5);
  color: var(--n7, #6b7280);
}
.detail-head__status--online { color: #34c77b; }
.detail-head__status--busy { color: #ff6b35; }
.detail-head__status--away { color: #f7b500; }
.detail-head__sub,
.detail-head__sig {
  font-size: var(--t3-size, 12px);
  color: var(--n6, #8a9099);
}
.detail-star {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  color: #f7b500;
}

/* 卡片 */
.detail-card {
  margin: 10px 12px 0;
  padding: 4px 16px;
  background: var(--color-card-bg, #fff);
  border-radius: 12px;
}
.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 48px;
  padding: 6px 0;
}
.detail-row__label {
  flex: none;
  font-size: var(--t4-size, 14px);
  color: var(--n7, #6b7280);
}
.detail-row__value {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: var(--t4-size, 14px);
  color: var(--n9, #222);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  text-align: right;
  font-size: var(--t4-size, 14px);
  color: var(--n9, #222);
}

/* 特别提醒开关 */
.detail-switch {
  position: relative;
  flex: none;
  width: 44px;
  height: 26px;
  border: none;
  border-radius: 13px;
  background: var(--n4, #d5d9e0);
  transition: background 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.detail-switch--on {
  background: var(--color-brand-primary, #f53a71);
}
.detail-switch__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}
.detail-switch--on .detail-switch__knob {
  transform: translateX(18px);
}

/* 操作区 */
.detail-actions {
  display: flex;
  gap: 10px;
  padding: 18px 12px 6px;
}
.detail-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  border: 1px solid var(--color-brand-primary, #f53a71);
  border-radius: 22px;
  background: var(--color-card-bg, #fff);
  color: var(--color-brand-primary, #f53a71);
  font-size: var(--t4-size, 14px);
  -webkit-tap-highlight-color: transparent;
}
.detail-btn:active {
  opacity: 0.7;
}
.detail-note {
  padding: 4px 0 12px;
  text-align: center;
  font-size: var(--t2-size, 11px);
  color: var(--n5, #c4c9d0);
}
</style>
