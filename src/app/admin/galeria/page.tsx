import { createAdminClient } from '@/lib/supabase/admin'
import GalleryManager from '@/components/GalleryManager'
export const dynamic='force-dynamic'
export default async function Page(){const db=createAdminClient();const {data}=await db.from('gallery_projects').select('*').order('created_at',{ascending:false});return <><div className="admin-top"><div className="admin-title"><h1>Galería</h1><p>Publica trabajos reales y ordénalos por categoría.</p></div></div><GalleryManager initial={data||[]}/></>}
