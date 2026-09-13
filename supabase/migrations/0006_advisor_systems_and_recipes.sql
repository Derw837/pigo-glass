-- PIGO Studio V11 — sistemas, origen de aluminio y herrajes en las recetas de cotización
-- Permite varias recetas por servicio/marca (ej. CEDAL 7 perfiles, 6 perfiles, T45, S4200).

alter table public.quote_recipes add column if not exists system_code text not null default 'generic';
alter table public.quote_recipes add column if not exists system_label text;
alter table public.quote_recipes add column if not exists aluminum_origin text not null default 'unknown';
alter table public.quote_recipes add column if not exists system_tier text not null default 'unknown';
alter table public.quote_recipes add column if not exists hardware_origin text not null default 'unknown';
alter table public.quote_recipes add column if not exists hardware_tier text not null default 'unknown';

alter table public.quote_recipes drop constraint if exists quote_recipes_service_key_brand_key;
create unique index if not exists quote_recipes_system_unique
on public.quote_recipes(service_key, brand, system_code, hardware_origin, hardware_tier);

-- Las recetas ya existentes de V7 se identifican con el sistema que realmente representan.
update public.quote_recipes
set system_code='7-perfiles', system_label='Corrediza 7 perfiles', aluminum_origin='national', system_tier='standard'
where service_key='window_sliding' and brand='CEDAL' and (system_code='generic' or system_code is null);

update public.quote_recipes
set system_code='7-perfiles', system_label='Corrediza 7 perfiles Andesía', aluminum_origin='unknown', system_tier='economic'
where service_key='window_sliding' and brand='ANDESIA' and (system_code='generic' or system_code is null);

update public.quote_recipes
set system_code='fija-estandar', system_label='Ventana fija estándar', aluminum_origin='national', system_tier='standard'
where service_key='window_fixed' and brand='CEDAL' and (system_code='generic' or system_code is null);

update public.quote_recipes
set system_code='fija-estandar', system_label='Ventana fija estándar Andesía', aluminum_origin='unknown', system_tier='economic'
where service_key='window_fixed' and brand='ANDESIA' and (system_code='generic' or system_code is null);

-- Sistemas de referencia. Nacen desactivados y sin despiece: el administrador debe cargar/revisar
-- perfiles, accesorios y precios antes de habilitar la estimación automática.
insert into public.quote_recipes(service_key,brand,system_code,system_label,label,enabled,aluminum_origin,system_tier,hardware_origin,hardware_tier,notes)
values
 ('window_sliding','CEDAL','4-perfiles','Corrediza 4 perfiles','Ventana corrediza CEDAL · 4 perfiles',false,'national','economic','unknown','economic','Configurar despiece real antes de activar.'),
 ('window_sliding','CEDAL','6-perfiles','Corrediza 6 perfiles','Ventana corrediza CEDAL · 6 perfiles',false,'national','standard','unknown','standard','Configurar despiece real antes de activar. CEDAL documenta vidrio hasta 6 mm para esta serie.'),
 ('window_sliding','CEDAL','t45-europeo','T45 Sistema Corredizo Europeo','Ventana corrediza CEDAL · T45 Europeo',false,'national','european','european','premium','Configurar perfiles y herrajes T45 antes de activar.'),
 ('window_sliding','ANDESIA','4-perfiles','Corrediza 4 perfiles Andesía','Ventana corrediza Andesía · 4 perfiles',false,'unknown','economic','unknown','economic','Catálogo compartido Andesía. Configurar despiece real antes de activar.'),
 ('window_projectable','ANDESIA','proyectable','Ventana proyectable Andesía','Ventana proyectable Andesía',false,'unknown','standard','unknown','standard','Catálogo compartido Andesía. Configurar despiece real antes de activar.'),
 ('door','CEDAL','t45-europeo','T45 Sistema Corredizo Europeo','Puerta corrediza CEDAL · T45 Europeo',false,'national','european','european','premium','Configurar despiece y accesorios antes de activar.'),
 ('door','CEDAL','s4200','Serie S4200 Euroconfort','Puerta corrediza CEDAL · S4200',false,'national','premium','unknown','premium','Configurar despiece y accesorios antes de activar.'),
 ('door','ANDESIA','puerta-corrediza-economica','Puerta corrediza económica','Puerta corrediza Andesía · Económica',false,'unknown','economic','unknown','economic','Configurar despiece real antes de activar.'),
 ('door','ANDESIA','puerta-corrediza-estandar','Puerta corrediza estándar','Puerta corrediza Andesía · Estándar',false,'unknown','standard','unknown','standard','Configurar despiece real antes de activar.'),
 ('window_fixed','CEDAL','fija-super-economica','Ventana fija super económica','Ventana fija CEDAL · Super económica',false,'national','economic','unknown','economic','Configurar despiece real antes de activar.'),
 ('window_fixed','CEDAL','s3000-cuerpo-fijo','S3000 Cuerpo Fijo','Cuerpo fijo CEDAL · S3000 EuroLine',false,'national','european','european','premium','Configurar despiece S3000 antes de activar.'),
 ('window_projectable','CEDAL','proyectable-estandar','Ventana proyectable estándar','Ventana proyectable CEDAL · Estándar',false,'national','standard','unknown','standard','Configurar despiece real antes de activar.'),
 ('window_projectable','CEDAL','s3000-proyectable','S3000 Proyectable EuroLine','Ventana proyectable CEDAL · S3000',false,'national','european','european','premium','Configurar despiece S3000 antes de activar.'),
 ('partition','CEDAL','s100','Mampara S-100','Mampara CEDAL · S-100',false,'national','standard','unknown','standard','Configurar despiece real antes de activar.'),
 ('partition','CEDAL','s200','Mampara S-200','Mampara CEDAL · S-200',false,'national','standard','unknown','standard','Configurar despiece real antes de activar.'),
 ('partition','CEDAL','s300','Mampara S-300','Mampara CEDAL · S-300',false,'national','premium','unknown','premium','Configurar despiece real antes de activar.'),
 ('partition','ANDESIA','serie-100','Mampara Serie 100','Mampara Andesía · Serie 100',false,'unknown','economic','unknown','economic','Configurar despiece real antes de activar.'),
 ('partition','ANDESIA','serie-200','Mampara Serie 200','Mampara Andesía · Serie 200',false,'unknown','standard','unknown','standard','Configurar despiece real antes de activar.')
on conflict(service_key,brand,system_code,hardware_origin,hardware_tier) do nothing;


-- Prestación combinada opcional: se deja sin precio para que administración cargue la composición real disponible.
insert into public.glass_catalog(code,label,glass_type,color,feature,thickness_mm)
values ('LAMINADO-ACUSTICO-CS','Vidrio laminado acústico + control solar','laminated','claro','acoustic_control_solar',null)
on conflict(code) do nothing;
