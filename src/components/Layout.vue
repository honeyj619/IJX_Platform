<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      permanent
      width="260"
      mini-variant-width="72"
      elevation="2"
      color="primary"
      :permanent="true"
    >
      <v-list density="compact" class="py-3">
        <v-list-item
          v-for="item in navItems"
          :key="item.path"
          :active="currentPath === item.path"
          :to="item.path"
          color="white"
          :ripple="false"
          class="mx-2 my-1"
          rounded="lg"
          :class="{ 'bg-white/15': currentPath === item.path }"
        >
          <template v-slot:prepend>
            <v-icon color="white">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title v-if="!miniVariant" color="white" class="font-weight-medium">{{ item.label }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <v-divider class="mx-4" color="white" style="opacity: 0.2" />

      <v-list density="compact" v-if="openPages.length > 0" class="py-3">
        <v-list-subheader color="white" style="opacity: 0.7">已打开</v-list-subheader>
        <v-list-item
          v-for="page in openPages"
          :key="page.id"
          :active="currentPath === page.path"
          :to="page.path"
          color="white"
          :ripple="false"
          class="mx-2 my-1"
          rounded="lg"
          :class="{ 'bg-white/15': currentPath === page.path }"
        >
          <template v-slot:prepend>
            <v-icon color="white" size="20">mdi-file-document-outline</v-icon>
          </template>
          <v-list-item-title v-if="!miniVariant" color="white">{{ page.title }}</v-list-item-title>
          <template v-slot:append v-if="!miniVariant">
            <v-btn
              icon
              @click.stop="closePage(page.path)"
              color="white"
              variant="text"
              size="x-small"
              density="compact"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-3 d-flex justify-end">
          <v-btn
            icon
            @click="miniVariant = !miniVariant"
            color="white"
            variant="text"
          >
            <v-icon>{{ miniVariant ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="surface"
      elevation="0"
      class="border-bottom border-grey-lighten-2"
    >
      <v-btn icon @click="drawer = !drawer" class="d-lg-none">
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <v-toolbar-title class="font-weight-bold ml-2">工作空间</v-toolbar-title>

      <v-spacer />

      <v-badge :content="3" color="primary">
        <v-btn icon class="me-1">
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>
      </v-badge>

      <v-btn icon class="me-1">
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar size="36">
              <v-img src="https://api.dicebear.com/7.x/initials/svg?seed=用户&backgroundColor=f97316" />
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="'/profile'">
            <template v-slot:prepend>
              <v-icon>mdi-account-outline</v-icon>
            </template>
            <v-list-item-title>个人信息</v-list-item-title>
          </v-list-item>
          <v-list-item :to="'/settings'">
            <template v-slot:prepend>
              <v-icon>mdi-cog-outline</v-icon>
            </template>
            <v-list-item-title>系统设置</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item>
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
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
import { ref, onMounted, computed } from 'vue'
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
  { icon: 'mdi-message-outline', label: '消息', path: '/' },
  { icon: 'mdi-bell-outline', label: '工作门户', path: '/enterprise' },
  { icon: 'mdi-calendar-blank-outline', label: '日历', path: '/calendar' },
  { icon: 'mdi-folder-outline', label: '知识库', path: '/ekb' },
  { icon: 'mdi-shape', label: '业务系统', path: '/business' },
  { icon: 'mdi-star-outline', label: '如意空间', path: '/ruyi-zone' },
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
</script>
