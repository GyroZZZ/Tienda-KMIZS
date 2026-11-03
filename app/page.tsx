import Link from "next/link";

const collections = [
  {
    name: "Básicas",
    description: "Algodón pesado, corte recto y colores que combinan con todo.",
  },
  {
    name: "Gráficas",
    description: "Diseños propios impresos en serie corta, pensados para durar.",
  },
  {
    name: "Personalizadas",
    description: "Tu equipo, tu evento o tu marca con estampado a una tinta.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-bone">
        <div aria-hidden="true" className="absolute inset-0 grain opacity-50" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-24">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-bone/60 uppercase">
              Camisetas · Colombia
            </p>

            <h1 className="mt-4 text-[clamp(2.75rem,12.5vw,7.5rem)] leading-[0.95] tracking-tight md:leading-[0.86]">
              Camisetas
              <br />
              que se leen
              <br />
              <span className="text-accent">como se</span>
              <br />
              pronuncian
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-bone/75">
              Básicas para todos los días, gráficas para destacar y personalizadas para tu equipo.
              Diseñadas e impresas acá; consulta cobertura y envío para tu ciudad.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center bg-accent px-7 py-3.5 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent-dark"
              >
                Ver camisetas
              </Link>
              <Link
                href="/guia-de-tallas"
                className="inline-flex items-center justify-center border border-bone/30 px-7 py-3.5 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:border-bone hover:bg-bone hover:text-ink"
              >
                Guía de tallas
              </Link>
            </div>
          </div>

          <div className="relative hidden aspect-4/5 items-end justify-start overflow-hidden bg-bone-dim p-8 md:flex">
            <span
              aria-hidden="true"
              className="absolute -top-10 -right-10 size-40 rounded-full bg-accent"
            />
            <p className="relative font-display text-6xl leading-[0.85] tracking-tight text-ink">
              100%
              <br />
              algodón
              <br />
              <span className="text-accent">pesado</span>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl tracking-tight sm:text-4xl">Tres formas de usarla</h2>
          <Link
            href="/productos"
            className="text-sm font-medium tracking-[0.12em] text-ink/60 uppercase underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-ink"
          >
            Ver todo el catálogo
          </Link>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {collections.map((collection, index) => (
            <li key={collection.name}>
              <Link
                href="/productos"
                className="group flex h-full flex-col justify-between gap-6 border border-ink/15 bg-bone p-6 transition-colors hover:border-ink hover:bg-ink hover:text-bone sm:gap-10"
              >
                <span className="font-display text-xs tracking-[0.2em] text-accent">
                  0{index + 1}
                </span>
                <span>
                  <span className="block font-display text-2xl tracking-tight">
                    {collection.name}
                  </span>
                  <span className="mt-2 block text-sm leading-relaxed text-ink/65 group-hover:text-bone/70">
                    {collection.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-ink/10 bg-bone-dim/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl tracking-tight sm:text-3xl">
              ¿Compras para un equipo o un evento?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
              Manejamos pedidos por volumen con precio especial y una sola fecha de entrega.
              Cuéntanos cuántas necesitas y te cotizamos.
            </p>
          </div>
          <Link
            href="/contacto"
            className="inline-flex shrink-0 items-center justify-center bg-ink px-7 py-3.5 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
          >
            Pedir cotización
          </Link>
        </div>
      </section>
    </>
  );
}
