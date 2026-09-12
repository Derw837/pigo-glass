# PIGO Studio V6 — conversación libre aunque haya botones

## Problema corregido
En V5 los botones `Agregar otro trabajo` y `Enviar solicitud` eran atajos visuales, pero algunos cambios escritos por el cliente podían caer en OpenAI cuando el sistema ya estaba en estado de confirmación. Una frase como “mejor pon las 2 para cotizar todo” podía perder el contexto de un trabajo que el cliente había quitado y producir una respuesta incorrecta o un error temporal.

## Cambios principales
- Los botones ya no son pasos obligatorios. El cliente puede seguir escribiendo normalmente en cualquier momento.
- Si un trabajo está listo y el cliente escribe directamente “también quiero una ventana...”, el primer trabajo se confirma internamente y comienza automáticamente el segundo, igual que si hubiera pulsado `+ Agregar otro trabajo`.
- Cuando el cliente quita un trabajo adicional, se conserva temporalmente en memoria de la sesión.
- Frases como `mejor pon las 2`, `incluye la pérgola otra vez`, `agrega de nuevo lo que quité` o `cotiza ambos` restauran el trabajo descartado sin llamar a OpenAI.
- `solo el trabajo 1`, `deja solo el primero` y expresiones equivalentes dejan únicamente el primer trabajo.
- `mejor la pérgola no`, `quita el segundo`, `ya no quiero ese trabajo` y equivalentes descartan solo el trabajo adicional, manteniendo los anteriores.
- Después de descartar un trabajo se reinicia el contexto del trabajo activo para que OpenAI no vuelva a mezclarlo en mensajes posteriores.
- Si OpenAI falla temporalmente, el sistema aclara que la solicitud sigue intacta y no borra ningún trabajo.
- La tarjeta de acciones explica que los botones son opcionales y muestra ejemplos de frases naturales.

## No requiere SQL nuevo
V6 solo modifica comportamiento de la conversación y estado del navegador.
