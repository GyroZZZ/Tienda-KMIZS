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

| Ruta               | Contenido                                                   |
| ------------------ | ----------------------------------------------------------- |
| `app/`             | Rutas y páginas (App Router). Una carpeta por ruta.         |
| `components/`      | Componentes reutilizables: layout, producto, UI.            |
| `data/products.ts` | Catálogo. Es el archivo que más se toca.                    |
| `lib/`             | Tipos, utilidades y configuración del sitio.                |
| `public/`          | Imágenes y assets estáticos.                                |
| `docs/`            | Documentos del proyecto: catálogo, costos y retrospectivas. |

Para cambiar un precio, una talla o un texto de producto **no se toca el HTML**: se edita `data/products.ts` y el sitio se actualiza solo.

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

Para registrar pedidos, configura `RESEND_API_KEY` y `RESEND_FROM_EMAIL` con una dirección remitente verificada en Resend. Los pedidos de contraentrega y transferencia se envían a `hola@kmizs.co` y se confirman manualmente por WhatsApp.

El checkout digital usa Mercado Pago Checkout Pro. Configura `MERCADO_PAGO_ACCESS_TOKEN` con el token `TEST-...` y `MERCADO_PAGO_WEBHOOK_SECRET` en Vercel Preview para pruebas. El token solo se lee en funciones del servidor; los estados del pago se verifican con Mercado Pago y el webhook firmado envía una actualización al correo del equipo.

Las tarifas, los plazos y los municipios por zona aún están pendientes de confirmación con la transportadora. Mantén `SHIPPING_RATES_CONFIRMED=false`; cuando estén confirmados, carga tarifas, plazos y las listas `SHIPPING_MAIN_MUNICIPALITIES` y `SHIPPING_EXTENDED_MUNICIPALITIES` en formato `Municipio|Departamento, ...`. Luego activa `SHIPPING_RATES_CONFIRMED=true`. El servidor determina la zona a partir de la dirección (no confía en un total enviado por el navegador). Sin cobertura confirmada, el checkout registra pedidos por correo/WhatsApp, pero no permite cobrar en línea.

## Despliegue en Vercel

1. Importar el repositorio desde Vercel; el framework se detecta como Next.js.
2. Cada push a `main` publica en producción.
3. Cada rama genera un **Preview Deployment** con su propia URL.
4. Las variables de entorno se cargan en Vercel → Settings → Environment Variables, nunca en el repo.

## Estado del proyecto

| Sprint | Alcance                                                       | Estado                                                       |
| ------ | ------------------------------------------------------------- | ------------------------------------------------------------ |
| 1      | Base en código, identidad de marca y despliegue en Vercel     | Completado                                                   |
| 2      | Catálogo con fotos reales, políticas y confirmación de pedido | En curso                                                     |
| 3      | Carrito persistente, checkout, Mercado Pago sandbox y pedidos | Implementado; requiere credenciales y confirmación de envíos |
| 4      | Analítica, SEO, WhatsApp y QA                                 | Pendiente                                                    |
| 5      | Lanzamiento, KPIs y documentación                             | Pendiente                                                    |

## Equipo

| Rol                  | Integrante                                                        |
| -------------------- | ----------------------------------------------------------------- |
| Product Owner        | Ivan Arroyo                                                       |
| Scrum Master         | Horacio Campillo                                                  |
| Equipo de desarrollo | Eduardo Cambronel, Jesus Bohorques, Horacio Campillo, Ivan Arroyo |

## Enlaces

- Tablero Trello: <https://trello.com/b/7lKHNzAp/comercio-electronico-web-de-venta-de-camisetas>
- Repositorio: <https://github.com/GyroZZZ/Tienda-KMIZS>
