# Motor de precios — estado después de V11

El motor granular ya puede seleccionar una receta no solo por servicio y marca, sino también por **sistema, origen/nivel de perfilería y herraje**.

Flujo objetivo:

`medidas -> configuración del trabajo -> sistema -> perfiles -> vidrio -> herrajes/accesorios -> mano de obra -> desperdicio -> margen -> rango estimado`

## Ya disponible

- Ventana corrediza CEDAL 7 perfiles (receta base de V7, desactivada hasta validar precios/multiplicadores).
- Ventana corrediza Andesía 7 perfiles (receta base de V7, desactivada).
- Ventana fija CEDAL/Andesía (recetas base desactivadas).
- Metadatos y recetas de referencia para CEDAL 4/6 perfiles, T45, S4200, S3000, proyectable y mamparas.
- Metadatos y recetas de referencia para Andesía 4 perfiles, proyectable, puertas y mamparas.
- Vidrios, accesorios y mano de obra configurables.

## Regla de seguridad del precio

Una receta nueva no trae un despiece inventado. Si no tiene perfiles, accesorios o precios suficientes, el motor devuelve `null` y el chat pasa la solicitud al equipo humano sin inventar valor.

## Siguiente trabajo recomendado

Validar con fabricación, uno por uno:

1. CEDAL 7 perfiles — configuraciones que realmente usan y descuentos de corte.
2. CEDAL 4 y 6 perfiles.
3. Andesía 4 y 7 perfiles.
4. T45 y S4200.
5. Proyectables.
6. Mamparas/cortinas de baño.
7. Divisiones y barandas.
8. Cubiertas/pérgolas.

Después conviene modelar la **configuración de hojas** (por ejemplo 1 fijo + 1 móvil, 2 móviles, 3 hojas, etc.) como parte de las recetas para que el precio granular sea todavía más preciso.
