import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyBusiness } from '@/lib/notifications'
import { buildLeadBrief } from '@/lib/lead-summary'
import type { ContactDraft } from '@/lib/types'

function code() {
  return `PG-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function parseDataUrl(x: string) {
  const m = x.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)
  if (!m) return null
  return { mime: m[1], buf: Buffer.from(m[2], 'base64') }
}

function isEcuador(country?: string) {
  const c = String(country || 'Ecuador').trim().toLowerCase()
  return !c || c === 'ec' || c.includes('ecuador')
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const c = (b.contact || {}) as ContactDraft
    if (!c.fullName || !c.phone || !c.city) {
      return NextResponse.json({ error: 'Faltan nombre, teléfono o ciudad de instalación.' }, { status: 400 })
    }
    if (!isEcuador(c.country)) {
      return NextResponse.json({ error: 'Por ahora las instalaciones se atienden únicamente en Ecuador.' }, { status: 400 })
    }

    const db = createAdminClient()
    const leadCode = code()
    const a = b.assessment || {}
    const projectItems = Array.isArray(b.projectItems) ? b.projectItems : []
    const needsVisit = !!a.needsVisit || projectItems.some((x: any) => !!x?.assessment?.needsVisit)

    const contact: ContactDraft = {
      fullName: String(c.fullName).slice(0, 120),
      phone: String(c.phone).slice(0, 60),
      email: c.email ? String(c.email).slice(0, 180) : '',
      city: String(c.city).slice(0, 100),
      province: c.province ? String(c.province).slice(0, 100) : '',
      address: c.address ? String(c.address).slice(0, 300) : '',
      country: 'Ecuador'
    }

    const assessmentWithContact = { ...a, contact }
    const summary = buildLeadBrief({
      contact,
      assessment: assessmentWithContact,
      estimate: b.estimate || null,
      projectItems
    })

    const baseRow: any = {
      code: leadCode,
      name: contact.fullName,
      phone: contact.phone,
      email: contact.email || null,
      city: contact.city,
      sector: contact.address || null,
      preferred_contact: 'WhatsApp',
      project_type: a.projectType || 'special',
      project_label: projectItems.length > 1 ? `${projectItems.length} trabajos` : a.projectLabel || 'Proyecto',
      quote_mode: a.quoteMode || 'technical',
      supply_mode: a.supplyMode || 'unknown',
      needs_visit: needsVisit,
      risk_level: a.riskLevel || 'technical',
      assessment: assessmentWithContact,
      estimate: b.estimate || null,
      project_items: projectItems,
      conversation: b.conversation || [],
      status: 'new',
      province: contact.province || null,
      address: contact.address || null
    }

    let { data, error } = await db.from('leads').insert(baseRow).select('id,code').single()

    // Compatibilidad para quien todavía no haya ejecutado la migración V3.
    if (error && /province|address|column|schema cache/i.test(error.message || '')) {
      const fallbackRow = { ...baseRow }
      delete fallbackRow.province
      delete fallbackRow.address
      ;({ data, error } = await db.from('leads').insert(fallbackRow).select('id,code').single())
    }

    if (error || !data) throw error || new Error('No se creó la solicitud')

    const imgs = (Array.isArray(b.images) ? b.images : []).slice(0, 10)
    for (let i = 0; i < imgs.length; i++) {
      const parsed = parseDataUrl(imgs[i])
      if (!parsed || parsed.buf.length > 2_500_000) continue
      const ext = parsed.mime === 'image/png' ? 'png' : parsed.mime === 'image/webp' ? 'webp' : 'jpg'
      const path = `${data.id}/${String(i + 1).padStart(2, '0')}.${ext}`
      const { error: up } = await db.storage.from('lead-images').upload(path, parsed.buf, { contentType: parsed.mime, upsert: false })
      if (!up) await db.from('lead_images').insert({ lead_id: data.id, storage_path: path })
    }

    await notifyBusiness({
      code: data.code,
      name: contact.fullName,
      phone: contact.phone,
      email: contact.email || null,
      summary
    })

    return NextResponse.json({ code: data.code })
  } catch (e: any) {
    console.error('[PIGO /api/leads]', e)
    const detail = process.env.NODE_ENV === 'development' && e?.message ? `: ${e.message}` : ''
    return NextResponse.json({ error: `No se pudo registrar la solicitud${detail}` }, { status: 500 })
  }
}
