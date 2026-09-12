'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Maximize2 } from 'lucide-react'
import GalleryLightbox from '@/components/GalleryLightbox'
import OpenAssistantButton from '@/components/OpenAssistantButton'
import { getServiceCategory, SERVICE_CATEGORIES } from '@/lib/service-catalog'

type GalleryItem = {
  id: string
  title: string
  category: string
  description?: string | null
  cover_url?: string | null
}

export default function GalleryPublic({ items, initialCategory = 'Todos' }: { items: GalleryItem[]; initialCategory?: string }) {
  const safeInitial = getServiceCategory(initialCategory)?.name || 'Todos'
  const [category, setCategory] = useState(safeInitial)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const visible = useMemo(
    () => category === 'Todos' ? items : items.filter((item) => item.category === category),
    [items, category],
  )
  const selected = category === 'Todos' ? null : getServiceCategory(category)

  function choose(next: string) {
    setCategory(next)
    setLightboxIndex(null)
    const url = next === 'Todos' ? '/galeria' : `/galeria?categoria=${encodeURIComponent(next)}`
    window.history.replaceState(null, '', url)
    window.scrollTo({ top: 500, behavior: 'smooth' })
  }

  return (
    <>
      <section className="gallery-category-nav-v10">
        <div className="gallery-category-scroll-v10">
          <button className={category === 'Todos' ? 'active' : ''} onClick={() => choose('Todos')}>Todos</button>
          {SERVICE_CATEGORIES.map((service) => (
            <button key={service.name} className={category === service.name ? 'active' : ''} onClick={() => choose(service.name)}>{service.name}</button>
          ))}
        </div>
      </section>

      {selected ? (
        <section className="gallery-service-intro-v10">
          <div className="gallery-service-number-v10">{String(SERVICE_CATEGORIES.findIndex((item) => item.name === selected.name) + 1).padStart(2, '0')}</div>
          <div className="gallery-service-main-v10">
            <span className="eyebrow">{selected.name}</span>
            <h2>{selected.short}</h2>
            <p>{selected.description}</p>
            {selected.note ? <div className="gallery-service-note-v10">{selected.note}</div> : null}
          </div>
          <div className="gallery-service-types-v10">
            <strong>Opciones que realizamos</strong>
            <div>{selected.types.map((type) => <span key={type}>{type}</span>)}</div>
            <OpenAssistantButton className="btn home-dark-btn">Consultar este servicio</OpenAssistantButton>
          </div>
        </section>
      ) : (
        <section className="gallery-services-overview-v10">
          <div className="gallery-overview-head-v10">
            <div><span className="eyebrow">Soluciones</span><h2>Encuentra el tipo de trabajo que necesitas.</h2></div>
            <p>Cada categoría reúne una explicación general, las soluciones más comunes y los proyectos reales que hemos publicado.</p>
          </div>
          <div className="gallery-service-directory-v10">
            {SERVICE_CATEGORIES.map((service, index) => (
              <button key={service.name} onClick={() => choose(service.name)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{service.name}</strong>
                <p>{service.short}</p>
                <i>Explorar <ArrowRight size={13} /></i>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="gallery-projects-section-v10">
        <div className="gallery-projects-heading-v10">
          <div>
            <span className="eyebrow">Proyectos realizados</span>
            <h2>{category === 'Todos' ? 'Trabajos publicados por nuestro equipo.' : `Trabajos de ${category.toLocaleLowerCase('es')}.`}</h2>
          </div>
          <p>{visible.length} {visible.length === 1 ? 'proyecto publicado' : 'proyectos publicados'}</p>
        </div>

        {visible.length ? (
          <div className="gallery-grid-v8 gallery-grid-v10">
            {visible.map((item, index) => (
              <button type="button" className="gallery-project-v8" key={item.id} onClick={() => setLightboxIndex(index)} aria-label={`Abrir ${item.title}`}>
                <div className="gallery-project-image-v8">
                  {item.cover_url ? <img src={item.cover_url} alt={item.title} loading="lazy" /> : <div className="gallery-project-placeholder-v8" />}
                  <span className="gallery-project-zoom-v8"><Maximize2 size={16} /> Ver proyecto</span>
                </div>
                <div className="gallery-project-copy-v8">
                  <span>{item.category}</span>
                  <strong>{item.title}</strong>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="gallery-empty-category-v10">
            <strong>Aún no hemos publicado fotografías en esta categoría.</strong>
            <p>La solución sí forma parte de nuestros servicios. Puedes consultarla ahora con el asesor y nuestro equipo revisará tu proyecto.</p>
            <OpenAssistantButton className="btn primary">Consultar proyecto</OpenAssistantButton>
          </div>
        )}
      </section>

      <GalleryLightbox items={visible} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onChange={setLightboxIndex} />
    </>
  )
}
