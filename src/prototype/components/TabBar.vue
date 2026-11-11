<template>
  <nav class="tab-bar" aria-label="主导航">
    <router-link
      v-for="tab in tabs"
      :key="tab.name"
      :to="tab.to"
      class="tab-item"
      :class="{ active: currentName === tab.name }"
      :aria-current="currentName === tab.name ? 'page' : undefined"
    >
      <img class="tab-icon" :src="currentName === tab.name ? tab.iconActive : tab.icon" :alt="tab.label" draggable="false">
      <span class="tab-label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import homeIcon from '../assets/icons/tab/home-inactive.png'
import homeActiveIcon from '../assets/icons/tab/home-active.png'
import scheduleIcon from '../assets/icons/tab/schedule-inactive.png'
import scheduleActiveIcon from '../assets/icons/tab/schedule-active.png'
import workspaceIcon from '../assets/icons/tab/workspace-inactive.png'
import workspaceActiveIcon from '../assets/icons/tab/workspace-active.png'
import messageIcon from '../assets/icons/tab/message-inactive.png'
import messageActiveIcon from '../assets/icons/tab/message-active.png'
import profileIcon from '../assets/icons/tab/profile-inactive.png'
import profileActiveIcon from '../assets/icons/tab/profile-active.png'

const route = useRoute()
const currentName = computed(() => route.name)

const tabs = [
  { name: 'Home', to: '/', label: '首页', icon: homeIcon, iconActive: homeActiveIcon },
  { name: 'Schedule', to: '/schedule', label: '日程', icon: scheduleIcon, iconActive: scheduleActiveIcon },
  { name: 'Workspace', to: '/workspace', label: '工作台', icon: workspaceIcon, iconActive: workspaceActiveIcon },
  { name: 'Message', to: '/message', label: '消息', icon: messageIcon, iconActive: messageActiveIcon },
  { name: 'Profile', to: '/profile', label: '我的', icon: profileIcon, iconActive: profileActiveIcon }
]
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: var(--color-card-bg);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: stretch;
  padding-bottom: var(--safe-bottom);
  z-index: var(--z-tabbar);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: var(--tabbar-height);
  color: var(--color-text-secondary);
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s ease;
}

.tab-item:active {
  opacity: 0.7;
}

.tab-icon {
  width: auto;
  height: 22px;
  pointer-events: none;
}

.tab-label {
  font-size: var(--t1-size);
  line-height: var(--t1-line);
  font-weight: var(--t1-weight);
}

.tab-item.active {
  color: var(--color-brand-primary);
}
</style>
