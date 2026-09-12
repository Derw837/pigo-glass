'use client'
import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'

type Recipe={id:string;service_key:string;brand:string;label:string;enabled:boolean;price_mode:string;glass_area_factor:number;waste_percent:number;margin_percent:number;error_percent:number;minimum_charge:number;notes:string|null}
type ProfileLine={id:string;recipe_id:string;catalog_reference:string;role:string;formula:string;multiplier:number;waste_percent:number;sort_order:number}
type AccessoryLine={id:string;recipe_id:string;accessory_code:string;formula:string;multiplier:number;sort_order:number}
type Catalog={brand:string;reference:string;name:string;cost_price:number;sale_price:number;bar_length_m:number|null;unit:string;active:boolean}
type Accessory={code:string;label:string;cost_price:number;sale_price:number;unit:string;active:boolean}

const n=(v:any)=>Number(v||0)
const formulaText=(f:string)=>({width:'Ancho',height:'Alto',perimeter:'Perímetro',area:'Área',unit:'Unidad'} as any)[f]||f

export default function RecipesManager({recipes,profileLines,accessoryLines,catalog,accessories}:{recipes:Recipe[];profileLines:ProfileLine[];accessoryLines:AccessoryLine[];catalog:Catalog[];accessories:Accessory[]}){
  const [rs,setRs]=useState(recipes)
  const [ps,setPs]=useState(profileLines)
  const [acs,setAcs]=useState(accessoryLines)
  const [open,setOpen]=useState<string|null>(recipes[0]?.id||null)
  const db=createClient()

  const catalogMap=useMemo(()=>new Map(catalog.map(x=>[`${x.brand}|${x.reference}`,x])),[catalog])
  const accessoryMap=useMemo(()=>new Map(accessories.map(x=>[x.code,x])),[accessories])

  function readiness(r:Recipe){
    const lines=ps.filter(x=>x.recipe_id===r.id)
    const acc=acs.filter(x=>x.recipe_id===r.id)
    const missing:string[]=[]
    for(const x of lines){
      const c=catalogMap.get(`${r.brand}|${x.catalog_reference}`)
      if(!c) missing.push(`${x.catalog_reference} no está en catálogo`)
      else {
        const price=r.price_mode==='sale_prices'?n(c.sale_price):n(c.cost_price)
        if(!price) missing.push(`${x.catalog_reference} sin precio`)
        if((c.unit||'barra')==='barra'&&!c.bar_length_m) missing.push(`${x.catalog_reference} sin largo de barra`)
      }
    }
    for(const x of acc){
      const a=accessoryMap.get(x.accessory_code)
      if(!a) missing.push(`${x.accessory_code} no existe`)
      else if(!(r.price_mode==='sale_prices'?n(a.sale_price):n(a.cost_price))) missing.push(`${x.accessory_code} sin precio`)
    }
    return missing
  }

  async function saveRecipe(r:Recipe){
    const missing=readiness(r)
    if(r.enabled&&missing.length){
      alert(`No conviene activar todavía esta receta. Falta:\n- ${missing.slice(0,12).join('\n- ')}`)
      return
    }
    const {error}=await db.from('quote_recipes').update({label:r.label,enabled:r.enabled,price_mode:r.price_mode,glass_area_factor:n(r.glass_area_factor),waste_percent:n(r.waste_percent),margin_percent:n(r.margin_percent),error_percent:n(r.error_percent),minimum_charge:n(r.minimum_charge),notes:r.notes||null,updated_at:new Date().toISOString()}).eq('id',r.id)
    if(error) alert(error.message)
  }

  async function saveProfile(x:ProfileLine){
    const {error}=await db.from('quote_recipe_profiles').update({role:x.role,formula:x.formula,multiplier:n(x.multiplier),waste_percent:n(x.waste_percent),sort_order:n(x.sort_order)}).eq('id',x.id)
    if(error) alert(error.message)
  }
  async function saveAccessory(x:AccessoryLine){
    const {error}=await db.from('quote_recipe_accessories').update({formula:x.formula,multiplier:n(x.multiplier),sort_order:n(x.sort_order)}).eq('id',x.id)
    if(error) alert(error.message)
  }

  return <div className="recipe-list">
    <div className="notice" style={{marginBottom:16}}>
      Las recetas iniciales de ventana fija y corrediza son una base aproximada de consumo y vienen <strong>desactivadas</strong>. Completa precios, revisa multiplicadores y luego activa. El sistema nunca mostrará un precio granular si falta un componente necesario.
    </div>
    {rs.map(r=>{
      const missing=readiness(r)
      const isOpen=open===r.id
      const lines=ps.filter(x=>x.recipe_id===r.id)
      const acc=acs.filter(x=>x.recipe_id===r.id)
      return <section className="recipe-card" key={r.id}>
        <button className="recipe-head" onClick={()=>setOpen(isOpen?null:r.id)}>
          <div><span>{r.brand} · {r.service_key}</span><strong>{r.label}</strong></div>
          <div className="recipe-head-right">
            <em className={missing.length?'status warn':'status ok'}>{missing.length?`${missing.length} pendientes`:'Precios completos'}</em>
            <em className={r.enabled?'status on':'status'}>{r.enabled?'ACTIVA':'DESACTIVADA'}</em>
            <b>{isOpen?'−':'+'}</b>
          </div>
        </button>
        {isOpen&&<div className="recipe-body">
          <div className="recipe-settings">
            <label>Modo de precio<select value={r.price_mode} onChange={e=>setRs(v=>v.map(y=>y.id===r.id?{...y,price_mode:e.target.value}:y))}><option value="cost_plus_margin">Costo + margen</option><option value="sale_prices">Precio de venta</option></select></label>
            <label>Factor área vidrio<input type="number" step=".01" min="0.5" max="1.2" value={r.glass_area_factor} onChange={e=>setRs(v=>v.map(y=>y.id===r.id?{...y,glass_area_factor:n(e.target.value)}:y))}/></label>
            <label>Desperdicio %<input type="number" step=".1" value={r.waste_percent} onChange={e=>setRs(v=>v.map(y=>y.id===r.id?{...y,waste_percent:n(e.target.value)}:y))}/></label>
            <label>Margen %<input type="number" step=".1" value={r.margin_percent} onChange={e=>setRs(v=>v.map(y=>y.id===r.id?{...y,margin_percent:n(e.target.value)}:y))}/></label>
            <label>Rango ± %<input type="number" step=".1" value={r.error_percent} onChange={e=>setRs(v=>v.map(y=>y.id===r.id?{...y,error_percent:n(e.target.value)}:y))}/></label>
            <label>Mínimo $<input type="number" step=".01" value={r.minimum_charge} onChange={e=>setRs(v=>v.map(y=>y.id===r.id?{...y,minimum_charge:n(e.target.value)}:y))}/></label>
          </div>
          <div className="recipe-toggle-row">
            <label className="switch-line"><input type="checkbox" checked={r.enabled} onChange={e=>setRs(v=>v.map(y=>y.id===r.id?{...y,enabled:e.target.checked}:y))}/> Permitir estimación automática con esta receta</label>
            <button className="btn small" onClick={()=>saveRecipe(r)}>Guardar configuración</button>
          </div>
          {missing.length>0&&<div className="recipe-missing"><strong>Antes de activarla:</strong> {missing.slice(0,14).join(' · ')}</div>}

          <h3>Perfilería</h3>
          <div className="table-card"><table className="data-table"><thead><tr><th>Ref.</th><th>Función</th><th>Fórmula</th><th>Multiplicador</th><th>Desp. línea</th><th>Precio</th><th></th></tr></thead><tbody>
            {lines.map(x=>{const c=catalogMap.get(`${r.brand}|${x.catalog_reference}`);const price=c?(r.price_mode==='sale_prices'?c.sale_price:c.cost_price):0;return <tr key={x.id}>
              <td><strong>{x.catalog_reference}</strong><div className="tiny-muted">{c?.name||'No encontrado'}</div></td>
              <td><input value={x.role} onChange={e=>setPs(v=>v.map(y=>y.id===x.id?{...y,role:e.target.value}:y))}/></td>
              <td><select value={x.formula} onChange={e=>setPs(v=>v.map(y=>y.id===x.id?{...y,formula:e.target.value}:y))}>{['width','height','perimeter','area','unit'].map(f=><option key={f} value={f}>{formulaText(f)}</option>)}</select></td>
              <td><input type="number" step=".01" value={x.multiplier} onChange={e=>setPs(v=>v.map(y=>y.id===x.id?{...y,multiplier:n(e.target.value)}:y))}/></td>
              <td><input type="number" step=".1" value={x.waste_percent} onChange={e=>setPs(v=>v.map(y=>y.id===x.id?{...y,waste_percent:n(e.target.value)}:y))}/></td>
              <td className={price?'price-ok':'price-missing'}>{price?`$${Number(price).toFixed(2)} / ${c?.unit||'barra'}`:'Sin precio'}</td>
              <td><button className="btn small ghost" onClick={()=>saveProfile(x)}>Guardar</button></td>
            </tr>})}
          </tbody></table></div>

          <h3>Accesorios</h3>
          <div className="table-card"><table className="data-table"><thead><tr><th>Código</th><th>Accesorio</th><th>Fórmula</th><th>Multiplicador</th><th>Precio</th><th></th></tr></thead><tbody>
            {acc.map(x=>{const a=accessoryMap.get(x.accessory_code);const price=a?(r.price_mode==='sale_prices'?a.sale_price:a.cost_price):0;return <tr key={x.id}>
              <td><strong>{x.accessory_code}</strong></td><td>{a?.label||'No encontrado'}</td>
              <td><select value={x.formula} onChange={e=>setAcs(v=>v.map(y=>y.id===x.id?{...y,formula:e.target.value}:y))}>{['width','height','perimeter','area','unit'].map(f=><option key={f} value={f}>{formulaText(f)}</option>)}</select></td>
              <td><input type="number" step=".01" value={x.multiplier} onChange={e=>setAcs(v=>v.map(y=>y.id===x.id?{...y,multiplier:n(e.target.value)}:y))}/></td>
              <td className={price?'price-ok':'price-missing'}>{price?`$${Number(price).toFixed(2)} / ${a?.unit||'u.'}`:'Sin precio'}</td>
              <td><button className="btn small ghost" onClick={()=>saveAccessory(x)}>Guardar</button></td>
            </tr>})}
          </tbody></table></div>
        </div>}
      </section>
    })}
  </div>
}
