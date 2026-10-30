import Image from "next/image";
import Link from "next/link";

import { formatPrice, productTypeLabels, type Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.sizes.every((item) => item.stock === 0);

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <div className="relative aspect-4/5 overflow-hidden border border-ink/10 bg-bone-dim">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          // Los SVG de ejemplo no pasan por el optimizador; en el Sprint 2 llegan las fotos reales.
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="bg-bone/90 px-2 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
            {productTypeLabels[product.type]}
          </span>
          {product.compareAtPrice ? (
            <span className="bg-accent px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-bone uppercase">
              Oferta
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg leading-none tracking-tight">{product.name}</h3>
        <p className="flex items-baseline gap-2 text-sm">
          {product.compareAtPrice ? (
            <span className="text-ink/40 line-through">{formatPrice(product.compareAtPrice)}</span>
          ) : null}
          <span className="font-semibold">{formatPrice(product.price)}</span>
        </p>
      </div>

      <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{product.summary}</p>

      {soldOut ? (
        <p className="mt-2 text-xs font-semibold tracking-[0.14em] text-accent uppercase">
          Agotada por ahora
        </p>
      ) : null}
    </Link>
  );
}
