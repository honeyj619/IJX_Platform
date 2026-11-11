<template>
  <div class="workspace-page">
    <!-- 搜索 -->
    <div class="search-wrap">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M16 16l4.2 4.2" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round"/>
        </svg>
        <input
          v-model="keyword"
          type="text"
          class="search-input"
          :class="{ 'is-left': inputLeft }"
          placeholder="搜索"
          aria-label="搜索应用"
          @focus="focused = true"
          @blur="focused = false"
        >
        <button
          v-if="isSearching"
          type="button"
          class="search-clear"
          aria-label="清空搜索"
          @click="keyword = ''"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.35"/>
            <path d="M9 9l6 6M15 9l-6 6" stroke="#fff" stroke-width="1.8"
                  stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 无搜索结果 -->
    <div v-if="isSearching && filteredSections.length === 0" class="no-result">
      <BaseEmpty description="未找到相关应用" />
    </div>

    <template v-else>
      <!-- 我的工作台 -->
      <section
        v-if="sectionVisible('my')"
        class="ws-section"
        :class="{ editing: editing }"
      >
        <header class="section-head">
          <h2 class="section-title">我的工作台</h2>
          <div class="section-actions">
            <button
              v-if="myApps.length < initialMyCount && !isSearching"
              type="button"
              class="restore-btn"
              @click="restoreMyApps"
            >
              恢复初始
            </button>
            <button
              v-if="!isSearching"
              type="button"
              class="edit-btn"
              @click="toggleEdit"
            >
              {{ editing ? '完成' : '编辑' }}
            </button>
          </div>
        </header>

        <!-- 删空后的提示（可恢复，不是死状态） -->
        <div v-if="myApps.length === 0" class="my-empty">
          已移除全部应用，可点击“恢复初始”找回
        </div>

        <div v-else class="app-grid">
          <div
            v-for="app in sectionApps('my')"
            :key="'my-' + app.name"
            class="app-item"
            @click="onAppTap(app)"
          >
            <span class="app-icon-wrap">
              <img class="app-icon" :src="app.icon" :alt="app.name" draggable="false">
              <span v-if="editing" class="remove-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="10" height="10">
                  <path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="2.6"
                        stroke-linecap="round"/>
                </svg>
              </span>
            </span>
            <span class="app-name">{{ app.name }}</span>
          </div>
        </div>
      </section>

      <div v-if="sectionVisible('reco')" class="band"></div>

      <!-- 推荐应用 -->
      <section v-if="sectionVisible('reco')" class="ws-section">
        <header class="section-head">
          <h2 class="section-title">推荐应用</h2>
        </header>

        <div class="app-grid">
          <div
            v-for="app in sectionApps('reco')"
            :key="'reco-' + app.name"
            class="app-item"
            @click="onAppTap(app)"
          >
            <span class="app-icon-wrap">
              <img class="app-icon" :src="app.icon" :alt="app.name" draggable="false">
            </span>
            <span class="app-name">{{ app.name }}</span>
          </div>
        </div>
      </section>

      <div v-if="sectionVisible('svc')" class="band"></div>

      <!-- 综合服务 -->
      <section v-if="sectionVisible('svc')" class="ws-section ws-section--last">
        <header class="section-head">
          <h2 class="section-title">综合服务</h2>
        </header>

        <div class="app-grid">
          <div
            v-for="app in sectionApps('svc')"
            :key="'svc-' + app.name"
            class="app-item"
            @click="onAppTap(app)"
          >
            <span class="app-icon-wrap">
              <img class="app-icon" :src="app.icon" :alt="app.name" draggable="false">
            </span>
            <span class="app-name">{{ app.name }}</span>
          </div>
        </div>
      </section>
    </template>

    <transition name="toast">
      <div v-if="toastVisible" class="page-toast" role="status">{{ toastText }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseEmpty from '../components/BaseEmpty.vue'

import ws00 from '../assets/icons/ws/ws-00.png'
import ws01 from '../assets/icons/ws/ws-01.png'
import ws02 from '../assets/icons/ws/ws-02.png'
import ws03 from '../assets/icons/ws/ws-03.png'
import ws04 from '../assets/icons/ws/ws-04.png'
import ws05 from '../assets/icons/ws/ws-05.png'
import ws06 from '../assets/icons/ws/ws-06.png'
import ws07 from '../assets/icons/ws/ws-07.png'
import ws08 from '../assets/icons/ws/ws-08.png'
import ws09 from '../assets/icons/ws/ws-09.png'
import ws10 from '../assets/icons/ws/ws-10.png'
import ws11 from '../assets/icons/ws/ws-11.png'
import ws12 from '../assets/icons/ws/ws-12.png'
import ws13 from '../assets/icons/ws/ws-13.png'
import ws14 from '../assets/icons/ws/ws-14.png'
import ws15 from '../assets/icons/ws/ws-15.png'
import ws16 from '../assets/icons/ws/ws-16.png'
import ws17 from '../assets/icons/ws/ws-17.png'
import ws18 from '../assets/icons/ws/ws-18.png'
import ws19 from '../assets/icons/ws/ws-19.png'
import ws20 from '../assets/icons/ws/ws-20.png'
import ws21 from '../assets/icons/ws/ws-21.png'
import ws22 from '../assets/icons/ws/ws-22.png'
import ws23 from '../assets/icons/ws/ws-23.png'

/* ---------------- 数据 ---------------- */
const myApps = ref([
  { name: '会议室', icon: ws00 },
  { name: '通讯录', icon: ws01 },
  { name: '流程中心', icon: ws02 },
  { name: '员工活动室', icon: ws03 },
  { name: '公司值班', icon: ws04 }
])

const recoApps = [
  { name: '员工活动室', icon: ws05 },
  { name: '通讯录', icon: ws06 },
  { name: '流程中心', icon: ws07 }
]

const svcApps = [
  { name: '我的邮箱', icon: ws08 },
  { name: '流程中心', icon: ws09 },
  { name: '会议室', icon: ws10 },
  { name: '公司值班', icon: ws11 },
  { name: '工作汇报', icon: ws12 },
  { name: '我的考评', icon: ws13 },
  { name: 'AOC大厅', icon: ws14 },
  { name: '健康云', icon: ws15 },
  { name: '航卫管理', icon: ws16 },
  { name: '车辆管理', icon: ws17 },
  { name: '智能会议', icon: ws18 },
  { name: '质量管理', icon: ws19 },
  { name: '低代码平台', icon: ws20 },
  { name: 'SMS上报', icon: ws21 },
  { name: 'SMS核查', icon: ws22 },
  { name: '网上报', icon: ws23 }
]

/* ---------------- 搜索 ---------------- */
const keyword = ref('')
const focused = ref(false)

const isSearching = computed(() => keyword.value.trim().length > 0)
const inputLeft = computed(() => focused.value || isSearching.value)

function match(app) {
  return app.name.toLowerCase().includes(keyword.value.trim().toLowerCase())
}

const filteredSections = computed(() => {
  const sections = [
    { key: 'my', apps: myApps.value.filter(match) },
    { key: 'reco', apps: recoApps.filter(match) },
    { key: 'svc', apps: svcApps.filter(match) }
  ]
  return sections.filter(s => s.apps.length > 0)
})

function sectionVisible(key) {
  // my 分组：未搜索时始终可见（删空后仍显示提示行与恢复入口，避免死状态）；
  // 搜索时按是否有匹配项。reco/svc：始终按匹配结果。
  if (key === 'my' && !isSearching.value) return true
  return filteredSections.value.some(s => s.key === key)
}
function sectionApps(key) {
  return filteredSections.value.find(s => s.key === key)?.apps || []
}

/* ---------------- 编辑 ---------------- */
const editing = ref(false)

// 初始我的工作台快照（恢复机制用；删空/误删后可一键找回，不产生死状态）
const initialMyApps = [
  { name: '会议室', icon: ws00 },
  { name: '通讯录', icon: ws01 },
  { name: '流程中心', icon: ws02 },
  { name: '员工活动室', icon: ws03 },
  { name: '公司值班', icon: ws04 }
]
const initialMyCount = initialMyApps.length

function toggleEdit() {
  editing.value = !editing.value
}

function restoreMyApps() {
  myApps.value = initialMyApps.map(a => ({ ...a }))
  editing.value = false
  showToast('已恢复初始应用')
}

function onAppTap(app) {
  if (editing.value) {
    myApps.value = myApps.value.filter(a => a.name !== app.name)
    // 删空不自动退出编辑（提示行 + 恢复入口仍可用）
    return
  }
  showToast(`「${app.name}」暂未开放`)
}

/* ---------------- 轻提示 ---------------- */
const toastVisible = ref(false)
const toastText = ref('')
let toastTimer = null

function showToast(text) {
  toastText.value = text
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 1600)
}
</script>

<style scoped>
.workspace-page {
  min-height: 100dvh;
  background: var(--color-card-bg);
  padding-bottom: var(--tabbar-total);
}

/* ============ 搜索 ============ */
.search-wrap {
  background: var(--n1);
  padding: 10px 12px;
}
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
  background: var(--n2);
  border-radius: var(--radius-pill);
  padding: 0 14px;
}
.search-icon {
  flex: none;
  color: var(--n6);
  margin-right: 8px;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: var(--n8);
  text-align: center;
}
.search-input.is-left { text-align: left; }
.search-input::placeholder { color: var(--n5); }
.search-clear {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-left: 6px;
  border: none;
  background: transparent;
  color: var(--n5);
  -webkit-tap-highlight-color: transparent;
}
.search-clear:active { opacity: 0.6; }

/* ============ 分组 ============ */
.ws-section {
  padding: 14px 12px 6px;
}
.ws-section--last {
  padding-bottom: 16px;
}
.band {
  height: 8px;
  background: var(--n1);
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.restore-btn {
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--color-brand-link);
  background: transparent;
  padding: 5px 8px;
  -webkit-tap-highlight-color: transparent;
}
.restore-btn:active { opacity: 0.7; }
.my-empty {
  padding: 14px 0 18px;
  text-align: center;
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: var(--n6);
}
.section-title {
  font-size: 19px;
  line-height: 26px;
  font-weight: 500;
  color: var(--n8);
}
.edit-btn {
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--mr);
  background: #fde7f0;
  border-radius: 6px;
  padding: 5px 12px;
  -webkit-tap-highlight-color: transparent;
}
.edit-btn:active { opacity: 0.7; }

/* ============ 宫格 ============ */
.app-grid {
  display: flex;
  flex-wrap: wrap;
}
.app-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
  -webkit-tap-highlight-color: transparent;
}
.app-icon-wrap {
  position: relative;
  width: 44px;
  height: 44px;
}
.app-icon {
  width: 44px;
  height: 44px;
}
.app-name {
  margin-top: 7px;
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--n8);
  text-align: center;
}

.editing .app-item { margin-bottom: 12px; }
.remove-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--mr);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fff;
}

/* ============ 无结果 ============ */
.no-result {
  padding-top: 10vh;
}

/* ============ 轻提示 ============ */
.page-toast {
  position: fixed;
  left: 50%;
  bottom: calc(var(--tabbar-total) + 60px);
  transform: translateX(-50%);
  background: rgba(38, 38, 38, 0.88);
  color: #fff;
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  z-index: var(--z-toast);
  white-space: nowrap;
  pointer-events: none;
}
.toast-enter-active,
.toast-leave-active { transition: opacity 0.2s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; }
</style>
