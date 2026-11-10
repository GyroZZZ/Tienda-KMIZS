# Evidencia · [E2] Catálogo, fichas y guía de tallas

**Fecha:** 8 de noviembre de 2026
**Entorno:** Next.js 16.4.3 · Node 26 · Windows 11
**Servidor:** `npm run dev` en `http://localhost:3000`

## 1. Comandos de verificación

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | Sin errores |
| `npm run lint` | Sin errores ni advertencias |
| `npm run build` | Compila y genera las 30 rutas estáticas |
| `GET /productos` | 200 |
| `GET /productos/[slug]` (10 referencias) | 200 |
| `GET /guia-de-tallas` | 200 |
| `GET /carrito` | 200 |
| `GET /checkout` | 200 |
| `GET /_next/image?...` (10 imágenes) | 200 |

## 2. Imágenes

- 10 archivos WebP de 1600 × 2000 px (4:5) en `public/products/`.
- Peso por archivo: entre 25 y 38 KB.
- Ya no quedan SVG de ejemplo en `public/products/`.
- Todas se sirven con el optimizador de Next (`/_next/image`), sin `unoptimized`.

## 3. QA móvil (390 × 844)

Se recorrieron las 10 fichas, el catálogo, la guía, el carrito y el checkout con emulación de
dispositivo real (CDP `Emulation.setDeviceMetricsOverride`).

| Página | Desbordamiento horizontal | Imágenes rotas | Evidencia |
| --- | --- | --- | --- |
| `/productos` | No | 0 de 10 | `01-movil-catalogo.png` |
| `/productos/basica-tinta` | No | 0 | `02-movil-ficha-recto.png` |
| `/productos/oversize-hueso` | No | 0 | `03-movil-ficha-oversize.png` |
| `/productos/personalizada-evento` | No | 0 | `04-movil-ficha-personalizada.png` |
| `/guia-de-tallas` | No | — | `05-movil-guia-tallas.png` |
| `/carrito` (con 2 referencias) | No | 0 | `06-movil-carrito.png` |
| `/checkout` (con 2 referencias) | No | 0 | `07-movil-checkout.png` |

Las 10 fichas se verificaron una por una: `scrollWidth === 390` y `0` imágenes sin cargar en
todas.

## 4. QA escritorio (1440 × 900)

- `/productos`: grilla de 3 columnas, imágenes y precios alineados.
- `/productos/basica-tinta`: imagen a la izquierda, ficha a la derecha, sección de tallas en 4
  columnas. Ver `08-escritorio-ficha.png`.

## 5. Accesibilidad revisada

- Cada imagen conserva texto alternativo descriptivo y ajustado al diseño final.
- La sección de tallas tiene `h2` propio y la guía enlazada con texto visible.
- El estado de cada talla se comunica con texto (`Disponible`, `Últimas N`, `Agotada`), no solo
  con color.
- Medidas en una lista de definiciones (`dl`), legible por lector de pantalla.
- Tablas de la guía con `caption`, `scope="col"` y `scope="row"`.
- Enlaces y botones mantienen áreas táctiles de al menos 44 px.

## 6. Limitaciones registradas

- Las 10 imágenes son **mockups generados con IA**, no fotografías del producto físico. Se
  reemplazan cuando exista la primera muestra real.
- Las medidas provienen de la tabla de referencia del proveedor y están pendientes de validar con
  la primera muestra física.
- El stock de las referencias personalizadas representa capacidad de producción, no inventario
  físico; la ficha y el selector lo indican.

## 7. Verificación en producción

**URL:** `https://tienda-kmizs.vercel.app`
**Despliegue:** merge del PR #3 en `main` (commit `56ef259`), build de Vercel exitoso.
**Fecha de verificación:** 9 de noviembre de 2026.

| Página | Estado | Contenido comprobado | Evidencia |
| --- | --- | --- | --- |
| `/productos` | 200 | Grilla con las imágenes WebP definitivas | — |
| `/productos/basica-tinta` | 200 | Medidas por talla, corte recto, aviso de referencia del proveedor | `10-prod-ficha-movil.png`, `12-prod-ficha-escritorio.png` |
| `/productos/oversize-tinta` | 200 | Medidas por talla y corte oversize | — |
| `/productos/personalizada-equipo` | 200 | Aviso de capacidad de producción por talla | — |
| `/guia-de-tallas` | 200 | Tablas de corte recto y oversize, cómo medirte | `11-prod-guia-movil.png` |
| `/_next/image?url=%2Fproducts%2Fbasica-tinta.webp&w=750&q=75` | 200 | `image/jpeg`, 17.9 KB servidos por el optimizador | — |

En producción, la ficha y la guía mantienen `scrollWidth === 390` en móvil (sin desbordamiento
horizontal) y cargan las imágenes sin errores. La primera captura móvil reportó una imagen aún
decodificando; una segunda pasada, ya con la caché caliente, dio `0` imágenes rotas.

## 8. Punto de marca en el wordmark

Se añadió el punto cuadrado naranja (`#ff3b1f`) al wordmark de las cuatro referencias que lo llevan
impreso: `basica-tinta`, `basica-hueso`, `oversize-tinta` y `oversize-hueso`. Las gráficas y las
personalizadas conservan su estampado propio.

- El cuadro mide 34 % de la altura de las letras, va alineado a la línea base y separado de la S
  por el ancho de un trazo, igual que el punto del logotipo en el header.
- Se compone con `sharp` sobre el WebP de 1600 × 2000 y se reexporta a calidad 82 (25–32 KB).
- Los archivos pasan a `-v2` porque el optimizador de Next cachea por URL y no permite invalidar
  la entrada anterior (`minimumCacheTTL` de 4 h).
- QA local a 390 px y 1440 px: las 10 imágenes cargan, sin desbordamiento. Evidencia:
  `13-logo-punto-catalogo.png`.
- Verificado en producción tras el merge del PR #5 (commit `c3ab71e`): las cuatro fichas y el
  catálogo sirven `-v2.webp` por `/_next/image` (200, 17–21 KB) y ya no queda ninguna referencia
  a los archivos anteriores. Evidencia: `14-prod-logo-punto.png`.
