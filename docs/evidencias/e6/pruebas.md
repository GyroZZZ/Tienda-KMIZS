# Pruebas · Atender y medir

**Fecha:** 19 de noviembre de 2026 · **Sitio:** https://tienda-kmizs.vercel.app
**Despliegue:** `main` (`3f433d7`)

Cubre tres subtareas pendientes de `[E6-E8]`: botón flotante con UTM, Vercel Web Analytics y
documentación de la medición.

---

## 1. Botón flotante de WhatsApp

El número de destino se cambió a **+57 315 019 6386** en `lib/site.ts`, de modo que todas las
referencias al WhatsApp de la tienda apuntan al mismo número.

Enlace leído del DOM en producción:

```
https://wa.me/573150196386?text=Hola%2C+vengo+de+la+tienda+KMIZS+y+quiero+hacer+una+pregunta+sobre+las+camisetas.&utm_source=web&utm_medium=referral&utm_campaign=contacto&utm_content=boton_flotante
```

- El mensaje llega prellenado.
- Los cuatro parámetros UTM están presentes.
- `01-boton-whatsapp-movil.png`: botón visible a 390 px.

## 2. Evento `whatsapp_click`

Vercel Analytics inyecta `window.va` en la página; se comprobó que existe antes de pulsar. Se envolvió
esa función para capturar lo que recibe y se pulsó el botón con la navegación cancelada. El payload
está en [`02-evento-whatsapp-click.json`](02-evento-whatsapp-click.json):

```json
{
  "name": "whatsapp_click",
  "data": {
    "content_name": "boton_flotante",
    "utm_source": "web",
    "utm_medium": "referral",
    "utm_campaign": "contacto",
    "utm_content": "boton_flotante"
  }
}
```

Con el pixel activo, el mismo clic se enviaría a Meta con el nombre estándar `Contact`.

## 3. Vercel Web Analytics

`<Analytics />` sigue montado en `app/layout.tsx`. La comprobación disponible sin iniciar sesión fue
que el script se carga y `window.va` es una función que recibe el evento anterior.

**No hay captura del panel**: `https://vercel.com/dream-team-509f/tienda-kmizs/analytics` pide
iniciar sesión y la sesión del agente no tiene acceso. Para verificarlo con la cuenta del equipo:

```sh
vc metrics vercel.analytics.page_view.count --scope dream-team-509f --project tienda-kmizs --since 7d --granularity 1d --json
vc metrics vercel.analytics.event.count --scope dream-team-509f --project tienda-kmizs --group-by eventName --since 7d --json
```

O abrir el panel y revisar **Analytics → Events** buscando `whatsapp_click`.

## 4. Documentación

`docs/analitica.md` queda actualizada con:

- Evento `whatsapp_click` en la tabla del embudo y su equivalente `Contact` en Meta.
- Convención de UTMs con valores aceptados y tres enlaces de referencia.
- Explicación de por qué los UTMs del botón `wa.me` no aparecen como pageview y por qué se envía el
  evento aparte.
- Limitación matizada: Vercel captura UTMs de la navegación, pero no se guardan en `orders`.
- Sección de evidencia enlazada a esta carpeta.

## 5. Panel lateral de cuenta y ayuda de Mercado Pago (21 de noviembre)

- `03-panel-cuenta-movil.png`: panel lateral abierto a 390 px. Ocupa el 90% del ancho, deja ver el
  fondo y no bloquea la navegación completa.
- `04-ayuda-mp-checkout.png`: checkout de producción con Mercado Pago seleccionado y la caja de ayuda
  desplegada, con las tres tarjetas y sus resultados.
- El botón **Entrar con cuenta demo** creó el usuario `demo@kmizs.test` en `public.users` y abrió la
  sesión sin pedir correo ni contraseña. El panel pasó a mostrar "Hola, Usuario Demo" con enlaces a
  "Ver mi cuenta", "Mis pedidos" y "Cerrar sesión".
- El panel se cierra con la X y con `Escape`; al cerrarlo el foco vuelve al botón "Abrir mi cuenta".
- Al marcar **Pago digital · Mercado Pago** en el checkout aparece una caja con:
  - Mastercard terminada en 3564 → aprobado (`APRO`).
  - Visa terminada en 6260 → rechazado (`OTHE`).
  - Visa Débito terminada en 1904 → pendiente (`CONT`).
  - Botones **Copiar correo** y **Copiar clave** y enlace **Abrir Mercado Pago**.
- Se comprobó que **Copiar correo** escribe en el portapapeles y muestra "Correo copiado." en un
  `role="status"`.
- Los enlaces del panel llevan `prefetch={false}` porque en Next 16 el prefetch de `/cuenta` disparaba
  el aviso de `Date.now()` durante el prerender. Además `getCurrentUser()` llama a `connection()` para
  quedar excluida del prerender del shell estático. Sin esos dos ajustes, `/cuenta` y
  `/cuenta/pedidos` mostraban el error al navegar o al prefetchear.
