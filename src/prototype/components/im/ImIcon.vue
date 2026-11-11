<template>
  <span
    class="im-icon"
    :class="{ 'im-icon--brand': brand }"
    :style="{ width: size + 'px', height: size + 'px' }"
    aria-hidden="true"
    v-html="svg"
  />
</template>

<script setup>
import { computed } from 'vue'

/**
 * 本地线稿图标占位（DESIGN_SYSTEM §5）：
 * 资源位于 assets/icons/im/*.svg，README 与 CURRENT.md 均已登记「待正式品牌图标包替换」。
 * ?raw 内联，构建期打包，运行时无网络请求；currentColor 继承父级文字色。
 */
const files = import.meta.glob('../../assets/icons/im/*.svg', { query: '?raw', import: 'default', eager: true })
const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 20 },
  brand: { type: Boolean, default: false }
})
const svg = computed(() => {
  const key = Object.keys(files).find((k) => k.endsWith('/' + props.name + '.svg'))
  return key ? String(files[key]) : ''
})
</script>
