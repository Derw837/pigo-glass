import SiteHeader from '@/components/SiteHeader'
import CareersPublic from '@/components/CareersPublic'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSiteMediaMap } from '@/lib/site-media'

export const dynamic = 'force-dynamic'

export default async function CareersPage() {
  let vacancies: any[] = []
  let mediaRows: any[] = []
  try {
    const db = createAdminClient()
    const [vacancyResult, mediaResult] = await Promise.all([
      db.from('vacancies').select('id,title,location,contract_type,summary,description,requirements').eq('is_open', true).order('created_at', { ascending: false }),
      db.from('site_media').select('key,image_url,alt_text'),
    ])
    vacancies = vacancyResult.data || []
    mediaRows = mediaResult.data || []
  } catch {}
  const media = buildSiteMediaMap(mediaRows)

  return (
    <>
      <SiteHeader />
      <main className="careers-page-v10">
        <section className="careers-hero-v10">
          <img src={media.careers_hero.src} alt={media.careers_hero.alt} />
          <div className="careers-hero-shade-v10" />
          <div className="container careers-hero-copy-v10">
            <span className="eyebrow light">Trabaja con nosotros</span>
            <h1>Personas comprometidas con el detalle hacen mejores proyectos.</h1>
            <p>Publicamos aquí nuestras vacantes activas. Si encuentras una oportunidad que encaje contigo, puedes enviar tu hoja de vida directamente.</p>
          </div>
        </section>
        <section className="section careers-list-v10">
          <div className="container">
            <div className="home-section-intro">
              <div><span className="eyebrow">Oportunidades</span><h2>Vacantes disponibles.</h2></div>
              <p>Solo mostramos cargos que se encuentran abiertos en este momento. Cada postulación queda asociada a una vacante específica.</p>
            </div>
            <CareersPublic vacancies={vacancies} />
          </div>
        </section>
      </main>
    </>
  )
}
