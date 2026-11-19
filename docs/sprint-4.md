# Plan · Sprint 4 — Base de datos, atención, medición y QA

**Proyecto:** KMIZS — tienda de camisetas · **Curso:** Comercio Electrónico
**Sprint:** 4 · **17 – 23 de noviembre de 2026**
**Tarjetas:** 4 · 40 puntos
**Responsable:** Horacio Campillo · **Revisor:** Ivan Arroyo

| Tarjeta                                                                   | Puntos |
| ------------------------------------------------------------------------- | ------ |
| `[E5] Persistencia en Supabase: catálogo, cuentas e historial de compras` | 21     |
| `[E6-E8] Atender y medir: WhatsApp Business, analítica y pixel`           | 6      |
| `[E5] Atraer visitas: redes, SEO básico y cupón de primera compra`        | 8      |
| `[E8] Pruebas de compra end-to-end en móvil (QA antes de la entrega)`     | 5      |

---

## Estado real del sprint (19 de noviembre)

Este archivo conserva el **plan original**. Durante la implementación se tomaron decisiones distintas
en cuatro puntos; lo desplegado en producción es esto:

| Tema            | Plan                                             | Implementación final                                                              |
| --------------- | ------------------------------------------------ | --------------------------------------------------------------------------------- |
| Cuentas         | Supabase Auth con enlace mágico                  | Tabla `public.users`, contraseña con scrypt y cookie HMAC de 30 días               |
| Acceso a datos | `anon` lee catálogo y `service_role` escribe     | Un solo rol `postgres` desde el servidor con `pg` y `DATABASE_URL`; sin claves API |
| Cupones         | Solo `PRIMERA10`                                 | `PRIMERA10`, `VUELVE10`, `KMIZS15` y `EQUIPO20`, aprobados por el PO              |
| `proxy.ts`      | Refrescaba la sesión de Supabase Auth            | Redirige `/cuenta` a `/cuenta/ingresar` cuando no hay cookie                      |
| Dependencias    | `@supabase/supabase-js`, `@supabase/ssr`         | Se retiraron; se agregaron `pg`, `server-only` y `@vercel/analytics`               |

La documentación vigente de la base es [`docs/base-de-datos.md`](base-de-datos.md) y la de medición,
[`docs/analitica.md`](analitica.md). Las pruebas reales sobre producción están en
[`docs/evidencias/e5/pruebas.md`](evidencias/e5/pruebas.md).

**Cierre:** los cuatro pull requests del sprint están fusionados en `main` (#26 a #29) y el
deployment de producción los incluye. Quedan dos pendientes ajenos al código: el identificador del
pixel de Meta y la verificación de Search Console.

---

## 1. Objetivo del sprint

Cerrar la semana 4 con cuatro resultados verificables:

1. **El pedido existe fuera del correo.** Catálogo, stock y pedidos en Supabase, con cuentas de
   cliente e historial.
2. **La tienda atiende y se puede medir.** WhatsApp Business configurado y los cuatro eventos de
   compra registrados, con el pixel bloqueado hasta que la persona acepte.
3. **La tienda se encuentra.** Sitemap, datos estructurados, Search Console, redes con UTM y un
   cupón de primera compra validado en el servidor.
4. **La compra se probó como la probaría un cliente.** Dos celulares y un escritorio, los dos medios
   de pago y las tres zonas, con los bugs corregidos o documentados.

**Advertencia de capacidad.** Son 40 puntos contra los 21 del Sprint 3, en la misma semana y con una
sola persona escribiendo código. El orden no es negociable: la base de datos va primero porque el
cupón y el estado del pedido dependen de ella, y el QA va último porque prueba lo que las otras tres
dejen. Si el sprint se queda corto, se corta por el final de esta lista, no por el principio.

---

## 2. Estado de partida (18 de noviembre)

| Pieza                                 | Estado hoy                                                                                                                         | Dónde vive                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Catálogo                              | 10 referencias escritas en TypeScript, importadas en el build                                                                      | `data/products.ts`                             |
| Stock                                 | Entero por talla en el código; se valida en el servidor y nunca se descuenta                                                       | `lib/products.ts`, `app/api/checkout/route.ts` |
| Carrito                               | Guarda `slug`, talla, color y cantidad; resuelve el producto en el navegador                                                       | `components/cart/CartProvider.tsx`             |
| Registro de pedido                    | Correo a `kmizs@protonmail.com` y, en desarrollo, una línea en un archivo                                                          | `lib/order-email.ts`, `lib/order-store.ts`     |
| Idempotencia del checkout             | Clave de Resend `order-${orderId}`                                                                                                 | `app/api/checkout/route.ts`                    |
| Idempotencia del webhook              | Clave `mercadopago-${paymentId}-${payment.status}`; no hay tabla de pedidos                                                        | `app/api/payments/webhook/route.ts`            |
| Cuentas e historial                   | No existen                                                                                                                         | —                                              |
| WhatsApp                              | El número `+57 310 389 8707` aparece en contacto, políticas, gracias y resultado de pago; no hay botón flotante ni perfil Business | `lib/site.ts`                                  |
| Analítica                             | No hay. `package.json` solo declara `next`, `react` y `react-dom`                                                                  | —                                              |
| Consentimiento                        | No hay banner de cookies; el checkout solo pide aceptar la política de datos                                                       | `components/checkout/CheckoutForm.tsx`         |
| SEO                                   | Metadatos por página y Open Graph en la ficha; textos alternativos reales                                                          | `app/layout.tsx`, `app/productos/**`           |
| Sitemap, robots y datos estructurados | No existen                                                                                                                         | —                                              |
| Cupones                               | No existen: el checkout no tiene campo de descuento y el servidor no conoce códigos                                                | —                                              |
| QA                                    | El Sprint 3 cubrió carrito, los tres estados de pago y 390 px con 13 capturas                                                      | `docs/evidencias/e3/pruebas.md`                |

**Lo que bloquea hoy:** sin tabla de pedidos, el webhook solo puede mandar un correo; no puede cambiar
un estado ni descontar stock. Sin cuentas, el cliente depende del WhatsApp para saber qué pasó con su
compra. Y sin analítica, el equipo no puede decir cuántas visitas llegaron ni de dónde.

---

## 3. Decisiones tomadas en la planificación

### 3.1 Base de datos

| Tema                         | Decisión                                                                          | Consecuencia                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Proveedor                    | Supabase (Postgres administrado)                                                  | Base relacional real, RLS y Auth en el mismo servicio; plan gratuito suficiente para el curso |
| Autenticación                | Supabase Auth con enlace mágico                                                   | No hay contraseñas ni hashes propios; el correo del pedido es el mismo de la cuenta           |
| RLS                          | Catálogo de lectura pública; pedidos solo del dueño; escritura con `service_role` | La clave anónima puede leer el catálogo y nada más                                            |
| Idempotencia                 | `orders.payment_id` con restricción `unique`                                      | El correo deja de ser la clave; reenviar un webhook no crea otra fila                         |
| Stock                        | Se descuenta al registrar el pedido y se devuelve si el pago se rechaza           | Un pedido abandonado retiene stock hasta que vence (72 h)                                     |
| Catálogo en el código        | `data/products.ts` queda como respaldo de la migración, no como fuente            | El sitio lee de la base; el archivo se conserva para poder rehacer la migración               |
| Preferencias de Mercado Pago | No se tocan en este sprint                                                        | La migración a Orders sigue como deuda técnica                                                |

#### Esquema

Se escribe en `supabase/migrations/`, se aplica con la CLI y se versiona en el repositorio.

```sql
create type public.product_type as enum ('basica', 'grafica', 'personalizada');
create type public.product_fit as enum ('regular', 'oversize');
create type public.product_size as enum ('S', 'M', 'L', 'XL');
create type public.payment_method as enum ('mercado_pago', 'cash_on_delivery');
create type public.order_status as enum (
  'pending', 'in_process', 'approved', 'rejected', 'cancelled', 'refunded'
);

create table public.products (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  type             public.product_type not null,
  fit              public.product_fit not null,
  price            integer not null check (price > 0),
  compare_at_price integer check (compare_at_price > price),
  summary          text not null,
  description      text not null,
  composition      text not null,
  care             text[] not null default '{}',
  image_src        text not null,
  image_alt        text not null,
  min_quantity     integer check (min_quantity > 1),
  featured         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.product_colors (
  id         bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  name       text not null,
  hex        text not null check (hex ~ '^#[0-9a-fA-F]{6}$'),
  unique (product_id, name)
);

create table public.product_sizes (
  id         bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  size       public.product_size not null,
  stock      integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);

create table public.coupons (
  code               text primary key,
  percent_off        integer not null check (percent_off between 1 and 50),
  min_subtotal       integer not null default 0,
  max_uses           integer not null check (max_uses > 0),
  max_uses_per_email integer not null default 1,
  starts_at          timestamptz not null default now(),
  ends_at            timestamptz not null,
  active             boolean not null default true
);

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,                 -- KM-…, el external_reference
  user_id           uuid references auth.users(id) on delete set null,
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text not null,
  address           text not null,
  city              text not null,
  department        text not null,
  notes             text,
  payment_method    public.payment_method not null,
  status            public.order_status not null default 'pending',
  payment_id        text unique,                          -- idempotencia del webhook
  coupon_code       text references public.coupons(code),
  subtotal          integer not null,
  discount          integer not null default 0 check (discount >= 0),
  shipping          integer check (shipping >= 0),
  shipping_zone     text,
  total             integer,
  stock_released_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.order_items (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  color        text not null,
  size         public.product_size not null,
  quantity     integer not null check (quantity > 0),
  unit_price   integer not null,
  total        integer not null
);

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  created_at timestamptz not null default now()
);

create table public.coupon_redemptions (
  id             bigint generated always as identity primary key,
  coupon_code    text not null references public.coupons(code) on delete cascade,
  order_id       uuid not null unique references public.orders(id) on delete cascade,
  customer_email text not null,
  discount       integer not null check (discount >= 0),
  created_at     timestamptz not null default now()
);
```

Las líneas del pedido guardan `product_name`, `unit_price` y `total` como copia. Si mañana cambia el
precio o se borra un producto, el pedido histórico sigue diciendo lo que se cobró.

#### Políticas de acceso (RLS)

```sql
alter table public.products           enable row level security;
alter table public.product_colors     enable row level security;
alter table public.product_sizes      enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.profiles           enable row level security;
alter table public.coupons            enable row level security;
alter table public.coupon_redemptions enable row level security;

-- Catálogo: lectura para cualquiera. Sin políticas de escritura: solo service_role.
create policy "Catálogo visible" on public.products       for select using (true);
create policy "Colores visibles" on public.product_colors for select using (true);
create policy "Tallas visibles"  on public.product_sizes  for select using (true);

-- Pedidos: cada cliente ve los suyos. La escritura pasa por el servidor.
create policy "Pedidos propios" on public.orders
  for select using (auth.uid() = user_id);
create policy "Líneas del pedido propio" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Perfil: solo el dueño.
create policy "Perfil propio" on public.profiles
  for select using (auth.uid() = id);
create policy "Actualizar perfil propio" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Cupones: sin políticas. Solo el servidor los lee y los escribe.
```

`service_role` omite RLS por diseño. Eso significa que **la clave de servicio nunca sale del
servidor**: no lleva prefijo `NEXT_PUBLIC_` y no se importa en componentes de cliente.

#### Stock y estados

Cuatro funciones en la base, todas `security definer` con `search_path = public` y ejecución revocada
para `anon` y `authenticated`:

| Función                            | Cuándo se llama                                       | Qué hace                                                                    |
| ---------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| `place_order(...)`                 | Al registrar el pedido, antes de crear la preferencia | Inserta pedido y líneas, aplica el cupón y descuenta stock con `for update` |
| `settle_payment(code, id, status)` | Desde el webhook y desde `/checkout/resultado`        | Cambia el estado; si el pago se rechaza, devuelve el stock una sola vez     |
| `release_order_stock(order_id)`    | Desde `settle_payment` y desde el vencimiento         | Devuelve al inventario las líneas del pedido                                |
| `release_expired_orders(72)`       | Cron diario                                           | Libera el stock de pedidos en `pending`/`in_process` con más de 72 h        |

```sql
create or replace function public.place_order(
  p_code text,
  p_customer jsonb,
  p_items jsonb,
  p_payment_method public.payment_method,
  p_shipping integer,
  p_shipping_zone text,
  p_user_id uuid default null,
  p_coupon_code text default null
) returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_stock integer;
  v_quantity integer;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_coupon public.coupons;
  v_email text := p_customer->>'email';
begin
  if p_coupon_code is not null then
    select * into v_coupon from public.coupons
     where code = upper(p_coupon_code) for update;

    if not found or not v_coupon.active
       or now() < v_coupon.starts_at or now() > v_coupon.ends_at then
      raise exception 'CUPON_INVALIDO';
    end if;

    if (select count(*) from public.coupon_redemptions where coupon_code = v_coupon.code)
       >= v_coupon.max_uses then
      raise exception 'CUPON_AGOTADO';
    end if;

    if (select count(*) from public.coupon_redemptions
         where coupon_code = v_coupon.code and lower(customer_email) = lower(v_email))
       >= v_coupon.max_uses_per_email then
      raise exception 'CUPON_YA_USADO';
    end if;
  end if;

  insert into public.orders (
    code, user_id, customer_name, customer_email, customer_phone,
    address, city, department, notes, payment_method,
    coupon_code, subtotal, shipping, shipping_zone, total
  ) values (
    p_code, p_user_id,
    p_customer->>'name', p_customer->>'email', p_customer->>'phone',
    p_customer->>'address', p_customer->>'city', p_customer->>'department',
    nullif(p_customer->>'notes', ''), p_payment_method,
    v_coupon.code, 0, p_shipping, p_shipping_zone, null
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity := (v_item->>'quantity')::integer;

    select * into v_product from public.products where slug = v_item->>'slug';
    if not found then
      raise exception 'PRODUCTO_INEXISTENTE:%', v_item->>'slug';
    end if;

    select stock into v_stock
      from public.product_sizes
     where product_id = v_product.id and size = (v_item->>'size')::public.product_size
       for update;

    if v_stock is null or v_stock < v_quantity then
      raise exception 'SIN_STOCK:%', v_item->>'slug';
    end if;

    update public.product_sizes
       set stock = stock - v_quantity
     where product_id = v_product.id and size = (v_item->>'size')::public.product_size;

    insert into public.order_items (
      order_id, product_id, product_name, color, size, quantity, unit_price, total
    ) values (
      v_order.id, v_product.id, v_product.name, v_item->>'color',
      (v_item->>'size')::public.product_size, v_quantity,
      v_product.price, v_product.price * v_quantity
    );

    v_subtotal := v_subtotal + v_product.price * v_quantity;
  end loop;

  if v_coupon.code is not null then
    if v_subtotal < v_coupon.min_subtotal then
      raise exception 'CUPON_MINIMO';
    end if;
    v_discount := floor(v_subtotal * v_coupon.percent_off / 100.0);

    insert into public.coupon_redemptions (coupon_code, order_id, customer_email, discount)
    values (v_coupon.code, v_order.id, v_email, v_discount);
  end if;

  update public.orders
     set subtotal = v_subtotal,
         discount = v_discount,
         total = case when p_shipping is null then null
                      else v_subtotal - v_discount + p_shipping end,
         updated_at = now()
   where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.place_order(
  text, jsonb, jsonb, public.payment_method, integer, text, uuid, text
) from public, anon, authenticated;
grant execute on function public.place_order(
  text, jsonb, jsonb, public.payment_method, integer, text, uuid, text
) to service_role;
```

```sql
create or replace function public.release_order_stock(p_order_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.product_sizes s
     set stock = s.stock + t.quantity
    from (
      select product_id, size, sum(quantity)::integer as quantity
        from public.order_items
       where order_id = p_order_id and product_id is not null
       group by product_id, size
    ) t
   where s.product_id = t.product_id and s.size = t.size;
$$;

create or replace function public.settle_payment(
  p_code text,
  p_payment_id text,
  p_status text
) returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_status public.order_status;
begin
  v_status := case
    when p_status in ('pending', 'in_process', 'approved', 'rejected', 'cancelled', 'refunded')
      then p_status::public.order_status
    else 'in_process'
  end;

  select * into v_order from public.orders where code = p_code for update;
  if not found then
    raise exception 'PEDIDO_INEXISTENTE:%', p_code;
  end if;

  -- Reenviar la misma notificación no cambia nada.
  if v_order.payment_id = p_payment_id and v_order.status = v_status then
    return v_order;
  end if;

  if v_status in ('rejected', 'cancelled', 'refunded') and v_order.stock_released_at is null then
    perform public.release_order_stock(v_order.id);
    v_order.stock_released_at := now();
  end if;

  update public.orders
     set status = v_status,
         payment_id = coalesce(p_payment_id, payment_id),
         stock_released_at = v_order.stock_released_at,
         updated_at = now()
   where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

create or replace function public.release_expired_orders(p_hours integer default 72)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_count integer := 0;
begin
  for v_order in
    select * from public.orders
     where status in ('pending', 'in_process')
       and stock_released_at is null
       and created_at < now() - make_interval(hours => p_hours)
       for update
  loop
    perform public.release_order_stock(v_order.id);
    update public.orders
       set status = 'cancelled',
           stock_released_at = now(),
           updated_at = now()
     where id = v_order.id;
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;
```

**Límite conocido:** descontar al registrar y devolver al rechazar retiene stock en pedidos
abandonados. Se resuelve con el vencimiento a 72 h; no se implementa un carrito con reserva temporal
porque el carrito vive en el navegador y no tiene identificador en el servidor.

#### Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_META_PIXEL_ID=000000000000000
CRON_SECRET=<cadena-aleatoria>
```

`SUPABASE_DB_URL` solo se usa para la CLI y el script de migración; no se carga en Vercel. La clave
de servicio se carga en Vercel para producción y preview, y en `.env.local` para desarrollo.

### 3.2 Medición y consentimiento

| Tema             | Decisión                                                                          | Consecuencia                                                                                         |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Herramienta      | Vercel Web Analytics para visitas y Meta Pixel para el embudo                     | Una sola herramienta de páginas; no se instala GA4 porque sería un tercer sistema para el mismo dato |
| Consentimiento   | El pixel no se carga hasta que la persona acepta; Vercel Analytics no usa cookies | El banner aparece una vez y la decisión se guarda en `localStorage`                                  |
| Eventos          | `view_item`, `add_to_cart`, `begin_checkout`, `purchase`                          | Los cuatro se disparan desde un único `lib/analytics.ts` que no hace nada si falta el ID             |
| `purchase`       | Una sola vez por pedido, con `order_id` y valor                                   | Se marca en `sessionStorage` para que recargar la página de gracias no duplique la compra            |
| UTMs             | `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`                         | Los enlaces de la bio y de las publicaciones se documentan con su UTM                                |
| Datos personales | No se envían correo, teléfono ni dirección a ninguna herramienta                  | Solo el valor del pedido y el identificador `KM-…`                                                   |

El aviso de cookies se apoya en la política de tratamiento de datos que ya existe en
`/politicas/privacidad`; el banner agrega la elección explícita, no reemplaza la política.

### 3.3 Cupón de primera compra

| Tema       | Decisión                                                                | Consecuencia                                                                                                    |
| ---------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Código     | `PRIMERA10`: 10% sobre el subtotal de productos                         | No toca el envío; el envío gratis se calcula igual                                                              |
| Límites    | 50 usos totales, 1 por correo, vigencia de 30 días desde el lanzamiento | `coupon_redemptions` guarda el correo y el pedido; la base hace cumplir el límite                               |
| Validación | En `place_order`, dentro de la misma transacción del pedido             | El navegador solo ve una vista previa; si el cupón venció entre la vista previa y el pago, el pedido se rechaza |
| Margen     | 10% deja 53,1% en una prenda y 44,1% / 39,9% en dos con envío gratis    | Se documenta en `docs/catalogo.md`; el cupón no se acumula con otros descuentos                                 |
| Abuso      | El cupón no se puede usar dos veces con el mismo correo                 | La comparación es por `lower(customer_email)`                                                                   |

El margen se calcula con el costeo real: Básica Tinta cuesta $33.752 y se vende en $79.900. Con 10% de
descuento quedan $71.910 y un margen de 53,1%. Dos prendas con envío gratis a Medellín dejan 44,1% y a
Bogotá 39,9%, todavía por encima del 35% que el proyecto fijó como piso.

### 3.4 SEO

| Tema                | Decisión                                                       | Consecuencia                                         |
| ------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| Sitemap y robots    | `app/sitemap.ts` y `app/robots.ts` generados desde el catálogo | Se actualizan solos cuando cambia el catálogo        |
| Datos estructurados | JSON-LD `Product` con `offers` en la ficha                     | Precio, moneda y disponibilidad legibles para Google |
| Canonical           | `alternates.canonical` en cada página                          | Evita que previews de Vercel compitan con producción |
| Search Console      | Verificación por registro DNS o etiqueta HTML                  | Se documenta la propiedad y se envía el sitemap      |
| Redes               | Perfiles de Instagram y TikTok con enlace UTM a la tienda      | El tráfico de la bio se puede atribuir               |

No se promete posicionamiento: el objetivo del sprint es que el sitio sea **indexable y medible**, no
que aparezca primero. La pauta pagada queda fuera del alcance.

---

## 4. Alcance del sprint

**Dentro:**

1. Proyecto de Supabase, esquema, RLS y migración del catálogo.
2. Catálogo leído de la base y pedidos escritos con `place_order`.
3. Webhook y página de resultado actualizando el estado; stock con devolución y vencimiento.
4. Cuentas con enlace mágico y página "Mis pedidos".
5. WhatsApp Business y botón flotante con mensaje prellenado.
6. Analítica, pixel, banner de consentimiento y convención de UTMs.
7. Perfiles y contenido inicial de Instagram y TikTok.
8. Sitemap, robots, JSON-LD, canonical y Search Console.
9. Cupón `PRIMERA10` validado en el servidor.
10. QA end-to-end en dos celulares y un escritorio.
11. Documentación, evidencia y retrospectiva.

**Fuera:**

- Lanzamiento, publicaciones de lanzamiento y tablero de KPIs (Sprint 5).
- Documento final y presentación (Sprint 5).
- Pauta pagada.
- Panel de administración propio: se usa el panel de Supabase.
- Facturación electrónica y transportadora.
- Migrar el historial que solo existe en correos.
- Cambiar la integración de Mercado Pago (sigue en Preferencias).

---

## 5. Lo que cambia en el código

1. `lib/products.ts` pasa a funciones asíncronas (`getAllProducts`, `getProductBySlug`) que leen de
   Supabase dentro de `'use cache'` con `cacheLife("minutes")`. Los tipos (`Product`, `Size`, `Fit`)
   no cambian.
2. `app/layout.tsx` se vuelve asíncrono: pide el catálogo y se lo pasa a `CartProvider`. El carrito
   deja de importar el catálogo y resuelve cada ítem contra lo que recibió del servidor.
3. `app/api/checkout/route.ts` valida stock, precio y cupón contra la base dentro de `place_order`,
   antes de crear la preferencia de Mercado Pago.
4. `app/api/payments/webhook/route.ts` y `app/checkout/resultado` llaman a `settle_payment`, así el
   estado se corrige aunque Mercado Pago no entregue el webhook.
5. `lib/analytics.ts` centraliza los eventos y `components/analytics/*` monta el banner de
   consentimiento y el pixel. `components/layout/WhatsAppButton.tsx` agrega el botón flotante.
6. `app/sitemap.ts`, `app/robots.ts` y `components/seo/ProductJsonLd.tsx` cubren lo que falta de SEO.
7. `app/api/coupons/validate/route.ts` y `components/checkout/CouponField.tsx` dan la vista previa del
   cupón; el cobro real lo decide `place_order`.
8. La autenticación usa `@supabase/ssr` con `await cookies()`. En Next 16 el archivo de intercepción
   se llama `proxy.ts`; `middleware.ts` está deprecado. El `proxy.ts` solo refresca la sesión.

Dependencias nuevas: `@supabase/supabase-js`, `@supabase/ssr` y `@vercel/analytics`.

---

## 6. Subtareas y entregables

### 6.1 `[E5] Persistencia en Supabase` — 21 puntos

| #   | Subtarea                                                              | Entregable                                             | Evidencia                                           |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| 1   | Crear el proyecto de Supabase y cargar las variables                  | Variables en local, preview y producción               | Captura del proyecto y de las variables             |
| 2   | Escribir el esquema, las políticas RLS y las funciones de stock       | `supabase/migrations/*.sql`                            | Migración aplicada y `supabase db lint` limpio      |
| 3   | Migrar las 10 referencias del catálogo                                | `scripts/migrate-catalog.ts` idempotente               | Conteos antes/después y segunda corrida sin cambios |
| 4   | Leer el catálogo desde Supabase y adaptar el carrito                  | `lib/products.ts` asíncrono y `CartProvider` con props | Cambio de stock en la base visible en el sitio      |
| 5   | Registrar el pedido con `place_order` antes de la preferencia         | `app/api/checkout/route.ts`                            | Fila en `orders` y líneas en `order_items`          |
| 6   | Actualizar el estado con `settle_payment` sin duplicar                | Webhook y `/checkout/resultado`                        | Reenvío del webhook sin fila ni correo nuevos       |
| 7   | Reservar, devolver y liberar stock                                    | Funciones SQL + cron `/api/cron/release-stock`         | Stock antes/después en aprobado y rechazado         |
| 8   | Cuentas con enlace mágico                                             | `/cuenta/ingresar`, `proxy.ts`                         | Correo de acceso y sesión iniciada                  |
| 9   | Página "Mis pedidos"                                                  | `/cuenta/pedidos`                                      | Captura con pedidos propios y sin los ajenos        |
| 10  | Regresión de los cuatro caminos y QA en 390 px                        | Lista de casos                                         | Capturas y pagos de prueba                          |
| 11  | Documentar el esquema, adjuntar evidencia y escribir la retrospectiva | `docs/base-de-datos.md`, `docs/evidencias/e5/`         | Documentos                                          |
| 12  | DoD                                                                   | Tarjeta en `✅ Hecho`                                  | Checklist completo                                  |

### 6.2 `[E6-E8] Atender y medir` — 6 puntos

| #   | Subtarea                                                                                 | Entregable                               | Evidencia                              |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------------------- | -------------------------------------- |
| 1   | Configurar WhatsApp Business: perfil, catálogo, horario, ausencia y 5 respuestas rápidas | Cuenta configurada                       | Capturas de cada sección               |
| 2   | Agregar el botón flotante con mensaje prellenado y UTM                                   | `components/layout/WhatsAppButton.tsx`   | Captura en móvil y enlace con UTM      |
| 3   | Crear `lib/analytics.ts` con los cuatro eventos                                          | `lib/analytics.ts`                       | Eventos en consola y en la herramienta |
| 4   | Activar Vercel Web Analytics y documentar las UTMs                                       | Panel con visitas                        | Captura de visitas y tabla de UTMs     |
| 5   | Implementar el banner de consentimiento que bloquea el pixel                             | `components/analytics/ConsentBanner.tsx` | Captura antes y después de aceptar     |
| 6   | Integrar Meta Pixel y verificar los cuatro eventos con una compra                        | Eventos en Meta Events Manager           | Captura de los cuatro eventos          |
| 7   | Documentar la medición                                                                   | `docs/analitica.md`                      | Documento                              |

### 6.3 `[E5] Atraer visitas` — 8 puntos

| #   | Subtarea                                                               | Entregable                                 | Evidencia                             |
| --- | ---------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------- |
| 1   | Crear los perfiles de Instagram y TikTok con identidad y enlace UTM    | Cuentas publicadas                         | Capturas de los perfiles              |
| 2   | Producir 8 piezas iniciales y el calendario de 4 semanas               | Calendario y piezas                        | Capturas y enlace al calendario       |
| 3   | Agregar `app/sitemap.ts` y `app/robots.ts`                             | Sitemap y robots publicados                | URLs abiertas en producción           |
| 4   | Agregar JSON-LD `Product`, canonical y metadatos faltantes             | `components/seo/ProductJsonLd.tsx`         | Rich Results Test sin errores         |
| 5   | Registrar el sitio en Google Search Console y enviar el sitemap        | Propiedad verificada                       | Captura de la propiedad y del sitemap |
| 6   | Crear `coupons` y `coupon_redemptions` y aplicarlas en `place_order`   | Migración SQL                              | Cupón usado y cupón rechazado         |
| 7   | Agregar el campo de cupón al checkout y la vista previa en el servidor | `CouponField.tsx`, `/api/coupons/validate` | Captura del descuento aplicado        |
| 8   | Revisar el margen con el cupón y documentarlo                          | `docs/catalogo.md` actualizado             | Tabla de margen con y sin cupón       |

### 6.4 `[E8] Pruebas end-to-end` — 5 puntos

| #   | Subtarea                                                           | Entregable                             | Evidencia                  |
| --- | ------------------------------------------------------------------ | -------------------------------------- | -------------------------- |
| 1   | Armar la matriz de 2 celulares + 1 escritorio × 2 medios × 3 zonas | Matriz de pruebas                      | Tabla con cada combinación |
| 2   | Verificar totales, stock y estado en la base para cada caso        | Consultas a `orders` y `product_sizes` | Capturas de las filas      |
| 3   | Revisar correos, WhatsApp y enlaces de políticas                   | Correos y enlaces                      | Capturas                   |
| 4   | Medir velocidad de carga en móvil                                  | Lighthouse móvil                       | Captura de LCP, CLS e INP  |
| 5   | Registrar bugs y corregirlos o documentarlos                       | Lista con estado                       | Tabla de bugs              |
| 6   | Repetir la compra después de cada corrección                       | Segunda pasada                         | Capturas de la repetición  |

---

## 7. Orden de trabajo y cronograma

| Día    | Trabajo                                                                                      |
| ------ | -------------------------------------------------------------------------------------------- |
| Mar 17 | Planificación y decisión del proveedor                                                       |
| Mié 18 | Supabase, esquema y RLS (`[E5]`); WhatsApp Business en paralelo (`[E6-E8]`)                  |
| Jue 19 | Migración del catálogo y funciones de stock (`[E5]`); botón de WhatsApp y `lib/analytics.ts` |
| Vie 20 | Pedidos, webhook y cuentas (`[E5]`); pixel, consentimiento y UTMs (`[E6-E8]`)                |
| Sáb 21 | Cupón sobre la base (`[E5]` atraer); sitemap, JSON-LD, Search Console y redes                |
| Dom 22 | QA de los cuatro caminos en dos celulares y un escritorio (`[E8]`) y correcciones            |
| Lun 23 | Evidencia, retrospectiva, revisión cruzada y cierre                                          |

El cupón se construye después de que `place_order` exista. El QA no empieza hasta que las otras tres
tarjetas estén desplegadas en preview.

---

## 8. Riesgos y mitigación

| Riesgo                                                                 | Impacto                                  | Mitigación                                                                                                        |
| ---------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 40 puntos en una semana con una persona                                | Alto — el sprint no se cierra            | Orden fijo: base de datos, atención, atracción, QA; si falta tiempo se recorta el final, no el principio          |
| La migración deja precios o stock distintos                            | Alto — se cobra mal o se vende sin stock | Script idempotente con verificación de conteos y comparación contra `data/products.ts`; ensayo en preview         |
| El catálogo deja de ser estático y el build falla con Cache Components | Alto — no se puede desplegar             | `'use cache'` con `cacheLife`; correr `next build` desde el primer día, no al final                               |
| RLS mal configurado expone pedidos                                     | Alto — datos personales de clientes      | Probar con la clave anónima que no se lee ningún pedido ajeno; revisar las políticas antes de cargar datos reales |
| Pedidos abandonados retienen stock                                     | Medio — se pierden ventas                | Liberación automática a las 72 h y consulta manual desde el panel de Supabase                                     |
| El webhook sigue sin llegar (deuda del Sprint 3)                       | Medio — estado desactualizado            | `/checkout/resultado` llama a `settle_payment` al volver del pago; el webhook queda como respaldo                 |
| El pixel se dispara antes del consentimiento                           | Alto — incumple la política de datos     | El componente del pixel solo se monta si `localStorage` dice "aceptado"; se prueba en ventana privada             |
| El cupón se usa varias veces o fuera de fecha                          | Medio — margen y promesa incumplida      | Validación y registro dentro de `place_order`; probar cupón vencido, agotado y repetido                           |
| Search Console no verifica la propiedad                                | Bajo — sin datos de búsqueda             | Verificar por DNS en Vercel; si falla, dejar la etiqueta HTML y documentar el intento                             |
| El contenido de redes no alcanza                                       | Bajo — sin piezas para publicar          | 8 piezas con las fotos que ya existen; el calendario se completa con lo que haya                                  |
| Una sola persona escribe el código                                     | Medio — cuello de botella                | Revisión cruzada obligatoria y sesión de traspaso                                                                 |

---

## 9. Definition of Done

Una tarjeta se cierra solo si:

1. Cumple los criterios de aceptación.
2. Está probada en celular (390 px) y escritorio.
3. La revisó alguien distinto de quien la construyó.
4. Está desplegada en Vercel (preview o producción).
5. Tiene evidencia adjunta (capturas, correos, enlaces).

Si la revisión cruzada no ocurre, se cierra dejando constancia explícita, como se hizo en E4.

---

## 10. Trazabilidad de criterios

### `[E5] Persistencia`

| Criterio                                                            | Cómo se verifica                                               |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| Catálogo, precios y stock vienen de Supabase                        | Cambiar un stock en el panel y verlo en la ficha sin desplegar |
| Un pedido de contraentrega y uno de Mercado Pago quedan en `orders` | Consulta a la tabla con el `KM-…` del correo                   |
| El webhook no duplica al reenviarse                                 | Enviar dos veces la misma notificación y comparar filas        |
| Aprobado descuenta stock; rechazado lo devuelve                     | Stock antes/después en cada caso                               |
| Un cliente con sesión ve sus pedidos y sin sesión no ve ninguno     | Dos navegadores: uno con enlace mágico y otro sin sesión       |
| `docs/base-de-datos.md` describe esquema, políticas y variables     | Documento publicado y enlazado desde el README                 |

### `[E6-E8] Atender y medir`

| Criterio                                                     | Cómo se verifica                                     |
| ------------------------------------------------------------ | ---------------------------------------------------- |
| WhatsApp Business con perfil, catálogo, horario y respuestas | Capturas de cada sección y mensaje de prueba         |
| Botón de WhatsApp visible con mensaje prellenado             | Abrir el enlace desde el celular y leer el texto     |
| Los cuatro eventos llegan a la herramienta                   | Compra de prueba y captura de cada evento            |
| El pixel no se carga antes de aceptar                        | Ventana privada: revisar la petición antes y después |
| UTMs documentadas                                            | Tabla con enlace, fuente y medio                     |

### `[E5] Atraer`

| Criterio                                        | Cómo se verifica                                       |
| ----------------------------------------------- | ------------------------------------------------------ |
| Perfiles de Instagram y TikTok con enlace UTM   | Captura de la bio y del tráfico atribuido              |
| Sitemap y robots publicados                     | Abrir `/sitemap.xml` y `/robots.txt` en producción     |
| JSON-LD sin errores                             | Rich Results Test sobre una ficha                      |
| Propiedad verificada en Search Console          | Captura de la propiedad y del sitemap enviado          |
| Cupón válido aplica y cupón inválido se rechaza | Un pedido con `PRIMERA10` y otro con un código falso   |
| El cupón no se repite con el mismo correo       | Segundo intento con el mismo correo → `CUPON_YA_USADO` |

### `[E8] QA`

| Criterio                                      | Cómo se verifica                                       |
| --------------------------------------------- | ------------------------------------------------------ |
| Compra completa en 2+ celulares y navegadores | Matriz con cada combinación y su captura               |
| Cada medio de pago y cada zona                | Contraentrega, aprobado, rechazado y pendiente         |
| Costos y correos correctos                    | Comparar total del checkout, correo y fila en `orders` |
| Enlaces de políticas funcionando              | Recorrido de los enlaces del pie y del checkout        |
| Velocidad revisada                            | Lighthouse móvil con LCP, CLS e INP anotados           |
| Bugs corregidos o documentados                | Tabla con estado y motivo                              |

---

## 11. Deuda arrastrada del Sprint 3

| Tema                                   | Estado                                                                          | Cuándo                               |
| -------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| Revisión cruzada de `[E3]`             | Cerrada el 17 nov: Eduardo Jiménez marcó el DoD y movió la tarjeta a `✅ Hecho` | Hecho                                |
| Verificar un dominio en Resend         | Pendiente; se sigue enviando desde `onboarding@resend.dev`                      | Antes de recibir pedidos de terceros |
| KYC para credenciales de producción    | Pendiente                                                                       | 27 nov                               |
| Tarifas reales de la transportadora    | Pendiente; las publicadas son de referencia                                     | 27 nov                               |
| Confirmar una entrega real del webhook | Pendiente                                                                       | Al activar producción                |
| Migrar de Preferencias a Orders        | Deuda técnica                                                                   | Sprint 5 o cuando crezca el volumen  |

---

## 12. Estado de las subtareas (18 de noviembre)

| Tarjeta                         | Subtareas | Hechas | Estado                                             |
| ------------------------------- | --------- | ------ | -------------------------------------------------- |
| `[E5]` Persistencia en Supabase | 12        | 10     | Implementada y verificada; sin evidencia visual de Studio |
| `[E6-E8]` Atender y medir       | 7         | 5      | Analítica y botón de WhatsApp; pixel y Business pendientes |
| `[E5]` Atraer visitas           | 8         | 6      | Cupones, sitemap y robots; redes y Search Console pendientes |
| `[E8]` Pruebas end-to-end       | 6         | 4      | QA en producción con pagos y correos; sin Lighthouse |

Esta tabla se actualiza a medida que avanza el sprint. El plan no afirma que algo esté hecho antes de
estarlo.
