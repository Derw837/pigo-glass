import type { Assessment } from '@/lib/types'

const RULES: Record<string, string[]> = {
  window_sliding: ['Perfilería de aluminio', 'Vidrio', 'Felpa', 'Ruedas', 'Cierre o seguro', 'Empaques si aplican', 'Silicona / sellado', 'Tornillería y fijaciones'],
  window_fixed: ['Perfilería de aluminio', 'Vidrio', 'Junquillos o empaques', 'Silicona / sellado', 'Tornillería y fijaciones'],
  window_projectable: ['Perfilería de aluminio', 'Vidrio', 'Brazos o herrajes proyectables', 'Cierre', 'Empaques', 'Silicona / sellado', 'Tornillería y fijaciones'],
  door: ['Perfilería de aluminio o herrajes según diseño', 'Vidrio', 'Herrajes', 'Cierre', 'Silicona / sellado', 'Tornillería y fijaciones'],
  railing: ['Vidrio de seguridad', 'Perfilería o herrajes de sujeción', 'Anclajes', 'Calzos / empaques', 'Sellado y acabados', 'Instalación técnica'],
  cover_existing: ['Vidrio de seguridad', 'Perfiles o apoyos de unión según diseño', 'Ángulos / perfiles T cuando correspondan', 'Calzos / empaques', 'Sellado', 'Fijaciones compatibles', 'Instalación sobre estructura existente'],
  pergola_glass: ['Vidrio de seguridad', 'Perfilería de apoyo o unión', 'Calzos / empaques', 'Sellado', 'Fijaciones compatibles', 'Instalación sobre estructura portante apta'],
  shower: ['Vidrio de seguridad para ducha', 'Herrajes o perfilería según diseño', 'Guías / ruedas si es corrediza', 'Tirador', 'Sellos', 'Silicona sanitaria', 'Instalación'],
  bath_curtain: ['Vidrio de seguridad para ducha', 'Herrajes o perfilería según diseño', 'Guías / ruedas si es corrediza', 'Tirador', 'Sellos', 'Silicona sanitaria', 'Instalación'],
  mirror: ['Espejo', 'Adhesivo o sistema de fijación', 'Acabado de cantos si aplica', 'Instalación'],
  partition: ['Vidrio', 'Perfilería o herrajes', 'Junquillos o empaques si aplican', 'Silicona / sellado', 'Fijaciones', 'Instalación'],
  facade: ['Vidrio de seguridad según ubicación', 'Perfilería de aluminio', 'Sellos y empaques', 'Fijaciones', 'Instalación técnica'],
  special: ['Vidrio', 'Perfilería o accesorios según diseño', 'Sellado / fijaciones', 'Instalación']
}

export function commonInstallationNeeds(projectType: string) {
  return RULES[projectType] ?? RULES.special
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function isRedundant(generic: string, existing: string[]) {
  const g = normalize(generic)
  const normalizedExisting = existing.map(normalize)

  if (g === 'vidrio') return normalizedExisting.some(x => x.includes('vidrio ') && x !== 'vidrio')
  if (g === 'instalacion') return normalizedExisting.some(x => x.includes('instalacion ') && x !== 'instalacion')
  if (g.includes('sellado') && g.includes('fijaciones')) {
    return normalizedExisting.some(x => x.includes('sellado') && x.includes('fijacion'))
  }
  return normalizedExisting.some(x => x === g)
}

export function enrichAssessmentNeeds(a: Assessment): Assessment {
  const specific = [...new Set((a.detectedNeeds || []).filter(Boolean))]
  const common = commonInstallationNeeds(a.projectType)
  const merged = [...specific]

  for (const item of common) {
    if (!isRedundant(item, merged)) merged.push(item)
  }

  // Mantener la ficha comercial corta y legible.
  return { ...a, detectedNeeds: merged.slice(0, 10) }
}

function combinedText(a: Assessment) {
  return [
    a.clientRequestSummary,
    a.recommendedSolution,
    a.glassColor,
    ...(a.providedData || []),
    ...(a.detectedNeeds || [])
  ].filter(Boolean).join(' ').toLowerCase()
}

export function glassGuidanceFallback(a: Assessment) {
  const area = (a.widthM && a.heightM) ? a.widthM * a.heightM : null
  const text = combinedText(a)
  const acoustic = /ac[uú]st|ruido|sonido/.test(text)
  const solar = /control solar|solar/.test(text)
  const groundOrAccessible = /planta baja|primer piso|piso bajo|accesible|calle|peatonal|paso de personas/.test(text)

  if (acoustic) {
    return {
      recommendedGlass: 'Vidrio laminado acústico con interlámina de control de sonido',
      recommendationReason: 'El laminado acústico ayuda a amortiguar vibraciones y reducir la transmisión de ruido. El resultado final también depende del marco, el sellado y la composición completa.',
      alternatives: ['Unidad de vidrio aislante con composición acústica, si el sistema lo permite'] as string[]
    }
  }

  if (a.projectType === 'shower' || a.projectType === 'bath_curtain') {
    return {
      recommendedGlass: 'Vidrio templado de seguridad; sin marco si se busca un acabado más limpio',
      recommendationReason: 'En una ducha conviene usar vidrio de seguridad. Para privacidad se puede estudiar un acabado translúcido, al ácido o decorativo que sea compatible con el tratamiento de seguridad.',
      alternatives: ['Templado translúcido / al ácido', 'Sistema con perfilería de aluminio y vidrio de seguridad compatible'] as string[]
    }
  }

  if (a.projectType === 'railing') {
    return {
      recommendedGlass: 'Vidrio de seguridad para baranda, con composición por definir técnicamente',
      recommendationReason: 'Una baranda protege contra caídas; el vidrio, anclajes y sistema completo deben revisarse juntos. Se puede estudiar laminado o templado-laminado según el diseño.',
      alternatives: ['Laminado', 'Templado-laminado'] as string[]
    }
  }

  if (['cover_existing', 'pergola_glass'].includes(a.projectType)) {
    return {
      recommendedGlass: solar
        ? 'Vidrio laminado con control solar desde 8 mm dentro de la oferta inicial, sujeto a validación técnica'
        : 'Vidrio laminado de seguridad, con espesor/composición por definir técnicamente',
      recommendationReason: 'Al ser vidrio sobre personas conviene que, si ocurre una rotura, los fragmentos queden retenidos. El espesor depende de luces, apoyos, tamaño de paños y condiciones reales.',
      alternatives: ['Templado-laminado si el sistema y la especificación técnica lo requieren'] as string[]
    }
  }

  if (['window_fixed', 'window_sliding', 'window_projectable'].includes(a.projectType)) {
    if (groundOrAccessible) {
      return {
        recommendedGlass: 'Vidrio laminado como opción de seguridad para una ventana accesible',
        recommendationReason: 'El laminado mantiene los fragmentos unidos y puede dificultar una intrusión en comparación con un vidrio normal.',
        alternatives: ['Vidrio normal solo cuando la ubicación y el sistema sean adecuados', 'Vidrio templado según aplicación'] as string[]
      }
    }
    if (area && area >= 2.5) {
      return {
        recommendedGlass: 'Revisar una opción de vidrio de seguridad para el tamaño del paño',
        recommendationReason: 'En paños grandes conviene revisar ubicación, altura, apoyos y riesgo de impacto antes de definir el vidrio.',
        alternatives: ['Laminado', 'Templado según aplicación', 'Vidrio normal si la ubicación y el sistema lo permiten'] as string[]
      }
    }
  }

  if (a.projectType === 'door' || a.projectType === 'partition') {
    return {
      recommendedGlass: 'Vidrio de seguridad según el sistema, normalmente templado o laminado',
      recommendationReason: 'Puertas y divisiones pueden estar expuestas al impacto de personas, por lo que conviene revisar una solución de seguridad.',
      alternatives: ['Templado', 'Laminado'] as string[]
    }
  }

  return null
}
