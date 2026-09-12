import type { Assessment, Estimate } from '@/lib/types'

export type ServiceRate = {
  service_key: string
  material_rate: number
  accessory_rate: number
  labor_rate: number
  installation_rate: number
  minimum_charge: number
  waste_percent: number
  margin_percent: number
  error_percent: number
  auto_quote: boolean
  unit: 'm2' | 'ml' | 'unit'
}

export function estimateProject(a: Assessment, rate?: ServiceRate | null): Estimate {
  if (!rate || !rate.auto_quote || a.scope !== 'in_scope' || a.quoteMode === 'technical') return null
  if (a.supplyMode === 'custom_installation' || a.supplyMode === 'unknown') return null

  let qty = 0
  if (rate.unit === 'm2') {
    const w = a.widthM ?? a.lengthM
    const h = a.heightM
    if (!w || !h) return null
    qty = w * h * Math.max(1, a.quantity ?? 1)
  } else if (rate.unit === 'ml') {
    const l = a.lengthM ?? a.widthM
    if (!l) return null
    qty = l * Math.max(1, a.quantity ?? 1)
  } else {
    qty = Math.max(1, a.quantity ?? 1)
  }

  // La empresa nunca vende materiales sueltos. Solo hay dos caminos cotizables:
  // 1) nosotros suministramos + instalamos; 2) el cliente compra/tiene material + nosotros instalamos.
  const companySupplies = a.supplyMode === 'company_supplies_and_installs'
  const supplies = companySupplies ? rate.material_rate + rate.accessory_rate : 0
  const labor = rate.labor_rate + rate.installation_rate

  let base = qty * (supplies + labor)
  if (companySupplies) base *= (1 + rate.waste_percent / 100)
  base *= (1 + rate.margin_percent / 100)
  base = Math.max(base, rate.minimum_charge)

  const err = Math.max(0, rate.error_percent) / 100
  return {
    base: Math.round(base * 100) / 100,
    low: Math.round(base * (1 - err) * 100) / 100,
    high: Math.round(base * (1 + err) * 100) / 100,
    currency: 'USD',
    source: 'service_rate',
    note: a.needsVisit
      ? 'Valor referencial. El precio definitivo se confirma después de revisar medidas y condiciones de instalación.'
      : 'Valor referencial sujeto a verificación de medidas, materiales y condiciones reales.'
  }
}
