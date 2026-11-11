import { messagePreview } from './data/utils'
import type { Message } from './data/types'

export const REACTION_EMOJIS = ['👍', '🎉', '❤️', '😂', '😮', '🙏']

const COLORS = ['#f53a71', '#1989fa', '#67c23a', '#faab0c', '#ce9c71', '#996c3f', '#2e71ff', '#ed6a0c']

export function avatarColor(seed = ''): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

export function initials(name = ''): string {
  return name.trim().slice(0, 1) || '?'
}

export function preview(msg: Message): string {
  return messagePreview(msg)
}

function host(): Element {
  return document.querySelector('.ijx-prototype') || document.body
}

export function toast(text: string): void {
  if (!text) return
  const el = document.createElement('div')
  el.className = 'im-toast'
  el.textContent = text
  host().appendChild(el)
  window.setTimeout(() => el.remove(), 1700)
}

/** 轻量二次确认弹窗（与 App 设计规范一致：标题 / 摘要 / 取消 / 确认） */
export function confirmBox(title: string, desc = '', confirmText = '确认'): Promise<boolean> {
  return new Promise((resolve) => {
    const mask = document.createElement('div')
    mask.className = 'im-confirm-mask'
    const box = document.createElement('div')
    box.className = 'im-confirm'
    const h = document.createElement('h3')
    h.textContent = title
    const p = document.createElement('p')
    p.textContent = desc
    const actions = document.createElement('div')
    actions.className = 'im-confirm__actions'
    const cancel = document.createElement('button')
    cancel.className = 'im-confirm__cancel'
    cancel.textContent = '取消'
    const ok = document.createElement('button')
    ok.className = 'im-confirm__ok'
    ok.textContent = confirmText
    const finish = (value: boolean) => { mask.remove(); resolve(value) }
    cancel.addEventListener('click', () => finish(false))
    ok.addEventListener('click', () => finish(true))
    mask.addEventListener('click', (e) => { if (e.target === mask) finish(false) })
    actions.append(cancel, ok)
    box.append(h, p, actions)
    mask.appendChild(box)
    host().appendChild(mask)
  })
}
