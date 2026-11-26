# Fuentes para el Sprint Daily

**Proyecto:** KMIZS · **Curso:** Comercio Electrónico
**Cobertura:** 27 de octubre – 21 de noviembre de 2026 (Sprints 1 a 4)
**Preparado:** 21 de noviembre de 2026 · **Actualizado:** 24 de noviembre de 2026 (documentos de entrega final)

> Este archivo **no es el Sprint Daily**. Es el índice de fuentes para quien tenga que escribirlo:
> aquí están el inventario documental, la cronología reconstruida, el estado real de las tarjetas y
> las decisiones que conviene reflejar. La cronología se armó con `git log`, la actividad de Trello y
> las fechas que ya aparecen en los documentos y en las evidencias. Los días sin commits se marcan
> como «sin actividad registrada»; no se inventan actividades.

---

## 1. Cómo usar este índice

1. Leer el apartado 2 para saber qué documento cubre cada semana y dónde están las capturas.
2. Usar el apartado 3 como esqueleto de la tabla día por día.
3. Contrastar con el apartado 4 (estado actual de Trello) antes de escribir cualquier estado.
4. Tomar las decisiones y bloqueos del apartado 5 para la sección de aprendizajes.
5. Repasar los huecos del apartado 6: hay semanas sin plan ni retrospectiva y conviene decirlo.

---

## 2. Inventario documental

| Semana | Plan | Retrospectiva | Documento de la historia | Evidencia |
| ------ | ---- | ------------- | ------------------------ | --------- |
| S1 · 27 oct–2 nov | No existe | [`retrospectiva-sprint-1.md`](retrospectiva-sprint-1.md) | [`catalogo.md`](catalogo.md), [`costos-camisetas.csv`](costos-camisetas.csv) | Capturas de catálogo en [`evidencias/e2/`](evidencias/e2/pruebas.md) |
| S2 · 3–9 nov | No existe | No existe | [`confianza.md`](confianza.md) | [`evidencias/e2/`](evidencias/e2/pruebas.md), [`evidencias/e4/`](evidencias/e4/pruebas.md) |
| S3 · 10–16 nov | [`sprint-3.md`](sprint-3.md) | [`retrospectiva-sprint-3.md`](retrospectiva-sprint-3.md) | [`mercado-pago-sandbox.md`](mercado-pago-sandbox.md) | [`evidencias/e3/`](evidencias/e3/pruebas.md) — 13 capturas |
| S4 · 17–23 nov | [`sprint-4.md`](sprint-4.md) | [`retrospectiva-sprint-4.md`](retrospectiva-sprint-4.md) | [`base-de-datos.md`](base-de-datos.md), [`analitica.md`](analitica.md) | [`evidencias/e5/`](evidencias/e5/pruebas.md), [`evidencias/e6/`](evidencias/e6/pruebas.md) |

Documentos transversales:

- [`README.md`](../README.md) — stack, puesta en marcha, variables, flujo de ramas y tabla de estado de los sprints.
- [`catalogo.md`](catalogo.md) — 10 referencias, costos, márgenes, regla de envío y stock por talla.
- [`confianza.md`](confianza.md) — políticas, FAQ, confirmación de pedido y base legal.
- [`mercado-pago-sandbox.md`](mercado-pago-sandbox.md) — credenciales de prueba, comprador, tarjetas sembradas y verificación de los tres estados.
- [`base-de-datos.md`](base-de-datos.md) — esquema, funciones, RLS, cupones y consultas de control.
- [`analitica.md`](analitica.md) — herramientas, eventos, convención UTM, consentimiento y SEO.
- [`recursos-visuales.md`](recursos-visuales.md) — imágenes lifestyle generadas con IA y aviso de ilustración.
- [`entrega-final.md`](entrega-final.md) — índice del trabajo final en el orden del PDF de entrega.
- [`cambios-post-entrega.md`](cambios-post-entrega.md) — PR #40 a #44 con motivo y justificación.
- [`diapositiva-final.md`](diapositiva-final.md) — 10 diapositivas de sustentación (todo lo evaluable en pantalla) e instrucciones para la demo autónoma del docente.
- `docs/evidencias/*/pruebas.md` — casos probados, comandos de verificación y descripción de cada captura.

---

## 3. Cronología reconstruida

Fuente: `git log --date=short --reverse`. Los hashes son los commits de cada rama; entre paréntesis, el PR fusionado cuando aplica.

### Octubre

| Fecha | Qué pasó |
| ----- | -------- |
| 30 oct | Arranque del repositorio y flujo de ramas (`e5f6852`). Base del proyecto e identidad KMIZS (`f9327d2`). Modelo de productos y páginas base (`3b1e560`). Accesibilidad del carrito y targets táctiles (`09febe9`). 10 referencias con costos, precios y política de envíos (`c808732`). Capsula de anime (`bafd956`) y reversión a las 4 gráficas abstractas (`9a96107`). |

### Noviembre

| Fecha | Qué pasó |
| ----- | -------- |
| 2 nov | Retrospectiva del Sprint 1 (`287d36d`). Guía de incorporación en el README (`f82f021`) y plantilla de PR con el DoD (#1, `85e349d`). Tarjeta `[E3]` y mejoras de checkout y envíos (`63a5749`, `a5f0c4b`, PR #2 `9c887d8`). |
| 3–7 nov | Sin actividad registrada en el repositorio. |
| 8 nov | Imágenes definitivas y medidas por corte (`91860e0`), medidas y stock en la ficha (`da03982`), documentación del catálogo (#3, `56ef259`). Verificación en producción y evidencia (#4, `35fd520`). |
| 9 nov | Punto naranja en el wordmark (#5, `c3ab71e`; evidencia #6, `a5a0374`). Políticas legales, FAQ y confirmación de pedido (`e816845`, #7 `786e149`); evidencia en producción (#8, `0c539c3`). |
| 10 nov | Plan del Sprint 3 (#9, `51582b9`). Envío gratis desde 2 prendas y pedidos personalizados (#10, `1bc50b1`); evidencia (#11, `cacfb2d`). |
| 11–13 nov | Sin actividad registrada en el repositorio. |
| 14 nov | Reembolso por retracto a 15 días y enlace visible a la SIC (`8809236`). |
| 15 nov | Buzón de pedidos configurable y entorno de Mercado Pago (#13, `58541cd`). Copy del pago digital sin exigir token `TEST-` (#14, `fd8e543`). Precisión legal de la SIC (#12 `ebd7e4a`, #15 `e8e646e`). |
| 16 nov | Enlace de pago según el entorno (#16, `4a9109f`); documentación del entorno (#17, `4a03650`) y de la firma del webhook (#18, `36e7f91`). Correo de contacto real (#19, `c832826`) y dominio público en `back_urls` y webhook (#20, `bb86a52`). Compra de punta a punta (#21, `513a8e8`) y QA de los casos pendientes con retrospectiva del Sprint 3 (#25, `1d18a0d`). Copy de pago (#22), solo contraentrega y Mercado Pago (#23, `675bcae`) y tarifas de referencia (#24, `6975b1a`). |
| 17 nov | Sin actividad registrada en el repositorio. El addendum de la retrospectiva del Sprint 3 está fechado este día. |
| 18 nov | Plan del Sprint 4 (#26 `8e426c0`, #27 `0e1e12b`). Catálogo, pedidos, cupones y cuentas en Supabase (#28, `5e86dcc`). Corrección del redirect de `/cuenta` sin sesión (#29, `03225b7`). |
| 19 nov | Cierre documental del Sprint 4 con evidencia y guía sandbox (#30, `b2bc18b`); retrospectiva (#31, `d8f96ef`). Botón de WhatsApp con UTM y evento `whatsapp_click` (#32, `3f433d7`); evidencia de analítica (#33, `ca8df03`). |
| 21 nov | Reparto de responsables y revisores entre los cuatro integrantes (#34, `ca49b4f`). Preparación de este índice de fuentes. |

Para regenerar la cronología:

```bash
git log --date=short --pretty=format:'%ad  %h  %s' --all --reverse
```

---

## 4. Estado real de las tarjetas (21 de noviembre)

Fuente: tablero Trello `https://trello.com/b/7lKHNzAp`.

| Tarjeta | Lista | Checklist |
| ------- | ----- | --------- |
| `[E1]` Montar la tienda base | ✅ Hecho | — |
| `[E1-E2]` Definir catálogo inicial, costos y precios | ✅ Hecho | — |
| `[E2]` Construir catálogo: fotos, fichas y guía de tallas | ✅ Hecho | — |
| `[E3]` Habilitar compra en móvil | ✅ Hecho | — |
| `[E4]` Generar confianza | ✅ Hecho | — |
| `[E5]` Persistencia en Supabase | ✅ Hecho | 10/10 |
| `[E6-E8]` Atender y medir | 🔧 En progreso | 5/7 |
| `[E5]` Atraer visitas | 🔧 En progreso | 5/8 |
| `[E8]` Pruebas end-to-end | 🔧 En progreso | 3/6 |

Pendiente en `Atender y medir`: WhatsApp Business y verificación del pixel.
Pendiente en `Atraer visitas`: perfiles de redes, piezas de contenido y Search Console.
Pendiente en `Pruebas end-to-end`: matriz de dispositivos, revisión de correos/enlaces y Lighthouse.

Si el daily se entrega antes de que se cierren esos ítems, el estado debe decir **en progreso**, no completado.

---

## 5. Decisiones y bloqueos para reflejar

| Semana | Decisión o bloqueo | Dónde está documentado |
| ------ | ------------------ | ---------------------- |
| S1 | 10 referencias, tres niveles de precio y margen mínimo del 35%; envío gratis desde 2 prendas | [`catalogo.md`](catalogo.md) |
| S2 | Políticas y FAQ sin revisión legal; correo al cliente pendiente de dominio verificado | [`confianza.md`](confianza.md) |
| S3 | Checkout Pro con Preferencias (no Orders); sandbox permanente; webhook firmado con `x-signature` | [`mercado-pago-sandbox.md`](mercado-pago-sandbox.md) |
| S3 | Solo dos medios de pago: contraentrega y Mercado Pago; tarifas de envío de referencia | [`sprint-3.md`](sprint-3.md), [`evidencias/e3/pruebas.md`](evidencias/e3/pruebas.md) |
| S4 | Postgres como fuente de verdad; cuentas propias con scrypt en vez de Supabase Auth; acceso solo desde el servidor con `DATABASE_URL` | [`base-de-datos.md`](base-de-datos.md) |
| S4 | Cuatro cupones aprobados por el PO: `PRIMERA10`, `VUELVE10`, `KMIZS15`, `EQUIPO20` | [`base-de-datos.md`](base-de-datos.md) §5 |
| S4 | Pago sandbox verificado en aprobado, rechazado y pendiente; el rechazado se corrigió con `/api/payments/status` porque no llegó el webhook | [`evidencias/e5/pruebas.md`](evidencias/e5/pruebas.md) |
| S4 | Métrica `whatsapp_click` y convención UTM documentada; pixel de Meta apagado hasta que exista el ID | [`analitica.md`](analitica.md), [`evidencias/e6/pruebas.md`](evidencias/e6/pruebas.md) |
| S4 | Portada con cinco imágenes lifestyle generadas con IA: ilustrativas, no fotos de clientes | [`recursos-visuales.md`](recursos-visuales.md) |
| S4 | Contraentrega confirmada al registrarse: el cron de 72 h solo expira Mercado Pago; "Total por cotizar" deja de parecer un estado | [`base-de-datos.md`](base-de-datos.md), [`evidencias/e6/pruebas.md`](evidencias/e6/pruebas.md) §7 |
| S4 | Search Console pendiente de acceso; Lighthouse y QA en dos celulares sin ejecutar; revisión cruzada del DoD no realizada | [`retrospectiva-sprint-4.md`](retrospectiva-sprint-4.md) |

El reparto de responsables y revisores ya está aplicado en las cabeceras de los documentos y en las descripciones de las tarjetas del tablero.

---

## 6. Huecos que el documento debe mencionar

1. No existen planes de los Sprints 1 y 2 ni retrospectiva del Sprint 2. Para esas semanas, las fuentes son `catalogo.md`, `confianza.md`, la retrospectiva del Sprint 1 y el historial de commits.
2. No había ningún registro diario antes de este índice; la tabla del apartado 3 es una reconstrucción, no un acta.
3. Los días 3–7, 11–13 y 17 de noviembre no tienen commits. Conviene agruparlos por semana en lugar de dejar filas vacías.
4. La evidencia visual de la tarjeta base (`[E1]`) está mezclada con la de `[E2]`; no hay carpeta `evidencias/e1`.
5. Las capturas del panel de Vercel Analytics no existen: el panel pide inicio de sesión. Hay comandos `vc metrics` en `evidencias/e6/pruebas.md` para obtenerlas con la cuenta del equipo.

---

## 7. Checklist para quien escriba el daily

- [ ] Portada con rango de fechas y autores que intervienen en el documento.
- [ ] Tabla día por día usando el apartado 3; agrupar los días sin actividad.
- [ ] Una fila por sprint con objetivo, entregables, puntos y enlaces del apartado 2.
- [ ] Estado de las tarjetas copiado del apartado 4, sin decir «completado» donde dice «en progreso».
- [ ] Decisiones y bloqueos del apartado 5 con enlace a su documento de origen.
- [ ] Huecos del apartado 6 explicados con honestidad.
- [ ] Enlaces a `docs/evidencias/*/pruebas.md` y a las capturas relevantes.
- [ ] Cierre con lo que queda para el Sprint 5 (tablero de KPIs, documentación final y presentación).
