'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import { aluminumBrandLabel, glassFeatureLabel, glassTypeLabel, supplyLabel } from '@/lib/lead-summary'

function dims(a: any) {
  const parts: string[] = []
  if (a?.widthM) parts.push(`Ancho: ${a.widthM} m`)
  if (a?.heightM) parts.push(`Alto: ${a.heightM} m`)
  if (a?.lengthM) parts.push(`Largo: ${a.lengthM} m`)
  if (a?.quantity) parts.push(`Cantidad: ${a.quantity}`)
  return parts.length ? parts.join(' · ') : 'Por confirmar'
}

function glassText(a: any) {
  return [
    glassTypeLabel(a?.glassType),
    glassFeatureLabel(a?.glassFeature),
    a?.glassColor || null,
    a?.glassThicknessMm ? `${a.glassThicknessMm} mm` : null
  ].filter(Boolean).join(' · ')
}

function aluminumText(a: any) {
  return [
    aluminumBrandLabel(a?.aluminumBrand),
    a?.aluminumColor || null
  ].filter(Boolean).join(' · ')
}

function riskLabel(value?: string) {
  if (value === 'safety_critical') return 'Seguridad crítica'
  if (value === 'technical') return 'Revisión técnica'
  if (value === 'normal') return 'Normal'
  return 'Por revisar'
}

function overallSupply(lead: any) {
  const list = lead?.project_items?.length
    ? lead.project_items
    : [{ assessment: lead?.assessment }]
  const modes = [...new Set(list.map((x: any) => x?.assessment?.supplyMode).filter(Boolean))]
  if (!modes.length) return supplyLabel(lead?.supply_mode)
  if (modes.length === 1) return supplyLabel(String(modes[0]))
  return 'Modalidad mixta (ver cada trabajo)'
}

function overallRisk(lead: any) {
  const list = lead?.project_items?.length
    ? lead.project_items
    : [{ assessment: lead?.assessment }]
  const risks = list.map((x: any) => x?.assessment?.riskLevel).filter(Boolean)
  if (risks.includes('safety_critical')) return 'Seguridad crítica'
  if (risks.includes('technical')) return 'Revisión técnica'
  if (risks.includes('normal')) return 'Normal'
  return riskLabel(lead?.risk_level)
}

function overallSummary(lead: any) {
  const list = lead?.project_items?.length
    ? lead.project_items
    : [{ assessment: lead?.assessment }]

  const summaries = list
    .map((x: any, i: number) => {
      const text = String(x?.assessment?.clientRequestSummary || '').trim()
      if (!text) return ''
      return list.length > 1 ? `${i + 1}) ${text}` : text
    })
    .filter(Boolean)

  return summaries.join(' ') || 'La solicitud no tiene resumen estructurado.'
}

export default function LeadManager({ initial }: { initial: any[] }) {
  const [items, setItems] = useState(initial)
  const [selected, setSelected] = useState<any | null>(null)

  async function status(id: string, nextStatus: string) {
    const s = createClient()
    const { error } = await s.from('leads').update({ status: nextStatus }).eq('id', id)
    if (error) return alert(error.message)
    setItems(v => v.map((x: any) => x.id === id ? { ...x, status: nextStatus } : x))
  }

  const selectedItems = selected
    ? (selected.project_items?.length
        ? selected.project_items
        : [{ assessment: selected.assessment, estimate: selected.estimate }])
    : []

  return <>
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Trabajo</th>
            <th>Instalación</th>
            <th>Visita</th>
            <th>Estimación</th>
            <th>Fotos</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((x: any) => (
            <tr key={x.id}>
              <td>
                <strong>{x.code}</strong>
                <div className="table-sub">{new Date(x.created_at).toLocaleString('es-EC')}</div>
              </td>
              <td>
                {x.name}
                <div className="table-sub">{x.phone}</div>
              </td>
              <td>
                {x.project_items?.length > 1 ? `${x.project_items.length} trabajos` : x.project_label}
                <div className="table-sub">{overallSummary(x)}</div>
              </td>
              <td>
                {x.city}{x.province ? `, ${x.province}` : ''}
                <div className="table-sub">{x.address || x.sector || 'Dirección por confirmar'}</div>
              </td>
              <td>{x.needs_visit ? 'Sí' : 'No / por confirmar'}</td>
              <td>{x.estimate?.low != null ? `$${Number(x.estimate.low).toFixed(2)} – $${Number(x.estimate.high).toFixed(2)}` : 'Pendiente'}</td>
              <td>{x.photo_urls?.length ? `${x.photo_urls.length} foto(s)` : '—'}</td>
              <td>
                <select value={x.status} onChange={e => status(x.id, e.target.value)}>
                  <option value="new">Nueva</option>
                  <option value="reviewing">Revisando</option>
                  <option value="visit_scheduled">Visita agendada</option>
                  <option value="quoted">Cotizada</option>
                  <option value="won">Ganada</option>
                  <option value="lost">No concretada</option>
                </select>
              </td>
              <td><button className="btn small" onClick={() => setSelected(x)}>Ver detalle</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length && <div className="empty">No hay solicitudes todavía.</div>}
    </div>

    {selected && (
      <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
        <div className="modal-card lead-modal-v3" onMouseDown={e => e.stopPropagation()}>
          <div className="admin-top">
            <div className="admin-title">
              <h1 style={{ fontSize: 30 }}>{selected.code}</h1>
              <p>{selected.name} · {selected.city}{selected.province ? `, ${selected.province}` : ''}</p>
            </div>
            <button className="btn small" onClick={() => setSelected(null)}>Cerrar</button>
          </div>

          <div className="lead-brief-v3">
            <div className="lead-brief-heading">
              <div>
                <div className="eyebrow">Lo que pidió el cliente</div>
                <h3>{selected.project_items?.length > 1 ? `${selected.project_items.length} trabajos` : selected.assessment?.projectLabel || selected.project_label}</h3>
              </div>
              <span className={selected.needs_visit ? 'brief-status visit' : 'brief-status'}>
                {selected.needs_visit ? 'Requiere visita' : 'Revisar cotización'}
              </span>
            </div>
            <p className="brief-main-copy">{overallSummary(selected)}</p>
          </div>

          <div className="detail-grid">
            <div className="card detail-box">
              <div className="eyebrow">Contacto e instalación</div>
              <p>
                <strong>{selected.name}</strong><br />
                {selected.phone}<br />
                {selected.email || 'Sin correo'}<br /><br />
                <strong>{selected.city}{selected.province ? `, ${selected.province}` : ''}, Ecuador</strong><br />
                {selected.address || selected.sector || 'Dirección pendiente; el cliente puede compartirla por WhatsApp'}
              </p>
              <a className="btn small" href={`https://wa.me/${String(selected.phone).replace(/\D/g, '')}`} target="_blank">Abrir WhatsApp</a>
            </div>

            <div className="card detail-box">
              <div className="eyebrow">Estado comercial</div>
              <p>
                Modalidad: <strong>{overallSupply(selected)}</strong><br />
                Visita: <strong>{selected.needs_visit ? 'Sí' : 'No / por confirmar'}</strong><br />
                Riesgo: <strong>{overallRisk(selected)}</strong>
              </p>
              {selected.estimate?.low != null && (
                <div className="admin-price">${Number(selected.estimate.low).toFixed(2)} – ${Number(selected.estimate.high).toFixed(2)}</div>
              )}
            </div>
          </div>

          <div className="lead-work-list">
            {selectedItems.map((p: any, i: number) => {
              const a = p.assessment || {}
              return (
                <section className="card lead-work-card" key={i}>
                  <div className="lead-work-title">
                    <div>
                      <span>Trabajo {i + 1}</span>
                      <h3>{a.projectLabel || 'Trabajo por revisar'}</h3>
                    </div>
                    <strong>{p.estimate ? `$${Number(p.estimate.low).toFixed(2)} – $${Number(p.estimate.high).toFixed(2)}` : 'Sin precio automático'}</strong>
                  </div>

                  <p className="work-request">{a.clientRequestSummary || 'Sin descripción estructurada.'}</p>

                  {p.estimate?.source && (
                    <div className="estimate-source">
                      {p.estimate.source === 'granular' ? `Cálculo por materiales${p.estimate.recipeLabel ? ` · ${p.estimate.recipeLabel}` : ''}` : p.estimate.source === 'labor_only' ? 'Cálculo de mano de obra / instalación' : 'Tarifa general'}
                    </div>
                  )}

                  <div className="spec-grid">
                    <div><span>Medidas</span><strong>{dims(a)}</strong></div>
                    <div><span>Aluminio</span><strong>{aluminumText(a)}</strong></div>
                    <div><span>Vidrio</span><strong>{glassText(a)}</strong></div>
                    <div><span>Servicio</span><strong>{supplyLabel(a.supplyMode)}</strong></div>
                  </div>

                  {a.detectedNeeds?.length > 0 && (
                    <div className="admin-section-block">
                      <span>Materiales / accesorios a considerar</span>
                      <p>{a.detectedNeeds.join(' · ')}</p>
                    </div>
                  )}

                  {a.recommendedGlass && (
                    <div className="admin-section-block">
                      <span>Orientación de vidrio</span>
                      <p><strong>{a.recommendedGlass}</strong>{a.recommendationReason ? ` — ${a.recommendationReason}` : ''}</p>
                    </div>
                  )}

                  {a.providedData?.length > 0 && (
                    <div className="facts-row">{a.providedData.map((x: string, idx: number) => <span key={idx}>{x}</span>)}</div>
                  )}

                  {a.missing?.length > 0 && (
                    <div className="admin-section-block warning">
                      <span>Falta confirmar</span>
                      <p>{a.missing.join(' · ')}</p>
                    </div>
                  )}

                  {a.technicalNotes?.length > 0 && (
                    <div className="admin-section-block warning">
                      <span>Revisión técnica</span>
                      <p>{a.technicalNotes.join(' · ')}</p>
                    </div>
                  )}

                  {p.estimate?.breakdown?.length > 0 && (
                    <details className="price-breakdown">
                      <summary>Ver cálculo estimado</summary>
                      <div>
                        {p.estimate.breakdown.map((line:any,idx:number)=><p key={idx}><span>{line.label}</span><b>{Number(line.quantity).toFixed(2)} {line.unit}</b><strong>${Number(line.amount).toFixed(2)}</strong></p>)}
                      </div>
                    </details>
                  )}

                  {a.nextStep && (
                    <div className="admin-next-step"><span>Siguiente paso</span><strong>{a.nextStep}</strong></div>
                  )}
                </section>
              )
            })}
          </div>

          {selected.photo_urls?.length > 0 && (
            <div className="card detail-box" style={{ marginTop: 12 }}>
              <div className="eyebrow">Fotografías enviadas</div>
              <div className="lead-photos">
                {selected.photo_urls.map((u: string, i: number) => (
                  <a href={u} target="_blank" key={i}><img src={u} alt={`Foto ${i + 1}`} /></a>
                ))}
              </div>
            </div>
          )}

          {selected.conversation?.length > 0 && (
            <details className="card detail-box conversation-details" style={{ marginTop: 12 }}>
              <summary>Ver conversación completa (solo si hace falta)</summary>
              <div className="conversation-log">
                {selected.conversation.map((m: any, i: number) => (
                  <div key={i}><strong>{m.role === 'assistant' ? 'Asesor' : 'Cliente'}:</strong> {m.text}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    )}
  </>
}
