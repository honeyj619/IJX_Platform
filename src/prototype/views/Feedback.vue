<template>
  <div class="feedback-page">
    <BaseNavBar title="帮助与反馈" show-back back-text="我的" @back="goBack" />

    <div class="fb-scroll">
      <!-- 反馈当前页面（来路页面上下文卡） -->
      <section v-if="entryPageContext" class="fb-card fb-entry" aria-label="反馈当前页面">
        <div class="fb-entry__head">
          <span class="fb-entry__pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 12 4.5 6.5 6.5 0 0 1 18.5 11c0 4.6-6.5 10-6.5 10z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>
          </span>
          <div class="fb-entry__info">
            <p class="fb-entry__title">反馈当前页面</p>
            <p class="fb-entry__path">{{ entryPageContext.path }}</p>
          </div>
          <button v-if="relatedPage" type="button" class="fb-entry__clear" aria-label="取消关联当前页面" @click="relatedPage = null">取消关联</button>
        </div>
        <button type="button" class="fb-btn fb-btn--primary" @click="useEntryPage">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 20.5s-7-5.9-7-11a7 7 0 0 1 14 0c0 5.1-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>
          关联此页面并填写反馈
        </button>
      </section>

      <!-- 我要反馈（表单） -->
      <section class="fb-card" aria-label="我要反馈">
        <p class="fb-card__title">我要反馈</p>

        <label class="fb-label">相关页面</label>
        <div v-if="relatedPage" class="fb-related">
          <span class="fb-related__pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 12 4.5 6.5 6.5 0 0 1 18.5 11c0 4.6-6.5 10-6.5 10z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>
          </span>
          <span class="fb-related__body">
            <span class="fb-related__title">{{ relatedPage.title }}</span>
            <span class="fb-related__path">{{ relatedPage.path }}</span>
          </span>
          <button type="button" class="fb-related__remove" aria-label="移除页面关联" @click="relatedPage = null">×</button>
        </div>
        <div v-else class="fb-related fb-related--empty">未关联具体页面</div>

        <label class="fb-label" for="fb-category">反馈类型</label>
        <div id="fb-category" class="fb-chips" role="group" aria-label="反馈类型">
          <button v-for="item in categories" :key="item" type="button" class="fb-chip" :class="{ active: category === item }" @click="category = item">{{ item }}</button>
        </div>

        <label class="fb-label" for="fb-content">反馈内容 <span class="fb-required">*</span></label>
        <textarea id="fb-content" v-model="content" class="fb-textarea" rows="4" maxlength="1000" placeholder="请描述遇到的问题、发生场景或希望改进的地方"></textarea>
        <p class="fb-count">{{ content.length }}/1000</p>

        <p v-if="error" class="fb-error" role="alert">{{ error }}</p>

        <button type="button" class="fb-btn fb-btn--primary" :disabled="submitting" @click="submit">
          {{ submitting ? '提交中…' : '提交反馈' }}
        </button>
        <p class="fb-hint">页面与 App 环境将自动随反馈提交</p>
      </section>

      <!-- 我的反馈 -->
      <section class="fb-card" aria-label="我的反馈">
        <div class="fb-mine__head">
          <p class="fb-card__title">我的反馈</p>
          <span class="fb-mine__count">共 {{ records.length }} 条</span>
        </div>
        <div v-if="records.length" class="fb-mine__list">
          <button v-for="record in records" :key="record.id" type="button" class="fb-mine__item" @click="openDetail(record.id)">
            <div class="fb-mine__meta">
              <span class="fb-mine__no">{{ record.feedbackNo }}</span>
              <span class="fb-mine__cat">{{ record.category }}</span>
              <span class="fb-mine__status" :class="`is-${statusKey(record.status)}`">{{ record.status }}</span>
            </div>
            <p class="fb-mine__content">{{ record.content }}</p>
            <p class="fb-mine__foot">
              <span>{{ record.source }}</span>
              <span class="fb-mine__sep">·</span>
              <span>{{ record.createdAt }}</span>
            </p>
          </button>
        </div>
        <p v-else class="fb-mine__empty">暂无反馈记录</p>
      </section>

      <div class="bottom-space"></div>
    </div>

    <transition name="toast">
      <div v-if="toastVisible" class="page-toast" role="status">{{ toastText }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseNavBar from '../components/BaseNavBar.vue'
import { FEEDBACK_RECORDS_EVENT, getFeedbackRecords, createFeedback, createFeedbackRequestId, captureFeedbackPageContext } from '../../data/feedback'
import { getLastBusinessPage } from '../../utils/feedbackPageContext'

const route = useRoute()
const router = useRouter()

const categories = ['功能异常', '使用咨询', '体验建议', '其他']

/* 默认关联页面：优先「最近业务页面」（App.vue 全局记录），无记录回退「我的」页 */
const entryPageContext = ref(null)
const relatedPage = ref(null)
const category = ref('功能异常')
const content = ref('')
const error = ref('')
const submitting = ref(false)
const records = ref([])
let requestId = ''

/** 演示平台：platform 参数识别 iOS/Android（默认 ios） */
function detectPlatform() {
  const p = (route.query.platform || '') + ''
  if (p === 'android') return 'android'
  if (p === 'ios') return 'ios'
  return 'ios'
}

function buildEntryContext() {
  // 1) 最近业务页面（排除 /profile、反馈页自身，App.vue watch 全局记录）
  const last = getLastBusinessPage()
  if (last && last.path && !last.path.startsWith('/profile')) {
    return captureFeedbackPageContext(last.title, last.path, 'APP', detectPlatform())
  }
  // 2) 无业务页面记录才回退「我的」
  return captureFeedbackPageContext('我的', '/profile', 'APP', detectPlatform())
}

onMounted(() => {
  const context = buildEntryContext()
  entryPageContext.value = context
  relatedPage.value = context
  records.value = getFeedbackRecords()
  requestId = createFeedbackRequestId('app-feedback')
  window.addEventListener(FEEDBACK_RECORDS_EVENT, refreshRecords)
})

onUnmounted(() => {
  window.removeEventListener(FEEDBACK_RECORDS_EVENT, refreshRecords)
})

function refreshRecords() {
  records.value = getFeedbackRecords()
}

function goBack() {
  if (window.history.state && window.history.state.back) router.back()
  else router.push('/profile')
}

/** 「关联此页面并填写反馈」：将默认业务页面设为相关页面 */
function useEntryPage() {
  if (!entryPageContext.value) return
  relatedPage.value = entryPageContext.value
}

/** 我的反馈列表项 → 反馈详情 */
function openDetail(feedbackId) {
  router.push(`/profile/feedback/${feedbackId}`)
}

function statusKey(status) {
  if (status === '待处理') return 'pending'
  if (status === '处理中') return 'doing'
  return 'done'
}

function submit() {
  if (!content.value.trim()) {
    error.value = '请填写具体的反馈内容'
    return
  }
  submitting.value = true
  try {
    const record = createFeedback({
      category: category.value,
      content: content.value,
      source: 'App我的-帮助与反馈',
      clientKind: 'APP',
      platform: detectPlatform(),
      clientVersion: 'i吉祥 2.3.6',
      clientRequestId: requestId,
      pageContext: relatedPage.value,
    })
    // 提交成功后重置表单，展示新记录
    content.value = ''
    error.value = ''
    relatedPage.value = entryPageContext.value
    requestId = createFeedbackRequestId('app-feedback')
    refreshRecords()
    showToast(`反馈已提交：${record.feedbackNo}`)
  } catch {
    error.value = '提交失败，当前内容已保留，请重试'
  } finally {
    submitting.value = false
  }
}

/* 轻提示（与 Profile 页一致） */
const toastVisible = ref(false)
const toastText = ref('')
let toastTimer = null
function showToast(text) {
  toastText.value = text
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 1800)
}
</script>

<style scoped>
.feedback-page {
  min-height: 100dvh;
  background: var(--n1);
  display: flex;
  flex-direction: column;
}

.fb-scroll {
  flex: 1;
  overflow-y: auto;
}

.fb-card {
  background: var(--color-card-bg);
  margin: var(--space-3) var(--gutter) 0;
  border-radius: var(--radius-card);
  padding: 14px;
}
.fb-card__title {
  font-size: var(--t6-size);
  line-height: var(--t6-line);
  font-weight: 500;
  color: var(--n8);
}

/* ============ 反馈当前页面 ============ */
.fb-entry {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.fb-entry__head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.fb-entry__pin {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(245, 58, 113, 0.08);
  color: var(--mr);
  display: flex;
  align-items: center;
  justify-content: center;
}
.fb-entry__info {
  flex: 1;
  min-width: 0;
}
.fb-entry__title {
  font-size: var(--t5-size);
  line-height: var(--t5-line);
  font-weight: 500;
  color: var(--n8);
}
.fb-entry__path {
  margin-top: 3px;
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--n6);
  word-break: break-all;
}
.fb-entry__clear {
  flex: none;
  font-size: var(--t3-size);
  color: var(--n6);
  padding: 2px 4px;
  -webkit-tap-highlight-color: transparent;
}
.fb-entry__clear:active { opacity: 0.6; }

/* ============ 按钮 ============ */
.fb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  border-radius: var(--radius-pill);
  font-size: var(--t5-size);
  line-height: var(--t5-line);
  -webkit-tap-highlight-color: transparent;
  width: 100%;
}
.fb-btn--primary {
  background: var(--mr);
  color: #fff;
  font-weight: 500;
}
.fb-btn--primary:active { background: var(--color-brand-primary-strong); }
.fb-btn--primary:disabled {
  background: rgba(245, 58, 113, 0.3);
  color: rgba(255, 255, 255, 0.7);
  cursor: not-allowed;
}

/* ============ 表单 ============ */
.fb-label {
  display: block;
  margin: 14px 0 8px;
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: var(--n7);
}
.fb-required { color: var(--color-functional-danger); }

.fb-related {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--n3);
  border-radius: var(--radius-sm);
  background: var(--n2);
  padding: 9px 10px;
}
.fb-related--empty {
  color: var(--n6);
  font-size: var(--t4-size);
  border-style: dashed;
}
.fb-related__pin {
  flex: none;
  color: var(--mr);
  display: flex;
}
.fb-related__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fb-related__title {
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: var(--n8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fb-related__path {
  font-size: var(--t2);
  line-height: 16px;
  color: var(--n6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fb-related__remove {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--n4);
  color: #fff;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.fb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.fb-chip {
  padding: 5px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--n3);
  background: var(--color-card-bg);
  color: var(--n7);
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  -webkit-tap-highlight-color: transparent;
}
.fb-chip.active {
  border-color: var(--mr);
  color: var(--mr);
  background: rgba(245, 58, 113, 0.06);
}

.fb-textarea {
  width: 100%;
  border: 1px solid var(--n3);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  padding: 10px 12px;
  font-size: var(--t4-size);
  line-height: 20px;
  color: var(--n8);
  resize: none;
  outline: none;
}
.fb-textarea:focus { border-color: var(--mr); }
.fb-count {
  margin-top: 4px;
  text-align: right;
  font-size: var(--t2);
  line-height: 16px;
  color: var(--n5);
}
.fb-error {
  margin-top: 8px;
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--color-functional-danger);
}
.fb-hint {
  margin-top: 8px;
  text-align: center;
  font-size: var(--t2);
  line-height: 16px;
  color: var(--n5);
}

/* ============ 我的反馈 ============ */
.fb-mine__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.fb-mine__count {
  font-size: var(--t3-size);
  color: var(--n6);
}
.fb-mine__list {
  margin-top: 4px;
}
.fb-mine__item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 0;
  border-bottom: 1px solid var(--n3);
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.fb-mine__item:active { opacity: 0.7; }
.fb-mine__item:last-child { border-bottom: none; }
.fb-mine__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}
.fb-mine__no {
  font-size: var(--t2);
  line-height: 16px;
  color: var(--n5);
}
.fb-mine__cat {
  font-size: var(--t1);
  line-height: 14px;
  color: var(--n6);
  background: var(--n2);
  border-radius: 4px;
  padding: 1px 5px;
}
.fb-mine__status {
  margin-left: auto;
  font-size: var(--t1);
  line-height: 14px;
  border-radius: var(--radius-pill);
  padding: 2px 8px;
}
.fb-mine__status.is-pending { color: #b26a00; background: rgba(250, 171, 12, 0.12); }
.fb-mine__status.is-doing { color: var(--color-brand-link); background: rgba(25, 137, 250, 0.1); }
.fb-mine__status.is-done { color: var(--color-functional-success); background: rgba(103, 194, 58, 0.12); }
.fb-mine__content {
  margin-top: 6px;
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: var(--n8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.fb-mine__foot {
  margin-top: 6px;
  font-size: var(--t2);
  line-height: 16px;
  color: var(--n5);
}
.fb-mine__sep { margin: 0 4px; }
.fb-mine__empty {
  margin-top: 8px;
  font-size: var(--t4-size);
  color: var(--n6);
  text-align: center;
  padding: 18px 0;
}

.bottom-space { height: var(--content-bottom-space); }

/* 轻提示 */
.page-toast {
  position: fixed;
  left: 50%;
  bottom: calc(var(--tabbar-total) + 60px);
  transform: translateX(-50%);
  background: rgba(38, 38, 38, 0.9);
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
