import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Enterprise from '../pages/Enterprise.vue'
import Assistant from '../pages/Assistant.vue'
import Process from '../pages/Process.vue'
import Knowledge from '../pages/Knowledge.vue'
import Profile from '../pages/Profile.vue'
import RuYiZone from '../pages/RuYiZone.vue'
import AgentSquarePage from '../pages/AgentSquarePage.vue'
import EKB from '../pages/EKB.vue'
import Calendar from '../pages/Calendar.vue'
import Business from '../pages/Business.vue'
import SettingsPage from '../pages/SettingsPage.vue'
import Admin from '../pages/Admin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/enterprise', name: 'Enterprise', component: Enterprise },
    { path: '/assistant', name: 'Assistant', component: Assistant },
    { path: '/process', name: 'Process', component: Process },
    { path: '/knowledge', name: 'Knowledge', component: Knowledge },
    { path: '/ekb', name: 'EKB', component: EKB },
    { path: '/profile', name: 'Profile', component: Profile },
    { path: '/agent-square', name: 'AgentSquare', component: AgentSquarePage },
    { path: '/ruyi-zone', name: 'RuYiZone', component: RuYiZone },
    { path: '/calendar', name: 'Calendar', component: Calendar },
    { path: '/business', name: 'Business', component: Business },
    { path: '/settings', name: 'Settings', component: SettingsPage },
    { path: '/admin', name: 'Admin', component: Admin },
  ],
})

export default router
