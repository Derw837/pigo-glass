'use client'
import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import { createClient } from '@/lib/supabase/browser'

type Glass={id:string;code:string;label:string;glass_type:string;color:string;feature:string;thickness_mm:number|null;cost_price_m2:number;sale_price_m2:number;active:boolean;notes:string|null}
type Accessory={id:string;code:string;label:string;category:string;unit:string;cost_price:number;sale_price:number;active:boolean;notes:string|null}
type Labor={id:string;service_key:string;label:string;unit:string;fabrication_rate:number;installation_rate:number;minimum_charge:number;active:boolean;notes:string|null}

const n=(v:any)=>Number(v||0)

export default function PricingManager({glasses,accessories,labor}:{glasses:Glass[];accessories:Accessory[];labor:Labor[]}){
  const [tab,setTab]=useState<'glass'|'accessory'|'labor'>('glass')
  const [gs,setGs]=useState(glasses)
  const [as,setAs]=useState(accessories)
  const [ls,setLs]=useState(labor)
  const [q,setQ]=useState('')
  const [busy,setBusy]=useState(false)
  const db=createClient()

  const glassView=useMemo(()=>gs.filter(x=>`${x.code} ${x.label} ${x.glass_type} ${x.color} ${x.feature}`.toLowerCase().includes(q.toLowerCase())),[gs,q])
  const accessoryView=useMemo(()=>as.filter(x=>`${x.code} ${x.label} ${x.category}`.toLowerCase().includes(q.toLowerCase())),[as,q])

  async function saveGlass(x:Glass){
    const {error}=await db.from('glass_catalog').update({label:x.label,glass_type:x.glass_type,color:x.color,feature:x.feature,thickness_mm:x.thickness_mm||null,cost_price_m2:n(x.cost_price_m2),sale_price_m2:n(x.sale_price_m2),active:x.active,notes:x.notes||null,updated_at:new Date().toISOString()}).eq('id',x.id)
    if(error) alert(error.message)
  }
  async function saveAccessory(x:Accessory){
    const {error}=await db.from('accessory_catalog').update({label:x.label,category:x.category,unit:x.unit,cost_price:n(x.cost_price),sale_price:n(x.sale_price),active:x.active,notes:x.notes||null,updated_at:new Date().toISOString()}).eq('id',x.id)
    if(error) alert(error.message)
  }
  async function saveLabor(x:Labor){
    const {error}=await db.from('labor_rates').update({unit:x.unit,fabrication_rate:n(x.fabrication_rate),installation_rate:n(x.installation_rate),minimum_charge:n(x.minimum_charge),active:x.active,notes:x.notes||null,updated_at:new Date().toISOString()}).eq('id',x.id)
    if(error) alert(error.message)
  }

  async function addGlass(){
    const code=`VIDRIO-${Date.now()}`
    const {data,error}=await db.from('glass_catalog').insert({code,label:'Nuevo vidrio',glass_type:'normal',color:'claro',feature:'standard',active:true}).select('*').single()
    if(error) return alert(error.message)
    setGs(v=>[data as Glass,...v])
  }
  async function addAccessory(){
    const code=`ACC-${Date.now()}`
    const {data,error}=await db.from('accessory_catalog').insert({code,label:'Nuevo accesorio',category:'General',unit:'unit',active:true}).select('*').single()
    if(error) return alert(error.message)
    setAs(v=>[data as Accessory,...v])
  }

  async function importSheet(file:File,kind:'glass'|'accessory'){
    setBusy(true)
    try{
      const wb=XLSX.read(await file.arrayBuffer())
      const rows=XLSX.utils.sheet_to_json<any>(wb.Sheets[wb.SheetNames[0]],{defval:''})
      const lower=(o:any)=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k.trim().toLowerCase(),v]))
      if(kind==='glass'){
        const parsed=rows.map(row=>{const x:any=lower(row);return {code:String(x.codigo||x.code||'').trim(),label:String(x.nombre||x.label||'').trim(),glass_type:String(x.tipo||x.glass_type||'normal').trim(),color:String(x.color||'claro').trim(),feature:String(x.prestacion||x.feature||'standard').trim(),thickness_mm:n(x.espesor_mm||x.thickness_mm)||null,cost_price_m2:n(x.costo_m2||x.cost_price_m2),sale_price_m2:n(x.precio_venta_m2||x.sale_price_m2),notes:String(x.notas||x.notes||'').trim()||null,active:true}}).filter((x:any)=>x.code&&x.label)
        const {error}=await db.from('glass_catalog').upsert(parsed,{onConflict:'code'})
        if(error) throw error
      }else{
        const parsed=rows.map(row=>{const x:any=lower(row);return {code:String(x.codigo||x.code||'').trim(),label:String(x.nombre||x.label||'').trim(),category:String(x.categoria||x.category||'General').trim(),unit:String(x.unidad||x.unit||'unit').trim(),cost_price:n(x.costo||x.cost_price),sale_price:n(x.precio_venta||x.sale_price),notes:String(x.notas||x.notes||'').trim()||null,active:true}}).filter((x:any)=>x.code&&x.label)
        const {error}=await db.from('accessory_catalog').upsert(parsed,{onConflict:'code'})
        if(error) throw error
      }
      location.reload()
    }catch(e:any){alert(e?.message||'No se pudo importar el archivo')}finally{setBusy(false)}
  }

  return <div className="pricing-wrap">
    <div className="admin-tabs">
      <button className={tab==='glass'?'active':''} onClick={()=>setTab('glass')}>Vidrios</button>
      <button className={tab==='accessory'?'active':''} onClick={()=>setTab('accessory')}>Accesorios</button>
      <button className={tab==='labor'?'active':''} onClick={()=>setTab('labor')}>Mano de obra</button>
    </div>

    {tab==='glass'&&<div className="table-card">
      <div className="table-tools">
        <input placeholder="Buscar vidrio" value={q} onChange={e=>setQ(e.target.value)}/>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <a className="btn small ghost" href="/templates/vidrios_importacion.csv">Plantilla CSV</a>
          <label className="btn small ghost">{busy?'Importando…':'Importar Excel / CSV'}<input type="file" accept=".xlsx,.xls,.csv" hidden disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)importSheet(f,'glass')}}/></label>
          <button className="btn small" onClick={addGlass}>+ Nuevo vidrio</button>
        </div>
      </div>
      <table className="data-table pricing-table"><thead><tr><th>Código</th><th>Nombre</th><th>Tipo</th><th>Color</th><th>Prestación</th><th>mm</th><th>Costo/m²</th><th>Venta/m²</th><th>Activo</th><th></th></tr></thead>
      <tbody>{glassView.map(x=><tr key={x.id}>
        <td><strong>{x.code}</strong></td>
        <td><input value={x.label} onChange={e=>setGs(v=>v.map(y=>y.id===x.id?{...y,label:e.target.value}:y))}/></td>
        <td><select value={x.glass_type} onChange={e=>setGs(v=>v.map(y=>y.id===x.id?{...y,glass_type:e.target.value}:y))}><option value="normal">Normal</option><option value="tempered">Templado</option><option value="laminated">Laminado</option><option value="tempered_laminated">Templado-laminado</option><option value="other">Otro</option></select></td>
        <td><input value={x.color} onChange={e=>setGs(v=>v.map(y=>y.id===x.id?{...y,color:e.target.value}:y))}/></td>
        <td><select value={x.feature} onChange={e=>setGs(v=>v.map(y=>y.id===x.id?{...y,feature:e.target.value}:y))}><option value="standard">Estándar</option><option value="control_solar">Control solar</option><option value="acoustic">Acústico</option><option value="acid_etched">Al ácido</option><option value="decorative">Decorativo</option><option value="other">Otro</option></select></td>
        <td><input type="number" step=".1" value={x.thickness_mm??''} onChange={e=>setGs(v=>v.map(y=>y.id===x.id?{...y,thickness_mm:e.target.value?Number(e.target.value):null}:y))}/></td>
        <td><input type="number" step=".01" value={x.cost_price_m2||0} onChange={e=>setGs(v=>v.map(y=>y.id===x.id?{...y,cost_price_m2:n(e.target.value)}:y))}/></td>
        <td><input type="number" step=".01" value={x.sale_price_m2||0} onChange={e=>setGs(v=>v.map(y=>y.id===x.id?{...y,sale_price_m2:n(e.target.value)}:y))}/></td>
        <td><input type="checkbox" checked={x.active} onChange={e=>setGs(v=>v.map(y=>y.id===x.id?{...y,active:e.target.checked}:y))}/></td>
        <td><button className="btn small" onClick={()=>saveGlass(x)}>Guardar</button></td>
      </tr>)}</tbody></table>
    </div>}

    {tab==='accessory'&&<div className="table-card">
      <div className="table-tools">
        <input placeholder="Buscar accesorio" value={q} onChange={e=>setQ(e.target.value)}/>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <a className="btn small ghost" href="/templates/accesorios_importacion.csv">Plantilla CSV</a>
          <label className="btn small ghost">{busy?'Importando…':'Importar Excel / CSV'}<input type="file" accept=".xlsx,.xls,.csv" hidden disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)importSheet(f,'accessory')}}/></label>
          <button className="btn small" onClick={addAccessory}>+ Nuevo accesorio</button>
        </div>
      </div>
      <table className="data-table pricing-table"><thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Unidad</th><th>Costo</th><th>Venta</th><th>Activo</th><th></th></tr></thead>
      <tbody>{accessoryView.map(x=><tr key={x.id}>
        <td><strong>{x.code}</strong></td>
        <td><input value={x.label} onChange={e=>setAs(v=>v.map(y=>y.id===x.id?{...y,label:e.target.value}:y))}/></td>
        <td><input value={x.category} onChange={e=>setAs(v=>v.map(y=>y.id===x.id?{...y,category:e.target.value}:y))}/></td>
        <td><select value={x.unit} onChange={e=>setAs(v=>v.map(y=>y.id===x.id?{...y,unit:e.target.value}:y))}><option value="unit">Unidad</option><option value="m">Metro</option><option value="m2">m²</option><option value="set">Kit</option></select></td>
        <td><input type="number" step=".01" value={x.cost_price||0} onChange={e=>setAs(v=>v.map(y=>y.id===x.id?{...y,cost_price:n(e.target.value)}:y))}/></td>
        <td><input type="number" step=".01" value={x.sale_price||0} onChange={e=>setAs(v=>v.map(y=>y.id===x.id?{...y,sale_price:n(e.target.value)}:y))}/></td>
        <td><input type="checkbox" checked={x.active} onChange={e=>setAs(v=>v.map(y=>y.id===x.id?{...y,active:e.target.checked}:y))}/></td>
        <td><button className="btn small" onClick={()=>saveAccessory(x)}>Guardar</button></td>
      </tr>)}</tbody></table>
    </div>}

    {tab==='labor'&&<div className="table-card">
      <div className="notice" style={{margin:14}}>Estas tarifas son el valor por unidad de servicio. Si el cliente ya tiene los materiales, el estimador puede usar solo mano de obra + instalación.</div>
      <table className="data-table pricing-table"><thead><tr><th>Servicio</th><th>Unidad</th><th>Fabricación/u.</th><th>Instalación/u.</th><th>Mínimo</th><th>Activo</th><th></th></tr></thead>
      <tbody>{ls.map(x=><tr key={x.id}>
        <td><strong>{x.label}</strong><div style={{fontSize:10,color:'#777'}}>{x.service_key}</div></td>
        <td><select value={x.unit} onChange={e=>setLs(v=>v.map(y=>y.id===x.id?{...y,unit:e.target.value}:y))}><option value="m2">m²</option><option value="ml">Metro lineal</option><option value="unit">Unidad</option></select></td>
        <td><input type="number" step=".01" value={x.fabrication_rate||0} onChange={e=>setLs(v=>v.map(y=>y.id===x.id?{...y,fabrication_rate:n(e.target.value)}:y))}/></td>
        <td><input type="number" step=".01" value={x.installation_rate||0} onChange={e=>setLs(v=>v.map(y=>y.id===x.id?{...y,installation_rate:n(e.target.value)}:y))}/></td>
        <td><input type="number" step=".01" value={x.minimum_charge||0} onChange={e=>setLs(v=>v.map(y=>y.id===x.id?{...y,minimum_charge:n(e.target.value)}:y))}/></td>
        <td><input type="checkbox" checked={x.active} onChange={e=>setLs(v=>v.map(y=>y.id===x.id?{...y,active:e.target.checked}:y))}/></td>
        <td><button className="btn small" onClick={()=>saveLabor(x)}>Guardar</button></td>
      </tr>)}</tbody></table>
    </div>}
  </div>
}
