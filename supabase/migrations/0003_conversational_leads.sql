-- V3: datos de instalación recogidos por el asesor dentro del chat.
alter table public.leads add column if not exists province text;
alter table public.leads add column if not exists address text;

-- Nuevos tipos cotizables para separar mejor las tarifas.
insert into public.service_rates(service_key,label,unit,auto_quote) values
 ('window_fixed','Ventana fija','m2',false),
 ('window_projectable','Ventana proyectable','m2',false),
 ('pergola_glass','Vidrio / perfilería para pérgola con estructura apta','m2',false),
 ('bath_curtain','Cortina de baño','m2',false),
 ('partition','División de vidrio','m2',false),
 ('facade','Fachada de vidrio / aluminio','m2',false)
on conflict(service_key) do nothing;
