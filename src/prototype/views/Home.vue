<template>
  <div class="home-page">
    <!-- 顶部 sentinel：判断是否处于首屏顶部（如意助手两态） -->
    <div ref="topSentinel" class="top-sentinel" aria-hidden="true"></div>
    <!-- ============ 品牌区（渐变天空背景，全部 UI 由 DOM 绘制） ============ -->
    <header class="hero">
      <div class="hero__top">
        <span class="hero__city">上海市</span>
        <div class="hero__icons">
          <button type="button" class="hero__icon-btn" aria-label="扫码" @click="showToast('扫码暂未开放')">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3M14 17v3M17.5 14.5h2.5v2.5h-2.5z"
                    fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/>
            </svg>
          </button>
          <router-link to="/message" class="hero__icon-btn hero__bell" aria-label="消息通知">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M12 4a5.5 5.5 0 0 0-5.5 5.5c0 4-1.5 5.5-2 6h15c-.5-.5-2-2-2-6A5.5 5.5 0 0 0 12 4zM10 18.5a2 2 0 0 0 4 0"
                    fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="hero__bell-badge">55</span>
          </router-link>
        </div>
      </div>
      <div class="hero__search" role="search">
        <svg class="hero__search-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M16 16l4.2 4.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchText"
          type="search"
          class="hero__search-input"
          placeholder="快捷服务搜索"
          aria-label="快捷服务搜索"
        >
        <button v-if="searchText" type="button" class="hero__search-clear" aria-label="清空搜索" @click="searchText = ''">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.35"/>
            <path d="M9 9l6 6M15 9l-6 6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <!-- 四个待办入口（品牌背景内：白线稿图标 + 粉底白字角标气泡） -->
      <nav class="hero__todos" aria-label="待办入口">
        <button
          v-for="td in todoEntries"
          :key="td.key"
          type="button"
          class="todo-item"
          @click="onTodo(td)"
        >
          <span class="todo-item__visual">
            <svg class="todo-item__icon" viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
              <path :d="todoIcons[td.icon]" fill="none" stroke="#fff" stroke-width="1.6"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-if="td.count !== null" class="todo-item__badge">{{ td.count }}</span>
          </span>
          <span class="todo-item__label">{{ td.label }}</span>
        </button>
      </nav>
      <!-- 品牌创意画面（纯视觉美术字+云层，无任何 UI 文字） -->
      <img class="hero__art" :src="heroArt" alt="心有吉祥 如意人生" draggable="false">
    </header>

    <!-- ============ 快捷应用（白色连续区域：一行 5 项复用工作台图标 + 第二行"全部"第一列） ============ -->
    <nav class="quick-apps" aria-label="快捷应用">
      <div class="quick-apps__row">
        <button
          v-for="app in quickAppsRow1"
          :key="app.key"
          type="button"
          class="qa-item"
          @click="onQuickApp(app)"
        >
          <img class="qa-item__img" :src="app.iconImg" alt="" draggable="false">
          <span class="qa-item__label">{{ app.label }}</span>
        </button>
      </div>
      <div class="quick-apps__row">
        <button type="button" class="qa-item qa-item--all" @click="onQuickApp({ key: 'all', label: '全部' })">
          <img class="qa-item__img" :src="wsAll" alt="" draggable="false">
          <span class="qa-item__label">全部</span>
        </button>
      </div>
    </nav>

    <!-- ============ i快讯 资讯卡（白卡：左品牌标识 + 右标题） ============ -->
    <button type="button" class="news-card" @click="showToast('i快讯暂未开放')">
      <img class="news-card__logo" :src="newsLogo" alt="i快讯" draggable="false">
      <span class="news-card__title">关于 iOS 27 用户更新i吉祥app的小提醒</span>
    </button>

    <!-- ============ 战略规划横幅（真蓝色画面） ============ -->
    <button type="button" class="ops-banner" @click="showToast('战略规划暂未开放')">
      <img :src="bannerStrategy" alt="战略规划宣传横幅" draggable="false">
    </button>

    <!-- ============ 企业信息（无大标题，直接页签卡） ============ -->
    <section class="doc-section">
      <div class="doc-tabs" role="tablist">
        <button
          v-for="tab in docTabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="doc-tab"
          :class="{ active: activeDocTab === tab.key }"
          :aria-selected="activeDocTab === tab.key"
          @click="activeDocTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <ul class="doc-list">
        <li v-for="doc in activeDocs" :key="doc.id">
          <button type="button" class="doc-row" @click="showToast('公文详情暂未开放')">
            <span class="doc-row__dot" aria-hidden="true"></span>
            <span class="doc-row__main">
              <span class="doc-row__title">{{ doc.title }}</span>
              <span v-if="doc.docNo" class="doc-row__no">{{ doc.docNo }}</span>
            </span>
          </button>
        </li>
      </ul>
    </section>

    <!-- ============ 关于吉祥（标题在卡外） ============ -->
    <section class="about-section">
      <h2 class="section-title">关于吉祥</h2>
      <div class="about-card">
        <button type="button" class="culture-banner" @click="showToast('企业文化暂未开放')">
          <img :src="bannerCulture" alt="企业文化宣传横幅" draggable="false">
        </button>
        <div class="about-grid">
          <button v-for="(a, i) in aboutEntries" :key="a.key" type="button" class="about-item" @click="showToast(`${a.title}暂未开放`)">
            <img class="about-item__img" :src="aboutImgs[i]" :alt="a.title" draggable="false">
            <span class="about-item__title">{{ a.title }}</span>
            <span class="about-item__sub">{{ a.sub }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ============ 福利中心（两张彩色图片卡 + 更多） ============ -->
    <section class="welfare-section">
      <header class="section-head">
        <h2 class="section-title">福利中心</h2>
        <button type="button" class="section-more" @click="showToast('福利中心暂未开放')">更多</button>
      </header>
      <div class="welfare-grid">
        <button v-for="(w, i) in welfareCards" :key="w.key" type="button" class="welfare-card" @click="showToast(`${w.title}暂未开放`)">
          <img class="welfare-card__img" :src="welfareImgs[i]" :alt="w.title" draggable="false">
          <span class="welfare-card__title">{{ w.title }}</span>
        </button>
      </div>
    </section>

    <!-- ============ 如意商城（横向 3 卡：纯图片 + DOM 标题/价格） ============ -->
    <section class="mall-section">
      <header class="section-head">
        <h2 class="section-title">如意商城</h2>
        <button type="button" class="section-more" @click="showToast('如意商城暂未开放')">更多</button>
      </header>
      <div class="mall-scroll" role="region" aria-label="如意商城商品">
        <button v-for="(g, i) in mallGoods" :key="g.id" type="button" class="mall-card" @click="showToast('商品详情暂未开放')">
          <img class="mall-card__img" :src="goodsImgs[i]" :alt="g.title" draggable="false">
          <span class="mall-card__title">{{ g.title }}</span>
          <span class="mall-card__price">¥{{ g.price }}</span>
        </button>
      </div>
    </section>

    <!-- ============ 精品推荐（双列 4 卡：纯图片 + DOM 层级） ============ -->
    <section class="travel-section">
      <header class="section-head">
        <h2 class="section-title">精品推荐</h2>
        <button type="button" class="section-more" @click="showToast('精品推荐暂未开放')">更多</button>
      </header>
      <div class="travel-grid">
        <button v-for="(t, i) in travelPicks" :key="t.id" type="button" class="travel-card" @click="showToast('旅行产品暂未开放')">
          <img class="travel-card__img" :src="travelImgs[i]" :alt="t.title" draggable="false">
          <div class="travel-card__body">
            <span class="travel-card__title">{{ t.title }}</span>
            <span class="travel-card__tag">{{ t.tag }}</span>
            <span class="travel-card__price">{{ t.price }}</span>
          </div>
        </button>
      </div>
    </section>

    <div class="bottom-space"></div>

    <!-- ============ 搜索结果浮层（实时筛选分组） ============ -->
    <div v-if="isSearching" class="search-overlay" role="dialog" aria-label="搜索结果">
      <div class="search-result">
        <template v-for="group in searchGroups" :key="group.name">
          <div v-if="group.items.length > 0" class="search-group">
            <h3 class="search-group__name">{{ group.name }}</h3>
            <button
              v-for="item in group.items"
              :key="item.id"
              type="button"
              class="search-hit"
              @click="onSearchHit(item)"
            >
              <span class="search-hit__title">{{ item.title }}</span>
              <span class="search-hit__type">{{ group.name }}</span>
            </button>
          </div>
        </template>
        <div v-if="searchEmpty" class="search-empty">
          <BaseEmpty description="未找到相关内容" />
        </div>
      </div>
    </div>

    <!-- ============ 如意助手（画布水平居中胶囊，顶部/滚动两态） ============ -->
    <button
      type="button"
      class="ruyi-fab"
      :class="atTop ? 'is-at-top' : 'is-scrolled'"
      aria-label="如意助手"
      @click="ruyiOpen = !ruyiOpen"
    >
      <img class="ruyi-fab__avatar" :src="assistantAvatar" alt="" draggable="false">
      <span class="ruyi-fab__text">问问您的如意助手</span>
    </button>

    <!-- 如意助手结构性占位面板 -->
    <transition name="sheet-fade">
      <div v-if="ruyiOpen" class="ruyi-mask" role="dialog" aria-label="如意助手" @click="ruyiOpen = false">
        <div class="ruyi-panel" @click.stop>
          <div class="ruyi-panel__head">
            <span class="ruyi-panel__title">如意助手</span>
            <button type="button" class="ruyi-panel__close" aria-label="关闭" @click="ruyiOpen = false">✕</button>
          </div>
          <p class="ruyi-panel__desc">智能办公助手（原型占位）</p>
          <p class="ruyi-panel__hint">正式能力建设中：公文起草、日程安排、信息查询等能力将在此提供。</p>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="toastVisible" class="page-toast" role="status">{{ toastText }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import BaseEmpty from '../components/BaseEmpty.vue'
import heroArt from '../assets/home/hero-art.png'
import bannerStrategy from '../assets/home/banner-strategy.png'
import bannerCulture from '../assets/home/banner-culture.png'
import newsLogo from '../assets/home/news-logo.png'
import assistantAvatar from '../assets/home/assistant-avatar.png'
import goods1 from '../assets/home/goods-1.png'
import goods2 from '../assets/home/goods-2.png'
import goods3 from '../assets/home/goods-3.png'
import travel1 from '../assets/home/travel-1.png'
import travel2 from '../assets/home/travel-2.png'
import travel3 from '../assets/home/travel-3.png'
import travel4 from '../assets/home/travel-4.png'
import about1 from '../assets/home/about-1.png'
import about2 from '../assets/home/about-2.png'
import about3 from '../assets/home/about-3.png'
import welfare1 from '../assets/home/welfare-1.png'
import welfare2 from '../assets/home/welfare-2.png'
import ws00 from '../assets/icons/ws/ws-00.png'
import ws01 from '../assets/icons/ws/ws-01.png'
import ws02 from '../assets/icons/ws/ws-02.png'
import ws03 from '../assets/icons/ws/ws-03.png'
import ws04 from '../assets/icons/ws/ws-04.png'
import wsAll from '../assets/icons/ws/ws-all.png'
import {
  todoEntries,
  quickApps,
  docTabs,
  docLists,
  aboutEntries,
  welfareCards,
  mallGoods,
  travelPicks,
} from '../data/home'

const goodsImgs = [goods1, goods2, goods3]
const travelImgs = [travel1, travel2, travel3, travel4]
const aboutImgs = [about1, about2, about3]
const welfareImgs = [welfare1, welfare2]

/* 快捷应用：一行 5 项复用工作台 ws-00..04 图标（key→图标映射） */
const wsIconByKey = {
  meeting: ws00,
  contacts: ws01,
  process: ws02,
  activity: ws03,
  duty: ws04,
}
const quickAppsRow1 = quickApps
  .filter((a) => a.key !== 'all')
  .map((a) => ({ ...a, iconImg: wsIconByKey[a.key] }))

/* 四待办白色线稿图标 */
const todoIcons = {
  doc: 'M7 3h10v18H7zM10 7h4M10 11h4M10 15h4',
  flow: 'M4 5h5v5H4zM15 15h5v5h-5zM9.5 7.5H13v7.5M15 17.5h-2.5',
  cal: 'M5 6h14v14H5zM8 3v4M16 3v4M5 11h14M9 15h2M13 15h2',
  course: 'M3 9l9-5 9 5-9 5zM7 12v5c0 1.5 10 1.5 10 0v-5',
}

/* 已有一级功能真实路由；未知入口"暂未开放" */
const router = useRouter()
function onQuickApp(app) {
  if (app.key === 'contacts' || app.key === 'process' || app.key === 'all') {
    router.push('/workspace')
    return
  }
  showToast(`${app.label}暂未开放`)
}

/* 待办入口：今日日程 → /schedule；待办流程 → /workspace */
function onTodo(td) {
  if (td.key === 'schedule') { router.push('/schedule'); return }
  if (td.key === 'flow') { router.push('/workspace'); return }
  showToast(`${td.label}暂未开放`)
}

/* 企业信息页签 */
const activeDocTab = ref('company')
const activeDocs = computed(() => docLists[activeDocTab.value] ?? [])

/* 搜索：实时筛选快捷应用、企业信息与内容卡片，分组结果 */
const searchText = ref('')
const isSearching = computed(() => searchText.value.trim() !== '')
const searchGroups = computed(() => {
  const kw = searchText.value.trim().toLowerCase()
  if (!kw) return []
  const hit = (t) => t.toLowerCase().includes(kw)
  return [
    {
      name: '快捷应用',
      items: quickApps.filter((a) => hit(a.label)).map((a) => ({ id: a.key, title: a.label, kind: 'app', key: a.key })),
    },
    {
      name: '企业信息',
      items: Object.values(docLists).flat().filter((d) => hit(d.title)).map((d) => ({ id: d.id, title: d.title, kind: 'doc' })),
    },
    {
      name: '内容推荐',
      items: [
        ...aboutEntries.filter((a) => hit(a.title) || hit(a.sub)).map((a) => ({ id: a.key, title: a.title, kind: 'about' })),
        ...mallGoods.filter((g) => hit(g.title)).map((g) => ({ id: g.id, title: g.title, kind: 'goods' })),
        ...travelPicks.filter((t) => hit(t.title)).map((t) => ({ id: t.id, title: t.title, kind: 'travel' })),
      ],
    },
  ]
})
const searchEmpty = computed(() => isSearching.value && searchGroups.value.every((g) => g.items.length === 0))

function onSearchHit(item) {
  if (item.kind === 'app') onQuickApp({ key: item.key, label: item.title })
  else showToast(`${item.title}暂未开放`)
}

/* 如意助手 */
const ruyiOpen = ref(false)

/* 如意助手两态：IntersectionObserver 监听顶部 sentinel（非每帧 scroll） */
const topSentinel = ref(null)
const atTop = ref(true)
let io = null
onMounted(() => {
  if (!topSentinel.value || typeof IntersectionObserver === 'undefined') return
  io = new IntersectionObserver(
    (entries) => { atTop.value = entries[0].isIntersecting },
    { rootMargin: '0px', threshold: 0 },
  )
  io.observe(topSentinel.value)
})
onBeforeUnmount(() => { if (io) io.disconnect() })

/* 轻提示 */
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
.home-page {
  min-height: 100dvh;
  background: var(--n1);
}

/* 顶部 sentinel（不可见，仅用于两态判断） */
.top-sentinel {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

/* ============ 品牌区（渐变天空，全 DOM） ============ */
.hero {
  background: linear-gradient(180deg, #c796d3 0%, #d9bade 34%, #e9d2e6 62%, #f6e5ef 84%, #fdf2f7 100%);
  padding-top: calc(var(--safe-top) + 8px);
}
.hero__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px var(--gutter) 0;
}
.hero__city {
  color: #fff;
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.hero__icons {
  display: flex;
  gap: 6px;
}
.hero__icon-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.hero__icon-btn:active { opacity: 0.7; }
.hero__bell-badge {
  position: absolute;
  top: 4px;
  right: 0;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: var(--mr);
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  padding: 0 3px;
}
.hero__search {
  height: 36px;
  margin: 14px var(--gutter) 0;
  border-radius: var(--radius-pill);
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-shadow: 0 2px 10px rgba(120, 70, 110, 0.16);
}
.hero__search-icon { color: var(--n6); flex: none; margin-right: 7px; }
.hero__search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--t4-size);
  color: var(--n8);
  min-width: 0;
}
.hero__search-input::placeholder { color: var(--n5); }
.hero__search-clear {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--n5);
}

/* 四待办（品牌背景内：图标 + 角标气泡） */
.hero__todos {
  display: flex;
  padding: 18px var(--gutter) 6px;
}
.todo-item {
  flex: 1;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.todo-item:active { opacity: 0.7; }
.todo-item__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
}
.todo-item__icon {
  display: block;
}
.todo-item__badge {
  position: absolute;
  top: -7px;
  right: -14px;
  min-height: 18px;
  min-width: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--mr);
  color: #fff;
  font-size: var(--t2-size);
  line-height: 18px;
  text-align: center;
  font-weight: 500;
  box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.55);
  box-sizing: border-box;
}
.todo-item__label {
  font-size: var(--t2-size);
  line-height: var(--t3-line);
  color: #fff;
}

/* 品牌创意画面（纯视觉） */
.hero__art {
  display: block;
  width: 100%;
  height: auto;
}

/* ============ 快捷应用（白色连续区域） ============ */
.quick-apps {
  background: #fff;
  padding: 16px var(--gutter) 12px;
}
.quick-apps__row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-bottom: 12px;
}
.quick-apps__row:last-child { margin-bottom: 0; }
.qa-item {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.qa-item:active { opacity: 0.6; }
.qa-item__img {
  width: 42px;
  height: 42px;
  object-fit: contain;
  display: block;
}
.qa-item--all {
  grid-column: 1;
  align-items: flex-start;
  padding-left: 0;
}
.qa-item--all .qa-item__img,
.qa-item--all .qa-item__label {
  align-self: flex-start;
  margin-left: 14px;
}
.qa-item__label {
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--n8);
}

/* ============ i快讯资讯卡（白卡） ============ */
.news-card {
  display: flex;
  align-items: center;
  gap: 10px;
  width: calc(100% - var(--gutter) * 2);
  margin: var(--space-3) var(--gutter) 0;
  min-height: 52px;
  border-radius: var(--radius-card);
  background: var(--color-card-bg);
  padding: 8px 12px;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}
.news-card:active { opacity: 0.85; }
.news-card__logo {
  flex: none;
  height: 30px;
  width: auto;
  object-fit: contain;
  display: block;
}
.news-card__title {
  flex: 1;
  min-width: 0;
  text-align: left;
  color: var(--n8);
  font-size: var(--t3-size);
  line-height: var(--t4-line);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============ 运营横幅 ============ */
.ops-banner,
.culture-banner {
  display: block;
  margin: var(--space-3) var(--gutter) 0;
  border-radius: var(--radius-card);
  overflow: hidden;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
.ops-banner:active,
.culture-banner:active { opacity: 0.88; }
.ops-banner img,
.culture-banner img {
  display: block;
  width: 100%;
  height: auto;
}

/* ============ 通用 section ============ */
.section-title {
  font-size: var(--t6-size);
  line-height: var(--t6-line);
  font-weight: 500;
  color: var(--n8);
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}
.section-more {
  min-height: 44px;
  display: flex;
  align-items: center;
  font-size: var(--t3-size);
  color: var(--n6);
  background: transparent;
  padding: 0 4px;
  -webkit-tap-highlight-color: transparent;
}
.section-more:active { opacity: 0.6; }

/* ============ 企业信息（无大标题） ============ */
.doc-section {
  background: var(--color-card-bg);
  margin: var(--space-3) var(--gutter) 0;
  border-radius: var(--radius-card);
  padding: 10px 14px 4px;
}
.doc-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 4px;
}
.doc-tab {
  min-width: 0;
  min-height: 44px;
  padding: 0 4px;
  font-size: var(--t3-size);
  color: var(--n6);
  background: transparent;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-tap-highlight-color: transparent;
}
.doc-tab.active {
  color: var(--mr);
  background: #fde8f0;
  font-weight: 500;
}
.doc-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
  text-align: left;
  min-height: 44px;
  padding: 10px 0;
  background: transparent;
  border-bottom: 1px solid var(--n3);
  -webkit-tap-highlight-color: transparent;
}
.doc-list li:last-child .doc-row { border-bottom: none; }
.doc-row:active { opacity: 0.7; }
.doc-row__dot {
  flex: none;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--mr);
  margin: 8px 8px 0 0;
}
.doc-row__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.doc-row__title {
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: var(--n8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.doc-row__no {
  font-size: var(--t2-size);
  color: var(--n5);
}

/* ============ 关于吉祥（标题在卡外） ============ */
.about-section {
  margin: var(--space-3) var(--gutter) 0;
}
.about-section .section-title { margin-bottom: var(--space-2); }
.about-card {
  background: var(--color-card-bg);
  border-radius: var(--radius-card);
  padding: 12px;
}
.about-card .culture-banner {
  margin: 0 0 var(--space-3);
}
.about-grid {
  display: flex;
  gap: 10px;
}
.about-item {
  flex: 1;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.about-item:active { opacity: 0.7; }
.about-item__img {
  width: 100%;
  aspect-ratio: 288 / 210;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}
.about-item__title {
  margin-top: 4px;
  font-size: var(--t4-size);
  color: var(--n8);
}
.about-item__sub {
  font-size: var(--t2-size);
  color: var(--n6);
}

/* ============ 福利中心（图片卡） ============ */
.welfare-section {
  margin: var(--space-3) var(--gutter) 0;
}
.welfare-grid {
  display: flex;
  gap: 10px;
}
.welfare-card {
  flex: 1;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-card);
  overflow: hidden;
  padding: 0;
  background: var(--color-card-bg);
  -webkit-tap-highlight-color: transparent;
}
.welfare-card:active { opacity: 0.85; }
.welfare-card__img {
  width: 100%;
  aspect-ratio: 496 / 220;
  object-fit: cover;
  display: block;
}
.welfare-card__title {
  padding: 8px 10px 10px;
  text-align: left;
  font-size: var(--t4-size);
  color: var(--n8);
  font-weight: 500;
}

/* ============ 如意商城（横向滚动） ============ */
.mall-section {
  margin: var(--space-3) 0 0;
}
.mall-section .section-head { padding: 0 var(--gutter); }
.mall-scroll {
  display: flex;
  gap: 10px;
  padding: 2px var(--gutter) 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mall-scroll::-webkit-scrollbar { display: none; }
.mall-card {
  flex: none;
  width: 124px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  padding: 8px;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.mall-card:active { opacity: 0.75; }
.mall-card__img {
  width: 108px;
  height: 90px;
  border-radius: 6px;
  object-fit: cover;
  display: block;
}
.mall-card__title {
  margin-top: 6px;
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--n8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mall-card__price {
  margin-top: 2px;
  font-size: var(--t3-size);
  color: var(--mr);
  font-weight: 500;
}

/* ============ 精品推荐（N1 页面背景 + 四张独立白卡） ============ */
.travel-section {
  margin: var(--space-3) 0 0;
  padding: 12px var(--gutter) 14px;
}
.travel-section .section-head { padding: 0; }
.travel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.travel-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  text-align: left;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
.travel-card:active { opacity: 0.75; }
.travel-card__img {
  width: 100%;
  aspect-ratio: 480 / 260;
  object-fit: cover;
  display: block;
}
.travel-card__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px 10px;
}
.travel-card__title {
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: var(--n8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.travel-card__tag {
  align-self: flex-start;
  font-size: 10px;
  line-height: 14px;
  color: var(--color-brand-link);
  background: #e8f2fe;
  border-radius: 3px;
  padding: 0 4px;
}
.travel-card__price {
  font-size: var(--t4-size);
  color: var(--mr);
  font-weight: 500;
}

/* 底部避让：底栏 + 居中助手胶囊（44px 高 + 12px 上浮 + 12px 余量） */
.bottom-space { height: calc(var(--tabbar-total) + 68px); }

/* ============ 搜索结果浮层 ============ */
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-popup, 60);
  background: rgba(0, 0, 0, 0.25);
}
.search-result {
  position: absolute;
  top: calc(var(--safe-top) + 62px);
  left: var(--gutter);
  right: var(--gutter);
  max-height: 70vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 12px;
  padding: 8px 14px 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
}
.search-group__name {
  font-size: var(--t2-size);
  color: var(--n5);
  padding: 10px 0 2px;
}
.search-hit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-height: 44px;
  text-align: left;
  background: transparent;
  border-bottom: 1px solid var(--n2);
  -webkit-tap-highlight-color: transparent;
}
.search-hit:last-child { border-bottom: none; }
.search-hit:active { opacity: 0.7; }
.search-hit__title {
  flex: 1;
  min-width: 0;
  font-size: var(--t4-size);
  color: var(--n8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-hit__type {
  flex: none;
  font-size: var(--t2-size);
  color: var(--n5);
}
.search-empty {
  padding: 18px 0 6px;
}

/* ============ 如意助手（画布水平居中胶囊，两态） ============ */
.ruyi-fab {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: calc(var(--tabbar-total) + 12px);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 4px 18px 4px 5px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(50, 50, 51, 0.16);
  z-index: var(--z-fab);
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}
.ruyi-fab:active { transform: translateX(-50%) scale(0.96); }
.ruyi-fab__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  flex: none;
}
.ruyi-fab__text {
  color: #6b4ea8;
  background: linear-gradient(90deg, #5a7bd8, #d96b9e);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: var(--t4-size);
  font-weight: 500;
  white-space: nowrap;
}
/* 滚动态：仅背景半透明，文字与头像保持不透明可读 */
.ruyi-fab.is-scrolled {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 2px 10px rgba(50, 50, 51, 0.12);
}
@media (prefers-reduced-motion: reduce) {
  .ruyi-fab { transition: none; }
  .ruyi-fab:active { transform: translateX(-50%); }
}

.ruyi-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: var(--z-popup);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.ruyi-panel {
  width: 100%;
  max-width: 480px;
  background: var(--color-card-bg);
  border-radius: 16px 16px 0 0;
  padding: 16px 16px calc(16px + var(--safe-bottom));
}
.ruyi-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ruyi-panel__title {
  font-size: var(--t7-size);
  font-weight: 500;
  color: var(--n8);
}
.ruyi-panel__close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--n2);
  color: var(--n6);
  -webkit-tap-highlight-color: transparent;
}
.ruyi-panel__desc {
  margin-top: 10px;
  font-size: var(--t5-size);
  color: var(--n8);
}
.ruyi-panel__hint {
  margin-top: 6px;
  font-size: var(--t3-size);
  color: var(--n6);
  line-height: var(--t3-line);
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
.sheet-fade-enter-active,
.sheet-fade-leave-active { transition: opacity 0.18s ease; }
.sheet-fade-enter-from,
.sheet-fade-leave-to { opacity: 0; }
</style>
