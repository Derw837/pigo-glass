import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { preGate } from '@/lib/scope-gate'
import { createAdminClient } from '@/lib/supabase/admin'
import { estimateProject } from '@/lib/quote-engine'
import { estimateGranularProject } from '@/lib/granular-quote-engine'
import { enrichAssessmentNeeds, glassGuidanceFallback } from '@/lib/installation-rules'
import type { Assessment, ContactDraft, Estimate } from '@/lib/types'

export const runtime = 'nodejs'

const SYSTEM = `Eres el asesor virtual de una empresa ecuatoriana especializada EXCLUSIVAMENTE en VIDRIO, PERFILERÍA DE ALUMINIO y su INSTALACIÓN.

MODELO DEL NEGOCIO
- Atendemos instalaciones únicamente dentro de Ecuador.
- NO somos constructora: no hacemos obra civil, estructura metálica completa, albañilería, electricidad ni plomería.
- NO vendemos vidrio, aluminio ni accesorios sueltos sin instalación.
- Sí suministramos vidrio, aluminio, herrajes y accesorios cuando NOSOTROS realizamos la instalación.
- También podemos instalar materiales que el cliente compre por su cuenta o que ya tenga.

TRABAJOS QUE SÍ ATENDEMOS
Ventanas fijas, corredizas y proyectables; puertas de vidrio/aluminio; mamparas; cortinas de baño; divisiones; espejos; barandas/pasamanos de vidrio para balcones, terrazas, escaleras y centros comerciales; cerramientos; vidrio y perfilería para cubiertas, techos y pérgolas sobre una estructura apta; fachadas de vidrio; reparaciones; vidrio templado, laminado, acústico y curvo; fuentes y trabajos decorativos en la parte correspondiente a vidrio/perfilería; y otros proyectos especiales relacionados.

FORMA DE HABLAR
- Habla como un asesor comercial profesional, amable y natural. Español latinoamericano claro, fácil de entender y sin tecnicismos innecesarios.
- No seas excesivamente formal ni uses confianza excesiva. Evita “de una”, “bro”, “amigo”, “mi pana” y expresiones similares.
- Puedes iniciar con “Claro”, “Entiendo”, “Muy bien”, “Listo” o ir directo a la respuesta, pero no repitas siempre la misma palabra.
- Evita frases burocráticas si una frase sencilla funciona mejor.
- Haz UNA o DOS preguntas útiles por turno. No conviertas el chat en un interrogatorio.
- NO repitas datos que el cliente ya dio, salvo una confirmación breve cuando sea útil.
- Mantén el hilo aunque responda “negro”, “CEDAL”, “6 mm”, “incluye todo”, “sí”, “no”, “¿cuánto sale?”.
- Si el cliente elige algo distinto de tu recomendación, registra su elección. Si existe una consideración real de seguridad, menciónala una sola vez y deja la decisión técnica final al equipo.
- No repitas advertencias de visita, apoyos o seguridad en todos los mensajes.

VARIOS TRABAJOS EN UNA MISMA SOLICITUD
- El sistema puede guardar varias ventanas/trabajos en una sola solicitud.
- Cuando recibas NEW_PROJECT_MODE=true estás atendiendo un NUEVO trabajo adicional. En ese caso, TODOS los campos del assessment (projectType, projectLabel, medidas, vidrio, aluminio, detectedNeeds, clientRequestSummary, providedData, technicalNotes, etc.) deben describir SOLAMENTE ese trabajo nuevo.
- NUNCA combines el trabajo anterior dentro del assessment del trabajo actual. Los trabajos anteriores ya están guardados por la interfaz.
- Sí puedes reutilizar los datos de contacto ya conocidos; no vuelvas a pedir nombre, teléfono o ciudad si ya están confirmados.
- Si el cliente decide no continuar con el nuevo trabajo y dice algo como “mejor solo el anterior”, “solo hago el primero”, “quita el segundo” o equivalente, no intentes convencerlo.
- Los botones de la interfaz son solo atajos. El cliente puede seguir escribiendo normalmente aunque los botones estén visibles; no dependas de que pulse un botón para entender la conversación.
- Si el cliente dice “también quiero...”, “además agrega...” o describe claramente otro producto cuando el anterior ya estaba completo, trátalo como un trabajo adicional y no como una modificación del anterior.

CUÁNDO UN TRABAJO ESTÁ SUFICIENTEMENTE DEFINIDO
readyToLead=true significa que el trabajo ACTUAL ya tiene suficiente información para que un técnico/comercial pueda cotizarlo o revisarlo sin tener que leer toda la conversación.
- Ventanas/puertas: tipo, medidas aproximadas, vidrio elegido o una recomendación aceptable, aluminio/marca/color cuando aplique y modalidad de suministro/instalación.
- Cubiertas/pérgolas: medidas aproximadas, si existe estructura de apoyo, vidrio solicitado o prestación deseada y modalidad del servicio. Los detalles estructurales pueden quedar pendientes para revisión técnica.
- Mamparas/cortinas de baño: medidas aproximadas, estilo básico (con o sin perfilería si se sabe), vidrio/preferencia y modalidad del servicio.
- Barandas/pasamanos: recorrido/medidas aproximadas y descripción suficiente; siempre pueden quedar detalles de anclaje para revisión técnica.
- Proyecto especial: descripción clara y, cuando sea posible, medidas o foto de referencia. No interrogues indefinidamente si el equipo ya puede entender qué quiere el cliente.
- Si faltan datos opcionales que un técnico puede confirmar después, eso NO debe impedir readyToLead=true.

ALUMINIO
- CEDAL: opción principal/de mayor nivel dentro del catálogo de la empresa.
- Andesía: alternativa más económica.
- No desacredites ninguna marca.
- Pregunta marca y color solo cuando el trabajo realmente use perfilería de aluminio.

REGLAS COMERCIALES INICIALES DE VIDRIO DE ESTA EMPRESA
Estas reglas reflejan lo que la empresa desea ofrecer en su catálogo inicial. No afirmes que son reglas universales del mercado.
- Control solar: dentro de esta oferta inicial, manéjalo como vidrio LAMINADO con control solar desde 8 mm en adelante. Si el cliente pregunta por 6 mm normal con control solar, explica que nuestra opción de control solar se cotiza laminada desde 8 mm.
- Control acústico/ruido: ofrece vidrio laminado acústico (dos o más hojas unidas con PVB/interlámina acústica cuando esté disponible). Explica que reduce considerablemente la transmisión de ruido, pero no promete “silencio total”; el resultado también depende del marco, sellado y composición.
- Cortinas de baño/mamparas: la opción recomendada y más elegante es vidrio templado con herrajes, sin marco de aluminio cuando el diseño lo permita. Si el cliente quiere privacidad, puede consultar templado translúcido/al ácido o decorativo compatible. También existen diseños con perfilería de aluminio; en zonas de ducha no presentes vidrio recocido común como la recomendación de seguridad.
- Cubiertas/pérgolas sobre personas: prioriza vidrio laminado de seguridad. 8 mm o más puede ser una referencia comercial frecuente, pero NUNCA confirmes espesor definitivo sin revisar luces, apoyos y composición. Si el cliente pide laminado de 6 mm para ahorrar, registra la preferencia pero aclara brevemente que debe validarse técnicamente. Si pide vidrio normal monolítico de 6 mm para una cubierta, no lo recomiendes como solución segura; registra la solicitud y deriva a revisión técnica.
- Ventanas pequeñas y de bajo riesgo: el cliente puede solicitar vidrio normal desde 4 mm cuando sea compatible con el sistema y la ubicación.
- Ventanas accesibles desde planta baja, cercanas al tránsito de personas, a baja altura o cuando el cliente prioriza seguridad contra intrusión: sugiere laminado. En pisos altos no asumas automáticamente que vidrio normal es adecuado: si existe riesgo de caída, fachada o paño a baja altura, se necesita vidrio de seguridad según el caso.
- Barandas/pasamanos de vidrio: son elementos de protección contra caídas. Recomienda vidrio de seguridad y revisión técnica del sistema completo. Laminado o templado-laminado son opciones a estudiar por su retención de fragmentos; no cierres una especificación solo desde el chat.
- Puertas y divisiones en zonas de impacto: orienta a templado o laminado según el sistema y la necesidad.
- Vidrio curvo, fachadas especiales, pisos transitables, acuarios/fuentes estructurales y trabajos no convencionales: clasificación técnica; no inventes espesor ni composición.

DATOS ESTRUCTURADOS DEL VIDRIO
- glassFeature='control_solar' cuando el cliente pide control solar; 'acoustic' cuando pide reducción de ruido; 'acid_etched' para al ácido/translúcido; 'decorative' para catedral/decorativo; 'standard' para vidrio común sin prestación especial; 'unknown' si no está claro.
- glassColor describe el color/tonalidad (claro, bronce, gris, etc.), no la prestación.

SEGURIDAD
- Nunca afirmes que una solución cumple estructural o normativamente basándote solo en una fotografía.
- Nunca inventes medidas desde una foto. Usa únicamente medidas escritas por el cliente.
- En trabajos sobre personas, barreras contra caídas o zonas de impacto, prioriza seguridad y revisión técnica.
- Si el cliente pide una alternativa económica que puede ser inadecuada para el uso, registra la preferencia pero no la presentes como recomendación segura.

VISITA TÉCNICA
- NO conviertas toda ventana común en “visita obligatoria”. Puede pasar a cotización preliminar con las medidas del cliente.
- needsVisit=true cuando por seguridad o complejidad conviene revisar el sitio: barandas/pasamanos contra caídas, cubiertas, estructuras dudosas, vidrio curvo, fuentes especiales, formas irregulares, fachadas especiales u otros casos técnicos.
- Una futura toma de medidas de fabricación no significa que debas bloquear la cotización preliminar.
- Si el cliente dice “por ahora solo quiero la cotización”, respétalo: toma los datos mínimos y no exijas dirección exacta ni agendar visita.

MATERIALES Y ACCESORIOS
El cliente no tiene que conocer los accesorios; dedúcelos en detectedNeeds sin convertirlos en un despiece definitivo.
- Ventana corrediza: perfilería, vidrio, felpa, ruedas, cierre/seguro, empaques cuando apliquen, silicona/sellado y fijaciones.
- Ventana fija: perfilería, vidrio, junquillos/empaques, silicona/sellado y fijaciones.
- Ventana proyectable: perfilería, vidrio, brazos/herrajes, cierre, empaques, sellado y fijaciones.
- Cortina de baño/mampara sin marco: vidrio templado, bisagras/soportes o guía según diseño, tirador, sellos y silicona sanitaria.
- Cortina de baño/mampara con aluminio: perfilería, vidrio de seguridad adecuado, guías/ruedas si es corrediza, tirador, sellos y silicona sanitaria.
- Cubiertas/pérgolas: vidrio, apoyos o perfiles de unión que correspondan, ángulos/perfiles T si el sistema los usa, calzos/empaques, sellado y fijaciones compatibles.
- Barandas/pasamanos: vidrio de seguridad, perfil/herrajes, anclajes, calzos/empaques y acabados.

FOTOGRAFÍAS
- Puedes analizar fotos del espacio, trabajo existente o imágenes de referencia.
- No generas ni editas imágenes.
- Si la foto es claramente personal o no guarda relación con vidrio/aluminio, pide una foto del espacio o del trabajo de referencia.

PRECIOS
- Nunca inventes cifras. El servidor calcula cualquier estimación usando datos internos de Supabase.
- Tu reply NO debe crear precios, rangos ni valores monetarios por tu cuenta.
- Si el servidor no tiene una tarifa automática y el cliente pregunta precio, dilo UNA sola vez de manera natural: “Con lo que ya me indicaste puedo dejar la solicitud lista para que el equipo prepare el valor.” Después toma los datos de contacto.
- quoteMode=automatic para trabajos sencillos con reglas y precios configurados; estimate_visit cuando puede darse referencia pero conviene revisar; technical cuando realmente necesita estudio.

DATOS DEL CLIENTE DENTRO DEL CHAT
Cuando ya entiendas el trabajo, toma los datos sin mostrar ni mencionar un formulario externo.
1. Pide nombre y apellido + WhatsApp/teléfono si todavía no los conoces.
2. Luego pide la ciudad dentro de Ecuador si todavía no la conoces.
3. La dirección exacta NO es obligatoria para enviar una solicitud preliminar. Si la da, guárdala. Si la dará después, acepta sin insistir.
4. Correo opcional.
5. Conserva los datos confirmados; no los borres en turnos posteriores.
6. readyToSubmit=true solo cuando readyToLead=true Y ya existen nombre, teléfono y ciudad en Ecuador.
7. Cuando llegues a ese punto, dilo brevemente: “Ya tengo lo necesario. Puedes enviarlo cuando quieras.” La interfaz mostrará los botones.
8. NUNCA digas que la solicitud fue enviada o recibida. Solo la interfaz puede confirmarlo después de guardar en Supabase.

RESUMEN INTERNO PARA EL EQUIPO
- clientRequestSummary debe describir SOLAMENTE el trabajo actual y ser autónomo: qué es, cantidad/medidas, aluminio si aplica, vidrio, modalidad del servicio y observaciones importantes.
- NO metas otros trabajos previos dentro de clientRequestSummary cuando estés en modo de trabajo adicional.
- providedData = hechos confirmados del trabajo ACTUAL. No dupliques la misma frase con pequeñas variaciones.
- technicalNotes = solo revisiones técnicas reales, concretas y no repetitivas.
- missing = solo datos útiles pendientes. No pongas dirección exacta como faltante obligatorio.
- detectedNeeds = lista corta y limpia, evitando duplicar “Vidrio” si ya escribiste “Vidrio laminado con control solar”, o “Instalación” si ya hay una frase más específica.
- nextStep = acción concreta para el equipo.

FUERA DE ALCANCE
Si preguntan cultura general, programación, tareas, política, recetas, deportes, entretenimiento, generación de imágenes o cualquier tema ajeno, scope=out_of_scope y responde únicamente que este asistente atiende vidrio, aluminio e instalación.`

const contactSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    fullName: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string' },
    city: { type: 'string' },
    province: { type: 'string' },
    address: { type: 'string' },
    country: { type: 'string' }
  },
  required: ['fullName', 'phone', 'email', 'city', 'province', 'address', 'country']
}

const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    scope: { type: 'string', enum: ['in_scope', 'out_of_scope'] },
    reply: { type: 'string' },
    projectType: { type: 'string' },
    projectLabel: { type: 'string' },
    quoteMode: { type: 'string', enum: ['automatic', 'estimate_visit', 'technical'] },
    supplyMode: { type: 'string', enum: ['company_supplies_and_installs', 'client_buys_we_install', 'client_has_materials_install', 'custom_installation', 'unknown'] },
    widthM: { type: ['number', 'null'] },
    heightM: { type: ['number', 'null'] },
    lengthM: { type: ['number', 'null'] },
    quantity: { type: ['number', 'null'] },
    existingStructure: { type: 'string', enum: ['yes', 'no', 'partial', 'unknown'] },
    riskLevel: { type: 'string', enum: ['normal', 'technical', 'safety_critical'] },
    needsVisit: { type: 'boolean' },
    missing: { type: 'array', items: { type: 'string' } },
    detectedNeeds: { type: 'array', items: { type: 'string' } },
    readyToLead: { type: 'boolean' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    clientRequestSummary: { type: 'string' },
    providedData: { type: 'array', items: { type: 'string' } },
    recommendedSolution: { type: 'string' },
    recommendedGlass: { type: 'string' },
    glassAlternatives: { type: 'array', items: { type: 'string' } },
    recommendationReason: { type: 'string' },
    technicalNotes: { type: 'array', items: { type: 'string' } },
    nextStep: { type: 'string' },
    aluminumBrand: { type: 'string', enum: ['cedal', 'andesia', 'other', 'unknown'] },
    aluminumColor: { type: 'string' },
    glassType: { type: 'string', enum: ['normal', 'tempered', 'laminated', 'tempered_laminated', 'other', 'unknown'] },
    glassColor: { type: 'string' },
    glassFeature: { type: 'string', enum: ['standard','control_solar','acoustic','acid_etched','decorative','other','unknown'] },
    glassThicknessMm: { type: ['number', 'null'] },
    contact: contactSchema,
    conversationStage: { type: 'string', enum: ['project', 'contact', 'confirm'] },
    readyToSubmit: { type: 'boolean' }
  },
  required: [
    'scope','reply','projectType','projectLabel','quoteMode','supplyMode','widthM','heightM','lengthM','quantity','existingStructure','riskLevel','needsVisit','missing','detectedNeeds','readyToLead','confidence','clientRequestSummary','providedData','recommendedSolution','recommendedGlass','glassAlternatives','recommendationReason','technicalNotes','nextStep','aluminumBrand','aluminumColor','glassType','glassColor','glassFeature','glassThicknessMm','contact','conversationStage','readyToSubmit'
  ]
}

const categoryFallback: Record<string, string> = {
  window: 'window_sliding',
  door: 'door',
  railing: 'railing',
  cover: 'cover_existing',
  pergola: 'pergola_glass',
  shower: 'shower',
  bath_curtain: 'bath_curtain',
  mirror: 'mirror',
  special: 'special',
  none: 'special'
}

const knownServiceKeys = new Set([
  'window_sliding','window_fixed','window_projectable','door','railing','cover_existing','pergola_glass','shower','bath_curtain','mirror','partition','facade','special'
])

function resolveServiceKey(a: Assessment, selectedCategory?: string) {
  if (knownServiceKeys.has(a.projectType)) return a.projectType
  return categoryFallback[selectedCategory || 'none'] || 'special'
}

function mergeContact(previous: Partial<ContactDraft> | undefined, next: Partial<ContactDraft> | undefined): ContactDraft {
  const pick = (key: keyof ContactDraft) => String(next?.[key] || previous?.[key] || '').trim()
  return {
    fullName: pick('fullName'),
    phone: pick('phone'),
    email: pick('email'),
    city: pick('city'),
    province: pick('province'),
    address: pick('address'),
    country: pick('country') || 'Ecuador'
  }
}

function mergeAssessment(previous: Partial<Assessment> | undefined, next: Assessment): Assessment {
  if (!previous || !previous.projectType) return next
  return {
    ...next,
    widthM: next.widthM ?? previous.widthM ?? null,
    heightM: next.heightM ?? previous.heightM ?? null,
    lengthM: next.lengthM ?? previous.lengthM ?? null,
    quantity: next.quantity ?? previous.quantity ?? null,
    aluminumBrand: next.aluminumBrand === 'unknown' ? (previous.aluminumBrand || 'unknown') : next.aluminumBrand,
    aluminumColor: next.aluminumColor || previous.aluminumColor || '',
    glassType: next.glassType === 'unknown' ? (previous.glassType || 'unknown') : next.glassType,
    glassColor: next.glassColor || previous.glassColor || '',
    glassFeature: next.glassFeature === 'unknown' ? (previous.glassFeature || 'unknown') : next.glassFeature,
    glassThicknessMm: next.glassThicknessMm ?? previous.glassThicknessMm ?? null,
    supplyMode: next.supplyMode === 'unknown' ? (previous.supplyMode || 'unknown') : next.supplyMode,
    providedData: [...new Set([...(previous.providedData || []), ...(next.providedData || [])])]
  }
}

function isEcuador(contact: ContactDraft) {
  const c = contact.country.toLowerCase().trim()
  return !c || c === 'ecuador' || c === 'ec' || c.includes('ecuador')
}

function contactComplete(contact: ContactDraft) {
  return Boolean(contact.fullName && contact.phone && contact.city && isEcuador(contact))
}



function priceReply(estimate: Estimate) {
  if (!estimate) return ''
  return `Con los datos que me diste, el valor referencial está entre $${estimate.low.toFixed(2)} y $${estimate.high.toFixed(2)}. ${estimate.note}`
}

async function enforceBudget(req: NextRequest) {
  const db = createAdminClient()

  // Pruebas locales ilimitadas. En producción el límite por visitante sigue activo.
  const host = req.headers.get('host') || ''
  const isLocalDevelopment = process.env.NODE_ENV !== 'production' && (
    host.startsWith('localhost:') || host.startsWith('127.0.0.1:')
  )
  if (isLocalDevelopment) return { ok: true, reason: 'local-development' }

  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim()
  const ua = req.headers.get('user-agent') || ''
  const clientHash = createHash('sha256').update(`${ip}|${ua.slice(0,120)}|${process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-8) || 'pigo'}`).digest('hex')
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await db.from('ai_rate_limits').select('*', { count: 'exact', head: true }).eq('client_hash', clientHash).gte('created_at', hourAgo)
  if ((count || 0) >= Number(process.env.AI_MAX_REQUESTS_PER_HOUR || 12)) return { ok: false, reason: 'rate' }
  const { data: tokens } = await db.rpc('ai_tokens_today')
  if (Number(tokens || 0) >= Number(process.env.AI_DAILY_TOKEN_BUDGET || 150000)) return { ok: false, reason: 'budget' }
  await db.from('ai_rate_limits').insert({ client_hash: clientHash })
  return { ok: true, reason: 'ok' }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const messages = Array.isArray(body.messages) ? body.messages.slice(-14) : []
    const images = Array.isArray(body.images) ? body.images.slice(0, 3) : []
    const previousAssessment = (body.currentAssessment || null) as Partial<Assessment> | null
    const previousContact = (body.knownContact || previousAssessment?.contact || {}) as Partial<ContactDraft>

    const userIndex = [...messages].map((m: any, i: number) => ({ m, i })).reverse().find(x => x.m.role === 'user')?.i ?? -1
    const last = userIndex >= 0 ? String(messages[userIndex]?.text || '') : ''
    const previousContext = messages.slice(Math.max(0, userIndex - 8), Math.max(0, userIndex)).map((m: any) => String(m.text || '')).join(' ')
    const committedProjects = Array.isArray(body.committedProjects) ? body.committedProjects.slice(0, 20) : []
    const newProjectMode = Boolean(body.newProjectMode)
    const activeDomainConversation = Boolean(
      previousAssessment?.scope === 'in_scope' ||
      previousAssessment?.projectType ||
      newProjectMode ||
      committedProjects.length
    )
    const gate = preGate(last, body.selectedCategory, images.length > 0, previousContext, activeDomainConversation)

    if (!gate.allowed) {
      const reply = gate.kind === 'greeting'
        ? '¡Hola! 👋 Cuéntame qué quieres hacer en vidrio o aluminio. Si tienes medidas o una foto del espacio, mejor todavía.'
        : 'Por aquí te puedo ayudar solo con trabajos de vidrio, perfilería de aluminio e instalación. Si tienes algo de eso en mente, cuéntame o mándame una foto.'
      return NextResponse.json({ reply, assessment: previousAssessment || null, estimate: null, consumeImages: false, usedAI: false })
    }

    const budget = await enforceBudget(req)
    if (!budget.ok) {
      const reply = budget.reason === 'rate'
        ? 'Por ahora llegamos al límite de mensajes automáticos. Intenta un poco más tarde.'
        : 'El asesor automático está pausado temporalmente por el límite diario.'
      return NextResponse.json({ reply, assessment: previousAssessment || null, estimate: null, usedAI: false }, { status: 429 })
    }

    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Falta configurar OPENAI_API_KEY' }, { status: 500 })

    const contextSnapshot = {
      project: previousAssessment ? {
        projectType: previousAssessment.projectType,
        projectLabel: previousAssessment.projectLabel,
        widthM: previousAssessment.widthM,
        heightM: previousAssessment.heightM,
        lengthM: previousAssessment.lengthM,
        quantity: previousAssessment.quantity,
        existingStructure: previousAssessment.existingStructure,
        aluminumBrand: previousAssessment.aluminumBrand,
        aluminumColor: previousAssessment.aluminumColor,
        glassType: previousAssessment.glassType,
        glassColor: previousAssessment.glassColor,
        glassFeature: previousAssessment.glassFeature,
        glassThicknessMm: previousAssessment.glassThicknessMm,
        supplyMode: previousAssessment.supplyMode,
        providedData: previousAssessment.providedData
      } : null,
      contact: previousContact,
      NEW_PROJECT_MODE: newProjectMode,
      PREVIOUS_PROJECTS_ALREADY_STORED_DO_NOT_MERGE: committedProjects
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const input: any[] = [
      { role: 'system', content: [{ type: 'input_text', text: SYSTEM }] },
      { role: 'system', content: [{ type: 'input_text', text: `ESTADO YA CONFIRMADO. Si NEW_PROJECT_MODE=true, el bloque PREVIOUS_PROJECTS_ALREADY_STORED_DO_NOT_MERGE es SOLO referencia para saber que existen trabajos anteriores: jamás copies sus medidas/materiales al assessment actual. Conserva el contacto salvo corrección del cliente.\n${JSON.stringify(contextSnapshot)}` }] }
    ]

    for (const m of messages) {
      if (m.role === 'user' || m.role === 'assistant') {
        input.push({
          role: m.role,
          content: [{ type: m.role === 'assistant' ? 'output_text' : 'input_text', text: String(m.text).slice(0, 2400) }]
        })
      }
    }

    if (images.length) {
      input.push({
        role: 'user',
        content: [
          { type: 'input_text', text: 'Analiza estas imágenes solo para comprender el proyecto de vidrio/aluminio. Pueden ser fotos del espacio o referencias de lo que el cliente quiere. No inventes medidas visuales.' },
          ...images.map((x: string) => ({ type: 'input_image', image_url: x, detail: 'low' }))
        ]
      })
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      input,
      text: { format: { type: 'json_schema', name: 'pigo_glass_assessment_v7', strict: true, schema } } as any,
      max_output_tokens: 1450,
      store: false,
      prompt_cache_key: 'pigo-glass-advisor-v7'
    } as any)

    let assessment = JSON.parse(response.output_text) as Assessment
    assessment = mergeAssessment(previousAssessment || undefined, assessment)
    assessment.contact = mergeContact(previousContact, assessment.contact)

    if (!assessment.recommendedGlass) {
      const fallback = glassGuidanceFallback(assessment)
      if (fallback) {
        assessment.recommendedGlass = fallback.recommendedGlass
        assessment.recommendationReason = fallback.recommendationReason
        assessment.glassAlternatives = fallback.alternatives
      }
    }

    assessment = enrichAssessmentNeeds(assessment)
    const projectCaptured = assessment.scope === 'in_scope' && Boolean(assessment.projectType || assessment.projectLabel)
    assessment.readyToLead = Boolean(projectCaptured && assessment.readyToLead)
    assessment.readyToSubmit = Boolean(assessment.readyToLead && contactComplete(assessment.contact))
    if (assessment.readyToSubmit) assessment.conversationStage = 'confirm'
    else if (assessment.readyToLead) assessment.conversationStage = 'contact'
    else assessment.conversationStage = 'project'

    const db = createAdminClient()
    await db.from('ai_usage_log').insert({
      model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
      input_tokens: (response.usage as any)?.input_tokens || 0,
      output_tokens: (response.usage as any)?.output_tokens || 0,
      scope: 'public_quote',
      accepted: assessment.scope === 'in_scope'
    })

    if (assessment.scope === 'out_of_scope') {
      return NextResponse.json({ reply: assessment.reply, assessment: previousAssessment || null, estimate: null, usedAI: true })
    }

    const serviceKey = resolveServiceKey(assessment, body.selectedCategory)
    // Primero intentamos el motor granular (perfiles + vidrio + accesorios + mano de obra).
    // Si todavía no hay una receta habilitada/precios completos, mantenemos el estimador general como respaldo.
    const granularEstimate = await estimateGranularProject(db, assessment, serviceKey)
    const { data: rate } = await db.from('service_rates').select('*').eq('service_key', serviceKey).maybeSingle()
    const estimate = granularEstimate || estimateProject(assessment, rate as any)

    let reply = assessment.reply.trim()
    if (estimate) {
      const price = priceReply(estimate)
      if (!reply.includes('$')) reply = `${price}\n\n${reply}`
    }

    // El servidor NO finge envíos ni fuerza textos repetitivos.
    // La confirmación real de guardado la hace /api/leads y la muestra el modal del cliente.
    assessment.reply = reply
    return NextResponse.json({ reply, assessment, estimate, usedAI: true })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({
      error: 'No se pudo procesar el análisis',
      reply: 'No pude procesar ese mensaje en este momento, pero la información que ya diste sigue guardada en esta conversación. Intenta de nuevo en unos segundos.'
    }, { status: 500 })
  }
}
