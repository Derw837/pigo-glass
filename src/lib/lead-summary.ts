import type { Assessment, ContactDraft, Estimate } from '@/lib/types'

type Item = { assessment?: Assessment | null; estimate?: Estimate }

export function supplyLabel(mode?: string) {
  switch (mode) {
    case 'company_supplies_and_installs': return 'La empresa suministra materiales e instala'
    case 'client_buys_we_install': return 'El cliente compra materiales; la empresa instala'
    case 'client_has_materials_install': return 'El cliente ya tiene materiales; la empresa instala'
    case 'custom_installation': return 'Responsabilidades por confirmar'
    default: return 'Modalidad por confirmar'
  }
}

export function aluminumBrandLabel(brand?: string) {
  if (brand === 'cedal') return 'CEDAL'
  if (brand === 'andesia') return 'Andesía'
  if (brand === 'other') return 'Otra marca'
  return 'Por definir'
}



export function aluminumOriginLabel(origin?: string) {
  const map: Record<string,string> = { national: 'Nacional', imported: 'Importado', mixed: 'Mixto' }
  return map[origin || ''] || ''
}

export function aluminumTierLabel(tier?: string) {
  const map: Record<string,string> = { economic: 'Económico', standard: 'Estándar', premium: 'Premium', european: 'Sistema europeo' }
  return map[tier || ''] || ''
}

export function hardwareLabel(origin?: string, tier?: string) {
  const o: Record<string,string> = { chinese: 'Chino', european: 'Europeo', national: 'Nacional', mixed: 'Mixto' }
  const t: Record<string,string> = { economic: 'Económico', standard: 'Estándar', premium: 'Premium' }
  return [o[origin || ''], t[tier || '']].filter(Boolean).join(' · ')
}

export function glassFeatureLabel(feature?: string) {
  const map: Record<string, string> = {
    standard: 'Estándar',
    control_solar: 'Control solar',
    acoustic: 'Acústico',
    acoustic_control_solar: 'Acústico + control solar',
    acid_etched: 'Al ácido / translúcido',
    decorative: 'Decorativo',
    other: 'Especial'
  }
  return map[feature || ''] || ''
}

export function glassTypeLabel(type?: string) {
  const map: Record<string, string> = {
    normal: 'Normal',
    tempered: 'Templado',
    laminated: 'Laminado',
    tempered_laminated: 'Templado-laminado',
    other: 'Otro'
  }
  return map[type || ''] || 'Por definir'
}

function dimensions(a?: Assessment | null) {
  if (!a) return 'Por confirmar'
  const pieces: string[] = []
  if (a.widthM) pieces.push(`ancho ${a.widthM} m`)
  if (a.heightM) pieces.push(`alto ${a.heightM} m`)
  if (a.lengthM) pieces.push(`largo ${a.lengthM} m`)
  if (a.quantity && a.quantity > 1) pieces.push(`cantidad ${a.quantity}`)
  return pieces.length ? pieces.join(' · ') : 'Por confirmar'
}

export function buildItemBrief(a?: Assessment | null, estimate?: Estimate, index?: number) {
  if (!a) return ''
  const title = `${index ? `${index}. ` : ''}${a.projectLabel || a.projectType || 'Trabajo'}`
  const glass = [glassTypeLabel(a.glassType), glassFeatureLabel(a.glassFeature), a.glassColor || null, a.glassThicknessMm ? `${a.glassThicknessMm} mm` : null].filter(Boolean).join(' · ')
  const aluminumParts = [
    aluminumBrandLabel(a.aluminumBrand),
    aluminumOriginLabel(a.aluminumOrigin),
    a.aluminumSystem || null,
    aluminumTierLabel(a.aluminumTier),
    a.aluminumColor || null
  ].filter(Boolean)
  const aluminum = aluminumParts.length ? aluminumParts.join(' · ') : 'Por definir'
  const hardware = hardwareLabel(a.hardwareOrigin, a.hardwareTier)
  const value = estimate ? `$${estimate.low.toFixed(2)} – $${estimate.high.toFixed(2)}` : 'Pendiente de revisión'

  return [
    title,
    `Pedido: ${a.clientRequestSummary || 'Sin resumen'}`,
    `Medidas: ${dimensions(a)}`,
    `Aluminio: ${aluminum}`,
    `Vidrio: ${glass}`,
    hardware ? `Herrajes: ${hardware}` : null,
    `Servicio: ${supplyLabel(a.supplyMode)}`,
    a.detectedNeeds?.length ? `Incluye / considerar: ${a.detectedNeeds.join(', ')}` : null,
    a.recommendedGlass ? `Orientación de vidrio: ${a.recommendedGlass}${a.recommendationReason ? ` — ${a.recommendationReason}` : ''}` : null,
    `Visita técnica: ${a.needsVisit ? 'Sí' : 'No / por confirmar'}`,
    `Estimación: ${value}`,
    a.missing?.length ? `Falta confirmar: ${a.missing.join(', ')}` : null,
    a.nextStep ? `Siguiente paso: ${a.nextStep}` : null
  ].filter(Boolean).join('\n')
}

export function buildLeadBrief(args: {
  contact: ContactDraft
  assessment?: Assessment | null
  estimate?: Estimate
  projectItems?: Item[]
}) {
  const { contact, assessment, estimate } = args
  const rawItems = args.projectItems || []
  const items = rawItems.length ? rawItems : [{ assessment, estimate }]
  const itemBlocks = items.map((x, i) => buildItemBrief(x.assessment, x.estimate, items.length > 1 ? i + 1 : undefined)).filter(Boolean)

  return [
    `CLIENTE: ${contact.fullName}`,
    `WhatsApp / teléfono: ${contact.phone}`,
    contact.email ? `Email: ${contact.email}` : null,
    `Instalación: ${contact.city}${contact.sector ? ` · sector ${contact.sector}` : ''}${contact.province ? `, ${contact.province}` : ''}, Ecuador`,
    `Dirección: ${contact.address || 'Por confirmar / se compartirá por WhatsApp'}`,
    '',
    itemBlocks.join('\n\n')
  ].filter(x => x !== null).join('\n')
}
