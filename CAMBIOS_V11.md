# PIGO Studio V11 — asesor técnico-comercial y sistemas

## Asesor más completo sin convertir el chat en formulario

- El asesor ahora intenta dejar cada trabajo **listo para cotizar**, no solo “entender la idea”.
- Hace **1 o 2 preguntas por turno**, conserva lo ya respondido y evita listas largas de tecnicismos.
- Cuando una pregunta tiene pocas opciones claras, muestra **respuestas rápidas opcionales** (por ejemplo Económico / Estándar / Europeo). El cliente puede ignorarlas y escribir normalmente.
- Si el cliente no conoce series, primero pregunta por prioridad: **económica / estándar / mayor prestación o sistema europeo** y luego recomienda una familia.
- Distingue correctamente **origen del aluminio** de **concepto europeo del sistema**.
- Puede registrar:
  - marca de aluminio;
  - nacional / importado / mixto cuando se conozca;
  - sistema o serie comercial;
  - nivel económico / estándar / premium / europeo;
  - color;
  - herraje chino / europeo / nacional / mixto cuando aplique;
  - nivel de herraje;
  - tipo, color, prestación y espesor del vidrio.
- El administrador y el modal final muestran esas decisiones de forma separada.

## Conocimiento técnico-comercial incorporado

La guía del asesor se amplió usando los catálogos compartidos CEDAL y Andesía y documentación pública de CEDAL. Incluye flujos específicos para:

- ventanas corredizas;
- ventanas fijas/cuerpos fijos;
- proyectables/batientes;
- puertas corredizas y batientes;
- mamparas/divisiones;
- cortinas/cabinas de baño;
- barandas/pasamanos;
- cubiertas, techos y pérgolas;
- divisiones acústicas;
- fachadas/cerramientos;
- espejos;
- reposición/reparación;
- vidrio curvo, fuentes y proyectos especiales.

Sistemas de referencia incorporados en la conversación:

- CEDAL corrediza 4 perfiles, 6 perfiles, 7 perfiles y T45 europeo.
- CEDAL puerta T45 y S4200 Euroconfort.
- CEDAL Ventana Fija Estándar, fija super-económica y S3000 cuerpo fijo.
- CEDAL Proyectable Estándar y S3000.
- CEDAL mamparas S-100, S-200 y S-300.
- Andesía corrediza 4 perfiles y 7 perfiles.
- Andesía proyectable y fija estándar.
- Andesía puerta corrediza económica/estándar.
- Andesía mamparas Serie 100/200.
- Andesía cabinas de baño 5250 y de lujo como referencias de sistema.

**Importante:** las series S-100/S-200/S-300 del material CEDAL se mantienen como mamparas/cuerpos fijos; no se confunden automáticamente con la referencia denominada “Ventana Fija Estándar”.

## Vidrios

- El asesor distingue normal, templado, laminado y templado-laminado.
- Mantiene las reglas comerciales ya definidas para seguridad, control solar, duchas, barandas y cubiertas.
- Se añadió la prestación combinada **acústico + control solar** para no perder una solicitud que pida ambas cosas.
- La migración agrega una presentación de catálogo sin precio para que administración configure la composición real disponible.

## Motor granular

Las recetas ahora también pueden guardar:

- código y nombre del sistema;
- origen del aluminio;
- nivel del sistema;
- origen del herraje;
- nivel del herraje.

El motor puntúa las recetas según lo que pidió el cliente. Si pide expresamente T45, 6 perfiles, 7 perfiles, sistema europeo o un nivel de herraje, evita usar silenciosamente una receta incompatible.

Los sistemas nuevos se crean **desactivados y sin despiece inventado**. Solo deben activarse después de cargar los perfiles/accesorios reales y sus precios.

## Límite de conversación

- `localhost` sigue ilimitado para pruebas.
- El valor predeterminado en producción sube de 40 a **80 llamadas de IA por hora por visitante aproximado**.
- El historial textual enviado por turno aumenta de 14 a 18 mensajes, mientras el assessment estructurado conserva el resto de los datos importantes.
- El presupuesto diario global continúa como protección contra abuso.

Si tu `.env.local` todavía contiene un valor anterior, cámbialo manualmente a:

```env
AI_MAX_REQUESTS_PER_HOUR=80
```

## Supabase

Ejecutar una sola vez:

```sql
supabase/migrations/0006_advisor_systems_and_recipes.sql
```

Esta migración no activa precios nuevos por sí sola.
