<template>
  <div class="im-empty">
    <img class="im-empty__art" :src="emptyArt" alt="" draggable="false">
    <div class="im-empty__title im-truncate">{{ title }}</div>
    <div v-if="desc" class="im-empty__desc im-truncate">{{ desc }}</div>
    <ImButton v-if="actionText" variant="secondary" size="small" class="im-empty__action" @click="emit('action')">
      {{ actionText }}
    </ImButton>
  </div>
</template>

<script setup>
import ImButton from './ImButton.vue'
import emptyArt from '../../assets/empty/empty-function.png'

/**
 * 落地 spec-empty.png：160px 本地场景插图、最多两行文案、左右各留 60px、视觉中心位于内容区上部。
 * 插图来自项目已有资产 assets/empty/empty-function.png（占位；其它场景插图待设计交付后登记替换）。
 * actionText 提供「下一步操作」入口，供空态可主动解决的场景使用。
 */
defineProps({
  title: { type: String, default: '暂无内容' },
  desc: { type: String, default: '' },
  actionText: { type: String, default: '' }
})
const emit = defineEmits(['action'])
</script>
