<template>
  <div class="app-container">
    <router-view />
    <TabBar v-if="!route.meta.hideTab" />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import TabBar from './components/TabBar.vue'

const route = useRoute()

const feedbackPageTitles = {
  '/': '首页',
  '/schedule': '日程',
  '/workspace': '工作台',
  '/message': '消息',
}

watch(
  () => route.path,
  (path) => {
    if (!path || path.startsWith('/profile')) return
    const mountedAtPrototypeRoot = /\/app\/prototype\/?$/.test(window.location.pathname)
    if (path === '/' && !mountedAtPrototypeRoot) return
    const rootPath = path === '/' ? '/' : `/${path.split('/').filter(Boolean)[0]}`
    const context = {
      title: feedbackPageTitles[rootPath] || 'App 页面',
      path,
      capturedAt: new Date().toISOString(),
    }
    try {
      window.sessionStorage.setItem('ijx-feedback-entry-page', JSON.stringify(context))
    } catch {
      // 会话存储不可用时不影响页面导航。
    }
  },
  { immediate: true },
)
</script>
