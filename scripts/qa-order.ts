import pg from "pg";

const code = process.argv[2];
if (!code) {
  console.error("Falta el código del pedido.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const order = await client.query(
  `select code, status, payment_method, subtotal, discount, shipping, total,
          coupon_code, user_id, payment_id, stock_released_at, created_at
     from public.orders where code = $1`,
  [code],
);
const items = await client.query(
  `select product_name, size, color, quantity, unit_price, total
     from public.order_items
    where order_id = (select id from public.orders where code = $1)`,
  [code],
);
const redemptions = await client.query(
  `select coupon_code, customer_email, released_at from public.coupon_redemptions
    where order_id = (select id from public.orders where code = $1)`,
  [code],
);
const stock = await client.query(
  `select p.slug, s.size, s.stock
     from public.product_sizes s
     join public.products p on p.id = s.product_id
    where p.slug = 'basica-tinta' and s.size = 'M'`,
);

console.log(JSON.stringify({ order: order.rows[0] ?? null, items: items.rows, redemptions: redemptions.rows, stock: stock.rows }, null, 2));
await client.end();
