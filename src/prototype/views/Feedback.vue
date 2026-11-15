<template>
  <div class="feedback-page">
    <BaseNavBar title="帮助与反馈" show-back />

    <main class="feedback-content">
      <section class="feedback-intro" aria-labelledby="feedback-intro-title">
        <div class="feedback-intro__icon" aria-hidden="true">
          <ImIcon name="service" :size="24" />
        </div>
        <div>
          <h2 id="feedback-intro-title">遇到问题，我们一起解决</h2>
          <p>提交时会自动附带页面与 App 环境，便于更快定位。</p>
        </div>
      </section>

      <div class="feedback-tabs" role="tablist" aria-label="帮助与反馈视图">
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'compose'"
          :class="{ 'is-active': activeTab === 'compose' }"
          @click="activeTab = 'compose'"
        >
          我要反馈
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="activeTab === 'mine'"
          :class="{ 'is-active': activeTab === 'mine' }"
          @click="activeTab = 'mine'"
        >
          我的反馈
          <span v-if="myRecords.length" class="feedback-tabs__count">{{ myRecords.length }}</span>
        </button>
      </div>

      <form v-if="activeTab === 'compose'" class="feedback-form" @submit.prevent="submitFeedback">
        <section class="feedback-section">
          <div class="feedback-section__heading">
            <h3>问题发生在哪里</h3>
            <button v-if="relatedPage" type="button" class="text-action" @click="relatedPage = null">取消关联</button>
          </div>

          <div v-if="relatedPage" class="page-context">
            <span class="page-context__icon" aria-hidden="true">
              <ImIcon name="schedule" :size="20" />
            </span>
            <div class="page-context__body">
              <strong>{{ relatedPage.title }}</strong>
              <span>{{ relatedPage.path }}</span>
            </div>
            <span class="page-context__tag">自动记录</span>
          </div>
          <button v-else type="button" class="page-context page-context--empty" @click="restoreRelatedPage">
            <span class="page-context__icon" aria-hidden="true">
              <ImIcon name="plus" :size="20" />
            </span>
            <div class="page-context__body">
              <strong>关联最近访问页面</strong>
              <span>帮助管理员快速还原问题场景</span>
            </div>
            <ImIcon name="chevron" :size="18" />
          </button>
        </section>

        <section class="feedback-section">
          <fieldset class="feedback-fieldset">
            <legend>反馈类型</legend>
            <div class="category-list">
              <button
                v-for="item in categories"
                :key="item"
                type="button"
                :class="{ 'is-selected': category === item }"
                @click="category = item"
              >
                {{ item }}
              </button>
            </div>
          </fieldset>

          <label class="feedback-field" for="feedback-content">
            <span class="feedback-field__label">问题描述 <i>必填</i></span>
            <textarea
              id="feedback-content"
              v-model="content"
              maxlength="1000"
              rows="6"
              placeholder="请描述遇到的问题、操作步骤和期望结果"
              @input="error = ''"
            />
            <span class="feedback-field__meta" :class="{ 'has-error': error }">
              <span>{{ error || '建议补充出现频率和是否可以重复发生' }}</span>
              <span>{{ content.length }}/1000</span>
            </span>
          </label>

          <div class="feedback-upload">
            <div>
              <strong>图片或附件</strong>
              <span>最多 3 个，单个不超过 10 MB</span>
            </div>
            <input ref="fileInput" class="sr-only" type="file" multiple accept="image/*,.pdf,.doc,.docx" @change="handleFiles">
            <button type="button" aria-label="添加图片或附件" @click="fileInput?.click()">
              <ImIcon name="image" :size="20" />
              添加
            </button>
          </div>

          <div v-if="attachments.length" class="attachment-list">
            <div v-for="item in attachments" :key="item.id" class="attachment-item">
              <ImIcon name="file" :size="18" />
              <span>{{ item.name }}</span>
              <small>{{ item.size }}</small>
              <button type="button" :aria-label="`移除 ${item.name}`" @click="removeAttachment(item.id)">
                <ImIcon name="close" :size="16" />
              </button>
            </div>
          </div>
        </section>

        <p class="feedback-privacy">提交即表示同意将以上问题信息用于故障定位，不会采集聊天内容和账号密码。</p>
      </form>

      <section v-else class="feedback-mine" aria-live="polite">
        <div v-if="myRecords.length" class="feedback-list">
          <button
            v-for="record in myRecords"
            :key="record.id"
            type="button"
            class="feedback-record"
            @click="selectedRecord = record"
          >
            <span class="feedback-record__top">
              <span :class="['status-tag', statusClass(record.status)]">{{ record.status }}</span>
              <span class="feedback-record__time">{{ record.updatedAt || record.createdAt }}</span>
            </span>
            <strong>{{ record.content }}</strong>
            <span class="feedback-record__meta">
              <span>{{ record.feedbackNo }}</span>
              <span>{{ record.category }}</span>
              <span v-if="record.sourcePageTitle">{{ record.sourcePageTitle }}</span>
            </span>
          </button>
        </div>
        <div v-else class="feedback-empty">
          <div class="feedback-empty__icon"><ImIcon name="article" :size="38" /></div>
          <h3>还没有反馈记录</h3>
          <p>提交问题后，可以在这里查看处理进度。</p>
          <BaseButton type="default" size="normal" @click="activeTab = 'compose'">提交第一条反馈</BaseButton>
        </div>
      </section>
    </main>

    <footer v-if="activeTab === 'compose'" class="feedback-footer">
      <BaseButton
        block
        size="large"
        native-type="submit"
        :loading="submitting"
        :disabled="!content.trim()"
        @click="submitFeedback"
      >
        {{ submitting ? '正在提交' : '提交反馈' }}
      </BaseButton>
      <span>提交后可在“我的反馈”查看处理进度</span>
    </footer>

    <transition name="sheet-fade">
      <div v-if="selectedRecord" class="detail-mask" role="dialog" aria-modal="true" aria-label="反馈详情" @click="selectedRecord = null">
        <article class="detail-sheet" @click.stop>
          <div class="detail-sheet__handle" />
          <header>
            <div>
              <span>{{ selectedRecord.feedbackNo }}</span>
              <h2>反馈详情</h2>
            </div>
            <button type="button" aria-label="关闭反馈详情" @click="selectedRecord = null">
              <ImIcon name="close" :size="20" />
            </button>
          </header>
          <div class="detail-sheet__content">
            <div class="detail-summary">
              <span :class="['status-tag', statusClass(selectedRecord.status)]">{{ selectedRecord.status }}</span>
              <span>{{ selectedRecord.category }}</span>
              <span>{{ selectedRecord.createdAt }}</span>
            </div>
            <section>
              <h3>反馈内容</h3>
              <p>{{ selectedRecord.content }}</p>
            </section>
            <section v-if="selectedRecord.sourcePagePath">
              <h3>相关页面</h3>
              <div class="detail-page">
                <ImIcon name="schedule" :size="18" />
                <span>{{ selectedRecord.sourcePageTitle || 'App 页面' }}</span>
                <small>{{ selectedRecord.sourcePagePath }}</small>
              </div>
            </section>
            <section>
              <h3>处理进度</h3>
              <ol class="timeline">
                <li v-for="item in selectedRecord.timeline || []" :key="item.id">
                  <span class="timeline__dot" />
                  <div>
                    <strong>{{ item.title }}</strong>
                    <p v-if="item.description">{{ item.description }}</p>
                    <small>{{ item.operator }} · {{ item.createdAt }}</small>
                  </div>
                </li>
              </ol>
            </section>
          </div>
        </article>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="toastVisible" class="feedback-toast" role="status">
        <ImIcon name="check" :size="18" />
        {{ toastText }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import BaseButton from '../components/BaseButton.vue'
import BaseNavBar from '../components/BaseNavBar.vue'
import ImIcon from '../components/im/ImIcon.vue'
import { MAIN_USER_NAME } from '../../data/people'

const STORAGE_KEY = 'ijx-feedback-records-v1'
const RECORDS_EVENT = 'ijx-feedback-records-change'
const PAGE_CONTEXT_KEY = 'ijx-feedback-entry-page'
const categories = ['功能异常', '使用咨询', '体验建议', '其他']
const pageTitles = {
  '/': '首页',
  '/schedule': '日程',
  '/workspace': '工作台',
  '/message': '消息',
  '/profile': '我的',
}

const activeTab = ref('compose')
const category = ref('功能异常')
const content = ref('')
const attachments = ref([])
const error = ref('')
const submitting = ref(false)
const fileInput = ref(null)
const selectedRecord = ref(null)
const records = ref(readRecords())
const relatedPage = ref(readPageContext())
const toastVisible = ref(false)
const toastText = ref('')
let toastTimer = null
let submitTimer = null

const myRecords = computed(() => records.value
  .filter((record) => record.userId === 'main-user')
  .sort((a, b) => String(b.updatedAt || b.createdAt).localeCompare(String(a.updatedAt || a.createdAt))))

function readRecords() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function sanitizePath(path) {
  if (!path || typeof path !== 'string') return '/profile'
  const clean = path.split('?')[0].split('#')[0]
  return clean.startsWith('/') ? clean : `/${clean}`
}

function readPageContext() {
  try {
    const raw = window.sessionStorage.getItem(PAGE_CONTEXT_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed?.path) return { title: '我的', path: '/profile', capturedAt: new Date().toISOString() }
    const path = sanitizePath(parsed.path)
    return {
      title: parsed.title || pageTitles[path] || 'App 页面',
      path,
      capturedAt: parsed.capturedAt || new Date().toISOString(),
    }
  } catch {
    return { title: '我的', path: '/profile', capturedAt: new Date().toISOString() }
  }
}

function restoreRelatedPage() {
  relatedPage.value = readPageContext()
}

function handleFiles(event) {
  const files = Array.from(event.target.files || []).slice(0, Math.max(0, 3 - attachments.value.length))
  const accepted = files.filter((file) => file.size <= 10 * 1024 * 1024)
  attachments.value.push(...accepted.map((file, index) => ({
    id: `app-attachment-${Date.now()}-${index}`,
    name: file.name,
    size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
  })))
  if (accepted.length !== files.length) showToast('已忽略超过 10 MB 的附件')
  event.target.value = ''
}

function removeAttachment(id) {
  attachments.value = attachments.value.filter((item) => item.id !== id)
}

function feedbackNo(list) {
  const now = new Date()
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const sequence = list.filter((item) => String(item.feedbackNo).startsWith(`FB${date}`)).length + 1
  return `FB${date}${String(sequence).padStart(4, '0')}`
}

function nowText() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function submitFeedback() {
  if (submitting.value) return
  if (!content.value.trim()) {
    error.value = '请填写具体的问题描述'
    document.querySelector('#feedback-content')?.focus()
    return
  }

  submitting.value = true
  submitTimer = window.setTimeout(() => {
    const current = readRecords()
    const createdAt = nowText()
    const id = `feedback-app-${Date.now()}`
    const record = {
      id,
      feedbackNo: feedbackNo(current),
      userId: 'main-user',
      userName: MAIN_USER_NAME,
      departmentName: '信息管理部 / 管理支撑产品处',
      category: category.value,
      content: content.value.trim(),
      attachments: attachments.value,
      source: 'App 我的-帮助与反馈',
      status: '待处理',
      sourceUrl: relatedPage.value?.path || '/profile/feedback',
      sourcePageTitle: relatedPage.value?.title,
      sourcePagePath: relatedPage.value?.path,
      sourcePageCapturedAt: relatedPage.value?.capturedAt,
      clientKind: 'App',
      clientType: 'i吉祥 App',
      browserInfo: `${navigator.platform || '移动端'} / App WebView`,
      clientRequestId: `app-feedback-${Date.now()}`,
      createdAt,
      updatedAt: createdAt,
      timeline: [{ id: `${id}-created`, title: '提交反馈', operator: MAIN_USER_NAME, createdAt }],
    }
    const next = [record, ...current]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(RECORDS_EVENT))
    records.value = next
    content.value = ''
    attachments.value = []
    category.value = '功能异常'
    submitting.value = false
    activeTab.value = 'mine'
    showToast(`反馈已提交：${record.feedbackNo}`)
  }, 500)
}

function statusClass(status) {
  if (status === '已解决') return 'is-resolved'
  if (status === '处理中') return 'is-processing'
  return 'is-pending'
}

function showToast(text) {
  toastText.value = text
  toastVisible.value = true
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toastVisible.value = false }, 2200)
}

function refreshRecords(event) {
  if (!event.key || event.key === STORAGE_KEY) records.value = readRecords()
}

window.addEventListener('storage', refreshRecords)
window.addEventListener(RECORDS_EVENT, refreshRecords)
onBeforeUnmount(() => {
  window.removeEventListener('storage', refreshRecords)
  window.removeEventListener(RECORDS_EVENT, refreshRecords)
  if (toastTimer) window.clearTimeout(toastTimer)
  if (submitTimer) window.clearTimeout(submitTimer)
})
</script>

<style scoped>
.feedback-page {
  min-height: 100dvh;
  background: var(--n1);
  color: var(--n8);
  padding-bottom: calc(94px + var(--safe-bottom));
}

.feedback-page :deep(.base-navbar) {
  position: sticky;
  top: 0;
  z-index: var(--z-navbar);
  border-bottom: 1px solid var(--n3);
}

.feedback-content {
  padding: 12px var(--gutter) 24px;
}

.feedback-intro {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 16px;
  border-radius: var(--radius-card);
  background: linear-gradient(135deg, #fff 0%, #fff5f8 100%);
  border: 1px solid #fde2ea;
}

.feedback-intro__icon {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: var(--mr);
  background: #fff;
  box-shadow: 0 4px 14px rgba(245, 58, 113, 0.1);
}

.feedback-intro h2 {
  font-size: var(--t6-size);
  line-height: var(--t6-line);
  font-weight: 500;
}

.feedback-intro p {
  margin-top: 3px;
  color: var(--n6);
  font-size: var(--t2-size);
  line-height: var(--t2-line);
}

.feedback-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin: 12px 0;
  padding: 4px;
  border-radius: 12px;
  background: var(--n2);
}

.feedback-tabs button {
  min-height: 40px;
  border-radius: 9px;
  color: var(--n7);
  font-size: var(--t4-size);
  transition: color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.feedback-tabs button.is-active {
  color: var(--mr);
  background: #fff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(50, 50, 51, 0.06);
}

.feedback-tabs__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  margin-left: 4px;
  padding: 0 5px;
  border-radius: var(--radius-pill);
  color: #fff;
  background: var(--mr);
  font-size: var(--t1-size);
}

.feedback-form,
.feedback-list {
  display: grid;
  gap: 12px;
}

.feedback-section {
  padding: 16px;
  border-radius: var(--radius-card);
  background: #fff;
}

.feedback-section__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.feedback-section h3,
.feedback-fieldset legend,
.feedback-field__label {
  color: var(--n8);
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  font-weight: 500;
}

.text-action {
  min-height: 32px;
  color: var(--n6);
  font-size: var(--t2-size);
}

.page-context {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 64px;
  padding: 10px 12px;
  border: 1px solid var(--n3);
  border-radius: 10px;
  text-align: left;
  background: var(--n1);
}

.page-context__icon {
  display: grid;
  place-items: center;
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  margin-right: 10px;
  border-radius: 10px;
  color: var(--mr);
  background: #fff;
}

.page-context__body {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
}

.page-context__body strong {
  overflow: hidden;
  color: var(--n8);
  font-size: var(--t4-size);
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-context__body span {
  overflow: hidden;
  margin-top: 2px;
  color: var(--n6);
  font-size: var(--t2-size);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-context__tag {
  flex: none;
  margin-left: 8px;
  padding: 3px 7px;
  border-radius: var(--radius-pill);
  color: var(--mr);
  background: #fff0f5;
  font-size: var(--t1-size);
}

.page-context--empty {
  color: var(--n6);
  border-style: dashed;
  background: #fff;
}

.feedback-fieldset {
  padding: 0;
  border: 0;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.category-list button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--n3);
  border-radius: var(--radius-pill);
  color: var(--n7);
  background: #fff;
  font-size: var(--t3-size);
}

.category-list button.is-selected {
  border-color: var(--mr);
  color: var(--mr);
  background: #fff4f7;
  font-weight: 500;
}

.feedback-field {
  display: block;
  margin-top: 20px;
}

.feedback-field__label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.feedback-field__label i {
  color: var(--mr);
  font-size: var(--t1-size);
  font-style: normal;
  font-weight: 400;
}

.feedback-field textarea {
  display: block;
  width: 100%;
  min-height: 132px;
  margin-top: 10px;
  padding: 12px;
  resize: vertical;
  border: 1px solid var(--n3);
  border-radius: 10px;
  outline: none;
  color: var(--n8);
  background: var(--n1);
  font-size: var(--t4-size);
  line-height: 22px;
}

.feedback-field textarea::placeholder {
  color: var(--n5);
}

.feedback-field textarea:focus {
  border-color: var(--mr);
  background: #fff;
  box-shadow: 0 0 0 2px rgba(245, 58, 113, 0.08);
}

.feedback-field__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  color: var(--n6);
  font-size: var(--t1-size);
  line-height: var(--t1-line);
}

.feedback-field__meta.has-error span:first-child {
  color: var(--color-danger);
}

.feedback-upload {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
}

.feedback-upload > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.feedback-upload strong {
  color: var(--n8);
  font-size: var(--t4-size);
  font-weight: 500;
}

.feedback-upload span {
  margin-top: 2px;
  color: var(--n6);
  font-size: var(--t1-size);
}

.feedback-upload button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 78px;
  min-height: 40px;
  gap: 5px;
  border: 1px solid var(--n3);
  border-radius: 10px;
  color: var(--n7);
  background: #fff;
  font-size: var(--t3-size);
}

.attachment-list {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  min-height: 42px;
  gap: 8px;
  padding: 6px 8px 6px 10px;
  border-radius: 9px;
  color: var(--n7);
  background: var(--n1);
}

.attachment-item > span {
  overflow: hidden;
  flex: 1;
  font-size: var(--t2-size);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.attachment-item small {
  color: var(--n6);
  font-size: var(--t1-size);
}

.attachment-item button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  color: var(--n6);
}

.feedback-privacy {
  padding: 0 8px;
  color: var(--n6);
  font-size: var(--t1-size);
  line-height: 17px;
  text-align: center;
}

.feedback-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--z-fab);
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 10px var(--gutter) calc(8px + var(--safe-bottom));
  border-top: 1px solid var(--n3);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
}

.feedback-footer :deep(.base-button) {
  border-radius: var(--radius-pill);
}

.feedback-footer :deep(.base-button.is-disabled) {
  color: var(--n6);
  background: var(--n3);
}

.feedback-footer > span {
  display: block;
  margin-top: 5px;
  color: var(--n6);
  font-size: var(--t1-size);
  line-height: var(--t1-line);
  text-align: center;
}

.feedback-record {
  display: flex;
  width: 100%;
  min-height: 120px;
  flex-direction: column;
  padding: 14px 16px;
  border-radius: var(--radius-card);
  text-align: left;
  background: #fff;
}

.feedback-record:active {
  transform: scale(0.99);
}

.feedback-record__top,
.feedback-record__meta {
  display: flex;
  align-items: center;
}

.feedback-record__top {
  justify-content: space-between;
}

.feedback-record__time {
  color: var(--n6);
  font-size: var(--t1-size);
}

.feedback-record > strong {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 10px;
  color: var(--n8);
  font-size: var(--t4-size);
  line-height: 21px;
  font-weight: 500;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.feedback-record__meta {
  flex-wrap: wrap;
  gap: 6px 12px;
  margin-top: auto;
  padding-top: 10px;
  color: var(--n6);
  font-size: var(--t1-size);
}

.status-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: var(--radius-pill);
  font-size: var(--t1-size);
  font-weight: 500;
}

.status-tag.is-pending {
  color: #b56f00;
  background: #fff7e8;
}

.status-tag.is-processing {
  color: var(--color-functional-primary);
  background: #eef4ff;
}

.status-tag.is-resolved {
  color: #398b24;
  background: #eef8eb;
}

.feedback-empty {
  display: flex;
  min-height: 390px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
}

.feedback-empty__icon {
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border-radius: 28px;
  color: var(--mr);
  background: #fff0f5;
}

.feedback-empty h3 {
  margin-top: 18px;
  font-size: var(--t6-size);
  font-weight: 500;
}

.feedback-empty p {
  max-width: 240px;
  margin: 6px 0 18px;
  color: var(--n6);
  font-size: var(--t3-size);
  line-height: var(--t3-line);
}

.detail-mask {
  position: fixed;
  inset: 0;
  z-index: var(--z-popup);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.38);
}

.detail-sheet {
  display: flex;
  width: 100%;
  max-width: 480px;
  max-height: 82dvh;
  flex-direction: column;
  overflow: hidden;
  border-radius: 18px 18px 0 0;
  background: #fff;
}

.detail-sheet__handle {
  width: 36px;
  height: 4px;
  margin: 8px auto 2px;
  border-radius: var(--radius-pill);
  background: var(--n4);
}

.detail-sheet header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--n3);
}

.detail-sheet header > div {
  flex: 1;
}

.detail-sheet header span {
  color: var(--n6);
  font-size: var(--t1-size);
}

.detail-sheet header h2 {
  margin-top: 2px;
  font-size: var(--t6-size);
  font-weight: 500;
}

.detail-sheet header button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: var(--n7);
}

.detail-sheet__content {
  overflow-y: auto;
  padding: 16px 16px calc(20px + var(--safe-bottom));
}

.detail-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: var(--n6);
  font-size: var(--t2-size);
}

.detail-sheet__content section {
  margin-top: 20px;
}

.detail-sheet__content section h3 {
  margin-bottom: 8px;
  font-size: var(--t3-size);
  font-weight: 500;
}

.detail-sheet__content section > p {
  color: var(--n7);
  font-size: var(--t4-size);
  line-height: 22px;
  white-space: pre-wrap;
}

.detail-page {
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 3px 8px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--mr);
  background: var(--n1);
}

.detail-page span {
  color: var(--n8);
  font-size: var(--t3-size);
}

.detail-page small {
  grid-column: 2;
  color: var(--n6);
  font-size: var(--t1-size);
}

.timeline {
  list-style: none;
}

.timeline li {
  position: relative;
  display: flex;
  gap: 10px;
  padding-bottom: 18px;
}

.timeline li:not(:last-child)::before {
  position: absolute;
  top: 10px;
  bottom: -2px;
  left: 4px;
  width: 1px;
  background: var(--n3);
  content: '';
}

.timeline__dot {
  position: relative;
  z-index: 1;
  flex: 0 0 9px;
  width: 9px;
  height: 9px;
  margin-top: 5px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--mr);
  box-shadow: 0 0 0 1px var(--mr);
}

.timeline strong {
  color: var(--n8);
  font-size: var(--t3-size);
  font-weight: 500;
}

.timeline p,
.timeline small {
  display: block;
  margin-top: 3px;
  color: var(--n6);
  font-size: var(--t1-size);
  line-height: var(--t1-line);
}

.feedback-toast {
  position: fixed;
  right: 20px;
  bottom: calc(112px + var(--safe-bottom));
  left: 20px;
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  gap: 7px;
  max-width: 360px;
  margin: 0 auto;
  padding: 9px 14px;
  border-radius: 10px;
  color: #fff;
  background: rgba(50, 50, 51, 0.92);
  font-size: var(--t3-size);
  box-shadow: 0 8px 24px rgba(50, 50, 51, 0.18);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

.sheet-fade-enter-active,
.sheet-fade-leave-active,
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s ease;
}

.sheet-fade-enter-from,
.sheet-fade-leave-to,
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

@media (min-width: 430px) {
  .feedback-content {
    padding-right: 16px;
    padding-left: 16px;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .feedback-footer {
    background: #fff;
    backdrop-filter: none;
  }
}
</style>
