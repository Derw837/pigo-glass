# PIGO Studio V8 — Galería profesional

## Cambios principales

- La galería pública dejó de mostrar fotografías gigantes o tarjetas irregulares.
- Todas las fotografías se muestran como miniaturas uniformes 4:3, cuatro por fila en pantallas grandes.
- Al hacer clic se abre una vista ampliada tipo lightbox, conservando la fotografía completa.
- El visor permite cerrar con `Esc`, navegar con flechas del teclado y pasar a la imagen anterior/siguiente.
- Los filtros por categoría ahora son compactos, incluyen contador y funcionan mejor en móvil.
- La portada de la galería en Home también usa tarjetas compactas y ampliables.
- El administrador de galería se rediseñó para ocupar mucho menos espacio: cada proyecto aparece en una ficha horizontal compacta con miniatura.
- En administración se puede arrastrar una fotografía al área de carga o hacer clic para seleccionarla.
- Antes de publicar se muestra una vista previa de la fotografía.
- No hay cambios de base de datos ni migraciones SQL nuevas.

## Instalación

Copia V8 encima de V7, detén `npm run dev` si está abierto y ejecuta:

```powershell
npm run clean
npm run build
npm run dev
```
