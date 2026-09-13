# PIGO Studio V9

> V9 incorpora una portada fotográfica profesional y convierte el asesor en un chat flotante "Asesor en línea" disponible en todo el sitio público. No requiere SQL nuevo.

# PIGO Studio V8

La V8 mejora la presentación visual de la galería pública y administrativa. Las fotografías se muestran como miniaturas profesionales y se amplían en un visor al hacer clic. No requiere SQL nuevo.

# PIGO Studio V5

> V5 mejora el manejo de varios trabajos en una sola solicitud, separa correctamente cada trabajo, profesionaliza el estado de análisis y amplía las reglas de orientación de vidrio. No requiere una migración SQL nueva.

# PIGO Studio · Entrega base V1

Web profesional de captación y pre-cotización para proyectos de vidrio y aluminio.

## Qué incluye

- Web pública responsive con portada, servicios y galería.
- Asesor OpenAI restringido al dominio de vidrio/aluminio.
- Entrada de fotografías para analizar el espacio o una referencia.
- Bloqueo local de muchas consultas fuera de tema **antes de llamar a OpenAI**.
- OpenAI sin herramientas de web ni generación de imágenes: solo texto + visión de entrada.
- Estimador determinista: la IA **no inventa precios**.
- Tres resultados: automático / estimación+visita / evaluación técnica.
- Registro de clientes y solicitudes.
- Proyecto con varios trabajos: puedes agregar varias ventanas/elementos y sumar únicamente lo estimable.
- Fotografías del cliente guardadas en almacenamiento privado y visibles solo en administración.
- Notificaciones preparadas para email (Resend) y WhatsApp Cloud API, ambas opcionales.
- Panel administrador: solicitudes, materiales, tarifas, galería.
- Importación Excel/CSV de materiales.
- Límite horario por IP/navegador y presupuesto diario de tokens para controlar abuso.
- Catálogo inicial extraído de los dos PDF suministrados: **361 referencias CEDAL** y **848 referencias Andesía**.
- Precios iniciales en cero para no fabricar cotizaciones falsas.

## 1. Crear proyecto

```powershell
mkdir C:\PigoStudio
cd C:\PigoStudio
```

Descomprime este ZIP dentro de `C:\PigoStudio`.

## 2. Supabase

Crea un proyecto nuevo de Supabase. En `SQL Editor` ejecuta en orden:

1. `supabase/migrations/0001_pigo_studio.sql`
2. `supabase/migrations/0002_seed_catalogs.sql`

Después crea tu usuario desde **Authentication > Users** y ejecuta `supabase/SET_ADMIN.sql` cambiando `TU_CORREO_AQUI` por tu correo.

## 3. Variables

Copia `.env.example` como `.env.local` y completa:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6-luna
```

**Nunca pongas `SUPABASE_SERVICE_ROLE_KEY` ni `OPENAI_API_KEY` en código cliente.**

## 4. Ejecutar

```powershell
npm install
npm run dev
```

Abre `http://localhost:3000`.

Panel: `http://localhost:3000/login-admin`.

## 5. Activar precios

Ve a **Administración > Configuración**. Las tarifas vienen en cero y `Auto` desactivado. Esto es intencional.

Completa material, accesorios, mano de obra, instalación, mínimo, desperdicio, margen y rango de error. Activa `Auto` únicamente en servicios cuya fórmula ya hayas validado.

La siguiente entrega puede reemplazar el estimador simple por fórmulas reales de despiece CEDAL/Andesía, vidrio y accesorios.

## 6. Excel de precios/materiales

En **Administración > Materiales** puedes editar ítem por ítem o importar Excel/CSV. Hay plantilla en:

`public/templates/materiales_importacion.csv`

Columnas aceptadas: `marca, referencia, nombre, categoria, unidad, largo_barra_m, costo, precio_venta`.

## 7. Protección de tokens

Esta V1 usa cuatro capas:

1. Bienvenida local (cero tokens).
2. Prefiltro local: consultas claramente fuera de vidrio/aluminio se rechazan sin OpenAI.
3. La API no expone herramientas de generación de imágenes, web u otros usos.
4. Prompt de alcance estricto: imágenes personales/irrelevantes y temas ajenos se rechazan.
5. Límite por IP/navegador por hora (`AI_MAX_REQUESTS_PER_HOUR`).
6. Presupuesto global diario de tokens (`AI_DAILY_TOKEN_BUDGET`).

Una fotografía necesita visión para saber si es relevante; por eso una primera foto maliciosa podría consumir una llamada. El límite horario y el presupuesto diario evitan abuso repetido. Más adelante podemos sumar CAPTCHA para endurecer todavía más el control.

## 8. Galería

Los SVG incluidos son solo marcadores visuales para el diseño y lo dicen explícitamente. **No se presentan como trabajos reales.** En Administración > Galería carga tus fotografías reales; la página pública mostrará únicamente las publicadas.

## 9. Avisos WhatsApp/email (opcionales)

Sin credenciales, la solicitud igual se guarda y aparece en el panel.

Para email completa `RESEND_API_KEY`, `BUSINESS_NOTIFICATION_EMAIL`, `EMAIL_FROM`.

Para WhatsApp Cloud API completa `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `BUSINESS_WHATSAPP_TO`.

## 10. Nombre

`PIGO Studio` es **provisional** y está centralizado visualmente para reemplazarlo cuando definamos la marca final. Antes de registrar marca o dominio conviene hacer búsqueda formal de disponibilidad.

## Actualización V3

La V3 convierte el cotizador en una conversación comercial completa: el asesor entiende el trabajo, recomienda opciones de vidrio/aluminio, toma los datos del cliente dentro del chat y envía la solicitud a Supabase sin formulario público. El negocio atiende únicamente instalaciones en Ecuador y no vende materiales sueltos sin instalación.

Después de actualizar desde V2, ejecuta `supabase/migrations/0003_conversational_leads.sql` en Supabase SQL Editor.

## Actualización V4

V4 corrige el flujo de envío del asesor. La dirección exacta ya no bloquea una solicitud preliminar: bastan nombre, WhatsApp/teléfono y ciudad en Ecuador. El botón de envío aparece dentro del chat y la palabra `ENVIAR` se procesa localmente sin gastar otro turno de OpenAI.

OpenAI **nunca confirma un guardado**. La confirmación aparece únicamente cuando `/api/leads` logra insertar la solicitud en Supabase. En ese momento se abre un modal con lo que el cliente acaba de enviar; al cerrarlo se limpia el chat.

No hay migración V4. Debes tener ejecutada `0003_conversational_leads.sql`.

Después de copiar V4 sobre una versión anterior, detén el servidor y ejecuta:

```powershell
npm run clean
npm run build
npm run dev
```

Esto evita mezclar chunks viejos de `.next` con el nuevo componente del chat.

## Actualización V6
Los botones del chat son opcionales. El cliente puede administrar varios trabajos escribiendo de forma natural, por ejemplo `también quiero una ventana`, `mejor solo el primero`, `incluye de nuevo la pérgola` o `enviar`. Los trabajos descartados durante la sesión se conservan temporalmente para permitir que el cliente cambie de opinión antes de enviar la solicitud.

---

## V7 — Precios reales desde Supabase

Después de instalar V7 ejecuta una sola vez:

```sql
supabase/migrations/0004_pricing_engine.sql
```

Luego entra al administrador:

1. **Aluminio** → coloca costo/precio y largo de barra de las referencias que usarás.
2. **Precios → Vidrios** → coloca precio por m².
3. **Precios → Accesorios** → coloca ruedas, felpa, cierres, silicona, etc.
4. **Precios → Mano de obra** → coloca fabricación e instalación por m²/metro/unidad.
5. **Recetas** → revisa la receta, verifica que diga `Precios completos` y recién entonces activa `Permitir estimación automática`.

Si falta algún precio, el motor granular no inventa el valor y devuelve el caso al flujo normal de cotización/revisión.

---

## V10 · Galería, contenido web y empleo

Después de copiar V10 sobre la versión anterior, ejecuta en Supabase SQL Editor:

```sql
supabase/migrations/0005_site_content_and_careers.sql
```

Luego ejecuta:

```powershell
npm run clean
npm run build
npm run dev
```

Nuevas rutas públicas:
- `/galeria`
- `/nosotros`
- `/trabaja-con-nosotros`

Nuevas áreas administrativas:
- `/admin/contenido` para fotografías del sitio.
- `/admin/vacantes` para vacantes y hojas de vida.

La galería admite enlaces directos por categoría, por ejemplo:
- `/galeria?categoria=Ventanas`
- `/galeria?categoria=Pérgolas`
- `/galeria?categoria=Cortinas%20de%20baño`

---

## V11 · Asesor técnico-comercial y sistemas

V11 amplía el asesor para recopilar, solo cuando aplique, la información que realmente cambia una cotización: sistema/perfilería, origen, nivel, color, vidrio y herrajes. El cliente no necesita conocer las series; el asistente puede preguntar primero por presupuesto/prestaciones y recomendar una alternativa. Cuando una pregunta tiene opciones claras puede mostrar respuestas rápidas opcionales, sin impedir que el cliente escriba con sus propias palabras.

Después de copiar V11 ejecuta en Supabase SQL Editor:

```sql
supabase/migrations/0006_advisor_systems_and_recipes.sql
```

La migración agrega metadatos de sistema/origen/herraje a `quote_recipes` y crea recetas de referencia **desactivadas** para varias líneas CEDAL/Andesía. No actives una receta hasta configurar el despiece y los precios reales.

Si tu `.env.local` tiene un límite anterior, actualiza:

```env
AI_MAX_REQUESTS_PER_HOUR=80
```

En desarrollo local (`localhost`) las pruebas siguen sin límite horario. En producción permanece el límite por visitante y el presupuesto diario global.

Sistemas incorporados como referencia comercial: CEDAL 4/6/7 perfiles, T45, S4200, S3000, fija estándar/proyectable y mamparas S-100/S-200/S-300; Andesía 4/7 perfiles, proyectable, fija estándar, puerta corrediza económica/estándar y mamparas Serie 100/200.
