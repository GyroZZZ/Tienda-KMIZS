# Base de datos

**Tarjeta:** `[E5] Persistencia` · **Sprint:** 4 (18 – 23 nov 2026)
**Proyecto de Supabase:** `ydaekcscnyloqfzzwmzb` · **Región:** `us-west-2` (pooler)
**Responsable:** Horacio Campillo · **Revisor:** Ivan Arroyo

> Documento de la base real. Todo lo que aparece aquí se aplicó con las migraciones de `supabase/migrations/` y se verificó contra el proyecto remoto el 18 de noviembre de 2026.

---

## 1. Decisión de arquitectura

La tienda usa **Postgres de Supabase** como única fuente de verdad para catálogo, pedidos, cupones y cuentas.

El navegador **no habla con la base**. El servidor de Next.js abre un pool con `pg` usando la cadena del pooler y ejecuta todas las consultas desde componentes de servidor, server actions y route handlers. Por eso:

- No hay claves `anon` ni `service_role` en el proyecto: no se usa `supabase-js` ni PostgREST.
- El único rol que consulta es `postgres`, que se salta RLS.
- El control de acceso real está en el código del servidor: cada consulta filtra por `user_id` o por el correo de la sesión.

```
Navegador ──► Next.js (servidor) ──► pool pg ──► Supabase Postgres
             componentes, actions,              (rol postgres)
             route handlers
```

### Por qué no Supabase Auth

La consigna pedía tres datos: nombre, correo y contraseña. Con una tabla propia y una cookie firmada alcanza y evita depender de enlaces mágicos, SMTP de Auth y sus límites de envío. La contraseña se guarda con **scrypt** (sal aleatoria de 16 bytes, hash de 64 bytes) y la sesión es una cookie `HttpOnly` firmada con HMAC-SHA256 (`AUTH_SECRET`, 30 días).

---

## 2. Tablas

| Tabla                  | Filas hoy | Para qué                                                                 |
| ---------------------- | --------- | ------------------------------------------------------------------------ |
| `users`                | 1         | Cuentas de cliente: nombre, correo único y hash de contraseña             |
| `products`             | 10        | Contenido, precio y orden del catálogo                                    |
| `product_colors`       | 14        | Colores por referencia con su hexadecimal                                 |
| `product_sizes`        | 40        | Stock por talla (`S`, `M`, `L`, `XL`)                                     |
| `coupons`              | 4         | Códigos con porcentaje, mínimo, usos, vigencia y estado                   |
| `orders`               | 4         | Cabecera del pedido, totales, estado y dueño opcional                     |
| `order_items`          | 4         | Líneas con copia de nombre, color, talla, precio unitario y total         |
| `coupon_redemptions`   | 1         | Canjes por pedido y correo, con `released_at` para devolver el uso        |

Las cuatro filas de `orders` son las compras de prueba del 19 de noviembre (detalle en
`docs/evidencias/e5/pruebas.md`). Antes de la QA las tablas estaban vacías. Cada compra descuenta
stock; los pedidos pendientes lo retienen hasta que se confirman, se rechazan o vencen. Para devolver
el inventario después de una demostración, ver el apartado 8.

**Tipos:** `product_type` (`basica`, `grafica`, `personalizada`), `product_fit` (`regular`, `oversize`), `product_size` (`S`, `M`, `L`, `XL`), `payment_method` (`mercado_pago`, `cash_on_delivery`) y `order_status` (`pending`, `in_process`, `approved`, `rejected`, `cancelled`, `refunded`).

### Reglas que viven en la base

- `products.price` y `compare_at_price` son enteros en pesos: no hay decimales que redondear.
- `product_sizes.stock >= 0` y `unique (product_id, size)`.
- `coupons.code` se guarda en mayúsculas y es la clave primaria.
- `orders.code` es único (`KM-…`) y `orders.payment_id` también: dos defensas contra webhooks duplicados.
- `coupon_redemptions.order_id` es único: un pedido no puede canjear dos veces el mismo cupón.
- `orders.discount <= orders.subtotal`: el descuento nunca supera el valor de los productos.
- `order_items` guarda una copia del nombre y del precio: si mañana cambia el catálogo, el pedido histórico no cambia.

---

## 3. Funciones

| Función                          | Quién la llama                              | Qué garantiza                                                                 |
| -------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| `place_order(...)`               | `POST /api/checkout`                        | Pedido + líneas + cupón + stock en una transacción; calcula totales con precios de la base |
| `settle_payment(code, id, status)` | Webhook y `/api/payments/status`          | Cambia el estado una sola vez; al rechazar libera stock y cupón                |
| `release_order_stock(order_id)`  | `settle_payment` y vencimiento              | Idempotente: solo devuelve stock si `stock_released_at` es nulo                |
| `release_expired_orders(72)`     | Cron diario `/api/cron/release-stock`       | Cancela pedidos pendientes de más de 72 horas y libera sus recursos            |
| `claim_guest_orders(user_id)`    | Registro e inicio de sesión                 | Asigna a la cuenta los pedidos de invitado con el mismo correo                 |
| `admin_upsert_product(jsonb)`    | `scripts/seed-catalog.ts`                   | Upsert atómico de producto, colores y tallas                                   |

### Cómo calcula `place_order`

1. Ordena los ítems por `slug` y `size` antes de bloquear filas, para evitar interbloqueos.
2. Bloquea el cupón con `for update` y verifica existencia, vigencia, usos globales y uso por correo.
3. Crea el pedido en `pending` con subtotal y total en cero.
4. Recorre los ítems: verifica producto, mínimo, color y stock (`for update`), descuenta stock y crea la línea con el precio de la base.
5. Suma el subtotal, aplica `floor(subtotal × percent_off / 100)` y registra el canje.
6. Actualiza el pedido con subtotal, descuento y total. Si algo falla, la transacción completa se revierte.

El navegador nunca envía precios: solo `slug`, `size`, `color` y `quantity`. Cualquier intento de manipular el total termina en un pedido con el precio real o en un error.

### Ciclo del stock

| Momento                          | Stock            | Cupón                          |
| -------------------------------- | ---------------- | ------------------------------ |
| Se crea el pedido                | Se descuenta     | Se registra el canje           |
| Pago aprobado                    | Queda descontado | Queda consumido                |
| Pago rechazado o cancelado       | Se devuelve      | Se libera (`released_at`)      |
| Pendiente por más de 72 horas    | Se devuelve      | Se libera                      |

---

## 4. RLS y permisos

RLS está **habilitado en las 8 tablas**, pero no hay políticas y los permisos de `anon` y `authenticated` fueron revocados. No es un descuido: la aplicación no usa PostgREST, así que esos roles no necesitan acceso. Si alguien intenta leer con la clave pública del proyecto, recibe `permission denied`.

| Rol             | Acceso                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| `postgres`      | Todo (es el rol del pool del servidor; se salta RLS)                    |
| `anon`          | Nada                                                                   |
| `authenticated` | Nada                                                                   |
| `service_role`  | Sin uso en esta versión                                                |

La verificación `scripts/verify-schema.ts` comprueba los cuatro casos con `set local role anon`: catálogo, pedidos, cupones y cuentas responden `sin permiso`.

---

## 5. Cupones

| Código      | Descuento | Mínimo     | Usos | Por correo | Vigencia hasta      | Para qué              |
| ----------- | --------- | ---------- | ---- | ---------- | ------------------- | --------------------- |
| `PRIMERA10` | 10%       | $0         | 50   | 1          | 19 dic 2026         | Primera compra        |
| `VUELVE10`  | 10%       | $79.900    | 100  | 1          | 18 ene 2027         | Recuperar clientes    |
| `KMIZS15`   | 15%       | $199.800   | 30   | 1          | 3 ene 2027          | Ticket alto           |
| `EQUIPO20`  | 20%       | $479.400   | 20   | 1          | 18 ene 2027         | Equipos y eventos     |

- El descuento se aplica **solo sobre el subtotal de productos**, nunca sobre el envío.
- No se acumulan dos cupones en un pedido.
- El límite es por correo, no por persona: alguien con varios correos podría repetirlo. Se acepta y se documenta.
- Los márgenes del peor caso están en `docs/catalogo.md`; todos quedan por encima del piso de 35%.

### Administración desde Supabase Studio

No hay panel propio. En **SQL Editor**:

```sql
-- Crear un cupón
insert into public.coupons
  (code, percent_off, min_subtotal, max_uses, max_uses_per_email, ends_at, description)
values
  ('NAVIDAD15', 15, 199800, 40, 1, '2026-12-24 23:59:59-05', '15% desde $199.800');

-- Apagar un cupón
update public.coupons set active = false where code = 'KMIZS15';

-- Uso real por cupón
select c.code, c.max_uses,
       count(r.id) filter (where r.released_at is null) as usados
  from public.coupons c
  left join public.coupon_redemptions r on r.coupon_code = c.code
 group by c.code, c.max_uses
 order by c.code;
```

### Cambiar stock o precio

```sql
-- Ajustar el stock de una talla
update public.product_sizes s
   set stock = 12
  from public.products p
 where p.id = s.product_id
   and p.slug = 'basica-tinta'
   and s.size = 'M';

-- Cambiar el precio de una referencia
update public.products set price = 84900 where slug = 'basica-hueso';
```

El catálogo se lee con `cacheLife('minutes')` y la etiqueta `catalog`, así que un cambio se ve en el sitio en menos de un minuto, sin volver a desplegar.

---

## 6. Variables de entorno

| Variable                             | Dónde                          | Para qué                                                     |
| ------------------------------------ | ------------------------------ | ------------------------------------------------------------ |
| `DATABASE_URL`                       | local, preview y producción    | Cadena del pooler de Supabase; solo la lee el servidor        |
| `AUTH_SECRET`                        | local, preview y producción    | Firma HMAC de la cookie de sesión (mínimo 32 caracteres)      |
| `CRON_SECRET`                        | preview y producción           | Autoriza el cron que libera stock vencido                     |
| `NEXT_PUBLIC_META_PIXEL_ID`          | preview y producción           | Pixel de Meta; si falta, no se carga                          |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | producción                   | Verificación de Search Console                                |

`DATABASE_URL` usa el pooler **en modo transacción** (`aws-1-us-west-2.pooler.supabase.com:6543`) porque el host directo `db.<ref>.supabase.co` no resuelve desde esta red. El puerto `5432` es el modo sesión: reserva una conexión real por cliente y el proyecto solo admite 15, así que con varias instancias de Vercel devolvía `EMAXCONNSESSION`. El modo transacción comparte las conexiones entre consultas y tolera muchas más instancias. La cadena lleva la contraseña de la base: no se imprime, no se commitea y no se expone con prefijo `NEXT_PUBLIC_`.

Generar secretos nuevos:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 7. Migraciones y datos iniciales

```bash
# Aplicar las migraciones al proyecto remoto
npx --yes supabase@latest db push --remote="$DATABASE_URL" --include-all --yes

# Cargar las 10 referencias de data/products.ts (idempotente)
node --no-warnings --env-file=.env.local scripts/seed-catalog.ts

# Verificar esquema, stock y cupones (revierte sus pedidos de prueba)
node --no-warnings --env-file=.env.local scripts/verify-schema.ts
```

`data/products.ts` queda como fuente del seed. El sitio ya no lo importa: lee de Postgres.

### Resultado de la verificación (18 nov 2026)

```
OK · Catálogo y cupones cargados · {"products":10,"colors":14,"sizes":40,"coupons":4,"users":0}
OK · anon no lee el catálogo
OK · anon no lee pedidos
OK · anon no lee cupones
OK · anon no lee cuentas
OK · place_order calcula subtotal, descuento y total · {"subtotal":159800,"discount":15980,"total":143820}
OK · place_order descuenta stock · {"before":10,"after":8}
OK · place_order registra el canje · {"n":1}
OK · settle_payment marca rechazado
OK · settle_payment devuelve el stock · {"before":10,"after":10}
OK · settle_payment libera el cupón · {"n":1}
OK · reenviar el estado no duplica ni devuelve stock dos veces · {"after":10}
```

---

## 8. Consultas de control

```sql
-- Últimos pedidos con sus totales
select code, status, subtotal, discount, shipping, total, coupon_code, created_at
  from public.orders
 order by created_at desc
 limit 5;

-- Stock por talla de una referencia
select p.slug, s.size, s.stock
  from public.products p
  join public.product_sizes s on s.product_id = p.id
 where p.slug = 'basica-tinta'
 order by s.size;

-- Pedidos por estado
select status, count(*) from public.orders group by status order by status;

-- Cuentas creadas (sin exponer el hash)
select id, name, email, created_at from public.users order by created_at desc;

-- Pedidos que todavía retienen stock
select code, customer_email, status, created_at
  from public.orders
 where stock_released_at is null
 order by created_at desc;

-- Cancelar un pedido de prueba y devolver sus unidades
select public.settle_payment('KM-…', null, 'cancelled');
```

---

## 9. Límites conocidos

- **Plan gratuito de Supabase:** el proyecto se pausa por inactividad. Durante la semana de evaluación hay actividad diaria; si se pausa, se reactiva desde el panel.
- **Sin panel propio:** cupones, stock y pedidos se administran con SQL o con el editor de tablas de Studio. Es una decisión de alcance, no un pendiente.
- **Sin historial migrado:** los pedidos anteriores al Sprint 4 solo existen en correos; no se importaron.
- **Límite por correo:** un cupón puede usarse una vez por correo, no una vez por persona.
- **Cron diario:** el plan Hobby ejecuta el cron una vez al día, así que un pedido pendiente puede retener stock hasta 72 horas + 1 día.
