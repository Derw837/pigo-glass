# PIGO Studio V11.1 — Hotfix TypeScript

Corrige tres errores de tipado detectados por `npm run build` en `src/components/QuoteAssistant.tsx`:

1. `assessment.quickReplies.length` podía ser `undefined`.
2. `assessment` podía ser `null` al renderizar respuestas sugeridas.
3. `onClick={send}` pasaba el evento de React a una función que espera un `string` opcional.

Cambios aplicados:
- Se usa `(assessment?.quickReplies?.length ?? 0) > 0`.
- Se renderiza con `(assessment?.quickReplies ?? []).slice(...)`.
- El botón Enviar usa `onClick={() => send()}`.

No requiere SQL nuevo.
