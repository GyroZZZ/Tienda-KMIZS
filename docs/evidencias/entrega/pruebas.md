# Pruebas · Ensayo de la sustentación

**Fecha:** 24 de noviembre de 2026 · **Entorno:** build de producción local (`npm run start`) sobre la
base real de Supabase · **Viewport:** 390 × 844 px

Ensayo del flujo que el docente puede probar por su cuenta el día de la entrega: registro de cliente,
variaciones de talla y color, envío gratis por 2 prendas, cupón, confirmación e historial.

## 1. Caso ejecutado

| Paso | Acción | Resultado |
| ---- | ------ | --------- |
| 1 | Registro con nombre, correo y contraseña | Cuenta `entrega.final@example.com` creada; sesión iniciada sin enlace mágico |
| 2 | Básica Tinta, talla M, color Tinta → carrito | Línea añadida con la variación elegida |
| 3 | Básica Hueso, talla M, color Hueso → carrito | 2 prendas; carrito muestra **Envío gratis por 2 o más prendas** |
| 4 | Cupón `PRIMERA10` en `/checkout` | 10 % sobre el subtotal: $159.800 − $15.980 |
| 5 | Contraentrega + datos de entrega + autorización de datos | Pedido `KM-21BD6AD0-65F7-4607-B772-9DD600775827` |
| 6 | `/checkout/gracias` | "Tu pedido quedó confirmado", enlace **Coordinar entrega por WhatsApp**, resumen con descuento |
| 7 | `/cuenta/pedidos` | Badge verde **PEDIDO CONFIRMADO** y total $143.820 |
| 8 | Consulta SQL al pedido | `confirmed`, `cash_on_delivery`, envío 0, cupón registrado y no liberado |

## 2. Fila verificada en la base

```json
{
  "code": "KM-21BD6AD0-65F7-4607-B772-9DD600775827",
  "status": "confirmed",
  "payment_method": "cash_on_delivery",
  "subtotal": 159800,
  "discount": 15980,
  "shipping": 0,
  "total": 143820,
  "coupon_code": "PRIMERA10",
  "customer_email": "entrega.final@example.com",
  "items": ["Básica Hueso · Hueso · M · x1", "Básica Tinta · Tinta · M · x1"]
}
```

El canje de `PRIMERA10` quedó con `released_at = null`: el descuento sigue consumido por ese pedido.

## 3. Capturas

| Archivo | Contenido |
| ------- | --------- |
| `01-registro.png` | Formulario de alta de cliente: nombre, correo y contraseña |
| `02-carrito-envio-gratis.png` | 2 prendas y regla de envío gratis aplicada |
| `03-checkout-cupon.png` | Checkout con `PRIMERA10` aplicado, contraentrega y datos de entrega |
| `04-confirmacion.png` | Página de gracias con pedido confirmado y enlace de WhatsApp |
| `05-historial-confirmado.png` | Historial de la cuenta con el badge "Pedido confirmado" |
| `06-privacidad-whatsapp.png` | Política de privacidad con el número **+57 315 019 6386** |

## 4. Límites de este ensayo

- Se ejecutó contra el build local porque en ese momento el despliegue de producción aún no incluía la
  corrección del número de WhatsApp en las políticas. Tras fusionar el PR #45, el deployment
  `dpl_68SBb8t6X98KDLsksQkWqZ1479Pr` quedó `READY` y `/politicas/privacidad` en producción contiene
  **+57 315 019 6386** y ya no contiene el número anterior. Los datos son los mismos (base remota de
  Supabase).
- En local `SHIPPING_RATES_CONFIRMED=false`, por lo que Mercado Pago aparece deshabilitado en el
  checkout. En producción está habilitado y la ruta aprobada quedó verificada en
  [`../e5/pruebas.md`](../e5/pruebas.md) y en
  [`../../mercado-pago-sandbox.md`](../../mercado-pago-sandbox.md). Para la sustentación no hace falta
  hacer un cobro real.
- El pedido de prueba y la cuenta creada quedan en la base como evidencia; no se borraron.

## 5. Verificación general

- `npm run typecheck`, `npm run lint` y `npm run build` (segunda pasada por el aviso de seguridad de
  Next 16.4.3) terminan sin errores.
- Los ocho pasos del ensayo terminaron como se esperaba; no aparecieron errores de sesión ni de base.
