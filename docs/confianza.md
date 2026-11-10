# Confianza, contenido legal y confirmación de pedido

**Tarjeta:** `[E4] Generar confianza: políticas, páginas legales, FAQ y confirmación de pedido`
**Sprint:** 2 · 5 puntos
**Responsable:** Horacio Campillo · **Revisor:** Ivan Arroyo
**Fecha de cierre:** 9 de noviembre de 2026

## 1. Objetivo

Que alguien que no conoce la marca pueda entender cómo compra, cuánto paga, cuándo recibe, qué
pasa si algo sale mal y cómo se tratan sus datos, antes de dejar sus datos en el checkout.

## 2. Qué se implementó

| Entregable                       | Dónde vive                                                                   | Qué cambió                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Políticas de envíos y cambios    | `data/policies.ts` → `app/politicas/[slug]/page.tsx`                         | Contenido real con plazos, cobertura, envío gratis, intentos de entrega, garantía y retracto                                    |
| Términos y condiciones           | `data/policies.ts`                                                           | Identificación del vendedor, precios, pedidos, pagos, retracto, garantía, reversión del pago, propiedad intelectual y autoridad |
| Política de tratamiento de datos | `data/policies.ts`                                                           | Responsable, datos, finalidades, autorización, derechos, encargados, seguridad, cookies y vigencia                              |
| FAQ ampliada                     | `app/preguntas-frecuentes/page.tsx`                                          | 17 preguntas agrupadas en Pedidos, Envíos, Tallas y cambios, Pagos, Personalizados y datos                                      |
| Bloque de confianza              | `components/trust/TrustSignals.tsx`                                          | Señales en la ficha de producto y en el checkout                                                                                |
| Página de gracias                | `app/checkout/gracias/page.tsx` + `components/checkout/OrderThankYou.tsx`    | Número de pedido, próximos pasos, resumen, WhatsApp, comprobante imprimible y enlaces legales                                   |
| Comprobante en el navegador      | `lib/order-snapshot.ts`                                                      | Resumen del pedido en `sessionStorage`; respaldo genérico si no está disponible                                                 |
| Número de pedido en Mercado Pago | `app/api/payments/status/route.ts` + `components/checkout/PaymentResult.tsx` | La verificación devuelve `external_reference` y la página muestra el pedido                                                     |
| Registro del pedido              | `app/api/checkout/route.ts` + `lib/order-email.ts`                           | Se mantiene el correo al equipo; el correo al cliente queda pendiente (ver limitaciones)                                        |

## 3. Base legal y decisiones

El contenido se redactó con base en:

- **Ley 1480 de 2011 (Estatuto del Consumidor):** artículos 7 a 11 (garantía legal), artículo 47
  (derecho de retracto en compras a distancia) y artículo 51 (reversión del pago).
- **Ley 1581 de 2012 (protección de datos personales)**, con el **Decreto 1377 de 2013**,
  compilado en el **Decreto 1074 de 2015**.

| Decisión                             | Valor adoptado                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Identificación del vendedor          | “KMIZS · proyecto académico”, sin NIT ni sociedad constituida                                          |
| Canales de atención                  | `hola@kmizs.co` y WhatsApp +57 310 389 8707                                                            |
| Cambio de talla                      | 5 días hábiles desde la entrega                                                                        |
| Derecho de retracto                  | 5 días hábiles desde la entrega (art. 47, Ley 1480)                                                    |
| Reembolso                            | Hasta 30 días calendario después de la solicitud                                                       |
| Garantía legal                       | Un año para productos nuevos; cubre defectos de confección y estampado                                 |
| Productos personalizados             | Sin retracto ni cambio de talla (parágrafo del art. 47), con garantía legal por defectos               |
| Envío gratis                         | Desde la tercera compra, validado manualmente por WhatsApp                                             |
| Envío de regreso por cambio de talla | Lo paga el cliente; KMIZS asume el reenvío una vez por pedido                                          |
| Envío de regreso por retracto        | Lo paga el cliente, salvo que la ley disponga lo contrario                                             |
| Datos                                | Autorización expresa en el checkout; el correo solo se usa para el pedido salvo autorización adicional |

### Por qué el envío gratis es manual

El sitio no tiene cuentas ni historial de pedidos, así que no puede verificar la tercera compra por
sí solo. La política lo declara como beneficio validado por WhatsApp y no como una regla automática.

### Por qué los personalizados no tienen retracto

El parágrafo del artículo 47 de la Ley 1480 excluye los bienes confeccionados con especificaciones
del consumidor. La política lo dice de forma explícita y aclara que la garantía legal sí aplica.

## 4. Confirmación de pedido

Flujo implementado:

1. El cliente completa el checkout y el servidor registra el pedido.
2. Para contraentrega o transferencia, el navegador guarda un resumen en `sessionStorage` y navega a
   `/checkout/gracias?pedido=KM-…`.
3. La página de gracias muestra el número, los próximos pasos según el medio de pago, el resumen, el
   botón de WhatsApp, el comprobante imprimible y los enlaces a las políticas.
4. Para Mercado Pago, el resumen también se guarda antes de salir a la pasarela. Al volver,
   `/checkout/resultado` verifica el pago y ofrece “Ver resumen del pedido” con el número real.

El sitio **no tiene base de datos de pedidos**. Por eso el comprobante vive en el navegador y, si el
cliente borra los datos, la página muestra un respaldo con el número de pedido y el canal de
WhatsApp.

## 5. Limitaciones aceptadas

- **Correo al cliente:** no se envía porque el dominio de la marca no está verificado en Resend. Se
  entrega página de gracias, resumen en el navegador y registro al equipo. Queda documentado como
  pendiente para cuando exista un dominio verificado.
- **Correo publicado:** `hola@kmizs.co` se mantiene como canal oficial aunque el dominio no resuelva.
  Es una decisión de alcance académico: no se comprará dominio ni se constituirá empresa.
- **Sin historial de pedidos:** el envío gratis y la validación de la tercera compra son manuales.
- **Tarifas de envío:** siguen pendientes de confirmación con la transportadora
  (`SHIPPING_RATES_CONFIRMED=false`). El checkout no cobra en línea hasta confirmarlas.
- **Revisión legal:** el texto se redactó con base en las leyes citadas, pero **no sustituye la
  revisión de un abogado o del docente**. Debe revisarse antes de un lanzamiento real.

## 6. Verificación

- `npm run typecheck`, `npm run lint` y `npm run build` sin errores.
- QA móvil a 390 px: ficha, checkout, página de gracias (con y sin resumen), política de cambios y
  FAQ sin desbordamiento horizontal.
- QA escritorio a 1440 px: página de gracias centrada y legible.
- Flujo del formulario probado con una respuesta simulada del API: guarda el resumen, vacía el
  carrito y navega a la página de gracias.
- Verificado en producción tras el merge del PR #7 (commit `786e149`): ficha, checkout, página de
  gracias, políticas y FAQ responden 200 con el contenido nuevo.
- Evidencia completa en `docs/evidencias/e4/pruebas.md`.

## 7. Cómo verificarlo

1. Abrir una ficha (`/productos/basica-tinta`) y bajar hasta “Compra con confianza”.
2. Abrir `/checkout` y revisar el mismo bloque antes del formulario.
3. Registrar un pedido de contraentrega o transferencia y revisar `/checkout/gracias?pedido=…`.
4. Recargar la página de gracias: el resumen se conserva en la misma pestaña.
5. Abrir la página con otro número de pedido: debe aparecer el respaldo genérico.
6. Revisar `/politicas/envios`, `/politicas/cambios`, `/politicas/terminos` y
   `/politicas/privacidad`.
