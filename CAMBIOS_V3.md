# PIGO Studio V3 — Asesor conversacional

Esta versión se pega encima de la V2.

## Cambios principales

1. El negocio queda limitado a vidrio, perfilería de aluminio e instalación en Ecuador.
2. Ya no existe venta de materiales sueltos sin instalación.
3. Modalidades permitidas:
   - PIGO suministra materiales + instala.
   - El cliente compra materiales + PIGO instala.
   - El cliente ya tiene materiales + PIGO instala.
4. El resumen grande desaparece de la pantalla del cliente. La conversación sigue de forma continua.
5. El resumen técnico se conserva internamente y ahora es más completo en Administración > Solicitudes.
6. El asesor recoge nombre, WhatsApp, ciudad y dirección exacta dentro del chat. Ya no aparece el formulario inferior.
7. Cuando todo está listo, el cliente puede escribir `ENVIAR` o tocar `Enviar solicitud`.
8. Escribir `ENVIAR` no consume otro turno de OpenAI: el navegador manda la solicitud directamente a Supabase.
9. El asesor conserva datos de turnos anteriores: medidas, CEDAL/Andesía, color de aluminio, vidrio, espesor, modalidad y contacto.
10. Lenguaje más natural y menos burocrático.
11. Reglas de recomendación de vidrio según aplicación y tamaño, siempre con revisión técnica donde la seguridad lo exige.
12. Se añadieron accesorios comunes por tipo de trabajo para que el administrador reciba solicitudes más completas.
13. Se añadió “Cortinas de baño” al cotizador, servicios y galería.
14. Se mejoró el panel de solicitudes para que el técnico pueda entender el pedido sin abrir toda la conversación.
15. La conversación completa queda escondida en un desplegable “Ver conversación completa (solo si hace falta)”.

## SQL V3

Para guardar `province` y `address` en columnas propias y crear las nuevas tarifas, ejecuta en Supabase SQL Editor:

`supabase/migrations/0003_conversational_leads.sql`

La API tiene compatibilidad temporal si todavía no ejecutaste la migración, pero es recomendable ejecutarla.

## Prueba recomendada

Después de copiar la V3 encima de tu proyecto:

```powershell
npm run build
npm run dev
```

Prueba esta conversación:

1. `Quiero una ventana fija de 2 mts x 1.5 mts`
2. `Negro y CEDAL`
3. Responde a la recomendación de vidrio.
4. Indica si PIGO lleva materiales e instala o si tú compras y PIGO instala.
5. Da nombre y WhatsApp cuando lo pida.
6. Da ciudad y dirección.
7. Escribe `ENVIAR`.

Luego revisa Administración > Solicitudes.
