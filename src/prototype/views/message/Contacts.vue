<template>
  <div class="im-page">
    <!-- 通讯录 / 分类列表 -->
    <template v-if="isList">
      <ImNavBar title="通讯录" />
      <div class="im-searchbar">
        <ImIcon name="search" :size="18" /><input v-model="q" placeholder="搜索姓名、部门、账号"><button v-if="q" type="button" class="im-searchbar__clear" aria-label="清除" @click="q = ''"><ImIcon name="close" :size="16" /></button>
      </div>
      <div class="im-scroll">
        <template v-if="!scope">
          <div class="im-card">
            <button type="button" class="im-row" @click="router.push('/message/contacts?scope=groups')"><ImIcon name="group" :size="20" /><span class="im-row__main"><span class="im-row__title">我的群聊</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span></button>
            <button type="button" class="im-row" @click="router.push('/message/group/create')"><ImIcon name="plus" :size="20" /><span class="im-row__main"><span class="im-row__title">创建群聊</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span></button>
            <button type="button" class="im-row" @click="router.push('/message/contacts?scope=service')"><ImIcon name="service" :size="20" /><span class="im-row__main"><span class="im-row__title">员工服务</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span></button>
            <button type="button" class="im-row" @click="router.push('/message/contacts?scope=apps')"><ImIcon name="apps" :size="20" /><span class="im-row__main"><span class="im-row__title">消息应用</span></span><span class="im-chevron"><ImIcon name="chevron" :size="16" /></span></button>
          </div>
          <div class="im-section-title">联系人（{{ filteredContacts.length }}）</div>
          <button v-for="c in filteredContacts" :key="c.id" type="button" class="im-row" @click="router.push('/message/contact/' + c.id)">
            <ImAvatar :name="c.name" :size="40" />
            <span class="im-row__main"><span class="im-row__title">{{ c.name }} <ImIcon v-if="c.starred" name="star" :size="12" class="im-tag" /></span><span class="im-row__desc">{{ c.dept || '' }} {{ c.job || '' }}</span></span>
            <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
          </button>
        </template>

        <template v-else-if="scope === 'groups'">
          <div class="im-section-title">我的群聊</div>
          <button v-for="g in groups" :key="g.id" type="button" class="im-row" @click="router.push('/message/group/' + g.id)">
            <ImAvatar :name="g.name" icon="群" :size="40" />
            <span class="im-row__main"><span class="im-row__title">{{ g.name }}</span><span class="im-row__desc">{{ g.members.length }} 位成员 · {{ g.type }}</span></span>
            <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
          </button>
        </template>

        <template v-else-if="scope === 'service'">
          <div class="im-section-title">员工服务号</div>
          <button v-for="a in state.serviceAccounts" :key="a.id" type="button" class="im-row" @click="router.push('/message/service/' + a.id)">
            <ImAvatar :name="a.name" :icon="a.icon" :size="40" />
            <span class="im-row__main"><span class="im-row__title">{{ a.name }}</span><span class="im-row__desc">{{ a.desc }}</span></span>
            <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
          </button>
        </template>

        <template v-else>
          <div class="im-section-title">消息应用</div>
          <button v-for="a in state.imApps" :key="a.id" type="button" class="im-row" @click="openApp(a.id)">
            <ImAvatar :name="a.name" :icon="a.icon" :size="40" />
            <span class="im-row__main"><span class="im-row__title">{{ a.name }}</span><span class="im-row__desc">{{ a.desc }}</span></span>
            <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
          </button>
        </template>
        <ImEmpty v-if="!hasItems" title="暂无匹配内容" />
        <div class="im-tabbar-space" />
      </div>
    </template>

    <!-- 联系人详情 -->
    <template v-else>
      <ImNavBar title="联系人详情" />
      <div class="im-scroll">
        <div class="im-card" style="display: flex; align-items: center; gap: 14px; padding: 18px">
          <ImAvatar :name="contact?.name || ''" :size="58" />
          <div class="im-flex-1">
            <div style="font-size: var(--t8-size)">{{ contact?.name }}</div>
            <div class="im-small im-muted">{{ contact?.job || '员工' }} · {{ contact?.dept || '' }}</div>
            <div class="im-small im-muted">{{ contact?.signature || '专注高效协同' }}</div>
          </div>
          <button type="button" class="im-nav__btn" @click="toggleStar"><ImIcon :name="contact?.starred ? 'star' : 'star-outline'" :size="20" /></button>
        </div>
        <div class="im-card">
          <div class="im-row"><span class="im-row__main"><span class="im-row__title">部门</span></span><span class="im-row__value">{{ contact?.deptPath || contact?.dept || '-' }}</span></div>
          <div class="im-row"><span class="im-row__main"><span class="im-row__title">手机</span></span><span class="im-row__value">{{ contact?.phone || '-' }}</span></div>
          <div class="im-row"><span class="im-row__main"><span class="im-row__title">邮箱</span></span><span class="im-row__value">{{ contact?.email || '-' }}</span></div>
          <div class="im-row"><span class="im-row__main"><span class="im-row__title">账号</span></span><span class="im-row__value">{{ contact?.account || '-' }}</span></div>
        </div>
        <div class="im-card">
          <ImField label="备注" :filled="!!note.trim()">
            <input v-model="note" class="im-input" placeholder="添加备注" @blur="saveNote">
          </ImField>
        </div>
        <div class="im-pad im-flex">
          <button type="button" class="im-btn im-btn--ghost im-flex-1" @click="toast('语音通话暂未开放')"><ImIcon name="phone" :size="18" /> 语音</button>
          <button type="button" class="im-btn im-btn--ghost im-flex-1" @click="toast('视频通话暂未开放')"><ImIcon name="video" :size="18" /> 视频</button>
        </div>
        <div class="im-pad im-small im-muted" style="text-align: center"><span class="im-soon">暂未开放</span> 真实通话能力尚未接入媒体流</div>
        <div class="im-pad"><ImButton variant="primary" block @click="sendMessage">发消息</ImButton></div>
        <div class="im-tabbar-space" />
      </div>
    </template>
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
import ImEmpty from '../../components/im/ImEmpty.vue'
import { useImState, imStore } from '../../im/store'
import { appSessionId, myGroups } from '../../im/selectors'
import { toast } from '../../im/ui'

const route = useRoute()
const router = useRouter()
const state = useImState()
const isList = computed(() => route.name === 'MessageContacts')
const scope = computed(() => String(route.query.scope || ''))
const q = ref('')
const note = ref('')

const groups = computed(() => myGroups(state.value))
const filteredContacts = computed(() => {
  const kw = q.value.trim().toLowerCase()
  const list = state.value.contacts.filter((c) => c.id !== 'me' && !c.isFileHelper)
  if (!kw) return list
  return list.filter((c) => [c.name, c.job, c.dept, c.account, c.phone, c.note].some((v) => v && v.toLowerCase().includes(kw)))
})
const hasItems = computed(() => scope.value === 'groups' ? groups.value.length
  : scope.value === 'service' ? state.value.serviceAccounts.length
    : scope.value === 'apps' ? state.value.imApps.length : filteredContacts.value.length)

const contactId = computed(() => String(route.params.contactId || ''))
const contact = computed(() => state.value.contacts.find((c) => c.id === contactId.value))
watch(contact, (c) => { note.value = c?.note || '' }, { immediate: true })

function sendMessage() {
  const sid = imStore.getState().createSingleSession(contactId.value)
  router.push('/message/chat/' + sid)
}
function toggleStar() { imStore.getState().toggleContactStar(contactId.value); toast('已更新星标') }
function saveNote() { imStore.getState().setContactNote(contactId.value, note.value); toast('备注已保存') }
function openApp(id) {
  const sid = appSessionId(id)
  if (state.value.sessions.some((s) => s.id === sid)) router.push('/message/chat/' + sid)
  else toast('未找到该应用会话')
}
</script>
