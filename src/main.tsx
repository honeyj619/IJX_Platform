import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// GitHub Pages SPA 404 恢复：public/404.html 存 redirectPath 后跳回根，这里在挂载前恢复子路由
(() => {
  const saved = sessionStorage.getItem('redirectPath')
  if (!saved) return
  sessionStorage.removeItem('redirectPath')
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const target = saved.startsWith(base) ? saved.slice(base.length) : saved
  if (target && target !== '/' && target !== '/IJX_Platform/' && location.pathname === (base || '/')) {
    history.replaceState(null, '', (base || '') + target)
  }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
