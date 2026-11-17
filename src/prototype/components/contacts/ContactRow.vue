<template>
  <button type="button" class="contact-row" @click="emit('select', contact.id)">
    <ImAvatar :name="contact.name" :size="40" />
    <span class="contact-row__main">
      <span class="contact-row__title">
        <span v-for="(seg, i) in nameSegments" :key="i" :class="{ 'contact-row__hit': seg.hit }">{{ seg.text }}</span>
        <ImIcon v-if="contact.starred" name="star" :size="12" class="contact-row__star" />
      </span>
      <span class="contact-row__desc">
        <template v-if="subtitle">{{ subtitle }}</template>
        <template v-else>{{ contact.job || '员工' }}{{ contact.dept ? ' · ' + contact.dept : '' }}</template>
      </span>
    </span>
    <span class="contact-row__status" :class="'contact-row__status--' + (contact.status || 'offline')" :aria-label="statusLabel" />
    <ImIcon name="chevron" :size="16" class="contact-row__chevron" />
  </button>
</template>

<script setup>
/**
 * 通讯录统一成员列表行：头像 + 姓名（搜索命中高亮）+ 职位/部门 + 在线状态点。
 * 首页、部门页共用；搜索高亮由 keyword 可选 prop 驱动。
 */
import { computed } from 'vue'
import ImAvatar from '../im/ImAvatar.vue'
import ImIcon from '../im/ImIcon.vue'

const props = defineProps({
  contact: { type: Object, required: true },
  keyword: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})
const emit = defineEmits(['select'])

const STATUS_LABELS = { online: '在线', offline: '离线', away: '离开', busy: '忙碌' }
const statusLabel = computed(() => STATUS_LABELS[props.contact.status] || '离线')

/** 姓名按关键词分段高亮（包含匹配） */
const nameSegments = computed(() => {
  const name = props.contact.name || ''
  const kw = (props.keyword || '').trim()
  if (!kw) return [{ text: name, hit: false }]
  const idx = name.toLowerCase().indexOf(kw.toLowerCase())
  if (idx < 0) return [{ text: name, hit: false }]
  return [
    { text: name.slice(0, idx), hit: false },
    { text: name.slice(idx, idx + kw.length), hit: true },
    { text: name.slice(idx + kw.length), hit: false },
  ].filter((s) => s.text)
})
</script>

<style scoped>
.contact-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: var(--color-card-bg);
  border: none;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.contact-row:active {
  background: var(--n2, #f2f3f5);
}
.contact-row__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.contact-row__title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--t5-size, 15px);
  line-height: var(--t5-line, 21px);
  font-weight: 600;
  color: var(--n9, #222);
}
.contact-row__hit {
  color: var(--color-brand-primary, #f53a71);
}
.contact-row__star {
  color: #f7b500;
}
.contact-row__desc {
  font-size: var(--t3-size, 12px);
  line-height: var(--t3-line, 17px);
  color: var(--n6, #8a9099);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.contact-row__status {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.contact-row__status--online { background: #34c77b; }
.contact-row__status--away { background: #f7b500; }
.contact-row__status--busy { background: #ff6b35; }
.contact-row__status--offline { background: var(--n5, #c4c9d0); }
.contact-row__chevron {
  color: var(--n4, #d5d9e0);
}
</style>
