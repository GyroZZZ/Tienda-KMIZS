import type { Metadata } from "next";

import { ProductCard } from "@/components/product/ProductCard";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Camisetas",
  description:
    "Catálogo de camisetas KMIZS: básicas de algodón pesado, gráficas de serie corta y personalizadas para equipos.",
};

export default function ProductsPage() {
  const products = getAllProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <header className="max-w-2xl">
        <p className="text-[11px] font-medium tracking-[0.24em] text-ink/50 uppercase">Catálogo</p>
        <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Todas las camisetas</h1>
        <p className="mt-4 text-base leading-relaxed text-ink/70">
          Algodón peinado de 240 g, impreso en Colombia. Elige tu talla en la ficha de cada
          referencia.
        </p>
      </header>

      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
