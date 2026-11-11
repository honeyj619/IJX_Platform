<template>
  <div class="im-page">
    <ImNavBar title="创建群聊">
      <template #right><button type="button" class="im-nav__text" :disabled="!canCreate || busy" :aria-busy="busy ? 'true' : null" @click="create">{{ busy ? '处理中…' : '完成' }}</button></template>
    </ImNavBar>
    <div class="im-searchbar">
      <ImIcon name="search" :size="18" /><input v-model="q" placeholder="搜索成员"><button v-if="q" type="button" class="im-searchbar__clear" aria-label="清除" @click="q = ''"><ImIcon name="close" :size="16" /></button>
    </div>
    <ImField label="群名称" :filled="!!name.trim()" class="im-card">
      <input v-model="name" class="im-input" placeholder="群聊名称（选填）">
    </ImField>
    <div v-if="picked.length" class="im-flex" style="padding: 0 var(--gutter) 8px; flex-wrap: wrap; gap: 6px">
      <button v-for="id in picked" :key="id" type="button" class="im-chip active" @click="toggle(id)">{{ displayName(state, id) }} <ImIcon name="close" :size="12" /></button>
    </div>
    <div class="im-scroll">
      <div class="im-section-title">选择成员（已选 {{ picked.length }}）</div>
      <button v-for="c in list" :key="c.id" type="button" class="im-row" @click="toggle(c.id)">
        <ImAvatar :name="c.name" :size="38" />
        <span class="im-row__main"><span class="im-row__title">{{ c.name }}</span><span class="im-row__desc">{{ c.dept || c.job || '' }}</span></span>
        <span class="im-checkbox" :class="{ checked: picked.includes(c.id) }"><ImIcon v-if="picked.includes(c.id)" name="check" :size="12" /></span>
      </button>
      <ImEmpty v-if="!list.length" title="没有匹配的成员" action-text="清空搜索" @action="q = ''" />
      <div class="im-tabbar-space" />
    </div>
  </div>
</template>

<script setup>
import ImField from '../../components/im/ImField.vue'
import ImIcon from '../../components/im/ImIcon.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImAvatar from '../../components/im/ImAvatar.vue'
import ImEmpty from '../../components/im/ImEmpty.vue'
import { useImState, imStore } from '../../im/store'
import { displayName } from '../../im/selectors'
import { toast } from '../../im/ui'
import { useImTask } from '../../im/task'

const router = useRouter()
const state = useImState()
const q = ref('')
const name = ref('')
const picked = ref([])
const list = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return state.value.contacts.filter((c) => c.id !== 'me' && !c.isFileHelper && (!kw || c.name.toLowerCase().includes(kw) || (c.dept || '').toLowerCase().includes(kw)))
})
const canCreate = computed(() => picked.value.length > 0)
function toggle(id) {
  picked.value = picked.value.includes(id) ? picked.value.filter((x) => x !== id) : [...picked.value, id]
}
const { busy, run } = useImTask()

async function create() {
  if (!canCreate.value) { toast('请至少选择一位成员'); return }
  const result = await run('创建群聊', () => imStore.getState().createGroup(name.value.trim(), [...picked.value]), '群聊已创建')
  if (!result) return
  router.push('/message/chat/' + result.sessionId)
}
</script>
