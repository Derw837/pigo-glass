'use client'

import { useMemo, useRef, useState } from 'react'
import { Eye, ImagePlus, Pencil, Save, Trash2, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import GalleryLightbox from '@/components/GalleryLightbox'
import { SERVICE_CATEGORIES } from '@/lib/service-catalog'

const categories = SERVICE_CATEGORIES.map((item) => item.name)

type GalleryItem = {
  id: string
  title: string
  category: string
  description?: string | null
  cover_url?: string | null
  published: boolean
}

export default function GalleryManager({ initial }: { initial: GalleryItem[] }) {
  const [items, setItems] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [editPreview, setEditPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const editFileRef = useRef<HTMLInputElement | null>(null)

  const lightboxItems = useMemo(() => items.map((item) => ({ ...item })), [items])

  function onFileChange(file?: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  async function uploadGalleryPhoto(file: File) {
    const supabase = createClient()
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
    const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file, { upsert: false })
    if (uploadError) throw uploadError
    const { data: url } = supabase.storage.from('gallery').getPublicUrl(path)
    return url.publicUrl
  }

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const form = new FormData(event.currentTarget)
      const file = form.get('photo') as File
      if (!file?.size) throw new Error('Selecciona una fotografía.')
      const coverUrl = await uploadGalleryPhoto(file)
      const row = {
        title: String(form.get('title') || '').trim(),
        category: String(form.get('category') || '').trim(),
        description: String(form.get('description') || '').trim(),
        cover_url: coverUrl,
        published: true,
      }
      const supabase = createClient()
      const { data, error } = await supabase.from('gallery_projects').insert(row).select().single()
      if (error) throw error
      setItems((value) => [data, ...value])
      event.currentTarget.reset()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    setBusy(true)
    try {
      const form = new FormData(event.currentTarget)
      const newPhoto = form.get('photo') as File
      let coverUrl = editing.cover_url || null
      if (newPhoto?.size) coverUrl = await uploadGalleryPhoto(newPhoto)
      const payload = {
        title: String(form.get('title') || '').trim(),
        category: String(form.get('category') || '').trim(),
        description: String(form.get('description') || '').trim(),
        cover_url: coverUrl,
        published: form.get('published') === 'on',
      }
      const supabase = createClient()
      const { data, error } = await supabase.from('gallery_projects').update(payload).eq('id', editing.id).select().single()
      if (error) throw error
      setItems((value) => value.map((item) => item.id === editing.id ? data : item))
      if (editPreview) URL.revokeObjectURL(editPreview)
      setEditPreview(null)
      setEditing(null)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este proyecto de la galería?')) return
    const supabase = createClient()
    const { error } = await supabase.from('gallery_projects').delete().eq('id', id)
    if (error) alert(error.message)
    else setItems((value) => value.filter((item) => item.id !== id))
  }

  return (
    <>
      <div className="gallery-admin-layout-v8">
        <form className="card gallery-upload-card-v8" onSubmit={add}>
          <div className="gallery-upload-heading-v8">
            <div>
              <span className="eyebrow">Nuevo proyecto</span>
              <h2>Publicar trabajo real</h2>
              <p>Organiza cada proyecto por categoría. Luego podrás cambiar título, descripción, categoría o fotografía sin eliminarlo.</p>
            </div>
            <ImagePlus size={24} />
          </div>

          <div className="form-grid gallery-form-v8">
            <div className="field"><label>Título</label><input name="title" required placeholder="Ej. Baranda de terraza" /></div>
            <div className="field"><label>Categoría</label><select name="category">{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
            <div className="field full"><label>Descripción breve</label><textarea name="description" rows={3} placeholder="Ej. Vidrio laminado con herrajes puntuales en terraza residencial." /></div>
          </div>

          <div
            className={`gallery-admin-drop-v8 ${previewUrl ? 'has-preview' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              const file = event.dataTransfer.files?.[0]
              if (!file) return
              const dt = new DataTransfer()
              dt.items.add(file)
              if (fileRef.current) fileRef.current.files = dt.files
              onFileChange(file)
            }}
          >
            <input ref={fileRef} name="photo" type="file" accept="image/*" required hidden onChange={(event) => onFileChange(event.target.files?.[0])} />
            {previewUrl ? <img src={previewUrl} alt="Vista previa" /> : <div><Upload size={24} /><strong>Arrastra una foto o haz clic para elegirla</strong><span>La imagen se recorta solo en miniatura; al abrirla se muestra completa.</span></div>}
          </div>
          <button className="btn primary gallery-publish-v8" disabled={busy}>{busy ? 'Publicando…' : 'Publicar trabajo'}</button>
        </form>

        <div className="gallery-admin-side-v8">
          <strong>{items.length}</strong><span>trabajos registrados</span>
          <p>Los proyectos publicados alimentan la galería del sitio y sus filtros por categoría.</p>
        </div>
      </div>

      {items.length ? (
        <div className="gallery-admin-grid-v8">
          {items.map((item, index) => (
            <article className="gallery-admin-item-v10" key={item.id}>
              <button className="gallery-admin-thumb-v8" type="button" onClick={() => setLightboxIndex(index)} aria-label={`Ver ${item.title}`}>
                {item.cover_url ? <img src={item.cover_url} alt={item.title} loading="lazy" /> : null}
                <span><Eye size={15} /> Ver</span>
              </button>
              <div className="gallery-admin-info-v8">
                <small>{item.category} · {item.published ? 'Publicado' : 'Oculto'}</small>
                <strong>{item.title}</strong>
                {item.description ? <p>{item.description}</p> : null}
              </div>
              <div className="gallery-admin-actions-v10">
                <button type="button" onClick={() => { setEditing(item); setEditPreview(null) }} aria-label={`Editar ${item.title}`}><Pencil size={15} /></button>
                <button className="danger" type="button" onClick={() => remove(item.id)} aria-label={`Eliminar ${item.title}`}><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="card empty">Todavía no has publicado trabajos en la galería.</div>}

      <GalleryLightbox items={lightboxItems} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onChange={setLightboxIndex} />

      {editing ? (
        <div className="admin-modal-v10">
          <form className="admin-modal-panel-v10 gallery-edit-modal-v10" onSubmit={saveEdit}>
            <button className="admin-modal-close-v10" type="button" onClick={() => { setEditing(null); setEditPreview(null) }}><X size={18} /></button>
            <span className="eyebrow">Editar proyecto</span>
            <h2>{editing.title}</h2>
            <div className="gallery-edit-preview-v10">
              <img src={editPreview || editing.cover_url || '/gallery/especiales.svg'} alt="Vista previa" />
              <label className="btn small ghost"><Upload size={14} /> Reemplazar foto<input ref={editFileRef} hidden type="file" name="photo" accept="image/*" onChange={(event) => {
                if (editPreview) URL.revokeObjectURL(editPreview)
                const file = event.target.files?.[0]
                setEditPreview(file ? URL.createObjectURL(file) : null)
              }} /></label>
            </div>
            <div className="form-grid">
              <div className="field"><label>Título</label><input name="title" required defaultValue={editing.title} /></div>
              <div className="field"><label>Categoría</label><select name="category" defaultValue={editing.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
              <div className="field full"><label>Descripción</label><textarea name="description" rows={4} defaultValue={editing.description || ''} /></div>
              <div className="field full vacancy-open-field-v10"><label><input type="checkbox" name="published" defaultChecked={editing.published} /> Mostrar este proyecto en la galería pública</label></div>
            </div>
            <button className="btn primary" disabled={busy}><Save size={15} /> {busy ? 'Guardando…' : 'Guardar cambios'}</button>
          </form>
        </div>
      ) : null}
    </>
  )
}
