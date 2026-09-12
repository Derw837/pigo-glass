import type { Assessment, Estimate, EstimateBreakdownLine } from '@/lib/types'

type Db = any

type Recipe = {
  id: string
  service_key: string
  brand: string
  label: string
  enabled: boolean
  price_mode: 'cost_plus_margin' | 'sale_prices'
  glass_area_factor: number
  waste_percent: number
  margin_percent: number
  error_percent: number
  minimum_charge: number
}

type Formula = 'width' | 'height' | 'perimeter' | 'area' | 'unit'

function round2(n: number) { return Math.round(n * 100) / 100 }
function num(v: any) { const n = Number(v); return Number.isFinite(n) ? n : 0 }

function dimensionQty(formula: Formula, a: Assessment) {
  const w = a.widthM ?? a.lengthM ?? 0
  const h = a.heightM ?? 0
  switch (formula) {
    case 'width': return w
    case 'height': return h
    case 'perimeter': return w && h ? 2 * (w + h) : 0
    case 'area': return w && h ? w * h : 0
    case 'unit': return 1
  }
}

function serviceQty(unit: 'm2' | 'ml' | 'unit', a: Assessment) {
  const count = Math.max(1, a.quantity || 1)
  if (unit === 'm2') {
    const w = a.widthM ?? a.lengthM ?? 0
    const h = a.heightM ?? 0
    return w && h ? w * h * count : 0
  }
  if (unit === 'ml') {
    const l = a.lengthM ?? a.widthM ?? 0
    return l * count
  }
  return count
}

function normalize(s: string) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

function inferFeature(a: Assessment) {
  if (a.glassFeature && a.glassFeature !== 'unknown') return a.glassFeature
  const hay = normalize([a.glassColor, a.recommendedGlass, a.clientRequestSummary, ...(a.detectedNeeds || [])].join(' '))
  if (hay.includes('control solar')) return 'control_solar'
  if (hay.includes('acust') || hay.includes('ruido')) return 'acoustic'
  if (hay.includes('acido') || hay.includes('transluc')) return 'acid_etched'
  if (hay.includes('catedral') || hay.includes('decor')) return 'decorative'
  return 'standard'
}

function choosePrice(row: any, recipe: Recipe, costKey: string, saleKey: string) {
  return recipe.price_mode === 'sale_prices' ? num(row?.[saleKey]) : num(row?.[costKey])
}

function catalogLinearPrice(row: any, recipe: Recipe) {
  const raw = choosePrice(row, recipe, 'cost_price', 'sale_price')
  if (!raw) return 0
  const unit = normalize(String(row.unit || 'barra'))
  if (unit === 'm' || unit === 'metro' || unit === 'ml') return raw
  const length = num(row.bar_length_m)
  if (!length) return 0
  return raw / length
}

async function estimateLaborOnly(db: Db, a: Assessment, serviceKey: string): Promise<Estimate> {
  const { data: labor } = await db.from('labor_rates').select('*').eq('service_key', serviceKey).eq('active', true).maybeSingle()
  if (!labor) return null
  const qty = serviceQty(labor.unit, a)
  if (!qty) return null
  const rate = num(labor.fabrication_rate) + num(labor.installation_rate)
  if (!rate) return null
  const base = Math.max(qty * rate, num(labor.minimum_charge))
  const err = 0.15
  return {
    base: round2(base), low: round2(base * (1 - err)), high: round2(base * (1 + err)), currency: 'USD',
    source: 'labor_only',
    note: 'Valor referencial de instalación/mano de obra. Los materiales no están incluidos.',
    breakdown: [{ kind: 'labor', label: labor.label, quantity: round2(qty), unit: labor.unit, amount: round2(base) }]
  }
}

export async function estimateGranularProject(db: Db, a: Assessment, serviceKey: string): Promise<Estimate> {
  if (a.scope !== 'in_scope' || a.quoteMode === 'technical') return null

  if (a.supplyMode === 'client_buys_we_install' || a.supplyMode === 'client_has_materials_install') {
    return estimateLaborOnly(db, a, serviceKey)
  }
  if (a.supplyMode !== 'company_supplies_and_installs') return null

  const brand = a.aluminumBrand === 'cedal' ? 'CEDAL' : a.aluminumBrand === 'andesia' ? 'ANDESIA' : 'ANY'
  const { data: recipe } = await db.from('quote_recipes').select('*').eq('service_key', serviceKey).eq('brand', brand).eq('enabled', true).maybeSingle()
  if (!recipe) return null
  const r = recipe as Recipe

  const count = Math.max(1, a.quantity || 1)
  const { data: profileRules } = await db.from('quote_recipe_profiles').select('*').eq('recipe_id', r.id).order('sort_order')
  const refs = [...new Set((profileRules || []).map((x: any) => String(x.catalog_reference)))]
  const { data: catalogRows } = refs.length
    ? await db.from('catalog_items').select('brand,reference,name,unit,bar_length_m,cost_price,sale_price,active').eq('brand', brand).in('reference', refs).eq('active', true)
    : { data: [] }
  const catalog = new Map((catalogRows || []).map((x: any) => [String(x.reference), x]))

  const breakdown: EstimateBreakdownLine[] = []
  let materialSubtotal = 0

  for (const line of profileRules || []) {
    const row: any = catalog.get(String(line.catalog_reference))
    if (!row) return null
    const priceM = catalogLinearPrice(row, r)
    if (!priceM) return null
    let meters = dimensionQty(line.formula as Formula, a) * num(line.multiplier) * count
    meters *= 1 + num(line.waste_percent) / 100
    if (!meters) return null
    const amount = meters * priceM
    materialSubtotal += amount
    breakdown.push({ kind: 'profile', label: `${row.reference} · ${line.role}`, quantity: round2(meters), unit: 'm', amount: round2(amount) })
  }

  // Vidrio exacto: si no encontramos la presentación pedida, preferimos NO inventar un precio.
  const feature = inferFeature(a)
  let glassQuery = db.from('glass_catalog').select('*').eq('active', true).eq('glass_type', a.glassType)
  glassQuery = glassQuery.eq('feature', feature)
  if (a.glassThicknessMm) glassQuery = glassQuery.eq('thickness_mm', a.glassThicknessMm)
  const { data: glasses } = await glassQuery.limit(20)
  const colorWanted = normalize(a.glassColor)
  const candidates = (glasses || []).filter((g: any) => {
    if (!colorWanted) return true
    const c = normalize(g.color)
    return c === colorWanted || c.includes(colorWanted) || colorWanted.includes(c)
  })
  const glass = candidates[0] || (glasses || [])[0]
  if (!glass) return null
  const glassPrice = choosePrice(glass, r, 'cost_price_m2', 'sale_price_m2')
  if (!glassPrice) return null
  const w = a.widthM ?? a.lengthM ?? 0
  const h = a.heightM ?? 0
  if (!w || !h) return null
  const glassArea = w * h * num(r.glass_area_factor || 1) * count
  const glassAmount = glassArea * glassPrice
  materialSubtotal += glassAmount
  breakdown.push({ kind: 'glass', label: glass.label, quantity: round2(glassArea), unit: 'm²', amount: round2(glassAmount) })

  const { data: accessoryRules } = await db.from('quote_recipe_accessories').select('*').eq('recipe_id', r.id).order('sort_order')
  const codes = [...new Set((accessoryRules || []).map((x: any) => String(x.accessory_code)))]
  const { data: accessoryRows } = codes.length
    ? await db.from('accessory_catalog').select('*').in('code', codes).eq('active', true)
    : { data: [] }
  const accessories = new Map((accessoryRows || []).map((x: any) => [String(x.code), x]))

  for (const rule of accessoryRules || []) {
    const row: any = accessories.get(String(rule.accessory_code))
    if (!row) return null
    const price = choosePrice(row, r, 'cost_price', 'sale_price')
    if (!price) return null
    const q = dimensionQty(rule.formula as Formula, a) * num(rule.multiplier) * count
    if (!q) continue
    const amount = q * price
    materialSubtotal += amount
    breakdown.push({ kind: 'accessory', label: row.label, quantity: round2(q), unit: row.unit, amount: round2(amount) })
  }

  const { data: labor } = await db.from('labor_rates').select('*').eq('service_key', serviceKey).eq('active', true).maybeSingle()
  if (!labor) return null
  const laborQty = serviceQty(labor.unit, a)
  const laborRate = num(labor.fabrication_rate) + num(labor.installation_rate)
  if (!laborQty || !laborRate) return null
  let laborAmount = laborQty * laborRate
  laborAmount = Math.max(laborAmount, num(labor.minimum_charge))
  breakdown.push({ kind: 'labor', label: labor.label, quantity: round2(laborQty), unit: labor.unit, amount: round2(laborAmount) })

  const materialsWithWaste = materialSubtotal * (1 + num(r.waste_percent) / 100)
  let base = materialsWithWaste + laborAmount
  if (r.price_mode === 'cost_plus_margin') base *= 1 + num(r.margin_percent) / 100
  base = Math.max(base, num(r.minimum_charge))
  const err = Math.max(0, num(r.error_percent)) / 100

  return {
    base: round2(base),
    low: round2(base * (1 - err)),
    high: round2(base * (1 + err)),
    currency: 'USD',
    source: 'granular',
    recipeLabel: r.label,
    note: a.needsVisit
      ? 'Estimación calculada con los precios configurados. El valor definitivo se confirma al verificar medidas y condiciones reales.'
      : 'Estimación calculada con los precios configurados y sujeta a verificación final de medidas.',
    breakdown
  }
}
