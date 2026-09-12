export type SupplyMode =
  | 'company_supplies_and_installs'
  | 'client_buys_we_install'
  | 'client_has_materials_install'
  | 'custom_installation'
  | 'unknown'

export type QuoteMode = 'automatic' | 'estimate_visit' | 'technical'

export type ContactDraft = {
  fullName: string
  phone: string
  email: string
  city: string
  province: string
  address: string
  country: string
}

export type Assessment = {
  scope: 'in_scope' | 'out_of_scope'
  reply: string
  projectType: string
  projectLabel: string
  quoteMode: QuoteMode
  supplyMode: SupplyMode
  widthM: number | null
  heightM: number | null
  lengthM: number | null
  quantity: number | null
  existingStructure: 'yes' | 'no' | 'partial' | 'unknown'
  riskLevel: 'normal' | 'technical' | 'safety_critical'
  needsVisit: boolean
  missing: string[]
  detectedNeeds: string[]
  readyToLead: boolean
  confidence: number
  clientRequestSummary: string
  providedData: string[]
  recommendedSolution: string
  recommendedGlass: string
  glassAlternatives: string[]
  recommendationReason: string
  technicalNotes: string[]
  nextStep: string

  aluminumBrand: 'cedal' | 'andesia' | 'other' | 'unknown'
  aluminumColor: string
  glassType: 'normal' | 'tempered' | 'laminated' | 'tempered_laminated' | 'other' | 'unknown'
  glassColor: string
  glassFeature: 'standard' | 'control_solar' | 'acoustic' | 'acid_etched' | 'decorative' | 'other' | 'unknown'
  glassThicknessMm: number | null

  contact: ContactDraft
  conversationStage: 'project' | 'contact' | 'confirm'
  readyToSubmit: boolean
}

export type EstimateBreakdownLine = {
  kind: 'profile' | 'glass' | 'accessory' | 'labor'
  label: string
  quantity: number
  unit: string
  amount: number
}

export type Estimate = {
  low: number
  high: number
  base: number
  currency: string
  note: string
  source?: 'granular' | 'service_rate' | 'labor_only'
  recipeLabel?: string
  breakdown?: EstimateBreakdownLine[]
} | null
