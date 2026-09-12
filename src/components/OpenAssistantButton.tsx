'use client'

import type { ReactNode } from 'react'

export default function OpenAssistantButton({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event('pigo:open-assistant'))}
    >
      {children}
    </button>
  )
}
