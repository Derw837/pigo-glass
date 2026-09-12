import { createAdminClient } from '@/lib/supabase/admin'
import LeadManager from '@/components/LeadManager'
export const dynamic='force-dynamic'
export default async function Page(){
  const db=createAdminClient()
  const {data}=await db.from('leads').select('*').order('created_at',{ascending:false}).limit(500)
  const leads=data||[]
  const ids=leads.map(x=>x.id)
  let grouped:Record<string,string[]>={}
  if(ids.length){
    const {data:imgs}=await db.from('lead_images').select('lead_id,storage_path').in('lead_id',ids)
    for(const img of imgs||[]){const {data:signed}=await db.storage.from('lead-images').createSignedUrl(img.storage_path,60*60);if(signed?.signedUrl)(grouped[img.lead_id]??=[]).push(signed.signedUrl)}
  }
  const hydrated=leads.map(x=>({...x,photo_urls:grouped[x.id]||[]}))
  return <><div className="admin-top"><div className="admin-title"><h1>Solicitudes</h1><p>Leads recibidos por el asesor, fotografías y estado comercial.</p></div></div><LeadManager initial={hydrated}/></>
}
