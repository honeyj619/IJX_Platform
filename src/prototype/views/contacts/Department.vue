<template>
  <div class="dept-page">
    <ImNavBar :title="node ? node.name : '部门'" back back-to="/contacts" />

    <div class="dept-scroll">
      <!-- 部门路径 + 成员数 -->
      <div v-if="node" class="dept-breadcrumb">
        <span v-for="(n, i) in pathNodes" :key="n.id">
          <span v-if="i > 0" class="dept-breadcrumb__sep">/</span>{{ n.name }}
        </span>
        <span class="dept-breadcrumb__count">共 {{ members.length }} 人</span>
      </div>

      <!-- 二次搜索 -->
      <div class="dept-search">
        <div class="dept-search__box">
          <ImIcon name="search" :size="16" class="dept-search__icon" />
          <input v-model="q" class="dept-search__input" type="search" placeholder="在本部门搜索" aria-label="部门内搜索">
          <button v-if="q" type="button" class="dept-search__clear" aria-label="清空" @click="q = ''"><ImIcon name="close" :size="14" /></button>
        </div>
      </div>

      <!-- 成员列表（复用 ContactRow） -->
      <template v-if="node">
        <ContactRow v-for="c in members" :key="c.id" :contact="c" :keyword="q" @select="openContact" />
        <ImEmpty v-if="!members.length" :title="q ? '本部门未找到相关成员' : '该部门暂无成员'" />
      </template>
      <ImEmpty v-else title="未找到该部门" />

      <div class="dept-bottom-space" />
    </div>
  </div>
</template>

<script setup>
/**
 * 部门成员二级页：路径面包屑 + 成员数 + 部门内二次搜索。
 * 返回回通讯录首页，首页组织展开状态由 localStorage 保留。
 */
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ImNavBar from '../../components/im/ImNavBar.vue'
import ImIcon from '../../components/im/ImIcon.vue'
import ImEmpty from '../../components/im/ImEmpty.vue'
import ContactRow from '../../components/contacts/ContactRow.vue'
import { useImState } from '../../im/store'
import { ORGANIZATION_ROOT, findOrganizationNode, organizationPath } from '../../im/data/organization'

const route = useRoute()
const router = useRouter()
const state = useImState()
const q = ref('')

const deptId = computed(() => String(route.params.departmentId || ''))
const node = computed(() => findOrganizationNode(ORGANIZATION_ROOT, deptId.value))
const pathNodes = computed(() => (node.value ? organizationPath(ORGANIZATION_ROOT, deptId.value) : []))

const members = computed(() => {
  if (!node.value) return []
  const kw = q.value.trim().toLowerCase()
  const list = node.value.memberIds
    .map((id) => state.value.contacts.find((c) => c.id === id))
    .filter(Boolean)
  if (!kw) return list
  return list.filter((c) => [c.name, c.phone, c.account, c.job, c.dept].some((v) => v && v.toLowerCase().includes(kw)))
})

function openContact(id) {
  router.push('/contacts/' + id)
}
</script>

<style scoped>
.dept-page {
  min-height: 100dvh;
  background: var(--n1, #f5f6f7);
}
.dept-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 12px 16px 4px;
  font-size: var(--t3-size, 12px);
  color: var(--n6, #8a9099);
}
.dept-breadcrumb__sep {
  margin: 0 2px;
  color: var(--n4, #d5d9e0);
}
.dept-breadcrumb__count {
  margin-left: auto;
  flex: none;
}
.dept-search {
  padding: 8px 16px 10px;
}
.dept-search__box {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  background: var(--color-card-bg, #fff);
  border-radius: 16px;
}
.dept-search__icon {
  color: var(--n6, #8a9099);
  flex: none;
}
.dept-search__input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--t3-size, 12px);
  color: var(--n9, #222);
}
.dept-search__clear {
  flex: none;
  display: flex;
  align-items: center;
  border: none;
  background: none;
  color: var(--n5, #c4c9d0);
}
.dept-bottom-space {
  height: 32px;
}
</style>
