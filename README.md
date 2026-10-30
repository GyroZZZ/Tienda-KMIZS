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
4. Para integrar: abrir pull request, que **otro integrante** lo revise y apruebe, y solo entonces hacer merge a `main`.
5. Nunca se suben claves ni archivos `.env`. Las variables van en Vercel → Settings → Environment Variables.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar los valores. Ese archivo no se versiona.

## Equipo

| Rol                  | Integrante                                                        |
| -------------------- | ----------------------------------------------------------------- |
| Product Owner        | Ivan Arroyo                                                       |
| Scrum Master         | Horacio Campillo                                                  |
| Equipo de desarrollo | Eduardo Cambronel, Jesus Bohorques, Horacio Campillo, Ivan Arroyo |

## Enlaces

- Tablero Trello: <https://trello.com/b/7lKHNzAp/comercio-electronico-web-de-venta-de-camisetas>
- Repositorio: <https://github.com/GyroZZZ/Tienda-KMIZS>
