'use client'

import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

type GalleryItem = {
  id?: string
  title?: string
  category?: string
  description?: string | null
  cover_url?: string | null
}

export default function GalleryLightbox({
  items,
  index,
  onClose,
  onChange,
}: {
  items: GalleryItem[]
  index: number | null
  onClose: () => void
  onChange: (index: number) => void
}) {
  const open = index !== null && Boolean(items[index ?? -1])
  const item = open ? items[index as number] : null

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight' && items.length > 1) {
        onChange(((index as number) + 1) % items.length)
      }
      if (event.key === 'ArrowLeft' && items.length > 1) {
        onChange(((index as number) - 1 + items.length) % items.length)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, index, items.length, onChange, onClose])

  if (!open || !item) return null

  const goPrevious = () => onChange(((index as number) - 1 + items.length) % items.length)
  const goNext = () => onChange(((index as number) + 1) % items.length)

  return (
    <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={item.title || 'Vista ampliada'} onMouseDown={onClose}>
      <div className="gallery-lightbox-panel" onMouseDown={(event) => event.stopPropagation()}>
        <button className="gallery-lightbox-close" onClick={onClose} aria-label="Cerrar imagen">
          <X size={20} />
        </button>

        <div className="gallery-lightbox-media">
          {item.cover_url ? <img src={item.cover_url} alt={item.title || 'Proyecto'} /> : null}
        </div>

        {items.length > 1 ? (
          <>
            <button className="gallery-lightbox-nav previous" onClick={goPrevious} aria-label="Imagen anterior">
              <ChevronLeft size={22} />
            </button>
            <button className="gallery-lightbox-nav next" onClick={goNext} aria-label="Imagen siguiente">
              <ChevronRight size={22} />
            </button>
          </>
        ) : null}

        <div className="gallery-lightbox-info">
          <div>
            <span>{item.category || 'Proyecto realizado'}</span>
            <h3>{item.title || 'Trabajo realizado'}</h3>
            {item.description ? <p>{item.description}</p> : null}
          </div>
          {items.length > 1 ? <small>{(index as number) + 1} de {items.length}</small> : null}
        </div>
      </div>
    </div>
  )
}
