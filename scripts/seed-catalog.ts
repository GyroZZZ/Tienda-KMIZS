/**
 * Migra las 10 referencias de `data/products.ts` a Postgres.
 *
 * Uso:
 *   node --env-file=.env.local scripts/seed-catalog.ts
 *
 * Es idempotente: cada producto se upserta por `slug` y sus colores y tallas
 * se reemplazan dentro de la misma transacción de `admin_upsert_product`.
 */

import pg from "pg";

import { products } from "../data/products.ts";

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

try {
  for (const [index, product] of products.entries()) {
    const payload = {
      slug: product.slug,
      name: product.name,
      type: product.type,
      fit: product.fit,
      price: product.price,
      compare_at_price: product.compareAtPrice ?? null,
      summary: product.summary,
      description: product.description,
      composition: product.composition,
      care: product.care,
      image_src: product.image.src,
      image_alt: product.image.alt,
      min_quantity: product.minQuantity ?? null,
      featured: product.featured ?? false,
      sort_order: index,
      colors: product.colors,
      sizes: product.sizes,
    };

    const { rows } = await client.query(
      "select public.admin_upsert_product($1::jsonb) as id",
      [JSON.stringify(payload)],
    );

    console.log(`${product.slug} -> ${rows[0].id}`);
  }

  const { rows } = await client.query(`
    select
      (select count(*) from public.products) as products,
      (select count(*) from public.product_colors) as colors,
      (select count(*) from public.product_sizes) as sizes,
      (select coalesce(sum(stock), 0) from public.product_sizes) as stock
  `);

  console.log("Conteos:", rows[0]);
} finally {
  await client.end();
}
