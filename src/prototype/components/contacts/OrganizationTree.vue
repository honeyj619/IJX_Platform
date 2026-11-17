<template>
  <div class="org-tree" role="tree">
    <div v-if="!nodes.length" class="org-tree__empty">{{ emptyText }}</div>
    <OrgNode
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :depth="0"
      :expanded="expanded"
      :contacts="contacts"
      @toggle="emit('toggle', $event)"
      @open-dept="emit('open-dept', $event)"
      @open-contact="emit('open-contact', $event)"
    />
  </div>
</template>

<script setup>
/**
 * 组织架构树：根/部门节点 + 展开状态 + 直挂成员。
 * 节点成员通过 contacts（imStore 联系人数组）解析，不复制人员资料。
 */
import OrgNode from './OrgTreeNode.vue'

defineProps({
  nodes: { type: Array, required: true },
  expanded: { type: Object, required: true },
  contacts: { type: Array, required: true },
  emptyText: { type: String, default: '暂无组织架构' },
})
const emit = defineEmits(['toggle', 'open-dept', 'open-contact'])
</script>

<style scoped>
.org-tree__empty {
  padding: 24px 16px;
  text-align: center;
  font-size: var(--t3-size, 12px);
  color: var(--n6, #8a9099);
}
</style>
