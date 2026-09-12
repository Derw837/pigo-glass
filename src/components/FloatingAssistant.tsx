'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import QuoteAssistant from '@/components/QuoteAssistant'

export default function FloatingAssistant() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (window.location.hash === '#asesor') setOpen(true)

    const openAssistant = () => setOpen(true)
    const openFromHash = () => { if (window.location.hash === '#asesor') setOpen(true) }
    window.addEventListener('pigo:open-assistant', openAssistant)
    window.addEventListener('hashchange', openFromHash)
    return () => {
      window.removeEventListener('pigo:open-assistant', openAssistant)
      window.removeEventListener('hashchange', openFromHash)
    }
  }, [])

  if (pathname.startsWith('/admin') || pathname === '/login-admin' || pathname === '/cotizar') {
    return null
  }

  return (
    <>
      <button
        className={`live-assistant-launcher ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(value => !value)}
        type="button"
        aria-label={open ? 'Cerrar asesor en línea' : 'Abrir asesor en línea'}
      >
        <span className="live-assistant-icon">P</span>
        <span className="live-assistant-copy">
          <strong>Asesor en línea</strong>
          <small><i /> Disponible para ayudarte</small>
        </span>
        <span className="live-assistant-chevron">{open ? '×' : '↗'}</span>
      </button>

      <div className={`live-assistant-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
        {open && <QuoteAssistant compact onClose={() => setOpen(false)} />}
      </div>
    </>
  )
}
