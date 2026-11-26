# Entrega final · KMIZS

**Proyecto académico · Comercio electrónico · Universidad de Cartagena**
**Sitio en producción:** https://tienda-kmizs.vercel.app
**Repositorio:** https://github.com/GyroZZZ/Tienda-KMIZS
**Fecha de este índice:** 24 de noviembre de 2026

Este documento reúne las pruebas del trabajo final en el orden de la lista del PDF
`CE_final_project.pdf`. Es un índice: el detalle está en los documentos enlazados.

---

## 1. Requisitos legales y seguridad en métodos de pago

- **Protección de datos:** [`/politicas/privacidad`](https://tienda-kmizs.vercel.app/politicas/privacidad),
  basada en la Ley 1581 de 2012, Decretos 1377 de 2013 y 1074 de 2015. Marcos, decisiones y
  límites en [`confianza.md`](confianza.md). La autorización se pide en el checkout.
- **Seguridad de pago:** solo dos medios, contraentrega y Mercado Pago. Mercado Pago queda en
  **modo `test` de forma permanente**: no se cobra dinero real. La tarjeta se digitó solo en el
  checkout de la pasarela; la tienda no guarda datos de tarjeta. La firma `x-signature` del webhook
  se valida con HMAC-SHA256 en tiempo constante y los pedidos son idempotentes por `code` y
  `payment_id`. Guía y evidencia en [`mercado-pago-sandbox.md`](mercado-pago-sandbox.md) y
  [`evidencias/e3/pruebas.md`](evidencias/e3/pruebas.md).
- Nota honesta: las políticas no pasaron por revisión de abogado; son documentos académicos.

## 2. Formas de captación de clientes (multicanalidad)

- Sitio web público, correo `kmizs@protonmail.com` y WhatsApp **+57 315 019 6386**. El número y el
  correo salen de una sola fuente (`lib/site.ts`), también en los textos legales.
- Botón flotante de WhatsApp con mensaje prellenado, cuatro parámetros UTM y evento
  `whatsapp_click`: [`analitica.md`](analitica.md) y
  [`evidencias/e6/pruebas.md`](evidencias/e6/pruebas.md) §§1–3.
- **Pendiente declarado:** perfiles de redes sociales y piezas de contenido (tarjeta
  `[E5] Atraer visitas`, 5/8). No se afirma que estén listos.

## 3. SEO / SEM

- SEO técnico: `sitemap.xml`, `robots.txt`, metadatos por página y JSON-LD `Product` con precio y
  disponibilidad reales. Detalle en [`analitica.md`](analitica.md) §6; comprobación en
  [`evidencias/e5/pruebas.md`](evidencias/e5/pruebas.md).
- Search Console: pendiente de acceso a la cuenta del equipo; pasos documentados, propiedad aún no
  verificada.
- **SEM: no se ejecutó inversión paga.** Es una decisión de alcance académico: no hay presupuesto
  ni cuenta publicitaria. La medición de campañas se dejó preparada con la convención UTM de
  [`analitica.md`](analitica.md), pero no se reportan clics ni conversiones de anuncios.

## 4. Análisis de impacto

- Herramienta elegida: **Vercel Analytics** ("u otra herramienta" según el PDF), con eventos
  `view_item`, `add_to_cart`, `initiate_checkout`, `purchase` y `whatsapp_click`.
- No hay Google Analytics 4 ni Tag Manager; el pixel de Meta está apagado hasta que exista
  `NEXT_PUBLIC_META_PIXEL_ID`. Consentimiento documentado en [`analitica.md`](analitica.md).
- Evidencia del evento y del enlace con UTMs en
  [`evidencias/e6/pruebas.md`](evidencias/e6/pruebas.md). El panel requiere inicio de sesión; en su
  lugar quedaron comandos `vc metrics` para reproducir las cifras con la cuenta del equipo.
- **Límite:** con tráfico de prueba no hay una muestra suficiente para hablar de impacto comercial.
  Las tasas se leen como tendencia del embudo, no como resultado de campaña.

## 5. Alcance y cambios posteriores a la entrega

- Alcance original: [`sprint-1.md`](sprint-1.md), [`sprint-2.md`](sprint-2.md),
  [`sprint-3.md`](sprint-3.md), [`sprint-4.md`](sprint-4.md) y el tablero de Trello del Sprint 4.
- Cambios realizados después de la entrega: PR #40 a #44, con motivo, evidencia y justificación en
  [`cambios-post-entrega.md`](cambios-post-entrega.md). Ese documento está listo para que un
  integrante lo copie a la herramienta de seguimiento o lo envíe por correo a
  `hmorenod@unicartagena.edu.co`.

## 6. Entregable

- Enlace público: https://tienda-kmizs.vercel.app
- Documento que prueba el trabajo: este índice más las carpetas
  [`evidencias/e3`](evidencias/e3/), [`evidencias/e4`](evidencias/e4/),
  [`evidencias/e5`](evidencias/e5/), [`evidencias/e6`](evidencias/e6/),
  [`evidencias/inicio`](evidencias/inicio/) y [`evidencias/entrega`](evidencias/entrega/).

## 7. Diapositiva

Guion, contenido y notas del orador en [`diapositiva-final.md`](diapositiva-final.md): **10 diapositivas**
que cubren idea de negocio, clientes, captación multicanal, métodos de pago y seguridad, adaptación
del CMS, SEO/SEM, analítica e impacto, los seis inconvenientes con sus soluciones y el alcance. Todo lo
evaluable queda escrito en pantalla; el reparto de tiempo suma ~9 minutos.

## 8. Sustentación y demostración

La demostración **la hace el docente por su cuenta** entrando a https://tienda-kmizs.vercel.app; no se
ejecuta durante la exposición. Las instrucciones para probarla (ruta de 6 pasos, cupón `PRIMERA10`,
condiciones reales del sandbox y qué esperar) están en [`diapositiva-final.md`](diapositiva-final.md),
apartado "Demostración autónoma". La prueba ensayada con registro de cliente, variaciones de
talla/color, cupón y derivación de envío está en
[`evidencias/entrega/pruebas.md`](evidencias/entrega/pruebas.md).

---

## Lo que debe decirse en voz alta

1. Mercado Pago está en sandbox: no se hicieron cobros reales.
2. Las tarifas de envío son de referencia y siguen pendientes de cotización formal.
3. No hay CMS administrativo propio: el catálogo y los pedidos se gestionan en Supabase Studio.
4. Las imágenes lifestyle son ilustraciones generadas con IA, detalladas en
   [`recursos-visuales.md`](recursos-visuales.md); las fotos de producto reales están en el catálogo.
5. No se ejecutó SEM ni se verificó Search Console; el pixel de Meta está apagado.
6. Los cambios de alcance posteriores a la entrega están documentados en
   [`cambios-post-entrega.md`](cambios-post-entrega.md).
