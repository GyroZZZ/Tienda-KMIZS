import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa las camisetas que quieres comprar en KMIZS.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="text-4xl tracking-tight sm:text-5xl">Tu carrito</h1>

      <div className="mt-8 border border-ink/15 bg-bone-dim/40 p-8 text-center sm:p-12">
        <p className="font-display text-2xl tracking-tight">Todavía está vacío</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/65">
          El carrito de compras se habilita en la siguiente entrega del proyecto. Por ahora puedes
          explorar el catálogo y escribirnos para reservar tu talla.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/productos"
            className="inline-flex items-center justify-center bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
          >
            Ver camisetas
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center border border-ink/25 px-6 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition-colors hover:border-ink"
          >
            Escribirnos
          </Link>
        </div>
      </div>
    </div>
  );
}
