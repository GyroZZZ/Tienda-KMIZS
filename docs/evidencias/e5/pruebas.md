# Pruebas · Sprint 4

**Fecha:** 19 de noviembre de 2026 · **Sitio:** https://tienda-kmizs.vercel.app
**Base:** Supabase `ydaekcscnyloqfzzwmzb` · **Despliegue:** `main` (`03225b7`)

> Evidencia de la compra real sobre el deployment de producción, con credenciales de prueba de
> Mercado Pago. No se movió dinero: el pago va a la cuenta de prueba del vendedor.

---

## 1. Capturas

| Archivo | Qué muestra |
| ------- | ----------- |
| `01-checkout-cupon-contraentrega.png` | Checkout con 2 prendas, envío gratis y `PRIMERA10` aplicado |
| `02-pedido-registrado-contraentrega.png` | Pedido `KM-4D3F4E57-…`, total $143.820 y enlace de WhatsApp |
| `03-checkout-mercado-pago.png` | Checkout con pago digital seleccionado |
| `04-pago-aprobado-mercado-pago.png` | `/checkout/resultado` con "Pago aprobado" y código de pedido |

---

## 2. Casos ejecutados

| # | Caso | Pedido | Resultado |
| - | ---- | ------ | --------- |
| 1 | Contraentrega + cupón, 2 prendas | `KM-4D3F4E57-D01C-4536-8FA0-12597AB2F077` | Subtotal $159.800, descuento $15.980, envío gratis, total $143.820. Estado `pending`, `user_id` nulo |
| 2 | Registro de cuenta con ese correo | `camila.restrepo@example.com` | La cuenta se creó y reclamó el pedido de invitado: `/cuenta` muestra 1 pedido y el último código |
| 3 | Mercado Pago aprobado (Mastercard …3564) | `KM-9514564A-4BDF-45A0-AFFE-94ED19D0E834` | `approved`, `payment_id=190592168556`, 2 × Básica Hueso M, total $159.800 |
| 4 | Webhooks duplicados | mismo pedido 3 | Tres `POST /api/payments/webhook` en los logs; una sola fila, un solo estado |
| 5 | Mercado Pago rechazado (Visa …6260) | `KM-9C8FAB2C-249B-419B-8167-2C8B5EB6D3C1` | Pago `189505679217` rechazado; `/api/payments/status` marcó `rejected` y devolvió stock (`stock_released_at` presente) |
| 6 | Mercado Pago pendiente (Visa Débito …1904) | `KM-1FF21BE3-53E4-4655-94E6-7BF55AFE6EE5` | `pending` con stock retenido, sin `payment_id` conocido hasta la confirmación |
| 7 | Sin sesión en `/cuenta` | — | `307` a `/cuenta/ingresar` (antes devolvía 200 con el shell de error) |
| 8 | Correos de notificación | 4 pedidos | Los cuatro llegaron a `kmizs@protonmail.com` con estado `delivered` |
| 9 | Sitemap y robots | — | `/sitemap.xml` y `/robots.txt` responden 200 y contienen las rutas esperadas |
| 10 | Cron de vencimiento | — | Sin `Authorization` → 401; con `CRON_SECRET` → 200 `{"released":0}` |

---

## 3. Verificación en la base

```json
{
  "pedido": "KM-4D3F4E57-D01C-4536-8FA0-12597AB2F077",
  "estado": "pending",
  "pago": "cash_on_delivery",
  "subtotal": 159800,
  "descuento": 15980,
  "envio": 0,
  "total": 143820,
  "cupon": "PRIMERA10",
  "canje": { "correo": "camila.restrepo@example.com", "liberado": null },
  "stock_basica_tinta_M": 8
}
```

```json
{
  "pedido": "KM-9514564A-4BDF-45A0-AFFE-94ED19D0E834",
  "estado": "approved",
  "pago": "mercado_pago",
  "payment_id": "190592168556",
  "total": 159800
}
```

```json
{
  "pedido": "KM-9C8FAB2C-249B-419B-8167-2C8B5EB6D3C1",
  "estado": "rejected",
  "payment_id": "189505679217",
  "stock_released_at": "2026-11-19T21:48:06.070Z"
}
```

Los datos iniciales siguen siendo 10 productos, 14 colores, 40 tallas, 4 cupones y 281 unidades de
stock antes de las pruebas. Cada compra descontó las unidades correspondientes; el rechazo las devolvió.

---

## 4. Hallazgos y correcciones

| Hallazgo | Acción |
| -------- | ------ |
| `/cuenta` sin sesión devolvía 200 con el error boundary; el navegador acababa redirigiendo por el payload de React | `proxy.ts` redirige antes de renderizar. Verificado 307 en local y producción (PR #29) |
| "Entrega en Bogotá D.C., Bogotá D.C.." | Se quita el punto duplicado al construir la ciudad |
| El checkout sandbox de MP falla en navegador headless | No afecta a las personas: usan su navegador normal. Documentado en la guía de sandbox |
| La opción "Sin cuenta" de MP termina en `/fatal/` con la cuenta automática | La guía indica entrar con la cuenta de comprador de prueba y usar las tarjetas sembradas |
| El webhook no llegó en el caso rechazado | El fallback `/api/payments/status` corrigió el estado; está previsto precisamente para eso |

---

## 5. Repetir las pruebas

1. Abrir la tienda y agregar 2 prendas (envío gratis).
2. En el checkout, elegir **Mercado Pago** e ingresar con el comprador de prueba indicado en
   [`docs/mercado-pago-sandbox.md`](../../mercado-pago-sandbox.md).
3. Elegir una tarjeta sembrada, CVV `123`, **Pagar**.
4. Comprobar el pedido en `/cuenta/pedidos` (si se compró con sesión) o con:

```sql
select code, status, payment_id, total, stock_released_at
  from public.orders order by created_at desc limit 5;
```

Cada compra de prueba descuenta stock. Para devolver el inventario después de la demostración:

```sql
-- Ver pedidos que retienen stock
select code, customer_email, status, created_at
  from public.orders
 where stock_released_at is null
 order by created_at desc;

-- Cancelar uno y devolver sus unidades
select public.settle_payment('KM-…', null, 'cancelled');
```

El cron diario también cancela los pedidos pendientes de más de 72 horas y libera el stock.
