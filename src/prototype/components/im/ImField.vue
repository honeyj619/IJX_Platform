<template>
  <div
    class="im-field"
    :class="{
      'im-field--focused': focused,
      'im-field--filled': filled,
      'im-field--disabled': disabled,
      'im-field--error': !!error
    }"
    @focusin="focused = true"
    @focusout="focused = false"
  >
    <label class="im-field__label" :for="fieldId">{{ label }}</label>
    <div class="im-field__content">
      <slot :id="fieldId" />
      <div v-if="error" class="im-field__error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, useId } from 'vue'

/**
 * 落地 spec-field.png：移动端行式 Field（左标题 + 右内容，固定 12px 间距）。
 * 五态：默认 / 聚焦（focusin）/ 已填（filled）/ 禁用（disabled）/ 错误（error，就近显示在内容下方）。
 * 默认插槽保留页面原生 input，避免改变既有选择器与数据绑定。
 */
defineProps({
  label: { type: String, required: true },
  filled: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' }
})
const fieldId = useId()
const focused = ref(false)
</script>
