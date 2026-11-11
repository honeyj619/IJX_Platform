import { ref } from 'vue'
import { toast } from './ui'

/**
 * 消息模块统一操作状态反馈（Harness DESIGN_SYSTEM §12 / P2-1）。
 *
 * 原型无真实后端，store 写入保持同步（既有回归时序不受影响）；
 * 「处理中 → 结果」由可见状态条 + 按钮禁用 + 结果轻提示组成：
 *   1) showBusy 立刻渲染 role=status 的处理中状态条
 *   2) work 同步写入本地 store
 *   3) 保持 BUSY_MS 可见时长，期间按钮 disabled 防止重复提交
 *   4) hideBusy + 成功提示；work 抛错时改为错误态并给出就近说明
 */
const BUSY_MS = 180
const ERROR_MS = 3200

let busyNode: HTMLElement | null = null

function host(): Element {
  return document.querySelector('.ijx-prototype') || document.body
}

export function showBusy(label = '处理中'): void {
  hideBusy()
  const el = document.createElement('div')
  el.className = 'im-busy'
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  const spinner = document.createElement('span')
  spinner.className = 'im-busy__spinner'
  spinner.setAttribute('aria-hidden', 'true')
  const text = document.createElement('span')
  text.textContent = `${label} · 处理中…`
  el.append(spinner, text)
  host().appendChild(el)
  busyNode = el
}

export function hideBusy(): void {
  busyNode?.remove()
  busyNode = null
}

export function showError(text = '操作失败，请重试'): void {
  hideBusy()
  const el = document.createElement('div')
  el.className = 'im-task-error'
  el.setAttribute('role', 'alert')
  el.textContent = text
  host().appendChild(el)
  window.setTimeout(() => el.remove(), ERROR_MS)
}

/** 无页面级状态需求时使用：处理中 → 结果 / 错误，返回 work 的结果或 null。 */
export async function runTask<T>(label: string, work: () => T, okText?: string): Promise<T | null> {
  showBusy(label)
  await Promise.resolve()
  try {
    const value = work()
    await new Promise((resolve) => window.setTimeout(resolve, BUSY_MS))
    hideBusy()
    toast(okText || `${label}已完成`)
    return value
  } catch {
    showError(`${label}失败，请重试`)
    return null
  }
}

/** 页面级：把 busy / error 暴露给按钮与 Field，实现禁用防重复 + 就近错误说明。 */
export function useImTask() {
  const busy = ref(false)
  const error = ref('')

  async function run<T>(label: string, work: () => T, okText?: string): Promise<T | null> {
    if (busy.value) return null
    busy.value = true
    error.value = ''
    showBusy(label)
    await Promise.resolve()
    try {
      const value = work()
      await new Promise((resolve) => window.setTimeout(resolve, BUSY_MS))
      hideBusy()
      toast(okText || `${label}已完成`)
      return value
    } catch {
      error.value = `${label}失败，请重试`
      showError(error.value)
      return null
    } finally {
      hideBusy()
      busy.value = false
    }
  }

  function clearError(): void { error.value = '' }

  return { busy, error, run, clearError }
}
