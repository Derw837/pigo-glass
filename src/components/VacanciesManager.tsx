'use client'

import { useState } from 'react'
import { BriefcaseBusiness, Download, Pencil, Plus, Save, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'

type Vacancy = {
  id: string
  title: string
  location: string
  contract_type: string
  summary: string
  description: string
  requirements: string
  is_open: boolean
}

type Application = {
  id: string
  code: string
  vacancy_id: string
  vacancy_title: string
  full_name: string
  phone: string
  email: string
  city: string
  message?: string | null
  status: string
  cv_url?: string | null
  created_at: string
}

const emptyVacancy: Omit<Vacancy, 'id'> = {
  title: '', location: 'Quito, Ecuador', contract_type: 'Tiempo completo', summary: '', description: '', requirements: '', is_open: true,
}

export default function VacanciesManager({ initialVacancies, initialApplications }: { initialVacancies: Vacancy[]; initialApplications: Application[] }) {
  const [vacancies, setVacancies] = useState(initialVacancies)
  const [applications, setApplications] = useState(initialApplications)
  const [editing, setEditing] = useState<Vacancy | null>(null)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)

  async function createVacancy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    try {
      const form = new FormData(event.currentTarget)
      const payload = {
        title: String(form.get('title') || '').trim(),
        location: String(form.get('location') || '').trim(),
        contract_type: String(form.get('contract_type') || '').trim(),
        summary: String(form.get('summary') || '').trim(),
        description: String(form.get('description') || '').trim(),
        requirements: String(form.get('requirements') || '').trim(),
        is_open: form.get('is_open') === 'on',
        updated_at: new Date().toISOString(),
      }
      const supabase = createClient()
      const { data, error } = await supabase.from('vacancies').insert(payload).select().single()
      if (error) throw error
      setVacancies((value) => [data, ...value])
      setCreating(false)
    } catch (error: any) { alert(error.message) } finally { setBusy(false) }
  }

  async function saveVacancy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    setBusy(true)
    try {
      const form = new FormData(event.currentTarget)
      const payload = {
        title: String(form.get('title') || '').trim(),
        location: String(form.get('location') || '').trim(),
        contract_type: String(form.get('contract_type') || '').trim(),
        summary: String(form.get('summary') || '').trim(),
        description: String(form.get('description') || '').trim(),
        requirements: String(form.get('requirements') || '').trim(),
        is_open: form.get('is_open') === 'on',
        updated_at: new Date().toISOString(),
      }
      const supabase = createClient()
      const { data, error } = await supabase.from('vacancies').update(payload).eq('id', editing.id).select().single()
      if (error) throw error
      setVacancies((value) => value.map((item) => item.id === editing.id ? data : item))
      setEditing(null)
    } catch (error: any) { alert(error.message) } finally { setBusy(false) }
  }

  async function setApplicationStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase.from('job_applications').update({ status }).eq('id', id)
    if (error) alert(error.message)
    else setApplications((value) => value.map((item) => item.id === id ? { ...item, status } : item))
  }

  const formFields = (value: Partial<Vacancy>) => (
    <>
      <div className="form-grid">
        <div className="field"><label>Cargo *</label><input name="title" required defaultValue={value.title} placeholder="Ej. Instalador de vidrio" /></div>
        <div className="field"><label>Ubicación *</label><input name="location" required defaultValue={value.location} /></div>
        <div className="field"><label>Tipo de contratación</label><input name="contract_type" defaultValue={value.contract_type} placeholder="Tiempo completo" /></div>
        <div className="field vacancy-open-field-v10"><label><input type="checkbox" name="is_open" defaultChecked={value.is_open ?? true} /> Vacante abierta y visible</label></div>
        <div className="field full"><label>Resumen *</label><textarea name="summary" required rows={2} defaultValue={value.summary} placeholder="Descripción corta que verá el candidato." /></div>
        <div className="field full"><label>Descripción</label><textarea name="description" rows={4} defaultValue={value.description} placeholder="Funciones, jornada, responsabilidades y contexto del cargo." /></div>
        <div className="field full"><label>Requisitos</label><textarea name="requirements" rows={4} defaultValue={value.requirements} placeholder="Experiencia, conocimientos, licencia, disponibilidad, etc." /></div>
      </div>
    </>
  )

  return (
    <div className="vacancies-admin-v10">
      <div className="vacancies-head-v10">
        <div><strong>{vacancies.filter((item) => item.is_open).length}</strong><span>vacantes abiertas</span></div>
        <button className="btn primary" onClick={() => setCreating(true)}><Plus size={16} /> Nueva vacante</button>
      </div>

      <div className="vacancies-grid-v10">
        {vacancies.map((vacancy) => (
          <article className="vacancy-admin-card-v10" key={vacancy.id}>
            <div className="vacancy-admin-state-v10"><span className={vacancy.is_open ? 'open' : 'closed'}>{vacancy.is_open ? 'Abierta' : 'Cerrada'}</span><small>{vacancy.contract_type}</small></div>
            <h3>{vacancy.title}</h3>
            <p>{vacancy.summary}</p>
            <footer><span>{vacancy.location}</span><button className="btn small ghost" onClick={() => setEditing(vacancy)}><Pencil size={13} /> Editar</button></footer>
          </article>
        ))}
        {!vacancies.length ? <div className="card empty">Todavía no has creado vacantes.</div> : null}
      </div>

      <div className="applications-section-v10">
        <div className="admin-title"><h2>Postulaciones recibidas</h2><p>Las hojas de vida solo aparecen cuando existe una vacante abierta y una persona completa el formulario.</p></div>
        <div className="table-card vacancies-table-wrap-v10">
          <table className="data-table">
            <thead><tr><th>Código</th><th>Candidato</th><th>Vacante</th><th>Ciudad</th><th>Contacto</th><th>CV</th><th>Estado</th></tr></thead>
            <tbody>
              {applications.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.code}</strong><div className="muted-mini-v10">{new Date(item.created_at).toLocaleDateString('es-EC')}</div></td>
                  <td><strong>{item.full_name}</strong>{item.message ? <div className="muted-mini-v10">{item.message}</div> : null}</td>
                  <td>{item.vacancy_title}</td>
                  <td>{item.city}</td>
                  <td><a href={`tel:${item.phone}`}>{item.phone}</a><div className="muted-mini-v10">{item.email}</div></td>
                  <td>{item.cv_url ? <a className="btn small ghost" href={item.cv_url} target="_blank" rel="noreferrer"><Download size={13} /> Abrir</a> : '—'}</td>
                  <td><select value={item.status} onChange={(event) => setApplicationStatus(item.id, event.target.value)}><option value="new">Nueva</option><option value="reviewing">Revisando</option><option value="contacted">Contactado</option><option value="rejected">No continúa</option><option value="hired">Contratado</option></select></td>
                </tr>
              ))}
              {!applications.length ? <tr><td colSpan={7} className="empty">Aún no hay postulaciones.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>

      {(creating || editing) ? (
        <div className="admin-modal-v10">
          <form className="admin-modal-panel-v10" onSubmit={editing ? saveVacancy : createVacancy}>
            <button className="admin-modal-close-v10" type="button" onClick={() => { setCreating(false); setEditing(null) }}><X size={18} /></button>
            <span className="eyebrow">{editing ? 'Editar vacante' : 'Nueva vacante'}</span>
            <h2>{editing ? editing.title : 'Publicar oportunidad'}</h2>
            {formFields(editing || emptyVacancy)}
            <button className="btn primary" disabled={busy}><Save size={15} /> {busy ? 'Guardando…' : 'Guardar vacante'}</button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
