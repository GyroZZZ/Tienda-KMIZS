# KMIZS

Tienda en línea de camisetas básicas, gráficas y personalizadas para Colombia.
**KMIZS** se pronuncia _ca-mi-se-tas_.

Proyecto académico de comercio electrónico — 5 sprints, entrega **30 de noviembre de 2026**.

## Stack

| Capa       | Tecnología                             |
| ---------- | -------------------------------------- |
| Framework  | Next.js (App Router)                   |
| Lenguaje   | TypeScript                             |
| Estilos    | Tailwind CSS                           |
| Despliegue | Vercel                                 |
| Base de datos | Supabase Postgres                   |
| Pagos      | Mercado Pago (sandbox) + contraentrega |

## Requisitos

- Node.js 20.9 o superior
- npm 10 o superior

## Puesta en marcha

```bash
npm install
npm run dev
```

La tienda queda en <http://localhost:3000>.

### Si acabas de entrar al equipo

Primera vez en el proyecto, desde cero:

```bash
git clone https://github.com/GyroZZZ/Tienda-KMIZS.git
cd Tienda-KMIZS
npm install
npm run dev
```

Antes de tocar nada, configura tu identidad. Si no lo haces, tus commits quedan a nombre de otra persona:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo@ejemplo.com"
```

Comprueba que quedó bien con `git config --global --list`.

## Dónde está cada cosa

| Ruta               | Contenido                                                                   |
| ------------------ | --------------------------------------------------------------------------- |
| `app/`             | Rutas y páginas (App Router). Una carpeta por ruta.                         |
| `components/`      | Componentes reutilizables: layout, producto, UI.                            |
| `data/products.ts` | Catálogo de origen del seed; el sitio ya no lo lee en runtime.              |
| `supabase/migrations/` | Esquema, funciones de stock, cupones y cuentas.                        |
| `lib/`             | Tipos, utilidades, acceso a la base y configuración del sitio.              |
| `public/`          | Imágenes y assets estáticos.                                                |
| `docs/`            | Documentos del proyecto: catálogo, costos, sprints, confianza y evidencias. |

Para cambiar un precio, una talla o un texto de producto se edita la fila correspondiente en
Supabase Studio; el catálogo se actualiza en menos de un minuto. `data/products.ts` solo se usa para
volver a cargar el catálogo desde cero con `scripts/seed-catalog.ts`. El detalle está en
[`docs/base-de-datos.md`](docs/base-de-datos.md).

## Scripts

| Comando          | Qué hace                           |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Servidor de desarrollo             |
| `npm run build`  | Compila para producción            |
| `npm start`      | Sirve la compilación de producción |
| `npm run lint`   | Revisa el código con ESLint        |
| `npm run format` | Formatea con Prettier              |

## Flujo de ramas

Trabajamos con ramas cortas por historia y _pull request_ obligatorio hacia `main`.

```text
main ────●────────────●────────────●────────►   producción (Vercel)
          \          /            /
           ●──●──●  /            /             feat/e1-base-vercel
                   ●──●──●──────●              feat/e2-catalogo
```

| Rama                    | Uso                                                       |
| ----------------------- | --------------------------------------------------------- |
| `main`                  | Producción. Solo entra código revisado, vía pull request. |
| `feat/<tarjeta>-<tema>` | Nueva funcionalidad (ej. `feat/e3-carrito`)               |
| `fix/<tema>`            | Corrección de un error                                    |
| `docs/<tema>`           | Documentación                                             |

### Reglas

1. Una rama por tarjeta del Sprint, creada desde `main` actualizado.
2. Commits en **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.
3. Cada push a una rama genera un **Preview Deployment** en Vercel.
4. Para integrar: abrir pull request. Una revisión de otro integrante es lo ideal; si nadie revisa en **24 horas**, el autor puede fusionar dejando constancia en el comentario del PR.
5. Nunca se suben claves ni archivos `.env`. Las variables van en Vercel → Settings → Environment Variables.

### Ciclo de trabajo

```bash
git switch main && git pull          # partir de lo último
git switch -c feat/e2-guia-tallas    # rama nueva por tarjeta
# ... trabajar ...
npm run lint && npm run typecheck    # antes de subir
git add -A && git commit -m "feat(tallas): agregar medidas en centimetros"
git push -u origin feat/e2-guia-tallas
```

El push imprime un enlace al preview de Vercel. Se comparte ese enlace en el grupo para mostrar el avance **sin fusionar nada**.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar los valores. Ese archivo no se versiona.

`NEXT_PUBLIC_SITE_URL` es opcional: en Vercel se detecta el dominio del proyecto
automáticamente y en local se usa `http://localhost:3000`.

Para registrar pedidos, configura `RESEND_API_KEY` y `RESEND_FROM_EMAIL` con una dirección remitente verificada en Resend, y `ORDER_NOTIFY_EMAIL` con el buzón interno que recibe los pedidos (`kmizs@protonmail.com`). Admite varias direcciones separadas por coma. Si la variable falta, los pedidos se envían a `kmizs@protonmail.com`, que es el correo publicado del sitio. Los pedidos de contraentrega se confirman manualmente por WhatsApp.

El checkout digital usa Mercado Pago Checkout Pro. `MERCADO_PAGO_ENVIRONMENT` declara si las credenciales son de prueba (`test`, por defecto) o reales (`production`). En modo `test` se aceptan tokens `TEST-` y `APP_USR-` copiados de la pestaña "Prueba"; en modo `production` solo se acepta `APP_USR-` de la pestaña "Producción", así que un token de prueba no puede cobrar dinero real. `MERCADO_PAGO_WEBHOOK_SECRET` valida la firma del webhook. Los tokens solo se leen en funciones del servidor. El paso a paso para probar está en [`docs/mercado-pago-sandbox.md`](docs/mercado-pago-sandbox.md).

Las tarifas, los plazos y los municipios por zona son de referencia y aún están pendientes de
confirmación con la transportadora. En producción `SHIPPING_RATES_CONFIRMED=true` con esas tarifas
de referencia para permitir el pago en línea; en local puede quedar en `false`. El servidor
determina la zona a partir de la dirección (no confía en un total enviado por el navegador). Sin
cobertura confirmada, el checkout registra pedidos por correo/WhatsApp, pero no permite cobrar.

Para que un compañero o el profesor haga una compra de prueba con Mercado Pago, no hay que cambiar
nada: el entorno se mantiene en `test` de forma permanente. El paso a paso, la cuenta de comprador y
las tarjetas sembradas están en [`docs/mercado-pago-sandbox.md`](docs/mercado-pago-sandbox.md).

En el checkout, el municipio se elige de una lista dependiente del departamento. El catálogo local de Colombia está en `lib/colombian-locations.json`; su fuente y licencia MIT se incluyen allí y en `lib/colombian-locations.LICENSE`.

## Despliegue en Vercel

1. Importar el repositorio desde Vercel; el framework se detecta como Next.js.
2. Cada push a `main` publica en producción.
3. Cada rama genera un **Preview Deployment** con su propia URL.
4. Las variables de entorno se cargan en Vercel → Settings → Environment Variables, nunca en el repo.

## Estado del proyecto

| Sprint | Alcance                                                                   | Estado                                                                    |
| ------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1      | Base en código, identidad de marca y despliegue en Vercel                 | Completado                                                                |
| 2      | Catálogo, fichas, guía de tallas, políticas, FAQ y confirmación de pedido | Completado; el correo al cliente queda pendiente de un dominio verificado |
| 3      | Carrito persistente, checkout, Mercado Pago sandbox y pedidos             | Completado (10–16 nov); ver [`docs/sprint-3.md`](docs/sprint-3.md)        |
| 4      | Base de datos, WhatsApp, analítica, SEO, cupón y QA                       | Completado (17–23 nov); ver [`docs/sprint-4.md`](docs/sprint-4.md)       |
| 5      | Lanzamiento, tablero de KPIs, documentación y presentación                | Pendiente (24–30 nov)                                                     |

La base legal, las decisiones y las limitaciones del contenido de confianza están en
[`docs/confianza.md`](docs/confianza.md). La evidencia de pruebas, en
[`docs/evidencias/e4/pruebas.md`](docs/evidencias/e4/pruebas.md) y
[`docs/evidencias/e5/pruebas.md`](docs/evidencias/e5/pruebas.md). La base de datos y la medición, en
[`docs/base-de-datos.md`](docs/base-de-datos.md) y [`docs/analitica.md`](docs/analitica.md).

## Equipo

| Rol                  | Integrante                                                        |
| -------------------- | ----------------------------------------------------------------- |
| Product Owner        | Ivan Arroyo                                                       |
| Scrum Master         | Horacio Campillo                                                  |
| Equipo de desarrollo | Eduardo Cambronel, Jesus Bohorques, Horacio Campillo, Ivan Arroyo |

## Enlaces

- Tablero Trello: <https://trello.com/b/7lKHNzAp/comercio-electronico-web-de-venta-de-camisetas>
- Repositorio: <https://github.com/GyroZZZ/Tienda-KMIZS>
