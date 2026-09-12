-- PIGO Studio V7 — motor de precios granular
-- Esta migración NO activa cotizaciones automáticas por sí sola.
-- Las recetas nacen desactivadas hasta que el administrador cargue precios y las revise.

create table if not exists public.glass_catalog(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text not null,
  glass_type text not null default 'normal',
  color text not null default 'claro',
  feature text not null default 'standard',
  thickness_mm numeric,
  cost_price_m2 numeric not null default 0,
  sale_price_m2 numeric not null default 0,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accessory_catalog(
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  label text not null,
  category text not null default 'General',
  unit text not null default 'unit' check(unit in ('unit','m','m2','set')),
  cost_price numeric not null default 0,
  sale_price numeric not null default 0,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.labor_rates(
  id uuid primary key default gen_random_uuid(),
  service_key text unique not null,
  label text not null,
  unit text not null default 'm2' check(unit in ('m2','ml','unit')),
  fabrication_rate numeric not null default 0,
  installation_rate numeric not null default 0,
  minimum_charge numeric not null default 0,
  active boolean not null default true,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_recipes(
  id uuid primary key default gen_random_uuid(),
  service_key text not null,
  brand text not null default 'ANY',
  label text not null,
  enabled boolean not null default false,
  price_mode text not null default 'cost_plus_margin' check(price_mode in ('cost_plus_margin','sale_prices')),
  glass_area_factor numeric not null default 0.90,
  waste_percent numeric not null default 8,
  margin_percent numeric not null default 20,
  error_percent numeric not null default 15,
  minimum_charge numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(service_key,brand)
);

create table if not exists public.quote_recipe_profiles(
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.quote_recipes(id) on delete cascade,
  catalog_reference text not null,
  role text not null,
  formula text not null check(formula in ('width','height','perimeter','area','unit')),
  multiplier numeric not null default 1,
  waste_percent numeric not null default 0,
  sort_order int not null default 0,
  unique(recipe_id,catalog_reference,role)
);

create table if not exists public.quote_recipe_accessories(
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.quote_recipes(id) on delete cascade,
  accessory_code text not null,
  formula text not null check(formula in ('width','height','perimeter','area','unit')),
  multiplier numeric not null default 1,
  sort_order int not null default 0,
  unique(recipe_id,accessory_code)
);

alter table public.glass_catalog enable row level security;
alter table public.accessory_catalog enable row level security;
alter table public.labor_rates enable row level security;
alter table public.quote_recipes enable row level security;
alter table public.quote_recipe_profiles enable row level security;
alter table public.quote_recipe_accessories enable row level security;

create policy "glass admin read" on public.glass_catalog for select using(public.is_admin());
create policy "glass admin all" on public.glass_catalog for all using(public.is_admin()) with check(public.is_admin());
create policy "accessory admin read" on public.accessory_catalog for select using(public.is_admin());
create policy "accessory admin all" on public.accessory_catalog for all using(public.is_admin()) with check(public.is_admin());
create policy "labor admin read" on public.labor_rates for select using(public.is_admin());
create policy "labor admin all" on public.labor_rates for all using(public.is_admin()) with check(public.is_admin());
create policy "recipes admin read" on public.quote_recipes for select using(public.is_admin());
create policy "recipes admin all" on public.quote_recipes for all using(public.is_admin()) with check(public.is_admin());
create policy "recipe profiles admin read" on public.quote_recipe_profiles for select using(public.is_admin());
create policy "recipe profiles admin all" on public.quote_recipe_profiles for all using(public.is_admin()) with check(public.is_admin());
create policy "recipe accessories admin read" on public.quote_recipe_accessories for select using(public.is_admin());
create policy "recipe accessories admin all" on public.quote_recipe_accessories for all using(public.is_admin()) with check(public.is_admin());

-- Catálogo inicial de vidrio: precios en cero a propósito.
-- El administrador puede editar, eliminar o agregar las presentaciones reales de sus proveedores.
insert into public.glass_catalog(code,label,glass_type,color,feature,thickness_mm) values
 ('NORMAL-CLARO-4','Vidrio normal claro 4 mm','normal','claro','standard',4),
 ('NORMAL-CLARO-6','Vidrio normal claro 6 mm','normal','claro','standard',6),
 ('NORMAL-CLARO-8','Vidrio normal claro 8 mm','normal','claro','standard',8),
 ('TEMPLADO-CLARO-6','Vidrio templado claro 6 mm','tempered','claro','standard',6),
 ('TEMPLADO-CLARO-8','Vidrio templado claro 8 mm','tempered','claro','standard',8),
 ('TEMPLADO-CLARO-10','Vidrio templado claro 10 mm','tempered','claro','standard',10),
 ('LAMINADO-CLARO-6','Vidrio laminado claro 6 mm','laminated','claro','standard',6),
 ('LAMINADO-CLARO-8','Vidrio laminado claro 8 mm','laminated','claro','standard',8),
 ('LAMINADO-CLARO-10','Vidrio laminado claro 10 mm','laminated','claro','standard',10),
 ('LAMINADO-CS-8','Vidrio laminado control solar 8 mm','laminated','control solar','control_solar',8),
 ('LAMINADO-CS-10','Vidrio laminado control solar 10 mm','laminated','control solar','control_solar',10),
 ('LAMINADO-ACUSTICO','Vidrio laminado acústico','laminated','claro','acoustic',null),
 ('TEMPLADO-ACIDO','Vidrio templado translúcido / al ácido','tempered','translúcido','acid_etched',null),
 ('DECORATIVO-CATEDRAL','Vidrio decorativo tipo catedral','other','catedral','decorative',null)
on conflict(code) do nothing;

insert into public.accessory_catalog(code,label,category,unit) values
 ('SILICONE','Silicona / sellador','Sellado','unit'),
 ('FIXINGS','Tornillería y fijaciones','Fijación','set'),
 ('FELT','Felpa para corrediza','Ventanas','m'),
 ('WHEELS','Ruedas para corrediza','Ventanas','unit'),
 ('LOCK','Cierre / seguro de ventana','Ventanas','unit'),
 ('GASKET','Empaque / caucho / junquillo auxiliar','Ventanas','m'),
 ('GLASS_BUTTON','Botón / herraje puntual para vidrio','Barandas','unit'),
 ('SHOWER_HARDWARE','Kit herrajes para mampara de baño','Baño','set'),
 ('COVER_SEALING','Sellado para cubierta / pérgola','Cubiertas','m')
on conflict(code) do nothing;

insert into public.labor_rates(service_key,label,unit) values
 ('window_sliding','Ventana corrediza','m2'),
 ('window_fixed','Ventana fija','m2'),
 ('window_projectable','Ventana proyectable','m2'),
 ('door','Puerta','m2'),
 ('railing','Baranda / pasamanos','ml'),
 ('cover_existing','Cubierta sobre estructura existente','m2'),
 ('pergola_glass','Vidrio para pérgola existente','m2'),
 ('shower','Mampara','m2'),
 ('bath_curtain','Cortina de baño','m2'),
 ('mirror','Espejo','m2'),
 ('partition','División de vidrio','m2'),
 ('facade','Fachada de vidrio','m2'),
 ('special','Proyecto especial','unit')
on conflict(service_key) do nothing;

-- Recetas iniciales de referencia. NACEN DESACTIVADAS.
insert into public.quote_recipes(service_key,brand,label,enabled,glass_area_factor,notes) values
 ('window_sliding','CEDAL','Ventana corrediza CEDAL · 1 fijo + 1 móvil',false,0.88,'Receta aproximada de consumo lineal. Revisar antes de activar.'),
 ('window_sliding','ANDESIA','Ventana corrediza Andesía · 1 fijo + 1 móvil',false,0.88,'Receta aproximada de consumo lineal. Revisar antes de activar.'),
 ('window_fixed','CEDAL','Ventana fija CEDAL',false,0.90,'Receta aproximada de consumo lineal. Revisar antes de activar.'),
 ('window_fixed','ANDESIA','Ventana fija Andesía',false,0.90,'Receta aproximada de consumo lineal. Revisar antes de activar.')
on conflict(service_key,brand) do nothing;

-- CEDAL corrediza 7 perfiles: referencias del catálogo compartido.
insert into public.quote_recipe_profiles(recipe_id,catalog_reference,role,formula,multiplier,sort_order)
select r.id,x.ref,x.role,x.formula,x.mult,x.ord
from public.quote_recipes r
cross join (values
 ('2237','Riel superior','width',1::numeric,10),
 ('2238','Riel inferior','width',1::numeric,20),
 ('2234','Jamba marco','height',2::numeric,30),
 ('2233','Horizontal estándar','width',2::numeric,40),
 ('2231','Vertical','height',2::numeric,50),
 ('2232','Entrecierre fijo','height',1::numeric,60),
 ('2235','Entrecierre móvil','height',1::numeric,70)
) as x(ref,role,formula,mult,ord)
where r.service_key='window_sliding' and r.brand='CEDAL'
on conflict(recipe_id,catalog_reference,role) do nothing;

-- Andesía corrediza.
insert into public.quote_recipe_profiles(recipe_id,catalog_reference,role,formula,multiplier,sort_order)
select r.id,x.ref,x.role,x.formula,x.mult,x.ord
from public.quote_recipes r
cross join (values
 ('EMF18B','Riel superior','width',1::numeric,10),
 ('EMF19B','Riel inferior','width',1::numeric,20),
 ('EMF20B','Jamba','height',2::numeric,30),
 ('EMF21B','Horizontal de hoja','width',2::numeric,40),
 ('EMF22B','Vertical de hoja','height',2::numeric,50),
 ('EMF23B','Entrecierre fijo','height',1::numeric,60),
 ('EMF24B','Entrecierre móvil','height',1::numeric,70)
) as x(ref,role,formula,mult,ord)
where r.service_key='window_sliding' and r.brand='ANDESIA'
on conflict(recipe_id,catalog_reference,role) do nothing;

-- Ventana fija CEDAL.
insert into public.quote_recipe_profiles(recipe_id,catalog_reference,role,formula,multiplier,sort_order)
select r.id,x.ref,x.role,x.formula,x.mult,x.ord
from public.quote_recipes r
cross join (values
 ('2229','Horizontal fijo','width',2::numeric,10),
 ('2230','Vertical fijo','height',2::numeric,20),
 ('2236','Junquillo','perimeter',1::numeric,30)
) as x(ref,role,formula,mult,ord)
where r.service_key='window_fixed' and r.brand='CEDAL'
on conflict(recipe_id,catalog_reference,role) do nothing;

-- Ventana fija Andesía.
insert into public.quote_recipe_profiles(recipe_id,catalog_reference,role,formula,multiplier,sort_order)
select r.id,x.ref,x.role,x.formula,x.mult,x.ord
from public.quote_recipes r
cross join (values
 ('EMF29','Horizontal fijo','width',2::numeric,10),
 ('EMF28','Vertical fijo','height',2::numeric,20),
 ('EMF30','Junquillo','perimeter',1::numeric,30)
) as x(ref,role,formula,mult,ord)
where r.service_key='window_fixed' and r.brand='ANDESIA'
on conflict(recipe_id,catalog_reference,role) do nothing;

-- Accesorios de estimación para corredizas/fijas.
insert into public.quote_recipe_accessories(recipe_id,accessory_code,formula,multiplier,sort_order)
select r.id,x.code,x.formula,x.mult,x.ord
from public.quote_recipes r
cross join (values
 ('FELT','perimeter',1::numeric,10),
 ('WHEELS','unit',2::numeric,20),
 ('LOCK','unit',1::numeric,30),
 ('SILICONE','unit',1::numeric,40),
 ('FIXINGS','unit',1::numeric,50)
) as x(code,formula,mult,ord)
where r.service_key='window_sliding'
on conflict(recipe_id,accessory_code) do nothing;

insert into public.quote_recipe_accessories(recipe_id,accessory_code,formula,multiplier,sort_order)
select r.id,x.code,x.formula,x.mult,x.ord
from public.quote_recipes r
cross join (values
 ('GASKET','perimeter',1::numeric,10),
 ('SILICONE','unit',1::numeric,20),
 ('FIXINGS','unit',1::numeric,30)
) as x(code,formula,mult,ord)
where r.service_key='window_fixed'
on conflict(recipe_id,accessory_code) do nothing;
