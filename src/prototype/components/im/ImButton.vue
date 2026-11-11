<template>
  <button
    type="button"
    class="im-btn"
    :class="[
      'im-btn--' + variant,
      { 'im-btn--block': block, 'im-btn--small': size === 'small', 'im-btn--large': size === 'large', 'im-btn--loading': loading }
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : null"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="im-btn__spinner" aria-hidden="true" />
    <ImIcon v-else-if="icon" :name="icon" :size="18" />
    <span class="im-btn__label"><template v-if="loading">处理中…</template><slot v-else /></span>
  </button>
</template>

<script setup>
import ImIcon from './ImIcon.vue'

/**
 * 落地 spec-button.png：
 * Normal 品牌填充 / Press 20% 黑蒙层 / Disable 70% 白蒙层；
 * min-height 44px、胶囊形，:active / :focus-visible / disabled 三态齐备。
 * P2-1：新增 loading 态（spinner + 行为禁用 + aria-busy），用于「处理中」反馈。
 */
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | neutral | ghost | danger
  size: { type: String, default: 'medium' },     // large | medium | small
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  icon: { type: String, default: '' }
})
const emit = defineEmits(['click'])
</script>
