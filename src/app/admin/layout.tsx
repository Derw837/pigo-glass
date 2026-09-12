import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/AdminShell'
export default async function Layout({children}:{children:React.ReactNode}){const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login-admin');const {data:p}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();if(p?.role!=='admin')redirect('/login-admin?error=sin_permiso');return <AdminShell>{children}</AdminShell>}
