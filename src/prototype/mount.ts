import { createApp, type App as VueApp } from 'vue'
import PrototypeApp from './App.vue'
import { createPrototypeRouter } from './router'
import './styles/tokens.css'
import './styles/base.css'
import './styles/im.css'

let app: VueApp | null = null

/** 由 React 宿主挂载独立 Vue 员工端原型；每次挂载都新建 router，避免复用失效的 history 监听 */
export function mountPrototype(container: Element) {
  unmountPrototype()
  app = createApp(PrototypeApp)
  app.use(createPrototypeRouter())
  app.mount(container)
}

export function unmountPrototype() {
  app?.unmount()
  app = null
}
