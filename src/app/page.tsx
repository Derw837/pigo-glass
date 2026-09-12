import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import GalleryPreview from '@/components/GalleryPreview'
import OpenAssistantButton from '@/components/OpenAssistantButton'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildSiteMediaMap } from '@/lib/site-media'
import { galleryHref } from '@/lib/service-catalog'

export const dynamic = 'force-dynamic'

const quickServices = [
  ['Ventanas', 'Ventanas'],
  ['Mamparas', 'Mamparas'],
  ['Barandas', 'Barandas'],
  ['Cubiertas', 'Cubiertas'],
  ['Pérgolas', 'Pérgolas'],
  ['Divisiones', 'Divisiones'],
  ['Cortinas de baño', 'Cortinas de baño'],
  ['Espejos', 'Espejos'],
  ['Puertas', 'Puertas'],
]

const serviceCards = [
  { n: '01', title: 'Ventanas y cerramientos', text: 'Corredizas, fijas, proyectables, opciones acústicas, control solar y vidrio de seguridad.', category: 'Ventanas', media: 'service_windows' },
  { n: '02', title: 'Barandas de vidrio', text: 'Terrazas, balcones y escaleras con sistemas de fijación adaptados al proyecto.', category: 'Barandas', media: 'service_barandas' },
  { n: '03', title: 'Mamparas', text: 'Soluciones fijas, corredizas o abatibles con acabados modernos y distintos niveles de privacidad.', category: 'Mamparas', media: 'service_bathrooms' },
  { n: '04', title: 'Cortinas de baño', text: 'Cerramientos de ducha en vidrio, con opciones sin marco o con perfilería de aluminio.', category: 'Cortinas de baño', media: 'service_curtains' },
  { n: '05', title: 'Divisiones de ambientes', text: 'Oficinas, comercios y hogares con paños fijos, puertas y perfilería de acabado moderno.', category: 'Divisiones', media: 'service_divisions' },
  { n: '06', title: 'Puertas', text: 'Puertas corredizas o abatibles de vidrio y aluminio para accesos e interiores.', category: 'Puertas', media: 'service_doors' },
  { n: '07', title: 'Cubiertas', text: 'Vidrio instalado sobre estructuras existentes y aptas, con sellado y accesorios compatibles.', category: 'Cubiertas', media: 'service_roofs' },
  { n: '08', title: 'Pérgolas', text: 'Vidrio para pérgolas con estructura existente, con opciones de seguridad y control solar.', category: 'Pérgolas', media: 'service_pergolas' },
  { n: '09', title: 'Espejos a medida', text: 'Espejos para baños, salas, gimnasios, comercios y proyectos decorativos.', category: 'Espejos', media: 'service_mirrors' },
  { n: '10', title: 'Proyectos especiales', text: 'Vidrio curvo, fuentes decorativas y otras soluciones no estándar relacionadas con vidrio y aluminio.', category: 'Proyectos especiales', media: 'service_special' },
]

export default async function Home() {
  let mediaRows: any[] = []
  let projects: any[] = []
  try {
    const db = createAdminClient()
    const [mediaResult, galleryResult] = await Promise.all([
      db.from('site_media').select('key,image_url,alt_text'),
      db.from('gallery_projects').select('id,title,category,description,cover_url').eq('published', true).order('created_at', { ascending: false }).limit(6),
    ])
    mediaRows = mediaResult.data || []
    projects = galleryResult.data || []
  } catch {}
  const media = buildSiteMediaMap(mediaRows)

  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-hero-v9">
          <img className="home-hero-image" src={media.home_hero.src} alt={media.home_hero.alt} />
          <div className="home-hero-shade" />
          <div className="container home-hero-content">
            <div className="home-hero-copy-v9">
              <span className="home-kicker">VIDRIO · ALUMINIO · INSTALACIÓN</span>
              <h1>Espacios más luminosos, seguros y bien terminados.</h1>
              <p>Soluciones en vidrio y perfilería para hogares, oficinas y negocios en Ecuador. Te orientamos, cotizamos y realizamos la instalación.</p>
              <div className="home-hero-actions-v9">
                <OpenAssistantButton className="btn home-primary-btn">Cotizar con el asesor</OpenAssistantButton>
                <Link className="btn home-secondary-btn" href="/galeria">Ver trabajos realizados</Link>
              </div>
              <div className="home-hero-meta"><span><b>01</b> Cuéntanos tu idea</span><span><b>02</b> Adjunta fotos</span><span><b>03</b> Recibe orientación</span></div>
            </div>
          </div>
        </section>

        <section className="home-service-strip" aria-label="Servicios principales">
          <div className="container home-service-strip-inner">
            {quickServices.map(([label, category]) => <Link key={label} href={galleryHref(category)}>{label}</Link>)}
          </div>
        </section>

        <section className="home-solutions-v9" id="servicios">
          <div className="container">
            <div className="home-section-intro">
              <div><span className="eyebrow">Nuestras soluciones</span><h2>Vidrio y aluminio para cada tipo de espacio.</h2></div>
              <p>Explora cada área para conocer las alternativas que realizamos y ver trabajos publicados de esa misma categoría.</p>
            </div>

            <div className="home-solution-grid home-solution-grid-v10">
              {serviceCards.map((card) => (
                <Link className="home-solution-card image-card home-service-photo-card-v10" href={galleryHref(card.category)} key={card.title}>
                  <img src={media[card.media].src} alt={media[card.media].alt} />
                  <div className="home-card-overlay" />
                  <div className="home-card-copy">
                    <span>{card.n}</span><h3>{card.title}</h3><p>{card.text}</p><b className="home-card-link">Ver soluciones y proyectos →</b>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="home-company-v10" id="empresa">
          <div className="container home-company-grid-v10">
            <div className="home-company-image-v10"><img src={media.company_home.src} alt={media.company_home.alt} /></div>
            <div className="home-company-copy-v10">
              <span className="eyebrow">Nuestra empresa</span>
              <h2>Más de 10 años convirtiendo ideas en soluciones de vidrio y aluminio.</h2>
              <p>Somos una empresa especializada en suministro e instalación de vidrio, perfilería y accesorios para proyectos residenciales y comerciales. Trabajamos con atención al detalle, comunicación clara y soluciones pensadas para el uso real de cada espacio.</p>
              <div className="company-points-v10"><span><b>+10 años</b> de experiencia</span><span><b>Ecuador</b> atención residencial y comercial</span><span><b>Proyecto a medida</b> desde la idea hasta la instalación</span></div>
              <Link className="btn home-dark-btn" href="/nosotros">Conoce nuestra empresa</Link>
            </div>
          </div>
        </section>

        <section className="home-split-v9 home-corporate-v9" id="empresas">
          <div className="container home-split-grid-v9">
            <div className="home-split-image-v9"><img src={media.corporate_home.src} alt={media.corporate_home.alt} /></div>
            <div className="home-split-copy-v9">
              <span className="eyebrow">Empresas y comercios</span><h2>Ambientes profesionales que mantienen la luz y la amplitud.</h2>
              <p>Instalamos divisiones, cerramientos, puertas y soluciones de vidrio para oficinas, locales y espacios corporativos. Revisamos el proyecto para recomendar una configuración acorde al uso y al acabado que buscas.</p>
              <div className="home-feature-list"><Link href={galleryHref('Divisiones')}>Divisiones de vidrio</Link><Link href={galleryHref('Puertas')}>Puertas y cerramientos</Link><Link href={galleryHref('Proyectos especiales')}>Vidrio a medida</Link><Link href={galleryHref('Ventanas')}>Perfilería de aluminio</Link></div>
              <OpenAssistantButton className="btn home-dark-btn">Consultar un proyecto comercial</OpenAssistantButton>
            </div>
          </div>
        </section>

        <section className="home-split-v9 home-install-v9" id="instalacion">
          <div className="container home-split-grid-v9 reverse">
            <div className="home-split-copy-v9">
              <span className="eyebrow">Instalación profesional</span><h2>El acabado final depende de una instalación bien ejecutada.</h2>
              <p>Nuestro servicio contempla instalación, ajustes, sellado y revisión final. Si ya tienes materiales, podemos evaluar la instalación; si necesitas el proyecto completo, suministramos los materiales como parte del servicio.</p>
              <div className="home-process-row"><div><b>01</b><span>Revisión</span></div><div><b>02</b><span>Preparación</span></div><div><b>03</b><span>Instalación</span></div><div><b>04</b><span>Acabado</span></div></div>
              <OpenAssistantButton className="btn home-outline-dark-btn">Hablar con un asesor</OpenAssistantButton>
            </div>
            <div className="home-split-image-v9 installer-image"><img src={media.installation_home.src} alt={media.installation_home.alt} /></div>
          </div>
        </section>

        <section className="section portfolio-home home-portfolio-v9" id="trabajos">
          <div className="container">
            <div className="home-section-intro portfolio-heading-v9"><div><span className="eyebrow">Trabajos realizados</span><h2>Proyectos reales para inspirar el tuyo.</h2></div><p>Esta sección muestra automáticamente los trabajos reales que publiques desde Administración → Galería.</p></div>
            <GalleryPreview items={projects} />
            <div className="home-portfolio-actions"><Link href="/galeria" className="btn home-outline-dark-btn">Explorar todos los trabajos</Link><OpenAssistantButton className="btn home-dark-btn">Quiero algo parecido</OpenAssistantButton></div>
          </div>
        </section>

        <section className="home-careers-v10">
          <div className="container home-careers-inner-v10">
            <div><span className="eyebrow">Forma parte del equipo</span><h2>¿Te gustaría trabajar con nosotros?</h2><p>Cuando tengamos una vacante abierta podrás conocer el cargo, los requisitos y enviar tu hoja de vida directamente desde la web.</p></div>
            <Link href="/trabaja-con-nosotros" className="btn home-dark-btn">Ver oportunidades</Link>
          </div>
        </section>

        <section className="home-final-cta-v9">
          <div className="container home-final-cta-inner">
            <div><span className="eyebrow">Asesor en línea</span><h2>¿Tienes una foto o una idea? Muéstranosla.</h2><p>El asesor puede revisar una foto del espacio o una imagen de referencia, hacerte las preguntas necesarias y dejar la solicitud lista para nuestro equipo.</p></div>
            <OpenAssistantButton className="btn home-primary-btn">Abrir asesor en línea</OpenAssistantButton>
          </div>
        </section>
      </main>
    </>
  )
}
