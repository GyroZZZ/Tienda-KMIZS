# Plan · Sprint 3 — Carrito, pagos y envíos

**Proyecto:** KMIZS — tienda de camisetas · **Curso:** Comercio Electrónico
**Sprint:** 3 · **10 – 16 de noviembre de 2026**
**Tarjeta:** `[E3] Habilitar compra en móvil: carrito, checkout, pagos y envíos` · 21 puntos
**Responsable:** Horacio Campillo · **Revisor:** Ivan Arroyo

---

## 1. Objetivo del sprint

Cerrar la compra de punta a punta en producción: que una persona pueda armar el carrito desde el
celular, pagar en sandbox de Mercado Pago o elegir contraentrega/transferencia, y que el pedido
quede registrado con su costo de envío y su número.

El código ya existe. Lo que falta no es construir la tienda otra vez: es **configurar las
credenciales, probar con dinero de prueba y dejar evidencia**.

---

## 2. Estado de partida (10 de noviembre)

| Pieza                                                  | Estado                             | Dónde vive                                          |
| ------------------------------------------------------ | ---------------------------------- | --------------------------------------------------- |
| Carrito persistente (agregar, quitar, cantidad, talla) | Implementado y probado en móvil    | `components/cart/CartProvider.tsx`                  |
| Checkout de pocos campos con resumen y consentimiento  | Implementado                       | `components/checkout/CheckoutForm.tsx`              |
| Preferencia de Mercado Pago desde el servidor          | Implementado, sin credenciales     | `app/api/checkout/route.ts`                         |
| Webhook con validación HMAC                            | Implementado, sin credenciales     | `app/api/payments/webhook/route.ts`                 |
| Verificación de pago y página de resultado             | Implementado                       | `app/api/payments/status`, `app/checkout/resultado` |
| Contraentrega y transferencia con WhatsApp             | Implementado                       | `app/api/checkout/route.ts`                         |
| Zonas de envío por municipio                           | Implementado, sin tarifas cargadas | `lib/shipping.ts`                                   |
| Registro de pedido por correo                          | Implementado, sin remitente        | `lib/order-email.ts`                                |
| Página de gracias y comprobante                        | Implementado en E4                 | `app/checkout/gracias`                              |

**Lo que bloquea hoy:** producción no tiene credenciales. El pago digital aparece deshabilitado y
el envío figura "por confirmar" en `/checkout`.

---

## 3. Decisiones tomadas en la planificación

| Tema                   | Decisión                                                                    | Consecuencia                                                                      |
| ---------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Cuenta de Mercado Pago | Se crea una cuenta de prueba desde cero                                     | Hay que completar el registro, crear la aplicación y generar credenciales `TEST-` |
| Tarifas de envío       | Tarifas de referencia por zona, marcadas como pendientes de cotización real | Permiten probar el flujo completo; la política y el checkout deben decirlo        |
| Correo de pedidos      | Buzón real del equipo mediante `ORDER_NOTIFY_EMAIL`                         | `hola@kmizs.co` sigue publicado, pero no recibe pedidos                           |
| Envío gratis           | Automático desde 2 prendas o en pedidos personalizados                      | Reemplaza el beneficio manual de la 3.ª compra; el margen se recalcula aparte     |

### Regla de envío gratis (10 de noviembre)

La regla quedó implementada en `lib/free-shipping.ts` y aplicada en carrito, checkout, API, correo,
WhatsApp y página de gracias. Un pedido de una sola prenda sigue pagando la tarifa de su zona. La
evidencia está en `docs/evidencias/e3/pruebas.md` y el impacto en la provisión de envío está
documentado en `docs/catalogo.md` (margen estimado 46–54% según mezcla, pendiente de decisión).

### Tarifas de referencia propuestas

| Zona                 | Tarifa  | Plazo              | Cobertura                                 |
| -------------------- | ------- | ------------------ | ----------------------------------------- |
| Área metropolitana   | $12.900 | 2 a 4 días hábiles | Medellín y municipios del Valle de Aburrá |
| Ciudades principales | $18.900 | 4 a 7 días hábiles | Capitales fuera de Antioquia              |

Valores listos para Vercel (el formato es `Municipio|Departamento`):

```env
SHIPPING_RATES_CONFIRMED=true
SHIPPING_MAIN_RATE=12900
SHIPPING_MAIN_ETA=2 a 4
SHIPPING_MAIN_MUNICIPALITIES=Medellín|Antioquia,Bello|Antioquia,Envigado|Antioquia,Itagui|Antioquia,Sabaneta|Antioquia,La Estrella|Antioquia,Copacabana|Antioquia,Girardota|Antioquia,Barbosa|Antioquia,Caldas|Antioquia,Rionegro|Antioquia,La Ceja|Antioquia,Marinilla|Antioquia,Guarne|Antioquia
SHIPPING_EXTENDED_RATE=18900
SHIPPING_EXTENDED_ETA=4 a 7
SHIPPING_EXTENDED_MUNICIPALITIES=Bogotá D.C.|Bogotá D.C.,Cali|Valle Del Cauca,Barranquilla|Atlántico,Cartagena|Bolivar,Bucaramanga|Santander,Pereira|Risaralda,Manizales|Caldas,Armenia|Quindío,Santa Marta|Magdalena,Cúcuta|Norte De Santander,Ibague|Tolima,Villavicencio|Meta,Neiva|Huila,Pasto|Nariño,Montería|Córdoba,Valledupar|Cesar,Sincelejo|Sucre,Tunja|Boyacá,Popayán|Cauca,Riohacha|La Guajira,Yopal|Casanare,Quibdó|Choco,Florencia|Caquetá,Arauca|Arauca
```

San Andrés, Leticia y municipios fuera de la lista se cotizan por WhatsApp; el pago en línea queda
bloqueado para esas direcciones, que es el comportamiento correcto.

> **Aviso obligatorio:** estas tarifas son de referencia, no una cotización de la transportadora.
> Antes de vender de verdad hay que confirmarlas y actualizar `docs/catalogo.md` y la política de
> envíos.

---

## 4. Alcance del sprint

**Dentro:**

1. Configurar Mercado Pago sandbox y Resend en Vercel.
2. Cargar las tarifas de referencia y mostrarlas con su estado.
3. Hacer configurable el buzón de pedidos (`ORDER_NOTIFY_EMAIL`).
4. Poder probar el flujo sin credenciales en desarrollo.
5. Probar sandbox: aprobado, rechazado y pendiente.
6. Probar contraentrega y transferencia.
7. QA móvil del carrito y checkout.
8. Evidencia y retrospectiva.

**Fuera:**

- Pago en producción con dinero real y KYC comercial.
- Base de datos de pedidos, cuentas de cliente e historial.
- Descuento automático de stock (el catálogo es estático).
- Dominio propio y correo en el dominio de la marca.
- Cupón de primera compra (Sprint 4).

---

## 5. Subtareas y entregables

| #   | Subtarea                                                                            | Entregable                                                        | Evidencia                                   |
| --- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| 1   | Crear la cuenta de prueba de Mercado Pago, la aplicación y las credenciales `TEST-` | Credenciales cargadas en Vercel                                   | Captura de la app y del checkout habilitado |
| 2   | Definir y cargar tarifas de referencia por zona                                     | Variables de envío en Vercel                                      | Captura del checkout con tarifa y plazo     |
| 3   | Configurar `ORDER_NOTIFY_EMAIL` y verificar la entrega con Resend                   | Correo de pedido en el buzón real                                 | Captura del correo recibido                 |
| 4   | Registro local de pedidos en desarrollo y error explícito en producción             | `lib/order-store.ts` + `.data/` ignorado                          | Prueba local con pedido en archivo          |
| 5   | Compra sandbox aprobada, rechazada y pendiente                                      | Pagos de prueba en Mercado Pago                                   | Capturas de los tres estados                |
| 6   | Contraentrega y transferencia                                                       | Pedido registrado + WhatsApp                                      | Captura del correo y del mensaje            |
| 7   | QA móvil del carrito y checkout                                                     | Lista de casos probados                                           | Capturas 390 px                             |
| 8   | Actualizar política de envíos y textos del checkout                                 | Contenido coherente con tarifas de referencia                     | Captura de la política                      |
| 9   | Evidencia y retrospectiva                                                           | `docs/evidencias/e3/pruebas.md`, `docs/retrospectiva-sprint-3.md` | Documentos                                  |
| 10  | DoD                                                                                 | Tarjeta en `✅ Hecho`                                             | Checklist completo                          |

---

## 6. Cronograma

| Día    | Trabajo                                                                            |
| ------ | ---------------------------------------------------------------------------------- |
| Lun 10 | Planificación, cuenta de Mercado Pago, tarifas de referencia, `ORDER_NOTIFY_EMAIL` |
| Mar 11 | Registro de pedidos y pruebas locales sin credenciales                             |
| Mié 12 | Credenciales en Vercel y primera compra sandbox aprobada                           |
| Jue 13 | Casos rechazado/pendiente, webhook, contraentrega y transferencia                  |
| Vie 14 | QA móvil, ajustes de copy y política de envíos                                     |
| Sáb 15 | Evidencia, revisión cruzada de Ivan                                                |
| Dom 16 | Cierre, retrospectiva y tarjeta a `✅ Hecho`                                       |

---

## 7. Riesgos y mitigación

| Riesgo                                                       | Impacto                                    | Mitigación                                                                                                                 |
| ------------------------------------------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| La cuenta de Mercado Pago demora o pide KYC                  | Alto — sin pago digital                    | Contraentrega y transferencia ya funcionan; documentar el bloqueo y cerrar con ellas si es necesario                       |
| Resend no entrega al buzón sin dominio verificado            | Alto — el pedido no queda registrado       | Usar el correo de la cuenta de Resend como destinatario o un servicio gratuito alterno; nunca dejar el pedido sin registro |
| Las tarifas de referencia no coinciden con la transportadora | Medio — precio incorrecto                  | Aviso visible en checkout y política; confirmar antes de vender                                                            |
| Sin base de datos, el pedido solo vive en el correo          | Medio — pérdida de trazabilidad            | Registro local en desarrollo y correo idempotente en producción; documentar la limitación                                  |
| El webhook no llega en local                                 | Medio — no se puede probar el estado final | Probar el webhook en producción/preview con URL pública y firma real                                                       |
| Una sola persona con acceso a Vercel                         | Medio — cuello de botella                  | Cargar las variables en pareja y dejar registro en `docs/`                                                                 |

---

## 8. Definition of Done

Una tarjeta se cierra solo si:

1. Cumple los criterios de aceptación.
2. Está probada en celular (390 px) y escritorio.
3. La revisó alguien distinto de quien la construyó.
4. Está desplegada en Vercel (preview o producción).
5. Tiene evidencia adjunta (capturas, correos, enlaces).

Si la revisión de Ivan no ocurre, se cierra dejando constancia explícita, como se hizo en E4.

---

## 9. Trazabilidad de criterios

| Criterio de aceptación                                              | Cómo se verifica                                                |
| ------------------------------------------------------------------- | --------------------------------------------------------------- |
| Carrito conserva ítems al recargar y permite cambiar talla/cantidad | Prueba en navegador con recarga y cambio de talla               |
| Checkout fluido en celular                                          | QA 390 px + captura                                             |
| Pago sandbox exitoso sin exponer claves                             | Compra de prueba; revisar que el token solo viva en el servidor |
| Contraentrega y transferencia registran el pedido                   | Correo al equipo + WhatsApp con número de pedido                |
| Tarifas y plazos visibles en ficha y checkout                       | Captura con zona, tarifa y plazo                                |
| Cada pedido queda registrado                                        | Correo recibido y archivo local en desarrollo                   |
