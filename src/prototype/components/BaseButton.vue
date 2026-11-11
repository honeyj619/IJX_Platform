<template>
  <component
    :is="tag"
    :type="tag === 'button' ? nativeType : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    :class="['base-button', `base-button--${type}`, `base-button--${size}`, {
      'is-block': block,
      'is-disabled': disabled,
      'is-loading': loading
    }]"
    @click="onClick"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true"></span>
    <span class="base-button__content"><slot /></span>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'primary' }, // primary | default | text
  size: { type: String, default: 'normal' }, // small | normal | large
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  nativeType: { type: String, default: 'button' },
  href: { type: String, default: '' }
})

const emit = defineEmits(['click'])

const tag = computed(() => (props.href ? 'a' : 'button'))

function onClick(event) {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  border-radius: var(--radius-sm);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: filter 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}

.base-button--small {
  height: 30px;
  padding: 0 var(--space-3);
  font-size: var(--t3-size);
}

.base-button--normal {
  height: 38px;
  padding: 0 var(--space-4);
  font-size: var(--t4-size);
}

.base-button--large {
  height: 44px;
  padding: 0 var(--space-4);
  font-size: var(--t5-size);
}

.is-block {
  display: flex;
  width: 100%;
}

/* 主按钮 */
.base-button--primary {
  background: var(--color-brand-primary);
  color: #fff;
}
.base-button--primary:active {
  filter: brightness(0.8);
}
.base-button--primary.is-disabled,
.base-button--primary.is-loading {
  background: #f9a3bf; /* 主色 +70% 白蒙层 */
  color: rgba(255, 255, 255, 0.85);
  cursor: not-allowed;
}

/* 次按钮（浅色描边） */
.base-button--default {
  background: var(--color-card-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--n4);
}
.base-button--default:active {
  background: var(--n2);
}
.base-button--default.is-disabled,
.base-button--default.is-loading {
  color: var(--color-text-disabled);
  border-color: var(--n3);
  cursor: not-allowed;
}

/* 文字按钮 */
.base-button--text {
  background: transparent;
  color: var(--color-brand-primary);
  padding: 0 var(--space-2);
}
.base-button--text:active {
  opacity: 0.7;
}
.base-button--text.is-disabled,
.base-button--text.is-loading {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.base-button:focus-visible {
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
}

.base-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: base-spin 0.7s linear infinite;
}

@keyframes base-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
