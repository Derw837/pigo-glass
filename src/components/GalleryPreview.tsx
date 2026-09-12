'use client'

import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import GalleryLightbox from '@/components/GalleryLightbox'

type Item = { id: string; cover_url?: string | null; title: string; category: string; description?: string | null }

export default function GalleryPreview({ items }: { items: Item[] }) {
  const [index, setIndex] = useState<number | null>(null)
  if (!items.length) {
    return <div className="home-gallery-empty-v10">Aún no hay proyectos publicados. Las fotografías que cargues desde Administración → Galería aparecerán aquí automáticamente.</div>
  }
  return <>
    <div className="gallery-preview-grid-v8">
      {items.slice(0, 6).map((item, itemIndex) => (
        <button type="button" className="gallery-preview-card-v8" key={item.id} onClick={() => setIndex(itemIndex)}>
          <div>
            {item.cover_url ? <img src={item.cover_url} alt={item.title} loading="lazy" /> : null}
            <span><Maximize2 size={15} /> Ampliar</span>
          </div>
          <small>{item.category}</small>
          <strong>{item.title}</strong>
        </button>
      ))}
    </div>
    <GalleryLightbox items={items.slice(0, 6)} index={index} onClose={() => setIndex(null)} onChange={setIndex} />
  </>
}
