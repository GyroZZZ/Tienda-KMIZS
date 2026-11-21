# Retrospectiva · Sprint 3

**Proyecto:** KMIZS — tienda de camisetas · **Curso:** Comercio Electrónico
**Sprint:** 3 · 10 – 16 de noviembre de 2026
**Sesión:** 16 de noviembre de 2026
**Facilita:** Horacio Campillo (Scrum Master)
**Participan:** Horacio Campillo, Ivan Arroyo
**Formato:** cuatro preguntas (qué funcionó, qué no, qué aprendimos, qué hacemos)

---

## 1. Datos del sprint

| Indicador                      | Resultado                                                              |
| ------------------------------ | ---------------------------------------------------------------------- |
| Tarjetas comprometidas         | 1 — `[E3]` (21 pts)                                                    |
| Subtareas de la checklist      | 12                                                                     |
| Subtareas completadas          | 11                                                                     |
| Subtareas pendientes           | 1 — la revisión cruzada del DoD                                        |
| Pull requests fusionados       | 9 (#16 a #24)                                                          |
| Variables de entorno en Vercel | 14 (producción y preview)                                              |
| Pagos de prueba verificados    | 3 — aprobado, rechazado y pendiente                                    |
| Pedidos de prueba registrados  | 5 — 3 por Mercado Pago y 2 manuales (contraentrega y transferencia)    |
| Casos de QA móvil cubiertos    | 6 (talla, cantidad, recarga, stock agotado, zona sin cobertura, total) |
| Tienda en producción           | https://tienda-kmizs.vercel.app                                        |

El sprint cumplió el alcance funcional, pero **no el DoD completo**: la revisión por otro integrante
no se realizó. La tarjeta queda en `🎯 Sprint 3 Backlog` con 11 de 12 subtareas, no en `✅ Hecho`.

---

## 2. Qué funcionó — continuar

1. **Verificar cada pago contra la API, no contra la pantalla.** Los tres estados se confirmaron con
   `GET /v1/payments/{id}`: `188925368893` aprobado, `188927364905` rechazado y `188930688193` en
   proceso. La captura del checkout dice "Pago aprobado"; el pago dice `accredited`. Las dos cosas
   coincidieron porque se compararon, no porque se supusiera.
2. **Las guardas de entorno en `lib/payments.ts`.** El modo `test` acepta tokens `TEST-` y `APP_USR-`
   de la pestaña de prueba; el modo `production` solo acepta `APP_USR-` de producción. Un token de
   prueba no puede cobrar dinero real ni por error de configuración.
3. **Separar el problema del dominio del problema de la pasarela.** El comprador volvía de Mercado
   Pago a un login de Vercel porque `getSiteUrl()` usaba la URL del despliegue, que está protegida.
   Se cambió a `VERCEL_PROJECT_PRODUCTION_URL` y el webhook empezó a llegar al endpoint correcto.
4. **Escribir los límites del entorno de prueba en la evidencia.** Que Mercado Pago no entregue el
   webhook por su cuenta y que las tarjetas nuevas no se puedan sembrar son limitaciones de la cuenta
   automática, no de la integración. Documentarlo evita que alguien lo lea como un fallo del código.
5. **El registro local de pedidos.** Poder levantar el proyecto sin credenciales y ver el pedido en
   `.data/pedidos.jsonl` hizo que el flujo se pudiera probar en cualquier equipo, sin depender de
   Resend ni de Mercado Pago.
6. **Revisar el sitio desplegado.** Tres de los bugs del cierre (el correo inexistente, el regreso a
   Vercel y el texto del pago digital) no aparecían en el build: aparecieron al usar la tienda.

---

## 3. Qué no funcionó — dejar de hacer

1. **Cerrar la tarjeta sin la checklist.** Se movió `[E3]` a `✅ Hecho` con 2 de 12 ítems marcados.
   Un tablero que miente es peor que un tablero vacío: cualquiera que lo lea va a creer que el sprint
   terminó. Se corrigió el mismo día, pero la corrección no borra el error.
2. **Documentar lo que no existe.** `docs/sprint-3.md` afirmaba que `lib/order-store.ts` estaba hecho
   y que la retrospectiva estaba escrita. Ninguna de las dos cosas era cierta. La documentación se
   escribió de memoria y no se contrastó con el repositorio.
3. **Confiar en que el webhook "ya funciona".** El endpoint respondía `200` a peticiones firmadas a
   mano, así que el punto parecía cerrado. La prueba real es que Mercado Pago lo entregue solo, y eso
   no ocurrió en ningún momento del sprint.
4. **Publicar un correo que no existe.** `hola@kmizs.co` estaba en el pie, en las políticas y en los
   correos de pedido, con el dominio sin registrar. Cualquier cliente que escribiera ahí perdía el
   mensaje.
5. **Dejar el copy para el final.** El checkout decía "se habilita al configurar la pasarela" incluso
   cuando el pago ya estaba configurado. El medio funcionaba; el texto hacía pensar lo contrario.
6. **Construir sobre una opción que después se retiró.** El ítem 6 se marcó probando contraentrega y
   transferencia, y luego la transferencia se eliminó del checkout por decisión de alcance. La prueba
   sigue siendo válida, pero el criterio ya no coincide con el producto.

---

## 4. Qué aprendimos

- **Un sandbox no es un entorno separado.** Mercado Pago no tiene una URL de pruebas distinta: es la
  misma API con credenciales de prueba. Lo que cambia es la cuenta, no el endpoint. Eso explica por
  qué las tarjetas sembradas funcionan y las nuevas no.
- **Un webhook se valida cuando el emisor lo entrega.** Una petición firmada a mano demuestra que el
  receptor valida la firma; no demuestra que el emisor notifique. Son dos cosas distintas y el
  criterio de aceptación pedía la segunda.
- **La evidencia tiene que describir el estado del sistema.** "Responde `200`" no dice nada si no se
  registra qué pedido, con qué monto y en qué estado quedó. Los identificadores de pago y de pedido
  son lo que hace verificable una prueba.
- **El copy es parte del criterio de aceptación.** Un medio de pago que funciona pero se anuncia como
  bloqueado sigue siendo un medio de pago que el cliente no usa.
- **Un DoD sin revisor es un deseo.** Las otras cuatro condiciones se pueden cumplir solo; la quinta
  requiere a otra persona. Sin ella, el sprint no está terminado aunque el código sí.

---

## 5. Acciones para el Sprint 4

| #   | Acción                                                                                                | Responsable | Fecha límite          |
| --- | ----------------------------------------------------------------------------------------------------- | ----------- | --------------------- |
| 1   | Revisar `[E3]` de punta a punta: checkout en móvil, los tres estados de pago y la política de envíos. | Ivan        | 18 nov                |
| 2   | Verificar un dominio en Resend para dejar de enviar desde `onboarding@resend.dev`.                    | Jesús       | 20 nov                |
| 3   | Iniciar el KYC para activar credenciales de producción de Mercado Pago.                               | Eduardo     | 27 nov                |
| 4   | Cotizar con la transportadora y reemplazar las tarifas de referencia por tarifas reales.              | Ivan        | 27 nov                |
| 5   | Confirmar una entrega real del webhook con credenciales de producción.                                | Horacio     | Al activar producción |
| 6   | Migrar de Preferencias a Orders API cuando el volumen lo justifique.                                  | Eduardo     | Sprint 5              |
| 7   | Persistencia en Supabase para productos, cuentas e historial (`[E5]`).                                | Jesús       | Sprint 5              |
| 8   | Revisar el copy del checkout contra el estado real de la configuración en cada entrega.               | Todos       | Permanente            |

---

## 6. Riesgos para el Sprint 4

| Riesgo                                                       | Impacto                            | Mitigación                                                                                        |
| ------------------------------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| Mercado Pago no entrega webhooks en producción               | Alto — el pedido no se actualiza   | Probar con una compra real mínima antes de abrir la tienda y dejar el sondeo manual como respaldo |
| El KYC se demora                                             | Alto — sin cobros reales           | Mantener `MERCADO_PAGO_ENVIRONMENT=test` y documentar el estado en la evidencia                   |
| Las tarifas de referencia no coinciden con la transportadora | Medio — precio incorrecto          | La política ya dice que son de referencia; confirmar antes de cobrar                              |
| El correo sigue saliendo desde `onboarding@resend.dev`       | Medio — solo llega al buzón propio | Verificar dominio antes de recibir pedidos de terceros                                            |
| Una sola persona escribe el código                           | Medio — cuello de botella          | Revisión cruzada obligatoria y sesión de traspaso                                                 |

---

## 7. Acuerdos del equipo

1. **Definición de terminado:** criterios cumplidos, probado en móvil, revisado por alguien que no lo
   construyó, desplegado en Vercel y evidencia adjunta. Sin los cinco, la tarjeta no pasa a `✅ Hecho`.
2. **Si la revisión cruzada no ocurre,** la tarjeta se cierra dejando constancia explícita de que no
   se hizo, como se hizo en E4. No se marca la casilla.
3. **Nada se documenta de memoria:** si un documento afirma que un archivo existe, el archivo existe
   en el repositorio o la afirmación se borra.
4. **Los límites del entorno de prueba se escriben en la evidencia,** no se omiten para que el
   resultado se vea completo.
5. **Las decisiones de alcance se registran con fecha y motivo** en el documento del sprint.

---

## 8. Cierre

El Sprint 3 dejó una compra completa en modo de prueba: carrito que sobrevive a la recarga, envío
calculado en el servidor, tres estados de pago verificados contra la API, contraentrega y pago digital
con Mercado Pago, y pedidos registrados por correo.

Lo que no se hizo es la revisión cruzada. Por eso `[E3]` **no se cierra**: queda en el backlog con 11
de 12 subtareas y con la revisión pendiente como única tarea abierta. El objetivo del Sprint 4 no es
agregar funciones, es que alguien más mire lo que ya funciona.

---

## Addendum · 17 de noviembre de 2026

Al día siguiente de la sesión, Eduardo Jiménez marcó el ítem de DoD y movió `[E3]` a `✅ Hecho`, con lo
que la checklist quedó en 12 de 12. La revisión quedó registrada por él, no por Ivan, que era el
revisor asignado. El acta del 16 sigue diciendo lo que decía porque eso fue lo que ocurrió ese día;
este addendum deja constancia de lo que pasó después sin reescribirla.

El resto de la retrospectiva se mantiene: el sprint se cerró un día después de la fecha prevista y la
revisión la hizo una persona distinta de la que construyó, aunque no fuera el revisor asignado.
