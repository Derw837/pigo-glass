import SiteContentManager from '@/components/SiteContentManager'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let rows: any[] = []
  try {
    const db = createAdminClient()
    const { data } = await db.from('site_media').select('*').order('section').order('label')
    rows = data || []
  } catch {}

  return (
    <>
      <div className="admin-top">
        <div className="admin-title">
          <h1>Contenido web</h1>
          <p>Administra las fotografías principales que aparecen en la página pública.</p>
        </div>
      </div>
      <SiteContentManager initial={rows} />
    </>
  )
}
