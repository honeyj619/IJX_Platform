<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      permanent
      width="280"
      mini-variant-width="80"
      color="primary"
    >
      <v-list density="compact">
        <v-list-item
          v-for="item in navItems"
          :key="item.path"
          :active="currentPath === item.path"
          :to="item.path"
          color="white"
          :ripple="false"
        >
          <template v-slot:prepend>
            <v-icon color="white">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title v-if="!miniVariant" color="white">{{ item.label }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider class="ma-4" color="white" style="opacity: 0.3" />

      <v-list density="compact">
        <v-list-item
          v-for="page in openPages"
          :key="page.id"
          :active="currentPath === page.path"
          :to="page.path"
          color="white"
          :ripple="false"
        >
          <template v-slot:prepend>
            <v-icon color="white">mdi-file</v-icon>
          </template>
          <v-list-item-title v-if="!miniVariant" color="white">{{ page.title }}</v-list-item-title>
          <template v-slot:append v-if="!miniVariant">
            <v-btn icon @click.stop="closePage(page.path)" color="white" variant="text">
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <v-card-text>
          <v-btn
            icon
            @click="miniVariant = !miniVariant"
            color="white"
            variant="text"
          >
            <v-icon>{{ miniVariant ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
          </v-btn>
        </v-card-text>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="surface"
      elevation="2"
    >
      <v-btn icon @click="drawer = !drawer" class="d-lg-none">
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <v-toolbar-title class="font-weight-bold">工作空间</v-toolbar-title>

      <v-spacer />

      <v-btn icon class="me-2">
        <v-icon>mdi-bell</v-icon>
      </v-btn>

      <v-btn icon class="me-2">
        <v-icon>mdi-search</v-icon>
      </v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="'/profile'">
            <v-list-item-title>个人信息</v-list-item-title>
          </v-list-item>
          <v-list-item :to="'/settings'">
            <v-list-item-title>系统设置</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>退出登录</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const drawer = ref(true)
const miniVariant = ref(false)

interface Page {
  id: string
  title: string
  path: string
}

const openPages = ref<Page[]>([])

const navItems = [
  { icon: 'mdi-message-square', label: '消息', path: '/' },
  { icon: 'mdi-bell', label: '工作门户', path: '/enterprise' },
  { icon: 'mdi-calendar', label: '日历', path: '/calendar' },
  { icon: 'mdi-folder', label: '知识库', path: '/ekb' },
  { icon: 'mdi-hexagon', label: '业务系统', path: '/business' },
  { icon: 'mdi-bell', label: '如意空间', path: '/ruyi-zone' },
]

const navPaths = navItems.map(item => item.path)

const currentPath = computed(() => route.path)

const pageTitles: Record<string, string> = {
  '/': '消息',
  '/enterprise': '工作门户',
  '/calendar': '日历',
  '/knowledge': '知识库',
  '/ekb': '知识库',
  '/business': '业务系统',
  '/ruyi-zone': '如意空间',
  '/agent-square': '智能体广场',
  '/profile': '个人信息',
  '/settings': '系统设置',
}

const handleRouteChange = () => {
  const path = route.path
  if (!navPaths.includes(path)) {
    const title = pageTitles[path] || path
    const existingPage = openPages.value.find(p => p.path === path)
    if (!existingPage) {
      openPages.value.push({
        id: Date.now().toString(),
        title,
        path,
      })
    }
  }
}

const closePage = (path: string) => {
  openPages.value = openPages.value.filter(p => p.path !== path)
  if (route.path === path) {
    router.push('/')
  }
}

onMounted(() => {
  handleRouteChange()
  router.afterEach(handleRouteChange)
})

onUnmounted(() => {
  router.afterEach(handleRouteChange)
})
</script>
