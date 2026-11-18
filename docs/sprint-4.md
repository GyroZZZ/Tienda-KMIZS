# Plan · Sprint 4 — Base de datos: catálogo, pedidos, cuentas e historial

**Proyecto:** KMIZS — tienda de camisetas · **Curso:** Comercio Electrónico
**Sprint:** 4 · **17 – 23 de noviembre de 2026**
**Tarjeta:** `[E5] Persistencia en Supabase: catálogo, cuentas e historial de compras` · 21 puntos
**Responsable:** Horacio Campillo · **Revisor:** Ivan Arroyo

---

## 1. Objetivo del sprint

Sacar el catálogo, el stock y los pedidos de los archivos del repositorio y del buzón de correo. Al
final del sprint, cambiar un stock o un precio en la base debe verse en el sitio sin desplegar, cada
pedido debe existir como fila con sus líneas, y un cliente debe poder entrar con un enlace mágico y
ver sus compras.

El Sprint 3 dejó la compra funcionando en modo de prueba. Lo que falta no es cobrar: es que el
pedido **exista en algún lado consultable** y que el stock se mueva solo.

---

## 2. Estado de partida (18 de noviembre)

| Pieza                    | Estado hoy                                                                   | Dónde vive                                     |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| Catálogo                 | 10 referencias escritas en TypeScript, importadas en el build                | `data/products.ts`                             |
| Stock                    | Entero por talla en el código; se valida en el servidor y nunca se descuenta | `lib/products.ts`, `app/api/checkout/route.ts` |
| Carrito                  | Guarda `slug`, talla, color y cantidad; resuelve el producto en el navegador | `components/cart/CartProvider.tsx`             |
| Registro de pedido       | Correo a `kmizs@protonmail.com` y, en desarrollo, una línea en un archivo    | `lib/order-email.ts`, `lib/order-store.ts`     |
| Idempotencia del pedido  | Clave de Resend `order-${orderId}` en el checkout                            | `app/api/checkout/route.ts`                    |
| Idempotencia del webhook | Clave `mercadopago-${paymentId}-${payment.status}`; no hay tabla de pedidos  | `app/api/payments/webhook/route.ts`            |
| Estado del pedido        | Solo el texto del correo; no se puede consultar ni corregir                  | —                                              |
| Cuentas de cliente       | No existen                                                                   | —                                              |
| Historial de compras     | No existe; el comprador no tiene dónde ver su pedido                         | —                                              |

**Lo que bloquea hoy:** sin tabla de pedidos, el webhook solo puede mandar un correo; no puede cambiar
un estado ni descontar stock. Y sin cuentas, el cliente depende del WhatsApp para saber qué pasó con
su compra.

---

## 3. Decisiones tomadas en la planificación

| Tema                         | Decisión                                                                          | Consecuencia                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Proveedor                    | Supabase (Postgres administrado)                                                  | Base relacional real, RLS y Auth en el mismo servicio; plan gratuito suficiente para el curso |
| Autenticación                | Supabase Auth con enlace mágico                                                   | No hay contraseñas ni hashes propios; el correo del pedido es el mismo de la cuenta           |
| RLS                          | Catálogo de lectura pública; pedidos solo del dueño; escritura con `service_role` | La clave anónima puede leer el catálogo y nada más                                            |
| Idempotencia                 | `orders.payment_id` con restricción `unique`                                      | El correo deja de ser la clave; reenviar un webhook no crea otra fila                         |
| Stock                        | Se descuenta al registrar el pedido y se devuelve si el pago se rechaza           | Un pedido abandonado retiene stock hasta que vence (72 h)                                     |
| Catálogo en el código        | `data/products.ts` queda como respaldo de la migración, no como fuente            | El sitio lee de la base; el archivo se conserva para poder rehacer la migración               |
| Preferencias de Mercado Pago | No se tocan en este sprint                                                        | La migración a Orders sigue como deuda técnica                                                |

### 3.1 Esquema propuesto

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
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  type            public.product_type not null,
  fit             public.product_fit not null,
  price           integer not null check (price > 0),
  compare_at_price integer check (compare_at_price > price),
  summary         text not null,
  description     text not null,
  composition     text not null,
  care            text[] not null default '{}',
  image_src       text not null,
  image_alt       text not null,
  min_quantity    integer check (min_quantity > 1),
  featured        boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
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

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,                 -- KM-…, el external_reference
  user_id         uuid references auth.users(id) on delete set null,
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text not null,
  address         text not null,
  city            text not null,
  department      text not null,
  notes           text,
  payment_method  public.payment_method not null,
  status          public.order_status not null default 'pending',
  payment_id      text unique,                          -- idempotencia del webhook
  subtotal        integer not null,
  shipping        integer check (shipping >= 0),
  shipping_zone   text,
  total           integer,
  stock_released_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
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
```

Las líneas del pedido guardan `product_name`, `unit_price` y `total` como copia. Si mañana cambia el
precio o se borra un producto, el pedido histórico sigue diciendo lo que se cobró.

### 3.2 Políticas de acceso (RLS)

```sql
alter table public.products      enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_sizes  enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.profiles       enable row level security;

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
```

`service_role` omite RLS por diseño. Eso significa que **la clave de servicio nunca sale del
servidor**: no lleva prefijo `NEXT_PUBLIC_` y no se importa en componentes de cliente.

### 3.3 Stock y estados

Tres funciones en la base, todas `security definer` con `search_path = public` y ejecución revocada
para `anon` y `authenticated`:

| Función                            | Cuándo se llama                                       | Qué hace                                                                |
| ---------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| `place_order(...)`                 | Al registrar el pedido, antes de crear la preferencia | Inserta el pedido y las líneas y descuenta stock con `for update`       |
| `settle_payment(code, id, status)` | Desde el webhook y desde `/checkout/resultado`        | Cambia el estado; si el pago se rechaza, devuelve el stock una sola vez |
| `release_expired_orders(72)`       | Cron diario                                           | Libera el stock de pedidos en `pending`/`in_process` con más de 72 h    |

```sql
create or replace function public.place_order(
  p_code text,
  p_customer jsonb,
  p_items jsonb,
  p_payment_method public.payment_method,
  p_shipping integer,
  p_shipping_zone text,
  p_user_id uuid default null
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
begin
  insert into public.orders (
    code, user_id, customer_name, customer_email, customer_phone,
    address, city, department, notes, payment_method,
    subtotal, shipping, shipping_zone, total
  ) values (
    p_code, p_user_id,
    p_customer->>'name', p_customer->>'email', p_customer->>'phone',
    p_customer->>'address', p_customer->>'city', p_customer->>'department',
    nullif(p_customer->>'notes', ''), p_payment_method,
    0, p_shipping, p_shipping_zone, null
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

  update public.orders
     set subtotal = v_subtotal,
         total = case when p_shipping is null then null else v_subtotal + p_shipping end,
         updated_at = now()
   where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.place_order(text, jsonb, jsonb, public.payment_method, integer, text, uuid)
  from public, anon, authenticated;
grant execute on function public.place_order(text, jsonb, jsonb, public.payment_method, integer, text, uuid)
  to service_role;
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
```

```sql
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

### 3.4 Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

`SUPABASE_DB_URL` solo se usa para la CLI y el script de migración; no se carga en Vercel. La clave
de servicio se carga en Vercel para producción y preview, y en `.env.local` para desarrollo.

---

## 4. Alcance del sprint

**Dentro:**

1. Proyecto de Supabase, variables y CLI.
2. Esquema, RLS y funciones de stock.
3. Migración del catálogo con script verificable.
4. Catálogo leído de la base, con el carrito adaptado.
5. Pedido escrito en la base antes de ir a Mercado Pago.
6. Webhook y página de resultado actualizando el estado por `payment_id`.
7. Stock: descuento, devolución y vencimiento.
8. Cuentas con enlace mágico y página "Mis pedidos".
9. Regresión de los cuatro caminos y QA en 390 px.
10. Documentación, evidencia y retrospectiva.

**Fuera:**

- Panel de administración propio: se usa el panel de Supabase.
- Facturación electrónica, transportadora y cupones.
- Migrar el historial que solo existe en correos.
- Cambiar la integración de Mercado Pago (sigue en Preferencias).
- Recuperar contraseñas: no hay contraseñas.

---

## 5. Lo que cambia en el código

El catálogo deja de ser un arreglo síncrono. Esto es lo que más trabajo cuesta y conviene tenerlo
claro antes de empezar:

1. `lib/products.ts` pasa a exportar funciones asíncronas (`getAllProducts`, `getProductBySlug`)
   que leen de Supabase dentro de una función `'use cache'` con `cacheLife("minutes")`. Los tipos
   (`Product`, `Size`, `Fit`) no cambian, así que las páginas siguen usando el mismo contrato.
2. `app/layout.tsx` se vuelve asíncrono: pide el catálogo y se lo pasa a `CartProvider`. El carrito
   deja de importar el catálogo y resuelve cada ítem contra lo que recibió del servidor. El
   `sessionStorage` sigue guardando `slug`, talla, color y cantidad.
3. El servidor sigue siendo la única autoridad: `app/api/checkout/route.ts` vuelve a validar stock y
   precio contra la base dentro de `place_order`, aunque el navegador tenga datos viejos.
4. `app/api/checkout/route.ts` llama a `place_order` **antes** de crear la preferencia. Si la
   preferencia falla, el pedido queda en `pending` y su stock se libera a las 72 h.
5. `app/api/payments/webhook/route.ts` y `app/checkout/resultado` llaman a `settle_payment`. Así el
   estado se corrige aunque Mercado Pago no entregue el webhook, que es la deuda abierta del Sprint 3.
6. La autenticación usa `@supabase/ssr` con `await cookies()`. En Next 16 el archivo de intercepción
   se llama `proxy.ts`; `middleware.ts` está deprecado. El `proxy.ts` solo refresca la sesión, no
   protege rutas: la protección real es la política RLS y el `redirect` de la página.

Dependencias nuevas: `@supabase/supabase-js` y `@supabase/ssr`.

---

## 6. Subtareas y entregables

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

---

## 7. Cronograma

| Día    | Trabajo                                                                   |
| ------ | ------------------------------------------------------------------------- |
| Mar 17 | Planificación y decisión del proveedor                                    |
| Mié 18 | Proyecto de Supabase, variables, esquema y RLS                            |
| Jue 19 | Funciones de stock y migración del catálogo con verificación              |
| Vie 20 | Catálogo asíncrono, carrito con props y pedido en `place_order`           |
| Sáb 21 | Webhook, página de resultado, devolución y vencimiento de stock           |
| Dom 22 | Enlace mágico, "Mis pedidos", regresión de los cuatro caminos y QA 390 px |
| Lun 23 | Evidencia, retrospectiva, revisión cruzada y cierre                       |

---

## 8. Riesgos y mitigación

| Riesgo                                                                 | Impacto                                  | Mitigación                                                                                                                    |
| ---------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| La migración deja precios o stock distintos                            | Alto — se cobra mal o se vende sin stock | Script idempotente con verificación de conteos y comparación contra `data/products.ts`; ensayo en preview antes de producción |
| El catálogo deja de ser estático y el build falla con Cache Components | Alto — no se puede desplegar             | `'use cache'` con `cacheLife`; correr `next build` desde el primer día, no al final                                           |
| RLS mal configurado expone pedidos                                     | Alto — datos personales de clientes      | Probar con la clave anónima que no se lee ningún pedido ajeno; revisar las políticas antes de cargar datos reales             |
| Pedidos abandonados retienen stock                                     | Medio — se pierden ventas                | Liberación automática a las 72 h y consulta manual desde el panel de Supabase                                                 |
| El webhook sigue sin llegar (deuda del Sprint 3)                       | Medio — estado desactualizado            | `/checkout/resultado` llama a `settle_payment` al volver del pago; el webhook queda como respaldo                             |
| El enlace mágico cae en una URL no autorizada                          | Medio — nadie puede entrar               | Configurar `http://localhost:3000/auth/confirm` y la URL de producción en Supabase; documentarlo                              |
| Una sola persona escribe el código                                     | Medio — cuello de botella                | Revisión cruzada obligatoria y sesión de traspaso                                                                             |

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

| Criterio de aceptación                                              | Cómo se verifica                                                  |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Catálogo, precios y stock vienen de Supabase                        | Cambiar un stock en el panel y verlo en la ficha sin desplegar    |
| Un pedido de contraentrega y uno de Mercado Pago quedan en `orders` | Consulta a la tabla con el `KM-…` del correo                      |
| El webhook no duplica al reenviarse                                 | Enviar dos veces la misma notificación y comparar filas y correos |
| Aprobado descuenta stock; rechazado lo devuelve                     | Stock antes/después en cada caso                                  |
| Un cliente con sesión ve sus pedidos y sin sesión no ve ninguno     | Dos navegadores: uno con enlace mágico y otro sin sesión          |
| Los cuatro caminos siguen funcionando después de la migración       | Regresión de contraentrega, aprobado, rechazado y pendiente       |
| `docs/base-de-datos.md` describe esquema, políticas y variables     | Documento publicado y enlazado desde el README                    |

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

| #   | Subtarea                                   | Estado    | Evidencia / qué falta |
| --- | ------------------------------------------ | --------- | --------------------- |
| 1   | Proyecto de Supabase y variables           | Pendiente | —                     |
| 2   | Esquema, RLS y funciones de stock          | Pendiente | —                     |
| 3   | Migración del catálogo                     | Pendiente | —                     |
| 4   | Catálogo desde Supabase y carrito adaptado | Pendiente | —                     |
| 5   | Pedido en `place_order`                    | Pendiente | —                     |
| 6   | Estado con `settle_payment`                | Pendiente | —                     |
| 7   | Stock: descuento, devolución y vencimiento | Pendiente | —                     |
| 8   | Cuentas con enlace mágico                  | Pendiente | —                     |
| 9   | Página "Mis pedidos"                       | Pendiente | —                     |
| 10  | Regresión y QA 390 px                      | Pendiente | —                     |
| 11  | Documentación, evidencia y retrospectiva   | Pendiente | —                     |
| 12  | DoD                                        | Pendiente | —                     |

Esta tabla se actualiza a medida que avanza el sprint. El plan no afirma que algo esté hecho antes de
estarlo.
