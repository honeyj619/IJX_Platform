import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import router from './router'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#ec4899',
          secondary: '#f472b6',
          accent: '#fbcfe8',
          background: '#f8fafc',
          surface: '#ffffff',
          error: '#ef4444',
          info: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
        },
      },
      dark: {
        colors: {
          primary: '#f472b6',
          secondary: '#fbcfe8',
          accent: '#ec4899',
          background: '#0f172a',
          surface: '#1e293b',
          error: '#f87171',
          info: '#60a5fa',
          success: '#4ade80',
          warning: '#fbbf24',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.mount('#app')
