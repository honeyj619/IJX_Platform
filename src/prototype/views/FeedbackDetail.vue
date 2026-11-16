<template>
  <div class="fbd-page">
    <BaseNavBar title="反馈详情" show-back back-text="返回" @back="goBack" />

    <div class="fbd-scroll">
      <!-- 未找到 -->
      <div v-if="!record" class="fbd-empty">
        <p class="fbd-empty__title">未找到该反馈记录</p>
        <p class="fbd-empty__desc">记录可能已被清除，或链接已失效</p>
        <button type="button" class="fbd-btn fbd-btn--primary" @click="router.push('/profile/feedback')">返回帮助与反馈</button>
      </div>

      <template v-else>
        <!-- 摘要卡 -->
        <section class="fbd-card">
          <div class="fbd-head">
            <div class="fbd-head__meta">
              <span class="fbd-no">{{ record.feedbackNo }}</span>
              <span class="fbd-cat">{{ record.category }}</span>
            </div>
            <span class="fbd-status" :class="`is-${statusKey(record.status)}`">{{ record.status }}</span>
          </div>
          <p class="fbd-content">{{ record.content }}</p>
          <div v-if="record.attachments.length" class="fbd-attachments">
            <div v-for="item in record.attachments" :key="item.id" class="fbd-attachment">
              <span>{{ item.name }}</span>
              <span class="fbd-attachment__size">{{ item.size }}</span>
            </div>
          </div>
        </section>

        <!-- 处理时间线 -->
        <section class="fbd-card">
          <p class="fbd-card__title">处理记录</p>
          <div class="fbd-timeline">
            <div v-for="(item, index) in record.timeline" :key="item.id" class="fbd-timeline__item">
              <span class="fbd-timeline__dot" :class="{ 'is-last': index === record.timeline.length - 1 }"></span>
              <div class="fbd-timeline__body">
                <p class="fbd-timeline__title">{{ item.title }}</p>
                <p v-if="item.description" class="fbd-timeline__desc">{{ item.description }}</p>
                <p class="fbd-timeline__meta">{{ item.operator }} · {{ item.createdAt }}</p>
              </div>
            </div>
          </div>
          <div v-if="record.resolution" class="fbd-resolution">
            <p class="fbd-resolution__title">处理结果</p>
            <p class="fbd-resolution__text">{{ record.resolution }}</p>
          </div>
        </section>

        <!-- 关联信息 -->
        <section class="fbd-card">
          <p class="fbd-card__title">反馈信息</p>
          <div class="fbd-info">
            <div class="fbd-info__row">
              <span class="fbd-info__label">状态</span>
              <span class="fbd-info__value">{{ record.status }}</span>
            </div>
            <div class="fbd-info__row">
              <span class="fbd-info__label">类型</span>
              <span class="fbd-info__value">{{ record.category }}</span>
            </div>
            <div class="fbd-info__row">
              <span class="fbd-info__label">提交时间</span>
              <span class="fbd-info__value">{{ record.createdAt }}</span>
            </div>
            <div class="fbd-info__row">
              <span class="fbd-info__label">来源</span>
              <span class="fbd-info__value">{{ record.source }}</span>
            </div>
            <div class="fbd-info__row">
              <span class="fbd-info__label">关联页面</span>
              <span class="fbd-info__value">
                <template v-if="record.sourcePagePath">{{ record.sourcePageTitle || '相关页面' }}<br><span class="fbd-info__path">{{ record.sourcePagePath }}</span></template>
                <template v-else>未记录</template>
              </span>
            </div>
            <div v-if="record.featureEntry" class="fbd-info__row">
              <span class="fbd-info__label">功能入口</span>
              <span class="fbd-info__value">{{ record.featureEntry }}</span>
            </div>
          </div>
          <!-- 关联 IM 会话入口（管理员联系用户后出现） -->
          <button v-if="conversation" type="button" class="fbd-conv" @click="openConversation">
            <span class="fbd-conv__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 5.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3.5v-3.5H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
            </span>
            <span class="fbd-conv__body">
              <span class="fbd-conv__title">{{ conversation.title }}</span>
              <span class="fbd-conv__desc">{{ conversation.messages[conversation.messages.length - 1]?.text?.split('\n')[0] || '' }}</span>
            </span>
            <svg viewBox="0 0 24 24" width="14" height="14" class="fbd-conv__arrow" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </section>

        <div class="bottom-space"></div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseNavBar from '../components/BaseNavBar.vue'
import { FEEDBACK_RECORDS_EVENT, getFeedbackRecord } from '../../data/feedback'
import { getFeedbackConversation, subscribeFeedbackConversations } from '../../data/feedbackConversations'

const route = useRoute()
const router = useRouter()

const record = ref(null)
const conversation = ref(null)

function refresh() {
  record.value = getFeedbackRecord(route.params.feedbackId)
  conversation.value = record.value ? getFeedbackConversation(record.value.id) : null
}

onMounted(() => {
  refresh()
  window.addEventListener(FEEDBACK_RECORDS_EVENT, refresh)
  subscribeFeedbackConversations(refresh)
})

onUnmounted(() => {
  window.removeEventListener(FEEDBACK_RECORDS_EVENT, refresh)
})

function goBack() {
  if (window.history.state && window.history.state.back) router.back()
  else router.push('/profile/feedback')
}

function openConversation() {
  router.push('/message')
}

function statusKey(status) {
  if (status === '待处理') return 'pending'
  if (status === '处理中') return 'doing'
  return 'done'
}
</script>

<style scoped>
.fbd-page {
  min-height: 100dvh;
  background: var(--n1);
  display: flex;
  flex-direction: column;
}
.fbd-scroll { flex: 1; overflow-y: auto; }

.fbd-card {
  background: var(--color-card-bg);
  margin: var(--space-3) var(--gutter) 0;
  border-radius: var(--radius-card);
  padding: 14px;
}
.fbd-card__title {
  font-size: var(--t6-size);
  line-height: var(--t6-line);
  font-weight: 500;
  color: var(--n8);
}

/* 摘要 */
.fbd-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.fbd-head__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}
.fbd-no { font-size: var(--t2); color: var(--n5); }
.fbd-cat {
  font-size: var(--t1);
  color: var(--n6);
  background: var(--n2);
  border-radius: 4px;
  padding: 1px 5px;
}
.fbd-status {
  font-size: var(--t1);
  border-radius: var(--radius-pill);
  padding: 2px 8px;
}
.fbd-status.is-pending { color: #b26a00; background: rgba(250, 171, 12, 0.12); }
.fbd-status.is-doing { color: var(--color-brand-link); background: rgba(25, 137, 250, 0.1); }
.fbd-status.is-done { color: var(--color-functional-success); background: rgba(103, 194, 58, 0.12); }
.fbd-content {
  margin-top: 8px;
  font-size: var(--t5-size);
  line-height: var(--t5-line);
  color: var(--n8);
  white-space: pre-wrap;
}
.fbd-attachments { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
.fbd-attachment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid var(--n3);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: var(--t4-size);
  color: var(--n7);
}
.fbd-attachment__size { font-size: var(--t2); color: var(--n5); flex: none; }

/* 时间线 */
.fbd-timeline { margin-top: 10px; }
.fbd-timeline__item { display: flex; gap: 10px; padding-bottom: 14px; position: relative; }
.fbd-timeline__item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 4.5px;
  top: 14px;
  bottom: 0;
  width: 1px;
  background: var(--n3);
}
.fbd-timeline__dot {
  flex: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--n4);
  margin-top: 4px;
}
.fbd-timeline__dot.is-last { background: var(--mr); }
.fbd-timeline__title { font-size: var(--t4-size); line-height: var(--t4-line); font-weight: 500; color: var(--n8); }
.fbd-timeline__desc { margin-top: 2px; font-size: var(--t3-size); line-height: var(--t3-line); color: var(--n6); }
.fbd-timeline__meta { margin-top: 3px; font-size: var(--t2); color: var(--n5); }

.fbd-resolution {
  margin-top: 4px;
  border-left: 3px solid var(--color-functional-success);
  background: rgba(103, 194, 58, 0.08);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 10px 12px;
}
.fbd-resolution__title { font-size: var(--t4-size); font-weight: 500; color: var(--n8); }
.fbd-resolution__text { margin-top: 4px; font-size: var(--t3-size); line-height: var(--t3-line); color: var(--n7); }

/* 信息列表 */
.fbd-info { margin-top: 10px; }
.fbd-info__row {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--n3);
}
.fbd-info__row:last-child { border-bottom: none; }
.fbd-info__label { flex: none; width: 64px; font-size: var(--t3-size); color: var(--n6); }
.fbd-info__value { flex: 1; min-width: 0; font-size: var(--t3-size); line-height: var(--t3-line); color: var(--n8); word-break: break-all; }
.fbd-info__path { font-size: var(--t2); color: var(--n5); }

/* 会话入口 */
.fbd-conv {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 10px;
  border: 1px solid var(--n3);
  border-radius: var(--radius-sm);
  background: var(--n2);
  padding: 10px 12px;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.fbd-conv:active { opacity: 0.75; }
.fbd-conv__icon { flex: none; color: var(--mr); display: flex; }
.fbd-conv__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.fbd-conv__title {
  font-size: var(--t4-size);
  color: var(--n8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fbd-conv__desc {
  font-size: var(--t2);
  color: var(--n6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fbd-conv__arrow { flex: none; color: var(--n5); }

/* 空态 */
.fbd-empty {
  margin: 80px var(--gutter) 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.fbd-empty__title { font-size: var(--t6-size); font-weight: 500; color: var(--n8); }
.fbd-empty__desc { font-size: var(--t3-size); color: var(--n6); }
.fbd-empty .fbd-btn { margin-top: 14px; width: auto; padding: 0 24px; }

/* 按钮 */
.fbd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  border-radius: var(--radius-pill);
  font-size: var(--t5-size);
  -webkit-tap-highlight-color: transparent;
  width: 100%;
}
.fbd-btn--primary { background: var(--mr); color: #fff; font-weight: 500; }
.fbd-btn--primary:active { background: var(--color-brand-primary-strong); }

.bottom-space { height: var(--content-bottom-space); }
</style>
