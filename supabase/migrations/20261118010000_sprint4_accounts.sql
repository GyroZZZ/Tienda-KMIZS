-- Sprint 4 · KMIZS · segunda migración
-- Cuentas propias con nombre, correo y contraseña.
--
-- El acceso a la base ocurre solo desde el servidor con la cadena de conexión
-- de Postgres, así que las políticas de RLS quedan cerradas para `anon` y
-- `authenticated`: nadie llega por PostgREST.

-- ---------------------------------------------------------------------------
-- 1. Cuentas
-- ---------------------------------------------------------------------------

create table public.users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(btrim(name)) between 1 and 80),
  email         text not null unique check (email = lower(btrim(email))),
  password_hash text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Pedidos: el dueño ahora es una cuenta propia, no `auth.users`
-- ---------------------------------------------------------------------------

alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders
  add constraint orders_user_id_fkey
  foreign key (user_id) references public.users(id) on delete set null;

-- ---------------------------------------------------------------------------
-- 3. Fuera el perfil de Supabase Auth
-- ---------------------------------------------------------------------------

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles;

-- ---------------------------------------------------------------------------
-- 4. claim_guest_orders ahora recibe la cuenta
-- ---------------------------------------------------------------------------

drop function if exists public.claim_guest_orders();

create or replace function public.claim_guest_orders(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_email text;
  v_count integer := 0;
begin
  select email into v_email from public.users where id = p_user_id;

  if v_email is null then
    return 0;
  end if;

  update public.orders
     set user_id = p_user_id,
         updated_at = now()
   where user_id is null
     and customer_email = v_email;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.claim_guest_orders(uuid) from public, anon, authenticated;
grant execute on function public.claim_guest_orders(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Cerrar el acceso público
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;

drop policy if exists "Catalog products are public" on public.products;
drop policy if exists "Catalog colors are public" on public.product_colors;
drop policy if exists "Catalog sizes are public" on public.product_sizes;
drop policy if exists "Customers read their own orders" on public.orders;
drop policy if exists "Customers read their own order items" on public.order_items;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on function public.place_order(
  text, jsonb, jsonb, public.payment_method, integer, text, uuid, text
) from anon, authenticated;
revoke all on function public.release_order_stock(uuid) from anon, authenticated;
revoke all on function public.settle_payment(text, text, text) from anon, authenticated;
revoke all on function public.release_expired_orders(integer) from anon, authenticated;
revoke all on function public.admin_upsert_product(jsonb) from anon, authenticated;
