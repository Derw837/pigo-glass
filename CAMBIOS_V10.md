# PIGO Studio V10

## Galería pública renovada
- Nueva portada visual para Galería con la misma línea gráfica del inicio.
- Filtros profundos por categoría mediante URL, por ejemplo `/galeria?categoria=Ventanas`.
- La franja superior de servicios del inicio ya abre la categoría correspondiente.
- Todas las tarjetas de Servicios del inicio abren su categoría de Galería.
- Cada categoría incluye descripción general, tipos de trabajos y recomendaciones orientativas.
- Se añadieron categorías: Ventanas, Mamparas, Cortinas de baño, Barandas, Cubiertas, Pérgolas, Divisiones, Puertas, Espejos y Proyectos especiales.
- Ventanas incluye corredizas, fijas, proyectables, seguridad, control solar y alternativas acústicas.
- Los proyectos reales siguen mostrando miniaturas compactas y lightbox al abrir.

## Inicio
- Se amplió la sección Servicios a diez áreas independientes y clicables.
- Nueva sección Nuestra empresa.
- Nueva llamada a Trabaja con nosotros.
- Proyectos realizados del inicio ahora usa los proyectos reales publicados en Supabase; se eliminaron los demos de esa sección.

## Nuestra empresa
- Nueva página `/nosotros`.
- Presentación profesional con más de 10 años de experiencia, metodología y valores de trabajo.

## Trabaja con nosotros
- Nueva página `/trabaja-con-nosotros`.
- Solo muestra vacantes abiertas.
- El candidato puede revisar la vacante y subir CV en PDF/DOC/DOCX.
- Los CV se almacenan en un bucket privado.
- Nueva área administrativa `Vacantes y CV` para crear/editar/cerrar vacantes y revisar postulaciones.

## Administración de fotografías
- Nueva sección `Administración → Contenido web`.
- Permite cambiar fotos de portada, servicios, empresa, instalación, galería y empleo sin editar código.
- Nueva sección de almacenamiento público `site-media`.
- `Administración → Galería` ahora permite editar proyecto, categoría, descripción, estado publicado y reemplazar la fotografía existente.

## Supabase
Ejecutar una sola vez:

`supabase/migrations/0005_site_content_and_careers.sql`

La migración crea:
- `site_media`
- `vacancies`
- `job_applications`
- bucket público `site-media`
- bucket privado `job-cvs`
- políticas RLS correspondientes
