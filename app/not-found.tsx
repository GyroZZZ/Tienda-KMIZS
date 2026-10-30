import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-4 py-20 sm:px-6 md:py-28">
      <p className="font-display text-xs tracking-[0.28em] text-accent">Error 404</p>
      <h1 className="mt-4 text-5xl tracking-tight sm:text-6xl">Esta camiseta no existe</h1>
      <p className="mt-4 text-base leading-relaxed text-ink/70">
        La página que buscas no está disponible o cambió de dirección. Revisa el catálogo o vuelve
        al inicio.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/productos"
          className="inline-flex items-center justify-center bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
        >
          Ver camisetas
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center border border-ink/25 px-6 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition-colors hover:border-ink"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
