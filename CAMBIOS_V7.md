# PIGO Studio V7 — Motor de precios real (fase 1)

Esta versión deja el asesor de V6 estable y comienza el motor de precios conectado a Supabase.

## Nuevo

- Catálogo de vidrios con costo y precio de venta por m².
- Catálogo de accesorios con costo/precio por unidad, metro, m² o kit.
- Tarifas de fabricación e instalación por servicio.
- Recetas de cálculo por sistema/marca.
- Primeras recetas base: ventana corrediza CEDAL, ventana corrediza Andesía, ventana fija CEDAL y ventana fija Andesía.
- Las recetas nacen DESACTIVADAS para evitar publicar precios incorrectos.
- El sistema no calcula si falta precio de un perfil, largo de barra, vidrio, accesorio o mano de obra.
- Si la receta está completa y activada, el asesor consulta Supabase y devuelve un rango estimado.
- Si el cliente aporta los materiales, puede calcular solamente mano de obra/instalación.
- Si no existe receta granular, sigue disponible el estimador general de `service_rates` como respaldo.
- El administrador puede ver el desglose interno del cálculo; el cliente solo ve el rango final.

## Panel administrativo

- **Aluminio**: catálogo CEDAL/Andesía ya existente.
- **Precios**: vidrios, accesorios y mano de obra.
- **Recetas**: consumo de perfiles/accesorios, desperdicio, margen y rango de error.
- **Tarifas simples**: se conserva como respaldo para productos que todavía no tengan receta granular.

## SQL obligatorio

Ejecutar en Supabase SQL Editor:

`supabase/migrations/0004_pricing_engine.sql`

No ejecutes nuevamente las migraciones anteriores si ya están aplicadas.

## Importante

Las fórmulas iniciales de perfiles son aproximaciones para pre-cotización y están desactivadas. Antes de activarlas, revisa los multiplicadores según la forma real de fabricar de la empresa.
