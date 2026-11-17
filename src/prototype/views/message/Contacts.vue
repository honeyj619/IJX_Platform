<template>
  <div class="im-page">
    <ImNavBar title="通讯录" />
    <div class="im-searchbar">
      <ImIcon name="search" :size="18" /><input v-model="q" placeholder="搜索姓名、部门、账号"><button v-if="q" type="button" class="im-searchbar__clear" aria-label="清除" @click="q = ''"><ImIcon name="close" :size="16" /></button>
    </div>
    <div class="im-scroll">
      <!-- 员工服务 / 消息应用仍属消息域；联系人列表与详情已迁移到一级通讯录 /contacts（2026-11-17） -->
      <template v-if="scope === 'service'">
        <div class="im-section-title">员工服务号</div>
        <button v-for="a in state.serviceAccounts" :key="a.id" type="button" class="im-row" @click="router.push('/message/service/' + a.id)">
          <ImAvatar :name="a.name" :icon="a.icon" :size="40" />
          <span class="im-row__main"><span class="im-row__title">{{ a.name }}</span><span class="im-row__desc">{{ a.desc }}</span></span>
          <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
        <ImEmpty v-if="!state.serviceAccounts.length" title="暂无服务号" />
      </template>

      <template v-else>
        <div class="im-section-title">消息应用</div>
        <button v-for="a in state.imApps" :key="a.id" type="button" class="im-row" @click="openApp(a.id)">
          <ImAvatar :name="a.name" :icon="a.icon" :size="40" />
          <span class="im-row__main"><span class="im-row__title">{{ a.name }}</span><span class="im-row__desc">{{ a.desc }}</span></span>
          <span class="im-chevron"><ImIcon name="chevron" :size="16" /></span>
        </button>
        <ImEmpty v-if="!state.imApps.length" title="暂无应用" />
      </template>
      <div class="im-tabbar-space" />
    </div>
  </div>
</template>

<script setup>
/**
 * 消息域通讯录兼容页（2026-11-17 收敛）：
 * 联系人列表/详情/我的群聊已迁移至一级通讯录 /contacts；
 * 本页仅保留员工服务（scope=service）与消息应用（scope=apps）两个消息域子视图。
 */
import ImIcon from '../../components/im/ImIcon.vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImAvatar from '../../components/im/ImAvatar.vue'
import ImEmpty from '../../components/im/ImEmpty.vue'
import { useImState } from '../../im/store'
import { appSessionId } from '../../im/selectors'
import { toast } from '../../im/ui'

const route = useRoute()
const router = useRouter()
const state = useImState()
const q = ref('')
const scope = computed(() => String(route.query.scope || 'apps'))

function openApp(id) {
  const sid = appSessionId(id)
  if (state.value.sessions.some((s) => s.id === sid)) router.push('/message/chat/' + sid)
  else toast('未找到该应用会话')
}
</script>
