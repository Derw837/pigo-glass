-- 1) Crea el usuario administrador desde Supabase > Authentication > Users.
-- 2) Sustituye el correo y ejecuta este SQL una sola vez.
update public.profiles p
set role='admin'
from auth.users u
where p.id=u.id and lower(u.email)=lower('TU_CORREO_AQUI');
