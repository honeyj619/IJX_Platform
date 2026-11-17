<template>
  <div class="app-container">
    <router-view />
    <TabBar v-if="!route.meta.hideTab" />
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabBar from './components/TabBar.vue'
import { saveLastBusinessPage } from '../utils/feedbackPageContext'

const route = useRoute()
const router = useRouter()

/* App 端业务页面标题映射（与 TabBar 五入口一致） */
const PAGE_TITLES = {
  '/': '首页',
  '/schedule': '日程',
  '/workspace': '工作台',
  '/message': '消息',
  '/profile': '我的',
}

/**
 * 全局业务页面上下文记录：
 * 路由切换时保存「最近访问的业务页面」，供「我的—帮助与反馈」默认关联。
 * 排除：/profile、/profile/feedback*（反馈页自身）、登录页。
 * 等 router.isReady() 后再记录——直接深链进入时初始 fullPath 为 '/'，
 * 未就绪的 immediate 触发会把浏览器实际路径误记录成首页。
 */
const BUSINESS_PAGE_EXCLUDE = [/^\/profile(\/|$)/, /^\/login/]
const isBusinessPage = (path) =>
  path.startsWith('/') && !BUSINESS_PAGE_EXCLUDE.some((re) => re.test(path))

router.isReady().then(() => {
  watch(
    () => route.fullPath,
    (fullPath) => {
      if (!isBusinessPage(route.path)) return
      saveLastBusinessPage({ title: PAGE_TITLES[route.path] || '当前页面', path: fullPath })
    },
    { immediate: true },
  )
})
</script>
