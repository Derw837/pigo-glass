import { createAdminClient } from '@/lib/supabase/admin'
import RecipesManager from '@/components/RecipesManager'
export const dynamic='force-dynamic'

export default async function Page(){
  const db=createAdminClient()
  const [{data:recipes},{data:profileLines},{data:accessoryLines},{data:catalog},{data:accessories}] = await Promise.all([
    db.from('quote_recipes').select('*').order('service_key').order('brand'),
    db.from('quote_recipe_profiles').select('*').order('sort_order'),
    db.from('quote_recipe_accessories').select('*').order('sort_order'),
    db.from('catalog_items').select('brand,reference,name,cost_price,sale_price,bar_length_m,unit,active'),
    db.from('accessory_catalog').select('code,label,cost_price,sale_price,unit,active')
  ])
  return <>
    <div className="admin-top">
      <div className="admin-title">
        <h1>Recetas de cálculo</h1>
        <p>Define cuánto perfil, vidrio y accesorios consume cada sistema. Solo activa una receta después de revisar sus precios.</p>
      </div>
    </div>
    <RecipesManager recipes={recipes||[]} profileLines={profileLines||[]} accessoryLines={accessoryLines||[]} catalog={catalog||[]} accessories={accessories||[]}/>
  </>
}
