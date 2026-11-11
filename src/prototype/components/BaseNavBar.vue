<template>
  <header class="base-navbar" :class="{ 'has-back': showBack }">
    <div class="base-navbar__left">
      <button
        v-if="showBack"
        type="button"
        class="base-navbar__back"
        :disabled="backDisabled"
        :aria-label="backText || '返回'"
        @click="onBack"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M15.5 4.5 L8 12 l7.5 7.5" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span v-if="backText" class="base-navbar__back-text">{{ backText }}</span>
      </button>
      <slot v-else name="left" />
    </div>

    <h1 class="base-navbar__title">
      <slot>{{ title }}</slot>
    </h1>

    <div class="base-navbar__right">
      <slot name="right">
        <button
          v-if="rightText"
          type="button"
          class="base-navbar__action"
          :disabled="rightDisabled"
          @click="$emit('right-click', $event)"
        >
          {{ rightText }}
        </button>
      </slot>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  backText: { type: String, default: '' },
  backDisabled: { type: Boolean, default: false },
  rightText: { type: String, default: '' },
  rightDisabled: { type: Boolean, default: false }
})

const emit = defineEmits(['back', 'right-click'])
const router = useRouter()

function onBack() {
  emit('back')
  if (window.history.state && window.history.state.back) {
    router.back()
  }
}
</script>

<style scoped>
.base-navbar {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--navbar-height);
  padding: 0 var(--space-3);
  background: var(--color-card-bg);
}

.base-navbar__left,
.base-navbar__right {
  display: flex;
  align-items: center;
  min-width: 56px;
  flex: 1;
}

.base-navbar__right {
  justify-content: flex-end;
}

.base-navbar__title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--t7-size);
  line-height: var(--t7-line);
  font-weight: 500;
  color: var(--color-text-primary);
}

.base-navbar__back {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-primary);
  -webkit-tap-highlight-color: transparent;
}

.base-navbar__back:active {
  opacity: 0.7;
}

.base-navbar__back:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.base-navbar__back-text {
  margin-left: 2px;
  font-size: var(--t4-size);
}

.base-navbar__action {
  font-size: var(--t4-size);
  color: var(--color-text-secondary);
  padding: var(--space-1) var(--space-2);
  -webkit-tap-highlight-color: transparent;
}

.base-navbar__action:active {
  opacity: 0.7;
}

.base-navbar__action:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
</style>
