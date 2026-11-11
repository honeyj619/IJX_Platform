<template>
  <header class="im-nav" :class="{ 'im-nav--dark': tone === 'dark', 'im-nav--disabled': disabled }">
    <div class="im-nav__side">
      <button v-if="back" type="button" class="im-nav__btn" aria-label="返回" :disabled="disabled" @click="onBack">
        <ImIcon name="back" :size="22" />
      </button>
      <slot name="left" />
    </div>
    <h1 class="im-nav__title">{{ title }}</h1>
    <div class="im-nav__side im-nav__side--right">
      <slot name="right">
        <button v-if="rightText" type="button" class="im-nav__text" :disabled="disabled" @click="emit('right')">{{ rightText }}</button>
      </slot>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ImIcon from './ImIcon.vue'

/**
 * 落地 spec-navbar.png：左侧品牌线稿返回、居中标题、右侧可选插槽；
 * 左右 side 等宽对称占位，浅/深背景可切换，禁用态只弱化左右操作、标题保持可读。
 */
const props = defineProps({
  title: { type: String, default: '' },
  back: { type: Boolean, default: true },
  rightText: { type: String, default: '' },
  tone: { type: String, default: 'light' },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['back', 'right'])
const router = useRouter()

function onBack() {
  emit('back')
  if (!props.back || props.disabled) return
  if (window.history.state && window.history.state.back) router.back()
  else router.push('/message')
}
</script>
