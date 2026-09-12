import { createAdminClient } from '@/lib/supabase/admin'
import SettingsManager from '@/components/SettingsManager'
export const dynamic='force-dynamic'
export default async function Page(){const db=createAdminClient();const {data}=await db.from('service_rates').select('*').order('label');return <><div className="admin-top"><div className="admin-title"><h1>Tarifas del estimador</h1><p>Todos los valores comienzan en 0 para evitar mostrar precios inventados. Activa “Auto” solo cuando completes tus costos.</p></div></div><SettingsManager rates={data||[]}/><div className="notice" style={{marginTop:16}}>Para proyectos estructurales o especiales el sistema no toma estas tarifas como cotización definitiva. La visita/revisión técnica prevalece.</div></>}
