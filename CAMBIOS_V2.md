# PIGO Studio V2

Esta versión se puede copiar encima de V1.

## Mejoras principales
- Conversación contextual: respuestas cortas como “sí, ¿cuánto costaría?” ya continúan el proyecto anterior.
- Alcance actualizado: solo vidrio, perfilería de aluminio e instalación; no construcción civil ni estructura metálica completa.
- Recomendación orientativa de tipo de vidrio con motivo y alternativas.
- Resumen autónomo del cliente para administración, WhatsApp y correo.
- Panel de análisis más claro para el cliente.
- Arrastrar y soltar fotografías en el cotizador.
- Inicio rediseñado con una apariencia más arquitectónica/editorial.
- Mantiene bloqueo de solicitudes ajenas al negocio antes de gastar tokens cuando se detectan.

## Importante
No requiere una nueva migración SQL para estas mejoras. Los nuevos datos estructurados se guardan dentro del JSON `assessment` que ya existe.
