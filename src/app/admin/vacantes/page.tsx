import VacanciesManager from '@/components/VacanciesManager'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const db = createAdminClient()
  const { data: vacancies } = await db.from('vacancies').select('*').order('created_at', { ascending: false })
  const { data: applications } = await db.from('job_applications').select('*').order('created_at', { ascending: false })

  const vacancyMap = new Map((vacancies || []).map((item: any) => [item.id, item.title]))
  const enriched = await Promise.all((applications || []).map(async (item: any) => {
    let cv_url: string | null = null
    if (item.cv_path) {
      const { data } = await db.storage.from('job-cvs').createSignedUrl(item.cv_path, 3600)
      cv_url = data?.signedUrl || null
    }
    return { ...item, vacancy_title: vacancyMap.get(item.vacancy_id) || 'Vacante', cv_url }
  }))

  return (
    <>
      <div className="admin-top">
        <div className="admin-title"><h1>Trabaja con nosotros</h1><p>Publica vacantes, ciérralas cuando corresponda y revisa hojas de vida recibidas.</p></div>
      </div>
      <VacanciesManager initialVacancies={vacancies || []} initialApplications={enriched} />
    </>
  )
}
