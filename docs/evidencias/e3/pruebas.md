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

- **Producción:** el cambio queda visible cuando se despliegue el merge en Vercel.
- **Resend:** sin credenciales, el pedido real sigue devolviendo 503 en local. Es la misma
  limitación documentada en E4 y se resuelve en la subtarea 3 del sprint.
- **Tarifas de una sola prenda:** siguen siendo de referencia hasta confirmar con la transportadora.
- **Margen:** la provisión de $1.590 por prenda quedó desactualizada. El impacto estimado
  (margen 46–54% según mezcla) está documentado en `docs/catalogo.md` y requiere decisión.
