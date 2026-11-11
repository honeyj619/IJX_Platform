<template>
  <div v-if="open" class="im-overlay" @click.self="emit('close')">
    <div class="im-sheet">
      <div class="im-sheet__head">
        <span>{{ title }}</span>
        <button type="button" class="im-nav__btn" aria-label="关闭" @click="emit('close')">
          <ImIcon name="close" :size="20" />
        </button>
      </div>
      <div class="im-sheet__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import ImIcon from './ImIcon.vue'

defineProps({ open: { type: Boolean, default: false }, title: { type: String, default: '' } })
const emit = defineEmits(['close'])
</script>
