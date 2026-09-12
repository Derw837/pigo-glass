export type SiteMediaSlot = {
  key: string
  label: string
  section: string
  description: string
  fallback: string
}

export const SITE_MEDIA_SLOTS: SiteMediaSlot[] = [
  { key: 'home_hero', label: 'Portada principal', section: 'Inicio', description: 'Imagen grande que recibe al visitante.', fallback: '/home/hero-quito.webp' },
  { key: 'service_windows', label: 'Servicio · Ventanas', section: 'Servicios', description: 'Tarjeta de ventanas y cerramientos.', fallback: '/home/hero-quito.webp' },
  { key: 'service_barandas', label: 'Servicio · Barandas', section: 'Servicios', description: 'Tarjeta de barandas de vidrio.', fallback: '/gallery/barandas.svg' },
  { key: 'service_bathrooms', label: 'Servicio · Mamparas', section: 'Servicios', description: 'Tarjeta de mamparas de vidrio.', fallback: '/gallery/mamparas.svg' },
  { key: 'service_curtains', label: 'Servicio · Cortinas de baño', section: 'Servicios', description: 'Tarjeta de cortinas y cerramientos de ducha.', fallback: '/gallery/mamparas.svg' },
  { key: 'service_doors', label: 'Servicio · Puertas', section: 'Servicios', description: 'Tarjeta de puertas de vidrio y aluminio.', fallback: '/home/office-divisions.webp' },
  { key: 'service_divisions', label: 'Servicio · Divisiones', section: 'Servicios', description: 'Tarjeta de divisiones de ambientes.', fallback: '/home/office-divisions.webp' },
  { key: 'service_roofs', label: 'Servicio · Cubiertas', section: 'Servicios', description: 'Tarjeta de cubiertas de vidrio.', fallback: '/gallery/pergolas.svg' },
  { key: 'service_pergolas', label: 'Servicio · Pérgolas', section: 'Servicios', description: 'Tarjeta de vidrio para pérgolas existentes.', fallback: '/gallery/pergolas.svg' },
  { key: 'service_mirrors', label: 'Servicio · Espejos', section: 'Servicios', description: 'Tarjeta de espejos a medida.', fallback: '/gallery/especiales.svg' },
  { key: 'service_special', label: 'Servicio · Proyectos especiales', section: 'Servicios', description: 'Tarjeta de vidrio a medida y proyectos especiales.', fallback: '/gallery/especiales.svg' },
  { key: 'company_home', label: 'Nuestra empresa', section: 'Inicio', description: 'Imagen del bloque Nuestra empresa.', fallback: '/home/office-divisions.webp' },
  { key: 'corporate_home', label: 'Empresas y comercios', section: 'Inicio', description: 'Imagen del bloque corporativo.', fallback: '/home/office-divisions.webp' },
  { key: 'installation_home', label: 'Instalación profesional', section: 'Inicio', description: 'Imagen del técnico o instalación.', fallback: '/home/professional-installation.webp' },
  { key: 'gallery_hero', label: 'Portada de galería', section: 'Galería', description: 'Imagen superior de la página de galería.', fallback: '/home/hero-quito.webp' },
  { key: 'company_hero', label: 'Portada de Nuestra empresa', section: 'Empresa', description: 'Imagen principal de la página de empresa.', fallback: '/home/office-divisions.webp' },
  { key: 'careers_hero', label: 'Portada Trabaja con nosotros', section: 'Empleo', description: 'Imagen principal de la página de vacantes.', fallback: '/home/professional-installation.webp' },
]

export type SiteMediaRow = { key: string; image_url?: string | null; alt_text?: string | null }

export function buildSiteMediaMap(rows: SiteMediaRow[] = []) {
  const fromDb = new Map(rows.map((row) => [row.key, row]))
  return Object.fromEntries(SITE_MEDIA_SLOTS.map((slot) => {
    const row = fromDb.get(slot.key)
    return [slot.key, {
      src: row?.image_url || slot.fallback,
      alt: row?.alt_text || slot.label,
      custom: Boolean(row?.image_url),
    }]
  })) as Record<string, { src: string; alt: string; custom: boolean }>
}
