import { useEffect, useRef } from 'react'
import { mountPrototype, unmountPrototype } from '@/prototype/mount'

/** 独立 Vue 员工端原型的 React 宿主，路由 /app/prototype/* */
export default function VuePrototypeHost() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = hostRef.current
    if (!container) return
    mountPrototype(container)
    return () => unmountPrototype()
  }, [])

  return (
    <div
      ref={hostRef}
      className="ijx-prototype"
      style={{ minHeight: '100dvh' }}
    />
  )
}
