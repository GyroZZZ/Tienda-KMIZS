# Diapositivas de sustentación · KMIZS

**Límite del grupo:** 10 minutos de exposición.
**La demostración no se hace en vivo:** el docente entra a https://tienda-kmizs.vercel.app y prueba la
tienda por su cuenta, antes o después de la exposición. Por eso **todo lo evaluable queda escrito en
las diapositivas**; las notas del orador solo amplían lo que ya está en pantalla.

**Formato:** 10 diapositivas · ~9 minutos de voz · ~1 minuto de margen para preguntas o transición.

---

## 0. Reparto del tiempo y cobertura del PDF

| # | Diapositiva | Tiempo | Qué pide el PDF |
| - | ----------- | ------ | --------------- |
| 1 | Portada | 0:20 | Entregable |
| 2 | Idea de negocio | 1:00 | Idea de negocio |
| 3 | Clientes y captación | 0:50 | Clientes · multicanalidad |
| 4 | Métodos de pago y seguridad | 1:20 | Métodos de pago · requisitos legales y seguridad |
| 5 | Adaptación del CMS | 1:00 | Adaptación de CMS |
| 6 | SEO y SEM | 0:50 | SEO / SEM |
| 7 | Analítica e impacto | 0:50 | Análisis de impacto |
| 8 | Inconvenientes, retos y soluciones (1/2) | 1:00 | Inconvenientes, retos y soluciones |
| 9 | Inconvenientes, retos y soluciones (2/2) | 1:00 | Inconvenientes, retos y soluciones |
| 10 | Alcance, límites y cómo probar la tienda | 1:00 | Alcance y cambios · entregable |

Si el docente pide **una sola diapositiva**, se muestran la 2 y la 4 y el resto se entrega como anexo
impreso de este mismo documento.

---

## Diapositiva 1 · Portada

**En pantalla**

> # KMIZS
> ### Camisetas que se leen como se pronuncian
>
> Tienda de camisetas básicas, gráficas y personalizadas · Diseñadas e impresas en Colombia
>
> **https://tienda-kmizs.vercel.app**
>
> Comercio Electrónico · Universidad de Cartagena · Noviembre de 2026

**Notas (0:20).** «Somos KMIZS, una tienda académica de camisetas. El enlace está en pantalla: pueden
entrar cuando quieran, sin registro, y probar el flujo completo.»

---

## Diapositiva 2 · Idea de negocio

**En pantalla**

**Qué vendemos**

- Camisetas **básicas**, **gráficas** y **personalizadas** en algodón pesado.
- Diseño e impresión en Colombia; catálogo corto y variaciones reales de talla y color.

**Propuesta de valor**

- **Envío gratis desde 2 prendas** y en pedidos personalizados, de equipo o de evento.
- Precio claro en pesos, sin costos sorpresa: el envío se muestra en el carrito.
- Compra sin cuenta obligatoria (contraentrega) y pago en línea opcional.

**Alcance honesto**

- Proyecto del curso de Comercio Electrónico, **no una empresa constituida**.
- Sin testimonios ni ventas inventadas: las cifras que mostramos salen de nuestras pruebas.

**Notas (1:00).** Explicar el nombre y el público. Aclarar que el catálogo es corto a propósito: se
prefiere controlar inventario y variaciones antes que aparentar un catálogo grande.

---

## Diapositiva 3 · Clientes y captación multicanal

**En pantalla**

**A quién le vendemos**

- Jóvenes de 18 a 30 años que buscan prendas de algodón pesado y diseño sobrio.
- Equipos, eventos y marcas pequeñas que necesitan camisetas a juego.

**Canales activos**

| Canal | Cómo funciona |
| ----- | ------------- |
| Sitio web | Catálogo, carrito, checkout y cuenta; público y sin instalar nada |
| WhatsApp **+57 315 019 6386** | Botón flotante con mensaje prellenado; evento `whatsapp_click`; 4 parámetros UTM |
| Correo `kmizs@protonmail.com` | Recibe el detalle de cada pedido y atiende cambios o garantías |

**Pendiente declarado**

- Perfiles de redes sociales y piezas de contenido: **no están publicados** (tarjeta `[E5] Atraer
  visitas`, 5/8). No se presentan como hechos.

**Notas (0:50).** El WhatsApp y el correo salen de una sola fuente (`lib/site.ts`), así que no pueden
quedar desincronizados entre la tienda y las políticas. La captación orgánica quedó preparada, no
ejecutada.

---

## Diapositiva 4 · Métodos de pago y seguridad

**En pantalla**

**Solo dos medios**

| Medio | Cómo funciona | Seguridad |
| ----- | ------------- | --------- |
| **Contraentrega** | El pedido queda **confirmado al registrarse**; se paga al recibir | No se piden ni se guardan datos de tarjeta |
| **Mercado Pago** | Se crea la preferencia y el pago ocurre en el checkout de la pasarela | **Sandbox permanente**, firma `x-signature` HMAC-SHA256, idempotencia por `code` y `payment_id` |

**Protección de datos y legalidad**

- Autorización de tratamiento de datos en el checkout; política pública basada en la **Ley 1581 de
  2012** y los Decretos **1377 de 2013** y **1074 de 2015**.
- La tienda **nunca** ve ni almacena el número de tarjeta: se digita en el dominio de Mercado Pago.
- Webhook firmado y verificado en tiempo constante; un pago repetido no duplica el pedido.

**Decisión del proyecto**

- No se hizo ningún cobro real. Mercado Pago queda en modo `test` de forma permanente.
- Las políticas son documentos académicos: **no pasaron por revisión de un abogado**.

**Notas (1:20).** Recalcar la diferencia: contraentrega confirma de inmediato y no expone datos; en
Mercado Pago la seguridad es de la pasarela más la firma del webhook. Si preguntan por producción,
decir que activarla exigiría credenciales propias y revisión legal.

---

## Diapositiva 5 · Adaptación del CMS

**En pantalla**

**No usamos Shopify ni WordPress**

| Pieza | Implementación |
| ----- | -------------- |
| Fuente de verdad | **PostgreSQL en Supabase**: productos, variantes, pedidos, cupones |
| Administración | **Supabase Studio** + SQL; sin panel administrativo propio |
| Lectura del catálogo | Caché de 1 minuto con etiqueta `catalog`; se invalida al cambiar datos |
| Cuentas de cliente | Propias: hash **scrypt** y cookie firmada con HMAC, 30 días |
| Autenticación | Sin Supabase Auth ni enlace mágico |

**Por qué es una adaptación y no una carencia**

- El CMS se adaptó al alcance del curso: una sola fuente de verdad, consultas auditables y cero
  mantenimiento de un panel propio.
- Lo que un panel daría (altas, precios, stock) se hace con SQL revisado y queda en el historial de
  migraciones del repositorio.

**Notas (1:00).** Si preguntan cómo se sube un producto, mostrar el ejemplo de `base-de-datos.md` §8:
un `insert` en `products` y `product_variants`. La decisión fue explícita, no un olvido.

---

## Diapositiva 6 · SEO y SEM

**En pantalla**

**SEO técnico implementado**

- `sitemap.xml` y `robots.txt` publicados.
- Metadatos propios por página (título, descripción, Open Graph).
- **JSON-LD `Product`** con precio, moneda y disponibilidad **reales** de la base.
- URLs legibles (`/productos/basica-tinta`) y una sola intención por página.

**Lo que no se hizo, y por qué**

| Tema | Estado real |
| ---- | ----------- |
| Search Console | **Pendiente**: falta acceso a la cuenta del equipo; los pasos están documentados y la propiedad no está verificada |
| SEM (pauta paga) | **No se ejecutó**: no hay presupuesto ni cuenta publicitaria |
| Medición de campañas | Convención UTM de 4 parámetros lista, sin clics ni conversiones que reportar |

**Notas (0:50).** No inflar el SEO: hay fundamentos técnicos correctos, pero sin Search Console no se
puede afirmar posicionamiento. Preferimos declarar el pendiente antes que inventar métricas.

---

## Diapositiva 7 · Analítica e impacto

**En pantalla**

**Herramienta:** Vercel Analytics (la alternativa que permite el PDF).

| Evento | Cuándo se dispara |
| ------ | ----------------- |
| `view_item` | Se abre la ficha de un producto |
| `add_to_cart` | Se agrega una variante al carrito |
| `initiate_checkout` | Se entra al checkout |
| `purchase` | El pedido queda registrado |
| `whatsapp_click` | Se usa el botón de WhatsApp, con UTMs |

**Gobierno del dato**

- Consentimiento de cookies documentado; el pixel de Meta está **apagado** hasta contar con
  `NEXT_PUBLIC_META_PIXEL_ID`.
- El panel de Vercel exige inicio de sesión: se dejaron comandos `vc metrics` para reproducir cifras.

**Impacto: lo que se puede y no se puede afirmar**

- El embudo se lee como **tendencia**, no como resultado comercial.
- Con tráfico de prueba **no hay muestra suficiente** para hablar de conversión ni de retorno.

**Notas (0:50).** Ser explícito: un evento registrado no es una venta. La medición quedó instrumentada
y auditable; la conclusión de impacto queda abierta.

---

## Diapositiva 8 · Inconvenientes, retos y soluciones (1/2)

**En pantalla**

| Inconveniente (con evidencia) | Reto | Solución aplicada |
| ----------------------------- | ---- | ----------------- |
| **106 errores `EMAXCONNSESSION`** entre el 19 y el 21 de noviembre | El pooler en modo sesión agotaba las 15 conexiones disponibles | Pooler de **transacción** (puerto 6543), pool de 2 y un reintento; prueba de **200/200** peticiones concurrentes |
| El **webhook de Mercado Pago no llegaba** con la cuenta automática de pruebas | Pedidos estancados en `pending` aunque el pago existía | Consulta a `/api/payments/status` además del webhook firmado |
| La contraentrega nacía **"por confirmar"** y el cron la cancelaba a las 72 h | Estado engañoso y ventas perdidas | La contraentrega nace **`confirmed`**; el cron solo expira pedidos de Mercado Pago |

**Notas (1:00).** Cada fila se detectó con evidencia: logs de Vercel, revisión de la tabla `orders` y
pruebas de carga. No son correcciones preventivas: son fallos que ocurrieron y quedaron cerrados.

---

## Diapositiva 9 · Inconvenientes, retos y soluciones (2/2)

**En pantalla**

| Inconveniente (con evidencia) | Reto | Solución aplicada |
| ----------------------------- | ---- | ----------------- |
| `Date.now()` rompía el prerender de **`/cuenta`** | Error al navegar y al prefetch de los enlaces | `connection()` fuera del `try` y `prefetch={false}` en el panel |
| El **WhatsApp viejo** seguía en tres textos legales | Datos de contacto contradictorios frente a la tienda | Una sola fuente (`lib/site.ts`) interpolada en las políticas; se eliminó el número anterior |
| Las **imágenes lifestyle no mostraban el logo** | Las prendas no se reconocían como del catálogo | Regeneración con wordmark `KMIZS` y estampados rojo/negro; prompts en `recursos-visuales.md` |

**Notas (1:00).** Cerrar con la idea: los tres son de coherencia, no de funcionalidad. Un sitio puede
funcionar y aun así contradecirse; eso también se prueba.

---

## Diapositiva 10 · Alcance, límites y cómo probar la tienda

**En pantalla**

**Cambios de alcance documentados**

- PR **#40 a #44** con motivo y evidencia en `docs/cambios-post-entrega.md`: estado `confirmed`,
  filtro del cron, portada nueva con 5 imágenes, WhatsApp unificado.
- Listos para copiar a la herramienta de seguimiento o enviar a `hmorenod@unicartagena.edu.co`.

**Límites declarados**

- Pagos en **sandbox**; tarifas de envío de **referencia**, pendientes de cotización formal.
- Políticas sin revisión legal · sin SEM · Search Console sin verificar · pixel de Meta apagado.
- Imágenes lifestyle **ilustrativas generadas con IA**; las fotos reales son las del catálogo.

**Para probar ahora (sin registro)**

1. `https://tienda-kmizs.vercel.app` → **productos** → elegir talla y color.
2. Agregar **2 prendas** → el carrito muestra **envío gratis**.
3. Checkout → cupón **`PRIMERA10`** (−10 % del subtotal) → **contraentrega**.
4. Crear cuenta con cualquier correo → el pedido aparece **confirmado** en `/cuenta/pedidos`.

**Notas (1:00).** Cerrar con la mano tendida: «la tienda queda abierta; pueden comprar, crear cuenta y
revisar el pedido». Aclarar que el pedido de prueba llega a `kmizs@protonmail.com`.

---

## Demostración autónoma · instrucciones para el docente

La demostración la hace el docente por su cuenta. Estas son las condiciones reales para que no haya
sorpresas.

### Ruta recomendada (2 minutos)

| Paso | Dónde | Qué debe ver |
| ---- | ----- | ------------ |
| 1 | `/` | Portada con hero, colecciones y productos destacados |
| 2 | `/productos/basica-tinta` | Selector de talla (con stock real) y color |
| 3 | `/carrito` | Con 2 prendas: **Envío gratis por 2 o más prendas** |
| 4 | `/checkout` | Cupón `PRIMERA10`, contraentrega y autorización de datos |
| 5 | `/checkout/gracias` | Número de pedido y botón **Coordinar entrega por WhatsApp** |
| 6 | `/cuenta/registro` → `/cuenta/pedidos` | El pedido creado con esa cuenta aparece **PEDIDO CONFIRMADO** |

### Condiciones que conviene saber

- **No se cobra dinero real.** Mercado Pago está en modo `test` de forma permanente.
- Para pagar con tarjeta en sandbox hay que entrar con la **cuenta de comprador de prueba**
  (`test_user_8164834918474591249@testuser.com` / `5iXYGLbhoY`) y usar una tarjeta sembrada
  (Mastercard …3564, CVV `123`). La opción **"Sin cuenta" + tarjeta** termina en `/fatal/` por una
  limitación de la app automática de Mercado Pago; el flujo de invitado sí funciona con
  **contraentrega**.
- El envío gratis se aplica solo, sin cupón, desde 2 prendas o en pedidos personalizados.
- `PRIMERA10` descuenta el 10 % **del subtotal**, no del envío, y es de un solo uso por correo.
- Los pedidos de prueba quedan en la base y llegan a `kmizs@protonmail.com`; no se borran.
- El estado del pedido de Mercado Pago puede tardar en pasar de `pending` a `approved`: el webhook y
  la consulta de estado corren en segundo plano.

### Si algo falla

- El detalle de la ruta ensayada, con capturas, está en
  [`evidencias/entrega/pruebas.md`](evidencias/entrega/pruebas.md).
- Contingencia de pagos en [`mercado-pago-sandbox.md`](mercado-pago-sandbox.md) §12.

---

## Notas del orador

1. **No leer las tablas.** Cada diapositiva tiene una idea; las filas se nombran, no se recitan.
2. **Orden sugerido:** idea → clientes → pagos → CMS → SEO/SEM → analítica → problemas → cierre.
3. **Pagos:** insistir en que solo hay dos medios y que Mercado Pago nunca sale de `test`.
4. **CMS:** si preguntan por administración, responder con `base-de-datos.md` §8, no improvisar.
5. **Problemas:** usar la evidencia (106 errores, 200/200, pedidos `pending`) como prueba de método.
6. **Cierre:** decir los límites antes de que los pregunten. La honestidad es parte del entregable.

---

## Evidencia de apoyo

- Compra y correos: [`evidencias/e5/pruebas.md`](evidencias/e5/pruebas.md).
- Pagos sandbox: [`evidencias/e3/pruebas.md`](evidencias/e3/pruebas.md) y
  [`mercado-pago-sandbox.md`](mercado-pago-sandbox.md).
- Cuenta, Help de Mercado Pago y conexiones: [`evidencias/e6/pruebas.md`](evidencias/e6/pruebas.md).
- Portada: [`evidencias/inicio/`](evidencias/inicio/).
- Ensayo del flujo completo: [`evidencias/entrega/pruebas.md`](evidencias/entrega/pruebas.md).
- Índice general: [`entrega-final.md`](entrega-final.md).
