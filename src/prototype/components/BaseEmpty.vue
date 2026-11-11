<template>
  <div class="base-empty" role="status">
    <img class="base-empty__image" :src="resolvedImage" :alt="description || '空状态'" draggable="false">
    <p v-if="description" class="base-empty__description">{{ description }}</p>
    <div v-if="$slots.action || actionText" class="base-empty__action">
      <slot name="action">
        <BaseButton v-if="actionText" type="primary" size="small" @click="$emit('action')">
          {{ actionText }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'
import defaultImage from '../assets/empty/empty-function.png'

const props = defineProps({
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  actionText: { type: String, default: '' }
})

defineEmits(['action'])

const resolvedImage = computed(() => props.image || defaultImage)
</script>

<style scoped>
.base-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-5) var(--space-4);
  text-align: center;
}

.base-empty__image {
  width: 160px;
  height: auto;
}

.base-empty__description {
  margin-top: var(--space-3);
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--color-text-muted);
}

.base-empty__action {
  margin-top: var(--space-4);
}
</style>
