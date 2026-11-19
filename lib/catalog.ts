import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { query } from "@/lib/db";
import type { Fit, Product, ProductType, Size } from "@/lib/products";

/**
 * Catálogo leído de Postgres.
 *
 * `'use cache'` guarda el resultado durante un minuto y lo invalida con la
 * etiqueta `catalog`, que se refresca al cambiar stock o precios. Así las
 * fichas siguen siendo estáticas sin mostrar existencias de hace días.
 */

interface ProductRow {
  slug: string;
  name: string;
  type: ProductType;
  fit: Fit;
  price: number;
  compare_at_price: number | null;
  summary: string;
  description: string;
  composition: string;
  care: string[];
  image_src: string;
  image_alt: string;
  min_quantity: number | null;
  featured: boolean;
  colors: { name: string; hex: string }[];
  sizes: { size: Size; stock: number }[];
}

const catalogSelect = `
  select
    p.slug,
    p.name,
    p.type,
    p.fit,
    p.price,
    p.compare_at_price,
    p.summary,
    p.description,
    p.composition,
    p.care,
    p.image_src,
    p.image_alt,
    p.min_quantity,
    p.featured,
    coalesce(
      (
        select json_agg(json_build_object('name', c.name, 'hex', c.hex) order by c.id)
          from public.product_colors c
         where c.product_id = p.id
      ),
      '[]'::json
    ) as colors,
    coalesce(
      (
        select json_agg(json_build_object('size', s.size, 'stock', s.stock) order by s.id)
          from public.product_sizes s
         where s.product_id = p.id
      ),
      '[]'::json
    ) as sizes
  from public.products p
`;

const catalogQuery = `${catalogSelect} order by p.sort_order, p.name`;
const productQuery = `${catalogSelect} where p.slug = $1`;

function toProduct(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    type: row.type,
    fit: row.fit,
    price: row.price,
    ...(row.compare_at_price === null ? {} : { compareAtPrice: row.compare_at_price }),
    summary: row.summary,
    description: row.description,
    composition: row.composition,
    care: row.care,
    image: { src: row.image_src, alt: row.image_alt },
    colors: row.colors,
    sizes: row.sizes,
    ...(row.min_quantity === null ? {} : { minQuantity: row.min_quantity }),
    featured: row.featured,
  };
}

export async function getCatalog(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");

  const rows = await query<ProductRow>(catalogQuery);
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");

  const rows = await query<ProductRow>(productQuery, [slug]);
  const row = rows[0];
  return row ? toProduct(row) : undefined;
}

export async function getCatalogSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");

  const rows = await query<{ slug: string }>(
    "select slug from public.products order by sort_order, name",
  );
  return rows.map((row) => row.slug);
}
