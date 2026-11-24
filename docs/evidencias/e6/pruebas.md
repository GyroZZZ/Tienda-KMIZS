# Pruebas · Atender y medir

**Fecha:** 19 de noviembre de 2026 · **Sitio:** https://tienda-kmizs.vercel.app
**Despliegue:** `main` (`3f433d7`)

Cubre tres subtareas pendientes de `[E6-E8]`: botón flotante con UTM, Vercel Web Analytics y
documentación de la medición.

---

## 1. Botón flotante de WhatsApp

El número de destino se cambió a **+57 315 019 6386** en `lib/site.ts`, de modo que todas las
referencias al WhatsApp de la tienda apuntan al mismo número.

Enlace leído del DOM en producción:

```
https://wa.me/573150196386?text=Hola%2C+vengo+de+la+tienda+KMIZS+y+quiero+hacer+una+pregunta+sobre+las+camisetas.&utm_source=web&utm_medium=referral&utm_campaign=contacto&utm_content=boton_flotante
```

- El mensaje llega prellenado.
- Los cuatro parámetros UTM están presentes.
- `01-boton-whatsapp-movil.png`: botón visible a 390 px.

## 2. Evento `whatsapp_click`

Vercel Analytics inyecta `window.va` en la página; se comprobó que existe antes de pulsar. Se envolvió
esa función para capturar lo que recibe y se pulsó el botón con la navegación cancelada. El payload
está en [`02-evento-whatsapp-click.json`](02-evento-whatsapp-click.json):

```json
{
  "name": "whatsapp_click",
  "data": {
    "content_name": "boton_flotante",
    "utm_source": "web",
    "utm_medium": "referral",
    "utm_campaign": "contacto",
    "utm_content": "boton_flotante"
  }
}
```

Con el pixel activo, el mismo clic se enviaría a Meta con el nombre estándar `Contact`.

## 3. Vercel Web Analytics

`<Analytics />` sigue montado en `app/layout.tsx`. La comprobación disponible sin iniciar sesión fue
que el script se carga y `window.va` es una función que recibe el evento anterior.

**No hay captura del panel**: `https://vercel.com/dream-team-509f/tienda-kmizs/analytics` pide
iniciar sesión y la sesión del agente no tiene acceso. Para verificarlo con la cuenta del equipo:

```sh
vc metrics vercel.analytics.page_view.count --scope dream-team-509f --project tienda-kmizs --since 7d --granularity 1d --json
vc metrics vercel.analytics.event.count --scope dream-team-509f --project tienda-kmizs --group-by eventName --since 7d --json
```

O abrir el panel y revisar **Analytics → Events** buscando `whatsapp_click`.

## 4. Documentación

`docs/analitica.md` queda actualizada con:

- Evento `whatsapp_click` en la tabla del embudo y su equivalente `Contact` en Meta.
- Convención de UTMs con valores aceptados y tres enlaces de referencia.
- Explicación de por qué los UTMs del botón `wa.me` no aparecen como pageview y por qué se envía el
  evento aparte.
- Limitación matizada: Vercel captura UTMs de la navegación, pero no se guardan en `orders`.
- Sección de evidencia enlazada a esta carpeta.

## 5. Panel lateral de cuenta y ayuda de Mercado Pago (21 de noviembre)

- `03-panel-cuenta-movil.png`: panel lateral abierto a 390 px. Ocupa el 90% del ancho, deja ver el
  fondo y no bloquea la navegación completa.
- `04-ayuda-mp-checkout.png`: checkout de producción con Mercado Pago seleccionado y la caja de ayuda
  desplegada, con las tres tarjetas y sus resultados.
- El botón **Entrar con cuenta demo** creó el usuario `demo@kmizs.test` en `public.users` y abrió la
  sesión sin pedir correo ni contraseña. El panel pasó a mostrar "Hola, Usuario Demo" con enlaces a
  "Ver mi cuenta", "Mis pedidos" y "Cerrar sesión".
- El panel se cierra con la X y con `Escape`; al cerrarlo el foco vuelve al botón "Abrir mi cuenta".
- Al marcar **Pago digital · Mercado Pago** en el checkout aparece una caja con:
  - Mastercard terminada en 3564 → aprobado (`APRO`).
  - Visa terminada en 6260 → rechazado (`OTHE`).
  - Visa Débito terminada en 1904 → pendiente (`CONT`).
  - Botones **Copiar correo** y **Copiar clave** y enlace **Abrir Mercado Pago**.
- Se comprobó que **Copiar correo** escribe en el portapapeles y muestra "Correo copiado." en un
  `role="status"`.
- Los enlaces del panel llevan `prefetch={false}` porque en Next 16 el prefetch de `/cuenta` disparaba
  el aviso de `Date.now()` durante el prerender. Además `getCurrentUser()` llama a `connection()` para
  quedar excluida del prerender del shell estático. Sin esos dos ajustes, `/cuenta` y
  `/cuenta/pedidos` mostraban el error al navegar o al prefetchear.

## 6. Conexiones agotadas del pooler (21 de noviembre)

### Síntoma

Al volver al panel de cuenta después de un rato aparecía como si no hubiera sesión, el botón
**Entrar con cuenta demo** respondía "no pudimos conectar" y al pasar del carrito al checkout salía
"This page couldn't load" de forma intermitente.

### Evidencia en los logs de Vercel

`get_runtime_errors` del proyecto `tienda-kmizs`, ventana de 7 días:

```
error: (EMAXCONNSESSION) max clients reached in session mode
       - max clients are limited to pool_size: 15
count=106
routes=/api/account/me, /checkout, /checkout.rsc, /carrito, /productos,
       /productos/basica-hueso, /productos/oversize-tinta, /cuenta/pedidos.rsc, ...
first=2026-11-19T22:36:22Z (17:36 en Colombia)
last=2026-11-21T22:48:14Z  (17:48 en Colombia)
lastDeployment=dpl_Hb4wSAoLqs6kPcykB64bFYk2tS4x  (el deployment anterior al arreglo)
```

### Causa

`DATABASE_URL` apuntaba al pooler de Supabase en **modo sesión** (puerto `5432`). Ese modo reserva una
conexión real por cliente y el proyecto admite 15. Cada instancia de Vercel abría un pool de 5, así
que al segundo o tercer arranque en frío se agotaba el cupo y cualquier consulta fallaba: la lectura
de la sesión, el login demo y el render del checkout, que consulta la cuenta para prellenar los datos.

### Corrección

- `DATABASE_URL` pasa al pooler en **modo transacción** (puerto `6543`), que comparte las conexiones
  entre consultas.
- El pool por instancia baja a 2 conexiones, con `allowExitOnIdle` y un manejador de errores para
  clientes que el servidor cierra en reposo.
- Se reintenta una sola vez y solo cuando falla **conseguir** la conexión (cupo agotado, DNS,
  conexión rechazada). Una consulta que ya llegó a la base nunca se repite.
- `/api/account/me` responde 503 si no puede leer la sesión y el panel muestra el aviso con
  **Reintentar** (`05-panel-cuenta-sin-conexion.png`), en lugar de mostrar el formulario de acceso.
- `/checkout` continúa como invitado si falla la lectura de la sesión, en vez de romper la página.
- `lib/auth.ts` separa `readCurrentUser()` de `getCurrentUser()` para que `connection()` quede fuera
  de los `try` y no capture la señal de prerenderizado de Next 16.

### Verificación

- **Local, con la base inalcanzable a propósito** (puerto `6544`): `/api/account/me` con sesión
  devuelve `503` y `{"user":null,"unavailable":true}`; el panel muestra el aviso con reintento;
  `/checkout` responde `200` y sigue como invitado.
- **Local, con la base real**: 45 peticiones concurrentes a `/api/account/me`, `/checkout` y
  `/carrito` con sesión → todas `200`.
- **Producción, deployment `dpl_2wyMD3RFLiWkUWNNZEqXnzHs7ze8`** (commit `793d096`, listo a las
  17:56 de Colombia): dos rondas de 100 peticiones concurrentes sobre `/api/account/me`, `/checkout`,
  `/carrito`, `/productos` y `/productos/basica-hueso` → `100/100` y `100/100` en `200`; las 40
  lecturas de sesión devolvieron `demo@kmizs.test`; la petición más lenta tardó 1,7 s (instancia en
  frío).
- `get_runtime_errors` no registra ningún `EMAXCONNSESSION` posterior a las 17:48; el último error
  pertenece al deployment anterior al arreglo.
- `/cuenta` y `/cuenta/pedidos` cargan con la sesión demo y muestran el nombre y el historial vacío.

---

## 7. De "por confirmar" a "confirmado" (23 de noviembre)

### Problema observado

El historial mostraba "Pendiente de confirmación" para todo pedido recién creado, también para la
contraentrega, que no tiene pago en línea que lo mueva de estado. El cron de vencimiento agravaba el
caso: cancelaba cualquier pedido `pending` o `in_process` de más de 72 horas sin distinguir el medio
de pago. El pedido de contraentrega `KM-4D3F4E57-…` (19 nov) fue cancelado automáticamente el 22 de
noviembre a las 09:00 UTC y se le devolvió el stock, aunque era una venta válida que se cobra al
entregar.

### Decisión

La opción elegida fue que **la contraentrega nazca confirmada**: no hay pago que esperar y nadie debe
revisarla a mano. Se conserva el estado `pending` para Mercado Pago, que sí espera el webhook.

### Cambios aplicados

- Migración `20261123000000_sprint4_order_confirmed.sql`: `confirmed` en el enum `order_status`.
- Migración `20261123000100_sprint4_contraentrega_confirmada.sql`: `place_order` graba `confirmed`
  cuando `p_payment_method = 'cash_on_delivery'`; `release_expired_orders` filtra solo
  `payment_method = 'mercado_pago'`; los pedidos de contraentrega que seguían `pending` pasaron a
  `confirmed`.
- `lib/orders.ts`, `lib/order-status.ts` y `app/cuenta/page.tsx`: nuevo estado, etiqueta verde
  "Pedido confirmado" y contador "Confirmados" que suma `approved` y `confirmed`.
- Correos, WhatsApp y pantalla de gracias: la contraentrega ya no pide "confirmar" el pedido, sino
  coordinar la entrega. El botón dice **Coordinar entrega por WhatsApp**.
- "Por confirmar" pasó a "Total por cotizar" / "Por cotizar" cuando el envío aún no tiene tarifa,
  para que no se confunda con un estado pendiente.

### Verificación en la base

`node --no-warnings --env-file=.env.local scripts/verify-schema.ts` → 13/13 correctos, incluido el
nuevo "contraentrega nace confirmada · {"status":"confirmed"}". Consulta directa al proyecto remoto:

```
enum: pending, in_process, approved, rejected, cancelled, refunded, confirmed
cron solo Mercado Pago: true
contraentrega que el cron podria cancelar: 0
```

| Pedido                                  | Medio          | Estado antes | Estado después |
| --------------------------------------- | -------------- | ------------ | -------------- |
| `KM-6681B860-8067-4FC1-95BD-2ABB48533281` | Contraentrega  | `pending`    | `confirmed`    |
| `KM-6A25BB89-DA14-4984-A960-3F67D2F75B29` | Mercado Pago   | `pending`    | `pending`      |

### Verificación en la interfaz

Con el build de producción local (`npm run start`, porque `next dev` se detiene con el aviso de
seguridad de Next 16.4.3), sesión demo y un pedido de contraentrega de una prenda:

- Pedido creado: `KM-05A92260-5308-4B53-8D76-F6D78420430C` (Básica Tinta M, $79.900).
- `/checkout/gracias`: "Tu pedido quedó confirmado. Coordina la entrega por WhatsApp…" y enlace
  `https://wa.me/573150196386?text=Hola%2C%20quiero%20coordinar%20la%20entrega%20del%20pedido%20…`.
- `/cuenta/pedidos`: el pedido nuevo y `KM-6681B860…` muestran **PEDIDO CONFIRMADO**; el de Mercado
  Pago sigue **PENDIENTE DE CONFIRMACIÓN**.
- `/cuenta`: "Confirmados 2" y "Último pedido: KM-05A92260… · pedido confirmado".
- `06-pedidos-confirmados-movil.png` y `07-gracias-contraentrega-movil.png`: capturas a 390 px.
- Producción (`https://tienda-kmizs.vercel.app`, deployment `dpl_EMUqre6tS4NbXLiwxg3Fiesej3ep`,
  commit `7148a15`): con la sesión demo, `/cuenta/pedidos` muestra **PEDIDO CONFIRMADO** en los dos
  pedidos de contraentrega y **PENDIENTE DE CONFIRMACIÓN** en el de Mercado Pago.

Nota: el entorno local tiene `SHIPPING_RATES_CONFIRMED=false`, por eso el pedido de prueba muestra
"Total por cotizar" y "falta cotizar el envío a tu municipio". En producción las tarifas sí están
configuradas y el pedido muestra el total con el envío aplicado.

`npm run typecheck`, `npm run lint` y `npm run build` (segunda pasada, por el aviso de seguridad)
terminan sin errores.
