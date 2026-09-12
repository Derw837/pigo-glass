# PIGO Studio V9 — Portada visual y asesor en línea

## Portada
- Nueva portada fotográfica usando las imágenes aprobadas para hogar, oficina e instalación.
- Hero de pantalla amplia con CTA directo al asesor.
- Nueva sección visual de soluciones.
- Sección comercial para oficinas y negocios.
- Sección de instalación profesional con fotografía del técnico.
- Se mantiene la galería real de trabajos como evidencia separada de las imágenes publicitarias.
- Eliminada por completo la sección "Háblale como se lo explicarías a una persona".

## Asesor en línea
- El asesor deja de ser el flujo principal de una página separada.
- Se incorpora como chat flotante moderno en la esquina inferior derecha.
- El botón muestra "Asesor en línea" y estado disponible.
- En escritorio abre un panel compacto; en móvil ocupa la pantalla para facilitar escritura y fotos.
- Conserva conversación, fotografías, múltiples trabajos, envío a Supabase y modal final de confirmación.
- Los botones "Cotizar proyecto", "Cotizar con el asesor" y CTAs de servicios abren el mismo chat.
- La ruta antigua `/cotizar` redirige a la portada y abre el asesor mediante `#asesor`.
- El chat no aparece dentro de administración ni en el login administrativo.

## Imágenes optimizadas
Las imágenes de portada fueron convertidas a WEBP para reducir carga:
- `public/home/hero-quito.webp`
- `public/home/office-divisions.webp`
- `public/home/professional-installation.webp`

No hay cambios de base de datos ni nuevas migraciones SQL en V9.
