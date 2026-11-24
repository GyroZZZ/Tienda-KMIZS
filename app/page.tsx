import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product/ProductCard";
import { getCatalog } from "@/lib/catalog";

const collections = [
  {
    name: "Básicas",
    description: "Algodón pesado, corte recto y colores que combinan con todo.",
    image: "/lifestyle/basicas.webp",
    alt: "Persona con camiseta básica de algodón color hueso",
  },
  {
    name: "Gráficas",
    description: "Diseños propios impresos en serie corta, pensados para durar.",
    image: "/lifestyle/graficas.webp",
    alt: "Persona con camiseta gráfica de líneas sobre fondo tinta",
  },
  {
    name: "Personalizadas",
    description: "Tu equipo, tu evento o tu marca con estampado a una tinta.",
    image: "/lifestyle/personalizadas.webp",
    alt: "Tres personas con camisetas del mismo color hueso",
  },
];

const steps = [
  {
    number: "01",
    title: "Elige tu prenda",
    text: "Revisa tallas, colores y disponibilidad en la ficha de cada referencia.",
  },
  {
    number: "02",
    title: "Déjanos tus datos",
    text: "Al registrar el pedido te llega el detalle por correo y por WhatsApp.",
  },
  {
    number: "03",
    title: "Recibe y coordina",
    text: "La contraentrega queda confirmada; con Mercado Pago esperamos el pago aprobado.",
  },
];

const promises = [
  "Envío gratis desde 2 prendas",
  "Contraentrega o Mercado Pago",
  "Diseñadas e impresas en Colombia",
];

export default async function HomePage() {
  const catalog = await getCatalog();
  const featured = catalog.filter((product) => product.featured).slice(0, 4);
  const highlights = featured.length > 0 ? featured : catalog.slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-bone">
        <div aria-hidden="true" className="absolute inset-0 grain opacity-50" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-14 md:py-20">
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
              Básicas de algodón pesado, gráficas de serie corta y personalizadas para tu equipo.
              Diseñadas e impresas acá.
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

            <p className="mt-7 text-[11px] font-semibold tracking-[0.14em] text-bone/60 uppercase">
              Envío gratis desde 2 prendas · Contraentrega o Mercado Pago
            </p>
          </div>

          <div className="relative">
            <div className="relative aspect-4/5 overflow-hidden bg-bone-dim">
              <Image
                src="/lifestyle/hero.webp"
                alt="Persona con camiseta básica de algodón color tinta"
                fill
                priority
                sizes="(min-width: 768px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-[11px] tracking-[0.14em] text-bone/60 uppercase">
              Básica Tinta · algodón pesado
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-bone-dim/40">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-7 sm:px-6 md:grid-cols-3 md:gap-8">
          {promises.map((promise) => (
            <p
              key={promise}
              className="border-l-2 border-accent pl-3 font-display text-sm tracking-[0.08em] uppercase"
            >
              {promise}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl tracking-tight sm:text-4xl">Tres formas de vestirla</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/65">
              Una para todos los días, otra para destacar y una para tu grupo.
            </p>
          </div>
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
                className="group flex h-full flex-col overflow-hidden border border-ink/15 bg-bone transition-colors hover:border-ink"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-bone-dim">
                  <Image
                    src={collection.image}
                    alt={collection.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between gap-5 p-6 transition-colors group-hover:bg-ink group-hover:text-bone">
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
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 md:pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink/10 pt-12">
          <div>
            <h2 className="text-3xl tracking-tight sm:text-4xl">Para empezar</h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/65">
              Referencias destacadas del catálogo, con su precio y su disponibilidad reales.
            </p>
          </div>
          <Link
            href="/productos"
            className="text-sm font-medium tracking-[0.12em] text-ink/60 uppercase underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-ink"
          >
            Ver todo el catálogo
          </Link>
        </div>

        <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-ink py-14 text-bone md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
            Cómo funciona
          </p>
          <h2 className="mt-3 text-3xl tracking-tight sm:text-4xl">De la talla a la entrega</h2>

          <ol className="mt-9 grid gap-9 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <li key={step.number}>
                <span className="font-display text-4xl text-accent">{step.number}</span>
                <h3 className="mt-3 text-xl tracking-tight">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-bone/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-bone-dim/60">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_0.95fr] md:py-16">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
              Equipos y eventos
            </p>
            <h2 className="mt-3 text-3xl tracking-tight sm:text-4xl">¿Vas con un grupo?</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
              Camisetas a juego, una sola cotización y una fecha de entrega. Cuéntanos cuántas
              necesitas y para cuándo; el envío es gratis en pedidos personalizados.
            </p>
            <Link
              href="/contacto"
              className="mt-7 inline-flex shrink-0 items-center justify-center bg-ink px-7 py-3.5 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
            >
              Pedir cotización
            </Link>
          </div>
          <div className="relative aspect-3/2 overflow-hidden border border-ink/10 bg-bone">
            <Image
              src="/lifestyle/equipos.webp"
              alt="Grupo de personas con camisetas del mismo color"
              fill
              loading="lazy"
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}
