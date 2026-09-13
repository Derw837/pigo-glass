# PIGO Studio V12 — conversación más robusta y compacta

## Cambios principales

- Se eliminaron las respuestas sugeridas/quick replies del asesor. El cliente conversa escribiendo normalmente.
- La tarjeta final del chat se simplificó a un mensaje corto y en el chat flotante las acciones se apilan correctamente para evitar desbordes.
- El asesor ahora pide **ciudad y sector/barrio** antes de permitir el envío; la dirección exacta sigue siendo opcional.
- El sector se guarda correctamente en la columna `sector` de `leads` y se muestra separado de la dirección en Administración.
- Se añadió un flujo específico para **problemas de ruido / diagnóstico acústico**: cuando el cliente no sabe por dónde entra el ruido, el asesor no lo obliga a escoger sistema o vidrio antes de una revisión.
- Si el cliente describe muchas ventanas/puertas en un único mensaje, se tratan como un proyecto acústico conjunto y se conservan en el resumen interno, sin intentar forzar todas las medidas en un solo par ancho/alto.
- Se aumentó el margen de salida estructurada de OpenAI y se añadió un reintento automático único si una respuesta larga queda incompleta o no se puede interpretar como JSON.
- Las respuestas del asesor se mantienen más cortas y evita resumir todo el proyecto en cada turno.

## Base de datos

No requiere una migración nueva. La tabla `leads` ya disponía del campo `sector`; V12 empieza a utilizarlo correctamente.

## Instalación

1. Copia el contenido del ZIP encima de `D:\PigoStudio`.
2. Ejecuta:

```powershell
cd D:\PigoStudio
npm run clean
npm run build
```

3. Si compila correctamente:

```powershell
npm run dev
```
