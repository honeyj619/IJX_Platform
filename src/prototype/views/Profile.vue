<template>
  <div class="profile-page">
    <!-- 航空品牌背景区（干净天空，UI 全部 DOM） -->
    <div class="brand-bg">
      <img class="brand-bg__img" :src="bgSky" alt="" draggable="false">
      <div class="brand-bg__actions">
        <button type="button" class="bg-icon-btn" aria-label="退出" @click="logoutConfirmOpen = true">
          <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
            <path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14M10 12h10M17 8.5l3.5 3.5-3.5 3.5"
                  fill="none" stroke="#333" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button type="button" class="bg-icon-btn" aria-label="设置" @click="showToast('设置暂未开放')">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.48.48 0 0 0 .12-.61l-1.92-3.32a.48.48 0 0 0-.59-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.49.49 0 0 0-.48-.42h-3.84a.49.49 0 0 0-.48.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.71 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.3-.06.62-.06.94s.02.64.06.94l-2.03 1.58a.48.48 0 0 0-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.49.38 1.03.7 1.62.94l.36 2.54c.05.24.24.42.48.42h3.84c.24 0 .44-.18.48-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.48.48 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 15.6 12 3.6 3.6 0 0 1 12 15.6z"
                  fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 人员资料卡 -->
    <section class="id-card">
      <button type="button" class="id-card__main" @click="showToast('名片暂未开放')">
        <img class="id-card__avatar" :src="avatarImg" alt="梁劼头像" draggable="false">
        <div class="id-card__info">
          <div class="id-card__name-row">
            <span class="id-card__name">梁劼</span>
            <span class="id-card__gender" aria-label="女性">女</span>
            <span class="id-card__badge">名片</span>
          </div>
          <p class="id-card__role">产品经理</p>
          <p class="id-card__dept">信息管理部-管理支撑产品处</p>
        </div>
        <svg class="id-card__arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </section>

    <!-- 入职纪念条（资料卡下方独立浅金色附着条 + 右侧铃铛） -->
    <div class="anniversary-bar">
      <svg class="anniversary-bar__bell" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path d="M12 4a5 5 0 0 0-5 5c0 3.6-1.3 5-1.7 5.4h13.4c-.4-.4-1.7-1.8-1.7-5.4a5 5 0 0 0-5-5zM10.3 17.6a1.8 1.8 0 0 0 3.4 0"
              fill="none" stroke="#b8860b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p class="anniversary-bar__text">2023-07-03日加入，您在吉祥第1221天！</p>
    </div>

    <!-- 四个高优入口 -->
    <nav class="quick-grid" aria-label="高频服务">
      <button v-for="q in quickEntries" :key="q.label" type="button" class="quick-item" @click="showToast(`${q.label}暂未开放`)">
        <span class="quick-item__icon" aria-hidden="true" v-html="q.icon"></span>
        <span class="quick-item__label">{{ q.label }}</span>
      </button>
    </nav>

    <!-- 机上 Wi-Fi 横幅 -->
    <button type="button" class="wifi-banner" @click="showToast('机上 Wi-Fi 暂未开放')">
      <img :src="wifiBanner" alt="机上 Wi-Fi 服务横幅" draggable="false">
    </button>

    <!-- 吉食GO 钱包卡（白卡：黑标题 + 粉色余额 + 浅金付款码胶囊 + 淡纹样背景） -->
    <section class="wallet-card">
      <div class="wallet-card__left">
        <p class="wallet-card__title">「吉食GO」钱包</p>
        <p class="wallet-card__balance"><span class="yen">¥</span>68.35</p>
      </div>
      <button type="button" class="wallet-card__pay" @click="showToast('付款码暂未开放')">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2M17.5 14h2.5M14 17.5h2M17.5 17.5h2.5M14 20.5h2M17.5 20.5h2.5"
                fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        </svg>
        付款码
      </button>
    </section>

    <!-- 第一组菜单（左侧线稿图标） -->
    <nav class="menu-group" aria-label="个人服务">
      <button type="button" class="menu-row" @click="showToast('我的邮箱暂未开放')">
        <span class="menu-row__icon" aria-hidden="true" v-html="menuIcons.mail"></span>
        <span class="menu-row__label">我的邮箱</span>
        <svg class="menu-row__arrow" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button type="button" class="menu-row" @click="openWutong">
        <span class="menu-row__icon" aria-hidden="true" v-html="menuIcons.school"></span>
        <span class="menu-row__label">梧桐云学堂</span>
        <span v-if="wutongBadge > 0" class="menu-row__badge">{{ wutongBadge }}</span>
        <svg class="menu-row__arrow" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button type="button" class="menu-row" @click="showToast('我的IT资源暂未开放')">
        <span class="menu-row__icon" aria-hidden="true" v-html="menuIcons.it"></span>
        <span class="menu-row__label">我的IT资源</span>
        <svg class="menu-row__arrow" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </nav>

    <!-- 第二组菜单（左侧线稿图标） -->
    <nav class="menu-group" aria-label="帮助与安全">
      <button type="button" class="menu-row" @click="showToast('帮助与反馈暂未开放')">
        <span class="menu-row__icon" aria-hidden="true" v-html="menuIcons.help"></span>
        <span class="menu-row__label">帮助与反馈</span>
        <svg class="menu-row__arrow" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button type="button" class="menu-row" @click="showToast('账户安全中心暂未开放')">
        <span class="menu-row__icon" aria-hidden="true" v-html="menuIcons.shield"></span>
        <span class="menu-row__label">账户安全中心</span>
        <svg class="menu-row__arrow" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </nav>

    <div class="bottom-space"></div>

    <!-- 退出确认层（页面内，支持取消/确认） -->
    <transition name="sheet-fade">
      <div v-if="logoutConfirmOpen" class="confirm-mask" role="dialog" aria-label="退出账号确认" @click="logoutConfirmOpen = false">
        <div class="confirm-card" @click.stop>
          <p class="confirm-title">退出账号</p>
          <p class="confirm-desc">确认退出当前账号吗？（原型演示，不会真实登出）</p>
          <div class="confirm-actions">
            <button type="button" class="confirm-cancel" @click="logoutConfirmOpen = false">取消</button>
            <button type="button" class="confirm-ok" @click="confirmLogout">确认退出</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast">
      <div v-if="toastVisible" class="page-toast" role="status">{{ toastText }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import bgSky from '../assets/profile/bg-sky.png'
import avatarImg from '../assets/profile/avatar-liangjie.png'
import wifiBanner from '../assets/profile/banner-wifi.png'

/* 四个高优入口（黑灰线稿 + 品牌粉点缀 SVG） */
const iconStroke = 'stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"'
const pinkAcc = 'fill="#F53A71"'
const quickEntries = [
  {
    label: '我的薪酬',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8.5" ${iconStroke}/><path d="M12 7.5v9M9.5 9.8c0-1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.5-2.5 1.8-2.6.8-2.6 1.9 1.1 1.7 2.6 1.7 2.5-.7 2.5-1.7" ${iconStroke}/><circle cx="17.6" cy="6.4" r="1.6" ${pinkAcc}/></svg>`,
  },
  {
    label: '我要打卡',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="10.5" r="6.2" ${iconStroke}/><path d="M12 7.5v3.2l2 1.4M9 16.4L7.8 20.5l4.2-1.8 4.2 1.8L15 16.4" ${iconStroke}/><circle cx="17.8" cy="5" r="1.6" ${pinkAcc}/></svg>`,
  },
  {
    label: '我的福利',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="4" y="8" width="16" height="11" rx="2" ${iconStroke}/><path d="M4 11h16M12 8v11M8.5 8c-1-1.8.5-3.5 2-2.8 1 .5 1.5 1.5 1.5 2.8 0-1.3.5-2.3 1.5-2.8 1.5-.7 3 1 2 2.8" ${iconStroke}/><circle cx="18.2" cy="6.2" r="1.6" ${pinkAcc}/></svg>`,
  },
  {
    label: '我的钱包',
    icon: `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3.5" y="6.5" width="17" height="12" rx="2.5" ${iconStroke}/><path d="M3.5 10h17M16 14.5h2" ${iconStroke}/><circle cx="18.4" cy="4.8" r="1.6" ${pinkAcc}/></svg>`,
  },
]

/* 梧桐云学堂角标：点击本地清零 */
const wutongBadge = ref(18)
function openWutong() {
  if (wutongBadge.value > 0) {
    wutongBadge.value = 0
    showToast('梧桐云学堂：角标已清除（原型演示）')
  } else {
    showToast('梧桐云学堂暂未开放')
  }
}

/* 菜单左侧线稿图标（黑灰线稿） */
const menuIcons = {
  mail: `<svg viewBox="0 0 24 24" width="19" height="19"><rect x="3.5" y="5.5" width="17" height="13" rx="2" ${iconStroke}/><path d="M4.5 7.5l7.5 6 7.5-6" ${iconStroke}/></svg>`,
  school: `<svg viewBox="0 0 24 24" width="19" height="19"><path d="M3 9l9-5 9 5-9 5z" ${iconStroke}/><path d="M7 12v4.5c0 1.6 10 1.6 10 0V12M21 9v5" ${iconStroke}/></svg>`,
  it: `<svg viewBox="0 0 24 24" width="19" height="19"><rect x="3.5" y="4.5" width="17" height="12" rx="2" ${iconStroke}/><path d="M9 20h6M12 16.5V20M7 9l2 2-2 2M11 13h4" ${iconStroke}/></svg>`,
  help: `<svg viewBox="0 0 24 24" width="19" height="19"><circle cx="12" cy="12" r="8.5" ${iconStroke}/><path d="M9.8 9.6c.2-1.3 1.1-2.1 2.3-2.1 1.3 0 2.2.8 2.2 1.9 0 1.6-2.2 1.8-2.2 3.4M12 16.4v.2" ${iconStroke}/></svg>`,
  shield: `<svg viewBox="0 0 24 24" width="19" height="19"><path d="M12 3.5l7 2.5v5.2c0 4.4-3 7.3-7 9.3-4-2-7-4.9-7-9.3V6z" ${iconStroke}/><path d="M9.2 12l2 2 3.6-3.8" ${iconStroke}/></svg>`,
}

/* 退出确认 */
const logoutConfirmOpen = ref(false)
function confirmLogout() {
  logoutConfirmOpen.value = false
  showToast('已退出（原型演示，未真实登出）')
}

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
.profile-page {
  min-height: 100dvh;
  background: var(--n1);
  padding-bottom: 0;
}

/* ============ 品牌背景区 ============ */
.brand-bg {
  position: relative;
  height: 138px;
}
.brand-bg__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}
.brand-bg__actions {
  position: absolute;
  top: var(--safe-top);
  right: var(--gutter);
  display: flex;
  gap: 4px;
}
.bg-icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
}
.bg-icon-btn:active { opacity: 0.6; }

/* ============ 人员资料卡 ============ */
.id-card {
  background: var(--color-card-bg);
  margin: -34px var(--gutter) 0;
  border-radius: var(--radius-card);
  padding: 16px 14px 12px;
  position: relative;
  box-shadow: 0 2px 10px rgba(50, 50, 51, 0.06);
}
.id-card__main {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.id-card__main:active { opacity: 0.75; }
.id-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex: none;
}
.id-card__info {
  flex: 1;
  min-width: 0;
  margin-left: 12px;
}
.id-card__name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.id-card__name {
  font-size: var(--t8-size);
  line-height: var(--t8-line);
  font-weight: var(--t8-weight);
  color: var(--n8);
}
.id-card__gender {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--mr);
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  flex: none;
}
.id-card__badge {
  font-size: 10px;
  line-height: 14px;
  color: var(--color-brand-brown);
  background: #f6efe6;
  border-radius: 4px;
  padding: 0 5px;
  flex: none;
}
.id-card__role {
  margin-top: 3px;
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: var(--n7);
}
.id-card__dept {
  margin-top: 2px;
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--n6);
}
.id-card__arrow {
  color: var(--n5);
  flex: none;
}

/* ============ 入职纪念条（独立浅金附着条 + 右侧铃铛） ============ */
.anniversary-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px var(--gutter) 0;
  border-radius: var(--radius-card);
  background: linear-gradient(90deg, #faf3e2 0%, #f7eccf 100%);
  padding: 10px 14px;
}
.anniversary-bar__bell {
  flex: none;
  color: #b8860b;
}
.anniversary-bar__text {
  flex: 1;
  min-width: 0;
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: #9a7620;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============ 四个高优入口（黑线稿+粉点缀，无方块底） ============ */
.quick-grid {
  display: flex;
  background: var(--color-card-bg);
  margin: var(--space-3) var(--gutter) 0;
  border-radius: var(--radius-card);
  padding: 16px 0 12px;
}
.quick-item {
  flex: 1;
  min-height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
}
.quick-item:active .quick-item__icon { opacity: 0.55; }
.quick-item__icon {
  width: 26px;
  height: 26px;
  color: #2c2c2e;
  display: flex;
  align-items: center;
  justify-content: center;
}
.quick-item__label {
  font-size: var(--t3-size);
  line-height: var(--t3-line);
  color: var(--n8);
}

/* ============ Wi-Fi 横幅 ============ */
.wifi-banner {
  display: block;
  margin: var(--space-3) var(--gutter) 0;
  border-radius: var(--radius-card);
  overflow: hidden;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
.wifi-banner:active { opacity: 0.85; }
.wifi-banner img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1000 / 258;
  object-fit: cover;
}

/* ============ 吉食GO 钱包卡（白卡 + 淡纹样） ============ */
.wallet-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--space-3) var(--gutter) 0;
  border-radius: var(--radius-card);
  padding: 14px 16px;
  background-color: #fff;
  background-image: radial-gradient(circle at 88% 20%, rgba(196, 159, 115, 0.10) 0, transparent 46%),
                    radial-gradient(circle at 96% 78%, rgba(245, 58, 113, 0.05) 0, transparent 40%);
  border: 1px solid var(--n3);
}
.wallet-card__title {
  font-size: var(--t5-size);
  line-height: var(--t5-line);
  font-weight: 500;
  color: var(--n8);
}
.wallet-card__balance {
  margin-top: 3px;
  font-size: 22px;
  line-height: 28px;
  font-weight: 600;
  color: var(--mr);
}
.wallet-card__balance .yen {
  font-size: var(--t5-size);
  margin-right: 2px;
}
.wallet-card__pay {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: var(--radius-pill);
  background: linear-gradient(135deg, #f4e3c1 0%, #ecd2a4 100%);
  color: #8a6420;
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  font-weight: 500;
  -webkit-tap-highlight-color: transparent;
}
.wallet-card__pay:active { opacity: 0.8; }

/* ============ 分组菜单 ============ */
.menu-group {
  background: var(--color-card-bg);
  margin: var(--space-3) var(--gutter) 0;
  border-radius: var(--radius-card);
  overflow: hidden;
}
.menu-row {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  background: transparent;
  text-align: left;
  border-bottom: 1px solid var(--n3);
  -webkit-tap-highlight-color: transparent;
}
.menu-row:last-child { border-bottom: none; }
.menu-row:active { background: var(--n2); }
.menu-row__icon {
  flex: none;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--n8);
}
.menu-row__label {
  flex: 1;
  font-size: var(--t5-size);
  line-height: var(--t5-line);
  color: var(--n8);
}
.menu-row__badge {
  min-width: 17px;
  height: 17px;
  border-radius: 9px;
  background: var(--mr);
  color: #fff;
  font-size: 11px;
  line-height: 17px;
  text-align: center;
  padding: 0 4px;
  margin-right: 6px;
}
.menu-row__arrow { color: var(--n5); }

.bottom-space { height: var(--content-bottom-space); }

/* ============ 退出确认层 ============ */
.confirm-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: var(--z-popup);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
}
.confirm-card {
  width: 100%;
  max-width: 300px;
  background: var(--color-card-bg);
  border-radius: 14px;
  padding: 22px 18px 16px;
  text-align: center;
}
.confirm-title {
  font-size: var(--t7-size);
  line-height: var(--t7-line);
  font-weight: 500;
  color: var(--n8);
}
.confirm-desc {
  margin-top: 8px;
  font-size: var(--t4-size);
  line-height: var(--t4-line);
  color: var(--n6);
}
.confirm-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}
.confirm-cancel,
.confirm-ok {
  flex: 1;
  min-height: 38px;
  border-radius: var(--radius-pill);
  font-size: var(--t5-size);
  -webkit-tap-highlight-color: transparent;
}
.confirm-cancel {
  background: var(--n2);
  color: var(--n7);
}
.confirm-ok {
  background: var(--mr);
  color: #fff;
  font-weight: 500;
}
.confirm-cancel:active,
.confirm-ok:active { opacity: 0.8; }

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
