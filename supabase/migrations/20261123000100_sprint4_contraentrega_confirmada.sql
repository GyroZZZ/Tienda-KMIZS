-- ---------------------------------------------------------------------------
-- Sprint 4 · Contraentrega confirmada desde el registro
--
-- 1. `place_order` crea el pedido en `confirmed` cuando el medio de pago es
--    contraentrega y en `pending` cuando es Mercado Pago, que espera el pago.
-- 2. `release_expired_orders` deja de expirar contraentrega: ese cron existe
--    para liberar stock de pagos digitales abandonados, no de pedidos que se
--    cobran al entregar.
-- 3. Los pedidos de contraentrega que ya estaban en `pending` pasan a
--    `confirmed`, para que el historial quede igual que los nuevos.
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
    address, city, department, notes, payment_method, status,
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
    case
      when p_payment_method = 'cash_on_delivery' then 'confirmed'::public.order_status
      else 'pending'::public.order_status
    end,
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
       and payment_method = 'mercado_pago'
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

update public.orders
   set status = 'confirmed',
       updated_at = now()
 where payment_method = 'cash_on_delivery'
   and status = 'pending'
   and stock_released_at is null;
