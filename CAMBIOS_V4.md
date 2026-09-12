# PIGO Studio V4 — chat, envío real y confirmación

## Qué corrige esta versión

1. **La dirección exacta deja de ser obligatoria.** Para enviar una solicitud preliminar bastan nombre, teléfono/WhatsApp y ciudad en Ecuador. La dirección puede compartirse después por WhatsApp.
2. **ENVIAR ya no pasa por OpenAI.** Si el cliente escribe `ENVIAR`, `MANDAR`, `CONFIRMO`, etc. y ya están los datos mínimos, el navegador llama directamente a `/api/leads`. OpenAI no puede fingir que guardó una solicitud.
3. **Botón real dentro del chat.** Cuando están los datos mínimos aparece `Enviar solicitud` dentro del flujo del chat, no debajo como formulario/resumen permanente.
4. **Modal de confirmación.** Solo aparece después de que Supabase confirma el guardado. Muestra código, contacto, ciudad, dirección si fue dada y resumen de los trabajos enviados.
5. **Al cerrar el modal se limpia el chat** para una nueva solicitud.
6. **Se eliminó el texto automático repetitivo** de “no tengo tarifa automática” y el recordatorio duplicado de `ENVIAR` que el servidor agregaba en cada turno.
7. **Conversación más natural.** El prompt ahora evita repetir “Perfecto”, evita insistir con la visita y acepta una elección del cliente sin discutirla.
8. **Ventanas comunes no se marcan automáticamente como visita obligatoria.** Una cotización preliminar puede prepararse con las medidas dadas por el cliente. Las visitas obligatorias quedan para trabajos realmente técnicos o de seguridad.
9. **El negocio sigue siendo instalación.** No se vende material suelto. Podemos suministrar material si también instalamos, o instalar material que el cliente compre/tenga.
10. **Cortinas de baño continúan incluidas** como categoría y flujo.
11. **Error de guardado más claro durante desarrollo.** Si `/api/leads` falla, en modo desarrollo devuelve el detalle básico del error para poder corregirlo.
12. **Limpieza de Next.js.** Se agregó `npm run clean` y se quitó una configuración experimental de Server Actions que no se usaba.

## No hay migración SQL nueva

V4 no necesita una tabla nueva. Debes tener ejecutadas las migraciones anteriores hasta:

`supabase/migrations/0003_conversational_leads.sql`

La columna `address` ya era opcional en la base; lo que bloqueaba el flujo estaba en el frontend y en `/api/leads`.

## Cómo actualizar sin mezclar caché viejo

1. Detén `npm run dev` con `Ctrl + C`.
2. Copia el contenido de V4 encima de `D:\PigoStudio`.
3. Ejecuta:

```powershell
cd D:\PigoStudio
npm run clean
npm run build
npm run dev
```

4. En Chrome usa `Ctrl + Shift + R` una vez.

El `npm run clean` elimina `.next`, que puede conservar chunks de una versión anterior si se copian archivos mientras el servidor de desarrollo sigue abierto.

## Prueba recomendada

```
Cliente: quiero una ventana corrediza de 2mts por 1.80 de alto
Cliente: en CEDAL negro y vidrio normal de 6mm
Cliente: incluye todo por favor
Cliente: por ahora solo quiero la cotización
Cliente: David Contreras 0997424830
Cliente: Quito
```

En ese momento debe aparecer dentro del chat el botón **Enviar solicitud**, aunque no exista dirección exacta.

También puedes escribir:

`ENVIAR`

Si Supabase guarda correctamente, aparecerá el modal de confirmación. Solo ese modal confirma el envío. Al cerrarlo, el chat vuelve al estado inicial.

## WhatsApp y correo

Guardar en Supabase y enviar avisos externos son dos cosas distintas. La solicitud debe aparecer en **Administración > Solicitudes** incluso si WhatsApp/Email todavía no están configurados.

Para recibir aviso real por WhatsApp se necesitan las variables de WhatsApp Cloud API. Para correo se necesitan las variables de Resend indicadas en `.env.example`/README.
