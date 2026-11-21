# Analítica y visibilidad

**Tarjeta:** `[E6-E8] Atender y medir` · **Sprint:** 4 (18 – 23 nov 2026)
**Sitio:** https://tienda-kmizs.vercel.app
**Responsable:** Jesús Bohorques · **Revisor:** Horacio Campillo

> Lo que se mide, dónde se ve y qué falta. Nada de esto envía datos personales: los eventos llevan nombre de producto, cantidad y valor, nunca correo, teléfono o dirección.

---

## 1. Herramientas

| Herramienta             | Para qué                                          | Estado                         |
| ----------------------- | ------------------------------------------------- | ------------------------------ |
| Vercel Web Analytics    | Visitas, páginas vistas y eventos del embudo      | Activo                         |
| Pixel de Meta           | Campañas y público de remarketing                 | Instalado, apagado sin ID      |
| Google Search Console   | Indexación y consultas de búsqueda                | Verificación pendiente         |
| JSON-LD de producto     | Precio y disponibilidad en resultados de búsqueda | Activo                         |

No hay Google Analytics 4 ni Tag Manager. Para un proyecto con tráfico de prueba, dos herramientas bastan y evitan duplicar conteos.

---

## 2. Vercel Web Analytics

Se monta una sola vez en `app/layout.tsx` con `<Analytics />` de `@vercel/analytics/next`. No usa cookies y no requiere consentimiento porque no identifica personas.

Mide:

- Visitas y páginas vistas por ruta.
- Referidores y países.
- Los cuatro eventos del embudo (tabla siguiente).
- Core Web Vitals reales de las visitas.

Dónde verlo: panel de Vercel → proyecto `tienda-kmizs` → **Analytics**. Los eventos aparecen en la pestaña **Events** con el nombre exacto (`view_item`, `add_to_cart`, `initiate_checkout`, `purchase`, `whatsapp_click`). Vercel guarda también los parámetros `utm_*` de la visita y los adjunta a cada evento.

---

## 3. Eventos del embudo

| Evento              | Cuándo se dispara                                        | Archivo                                  | Datos                                                                 |
| ------------------- | -------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| `view_item`         | Al abrir una ficha de producto                           | `components/analytics/ProductViewTracker.tsx` | `content_ids` (slug), `content_name`, `value` (precio)                |
| `add_to_cart`       | Al agregar una talla con stock al carrito                | `components/cart/AddToCart.tsx`          | `content_ids`, `content_name`, `value`, `num_items`                   |
| `initiate_checkout` | Al enviar el formulario de checkout con datos válidos    | `components/checkout/CheckoutForm.tsx`   | valor del pedido, cantidad de prendas                                 |
| `purchase`          | Al ver la página de gracias con un pedido en la URL      | `components/checkout/OrderThankYou.tsx`  | `value` (total), `content_ids`, `num_items`                           |
| `whatsapp_click`    | Al pulsar el botón flotante de WhatsApp                  | `components/layout/WhatsAppButton.tsx`   | `content_name` (`boton_flotante`) y los cuatro parámetros UTM         |

`lib/analytics.ts` envía cada evento a `fbq` (Meta) y a `va` (Vercel) si están disponibles en la ventana. Si el pixel no se cargó, el evento solo queda en Vercel. El clic de WhatsApp se registra en Meta con el nombre estándar `Contact`.

### Compra contada una sola vez

`purchase` guarda una marca en `sessionStorage` con el código del pedido (`kmizs:compra-contada:KM-…`). Recargar la página de gracias no vuelve a contar la misma compra. Si el navegador bloquea el almacenamiento, se cuenta una vez por montaje y se acepta.

---

## 3.1 Convención de UTMs

Todos los enlaces que publique el equipo siguen esta tabla. Se escriben siempre en minúsculas, con guion bajo en lugar de espacios y con los mismos valores para toda una campaña.

| Parámetro      | Valores aceptados                                             | Para qué sirve                                      |
| -------------- | ------------------------------------------------------------- | --------------------------------------------------- |
| `utm_source`   | `web`, `instagram`, `tiktok`, `whatsapp`, `email`              | Quién trae la visita                                |
| `utm_medium`   | `referral`, `social`, `paid_social`, `email`                   | Tipo de canal                                       |
| `utm_campaign` | `contacto`, `lanzamiento_s4`, `primera_compra`, `prueba_qa`    | Iniciativa a la que pertenece el enlace             |
| `utm_content`  | `boton_flotante`, `bio`, `historia`, `reel`, `checkout`        | Pieza o ubicación exacta dentro del canal           |
| `utm_term`     | Solo cuando haya una palabra clave concreta                    | Opcional; no se usa en enlaces orgánicos            |

### Enlaces de referencia

```
# Botón flotante de WhatsApp (en components/layout/WhatsAppButton.tsx)
https://wa.me/573150196386?text=...&utm_source=web&utm_medium=referral&utm_campaign=contacto&utm_content=boton_flotante

# Bio de Instagram
https://tienda-kmizs.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=lanzamiento_s4&utm_content=bio

# Historia de TikTok con el cupón de primera compra
https://tienda-kmizs.vercel.app/?utm_source=tiktok&utm_medium=social&utm_campaign=primera_compra&utm_content=historia
```

`wa.me` está fuera del sitio, así que esos parámetros no aparecen como pageview en Vercel. Por eso el botón también dispara el evento `whatsapp_click` con los mismos cuatro UTMs: ahí sí se puede contar y filtrar en Analytics → Events.

---

## 4. Consentimiento

El aviso aparece en la primera visita y ofrece dos opciones: **Aceptar** o **Solo lo necesario**.

- La decisión se guarda en `localStorage` con la llave `kmizs-consent-v1`.
- El pixel de Meta **solo se descarga** si la decisión es `granted`. Sin aceptación no se pide ningún recurso a `connect.facebook.net`.
- Los eventos del embudo se siguen enviando a Vercel, que no usa cookies.
- En el pie hay **Preferencias de cookies**, que borra la decisión y vuelve a mostrar el aviso.

El estado vive en `components/analytics/consent-store.ts` y se lee con `useSyncExternalStore`, así el aviso y el pixel cambian al mismo tiempo.

---

## 5. Pixel de Meta

El código está listo en `components/analytics/MetaPixel.tsx` y se activa con la variable `NEXT_PUBLIC_META_PIXEL_ID`.

**Hoy está apagado**: falta el identificador del pixel del proyecto. Mientras no exista, el componente no se renderiza y no se envía nada a Meta. Cuando se cree el pixel en Business Manager:

1. Guardar el ID en Vercel (producción y preview) como `NEXT_PUBLIC_META_PIXEL_ID`.
2. Volver a desplegar.
3. Verificar con la extensión **Meta Pixel Helper** que `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout` y `Purchase` lleguen.

El evento propio `view_item` se traduce a `ViewContent` en el pixel; `add_to_cart` a `AddToCart`; `initiate_checkout` a `InitiateCheckout`; `purchase` a `Purchase`; y `whatsapp_click` a `Contact`.

---

## 6. SEO

### Sitemap y robots

- `app/sitemap.ts` genera `/sitemap.xml` con la portada, el catálogo, las políticas, las preguntas frecuentes y una entrada por producto. Las rutas de cuenta, carrito, checkout y API quedan fuera.
- `app/robots.ts` genera `/robots.txt` y bloquea `/api/`, `/cuenta/`, `/checkout/` y `/carrito`.

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /cuenta/
Disallow: /checkout/
Disallow: /carrito

Host: https://tienda-kmizs.vercel.app
Sitemap: https://tienda-kmizs.vercel.app/sitemap.xml
```

### Datos estructurados

Cada ficha de producto incluye JSON-LD `Product` con nombre, descripción, imagen, marca, SKU (slug), precio en COP y disponibilidad según el stock real de la base. Es lo que permite que Google muestre precio y «disponible» en el resultado.

### Search Console

1. Agregar la propiedad de tipo **Prefijo de URL**: `https://tienda-kmizs.vercel.app/`.
2. Verificar con la etiqueta HTML: guardar el código en `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` y desplegar.
3. Enviar `https://tienda-kmizs.vercel.app/sitemap.xml`.
4. Revisar en una semana: páginas indexadas, consultas y errores de cobertura.

**Estado:** pendiente de acceso a la cuenta de Search Console del equipo.

---

## 7. Qué revisar cada semana

| Pregunta                                          | Dónde                                             |
| ------------------------------------------------- | ------------------------------------------------- |
| ¿Cuántas visitas y de dónde llegan?               | Vercel Analytics → Visits                         |
| ¿Qué productos se ven y cuáles se agregan?        | Vercel Analytics → Events (`view_item`, `add_to_cart`) |
| ¿Cuántos carritos llegan al checkout?             | Events (`initiate_checkout`)                      |
| ¿Cuántas compras se cierran?                      | Events (`purchase`) y tabla `orders`              |
| ¿Cuántos contactos por WhatsApp se generan?       | Events (`whatsapp_click`), filtrable por `utm_content` |
| ¿Qué campaña trae cada visita?                    | Analytics → Visits, agrupado por UTM (`utm_source`, `utm_campaign`) |
| ¿Qué cupón se está usando?                        | SQL en `docs/base-de-datos.md`, sección 5         |
| ¿Qué páginas indexó Google?                       | Search Console → Indexación                       |

La tasa de conversión del embudo se calcula con los eventos, no con pedidos inventados: `purchase / initiate_checkout` y `add_to_cart / view_item`.

---

## 8. Límites conocidos

- **Sin eventos de servidor.** Si alguien bloquea JavaScript o un bloqueador de anuncios, la visita no se cuenta. Los pedidos sí quedan en la base.
- **Pixel apagado.** Sin `NEXT_PUBLIC_META_PIXEL_ID` no hay datos de Meta; el resto de la medición funciona igual.
- **Muestra pequeña.** Con tráfico de prueba, los porcentajes se mueven mucho; se leen como tendencia, no como verdad estadística.
- **Atribución hasta la visita, no hasta el pedido.** Vercel captura los `utm_*` de la navegación y del evento `whatsapp_click`, pero no se guardan en `orders`. Para campañas pagas habría que persistirlos en la fila del pedido y cerrar así el círculo.
- **Los UTMs del botón viven en `wa.me`.** El enlace los lleva para que el mensaje sea trazable; el conteo real se hace con el evento `whatsapp_click`, que sí llega a Vercel.

---

## 9. Evidencia

Las comprobaciones de este sprint están en [`docs/evidencias/e6/pruebas.md`](evidencias/e6/pruebas.md): enlace del botón con UTMs, evento `whatsapp_click` y vista del panel de Vercel Analytics.
