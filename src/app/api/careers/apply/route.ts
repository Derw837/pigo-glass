import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'node:crypto'

const MAX_CV_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

function applicationCode() {
  return `CV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const vacancyId = String(form.get('vacancy_id') || '').trim()
    const fullName = String(form.get('full_name') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const email = String(form.get('email') || '').trim()
    const city = String(form.get('city') || '').trim()
    const message = String(form.get('message') || '').trim()
    const cv = form.get('cv') as File | null

    if (!vacancyId || !fullName || !phone || !email || !city || !cv?.size) {
      return NextResponse.json({ error: 'Completa los datos requeridos y adjunta tu hoja de vida.' }, { status: 400 })
    }
    if (cv.size > MAX_CV_BYTES) {
      return NextResponse.json({ error: 'La hoja de vida no debe superar 5 MB.' }, { status: 400 })
    }
    if (!ALLOWED.has(cv.type)) {
      return NextResponse.json({ error: 'La hoja de vida debe estar en PDF, DOC o DOCX.' }, { status: 400 })
    }

    const db = createAdminClient()
    const { data: vacancy, error: vacancyError } = await db
      .from('vacancies')
      .select('id,title,is_open')
      .eq('id', vacancyId)
      .maybeSingle()

    if (vacancyError || !vacancy || !vacancy.is_open) {
      return NextResponse.json({ error: 'Esta vacante ya no está disponible.' }, { status: 409 })
    }

    const safeName = cv.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const path = `${vacancyId}/${Date.now()}-${crypto.randomBytes(3).toString('hex')}-${safeName}`
    const bytes = Buffer.from(await cv.arrayBuffer())
    const { error: uploadError } = await db.storage.from('job-cvs').upload(path, bytes, {
      contentType: cv.type,
      upsert: false,
    })
    if (uploadError) throw uploadError

    const code = applicationCode()
    const { error: insertError } = await db.from('job_applications').insert({
      code,
      vacancy_id: vacancyId,
      full_name: fullName,
      phone,
      email,
      city,
      message: message || null,
      cv_path: path,
    })

    if (insertError) {
      await db.storage.from('job-cvs').remove([path])
      throw insertError
    }

    return NextResponse.json({ ok: true, code, vacancy: vacancy.title })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'No se pudo enviar la postulación.' }, { status: 500 })
  }
}
