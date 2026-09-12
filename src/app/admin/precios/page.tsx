import { createAdminClient } from '@/lib/supabase/admin'
import PricingManager from '@/components/PricingManager'
export const dynamic='force-dynamic'

export default async function Page(){
  const db=createAdminClient()
  const [{data:glasses},{data:accessories},{data:labor}] = await Promise.all([
    db.from('glass_catalog').select('*').order('label'),
    db.from('accessory_catalog').select('*').order('category').order('label'),
    db.from('labor_rates').select('*').order('label')
  ])
  return <>
    <div className="admin-top">
      <div className="admin-title">
        <h1>Precios</h1>
        <p>Vidrios, accesorios y mano de obra que alimentan el motor de estimaciones.</p>
      </div>
    </div>
    <PricingManager glasses={glasses||[]} accessories={accessories||[]} labor={labor||[]}/>
  </>
}
