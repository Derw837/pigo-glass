'use client'

import { useMemo, useState } from 'react'
import { ImagePlus, RotateCcw, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import { buildSiteMediaMap, SITE_MEDIA_SLOTS } from '@/lib/site-media'

type Row = { key: string; label: string; section: string; image_url?: string | null; alt_text?: string | null }

export default function SiteContentManager({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const map = useMemo(() => buildSiteMediaMap(rows), [rows])

  function rowFor(key: string) {
    return rows.find((row) => row.key === key)
  }

  async function upload(slotKey: string, file?: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) return alert('Selecciona una imagen válida.')
    if (file.size > 10 * 1024 * 1024) return alert('La imagen no debe superar 10 MB.')

    setBusyKey(slotKey)
    try {
      const supabase = createClient()
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      const path = `${slotKey}/${Date.now()}-${safe}`
      const { error: uploadError } = await supabase.storage.from('site-media').upload(path, file, { upsert: false })
      if (uploadError) throw uploadError
      const { data: publicUrl } = supabase.storage.from('site-media').getPublicUrl(path)
      const slot = SITE_MEDIA_SLOTS.find((item) => item.key === slotKey)!
      const current = rowFor(slotKey)
      const payload = {
        key: slotKey,
        label: slot.label,
        section: slot.section,
        image_url: publicUrl.publicUrl,
        alt_text: current?.alt_text || slot.label,
        updated_at: new Date().toISOString(),
      }
      const { data, error } = await supabase.from('site_media').upsert(payload, { onConflict: 'key' }).select().single()
      if (error) throw error
      setRows((value) => [data, ...value.filter((row) => row.key !== slotKey)])
    } catch (error: any) {
      alert(error.message || 'No se pudo actualizar la imagen.')
    } finally {
      setBusyKey(null)
    }
  }

  async function saveAlt(slotKey: string, altText: string) {
    const slot = SITE_MEDIA_SLOTS.find((item) => item.key === slotKey)!
    const current = rowFor(slotKey)
    const supabase = createClient()
    const payload = {
      key: slotKey,
      label: slot.label,
      section: slot.section,
      image_url: current?.image_url || null,
      alt_text: altText,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('site_media').upsert(payload, { onConflict: 'key' }).select().single()
    if (error) alert(error.message)
    else setRows((value) => [data, ...value.filter((row) => row.key !== slotKey)])
  }

  async function reset(slotKey: string) {
    if (!confirm('¿Restaurar la imagen inicial de esta sección?')) return
    setBusyKey(slotKey)
    const slot = SITE_MEDIA_SLOTS.find((item) => item.key === slotKey)!
    const supabase = createClient()
    const current = rowFor(slotKey)
    const payload = {
      key: slotKey,
      label: slot.label,
      section: slot.section,
      image_url: null,
      alt_text: current?.alt_text || slot.label,
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('site_media').upsert(payload, { onConflict: 'key' }).select().single()
    if (error) alert(error.message)
    else setRows((value) => [data, ...value.filter((row) => row.key !== slotKey)])
    setBusyKey(null)
  }

  return (
    <div className="site-content-admin-v10">
      <div className="site-content-note-v10">
        <ImagePlus size={22} />
        <div>
          <strong>Fotos editables de la página</strong>
          <p>Cambia las imágenes de Inicio, Servicios, Galería, Empresa e Empleo sin tocar el código. Los trabajos reales se administran desde Galería.</p>
        </div>
      </div>

      <div className="site-content-grid-v10">
        {SITE_MEDIA_SLOTS.map((slot) => {
          const current = rowFor(slot.key)
          return (
            <article className="site-media-card-v10" key={slot.key}>
              <div className="site-media-photo-v10">
                <img src={map[slot.key].src} alt={map[slot.key].alt} />
                <span>{slot.section}</span>
              </div>
              <div className="site-media-copy-v10">
                <strong>{slot.label}</strong>
                <p>{slot.description}</p>
                <label className="site-media-alt-v10">
                  Texto alternativo
                  <input
                    defaultValue={current?.alt_text || slot.label}
                    onBlur={(event) => saveAlt(slot.key, event.target.value.trim() || slot.label)}
                  />
                </label>
                <div className="site-media-actions-v10">
                  <label className="btn small primary">
                    <Upload size={14} /> {busyKey === slot.key ? 'Subiendo…' : 'Cambiar foto'}
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      disabled={busyKey === slot.key}
                      onChange={(event) => upload(slot.key, event.target.files?.[0])}
                    />
                  </label>
                  <button className="btn small ghost" type="button" disabled={busyKey === slot.key} onClick={() => reset(slot.key)}>
                    <RotateCcw size={14} /> Inicial
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
