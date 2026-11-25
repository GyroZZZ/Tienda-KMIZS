# Cambios posteriores a la entrega

El PDF de entrega pide que todo cambio realizado después de la entrega se documente y justifique en
la herramienta de seguimiento **o** por correo a `hmorenod@unicartagena.edu.co`. Este documento reúne
los cinco pull requests fusionados en `main` después del cierre documental del Sprint 4 (19 de
noviembre de 2026), para que un integrante pueda copiarlos a la tarjeta correspondiente o enviarlos
por correo.

No se publicaron comentarios en las tarjetas de Trello y ninguna tarjeta se movió a `✅ Hecho` sin
tener todas sus casillas completas.

| PR | Fecha | Commit | Cambio | Motivo y justificación |
| -- | ----- | ------ | ------ | ---------------------- |
| [#40](https://github.com/GyroZZZ/Tienda-KMIZS/pull/40) | 23 nov | `7148a15` | Contraentrega nace `confirmed`; el cron de 72 h solo expira Mercado Pago | Corrección funcional detectada en QA: un pedido de contraentrega legítimo aparecía como "Pendiente de confirmación" y el cron lo cancelaba a los tres días. No amplía el alcance; hace que el estado mostrado coincida con la regla acordada de "contraentrega se paga al recibir". Evidencia en [`evidencias/e6/pruebas.md`](evidencias/e6/pruebas.md) §7. |
| [#41](https://github.com/GyroZZZ/Tienda-KMIZS/pull/41) | 23 nov | `4a6eac0` | Evidencia en producción del estado confirmado | Documentación del PR #40 con el deployment real y la sesión demo. No toca código. |
| [#42](https://github.com/GyroZZZ/Tienda-KMIZS/pull/42) | 24 nov | `8445a05` | Portada con cinco imágenes lifestyle, franja de beneficios, productos destacados y pasos de compra | La portada era únicamente texto. Es un cambio de presentación para la sustentación: no modifica catálogo, precios, pagos ni reglas de negocio, y conserva la paleta `ink`/`bone`/`accent`. Evidencia en [`evidencias/inicio/`](evidencias/inicio/). |
| [#43](https://github.com/GyroZZZ/Tienda-KMIZS/pull/43) | 24 nov | `9e4ffd3` | Evidencia de la portada en producción | Documentación del PR #42. No toca código. |
| [#44](https://github.com/GyroZZZ/Tienda-KMIZS/pull/44) | 24 nov | `bb30bc5` | Las imágenes lifestyle llevan el wordmark KMIZS y los estampados del catálogo | Corrección de coherencia visual detectada al revisar la portada: la ropa generada no se reconocía como la del catálogo. No cambia la funcionalidad. Detalle de prompts y aviso de IA en [`recursos-visuales.md`](recursos-visuales.md). |

## Texto listo para copiar al seguimiento o al correo

> Después del cierre del Sprint 4 se fusionaron cinco PR en `main`: #40 y #41 corrigen y documentan
> el estado de la contraentrega, que el cron cancelaba a las 72 horas aunque se paga al entregar; #42
> y #43 incorporan y documentan imágenes y contenido real en la portada para la sustentación; #44
> ajusta esas imágenes para que la ropa muestre el logo y los estampados del catálogo. Ninguno cambia
> el alcance funcional acordado: son correcciones y mejoras de presentación. El detalle, con commit,
> motivo y evidencia, está en `docs/cambios-post-entrega.md`.

## Pendiente de registro fuera de este repositorio

- Copiar el texto anterior a la descripción de la tarjeta del Sprint 4 que corresponda, o enviarlo al
  correo del docente. Esta acción la hace un integrante del grupo; este agente no comenta en Trello.
