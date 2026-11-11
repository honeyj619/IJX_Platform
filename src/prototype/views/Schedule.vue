<template>
  <div class="schedule-page">
    <!-- 顶部一级标签：日程 / 任务 -->
    <div class="main-tabs" role="tablist">
      <button
        v-for="t in mainTabs"
        :key="t.key"
        type="button"
        role="tab"
        class="main-tab"
        :class="{ active: activeView === t.key }"
        :aria-selected="activeView === t.key"
        @click="activeView = t.key"
      >
        {{ t.label }}
        <span class="main-tab__underline"></span>
      </button>
    </div>

    <!-- ============ 日程视图 ============ -->
    <section v-if="activeView === 'schedule'" class="schedule-view">
      <div class="cal-card">
        <header class="cal-head">
          <h1 class="cal-title">{{ viewYear }}年{{ viewMonth }}月</h1>
          <button type="button" class="today-btn" @click="goToday">今天</button>
        </header>

        <div class="weekdays">
          <span v-for="w in weekdays" :key="w" class="weekday">{{ w }}</span>
        </div>

        <div class="days">
          <button
            v-for="cell in calendarCells"
            :key="cell.key"
            type="button"
            class="day"
            :class="{
              'is-other': !cell.inMonth,
              'is-selected': cell.key === selectedKey
            }"
            @click="selectCell(cell)"
          >
            <span class="day-inner">
              <span class="day-num">{{ cell.day }}</span>
              <span class="day-sub" :class="cell.sub.type">{{ cell.sub.text }}</span>
            </span>
            <span v-if="cell.hasEvent" class="event-dot"></span>
          </button>
        </div>
      </div>

      <div class="cal-spacer"></div>

      <div class="deco-block">
        <img :src="decoImg" alt="" draggable="false">
      </div>
    </section>

    <!-- ============ 任务视图 ============ -->
    <section v-else class="task-view">
      <div class="task-seg" role="tablist">
        <button
          type="button"
          role="tab"
          class="seg"
          :class="{ active: taskFilter === 'pending' }"
          :aria-selected="taskFilter === 'pending'"
          @click="taskFilter = 'pending'"
        >
          待处理 {{ pendingTasks.length }}
        </button>
        <button
          type="button"
          role="tab"
          class="seg"
          :class="{ active: taskFilter === 'done' }"
          :aria-selected="taskFilter === 'done'"
          @click="taskFilter = 'done'"
        >
          已处理 {{ doneTasks.length }}
        </button>
      </div>

      <!-- 待处理：由数组派生（空状态 / 列表） -->
      <div v-if="taskFilter === 'pending' && pendingTasks.length === 0" class="task-empty">
        <img class="task-empty__img" :src="decoImg" alt="" draggable="false">
        <p class="task-empty__text">暂无数据</p>
      </div>
      <ul v-else-if="taskFilter === 'pending'" class="task-list">
        <li v-for="task in pendingTasks" :key="task.id" class="task-card">
          <span class="task-card__pending-dot" aria-hidden="true"></span>
          <div class="task-card__body">
            <p class="task-card__title">{{ task.title }}</p>
            <p v-if="task.remind" class="task-card__remind">提醒我:{{ task.remind }}</p>
          </div>
        </li>
      </ul>

      <!-- 已处理：7 条任务列表 -->
      <ul v-else class="task-list">
        <li v-for="task in doneTasks" :key="task.id" class="task-card">
          <span class="task-card__check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="2.4"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <div class="task-card__body">
            <p class="task-card__title">{{ task.title }}</p>
            <p v-if="task.creator" class="task-card__meta">创建人:{{ task.creator }}</p>
            <p v-if="task.participants" class="task-card__meta">参与人:{{ task.participants }}</p>
            <p v-if="task.remind" class="task-card__remind">提醒我:{{ task.remind }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- 悬浮新增按钮 -->
    <button type="button" class="fab" aria-label="新增日程或任务" @click="openCreateForm">
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path d="M12 5v14M5 12h14" fill="none" stroke="#fff" stroke-width="2.2"
              stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 选中日日程列表（新建日程的可见反馈） -->
    <section v-if="activeView === 'schedule' && dayScheduleList.length > 0" class="day-list">
      <h2 class="day-list__title">{{ selectedKeyLabel }} 日程</h2>
      <ul>
        <li v-for="item in dayScheduleList" :key="item.id" class="day-list__item">
          <span class="day-list__time">{{ item.time }}</span>
          <span class="day-list__name">{{ item.title }}</span>
        </li>
      </ul>
    </section>

    <!-- ============ 新建底部表单（日程 / 任务） ============ -->
    <transition name="sheet-fade">
      <div v-if="formOpen" class="form-mask" role="dialog" :aria-label="formMode === 'schedule' ? '新建日程' : '新建任务'" @click="closeForm">
        <div class="form-sheet" @click.stop>
          <div class="form-sheet__head">
            <h3 class="form-sheet__title">{{ formMode === 'schedule' ? '新建日程' : '新建任务' }}</h3>
            <button type="button" class="form-sheet__close" aria-label="关闭" @click="closeForm">✕</button>
          </div>

          <!-- 日程字段：标题、日期、时间 -->
          <template v-if="formMode === 'schedule'">
            <label class="form-field">
              <span class="form-field__label">标题 <b class="req">*</b></span>
              <input
                v-model.trim="form.title"
                type="text"
                class="form-field__input"
                :class="{ 'is-error': form.title === '' && formTouched }"
                placeholder="请输入日程标题"
                aria-label="日程标题"
              >
              <span v-if="form.title === '' && formTouched" class="form-field__error">请填写标题</span>
            </label>
            <label class="form-field">
              <span class="form-field__label">日期 <b class="req">*</b></span>
              <input
                v-model="form.date"
                type="date"
                class="form-field__input"
                :class="{ 'is-error': !form.date && formTouched }"
                aria-label="日程日期"
              >
              <span v-if="!form.date && formTouched" class="form-field__error">请选择日期</span>
            </label>
            <label class="form-field">
              <span class="form-field__label">时间 <b class="req">*</b></span>
              <input
                v-model="form.time"
                type="time"
                class="form-field__input"
                :class="{ 'is-error': !form.time && formTouched }"
                aria-label="日程时间"
              >
              <span v-if="!form.time && formTouched" class="form-field__error">请选择时间</span>
            </label>
          </template>

          <!-- 任务字段：标题、提醒时间 -->
          <template v-else>
            <label class="form-field">
              <span class="form-field__label">标题 <b class="req">*</b></span>
              <input
                v-model.trim="form.title"
                type="text"
                class="form-field__input"
                :class="{ 'is-error': form.title === '' && formTouched }"
                placeholder="请输入任务标题"
                aria-label="任务标题"
              >
              <span v-if="form.title === '' && formTouched" class="form-field__error">请填写标题</span>
            </label>
            <label class="form-field">
              <span class="form-field__label">提醒时间</span>
              <input
                v-model="form.time"
                type="time"
                class="form-field__input"
                aria-label="提醒时间"
              >
            </label>
          </template>

          <div class="form-actions">
            <button type="button" class="form-cancel" @click="closeForm">取消</button>
            <button type="button" class="form-submit" :disabled="submitting" @click="submitForm">
              {{ submitting ? '提交中…' : '提交' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 恢复演示数据入口 -->
    <button v-if="hasUserAdded" type="button" class="reset-demo" @click="resetDemoData">恢复演示数据</button>

    <transition name="toast">
      <div v-if="toastVisible" class="page-toast" role="status">{{ toastText }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import decoImg from '../assets/empty/schedule-deco.png'

/* ---------------- 一级标签 ---------------- */
const mainTabs = [
  { key: 'schedule', label: '日程' },
  { key: 'task', label: '任务' }
]
const activeView = ref('schedule')

/* ---------------- 日历 ---------------- */
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 原型基准：2026 年 11 月；今天 = 5 日
const PROTO_YEAR = 2026
const PROTO_MONTH = 11
const PROTO_DAY = 5

const viewYear = ref(PROTO_YEAR)
const viewMonth = ref(PROTO_MONTH)
const selectedKey = ref(`${PROTO_YEAR}-${PROTO_MONTH}-${PROTO_DAY}`)

// 当月农历日名
const lunarNames = {
  1: '廿三', 2: '廿四', 3: '廿五', 4: '廿六', 5: '廿七', 6: '廿八',
  8: '三十', 9: '十月', 10: '初二', 12: '初四', 13: '初五', 14: '初六',
  15: '初七', 16: '初八', 17: '初九', 18: '初十', 19: '十一', 20: '十二',
  21: '十三', 23: '十五', 24: '十六', 25: '十七', 27: '十九', 28: '二十',
  29: '廿一', 30: '廿二'
}
// 蓝色节气
const solarTerms = {
  '11-7': '立冬',
  '11-22': '小雪'
}
// 灰色节日
const festivals = {
  '11-11': '光棍节',
  '11-26': '感恩节'
}
// 事件点（响应式：新建日程同步显示）
const eventDays = ref({
  11: [3, 10, 12, 17, 19, 24, 26],
  12: [1, 3]
})
// 12 月溢出日的农历
const decemberLunar = { 1: '廿三', 2: '廿四', 3: '廿五', 4: '廿六', 5: '廿七' }

const calendarCells = computed(() => {
  const y = viewYear.value
  const m = viewMonth.value
  const firstWeekday = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()

  const cells = []

  // 上月溢出
  const prevYear = m === 1 ? y - 1 : y
  const prevMonth = m === 1 ? 12 : m - 1
  const prevDays = new Date(prevYear, prevMonth, 0).getDate()
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = prevDays - i
    cells.push(buildCell(prevYear, prevMonth, d, false))
  }

  // 当月
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(buildCell(y, m, d, true))
  }

  // 下月溢出，补齐整行
  const nextYear = m === 12 ? y + 1 : y
  const nextMonth = m === 12 ? 1 : m + 1
  let nd = 1
  while (cells.length % 7 !== 0) {
    cells.push(buildCell(nextYear, nextMonth, nd++, false))
  }

  return cells
})

function buildCell(y, m, d, inMonth) {
  const mmdd = `${m}-${d}`
  let sub = { text: '', type: 'lunar' }

  if (solarTerms[mmdd]) {
    sub = { text: solarTerms[mmdd], type: 'solar' }
  } else if (festivals[mmdd]) {
    sub = { text: festivals[mmdd], type: 'festival' }
  } else if (m === 11 && lunarNames[d]) {
    sub = { text: lunarNames[d], type: 'lunar' }
  } else if (m === 12 && decemberLunar[d]) {
    sub = { text: decemberLunar[d], type: 'lunar' }
  }

  return {
    key: `${y}-${m}-${d}`,
    year: y,
    month: m,
    day: d,
    inMonth,
    sub,
    hasEvent: (eventDays.value[m] || []).includes(d)
  }
}

function selectCell(cell) {
  if (!cell.inMonth) {
    viewYear.value = cell.year
    viewMonth.value = cell.month
  }
  selectedKey.value = cell.key
}

function goToday() {
  viewYear.value = PROTO_YEAR
  viewMonth.value = PROTO_MONTH
  selectedKey.value = `${PROTO_YEAR}-${PROTO_MONTH}-${PROTO_DAY}`
}

/* ---------------- 任务 ---------------- */
const taskFilter = ref('pending')

const pendingTasks = ref([])

const doneTasks = ref([
  { id: 1, title: '确认poc参与方', remind: '2026-03-26 14:30' },
  { id: 2, title: '通知poc线下安排', remind: '2026-03-31 16:33' },
  { id: 3, title: 'i吉祥push流程地址修改', remind: '2026-04-01 09:43' },
  { id: 4, title: 'i吉祥日程需求设计', creator: '肖林川', participants: '梁劼√' },
  { id: 5, title: '运维需求沟通', remind: '2024-07-12 09:22' },
  { id: 6, title: '三季度绩效', remind: '2024-07-10 13:20' },
  { id: 7, title: '酒店公寓项目结项材料', participants: '梁劼√', remind: '2024-05-27 10:10' }
])

/* ---------------- FAB / 新建闭环 / 轻提示 ---------------- */
const formOpen = ref(false)
const formMode = ref('schedule') // 'schedule' | 'task'
const formTouched = ref(false)
const submitting = ref(false)
const hasUserAdded = ref(false)

const form = ref({ title: '', date: '', time: '' })

/* 用户新建的日程项（选中日列表反馈） */
const userSchedules = ref([])
/* 选中日的可读标签 */
const selectedKeyLabel = computed(() => {
  const [y, m, d] = selectedKey.value.split('-').map(Number)
  return `${y}年${m}月${d}日`
})
const dayScheduleList = computed(() =>
  userSchedules.value.filter((s) => s.key === selectedKey.value)
    .map((s) => ({ id: s.id, time: s.time, title: s.title })),
)

function openCreateForm() {
  formMode.value = activeView.value === 'schedule' ? 'schedule' : 'task'
  form.value = {
    title: '',
    date: formMode.value === 'schedule' ? defaultScheduleDate() : '',
    time: '',
  }
  formTouched.value = false
  formOpen.value = true
}

/* 日程默认日期 = 当前选中日（演示月内） */
function defaultScheduleDate() {
  const [y, m, d] = selectedKey.value.split('-').map(Number)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function closeForm() {
  if (submitting.value) return
  formOpen.value = false
}

function submitForm() {
  formTouched.value = true
  const { title, date, time } = form.value
  if (formMode.value === 'schedule') {
    if (!title || !date || !time) return
  } else if (!title) {
    return
  }
  submitting.value = true
  // 模拟提交延迟
  setTimeout(() => {
    if (formMode.value === 'schedule') {
      const [y, m, d] = date.split('-').map(Number)
      const key = `${y}-${m}-${d}`
      userSchedules.value.push({ id: Date.now(), key, title, time })
      const days = eventDays.value[m] || []
      if (!days.includes(d)) {
        eventDays.value = { ...eventDays.value, [m]: [...days, d] }
      }
      // 选中并跳到该日，直接看到反馈
      viewYear.value = y
      viewMonth.value = m
      selectedKey.value = key
      showToast('日程创建成功')
    } else {
      const remind = time ? `2026-11-05 ${time}` : ''
      pendingTasks.value.push({ id: Date.now(), title, remind, userAdded: true })
      showToast('任务创建成功')
    }
    hasUserAdded.value = true
    submitting.value = false
    formOpen.value = false
  }, 600)
}

/* 恢复演示数据：清除用户新增，回到基线 */
function resetDemoData() {
  pendingTasks.value = pendingTasks.value.filter((t) => !t.userAdded)
  userSchedules.value = []
  eventDays.value = {
    11: [3, 10, 12, 17, 19, 24, 26],
    12: [1, 3]
  }
  hasUserAdded.value = false
  goToday()
  showToast('已恢复演示数据')
}

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
.schedule-page {
  min-height: 100dvh;
  background: var(--n1);
}

/* ============ 顶部一级标签 ============ */
.main-tabs {
  display: flex;
  background: var(--n1);
  padding-top: var(--safe-top);
}
.main-tab {
  flex: 1;
  position: relative;
  height: var(--navbar-height);
  font-size: var(--t6-size);
  line-height: var(--t6-line);
  color: var(--n7);
  -webkit-tap-highlight-color: transparent;
}
.main-tab.active {
  color: var(--n8);
  font-weight: 500;
}
.main-tab__underline {
  position: absolute;
  left: 50%;
  bottom: 7px;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--mr);
  transform: translateX(-50%) scaleX(0);
  transition: transform 0.2s ease;
}
.main-tab.active .main-tab__underline {
  transform: translateX(-50%) scaleX(1);
}

/* ============ 日程视图 ============ */
.schedule-view {
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - var(--navbar-height) - var(--safe-top));
}

.cal-card {
  background: var(--color-card-bg);
  padding: 0 var(--gutter);
}
.cal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 10px;
}
.cal-title {
  font-size: var(--t8-size);
  line-height: var(--t8-line);
  font-weight: var(--t8-weight);
  color: var(--n8);
}
.today-btn {
  font-size: var(--t5-size);
  color: #4177cf;
  padding: 4px 2px;
  -webkit-tap-highlight-color: transparent;
}
.today-btn:active { opacity: 0.6; }

.weekdays {
  display: flex;
  padding: 6px 0 4px;
}
.weekday {
  flex: 1;
  text-align: center;
  font-size: var(--t2-size);
  line-height: var(--t2-line);
  color: var(--n6);
}

.days {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 6px;
}
.day {
  width: calc(100% / 7);
  min-height: 58px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 6px;
  -webkit-tap-highlight-color: transparent;
}
.day-inner {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.day.is-selected .day-inner {
  background: var(--mr);
}
.day-num {
  font-size: 16px;
  line-height: 19px;
  color: var(--n8);
}
.day-sub {
  font-size: 10px;
  line-height: 13px;
  color: #bfc2c8;
  margin-top: 1px;
}
.day-sub.solar { color: #4177cf; }
.day-sub.festival { color: #b4b6bb; }

.day.is-other .day-num { color: #c1c3c9; }
.day.is-other .day-sub { color: #d4d6db; }
.day.is-other .day-sub.solar { color: #a9c2f0; }

.day.is-selected .day-num,
.day.is-selected .day-sub { color: #fff; }

.event-dot {
  width: 5px;
  height: 5px;
  margin-top: 3px;
  border-radius: 50%;
  background: var(--mr);
}

.cal-spacer { flex: 1; min-height: 24px; }

.deco-block {
  display: flex;
  justify-content: center;
  padding-bottom: calc(var(--tabbar-total) + 12px);
}
.deco-block img {
  width: 205px;
  height: auto;
}

/* ============ 任务视图 ============ */
.task-view {
  padding-bottom: calc(var(--tabbar-total) + 72px);
}

.task-seg {
  display: flex;
  gap: 12px;
  padding: 12px var(--gutter) 4px;
}
.seg {
  min-width: 132px;
  padding: 9px 0;
  border-radius: var(--radius-pill);
  font-size: 15px;
  line-height: 20px;
  background: var(--n2);
  color: var(--n6);
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s ease, color 0.2s ease;
}
.seg.active {
  background: #fde7f0;
  color: #c42e63;
  font-weight: 500;
}
.seg:active { opacity: 0.75; }

.task-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 22vh;
}
.task-empty__img {
  width: 205px;
  height: auto;
}
.task-empty__text {
  margin-top: 14px;
  font-size: var(--t6-size);
  line-height: var(--t6-line);
  color: var(--n6);
}

.task-list {
  margin-top: 10px;
}
.task-card {
  display: flex;
  align-items: flex-start;
  background: var(--color-card-bg);
  padding: 15px var(--gutter);
  margin-bottom: 8px;
}
.task-card__check {
  flex: none;
  width: 24px;
  height: 24px;
  margin-top: 1px;
  border-radius: 50%;
  background: var(--mr);
  display: flex;
  align-items: center;
  justify-content: center;
}
.task-card__body {
  margin-left: 12px;
  min-width: 0;
}
.task-card__title {
  font-size: var(--t5-size);
  line-height: var(--t5-line);
  color: var(--n8);
}
.task-card__meta {
  margin-top: 9px;
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--n6);
}
.task-card__remind {
  margin-top: 9px;
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: #bd9a72;
}

/* ============ FAB ============ */
.fab {
  position: fixed;
  bottom: calc(var(--tabbar-total) + 10px);
  right: max(12px, calc((100vw - 480px) / 2 + 12px));
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #c49f73;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(160, 124, 80, 0.35);
  z-index: var(--z-fab);
  -webkit-tap-highlight-color: transparent;
}
.fab:active { transform: scale(0.94); }

/* ============ 轻提示 ============ */
.page-toast {
  position: fixed;
  left: 50%;
  bottom: calc(var(--tabbar-total) + 76px);
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

/* ============ 待处理任务卡（新增闭环） ============ */
.task-card__pending-dot {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--color-brand-primary-strong, #c9a25e);
  margin-right: 10px;
  margin-top: 2px;
}

/* ============ 选中日日程列表 ============ */
.day-list {
  margin: 12px var(--gutter) 0;
  background: var(--color-card-bg);
  border-radius: var(--radius-card);
  padding: 12px 14px;
}
.day-list__title {
  font-size: var(--t5-size);
  font-weight: 500;
  color: var(--n8);
  margin-bottom: 4px;
}
.day-list__item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  border-bottom: 1px solid var(--n3);
  font-size: var(--t4-size);
}
.day-list__item:last-child { border-bottom: none; }
.day-list__time {
  flex: none;
  color: var(--mr);
  font-weight: 500;
}
.day-list__name {
  flex: 1;
  min-width: 0;
  color: var(--n8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============ 新建底部表单 ============ */
.form-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: var(--z-popup);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.form-sheet {
  width: 100%;
  max-width: 480px;
  background: var(--color-card-bg);
  border-radius: 16px 16px 0 0;
  padding: 16px 16px calc(16px + var(--safe-bottom));
}
.form-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.form-sheet__title {
  font-size: var(--t7-size);
  font-weight: 500;
  color: var(--n8);
}
.form-sheet__close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--n2);
  color: var(--n6);
}
.form-field {
  display: block;
  padding: 8px 0;
}
.form-field__label {
  display: block;
  font-size: var(--t3-size);
  color: var(--n6);
  margin-bottom: 6px;
}
.form-field__label .req { color: var(--mr); font-weight: 500; }
.form-field__input {
  width: 100%;
  height: 44px;
  border: 1px solid var(--n3);
  border-radius: 10px;
  background: #fff;
  padding: 0 12px;
  font-size: var(--t5-size);
  color: var(--n8);
  outline: none;
}
.form-field__input.is-error { border-color: var(--mr); }
.form-field__error {
  display: block;
  margin-top: 4px;
  font-size: var(--t2-size);
  color: var(--mr);
}
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.form-cancel,
.form-submit {
  flex: 1;
  min-height: 44px;
  border-radius: var(--radius-pill);
  font-size: var(--t5-size);
  -webkit-tap-highlight-color: transparent;
}
.form-cancel {
  background: var(--n2);
  color: var(--n7);
}
.form-submit {
  background: var(--color-brand-primary-strong, #c9a25e);
  color: #fff;
  font-weight: 500;
}
.form-submit:disabled { opacity: 0.6; }
.form-cancel:active,
.form-submit:active { opacity: 0.8; }

/* ============ 恢复演示数据 ============ */
.reset-demo {
  display: block;
  margin: 14px var(--gutter) 0;
  width: calc(100% - var(--gutter) * 2);
  min-height: 44px;
  border-radius: var(--radius-card);
  background: var(--color-card-bg);
  border: 1px dashed var(--n4, #c8c8cc);
  color: var(--n6);
  font-size: var(--t4-size);
  -webkit-tap-highlight-color: transparent;
}
.reset-demo:active { opacity: 0.7; }

.sheet-fade-enter-active,
.sheet-fade-leave-active { transition: opacity 0.18s ease; }
.sheet-fade-enter-from,
.sheet-fade-leave-to { opacity: 0; }
</style>
