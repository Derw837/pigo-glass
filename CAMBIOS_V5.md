# Cambios V5 — Conversación múltiple y criterio de vidrio

## 1. Varios trabajos sin mezclar datos

- Al pulsar **+ Agregar otro trabajo**, los botones de envío desaparecen mientras se define el nuevo trabajo.
- El nuevo trabajo usa un contexto separado: OpenAI recibe solamente el tramo de conversación correspondiente al trabajo actual.
- Los trabajos anteriores se mantienen guardados en `projectItems`, pero sus medidas, vidrio y aluminio no se copian al trabajo nuevo.
- El segundo trabajo (y los siguientes) se guarda como ficha independiente en Administración.
- El resumen superior de la solicitud combina los trabajos, mientras que cada tarjeta **Trabajo 1, Trabajo 2...** muestra únicamente sus propios datos.

## 2. Cambiar de idea al agregar otro trabajo

El cliente puede escribir frases naturales como:

- “mejor solo el trabajo anterior”
- “solo hago el primero”
- “quita el segundo”
- “ya no quiero agregar otro”
- “me equivoqué, deja solo el anterior”

El sistema descarta únicamente el trabajo actual/no confirmado y vuelve a mostrar los botones para enviar los trabajos que ya estaban listos.

## 3. Estado de análisis más profesional

Se reemplazó **“Revisando lo que me dices...”** por **“Analizando la información...”**.

## 4. Conversación más profesional

- Tono natural y comercial, sin sonar burocrático ni excesivamente informal.
- Menos repeticiones de “Perfecto”.
- Una o dos preguntas útiles por turno.
- No repite advertencias de seguridad en cada respuesta.
- No vuelve a pedir nombre/teléfono/ciudad si ya están confirmados.

## 5. Reglas iniciales de vidrio

Se fortaleció la orientación para:

- ventanas fijas, corredizas y proyectables;
- puertas y divisiones;
- mamparas y cortinas de baño;
- cubiertas y pérgolas;
- barandas/pasamanos;
- vidrio acústico;
- control solar;
- fachadas y proyectos especiales.

### Reglas comerciales iniciales

- Control solar de la empresa: se maneja inicialmente como **laminado desde 8 mm**.
- Acústico: **laminado acústico/interlámina acústica**, sin prometer silencio total.
- Ducha: se prioriza vidrio de seguridad; la opción elegante se presenta como **templado sin marco**, con alternativas de privacidad compatibles con vidrio de seguridad.
- Cubiertas/pérgolas: se prioriza **laminado de seguridad**. Un espesor final nunca se confirma solo desde el chat.
- Barandas: se consideran elemento de protección contra caídas y requieren revisión del sistema completo.

## 6. Menos ruido en la ficha administrativa

La lista `detectedNeeds` ahora elimina varias duplicaciones obvias y queda limitada a una lista corta y útil.

## 7. Pruebas locales sin límite de mensajes

El bypass de desarrollo para `localhost` ya viene dentro de V5. En producción sigue funcionando el límite por visitante.

## SQL

**V5 no requiere ejecutar una migración SQL nueva.** Mantén las migraciones V1–V3 ya aplicadas.

## Prueba recomendada

1. Cotiza una cubierta y completa contacto.
2. Pulsa **+ Agregar otro trabajo**.
3. Confirma que los botones desaparecen.
4. Agrega una ventana fija distinta.
5. Envía la solicitud.
6. En Administración verifica que `Trabajo 1` sea solamente la cubierta y `Trabajo 2` solamente la ventana.
7. Repite y, al empezar el segundo trabajo, escribe “mejor solo el anterior”; los botones deben volver a aparecer.
