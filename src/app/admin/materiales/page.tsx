import { createAdminClient } from '@/lib/supabase/admin'
import MaterialsManager from '@/components/MaterialsManager'
export const dynamic='force-dynamic'
export default async function Page(){const db=createAdminClient();const {data}=await db.from('catalog_items').select('id,brand,reference,name,category,cost_price,sale_price,bar_length_m,unit,active').order('brand').order('reference').limit(5000);return <><div className="admin-top"><div className="admin-title"><h1>Materiales</h1><p>Catálogo inicial CEDAL + Andesía. Completa costos y precios manualmente o importa Excel.</p></div><a href="/templates/materiales_importacion.csv" className="btn small">Descargar plantilla</a></div><MaterialsManager initial={(data||[]) as any}/></>}
