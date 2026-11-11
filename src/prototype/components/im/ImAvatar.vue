<template>
  <div class="im-avatar" :class="{ 'im-avatar--round': round }" :style="{ width: size + 'px', height: size + 'px', background: color }">
    <img v-if="src && !failed" :src="src" :alt="name" @error="failed = true">
    <span v-else class="im-avatar__text" :style="{ fontSize: Math.round(size * 0.42) + 'px' }">{{ icon || initials(name) }}</span>
    <span v-if="badge > 0" class="im-avatar__badge">{{ badge > 99 ? '99+' : badge }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { avatarColor, initials } from '../../im/ui'

const props = defineProps({
  name: { type: String, default: '' },
  src: { type: String, default: '' },
  icon: { type: String, default: '' },
  size: { type: Number, default: 44 },
  badge: { type: Number, default: 0 },
  round: { type: Boolean, default: false }
})
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
const color = computed(() => avatarColor(props.name + (props.src || '')))
</script>
