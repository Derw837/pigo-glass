import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import OpenAssistantButton from '@/components/OpenAssistantButton'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSiteMediaMap } from '@/lib/site-media'

export const dynamic = 'force-dynamic'

export default async function NosotrosPage() {
  let rows: any[] = []
  try {
    const db = createAdminClient()
    const { data } = await db.from('site_media').select('key,image_url,alt_text')
    rows = data || []
  } catch {}
  const media = buildSiteMediaMap(rows)

  return (
    <>
      <SiteHeader />
      <main className="company-page-v10">
        <section className="company-hero-v10">
          <img src={media.company_hero.src} alt={media.company_hero.alt} />
          <div className="company-hero-shade-v10" />
          <div className="container company-hero-copy-v10">
            <span className="home-kicker">NUESTRA EMPRESA</span>
            <h1>Experiencia, detalle y soluciones hechas para el espacio real.</h1>
          </div>
        </section>

        <section className="section company-story-v10">
          <div className="container company-story-grid-v10">
            <div><span className="eyebrow">Quiénes somos</span><h2>Más de 10 años llevando ideas a la vida real.</h2></div>
            <div>
              <p>Somos una empresa especializada en vidrio, aluminio e instalación para proyectos residenciales y comerciales en Ecuador. Acompañamos al cliente desde la idea inicial hasta la definición de materiales, medidas, acabados e instalación.</p>
              <p>Nuestro enfoque es práctico: entender qué quiere lograr el cliente, proponer una solución adecuada al uso del espacio y ejecutar el trabajo con orden, precisión y una terminación profesional.</p>
            </div>
          </div>
        </section>

        <section className="company-values-v10">
          <div className="container company-values-grid-v10">
            <article><span>01</span><h3>Escuchamos primero</h3><p>Partimos de la necesidad real, las medidas, el lugar y el presupuesto antes de recomendar una solución.</p></article>
            <article><span>02</span><h3>Materiales adecuados</h3><p>Orientamos el tipo de vidrio, perfilería y accesorios según el uso, la seguridad y el acabado esperado.</p></article>
            <article><span>03</span><h3>Instalación cuidada</h3><p>Prestamos atención a nivelación, fijaciones, sellado, funcionamiento y detalles finales.</p></article>
            <article><span>04</span><h3>Comunicación clara</h3><p>Buscamos que el cliente entienda qué se realizará, qué está incluido y cuándo hace falta una revisión técnica.</p></article>
          </div>
        </section>

        <section className="section company-cta-v10">
          <div className="container company-cta-inner-v10">
            <div><span className="eyebrow">Tu proyecto</span><h2>Cuéntanos qué quieres realizar.</h2><p>Puedes escribirle al asesor, adjuntar una fotografía o explorar primero nuestra galería por tipo de trabajo.</p></div>
            <div><OpenAssistantButton className="btn home-dark-btn">Hablar con el asesor</OpenAssistantButton><Link className="btn home-outline-dark-btn" href="/galeria">Ver proyectos</Link></div>
          </div>
        </section>
      </main>
    </>
  )
}
