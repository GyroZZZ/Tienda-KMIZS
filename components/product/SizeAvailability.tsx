import Link from "next/link";

import { fitLabels, type Product } from "@/lib/products";
import { getMeasurement } from "@/lib/size-guide";

function stockLabel(stock: number): string {
  if (stock === 0) return "Agotada";
  if (stock <= 3) return `Últimas ${stock}`;
  return "Disponible";
}

export function SizeAvailability({ product }: { product: Product }) {
  const isCustom = product.type === "personalizada";

  return (
    <section className="mt-8 border-t border-ink/10 pt-6" aria-labelledby="tallas-titulo">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h2 id="tallas-titulo" className="text-sm font-semibold tracking-[0.12em] uppercase">
          Tallas y disponibilidad
        </h2>
        <Link
          href="/guia-de-tallas"
          className="text-sm underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
        >
          Ver guía de tallas
        </Link>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-ink/60">
        {fitLabels[product.fit]} · medidas en centímetros, tomadas sobre la prenda extendida.
      </p>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {product.sizes.map(({ size, stock }) => {
          const measurement = getMeasurement(product.fit, size);
          const soldOut = stock === 0;
          const lowStock = stock > 0 && stock <= 3;

          return (
            <li
              key={size}
              className={`border px-3 py-3 ${
                soldOut ? "border-ink/10 bg-bone-dim/30 text-ink/60" : "border-ink/15 bg-bone-dim/60"
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-xl leading-none">{size}</span>
                <span
                  className={`text-[10px] font-semibold tracking-[0.1em] uppercase ${
                    soldOut ? "text-ink/60" : lowStock ? "text-accent-dark" : "text-ink/60"
                  }`}
                >
                  {stockLabel(stock)}
                </span>
              </div>

              {measurement ? (
                <dl className="mt-3 space-y-1 text-xs text-ink/65">
                  <div className="flex justify-between gap-2">
                    <dt>Pecho</dt>
                    <dd className="tabular-nums">{measurement.chest} cm</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Largo</dt>
                    <dd className="tabular-nums">{measurement.length} cm</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Manga</dt>
                    <dd className="tabular-nums">{measurement.sleeve} cm</dd>
                  </div>
                </dl>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-ink/50">
        {isCustom
          ? "En las referencias personalizadas, las unidades indican la capacidad de producción por talla, no inventario físico. Confirmamos disponibilidad al recibir el pedido."
          : "Medidas de referencia del proveedor, pendientes de validar con la primera muestra física. El stock se actualiza con cada corte de inventario."}
      </p>
    </section>
  );
}
