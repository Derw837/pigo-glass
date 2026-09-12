'use client'

import { useState } from 'react'
import { BriefcaseBusiness, FileText, MapPin, X } from 'lucide-react'

type Vacancy = {
  id: string
  title: string
  location: string
  contract_type: string
  summary: string
  description: string
  requirements: string
}

export default function CareersPublic({ vacancies }: { vacancies: Vacancy[] }) {
  const [selected, setSelected] = useState<Vacancy | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ code: string; vacancy: string } | null>(null)
  const [error, setError] = useState('')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    setBusy(true)
    setError('')
    try {
      const form = new FormData(event.currentTarget)
      form.set('vacancy_id', selected.id)
      const response = await fetch('/api/careers/apply', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo enviar la postulación.')
      setResult(data)
      event.currentTarget.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!vacancies.length) {
    return (
      <div className="careers-empty-v10">
        <BriefcaseBusiness size={30} />
        <h2>Por ahora no tenemos vacantes abiertas.</h2>
        <p>Cuando abramos una oportunidad, aparecerá en esta sección con el cargo, requisitos y formulario para postular.</p>
      </div>
    )
  }

  return (
    <>
      <div className="career-grid-v10">
        {vacancies.map((vacancy) => (
          <article className="career-card-v10" key={vacancy.id}>
            <div className="career-card-top-v10">
              <span><BriefcaseBusiness size={15} /> Vacante abierta</span>
              <small>{vacancy.contract_type}</small>
            </div>
            <h3>{vacancy.title}</h3>
            <p>{vacancy.summary}</p>
            <div className="career-location-v10"><MapPin size={14} /> {vacancy.location}</div>
            <button className="btn primary" onClick={() => { setSelected(vacancy); setResult(null); setError('') }}>Ver vacante y postular</button>
          </article>
        ))}
      </div>

      {selected ? (
        <div className="career-modal-v10" role="dialog" aria-modal="true">
          <div className="career-modal-panel-v10">
            <button className="career-modal-close-v10" onClick={() => setSelected(null)} aria-label="Cerrar"><X size={20} /></button>
            {result ? (
              <div className="career-success-v10">
                <span className="eyebrow">Postulación recibida</span>
                <h2>Gracias por querer formar parte de nuestro equipo.</h2>
                <p>Recibimos tu hoja de vida para <strong>{result.vacancy}</strong>. Si tu perfil avanza en el proceso, nuestro equipo se comunicará contigo.</p>
                <div className="career-code-v10">Código: <strong>{result.code}</strong></div>
                <button className="btn primary" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            ) : (
              <>
                <span className="eyebrow">Vacante abierta</span>
                <h2>{selected.title}</h2>
                <div className="career-modal-meta-v10"><span>{selected.location}</span><span>{selected.contract_type}</span></div>
                <p className="career-description-v10">{selected.description || selected.summary}</p>
                {selected.requirements ? (
                  <div className="career-requirements-v10">
                    <strong>Lo que buscamos</strong>
                    <p>{selected.requirements}</p>
                  </div>
                ) : null}

                <form className="career-form-v10" onSubmit={submit}>
                  <div className="form-grid">
                    <div className="field"><label>Nombre y apellido *</label><input name="full_name" required /></div>
                    <div className="field"><label>Teléfono / WhatsApp *</label><input name="phone" required /></div>
                    <div className="field"><label>Correo *</label><input type="email" name="email" required /></div>
                    <div className="field"><label>Ciudad *</label><input name="city" required /></div>
                    <div className="field full"><label>Mensaje breve</label><textarea name="message" rows={3} placeholder="Cuéntanos brevemente sobre tu experiencia o disponibilidad." /></div>
                    <div className="field full">
                      <label>Hoja de vida *</label>
                      <label className="career-file-v10"><FileText size={19} /><span>Adjuntar PDF, DOC o DOCX · máximo 5 MB</span><input name="cv" type="file" required accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></label>
                    </div>
                  </div>
                  {error ? <div className="career-error-v10">{error}</div> : null}
                  <button className="btn primary" disabled={busy}>{busy ? 'Enviando…' : 'Enviar postulación'}</button>
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
