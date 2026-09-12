-- V10 · Contenido visual editable + vacantes + postulaciones

create table if not exists public.site_media(
  key text primary key,
  label text not null,
  section text not null,
  image_url text,
  alt_text text,
  updated_at timestamptz not null default now()
);

insert into public.site_media(key,label,section) values
 ('home_hero','Portada principal','Inicio'),
 ('service_windows','Servicio · Ventanas','Servicios'),
 ('service_barandas','Servicio · Barandas','Servicios'),
 ('service_bathrooms','Servicio · Mamparas','Servicios'),
 ('service_curtains','Servicio · Cortinas de baño','Servicios'),
 ('service_doors','Servicio · Puertas','Servicios'),
 ('service_divisions','Servicio · Divisiones','Servicios'),
 ('service_roofs','Servicio · Cubiertas','Servicios'),
 ('service_pergolas','Servicio · Pérgolas','Servicios'),
 ('service_mirrors','Servicio · Espejos','Servicios'),
 ('service_special','Servicio · Proyectos especiales','Servicios'),
 ('company_home','Nuestra empresa','Inicio'),
 ('corporate_home','Empresas y comercios','Inicio'),
 ('installation_home','Instalación profesional','Inicio'),
 ('gallery_hero','Portada de galería','Galería'),
 ('company_hero','Portada de Nuestra empresa','Empresa'),
 ('careers_hero','Portada Trabaja con nosotros','Empleo')
on conflict(key) do nothing;

alter table public.site_media enable row level security;
drop policy if exists "site media public read" on public.site_media;
drop policy if exists "site media admin all" on public.site_media;
create policy "site media public read" on public.site_media for select using(true);
create policy "site media admin all" on public.site_media for all using(public.is_admin()) with check(public.is_admin());

insert into storage.buckets(id,name,public) values('site-media','site-media',true)
on conflict(id) do update set public=true;

drop policy if exists "site media objects public" on storage.objects;
drop policy if exists "site media objects admin insert" on storage.objects;
drop policy if exists "site media objects admin update" on storage.objects;
drop policy if exists "site media objects admin delete" on storage.objects;
create policy "site media objects public" on storage.objects for select using(bucket_id='site-media');
create policy "site media objects admin insert" on storage.objects for insert to authenticated with check(bucket_id='site-media' and public.is_admin());
create policy "site media objects admin update" on storage.objects for update to authenticated using(bucket_id='site-media' and public.is_admin()) with check(bucket_id='site-media' and public.is_admin());
create policy "site media objects admin delete" on storage.objects for delete to authenticated using(bucket_id='site-media' and public.is_admin());

create table if not exists public.vacancies(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null default 'Ecuador',
  contract_type text not null default 'Tiempo completo',
  summary text not null default '',
  description text not null default '',
  requirements text not null default '',
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_applications(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  vacancy_id uuid not null references public.vacancies(id) on delete restrict,
  full_name text not null,
  phone text not null,
  email text not null,
  city text not null,
  message text,
  cv_path text not null,
  status text not null default 'new' check(status in ('new','reviewing','contacted','rejected','hired')),
  created_at timestamptz not null default now()
);

alter table public.vacancies enable row level security;
alter table public.job_applications enable row level security;

drop policy if exists "vacancies public open read" on public.vacancies;
drop policy if exists "vacancies admin all" on public.vacancies;
drop policy if exists "job applications admin read" on public.job_applications;
drop policy if exists "job applications admin update" on public.job_applications;
create policy "vacancies public open read" on public.vacancies for select using(is_open=true or public.is_admin());
create policy "vacancies admin all" on public.vacancies for all using(public.is_admin()) with check(public.is_admin());
create policy "job applications admin read" on public.job_applications for select using(public.is_admin());
create policy "job applications admin update" on public.job_applications for update using(public.is_admin()) with check(public.is_admin());

insert into storage.buckets(id,name,public) values('job-cvs','job-cvs',false)
on conflict(id) do update set public=false;

drop policy if exists "job cvs admin read" on storage.objects;
drop policy if exists "job cvs admin delete" on storage.objects;
create policy "job cvs admin read" on storage.objects for select to authenticated using(bucket_id='job-cvs' and public.is_admin());
create policy "job cvs admin delete" on storage.objects for delete to authenticated using(bucket_id='job-cvs' and public.is_admin());
