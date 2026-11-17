<template>
  <div class="contacts-page">
    <ImNavBar title="通讯录" :back="false" />

    <!-- 搜索 -->
    <div class="contacts-search">
      <div class="contacts-search__box">
        <ImIcon name="search" :size="18" class="contacts-search__icon" />
        <input
          v-model="keyword"
          class="contacts-search__input"
          type="search"
          placeholder="搜索姓名、手机号、账号"
          aria-label="搜索联系人"
        >
        <button v-if="keyword" type="button" class="contacts-search__clear" aria-label="清空搜索" @click="keyword = ''">
          <ImIcon name="close" :size="16" />
        </button>
      </div>
    </div>

    <div class="contacts-scroll">
      <!-- 搜索结果模式：直接展示人员列表 -->
      <template v-if="isSearching">
        <div class="contacts-section">搜索结果（{{ searchHits.length }}）</div>
        <ContactRow v-for="c in searchHits" :key="c.id" :contact="c" :keyword="keyword" @select="openContact" />
        <ImEmpty v-if="!searchHits.length" title="未找到相关联系人" />
      </template>

      <!-- 浏览模式：组织架构 / 我的群组 -->
      <template v-else>
        <div class="contacts-tabs" role="tablist" aria-label="通讯录分类">
          <button
            v-for="t in tabs"
            :key="t.key"
            type="button"
            role="tab"
            class="contacts-tabs__item"
            :class="{ 'contacts-tabs__item--active': tab === t.key }"
            :aria-selected="tab === t.key"
            @click="tab = t.key"
          >{{ t.label }}</button>
        </div>

        <!-- 组织架构 -->
        <template v-if="tab === 'org'">
          <OrganizationTree
            :nodes="[ORGANIZATION_ROOT]"
            :expanded="expanded"
            :contacts="state.contacts"
            @toggle="toggleNode"
            @open-dept="openDept"
            @open-contact="openContact"
          />
        </template>

        <!-- 我的群组：我的群聊 + 更多协作（员工服务 / 消息应用，保留在消息域） -->
        <template v-else>
          <div class="contacts-section">我的群聊</div>
          <button v-for="g in groups" :key="g.id" type="button" class="contacts-group-row" @click="router.push('/message/group/' + g.id)">
            <ImAvatar :name="g.name" icon="群" :size="40" />
            <span class="contacts-group-row__main">
              <span class="contacts-group-row__title">{{ g.name }}</span>
              <span class="contacts-group-row__desc">{{ g.members.length }} 位成员 · {{ g.type }}</span>
            </span>
            <ImIcon name="chevron" :size="16" class="contacts-group-row__chevron" />
          </button>
          <ImEmpty v-if="!groups.length" title="暂无群聊" />

          <div class="contacts-section">更多协作</div>
          <button type="button" class="contacts-group-row" @click="router.push('/message/contacts?scope=service')">
            <ImAvatar name="员工服务" icon="服" :size="40" />
            <span class="contacts-group-row__main">
              <span class="contacts-group-row__title">员工服务</span>
              <span class="contacts-group-row__desc">服务号咨询与工单</span>
            </span>
            <ImIcon name="chevron" :size="16" class="contacts-group-row__chevron" />
          </button>
          <button type="button" class="contacts-group-row" @click="router.push('/message/contacts?scope=apps')">
            <ImAvatar name="消息应用" icon="应" :size="40" />
            <span class="contacts-group-row__main">
              <span class="contacts-group-row__title">消息应用</span>
              <span class="contacts-group-row__desc">应用消息与通知</span>
            </span>
            <ImIcon name="chevron" :size="16" class="contacts-group-row__chevron" />
          </button>
        </template>
      </template>

      <div class="im-tabbar-space" />
    </div>
  </div>
</template>

<script setup>
/**
 * 通讯录一级页（2026-11-17）：
 * - 搜索：姓名/手机号/账号/部门/职位模糊匹配，trim 后生效，结果直出人员列表
 * - 组织架构：树形浏览，展开状态存 localStorage，进部门页/详情返回后保留
 * - 我的群组：群聊列表 + 员工服务/消息应用快捷入口（保留在消息域）
 * 数据源：imStore contacts/groups，与消息模块同源。
 */
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImNavBar from '../components/im/ImNavBar.vue'
import ImIcon from '../components/im/ImIcon.vue'
import ImAvatar from '../components/im/ImAvatar.vue'
import ImEmpty from '../components/im/ImEmpty.vue'
import ContactRow from '../components/contacts/ContactRow.vue'
import OrganizationTree from '../components/contacts/OrganizationTree.vue'
import { useImState } from '../im/store'
import { myGroups } from '../im/selectors'
import { ORGANIZATION_ROOT, flattenOrganization } from '../im/data/organization'

const EXPANDED_KEY = 'ijx-contacts-org-expanded-v1'

const router = useRouter()
const route = useRoute()
const state = useImState()
const keyword = ref('')
/** 初始标签支持 ?tab=groups（消息菜单「我的群聊」入口） */
const tab = ref(route.query.tab === 'groups' ? 'groups' : 'org')
const tabs = [
  { key: 'org', label: '组织架构' },
  { key: 'groups', label: '我的群组' },
]

// 组织展开状态：默认全部收起，持久化 localStorage
const expanded = ref(loadExpanded())
watch(expanded, saveExpanded, { deep: true })

function loadExpanded() {
  try {
    return JSON.parse(localStorage.getItem(EXPANDED_KEY)) || {}
  } catch {
    return {}
  }
}
function saveExpanded(v) {
  try {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(v))
  } catch { /* 隐私模式等场景静默降级 */ }
}

function toggleNode(id) {
  expanded.value = { ...expanded.value, [id]: !expanded.value[id] }
}

const groups = computed(() => myGroups(state.value))

/* 搜索：姓名/手机号/账号/部门/职位包含匹配（trim + 忽略大小写） */
const isSearching = computed(() => keyword.value.trim().length > 0)
const orgNodeNames = computed(() => {
  const map = {}
  for (const n of flattenOrganization(ORGANIZATION_ROOT)) map[n.id] = n.name
  return map
})
const searchHits = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return []
  return state.value.contacts.filter((c) => {
    if (c.isFileHelper) return false
    const deptName = c.departmentId ? orgNodeNames.value[c.departmentId] : ''
    return [c.name, c.phone, c.account, c.dept, deptName, c.job, c.email]
      .some((v) => v && v.toLowerCase().includes(kw))
  })
})

function openContact(id) {
  router.push('/contacts/' + id)
}
function openDept(id) {
  router.push('/contacts/dept/' + id)
}
</script>

<style scoped>
.contacts-page {
  min-height: 100dvh;
  background: var(--n1, #f5f6f7);
  padding-bottom: var(--tabbar-total, 84px);
}

/* 搜索栏 */
.contacts-search {
  background: var(--color-card-bg, #fff);
  padding: 8px 12px 10px;
}
.contacts-search__box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px;
  background: var(--n2, #f2f3f5);
  border-radius: 18px;
}
.contacts-search__icon {
  color: var(--n6, #8a9099);
  flex: none;
}
.contacts-search__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--t4-size, 14px);
  line-height: var(--t4-line, 20px);
  color: var(--n9, #222);
}
.contacts-search__input::placeholder {
  color: var(--n6, #8a9099);
}
.contacts-search__clear {
  flex: none;
  display: flex;
  align-items: center;
  border: none;
  background: none;
  color: var(--n5, #c4c9d0);
  padding: 2px;
}

/* 一级标签 */
.contacts-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px 4px;
}
.contacts-tabs__item {
  padding: 6px 16px;
  border: none;
  border-radius: 16px;
  background: var(--color-card-bg, #fff);
  color: var(--n7, #6b7280);
  font-size: var(--t4-size, 14px);
  -webkit-tap-highlight-color: transparent;
}
.contacts-tabs__item--active {
  background: var(--color-brand-primary, #f53a71);
  color: #fff;
  font-weight: 600;
}

.contacts-section {
  padding: 14px 16px 6px;
  font-size: var(--t3-size, 12px);
  color: var(--n6, #8a9099);
}

/* 群组行 */
.contacts-group-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: var(--color-card-bg, #fff);
  border: none;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.contacts-group-row:active {
  background: var(--n2, #f2f3f5);
}
.contacts-group-row__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.contacts-group-row__title {
  font-size: var(--t5-size, 15px);
  font-weight: 600;
  color: var(--n9, #222);
}
.contacts-group-row__desc {
  font-size: var(--t3-size, 12px);
  color: var(--n6, #8a9099);
}
.contacts-group-row__chevron {
  color: var(--n4, #d5d9e0);
}
</style>
