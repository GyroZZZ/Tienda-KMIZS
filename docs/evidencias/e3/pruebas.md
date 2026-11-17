# Evidencia · Envío gratis por 2+ prendas y pedidos personalizados

**Fecha:** 10 de noviembre de 2026
**Rama:** `main` (cambio integrado por PR)
**Alcance:** regla de envío gratis en carrito, checkout, API, correo, WhatsApp, página de gracias,
ficha de producto, señales de confianza, FAQ y políticas.

---

## 1. Regla implementada

| Condición del pedido                        | Envío                                                               |
| ------------------------------------------- | ------------------------------------------------------------------- |
| 2 o más prendas (mismo o distintos modelos) | Gratis                                                              |
| Pedido personalizado, de evento o de equipo | Gratis                                                              |
| 1 sola prenda                               | Tarifa de la zona (o cotización por WhatsApp si no está confirmada) |

La regla vive en `lib/free-shipping.ts` y la consumen el carrito, el checkout y `app/api/checkout`.
El servidor calcula el total con la misma función, guarda `shipping: 0` y `shippingZone: "Envío gratis"`
en el resumen del pedido, y omite la línea de envío en la preferencia de Mercado Pago cuando es gratis.

---

## 2. Casos probados en navegador (390 px)

| #   | Caso                                             | Resultado esperado                             | Resultado obtenido |
| --- | ------------------------------------------------ | ---------------------------------------------- | ------------------ |
| 1   | Carrito con 1 prenda                             | “Por confirmar” y total = subtotal             | ✅                 |
| 2   | Carrito con 2 unidades del mismo modelo          | “Gratis” con motivo “2 o más prendas”          | ✅                 |
| 3   | Carrito con 2 modelos distintos                  | “Gratis” con motivo “2 o más prendas”          | ✅                 |
| 4   | Carrito con pedido personalizado (6 unidades)    | “Gratis” con motivo de personalizados          | ✅                 |
| 5   | Checkout con 2 modelos distintos                 | Envío “Gratis”, total = subtotal               | ✅                 |
| 6   | Página de gracias de un pedido de 2 prendas      | “Envío gratis · Gratis”, total = subtotal      | ✅                 |
| 7   | Página de gracias de un pedido de 1 prenda       | “Por confirmar”, total pendiente de cotización | ✅                 |
| 8   | Resumen guardado en `sessionStorage` (2 prendas) | `shipping: 0`, `shippingZone: "Envío gratis"`  | ✅                 |
| 9   | Resumen guardado en `sessionStorage` (1 prenda)  | `shipping: null`, `total: null`                | ✅                 |

El envío del formulario se probó con una respuesta simulada de `/api/checkout`, porque el entorno
local no tiene `RESEND_API_KEY` ni `RESEND_FROM_EMAIL`. El servidor real no se modificó para la
prueba: solo se interceptó `fetch` en el navegador para verificar el resumen y la navegación.

---

## 3. Capturas

| Archivo                              | Qué muestra                                                    |
| ------------------------------------ | -------------------------------------------------------------- |
| `01-movil-carrito-1-prenda.png`      | Carrito de una prenda con envío “Por confirmar”                |
| `02-movil-carrito-2-prendas.png`     | Dos modelos distintos con envío “Gratis” y su explicación      |
| `03-movil-checkout-2-prendas.png`    | Checkout con envío gratis, total igual al subtotal             |
| `04-movil-carrito-personalizada.png` | Pedido personalizado con envío gratis y motivo específico      |
| `05-movil-gracias-envio-gratis.png`  | Página de gracias con “Envío gratis · Gratis” y próximos pasos |
| `06-prod-carrito-2-prendas.png`      | Producción: dos prendas con envío “Gratis”                     |
| `07-pago-aprobado.png`               | Pago aprobado en producción con Mercado Pago                   |
| `08-pago-rechazado.png`              | Pago rechazado: la tienda conserva el carrito                  |
| `09-pago-pendiente.png`              | Pago en proceso: la tienda no confirma ni descarta             |

---

## 4. Verificación técnica

| Comando                | Resultado                        |
| ---------------------- | -------------------------------- |
| `npx prettier --write` | Sin cambios pendientes           |
| `npm run lint`         | Sin errores                      |
| `npm run typecheck`    | Sin errores                      |
| `npm run build`        | 31 rutas generadas correctamente |

---

## 5. Textos actualizados

- Carrito y checkout: motivo del envío gratis y total sin cobro de envío.
- Ficha de producto: “Envío gratis desde 2 prendas…”; la tarifa se muestra solo para una prenda.
- Señales de confianza: “Gratis desde 2 prendas o en pedidos de equipo”.
- FAQ: “¿Cuánto cuesta el envío?” y “¿Cuándo me sale gratis el envío?”.
- Política de envíos: nueva sección “Envío gratis” y fecha de actualización 10 nov 2026.
- Correo al equipo y mensaje de WhatsApp: muestran “Gratis” y no piden cotizar el envío.
- Encabezado del sitio: “Envío gratis desde 2 prendas · Pedidos por WhatsApp”.

---

## 6. Limitaciones y pendientes

- **Producción:** verificado el 10 de noviembre de 2026 tras el merge (commit `1bc50b1`): el carrito
  con 2 prendas muestra “Gratis” y la política de envíos contiene la regla nueva.
- **Resend:** sin credenciales, el pedido real sigue devolviendo 503 en local. Es la misma
  limitación documentada en E4 y se resuelve en la subtarea 3 del sprint.
- **Tarifas de una sola prenda:** siguen siendo de referencia hasta confirmar con la transportadora.
- **Margen:** la provisión de $1.590 por prenda se eliminó el 15 de noviembre de 2026. El envío
  gratis se reconoce por pedido: margen unitario 57,1–59,5% y pedidos de 2 prendas en 45,9–49,7%.
  El detalle está en `docs/catalogo.md`.

---

## 7. Mercado Pago: webhook firmado (16 de noviembre de 2026)

El endpoint `/api/payments/webhook` se validó contra el servidor local con peticiones firmadas a mano,
sin depender de que Mercado Pago las enviara:

| Caso           | Petición                                                                                     | Respuesta                                        | Lectura                                                                                |
| -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Firma válida   | `x-signature: ts=<ts>,v1=<HMAC-SHA256>` con el manifiesto `id:1234567890;request-id:…;ts:…;` | `502` "No pudimos verificar el pago."            | Pasó la validación y siguió a `GET /v1/payments/{id}`, que falla con un ID inexistente |
| Firma inválida | el mismo manifiesto con `v1` en ceros                                                        | `401` "La firma de la notificación no coincide." | Rechazo correcto                                                                       |

La clave usada es la de la aplicación `KMIZS Tienda` (ID `5353395853534570`). Mercado Pago no muestra
la clave del entorno de prueba en el panel, solo permite regenerarla; la de producción sí es visible y
es la que valida la firma, porque el secreto es por aplicación y no por entorno.

---

## 8. Compra de punta a punta en producción (16 de noviembre de 2026)

Las variables quedaron cargadas en Vercel y el sitio se redesplegó. Las tres compras se hicieron sobre
`https://tienda-kmizs.vercel.app` con las credenciales de prueba, la cuenta de comprador de prueba y
las tarjetas de prueba del punto 9 de [`docs/mercado-pago-sandbox.md`](../mercado-pago-sandbox.md).

### 8.1 Los tres estados

| Estado    | Pedido                                    | Pago           | Medio               | Valor    | `status` / `status_detail`              | Captura                 |
| --------- | ----------------------------------------- | -------------- | ------------------- | -------- | --------------------------------------- | ----------------------- |
| Aprobado  | `KM-C501157B-576F-40F7-BD01-1104AD6D3C8E` | `188925368893` | Mastercard crédito  | $159.800 | `approved` / `accredited`               | `07-pago-aprobado.png`  |
| Rechazado | `KM-79935B0A-36F2-46A2-8117-15236DB5AED9` | `188927364905` | Visa crédito (OTHE) | $92.800  | `rejected` / `cc_rejected_other_reason` | `08-pago-rechazado.png` |
| Pendiente | `KM-5B10B99B-6D40-472E-8430-0369D066F448` | `188930688193` | Visa débito (CONT)  | $108.800 | `in_process` / `pending_contingency`    | `09-pago-pendiente.png` |

Los tres estados se consultaron después contra `GET /v1/payments/{id}` para confirmar que el estado
que muestra la tienda es el que reporta Mercado Pago, no solo lo que trae la URL de retorno.

### 8.2 Qué hizo la tienda en cada caso

| Revisión                                  | Aprobado        | Rechazado                  | Pendiente             |
| ----------------------------------------- | --------------- | -------------------------- | --------------------- |
| Página `/checkout/resultado`              | "Pago aprobado" | "Pago no aprobado"         | "Pago en proceso"     |
| Detalle mostrado                          | `accredited`    | `cc_rejected_other_reason` | `pending_contingency` |
| Pedido `KM-…` en pantalla                 | Sí              | Sí                         | Sí                    |
| Carrito después de volver                 | Vacío (0)       | Intacto                    | Intacto               |
| Correo de pedido a `kmizs@protonmail.com` | Sí              | Sí                         | Sí                    |

El carrito se vacía solo cuando el pago queda aprobado. En rechazado y pendiente se conserva, para que
el comprador pueda reintentar sin volver a armar el pedido.

### 8.3 Envío cobrado en el pago real

El total que llega a Mercado Pago se comparó con la regla de envío:

| Pedido          | Prendas            | Total    | Composición                |
| --------------- | ------------------ | -------- | -------------------------- |
| `KM-C501157B-…` | 2 básicas          | $159.800 | 2 × $79.900, envío gratis  |
| `KM-2A2F7594-…` | 1 básica, Medellín | $92.800  | $79.900 + $12.900 de envío |
| `KM-79935B0A-…` | 1 básica, Medellín | $92.800  | $79.900 + $12.900 de envío |
| `KM-8AD7D62A-…` | 1 básica, Bogotá   | $98.800  | $79.900 + $18.900 de envío |
| `KM-5B10B99B-…` | 1 oversize, Bogotá | $108.800 | $89.900 + $18.900 de envío |

La preferencia de Mercado Pago lleva exactamente el total calculado por el servidor: no hay envío
cobrado cuando aplica el envío gratis, y sí cuando es una sola prenda.

### 8.4 Correos

| Correo                                      | Cuándo                      | Estado    |
| ------------------------------------------- | --------------------------- | --------- |
| `Pedido KM-… · pago sandbox solicitado`     | Al crear la preferencia     | Entregado |
| `Actualización de pago · KM-… · approved`   | Webhook firmado con el pago | Entregado |
| `Actualización de pago · KM-… · rejected`   | Webhook firmado con el pago | Entregado |
| `Actualización de pago · KM-… · in_process` | Webhook firmado con el pago | Entregado |

La idempotencia se verificó reenviando la notificación del pago rechazado con otro `x-request-id`: el
endpoint respondió `200` y **no** se duplicó el correo, porque la clave de idempotencia depende del
pago y del estado, no del identificador de la petición.

### 8.5 Contraentrega y transferencia

Los dos medios que no pasan por Mercado Pago se probaron contra el servidor real, sin interceptar
nada:

| Medio                   | Pedido                                    | Respuesta | Correo al equipo                      | WhatsApp |
| ----------------------- | ----------------------------------------- | --------- | ------------------------------------- | -------- |
| Contraentrega           | `KM-1056C634-3CAE-455A-82F9-590C87F6C77E` | `200`     | `… · requiere confirmación` entregado | Sí       |
| Transferencia/billetera | `KM-F9051DAD-18A4-47EB-B906-18805A782FCA` | `200`     | `… · requiere confirmación` entregado | Sí       |

El pedido de contraentrega lleva 2 prendas y el enlace de WhatsApp dice "Envío: gratis"; el de
transferencia lleva 1 prenda y dice "Envío (Ciudad principal): $12.900". Es la misma regla de envío
que aplica al pago con Mercado Pago, calculada en el servidor.

### 8.6 Límites encontrados en el entorno de prueba

1. **Mercado Pago no entregó el webhook por su cuenta.** El historial de notificaciones de la
   aplicación `5353395853534570` aparece vacío y no llegó ningún correo de "Actualización de pago"
   después de las compras. Los tres correos de actualización se produjeron con peticiones firmadas a
   mano contra el endpoint real, que es lo que valida el punto 7. La causa más probable es que las
   preferencias las crea la aplicación de prueba automática (`5894382745963165`), que no se puede
   configurar por API, mientras el webhook quedó registrado en `5353395853534570`. **Antes de salir a
   producción hay que confirmar una entrega real de Mercado Pago**, no solo la petición simulada.
2. **Las tarjetas nuevas no se pueden agregar en esta cuenta de prueba.** Con una tarjeta que Mercado
   Pago no tenga sembrada, el formulario acepta los datos y avanza hasta las cuotas, pero el pago
   termina en `…/fatal/` en el dominio `sandbox.mercadopago.com.co` y en `…/congrats/recover/error/`
   con "No puedes pagar con un e-mail corporativo de Mercado Libre" en `www.mercadopago.com.co`. Solo
   las tarjetas sembradas en la cuenta de comprador de prueba completan el pago, y con ellas los tres
   estados funcionan. Es una limitación de la cuenta de prueba automática, no de la integración.

### 8.6 Pendientes que salen de esta prueba

- Confirmar una entrega real del webhook con credenciales de producción.
- Confirmar las tarifas de envío con la transportadora: hoy son de referencia y ya están publicadas.
- Activar las credenciales de producción (KYC comercial pendiente).
