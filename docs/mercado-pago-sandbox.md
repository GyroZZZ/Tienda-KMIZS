# Mercado Pago en modo de prueba

**Tarjeta:** `[E3] Habilitar compra en móvil: carrito, checkout, pagos y envíos` · **Sprint:** 3
**Última actualización:** 19 de noviembre de 2026

Guía para probar el checkout de KMIZS sin mover dinero real. El código ya está en
`app/api/checkout/route.ts`, `app/api/payments/webhook/route.ts` y `app/api/payments/status/route.ts`.
Las credenciales están cargadas en Vercel y los tres casos de prueba ya se ejecutaron: la evidencia
está en [`docs/evidencias/e3/pruebas.md`](evidencias/e3/pruebas.md), punto 8.

---

## 1. Cómo funciona el "sandbox" de Mercado Pago

Mercado Pago no tiene un servidor de pruebas aparte: **la API es la misma y lo que cambia son las
credenciales**. Con credenciales de prueba, la pasarela acepta tarjetas de prueba y no cobra.

| Concepto               | Qué es                                                        | Dónde se usa                                       |
| ---------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| Credenciales de prueba | Access Token de la pestaña "Prueba" de la aplicación          | `.env.local` y Vercel (servidor)                   |
| Cuenta de comprador    | Usuario simulado que paga en el checkout                      | Solo para iniciar sesión al pagar, nunca en `.env` |
| Tarjetas de prueba     | Números ficticios que simulan aprobado, rechazado o pendiente | Formulario de pago                                 |
| Firma del webhook      | Clave secreta con la que se valida cada notificación          | `MERCADO_PAGO_WEBHOOK_SECRET`                      |

**Prefijos de las credenciales:** según el producto, la pestaña "Prueba" entrega `TEST-` (API de
pagos, Bricks) o `APP_USR-` (Checkout Pro). Ambos son válidos y la app acepta los dos cuando
`MERCADO_PAGO_ENVIRONMENT=test`. Nunca cambies el prefijo a mano: se copia tal cual.

### Por qué la API de Preferencias

Mercado Pago ofrece dos caminos para Checkout Pro: la **API de Preferencias** (flujo clásico,
`init_point`) y la **API de Orders** (recomendada para integraciones nuevas, `checkout_url`). KMIZS
usa Preferencias porque la pasarela la sigue soportando sin fecha de apagado y es la ruta con más
rodaje en Colombia. La migración a Orders queda anotada como deuda técnica en
[`docs/sprint-3.md`](sprint-3.md).

Una preferencia creada con credenciales de prueba devuelve `sandbox_init_point`; con credenciales de
producción devuelve únicamente `init_point`. `lib/payments.ts` elige el enlace según
`MERCADO_PAGO_ENVIRONMENT`: en `test` usa el sandbox y cae a `init_point`; en `production` ignora
cualquier enlace `sandbox_*`.

---

## 2. Requisitos antes de probar

1. Cuenta de Mercado Pago (puede ser personal; el KYC comercial solo se necesita para producción).
2. Acceso a Vercel → Settings → Environment Variables del proyecto.
3. `SHIPPING_RATES_CONFIRMED=true` con las tarifas de referencia cargadas. El checkout solo muestra
   el pago en línea cuando hay zona y tarifa; sin eso, el pedido se cotiza por WhatsApp.
4. Resend configurado (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`). Sin correo no se registra el pedido y
   el checkout responde 503 a propósito.

---

## 3. Crear la aplicación

1. Entra a [Tus integraciones](https://www.mercadopago.com.co/developers/panel/app) con tu cuenta.
2. **Crear aplicación** → nombre `KMIZS Tienda`, producto **Pagos online**, modelo **Checkout Pro**.
3. En _Datos de la integración_ marca que **no** es un marketplace (KMIZS vende directo).
4. Guarda. La aplicación queda con dos pestañas: **Prueba** y **Producción**.

## 4. Copiar las credenciales de prueba

1. Abre la aplicación → sección **Prueba** → **Credenciales de prueba**.
2. Si es la primera vez, pulsa **Activar credenciales**, acepta los términos y resuelve el
   reCAPTCHA. Las credenciales se generan automáticamente.
3. Copia el **Access Token**. Ese valor va en `MERCADO_PAGO_ACCESS_TOKEN` y **nunca** se sube al
   repositorio ni se expone en el navegador.

### Estado del entorno de prueba (16 de noviembre)

| Dato                | Valor                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| Aplicación          | `KMIZS Tienda` · ID `5353395853534570` · Colombia (MCO) · Checkout Pro         |
| Vendedor de prueba  | usuario `3852045262`                                                           |
| Comprador de prueba | `test_user_8164834918474591249@testuser.com` (ID `3852045264`), clave `5iXYGLbhoY`, saldo cargado |
| Webhook             | `https://tienda-kmizs.vercel.app/api/payments/webhook`, tópico `payment`       |
| Entorno en Vercel   | `MERCADO_PAGO_ENVIRONMENT=test`, 14 variables cargadas en Production y Preview |
| Dominio de retorno  | `https://tienda-kmizs.vercel.app` (`NEXT_PUBLIC_SITE_URL`)                     |

La preferencia se validó contra la API real con las credenciales de prueba: responde `201` y devuelve
`init_point` **y** `sandbox_init_point`. Por eso la app usa el enlace `sandbox.mercadopago.com.co`
mientras `MERCADO_PAGO_ENVIRONMENT=test`.

**Ojo con el dominio de retorno:** `getSiteUrl()` prefiere `NEXT_PUBLIC_SITE_URL` y, si no existe,
`VERCEL_PROJECT_PRODUCTION_URL`. No uses `VERCEL_URL`: es el hostname del deployment, queda detrás de
Deployment Protection y el comprador vuelve de la pasarela a un login de Vercel.

## 5. Crear la cuenta de comprador de prueba

1. En la misma aplicación → **Cuentas de prueba** → **Crear cuenta de prueba**.
2. País **Colombia**, tipo **Comprador**. Anota usuario, contraseña y el **código de 6 dígitos** que
   se muestra: ese código se pide al iniciar sesión durante el pago.
3. El correo de la cuenta de prueba debe ser distinto del correo de tu cuenta real de Mercado Pago.

## 6. Configurar el webhook

El checkout ya envía `notification_url` en cada preferencia
(`https://tu-dominio/api/payments/webhook`), pero la firma se valida con una clave que se genera en
el panel:

1. Aplicación → **Webhooks** → **Configurar notificaciones**.
2. URL de producción: `https://tienda-kmizs.vercel.app/api/payments/webhook`.
3. Evento: **Pagos**. Guarda y copia la **clave secreta** → `MERCADO_PAGO_WEBHOOK_SECRET`.

Cómo valida la firma `app/api/payments/webhook/route.ts`:

```
manifest = "id:" + data.id + ";request-id:" + x-request-id + ";ts:" + ts + ";"
firma    = HMAC-SHA256(manifest, MERCADO_PAGO_WEBHOOK_SECRET)
```

Se compara con el `v1` del encabezado `x-signature` en tiempo constante. Si la firma no coincide, el
endpoint responde 401 y no envía correo. Después consulta el pago con el Access Token y envía la
actualización a `ORDER_NOTIFY_EMAIL` con una clave de idempotencia por pago y estado, de modo que un
reintento de Mercado Pago no duplique el correo.

## 7. Cargar las variables

En Vercel → Settings → Environment Variables (Preview y Production mientras se prueba):

| Variable                      | Valor                               |
| ----------------------------- | ----------------------------------- |
| `MERCADO_PAGO_ENVIRONMENT`    | `test`                              |
| `MERCADO_PAGO_ACCESS_TOKEN`   | Access Token de la pestaña "Prueba" |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Clave secreta del webhook           |
| `RESEND_API_KEY`              | Clave de Resend                     |
| `RESEND_FROM_EMAIL`           | Remitente verificado en Resend      |
| `ORDER_NOTIFY_EMAIL`          | `kmizs@protonmail.com`              |

En local, los mismos valores van en `.env.local` (no se versiona). Después de cambiar variables en
Vercel hay que **redesplegar**: las funciones leen el entorno al arrancar.

## 8. Dónde probar

**Recomendado: el deployment de Vercel.** Mercado Pago exige HTTPS para las URLs de retorno y para
`auto_return`, y el webhook necesita una URL pública. El dominio de producción o un preview de Vercel
ya cumplen las tres condiciones.

**En local** funciona solo con un túnel:

```bash
# opción 1: cloudflared
cloudflared tunnel --url http://localhost:3000
# opción 2: ngrok
ngrok http 3000
```

Luego define `NEXT_PUBLIC_SITE_URL=https://la-url-del-tunel` en `.env.local` y reinicia `npm run dev`.
Con `http://localhost:3000`, `auto_return` y el webhook fallan: no es un error de la tienda.

## 9. Compra de prueba paso a paso

1. Abre la tienda en una **ventana de incógnito** (evita mezclar la sesión real de Mercado Pago).
2. Agrega una prenda al carrito y ve a `/checkout`. Con 1 prenda aparece la tarifa de envío; con 2 o
   más aparece "Gratis".
3. Completa los datos con un correo distinto al de tu cuenta de Mercado Pago (la pasarela rechaza
   al comprador si coincide con el vendedor), elige **Mercado Pago** y envía el pedido.
4. En el checkout elige **Ingresar con mi cuenta** y entra con el correo y la clave del comprador de
   prueba de la tabla anterior. No hace falta código de 6 dígitos en este flujo.
5. Elige una de las **tarjetas sembradas** que muestra la cuenta (no escribas los datos a mano) y
   completa solo el CVV `123`. El resultado lo define la tarjeta:
   - **Mastercard terminada en 3564** → aprobado (`APRO`).
   - **Visa terminada en 6260** → rechazado (`OTHE`).
   - **Visa Débito terminada en 1904** → pendiente (`CONT`).
6. Pulsa **Pagar**. En el caso aprobado Mercado Pago devuelve a `/checkout/resultado`, que consulta el
   pago y muestra "Pago aprobado". En rechazado y pendiente Mercado Pago muestra su propia pantalla;
   el pedido se actualiza con el webhook o, si no llega, al consultar
   `/api/payments/status?payment_id=<id>`.

> **Importante:** con esta aplicación de prueba creada automáticamente, la opción **Sin cuenta de
> Mercado Pago → Tarjeta** termina en `/fatal/`. Para que la compra funcione hay que entrar con la
> cuenta de comprador de prueba. El flujo de invitado se conserva para contraentrega.

### Verificación del 19 de noviembre de 2026

| Caso | Pedido | Resultado en la tienda |
| ---- | ------ | ---------------------- |
| Aprobado | `KM-9514564A-4BDF-45A0-AFFE-94ED19D0E834` | `approved`, `payment_id=190592168556`, stock descontado; llegaron 3 webhooks y no duplicaron el pedido |
| Rechazado | `KM-9C8FAB2C-249B-419B-8167-2C8B5EB6D3C1` | `rejected`, `stock_released_at` calculado; el pago `189505679217` se corrigió con `/api/payments/status` porque el webhook no llegó |
| Pendiente | `KM-1FF21BE3-53E4-4655-94E6-7BF55AFE6EE5` | `pending` con stock retenido, esperando confirmación |

Los tres pedidos generaron correo entregado a `kmizs@protonmail.com`. El entorno sigue en `test`:
no hay credenciales de producción en Vercel ni en el repositorio.

### Tarjetas de prueba (Colombia)

| Tarjeta            | Número                | CVV | Vence |
| ------------------ | --------------------- | --- | ----- |
| Crédito Mastercard | `5254 1336 7440 3564` | 123 | 11/30 |
| Crédito Visa       | `4013 5406 8274 6260` | 123 | 11/30 |
| Débito Visa        | `4912 6840 6309 1904` | 123 | 11/30 |

El resultado cambia según el **nombre del titular** (documento `123456789` cuando se pide):

| Estado esperado | Titular | Qué debe pasar en la tienda                                      |
| --------------- | ------- | ---------------------------------------------------------------- |
| Aprobado        | `APRO`  | "Pago aprobado", carrito vacío, correo de pedido aprobado        |
| Rechazado       | `OTHE`  | "Pago no aprobado", carrito intacto, correo con estado rechazado |
| Pendiente       | `CONT`  | "Pago en proceso", sin vaciar el carrito, correo de pendiente    |

### Tarjetas nuevas: limitación de la cuenta de prueba

Con la cuenta de prueba que genera la herramienta de Mercado Pago (vendedor `3852045262`) **solo
funcionan las tarjetas que ya vienen sembradas** en el comprador de prueba. Si escribes una tarjeta
distinta, el formulario acepta los datos y avanza hasta las cuotas, pero el pago no se completa:

| Dominio                      | Dónde termina               | Mensaje                                                      |
| ---------------------------- | --------------------------- | ------------------------------------------------------------ |
| `sandbox.mercadopago.com.co` | `…/fatal/`                  | "Oh, no, algo anduvo mal"                                    |
| `www.mercadopago.com.co`     | `…/congrats/recover/error/` | "No puedes pagar con un e-mail corporativo de Mercado Libre" |

No es un problema de la integración: las tarjetas sembradas pagan bien en los dos dominios y cubren
los tres estados. Si necesitas probar una tarjeta concreta, crea tu propia aplicación y tu propia
cuenta de comprador de prueba en el panel; no uses la cuenta automática.

## 10. Qué revisar en cada caso

| Revisión                         | Aprobado | Rechazado   | Pendiente  |
| -------------------------------- | -------- | ----------- | ---------- |
| Página `/checkout/resultado`     | Aprobado | No aprobado | En proceso |
| Correo a `ORDER_NOTIFY_EMAIL`    | Sí       | Sí          | Sí         |
| Carrito vaciado                  | Sí       | No          | No         |
| Pedido `KM-…` visible            | Sí       | Sí          | Sí         |
| Pago en el panel de Mercado Pago | Aprobado | Rechazado   | Pendiente  |

Guarda captura de la página de resultado, del correo recibido y del pago en el panel. Esa es la
evidencia de la subtarea 5 del sprint.

---

## 11. Problemas frecuentes

| Síntoma                                          | Causa probable                                                              | Solución                                                                   |
| ------------------------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| El checkout no ofrece Mercado Pago               | Falta token, firma, Resend o tarifas confirmadas                            | Revisa las cuatro variables y `SHIPPING_RATES_CONFIRMED=true`              |
| 503 "requiere las credenciales de Mercado Pago"  | Token vacío, con otro prefijo o `MERCADO_PAGO_ENVIRONMENT=production`       | Copia el token de la pestaña correcta y ajusta el entorno                  |
| 503 "El registro de pedidos no está configurado" | Falta Resend                                                                | Carga `RESEND_API_KEY` y `RESEND_FROM_EMAIL` y redespliega                 |
| "La firma de la notificación no coincide"        | Clave secreta de otra aplicación o webhook duplicado                        | Vuelve a copiar la clave y deja una sola URL de webhook                    |
| Mercado Pago rechaza la preferencia al crearla   | `unit_price` con decimales, moneda distinta de COP o ítem sin título        | Revisa los logs de la función; el servidor calcula los precios             |
| `auto_return` inválido                           | `back_urls` en `http://localhost`                                           | Usa el dominio de Vercel o un túnel HTTPS                                  |
| El webhook no llega                              | URL privada, evento distinto de "Pagos" o deployment apagado                | Prueba sobre producción y revisa _Webhooks → Historial_                    |
| El webhook no llega con la cuenta automática     | La preferencia la crea otra aplicación de prueba que no se puede configurar | Usa tu propia aplicación y tu propia cuenta de comprador de prueba         |
| Llegan dos correos del mismo pago                | Webhook de la aplicación y `notification_url` de la preferencia             | La clave de idempotencia evita el duplicado; si persiste, revisa el estado |
| El pago termina en `…/fatal/` al agregar tarjeta | Tarjeta no sembrada, o se intentó comprar "Sin cuenta" con la cuenta automática | Entra con la cuenta de comprador de prueba y elige una tarjeta sembrada |
| El pedido sigue en `pending` aunque el pago terminó | El webhook no llegó (puede pasar en la cuenta automática)               | Consulta `/api/payments/status?payment_id=<id>`; corrige el estado sin duplicar |

---

## 12. Salir de producción

1. Completa el KYC comercial de la cuenta y activa las **credenciales de producción**.
2. Cambia `MERCADO_PAGO_ENVIRONMENT=production` y reemplaza el Access Token por el `APP_USR-` de la
   pestaña "Producción". Con ese modo, un token de prueba deja de funcionar: es la protección contra
   cobrar sin querer.
3. Confirma las tarifas reales de la transportadora y actualiza `docs/catalogo.md` y la política de
   envíos.
4. Actualiza la URL del webhook si cambia el dominio y verifica que el historial muestre entregas 200.
5. Haz una compra real de bajo valor, confirma el abono y reembólsala.

> **Seguridad:** si un token se filtra, renuévalo en el panel y actualiza Vercel. Nunca lo pegues en
> un chat, un issue o una captura de pantalla.
