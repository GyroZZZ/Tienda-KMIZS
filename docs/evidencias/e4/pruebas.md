# Evidencia · [E4] Confianza, políticas, FAQ y confirmación de pedido

**Fecha:** 9 de noviembre de 2026
**Entorno:** Next.js 16.4.3 · Node 26 · Windows 11
**Servidor:** `npm run dev` en `http://localhost:3000`
**Navegador:** Brave 157 (CDP) con emulación móvil 390 × 844 y escritorio 1440 × 900

## 1. Comandos de verificación

| Comando                          | Resultado                                               |
| -------------------------------- | ------------------------------------------------------- |
| `npm run typecheck`              | Sin errores                                             |
| `npm run lint`                   | Sin errores ni advertencias                             |
| `npm run build`                  | Compila y genera 31 rutas, incluida `/checkout/gracias` |
| `GET /productos/basica-tinta`    | 200                                                     |
| `GET /checkout`                  | 200                                                     |
| `GET /checkout/gracias?pedido=…` | 200                                                     |
| `GET /politicas/cambios`         | 200                                                     |
| `GET /preguntas-frecuentes`      | 200                                                     |

## 2. QA móvil (390 × 844)

| Página                                                | Desbordamiento horizontal  | Evidencia                          |
| ----------------------------------------------------- | -------------------------- | ---------------------------------- |
| `/productos/basica-tinta` (bloque de confianza)       | No (`scrollWidth === 390`) | `01-movil-ficha-confianza.png`     |
| `/checkout` (bloque de confianza + formulario)        | No (`scrollWidth === 390`) | `02-movil-checkout-confianza.png`  |
| `/checkout/gracias?pedido=KM-PRUEBA-E4` (con resumen) | No (`scrollWidth === 390`) | `03-movil-gracias.png`             |
| `/checkout/gracias?pedido=KM-SIN-RESUMEN` (respaldo)  | No                         | `05-movil-gracias-sin-resumen.png` |
| `/politicas/cambios` (retracto y garantía)            | No (`scrollWidth === 390`) | `06-movil-politica-cambios.png`    |
| `/preguntas-frecuentes`                               | No (`scrollWidth === 390`) | `07-movil-faq.png`                 |
| Flujo del formulario hasta la página de gracias       | No (`scrollWidth === 390`) | `08-movil-flujo-gracias.png`       |

## 3. QA escritorio (1440 × 900)

- `/checkout/gracias?pedido=KM-PRUEBA-E4`: contenido centrado, resumen y enlaces legales legibles.
  Sin desbordamiento (`scrollWidth === 1440`). Evidencia: `04-escritorio-gracias.png`.

## 4. Prueba del flujo de confirmación

Para probar el recorrido del cliente sin enviar correos reales ni depender de Resend, se interceptó
en el navegador la llamada `POST /api/checkout` con una respuesta simulada:

```json
{ "orderId": "KM-FLOW-E4", "whatsappUrl": "https://wa.me/573103898707?text=…" }
```

El formulario se completó con datos de prueba y se envió con contraentrega. Resultado:

| Comprobación                                        | Resultado                                |
| --------------------------------------------------- | ---------------------------------------- |
| Redirección a `/checkout/gracias?pedido=KM-FLOW-E4` | Correcta                                 |
| Resumen guardado en `sessionStorage`                | Correcto, con líneas, subtotal y destino |
| Carrito después del pedido                          | `[]` (vaciado)                           |
| Número de pedido visible en la página               | Correcto                                 |
| Enlaces a envíos, cambios, términos y privacidad    | Correctos                                |
| Desbordamiento horizontal                           | No                                       |

El resumen guardado conserva: número de pedido, fecha, medio de pago, nombre, correo, ciudad,
departamento, líneas (producto, color, talla, cantidad, total), subtotal, envío y total.

## 5. Página de gracias

- **Con resumen:** muestra número de pedido, “Qué sigue” según el medio de pago, resumen de líneas,
  subtotal, envío “Por confirmar”, total, botón de WhatsApp, comprobante imprimible, enlace para
  seguir comprando y enlaces legales.
- **Sin resumen:** muestra el número de pedido y un respaldo que explica que el detalle no está en
  ese dispositivo y ofrece WhatsApp. No se pierde el número.
- **Sin número de pedido:** muestra “No encontramos el pedido” con accesos al catálogo y a WhatsApp.
- La ruta tiene `robots: { index: false, follow: false }`.

## 6. Contenido legal revisado

| Documento              | Puntos comprobados                                                                                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Envíos y entregas      | Cobertura, tarifas por confirmar, despacho en 1–2 días hábiles, producción de 8–12 días hábiles para personalizados, envío gratis manual, seguimiento y dos intentos de entrega                                                                   |
| Cambios y devoluciones | Cambio de talla en 5 días hábiles, garantía legal (arts. 7–11, Ley 1480), retracto (art. 47), excepción de personalizados (parágrafo art. 47), reembolso hasta 30 días calendario y cómo solicitarlo                                              |
| Términos y condiciones | Identificación del vendedor, precios, aceptación del pedido, medios de pago, retracto, garantía, reversión del pago (art. 51), propiedad intelectual, ley aplicable y SIC, vigencia                                                               |
| Tratamiento de datos   | Responsable, datos recolectados, finalidades, autorización, derechos, plazos de respuesta, encargados (Resend, Mercado Pago, transportadora, Vercel, WhatsApp), seguridad, cookies, menores y vigencia (Ley 1581, Decretos 1377/2013 y 1074/2015) |

## 7. Accesibilidad revisada

- El bloque de confianza es una `section` con `h2` y lista semántica.
- Los estados de la página de gracias se anuncian con `aria-live` mientras se abre el resumen.
- La tabla de resumen usa lista y lista de definiciones (`dl`), legible por lector de pantalla.
- Botones y enlaces mantienen áreas táctiles de al menos 44 px.
- La página de gracias no se indexa.
- Los enlaces legales tienen texto visible y subrayado, no solo color.

## 8. Limitaciones registradas

- El correo al cliente no se envía: el dominio no está verificado en Resend. Se entrega página de
  gracias + registro al equipo. Decisión aceptada por el alcance académico.
- `hola@kmizs.co` se mantiene publicado aunque el dominio no resuelva; es una decisión de alcance.
- El comprobante vive en `sessionStorage`; si el cliente borra los datos del navegador, conserva el
  número de pedido y el respaldo genérico.
- El envío gratis y la talla XXL se gestionan manualmente por WhatsApp.
- Las tarifas de envío siguen pendientes de confirmación con la transportadora.
- El texto legal debe revisarlo el docente o un abogado antes de un lanzamiento real.

## 9. Verificación del preview y producción

**PR:** #7 · **Merge:** `786e149` (9 de noviembre de 2026)
**Preview:** `https://tienda-kmizs-git-feat-e4-confianza-dream-team-509f.vercel.app`
(Ready; protegido por la autenticación de Vercel)
**Producción:** `https://tienda-kmizs.vercel.app`

| Ruta                               | HTTP | Contenido comprobado                      | Evidencia                         |
| ---------------------------------- | ---- | ----------------------------------------- | --------------------------------- |
| `/productos/basica-tinta`          | 200  | Bloque “Compra con confianza”             | `09-prod-ficha-confianza.png`     |
| `/checkout`                        | 200  | Bloque “Compra con confianza”             | —                                 |
| `/checkout/gracias?pedido=KM-PROD` | 200  | Respaldo genérico con número de pedido    | `10-prod-gracias-sin-resumen.png` |
| `/politicas/cambios`               | 200  | Retracto, garantía legal y personalizados | `11-prod-politica-cambios.png`    |
| `/politicas/terminos`              | 200  | Reversión del pago y ley aplicable        | —                                 |
| `/politicas/privacidad`            | 200  | Ley 1581 de 2012 y derechos               | —                                 |
| `/preguntas-frecuentes`            | 200  | Envío gratis, tallas y retracto           | —                                 |

La página de gracias se renderiza en el cliente después de leer `sessionStorage`; por eso el
respaldo se verificó en el navegador sobre producción y no solo con el HTML del servidor.
