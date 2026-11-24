/**
 * Verificación del esquema del Sprint 4.
 *
 * Uso:
 *   node --env-file=.env.local scripts/verify-schema.ts
 *
 * Los pedidos de prueba ocurren dentro de una transacción que se revierte al
 * final: no dejan pedidos, canjes ni cambios de stock.
 */

import pg from "pg";

const { Client } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Falta DATABASE_URL. Agrégalo a .env.local.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

function check(label: string, condition: boolean, detail: unknown = "") {
  console.log(
    `${condition ? "OK" : "FALLA"} · ${label}${detail ? ` · ${JSON.stringify(detail)}` : ""}`,
  );
  if (!condition) process.exitCode = 1;
}

/** Ejecuta una consulta como `anon` en su propia transacción. */
async function asAnon(sql: string): Promise<number | "sin permiso"> {
  await client.query("begin");
  await client.query("set local role anon");
  try {
    const result = await client.query(sql);
    await client.query("rollback");
    return result.rows[0].n;
  } catch {
    await client.query("rollback");
    return "sin permiso";
  }
}

try {
  const counts = await client.query(`
    select
      (select count(*)::int from public.products) as products,
      (select count(*)::int from public.product_colors) as colors,
      (select count(*)::int from public.product_sizes) as sizes,
      (select count(*)::int from public.coupons) as coupons,
      (select count(*)::int from public.users) as users
  `);
  check(
    "Catálogo y cupones cargados",
    counts.rows[0].products === 10 && counts.rows[0].coupons === 4,
    counts.rows[0],
  );

  check("anon no lee el catálogo", (await asAnon("select count(*)::int as n from public.products")) === "sin permiso");
  check("anon no lee pedidos", (await asAnon("select count(*)::int as n from public.orders")) === "sin permiso");
  check("anon no lee cupones", (await asAnon("select count(*)::int as n from public.coupons")) === "sin permiso");
  check("anon no lee cuentas", (await asAnon("select count(*)::int as n from public.users")) === "sin permiso");

  await client.query("begin");

  const stockBefore = await client.query(
    `select s.stock
       from public.product_sizes s
       join public.products p on p.id = s.product_id
      where p.slug = 'basica-tinta' and s.size = 'M'`,
  );

  const order = await client.query(
    `select * from public.place_order(
       $1, $2::jsonb, $3::jsonb, $4::public.payment_method, $5, $6, $7, $8
     )`,
    [
      "KM-VERIFY-SPRINT4",
      JSON.stringify({
        name: "Prueba Sprint 4",
        email: "prueba@kmizs.co",
        phone: "3001234567",
        address: "Calle 1 # 2-3",
        city: "Medellín",
        department: "Antioquia",
        notes: "",
      }),
      JSON.stringify([{ slug: "basica-tinta", size: "M", color: "Tinta", quantity: 2 }]),
      "cash_on_delivery",
      0,
      "Envío gratis",
      null,
      "PRIMERA10",
    ],
  );

  const created = order.rows[0];
  check(
    "place_order calcula subtotal, descuento y total",
    created.subtotal === 159800 && created.discount === 15980 && created.total === 143820,
    { subtotal: created.subtotal, discount: created.discount, total: created.total },
  );

  check(
    "contraentrega nace confirmada",
    created.status === "confirmed",
    { status: created.status },
  );

  const stockAfterOrder = await client.query(
    `select s.stock
       from public.product_sizes s
       join public.products p on p.id = s.product_id
      where p.slug = 'basica-tinta' and s.size = 'M'`,
  );
  check(
    "place_order descuenta stock",
    stockAfterOrder.rows[0].stock === stockBefore.rows[0].stock - 2,
    { before: stockBefore.rows[0].stock, after: stockAfterOrder.rows[0].stock },
  );

  const redemption = await client.query(
    "select count(*)::int as n from public.coupon_redemptions where order_id = $1",
    [created.id],
  );
  check("place_order registra el canje", redemption.rows[0].n === 1, redemption.rows[0]);

  const rejected = await client.query("select * from public.settle_payment($1, $2, $3)", [
    "KM-VERIFY-SPRINT4",
    "999999",
    "rejected",
  ]);
  check("settle_payment marca rechazado", rejected.rows[0].status === "rejected");

  const stockAfterReject = await client.query(
    `select s.stock
       from public.product_sizes s
       join public.products p on p.id = s.product_id
      where p.slug = 'basica-tinta' and s.size = 'M'`,
  );
  check(
    "settle_payment devuelve el stock",
    stockAfterReject.rows[0].stock === stockBefore.rows[0].stock,
    { before: stockBefore.rows[0].stock, after: stockAfterReject.rows[0].stock },
  );

  const released = await client.query(
    "select count(*)::int as n from public.coupon_redemptions where order_id = $1 and released_at is not null",
    [created.id],
  );
  check("settle_payment libera el cupón", released.rows[0].n === 1, released.rows[0]);

  const repeated = await client.query("select * from public.settle_payment($1, $2, $3)", [
    "KM-VERIFY-SPRINT4",
    "999999",
    "rejected",
  ]);
  const stockAfterRepeat = await client.query(
    `select s.stock
       from public.product_sizes s
       join public.products p on p.id = s.product_id
      where p.slug = 'basica-tinta' and s.size = 'M'`,
  );
  check(
    "reenviar el estado no duplica ni devuelve stock dos veces",
    repeated.rows[0].status === "rejected" &&
      stockAfterRepeat.rows[0].stock === stockBefore.rows[0].stock,
    { after: stockAfterRepeat.rows[0].stock },
  );

  await client.query("rollback");
} catch (error) {
  await client.query("rollback").catch(() => undefined);
  console.error("Error en la verificación:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}
