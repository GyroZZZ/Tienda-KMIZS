-- Sprint 4 · KMIZS
-- Esquema, RLS, funciones de pedidos/stock/cupones y cupones iniciales.
-- Se aplica una sola vez con `supabase db push`.

-- ---------------------------------------------------------------------------
-- 1. Tipos
-- ---------------------------------------------------------------------------

create type public.product_type as enum ('basica', 'grafica', 'personalizada');
create type public.product_fit as enum ('regular', 'oversize');
create type public.product_size as enum ('S', 'M', 'L', 'XL');
create type public.payment_method as enum ('mercado_pago', 'cash_on_delivery');
create type public.order_status as enum (
  'pending', 'in_process', 'approved', 'rejected', 'cancelled', 'refunded'
);

-- ---------------------------------------------------------------------------
-- 2. Catálogo
-- ---------------------------------------------------------------------------

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
  sort_order       integer not null default 0,
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

-- ---------------------------------------------------------------------------
-- 3. Cupones
-- ---------------------------------------------------------------------------

create table public.coupons (
  code               text primary key check (code = upper(code)),
  percent_off        integer not null check (percent_off between 1 and 50),
  min_subtotal       integer not null default 0 check (min_subtotal >= 0),
  max_uses           integer not null check (max_uses > 0),
  max_uses_per_email integer not null default 1 check (max_uses_per_email > 0),
  starts_at          timestamptz not null default now(),
  ends_at            timestamptz not null,
  active             boolean not null default true,
  description        text not null default '',
  created_at         timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- ---------------------------------------------------------------------------
-- 4. Pedidos
-- ---------------------------------------------------------------------------

create table public.orders (
  id                     uuid primary key default gen_random_uuid(),
  code                   text not null unique,
  user_id                uuid references auth.users(id) on delete set null,
  customer_name          text not null,
  customer_email         text not null,
  customer_phone         text not null,
  address                text not null,
  city                   text not null,
  department             text not null,
  notes                  text,
  payment_method         public.payment_method not null,
  status                 public.order_status not null default 'pending',
  payment_id             text unique,
  payment_preference_id  text,
  coupon_code            text references public.coupons(code),
  subtotal               integer not null check (subtotal >= 0),
  discount               integer not null default 0 check (discount >= 0),
  shipping               integer check (shipping >= 0),
  shipping_zone          text,
  total                  integer check (total >= 0),
  stock_released_at      timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  check (discount <= subtotal)
);

create table public.order_items (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  color        text not null,
  size         public.product_size not null,
  quantity     integer not null check (quantity > 0),
  unit_price   integer not null check (unit_price > 0),
  total        integer not null check (total > 0)
);

create table public.coupon_redemptions (
  id             bigint generated always as identity primary key,
  coupon_code    text not null references public.coupons(code) on delete cascade,
  order_id       uuid not null unique references public.orders(id) on delete cascade,
  customer_email text not null,
  discount       integer not null check (discount >= 0),
  created_at     timestamptz not null default now(),
  released_at    timestamptz
);

-- ---------------------------------------------------------------------------
-- 5. Perfiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. Índices
-- ---------------------------------------------------------------------------

create index orders_user_created_idx on public.orders (user_id, created_at desc)
  where user_id is not null;
create index orders_email_idx on public.orders (lower(customer_email));
create index orders_expiry_idx on public.orders (status, created_at)
  where stock_released_at is null;
create index order_items_order_idx on public.order_items (order_id);
create index coupon_redemptions_active_idx
  on public.coupon_redemptions (coupon_code, customer_email)
  where released_at is null;

-- ---------------------------------------------------------------------------
-- 7. Trigger de updated_at y perfiles
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 8. RLS
-- ---------------------------------------------------------------------------

alter table public.products           enable row level security;
alter table public.product_colors     enable row level security;
alter table public.product_sizes      enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.profiles           enable row level security;
alter table public.coupons            enable row level security;
alter table public.coupon_redemptions enable row level security;

create policy "Catalog products are public"
  on public.products for select to anon, authenticated using (true);

create policy "Catalog colors are public"
  on public.product_colors for select to anon, authenticated using (true);

create policy "Catalog sizes are public"
  on public.product_sizes for select to anon, authenticated using (true);

create policy "Customers read their own orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id);

create policy "Customers read their own order items"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

create policy "Customers read their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "Customers update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Cupones y canjes: RLS activo y sin políticas. Solo service_role los ve.

-- ---------------------------------------------------------------------------
-- 9. Permisos de tablas
-- ---------------------------------------------------------------------------

revoke all on public.products, public.product_colors, public.product_sizes
  from anon, authenticated;
grant select on public.products, public.product_colors, public.product_sizes
  to anon, authenticated;
grant all on public.products, public.product_colors, public.product_sizes
  to service_role;

revoke all on public.orders, public.order_items from anon, authenticated;
grant select on public.orders, public.order_items to authenticated;
grant all on public.orders, public.order_items to service_role;

revoke all on public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

revoke all on public.coupons, public.coupon_redemptions from anon, authenticated;
grant all on public.coupons, public.coupon_redemptions to service_role;

grant usage, select on all sequences in schema public to service_role;

-- ---------------------------------------------------------------------------
-- 10. place_order
-- ---------------------------------------------------------------------------

create or replace function public.place_order(
  p_code text,
  p_customer jsonb,
  p_items jsonb,
  p_payment_method public.payment_method,
  p_shipping integer,
  p_shipping_zone text,
  p_user_id uuid default null,
  p_coupon_code text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order       public.orders;
  v_item        jsonb;
  v_product     public.products;
  v_stock       integer;
  v_quantity    integer;
  v_subtotal    integer := 0;
  v_discount    integer := 0;
  v_coupon      public.coupons;
  v_has_coupon  boolean := false;
  v_uses        integer;
  v_email       text := lower(coalesce(p_customer ->> 'email', ''));
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'PEDIDO_INVALIDO';
  end if;

  if jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 20 then
    raise exception 'PEDIDO_INVALIDO';
  end if;

  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon
      from public.coupons
     where code = upper(trim(p_coupon_code))
       for update;

    if not found then
      raise exception 'CUPON_INVALIDO';
    end if;

    if not v_coupon.active
       or now() < v_coupon.starts_at
       or now() > v_coupon.ends_at then
      raise exception 'CUPON_INVALIDO';
    end if;

    select count(*) into v_uses
      from public.coupon_redemptions
     where coupon_code = v_coupon.code
       and released_at is null;

    if v_uses >= v_coupon.max_uses then
      raise exception 'CUPON_AGOTADO';
    end if;

    select count(*) into v_uses
      from public.coupon_redemptions
     where coupon_code = v_coupon.code
       and customer_email = v_email
       and released_at is null;

    if v_uses >= v_coupon.max_uses_per_email then
      raise exception 'CUPON_YA_USADO';
    end if;

    v_has_coupon := true;
  end if;

  insert into public.orders (
    code, user_id, customer_name, customer_email, customer_phone,
    address, city, department, notes, payment_method,
    coupon_code, subtotal, discount, shipping, shipping_zone, total
  ) values (
    p_code,
    p_user_id,
    p_customer ->> 'name',
    v_email,
    p_customer ->> 'phone',
    p_customer ->> 'address',
    p_customer ->> 'city',
    p_customer ->> 'department',
    nullif(p_customer ->> 'notes', ''),
    p_payment_method,
    case when v_has_coupon then v_coupon.code else null end,
    0,
    0,
    p_shipping,
    p_shipping_zone,
    null
  )
  returning * into v_order;

  for v_item in
    select value
      from jsonb_array_elements(p_items) as t(value)
     order by value ->> 'slug', value ->> 'size'
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'PEDIDO_INVALIDO';
    end if;

    select * into v_product
      from public.products
     where slug = v_item ->> 'slug';

    if not found then
      raise exception 'PRODUCTO_INEXISTENTE:%', v_item ->> 'slug';
    end if;

    if v_product.min_quantity is not null and v_quantity < v_product.min_quantity then
      raise exception 'CANTIDAD_MINIMA:%', v_product.slug;
    end if;

    perform 1
      from public.product_colors
     where product_id = v_product.id
       and name = v_item ->> 'color';

    if not found then
      raise exception 'COLOR_INEXISTENTE:%', v_item ->> 'color';
    end if;

    select stock into v_stock
      from public.product_sizes
     where product_id = v_product.id
       and size = (v_item ->> 'size')::public.product_size
       for update;

    if v_stock is null or v_stock < v_quantity then
      raise exception 'SIN_STOCK:%', v_item ->> 'slug';
    end if;

    update public.product_sizes
       set stock = stock - v_quantity
     where product_id = v_product.id
       and size = (v_item ->> 'size')::public.product_size;

    insert into public.order_items (
      order_id, product_id, product_name, color, size, quantity, unit_price, total
    ) values (
      v_order.id,
      v_product.id,
      v_product.name,
      v_item ->> 'color',
      (v_item ->> 'size')::public.product_size,
      v_quantity,
      v_product.price,
      v_product.price * v_quantity
    );

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  if v_has_coupon then
    if v_subtotal < v_coupon.min_subtotal then
      raise exception 'CUPON_MINIMO';
    end if;

    v_discount := floor(v_subtotal * v_coupon.percent_off / 100.0)::integer;

    insert into public.coupon_redemptions (
      coupon_code, order_id, customer_email, discount
    ) values (
      v_coupon.code, v_order.id, v_email, v_discount
    );
  end if;

  update public.orders
     set subtotal = v_subtotal,
         discount = v_discount,
         total = case
           when p_shipping is null then null
           else v_subtotal - v_discount + p_shipping
         end,
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

-- ---------------------------------------------------------------------------
-- 11. release_order_stock
-- ---------------------------------------------------------------------------

create or replace function public.release_order_stock(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders;
begin
  select * into v_order
    from public.orders
   where id = p_order_id
     for update;

  if not found then
    return false;
  end if;

  if v_order.stock_released_at is not null then
    return false;
  end if;

  update public.product_sizes s
     set stock = s.stock + t.quantity
    from (
      select product_id, size, sum(quantity)::integer as quantity
        from public.order_items
       where order_id = p_order_id
         and product_id is not null
       group by product_id, size
    ) t
   where s.product_id = t.product_id
     and s.size = t.size;

  update public.coupon_redemptions
     set released_at = now()
   where order_id = p_order_id
     and released_at is null;

  update public.orders
     set stock_released_at = now(),
         updated_at = now()
   where id = p_order_id;

  return true;
end;
$$;

revoke all on function public.release_order_stock(uuid)
  from public, anon, authenticated;
grant execute on function public.release_order_stock(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 12. settle_payment
-- ---------------------------------------------------------------------------

create or replace function public.settle_payment(
  p_code text,
  p_payment_id text,
  p_status text
)
returns public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order      public.orders;
  v_status     public.order_status;
  v_payment_id text := nullif(p_payment_id, '');
begin
  v_status := case
    when p_status in ('pending', 'in_process', 'approved', 'rejected', 'cancelled', 'refunded')
      then p_status::public.order_status
    else 'in_process'
  end;

  select * into v_order
    from public.orders
   where code = p_code
     for update;

  if not found then
    raise exception 'PEDIDO_INEXISTENTE:%', p_code;
  end if;

  if v_order.payment_id is not distinct from v_payment_id
     and v_order.status = v_status then
    return v_order;
  end if;

  if v_status in ('rejected', 'cancelled', 'refunded')
     and v_order.stock_released_at is null then
    perform public.release_order_stock(v_order.id);
  end if;

  update public.orders
     set status = v_status,
         payment_id = coalesce(v_payment_id, payment_id),
         updated_at = now()
   where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.settle_payment(text, text, text)
  from public, anon, authenticated;
grant execute on function public.settle_payment(text, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- 13. release_expired_orders
-- ---------------------------------------------------------------------------

create or replace function public.release_expired_orders(p_hours integer default 72)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order public.orders;
  v_count integer := 0;
begin
  for v_order in
    select *
      from public.orders
     where status in ('pending', 'in_process')
       and stock_released_at is null
       and created_at < now() - make_interval(hours => p_hours)
       for update
  loop
    perform public.release_order_stock(v_order.id);

    update public.orders
       set status = 'cancelled',
           updated_at = now()
     where id = v_order.id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.release_expired_orders(integer)
  from public, anon, authenticated;
grant execute on function public.release_expired_orders(integer) to service_role;

-- ---------------------------------------------------------------------------
-- 14. claim_guest_orders
-- ---------------------------------------------------------------------------

create or replace function public.claim_guest_orders()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_count integer := 0;
begin
  if v_uid is null then
    raise exception 'SIN_SESION';
  end if;

  select lower(email) into v_email
    from auth.users
   where id = v_uid;

  if v_email is null then
    return 0;
  end if;

  update public.orders
     set user_id = v_uid,
         updated_at = now()
   where user_id is null
     and lower(customer_email) = v_email;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.claim_guest_orders()
  from public, anon;
grant execute on function public.claim_guest_orders() to authenticated;

-- ---------------------------------------------------------------------------
-- 15. admin_upsert_product (solo para la migración del catálogo)
-- ---------------------------------------------------------------------------

create or replace function public.admin_upsert_product(p_product jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  insert into public.products (
    slug, name, type, fit, price, compare_at_price, summary, description,
    composition, care, image_src, image_alt, min_quantity, featured, sort_order
  ) values (
    p_product ->> 'slug',
    p_product ->> 'name',
    (p_product ->> 'type')::public.product_type,
    (p_product ->> 'fit')::public.product_fit,
    (p_product ->> 'price')::integer,
    nullif(p_product ->> 'compare_at_price', '')::integer,
    p_product ->> 'summary',
    p_product ->> 'description',
    p_product ->> 'composition',
    coalesce(
      array(select jsonb_array_elements_text(coalesce(p_product -> 'care', '[]'::jsonb))),
      '{}'::text[]
    ),
    p_product ->> 'image_src',
    p_product ->> 'image_alt',
    nullif(p_product ->> 'min_quantity', '')::integer,
    coalesce((p_product ->> 'featured')::boolean, false),
    coalesce((p_product ->> 'sort_order')::integer, 0)
  )
  on conflict (slug) do update set
    name = excluded.name,
    type = excluded.type,
    fit = excluded.fit,
    price = excluded.price,
    compare_at_price = excluded.compare_at_price,
    summary = excluded.summary,
    description = excluded.description,
    composition = excluded.composition,
    care = excluded.care,
    image_src = excluded.image_src,
    image_alt = excluded.image_alt,
    min_quantity = excluded.min_quantity,
    featured = excluded.featured,
    sort_order = excluded.sort_order,
    updated_at = now()
  returning id into v_id;

  delete from public.product_colors where product_id = v_id;
  insert into public.product_colors (product_id, name, hex)
  select v_id, c ->> 'name', c ->> 'hex'
    from jsonb_array_elements(coalesce(p_product -> 'colors', '[]'::jsonb)) as c;

  delete from public.product_sizes where product_id = v_id;
  insert into public.product_sizes (product_id, size, stock)
  select v_id, (s ->> 'size')::public.product_size, (s ->> 'stock')::integer
    from jsonb_array_elements(coalesce(p_product -> 'sizes', '[]'::jsonb)) as s;

  return v_id;
end;
$$;

revoke all on function public.admin_upsert_product(jsonb)
  from public, anon, authenticated;
grant execute on function public.admin_upsert_product(jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- 16. Cupones iniciales
-- ---------------------------------------------------------------------------

insert into public.coupons (
  code, percent_off, min_subtotal, max_uses, max_uses_per_email,
  starts_at, ends_at, active, description
) values
  ('PRIMERA10', 10, 0, 50, 1,
   '2026-11-18 00:00:00-05', '2026-12-18 23:59:59-05', true,
   '10% en tu primera compra'),
  ('VUELVE10', 10, 79900, 100, 1,
   '2026-11-18 00:00:00-05', '2027-01-17 23:59:59-05', true,
   '10% para volver a comprar'),
  ('KMIZS15', 15, 199800, 30, 1,
   '2026-11-18 00:00:00-05', '2027-01-02 23:59:59-05', true,
   '15% en compras desde $199.800'),
  ('EQUIPO20', 20, 479400, 20, 1,
   '2026-11-18 00:00:00-05', '2027-01-17 23:59:59-05', true,
   '20% en pedidos de equipo desde $479.400')
on conflict (code) do nothing;
