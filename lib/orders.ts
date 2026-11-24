import "server-only";

import { randomUUID } from "node:crypto";

import { getCatalog } from "@/lib/catalog";
import { query, queryOne, readDatabaseErrorCode, readDatabaseErrorDetail } from "@/lib/db";
import type { Product, Size } from "@/lib/products";

/**
 * Pedidos, cupones y stock.
 *
 * Toda la lógica transaccional vive en funciones SQL (`place_order`,
 * `settle_payment`, `release_order_stock`). Aquí solo se validan las entradas,
 * se traducen los errores y se arma la respuesta para el navegador.
 */

export interface OrderItemInput {
  slug: string;
  size: Size;
  color: string;
  quantity: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  notes: string;
}

export type OrderStatus =
  | "pending"
  | "in_process"
  | "approved"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | "refunded";

export interface OrderRow {
  id: string;
  code: string;
  status: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  city: string;
  department: string;
  notes: string | null;
  payment_method: "mercado_pago" | "cash_on_delivery";
  payment_id: string | null;
  coupon_code: string | null;
  subtotal: number;
  discount: number;
  shipping: number | null;
  shipping_zone: string | null;
  total: number | null;
  created_at: Date;
}

export interface OrderItemRow {
  order_id: string;
  product_name: string;
  color: string;
  size: Size;
  quantity: number;
  unit_price: number;
  total: number;
}

const orderColumns = `
  id, code, status, customer_name, customer_email, customer_phone,
  address, city, department, notes, payment_method, payment_id,
  coupon_code, subtotal, discount, shipping, shipping_zone, total, created_at
`;

export function generateOrderCode(): string {
  return `KM-${randomUUID().toUpperCase()}`;
}

/** Traduce los códigos de error de las funciones SQL a mensajes para el comprador. */
export function describeOrderError(error: unknown): string {
  const code = readDatabaseErrorCode(error);
  const detail = readDatabaseErrorDetail(error);

  switch (code) {
    case "CUPON_INVALIDO":
      return "Ese cupón no existe o ya venció.";
    case "CUPON_AGOTADO":
      return "Ese cupón ya alcanzó su límite de usos.";
    case "CUPON_YA_USADO":
      return "Ya usaste este cupón con este correo.";
    case "CUPON_MINIMO":
      return "Tu compra no alcanza el mínimo para este cupón.";
    case "SIN_STOCK":
      return detail
        ? `La talla de ${detail} se agotó mientras comprabas. Actualiza el carrito.`
        : "Una talla se agotó mientras comprabas. Actualiza el carrito.";
    case "PRODUCTO_INEXISTENTE":
      return "Un producto de tu carrito ya no está disponible.";
    case "CANTIDAD_MINIMA":
      return "La cantidad no cumple el mínimo de ese producto.";
    case "COLOR_INEXISTENTE":
      return "Ese color ya no está disponible.";
    case "PEDIDO_INVALIDO":
      return "Revisa los datos del pedido e inténtalo de nuevo.";
    default:
      return "No pudimos registrar el pedido. Inténtalo de nuevo.";
  }
}

export interface CreateOrderInput {
  code: string;
  customer: OrderCustomer;
  items: OrderItemInput[];
  paymentMethod: "mercado_pago" | "cash_on_delivery";
  shipping: number | null;
  shippingZone: string | null;
  userId: string | null;
  couponCode: string | null;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderRow> {
  const rows = await query<OrderRow>(
    `select * from public.place_order(
       $1, $2::jsonb, $3::jsonb, $4::public.payment_method, $5, $6, $7, $8
     )`,
    [
      input.code,
      JSON.stringify(input.customer),
      JSON.stringify(input.items),
      input.paymentMethod,
      input.shipping,
      input.shippingZone,
      input.userId,
      input.couponCode,
    ],
  );

  const order = rows[0];
  if (!order) throw new Error("PEDIDO_INVALIDO");
  return order;
}

export async function settlePayment(
  code: string,
  paymentId: string | null,
  status: string,
): Promise<OrderRow | null> {
  const rows = await query<OrderRow>("select * from public.settle_payment($1, $2, $3)", [
    code,
    paymentId,
    status,
  ]);
  return rows[0] ?? null;
}

export async function savePreferenceId(code: string, preferenceId: string): Promise<void> {
  await query("update public.orders set payment_preference_id = $2 where code = $1", [
    code,
    preferenceId,
  ]);
}

export async function releaseExpiredOrders(hours = 72): Promise<number> {
  const rows = await query<{ release_expired_orders: number }>(
    "select public.release_expired_orders($1) as release_expired_orders",
    [hours],
  );
  return rows[0]?.release_expired_orders ?? 0;
}

export async function getOrderByCode(code: string): Promise<OrderRow | null> {
  return queryOne<OrderRow>(`select ${orderColumns} from public.orders where code = $1`, [code]);
}

export async function getOrderItems(orderId: string): Promise<OrderItemRow[]> {
  return query<OrderItemRow>(
    `select order_id, product_name, color, size, quantity, unit_price, total
       from public.order_items
      where order_id = $1
      order by id`,
    [orderId],
  );
}

export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}

export async function listOrdersForUser(userId: string): Promise<OrderWithItems[]> {
  const orders = await query<OrderRow>(
    `select ${orderColumns}
       from public.orders
      where user_id = $1
      order by created_at desc
      limit 50`,
    [userId],
  );

  if (orders.length === 0) return [];

  const items = await query<OrderItemRow>(
    `select order_id, product_name, color, size, quantity, unit_price, total
       from public.order_items
      where order_id = any($1::uuid[])
      order by id`,
    [orders.map((order) => order.id)],
  );

  return orders.map((order) => ({
    ...order,
    items: items.filter((item) => item.order_id === order.id),
  }));
}

export interface CouponPreview {
  valid: boolean;
  code?: string;
  percentOff?: number;
  discount?: number;
  description?: string;
  reason?: string;
}

interface CouponRow {
  code: string;
  percent_off: number;
  min_subtotal: number;
  max_uses: number;
  max_uses_per_email: number;
  ends_at: Date;
  active: boolean;
  description: string;
  uses: number;
}

/**
 * Vista previa del cupón para mostrarla en el checkout.
 *
 * No registra nada y no conoce el correo: el límite por correo y el consumo
 * real se validan dentro de `place_order`, en la misma transacción del pedido.
 */
export async function previewCoupon(
  codeInput: string,
  items: OrderItemInput[],
): Promise<CouponPreview> {
  const code = codeInput.trim().toUpperCase();
  const catalog = new Map<string, Product>((await getCatalog()).map((p) => [p.slug, p]));

  let subtotal = 0;
  for (const item of items) {
    const product = catalog.get(item.slug);
    if (!product) {
      return { valid: false, reason: "Un producto de tu carrito ya no está disponible." };
    }
    subtotal += product.price * item.quantity;
  }

  const coupon = await queryOne<CouponRow>(
    `select c.code, c.percent_off, c.min_subtotal, c.max_uses, c.max_uses_per_email,
            c.ends_at, c.active, c.description,
            (
              select count(*)::int
                from public.coupon_redemptions r
               where r.coupon_code = c.code
                 and r.released_at is null
            ) as uses
       from public.coupons c
      where c.code = $1`,
    [code],
  );

  if (!coupon || !coupon.active || coupon.ends_at.getTime() < Date.now()) {
    return { valid: false, reason: "Ese cupón no existe o ya venció." };
  }
  if (coupon.uses >= coupon.max_uses) {
    return { valid: false, reason: "Ese cupón ya alcanzó su límite de usos." };
  }
  if (subtotal < coupon.min_subtotal) {
    return { valid: false, reason: "Tu compra no alcanza el mínimo para este cupón." };
  }

  const discount = Math.floor((subtotal * coupon.percent_off) / 100);

  return {
    valid: true,
    code: coupon.code,
    percentOff: coupon.percent_off,
    discount,
    description: coupon.description,
  };
}
