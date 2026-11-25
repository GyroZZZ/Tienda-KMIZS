# Diapositiva de sustentación · KMIZS

**Formato:** una diapositiva + 3–4 minutos de exposición. El grupo se apoya en ella para demostrar
después el flujo en el software. Texto pensado para leerse en pantalla; las notas son para quien
habla.

---

## Contenido de la diapositiva

### Título
**KMIZS — Camisetas que se leen como se pronuncian**

### Idea de negocio
Tienda académica de camisetas **básicas, gráficas y personalizadas**, diseñadas e impresas en Colombia.
Envío gratis desde **2 prendas** y en pedidos de equipos, eventos o personalizados. No es una empresa
constituida: es un proyecto del curso de Comercio Electrónico.

### Clientes
Jóvenes que buscan prendas de algodón pesado; también equipos, eventos y marcas pequeñas que
necesitan camisetas a juego. Atención por **WhatsApp +57 315 019 6386** y correo
`kmizs@protonmail.com`. Sin perfiles de redes publicados aún: queda como pendiente declarado.

### Métodos de pago
| Medio | Comportamiento | Seguridad |
| ----- | -------------- | --------- |
| Contraentrega | Pedido **confirmado al registrarse**; se paga al recibir | Sin datos de tarjeta |
| Mercado Pago | Prefencias, pago en checkout de la pasarela; el webhook actualiza el pedido | **Sandbox permanente**, firma HMAC `x-signature`, idempotencia por `code`/`payment_id` |

No se realizó ningún cobro real: la integración está en modo `test` por decisión del proyecto.

### Adaptación del CMS
No se usa Shopify ni WordPress. El catálogo vive en **Postgres (Supabase)** y se administra desde
**Supabase Studio** con SQL; el sitio lo lee con caché de un minuto y etiqueta `catalog`. Las cuentas
son propias (scrypt + cookie HMAC), sin Supabase Auth. Esa es la adaptación del CMS al alcance
académico: una fuente de verdad, sin panel administrativo propio.

### Inconvenientes → retos → soluciones
| Inconveniente | Reto | Solución |
| ------------- | ---- | -------- |
| 106 errores `EMAXCONNSESSION` en 19–21 nov | El pooler en modo sesión agotaba las 15 conexiones | Pooler de transacción (puerto 6543), pool de 2 y un solo reintento; 200/200 peticiones concurrentes |
| El webhook no llegaba con la cuenta automática de MP | El pedido se quedaba en `pending` | Consulta al estado del pago en `/api/payments/status`, además del webhook firmado |
| `Date.now()` rompía el prerender de `/cuenta` | Error al navegar o prefetchear | `connection()` fuera del `try` y `prefetch={false}` en los enlaces del panel |
| La contraentrega salía "por confirmar" y el cron la cancelaba a las 72 h | Estado engañoso y venta perdida | Estado `confirmed` desde el registro; el cron solo expira Mercado Pago |
| El WhatsApp viejo seguía en tres textos legales | Datos de contacto incoherentes | Un sola fuente en `lib/site.ts`, interpolada en las políticas |
| Las imágenes de portada no mostraban el logo | Las prendas no se reconocían como del catálogo | Regeneración con wordmark y estampados; detalle en `docs/recursos-visuales.md` |

### Lo que se dice en voz alta
Proyecto académico: pagos en sandbox, tarifas de envío de referencia, políticas sin revisión legal,
sin SEM ni Search Console verificado, y tráfico de prueba insuficiente para hablar de impacto
comercial. Los cambios posteriores a la entrega están en `docs/cambios-post-entrega.md`.

---

## Notas del orador

1. **Abrir con la idea**, no con la tecnología: el problema es vender camisetas a personas y grupos.
2. **Pagos**: recalcar que hay solo dos medios y que Mercado Pago nunca sale de `test`.
3. **CMS**: si preguntan por administración, mostrar Studio con las consultas de
   [`base-de-datos.md`](base-de-datos.md) §8. No hay panel propio por decisión de alcance.
4. **Inconvenientes**: usar la tabla como prueba de que los problemas se detectaron con evidencia
   (logs, peticiones, comprobaciones), no con corazonadas.
5. Cerrar mencionando lo pendiente antes de pasar a la demo.

---

## 5. Guion de la demostración en vivo

Duración estimada: 4–5 minutos. Todas las rutas son públicas salvo `/cuenta*`.

1. **Portada** — `https://tienda-kmizs.vercel.app/`: mostrar hero, colecciones y productos
   destacados. Señalar que las imágenes lifestyle son ilustraciones generadas con IA y que las fotos
   de producto reales son las del catálogo.
2. **Catálogo y variaciones** — `/productos` → **Básica Tinta** → elegir talla **M** y color
   **Tinta** → *AGREGAR AL CARRITO*. Repetir con **Básica Hueso** para tener 2 prendas.
3. **Derivación de envío** — `/carrito`: ver **Envío gratis** automático al llegar a 2 prendas.
4. **Alta de cliente** — desde el icono de cuenta, **Crear cuenta** con nombre, correo y contraseña;
   o usar **Entrar con cuenta demo** (`demo@kmizs.test`) si se quiere ir más rápido. No hay enlace
   mágico: sesión con cookie firmada de 30 días.
5. **Checkout con derivaciones** — `/checkout`: datos precargados para la cuenta demo; celular,
   dirección, departamento **Antioquia**, municipio **Medellín**; aplicar `PRIMERA10` para ver el
   10 % sobre el subtotal; marcar contraentrega y la autorización de datos; **REGISTRAR PEDIDO**.
6. **Confirmación** — `/checkout/gracias?pedido=…`: número de pedido, texto "Tu pedido quedó
   confirmado", botón **Coordinar entrega por WhatsApp** y resumen guardado solo en el dispositivo.
7. **Historial** — `/cuenta/pedidos`: badge verde **PEDIDO CONFIRMADO** y, si se muestra el pedido de
   Mercado Pago, **PENDIENTE DE CONFIRMACIÓN**. En `/cuenta`, el contador **Confirmados**.
8. **Cierre (opcional)** — explicar el otro camino: pago aprobado en sandbox con la tarjeta
   Mastercard …3564 y actualización por webhook; no ejecutar un pago real durante la sustentación.

Si algo falla en vivo, la guía de contingencia está en
[`mercado-pago-sandbox.md`](mercado-pago-sandbox.md) §12 y en
[`evidencias/entrega/pruebas.md`](evidencias/entrega/pruebas.md).

---

## Evidencia de apoyo

- Compra y correos: [`evidencias/e5/pruebas.md`](evidencias/e5/pruebas.md).
- Pagos sandbox: [`evidencias/e3/pruebas.md`](evidencias/e3/pruebas.md) y
  [`mercado-pago-sandbox.md`](mercado-pago-sandbox.md).
- Cuenta, Help de MP y conexiones: [`evidencias/e6/pruebas.md`](evidencias/e6/pruebas.md).
- Portada: [`evidencias/inicio/`](evidencias/inicio/).
- Ensayo de la demo: [`evidencias/entrega/pruebas.md`](evidencias/entrega/pruebas.md).
- Índice general: [`entrega-final.md`](entrega-final.md).
