'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { aluminumBrandLabel, glassFeatureLabel, glassTypeLabel, supplyLabel } from '@/lib/lead-summary'
import type { Assessment, ContactDraft, Estimate } from '@/lib/types'

const categories = [
  ['none', 'No sé qué necesito'],
  ['window', 'Ventanas'],
  ['door', 'Puertas'],
  ['railing', 'Barandas'],
  ['cover', 'Cubiertas / techos'],
  ['pergola', 'Pérgolas'],
  ['shower', 'Mamparas / duchas'],
  ['bath_curtain', 'Cortinas de baño'],
  ['mirror', 'Espejos'],
  ['special', 'Proyecto especial']
] as const

type Msg = { role: 'user' | 'assistant'; text: string }
type ProjectItem = { assessment: Assessment; estimate: Estimate; images: string[] }
type ConfirmationData = {
  code: string
  contact: ContactDraft
  items: ProjectItem[]
  estimate: Estimate
}

const initialMessage: Msg = {
  role: 'assistant',
  text: '¡Hola! Cuéntame qué quieres instalar en vidrio o aluminio. Si ya sabes las medidas, dímelas; si no, también puedes arrastrar una foto del lugar o una imagen de referencia.'
}

const emptyContact: ContactDraft = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  province: '',
  address: '',
  country: 'Ecuador'
}

async function fileToDataUrl(file: File) {
  const bitmap = await createImageBitmap(file)
  const max = 1600
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bitmap.width * ratio)
  c.height = Math.round(bitmap.height * ratio)
  const ctx = c.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.78)
}

function mergeContact(current: ContactDraft, next?: Partial<ContactDraft> | null): ContactDraft {
  if (!next) return current
  return {
    fullName: next.fullName || current.fullName,
    phone: next.phone || current.phone,
    email: next.email || current.email,
    city: next.city || current.city,
    province: next.province || current.province,
    address: next.address || current.address,
    country: next.country || current.country || 'Ecuador'
  }
}

function dimensions(a: Assessment) {
  const parts: string[] = []
  if (a.widthM) parts.push(`${a.widthM} m ancho`)
  if (a.heightM) parts.push(`${a.heightM} m alto`)
  if (a.lengthM) parts.push(`${a.lengthM} m largo`)
  if (a.quantity && a.quantity > 1) parts.push(`${a.quantity} unidades`)
  return parts.join(' · ') || 'Por confirmar'
}

function isSendCommand(value: string) {
  const normalized = value.toLowerCase().trim().replace(/[.!¡¿?]/g, '')
  return /^(enviar|envia|envía|envialo|envíalo|envialo por favor|envíalo por favor|enviar solicitud|manda|mandar|mandalo|mándalo|confirmar|confirmo|listo enviar|si enviar|sí enviar)$/.test(normalized)
}

function normalizeIntent(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.!¡¿?,;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isCancelAdditionalWorkCommand(value: string) {
  const normalized = normalizeIntent(value)
  return /(mejor|prefiero|dejemos|deja|quiero|hagamos|solo|solamente|ya no|no quiero|me equivoque|me arrepenti).*(anterior|primero|primer trabajo|trabajo anterior|solo un trabajo|un solo trabajo|un trabajo|segundo trabajo|otro trabajo)|(no agreguemos|no anadas|no agregues|quita|elimina).*(segundo|otro|ultimo|trabajo)/.test(normalized)
}

function isKeepOnlyFirstWorkCommand(value: string) {
  const n = normalizeIntent(value)
  return /^(mejor )?(solo|solamente) (el )?(trabajo )?(1|uno|primero)$/.test(n) ||
    /(deja|dejemos|quiero|hagamos|cotiza|cotizame).*(solo|solamente).*(primero|trabajo 1|trabajo uno)/.test(n)
}

function currentProjectKeywords(a?: Assessment | null) {
  if (!a) return []
  const text = normalizeIntent(`${a.projectLabel || ''} ${a.projectType || ''}`)
  const stop = new Set(['vidrio','aluminio','con','de','del','en','para','trabajo','suministro','instalacion','seguridad'])
  return [...new Set(text.split(' ').filter(x => x.length >= 4 && !stop.has(x)))]
}

function isDropCurrentNamedWorkCommand(value: string, a?: Assessment | null) {
  if (!a) return false
  const n = normalizeIntent(value)
  const negative = /(mejor.*no|ya no|no quiero|quita|elimina|saca|dejemos fuera|sin esa|sin ese|olvida)/.test(n)
  if (!negative) return false
  const keys = currentProjectKeywords(a)
  return keys.some(k => n.includes(k)) || /(ultimo|segundo|este trabajo|ese trabajo)/.test(n)
}

function projectFamilyFromAssessment(a?: Assessment | null) {
  const t = a?.projectType || ''
  if (t.startsWith('window_')) return 'window'
  if (t === 'cover_existing') return 'cover'
  if (t === 'pergola_glass') return 'pergola'
  if (t === 'railing') return 'railing'
  if (t === 'door') return 'door'
  if (t === 'shower' || t === 'bath_curtain') return 'shower'
  if (t === 'mirror') return 'mirror'
  if (t === 'partition') return 'partition'
  if (t === 'facade') return 'facade'
  return t || 'special'
}

function projectFamilyFromText(value: string) {
  const n = normalizeIntent(value)
  if (/ventana/.test(n)) return 'window'
  if (/pergola/.test(n)) return 'pergola'
  if (/cubierta|techo de vidrio/.test(n)) return 'cover'
  if (/baranda|pasamano|pasamanos/.test(n)) return 'railing'
  if (/puerta/.test(n)) return 'door'
  if (/mampara|ducha|cortina de bano/.test(n)) return 'shower'
  if (/espejo/.test(n)) return 'mirror'
  if (/division/.test(n)) return 'partition'
  if (/fachada/.test(n)) return 'facade'
  if (/fuente|vidrio curvo|curvo/.test(n)) return 'special'
  return ''
}

function looksLikeNewWorkCommand(value: string, current?: Assessment | null) {
  const n = normalizeIntent(value)
  const family = projectFamilyFromText(value)
  if (!family) return false

  const explicitAddition = /(tambien|ademas|aparte|agrega|agregar|anade|anadir|suma|sumar|otro|otra|adicional)/.test(n)
  if (explicitAddition) return true

  const currentFamily = projectFamilyFromAssessment(current)
  return Boolean(current?.readyToLead && family !== currentFamily && /(quiero|necesito|cotiza|cotizar|hacer|poner|instalar)/.test(n))
}

function wantsRestoreRemovedWork(value: string, removed: ProjectItem[]) {
  if (!removed.length) return false
  const n = normalizeIntent(value)
  if (/(no quiero|quita|elimina|saca|dejemos fuera)/.test(n)) return false

  if (/(pon|incluye|agrega|anade|restaura|recupera|vuelve a poner|mejor si|si quiero|tambien quiero|cotiza).*(los dos|las dos|ambos|todos|todo|segundo|trabajo 2|de nuevo|otra vez|lo que quite)/.test(n)) return true
  if (/(mejor|no mejor).*(pon|incluye|dejemos|cotiza).*(2|dos|ambos)/.test(n)) return true

  const affirmative = /(pon|incluye|agrega|anade|quiero|si|tambien|mejor|cotiza|cotizar|de nuevo|otra vez)/.test(n)
  if (!affirmative) return false

  return removed.some(item => currentProjectKeywords(item.assessment).some(k => n.includes(k)))
}

export default function QuoteAssistant({ compact = false, onClose }: { compact?: boolean; onClose?: () => void } = {}) {
  const [category, setCategory] = useState('none')
  const [messages, setMessages] = useState<Msg[]>([initialMessage])
  const [text, setText] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [usedImages, setUsedImages] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [estimate, setEstimate] = useState<Estimate>(null)
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([])
  const [removedItems, setRemovedItems] = useState<ProjectItem[]>([])
  const [contact, setContact] = useState<ContactDraft>({ ...emptyContact })
  const [saved, setSaved] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null)
  const [addingAnother, setAddingAnother] = useState(false)
  const [contextStartIndex, setContextStartIndex] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const currentItem = useMemo<ProjectItem | null>(() => {
    if (!assessment) return null
    return { assessment, estimate, images: usedImages }
  }, [assessment, estimate, usedImages])

  const allItems = useMemo(() => {
    return currentItem ? [...projectItems, currentItem] : projectItems
  }, [projectItems, currentItem])

  const total = useMemo(() => {
    const estimates = allItems.map(x => x.estimate).filter(Boolean) as NonNullable<Estimate>[]
    if (!estimates.length) return null
    return {
      low: estimates.reduce((s, x) => s + x.low, 0),
      high: estimates.reduce((s, x) => s + x.high, 0)
    }
  }, [allItems])

  const hasProject = allItems.length > 0 && allItems.some(x => x.assessment?.scope === 'in_scope')
  const isEcuador = (contact.country || 'Ecuador').toLowerCase().includes('ecuador') || contact.country.toLowerCase() === 'ec'

  // Para solicitar una cotización preliminar NO exigimos dirección exacta.
  // Nombre + teléfono + ciudad en Ecuador son suficientes. La dirección se puede compartir luego por WhatsApp.
  const canSubmit = Boolean(
    hasProject &&
    contact.fullName.trim() &&
    contact.phone.trim() &&
    contact.city.trim() &&
    isEcuador
  )

  // Si el cliente decidió agregar otro trabajo, primero terminamos o descartamos ese trabajo.
  // Evita que se envíe accidentalmente una segunda solicitud incompleta.
  const currentWorkReady = !assessment || assessment.readyToLead
  const canActuallySubmit = canSubmit && !addingAnother && currentWorkReady
  const showSubmitActions = canActuallySubmit

  useEffect(() => {
    if (!bodyRef.current) return
    bodyRef.current.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, busy, canSubmit])

  async function addFileArray(files: File[]) {
    const arr = files
      .filter(f => ['image/jpeg', 'image/png', 'image/webp'].includes(f.type))
      .slice(0, 3 - images.length)
    if (!arr.length) return
    const converted = await Promise.all(arr.map(fileToDataUrl))
    setImages(v => [...v, ...converted].slice(0, 3))
  }

  async function addFiles(files: FileList | null) {
    if (files) await addFileArray([...files])
  }

  function removeImage(i: number) {
    setImages(v => v.filter((_, idx) => idx !== i))
  }

  async function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    await addFileArray([...e.dataTransfer.files])
  }

  function missingBeforeSend() {
    if (!hasProject) return 'Primero cuéntame qué trabajo necesitas para saber qué debemos enviar al equipo.'
    if (!contact.fullName || !contact.phone) return 'Antes de enviarlo necesito tu nombre y apellido y un número de WhatsApp o teléfono.'
    if (!contact.city) return 'Solo me falta saber en qué ciudad de Ecuador sería el trabajo. La dirección exacta la puedes compartir después por WhatsApp.'
    if (!isEcuador) return 'Por ahora solo atendemos instalaciones dentro de Ecuador.'
    if (addingAnother || (assessment && !assessment.readyToLead)) {
      return 'Todavía estamos completando el trabajo que estás agregando. Si cambiaste de idea, puedes decir “mejor solo el trabajo anterior”.'
    }
    return 'Ya tengo lo necesario para enviarlo.'
  }

  async function submitLead(conversationOverride?: Msg[]) {
    if (!canActuallySubmit || saving || saved || !allItems.length) return

    const primaryAssessment = assessment || allItems[allItems.length - 1].assessment
    const allImages = [...new Set(allItems.flatMap(x => x.images))].slice(0, 10)
    const finalConversation = conversationOverride || messages
    const finalEstimate: Estimate = total
      ? {
          low: total.low,
          high: total.high,
          currency: 'USD',
          base: (total.low + total.high) / 2,
          note: 'Suma de los trabajos que tienen estimación disponible.'
        }
      : (assessment ? estimate : allItems[allItems.length - 1].estimate)

    const payload = {
      contact,
      assessment: primaryAssessment,
      estimate: finalEstimate,
      projectItems: allItems.map(x => ({ assessment: x.assessment, estimate: x.estimate })),
      images: allImages,
      conversation: finalConversation
    }

    setSaving(true)
    try {
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'No se pudo guardar la solicitud')

      setSaved(d.code)
      setConfirmation({
        code: d.code,
        contact: { ...contact },
        items: allItems.map(x => ({ ...x, images: [...x.images] })),
        estimate: finalEstimate
      })
    } catch (e: any) {
      setMessages(v => [
        ...v,
        { role: 'assistant', text: e?.message || 'No pude guardar la solicitud. Intenta nuevamente.' }
      ])
    } finally {
      setSaving(false)
    }
  }

  async function send() {
    if (busy || saving || (!text.trim() && !images.length)) return

    const userText = text.trim() || 'Te adjunto una fotografía relacionada con el trabajo para que la revises.'
    const next = [...messages, { role: 'user' as const, text: userText }]

    setMessages(next)
    setText('')

    // Los botones son atajos, no pasos obligatorios. Primero interpretamos comandos de
    // administración de la solicitud localmente para no gastar tokens ni perder el estado.
    if (isSendCommand(userText)) {
      if (canActuallySubmit) {
        await submitLead(next)
      } else {
        setMessages(v => [...v, { role: 'assistant', text: missingBeforeSend() }])
      }
      return
    }

    // Si el cliente había quitado un trabajo y luego cambia de idea ("mejor pon las 2",
    // "incluye la pérgola otra vez"), lo restauramos sin llamar a OpenAI.
    if (wantsRestoreRemovedWork(userText, removedItems)) {
      const restored = [...removedItems]
      setProjectItems(current => {
        const keys = new Set(current.map(x => `${x.assessment.projectType}|${x.assessment.clientRequestSummary}`))
        const extras = restored.filter(x => !keys.has(`${x.assessment.projectType}|${x.assessment.clientRequestSummary}`))
        return [...current, ...extras]
      })
      setRemovedItems([])
      setAssessment(null)
      setEstimate(null)
      setUsedImages([])
      setImages([])
      setAddingAnother(false)
      setCategory('none')
      setContextStartIndex(next.length + 1)
      const names = restored.map(x => x.assessment.projectLabel).filter(Boolean).join(' y ')
      setMessages(v => [
        ...v,
        {
          role: 'assistant',
          text: names
            ? `De acuerdo. Volví a incluir ${names}. La solicitud queda nuevamente con todos esos trabajos y puedes enviarla cuando quieras.`
            : 'De acuerdo. Volví a incluir el trabajo que habías quitado. Ya puedes enviar la solicitud cuando quieras.'
        }
      ])
      return
    }

    // "Solo el trabajo 1" debe funcionar aunque los botones estén visibles.
    if (isKeepOnlyFirstWorkCommand(userText)) {
      const currentCandidate = assessment ? { assessment, estimate, images: [...usedImages] } : null
      const combined = currentCandidate ? [...projectItems, currentCandidate] : [...projectItems]
      if (combined.length > 1) {
        setProjectItems([combined[0]])
        setRemovedItems(v => [...v, ...combined.slice(1)].slice(-10))
      }
      setAssessment(null)
      setEstimate(null)
      setUsedImages([])
      setImages([])
      setAddingAnother(false)
      setCategory('none')
      setContextStartIndex(next.length + 1)
      setMessages(v => [
        ...v,
        { role: 'assistant', text: 'Entendido. Dejamos únicamente el trabajo 1. Ya puedes enviar esa solicitud o agregar otro trabajo si cambias de idea.' }
      ])
      return
    }

    // Si estaba agregando un trabajo y lo descarta por nombre ("mejor la pérgola no") o
    // de forma genérica, guardamos una copia temporal para poder restaurarlo después.
    if (projectItems.length > 0 && (addingAnother || assessment) &&
        (isCancelAdditionalWorkCommand(userText) || isDropCurrentNamedWorkCommand(userText, assessment))) {
      if (assessment?.scope === 'in_scope') {
        const discarded = { assessment, estimate, images: [...usedImages] }
        setRemovedItems(v => [...v, discarded].slice(-10))
      }
      setAssessment(null)
      setEstimate(null)
      setUsedImages([])
      setImages([])
      setAddingAnother(false)
      setCategory('none')
      setContextStartIndex(next.length + 1)
      setMessages(v => [
        ...v,
        { role: 'assistant', text: 'Entendido. Ese trabajo queda fuera por ahora y conservamos los anteriores. Si cambias de idea, puedes decir “incluye de nuevo el trabajo que quité” o “mejor cotiza los dos”.' }
      ])
      return
    }

    setBusy(true)
    const sentImages = [...images]

    // Si el trabajo actual ya estaba listo y el cliente escribe directamente otro
    // (por ejemplo: "también quiero una ventana fija"), el sistema equivale a haber
    // pulsado "+ Agregar otro trabajo". Los botones son completamente opcionales.
    let requestAssessment = assessment
    let requestCommittedItems = [...projectItems]
    let requestNewProjectMode = addingAnother
    let requestMessages = next.slice(contextStartIndex).slice(-16)

    if (assessment?.readyToLead && looksLikeNewWorkCommand(userText, assessment)) {
      const committed = { assessment, estimate, images: [...usedImages] }
      requestCommittedItems = [...projectItems, committed]
      requestAssessment = null
      requestNewProjectMode = true
      requestMessages = [{ role: 'user' as const, text: userText }]

      setProjectItems(requestCommittedItems)
      setAssessment(null)
      setEstimate(null)
      setUsedImages([])
      setImages([])
      setAddingAnother(true)
      setCategory('none')
      setContextStartIndex(next.length - 1)
    }

    try {
      const r = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedCategory: category,
          messages: requestMessages,
          images: sentImages,
          currentAssessment: requestAssessment,
          knownContact: contact,
          newProjectMode: requestNewProjectMode,
          committedProjects: requestCommittedItems.map(x => ({
            projectType: x.assessment.projectType,
            projectLabel: x.assessment.projectLabel,
            clientRequestSummary: x.assessment.clientRequestSummary
          }))
        })
      })
      const data = await r.json()
      if (!r.ok && !data.reply) throw new Error(data.error || 'No pude procesar la solicitud.')

      setMessages(v => [...v, { role: 'assistant', text: data.reply || 'No pude procesar la solicitud.' }])
      if (data.assessment) {
        setAssessment(data.assessment)
        setEstimate(data.estimate || null)
        setContact(current => mergeContact(current, data.assessment.contact))
        if (requestNewProjectMode && data.assessment.readyToLead) setAddingAnother(false)
        if (sentImages.length) setUsedImages(v => [...v, ...sentImages].slice(-8))
      }
      if (data.consumeImages !== false) setImages([])
    } catch {
      // No borramos ni alteramos trabajos por un fallo temporal de la IA.
      setMessages(v => [...v, { role: 'assistant', text: 'No pude procesar ese mensaje en este momento, pero tu solicitud sigue intacta. Puedes intentarlo otra vez o usar frases como “agregar otro trabajo”, “quitar el último” o “enviar”.' }])
    } finally {
      setBusy(false)
    }
  }

  function addCurrentItem() {
    if (!assessment || saved || !assessment.readyToLead) return
    setProjectItems(v => [...v, { assessment, estimate, images: [...usedImages] }])
    setAssessment(null)
    setEstimate(null)
    setUsedImages([])
    setImages([])
    setCategory('none')
    setAddingAnother(true)
    // Guardamos desde dónde comienza la conversación del próximo trabajo.
    // El mensaje que agregamos a continuación será el primer mensaje de ese nuevo contexto.
    setContextStartIndex(messages.length)
    setMessages(v => [
      ...v,
      {
        role: 'assistant',
        text: 'De acuerdo, ese trabajo ya quedó agregado. Cuéntame qué otro trabajo quieres sumar. Si cambias de idea en cualquier momento, puedes decirme “mejor solo el trabajo anterior” y dejamos la solicitud lista para enviar.'
      }
    ])
  }

  function resetAfterConfirmation() {
    setConfirmation(null)
    setSaved(null)
    setCategory('none')
    setMessages([initialMessage])
    setText('')
    setImages([])
    setUsedImages([])
    setAssessment(null)
    setEstimate(null)
    setProjectItems([])
    setRemovedItems([])
    setContact({ ...emptyContact })
    setAddingAnother(false)
    setContextStartIndex(0)
    setBusy(false)
    setSaving(false)
  }

  return (
    <>
      <div className={`quote-wrap quote-wrap-v4 ${compact ? 'quote-wrap-compact' : ''}`}>
        {!compact && <aside className="quote-side">
          <div className="eyebrow">Tu proyecto</div>
          <h2>¿Qué quieres hacer?</h2>
          <p className="side-intro">Elige una opción o cuéntamelo con tus propias palabras.</p>

          <div className="category-list">
            {categories.map(c => (
              <button
                className={`category-btn ${category === c[0] ? 'active' : ''}`}
                onClick={() => setCategory(c[0])}
                key={c[0]}
              >
                {c[1]}
              </button>
            ))}
          </div>

          {projectItems.length > 0 && (
            <div className="project-mini">
              <strong>{projectItems.length} trabajo(s) agregado(s)</strong>
              {projectItems.map((x, i) => (
                <div key={`${x.assessment.projectLabel}-${i}`}>
                  {i + 1}. {x.assessment.projectLabel}
                  <span>{x.estimate ? `$${x.estimate.low.toFixed(0)}–$${x.estimate.high.toFixed(0)}` : 'Por revisar'}</span>
                </div>
              ))}
              {total && <b>Total estimable: ${total.low.toFixed(0)}–${total.high.toFixed(0)}</b>}
            </div>
          )}

          <div className="scope-card">
            <span>Instalaciones en Ecuador</span>
            <p>No vendemos material suelto. Podemos llevar e instalar todo, o instalar materiales que tú compres o ya tengas.</p>
          </div>
        </aside>}

        <main className="quote-main">
          <div className="assistant-full assistant-v4">
            <div className="assistant-head">
              <div className="assistant-person">
                <div className="avatar">P</div>
                <div>
                  <strong>Asesor PIGO</strong>
                  <small>Vidrio · aluminio · instalación</small>
                </div>
              </div>
              <div className="assistant-head-actions">
                <span className="online-pill"><i /> Disponible</span>
                {onClose && (
                  <button type="button" className="assistant-close-btn" onClick={onClose} aria-label="Cerrar asesor">×</button>
                )}
              </div>
            </div>

            <div className="assistant-body" ref={bodyRef}>
              {messages.map((m, i) => (
                <div className={`bubble ${m.role === 'assistant' ? 'ai' : 'user'}`} key={`${m.role}-${i}`}>
                  {m.text}
                </div>
              ))}
              {busy && <div className="bubble ai typing">Analizando la información<span>•••</span></div>}

              {!saved && showSubmitActions && (
                <div className="chat-submit-card">
                  <div>
                    <strong>La solicitud está lista para enviar.</strong>
                    <span>Puedes usar los botones o seguir escribiendo con normalidad: “agrega otra ventana”, “mejor solo el primero”, “incluye de nuevo la pérgola” o “enviar”.</span>
                  </div>
                  <div className="chat-submit-actions">
                    {assessment ? (
                      <button className="chat-add-btn" onClick={addCurrentItem} disabled={saving || !assessment.readyToLead}>+ Agregar otro trabajo</button>
                    ) : projectItems.length > 0 ? (
                      <button
                        className="chat-add-btn"
                        onClick={() => {
                          setAddingAnother(true)
                          setContextStartIndex(messages.length)
                          setMessages(v => [...v, { role: 'assistant', text: 'Claro. Dime qué otro trabajo quieres agregar. Si cambias de idea, puedes decirme “mejor solo el trabajo anterior”.' }])
                        }}
                        disabled={saving}
                      >
                        + Agregar otro trabajo
                      </button>
                    ) : null}
                    <button className="chat-submit-btn" onClick={() => submitLead()} disabled={saving}>
                      {saving ? 'Enviando…' : 'Enviar solicitud'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              {images.length > 0 && (
                <div className="preview-images">
                  {images.map((src, i) => (
                    <div className="preview-thumb" key={i}>
                      <img src={src} alt="Adjunto" />
                      <button onClick={() => removeImage(i)} aria-label="Quitar foto">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="drop-copy">
                <strong>Arrastra aquí una foto del lugar o una imagen de referencia</strong>
                <span>JPG, PNG o WEBP · máximo 3 por mensaje.</span>
              </div>
            </div>

            <div className="assistant-composer">
              <div className="composer-row">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={e => addFiles(e.target.files)}
                />
                <button className="icon-btn" onClick={() => fileRef.current?.click()} title="Agregar fotos" aria-label="Agregar fotos">＋ Foto</button>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Ej.: Quiero una ventana corrediza de 2 m x 1,80 m…"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                />
                <button className="send-btn" onClick={send} disabled={busy || saving}>Enviar</button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {confirmation && (
        <div className="modal-backdrop confirmation-backdrop">
          <div className="modal-card confirmation-modal" onMouseDown={e => e.stopPropagation()}>
            <div className="confirmation-icon">✓</div>
            <div className="eyebrow">Solicitud enviada</div>
            <h2>Gracias por preferirnos, {confirmation.contact.fullName.split(' ')[0]}.</h2>
            <p className="confirmation-copy">
              Recibimos tu solicitud <strong>{confirmation.code}</strong>. Nuestro equipo revisará la información y te contactará al <strong>{confirmation.contact.phone}</strong> para darte el valor o coordinar una visita si hace falta.
            </p>

            <div className="confirmation-summary">
              <div className="confirmation-contact">
                <span>Contacto</span>
                <strong>{confirmation.contact.fullName}</strong>
                <p>{confirmation.contact.phone}</p>
                <p>{confirmation.contact.city}{confirmation.contact.province ? `, ${confirmation.contact.province}` : ''}, Ecuador</p>
                <p>{confirmation.contact.address || 'Dirección exacta por compartir más adelante'}</p>
              </div>

              <div className="confirmation-projects">
                {confirmation.items.map((item, i) => {
                  const a = item.assessment
                  const glass = [glassTypeLabel(a.glassType), glassFeatureLabel(a.glassFeature), a.glassColor || null, a.glassThicknessMm ? `${a.glassThicknessMm} mm` : null].filter(Boolean).join(' · ')
                  const aluminum = [aluminumBrandLabel(a.aluminumBrand), a.aluminumColor || null].filter(Boolean).join(' · ')
                  return (
                    <section key={`${a.projectLabel}-${i}`}>
                      <span>{confirmation.items.length > 1 ? `Trabajo ${i + 1}` : 'Proyecto enviado'}</span>
                      <h3>{a.projectLabel}</h3>
                      <p className="confirmation-request">{a.clientRequestSummary}</p>
                      <p><b>Medidas:</b> {dimensions(a)}</p>
                      {a.aluminumBrand !== 'unknown' && <p><b>Aluminio:</b> {aluminum}</p>}
                      {a.glassType !== 'unknown' && <p><b>Vidrio:</b> {glass}</p>}
                      <p><b>Servicio:</b> {supplyLabel(a.supplyMode)}</p>
                      {a.detectedNeeds?.length > 0 && <p><b>Incluye / considerar:</b> {a.detectedNeeds.join(' · ')}</p>}
                    </section>
                  )
                })}
              </div>
            </div>

            {confirmation.estimate && (
              <div className="confirmation-price">
                <span>Estimación registrada</span>
                <strong>${confirmation.estimate.low.toFixed(2)} – ${confirmation.estimate.high.toFixed(2)}</strong>
              </div>
            )}

            <p className="confirmation-note">Al cerrar esta ventana, el chat quedará limpio para una nueva solicitud.</p>
            <button className="btn confirmation-close" onClick={resetAfterConfirmation}>Cerrar y finalizar</button>
          </div>
        </div>
      )}
    </>
  )
}
