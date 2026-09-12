import SiteHeader from '@/components/SiteHeader'
import GalleryPublic from '@/components/GalleryPublic'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSiteMediaMap } from '@/lib/site-media'
import { getServiceCategory } from '@/lib/service-catalog'

export const dynamic = 'force-dynamic'

export default async function Galeria({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  let items: any[] = []
  let mediaRows: any[] = []
  try {
    const db = createAdminClient()
    const [galleryResult, mediaResult] = await Promise.all([
      db.from('gallery_projects').select('id,title,category,description,cover_url').eq('published', true).order('created_at', { ascending: false }),
      db.from('site_media').select('key,image_url,alt_text'),
    ])
    items = galleryResult.data || []
    mediaRows = mediaResult.data || []
  } catch {}
  const params = await searchParams
  const initialCategory = getServiceCategory(params?.categoria)?.name || 'Todos'
  const media = buildSiteMediaMap(mediaRows)

  return (
    <>
      <SiteHeader />
      <main className="gallery-page-v10">
        <section className="gallery-hero-v10">
          <img src={media.gallery_hero.src} alt={media.gallery_hero.alt} />
          <div className="gallery-hero-shade-v10" />
          <div className="container gallery-hero-copy-v10">
            <span className="home-kicker">SOLUCIONES · DETALLES · PROYECTOS</span>
            <h1>Vidrio y aluminio pensados para cada espacio.</h1>
            <p>Conoce las soluciones que realizamos y explora fotografías de trabajos publicados por categoría.</p>
          </div>
        </section>
        <section className="section gallery-content-v10">
          <div className="container">
            <GalleryPublic items={items} initialCategory={initialCategory} />
          </div>
        </section>
      </main>
    </>
  )
}
