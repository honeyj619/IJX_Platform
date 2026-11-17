<template>
  <div class="org-node" role="treeitem" :aria-expanded="hasChildren ? String(isOpen) : undefined">
    <!-- 部门行：箭头（展开/收起）与整行（进部门成员页）分离点击 -->
    <div class="org-node__row" :style="{ paddingLeft: 12 + depth * 18 + 'px' }">
      <button
        v-if="hasChildren"
        type="button"
        class="org-node__arrow-btn"
        :aria-label="isOpen ? '收起' + node.name : '展开' + node.name"
        :aria-expanded="isOpen"
        @click.stop="emit('toggle', node.id)"
      >
        <ImIcon name="chevron" :size="16" class="org-node__arrow" :class="{ 'org-node__arrow--open': isOpen }" />
      </button>
      <span v-else class="org-node__arrow-spacer" />
      <button type="button" class="org-node__main" @click="emit('open-dept', node.id)">
        <ImIcon :name="node.type === 'company' ? 'shield' : 'folder'" :size="18" class="org-node__icon" />
        <span class="org-node__name">{{ node.name }}</span>
        <span class="org-node__count">{{ memberCount }} 人</span>
      </button>
    </div>

    <template v-if="isOpen">
      <!-- 子部门（递归：script setup 自引用须用文件名 OrgTreeNode） -->
      <OrgTreeNode
        v-for="child in node.children || []"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :expanded="expanded"
        :contacts="contacts"
        @toggle="emit('toggle', $event)"
        @open-dept="emit('open-dept', $event)"
        @open-contact="emit('open-contact', $event)"
      />
      <!-- 直挂成员 -->
      <button
        v-for="c in directMembers"
        :key="node.id + '-' + c.id"
        type="button"
        class="org-node__row org-node__row--member"
        :style="{ paddingLeft: 12 + (depth + 1) * 18 + 'px' }"
        @click="emit('open-contact', c.id)"
      >
        <span class="org-node__arrow-spacer" />
        <ImAvatar :name="c.name" :size="28" />
        <span class="org-node__name">{{ c.name }}</span>
        <span class="org-node__job">{{ c.job || '' }}</span>
      </button>
      <div v-if="!hasChildren && !directMembers.length" class="org-node__empty" :style="{ paddingLeft: 12 + (depth + 1) * 18 + 'px' }">该部门暂无成员</div>
    </template>
  </div>
</template>

<script setup>
/**
 * 组织树节点（递归）：部门行点击展开/收起，成员行点击进详情。
 * 整节点（含子部门）成员数由父级 util 统计传入或此处计算。
 */
import { computed } from 'vue'
import ImAvatar from '../im/ImAvatar.vue'
import ImIcon from '../im/ImIcon.vue'
import { countMembers } from '../../im/data/organization'

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  expanded: { type: Object, required: true },
  contacts: { type: Array, required: true },
})
const emit = defineEmits(['toggle', 'open-dept', 'open-contact'])

const hasChildren = computed(() => (props.node.children || []).length > 0)
const isOpen = computed(() => !!props.expanded[props.node.id])
const memberCount = computed(() => countMembers(props.node))
const directMembers = computed(() =>
  props.node.memberIds
    .map((id) => props.contacts.find((c) => c.id === id))
    .filter(Boolean),
)
</script>

<style scoped>
.org-node__row {
  display: flex;
  align-items: stretch;
  width: 100%;
  min-height: 44px;
  background: var(--color-card-bg);
  border: none;
}
.org-node__arrow-btn {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  border: none;
  background: none;
  -webkit-tap-highlight-color: transparent;
}
.org-node__arrow-btn:active {
  opacity: 0.6;
}
.org-node__main {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0 16px 0 0;
  border: none;
  background: none;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.org-node__main:active {
  background: var(--n2, #f2f3f5);
}
.org-node__row--member:active {
  background: var(--n2, #f2f3f5);
}
.org-node__arrow {
  color: var(--n5, #c4c9d0);
  transition: transform 0.15s ease;
}
.org-node__arrow--open {
  transform: rotate(90deg);
}
.org-node__arrow-spacer {
  width: 16px;
  flex: none;
}
.org-node__icon {
  color: var(--n7, #6b7280);
}
.org-node__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--t5-size, 15px);
  color: var(--n9, #222);
  text-align: left;
}
.org-node__row--member .org-node__name {
  font-weight: 400;
}
.org-node__job {
  font-size: var(--t3-size, 12px);
  color: var(--n6, #8a9099);
}
.org-node__count {
  flex: none;
  font-size: var(--t3-size, 12px);
  color: var(--n6, #8a9099);
}
.org-node__empty {
  padding: 8px 16px;
  font-size: var(--t3-size, 12px);
  color: var(--n6, #8a9099);
}
</style>
