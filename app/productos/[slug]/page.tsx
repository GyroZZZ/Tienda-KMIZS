import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatPrice,
  getAllProducts,
  getProductBySlug,
  productTypeLabels,
  type Product,
} from "@/lib/products";

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/productos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Camiseta no encontrada" };
  }

  return {
    title: product.name,
    description: product.summary,
    openGraph: {
      title: `${product.name} · KMIZS`,
      description: product.summary,
      images: [{ url: product.image.src, alt: product.image.alt }],
    },
  };
}

function ProductDetails({ product }: { product: Product }) {
  const totalStock = product.sizes.reduce((total, item) => total + item.stock, 0);

  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.24em] text-ink/50 uppercase">
        {productTypeLabels[product.type]}
      </p>

      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">{product.name}</h1>

      <p className="mt-4 flex flex-wrap items-baseline gap-3">
        <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
        {product.compareAtPrice ? (
          <span className="text-base text-ink/40 line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        ) : null}
        <span className="text-sm text-ink/50">IVA incluido</span>
      </p>

      <p className="mt-5 text-base leading-relaxed text-ink/75">{product.description}</p>

      <div className="mt-7">
        <h2 className="text-sm font-semibold tracking-[0.14em] text-ink/60 uppercase">Tallas</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((item) => {
            const available = item.stock > 0;
            return (
              <li key={item.size}>
                <span
                  aria-disabled={!available}
                  className={`flex size-11 items-center justify-center border text-sm font-semibold ${
                    available ? "border-ink/25 text-ink" : "border-ink/10 text-ink/30 line-through"
                  }`}
                >
                  {item.size}
                  <span className="sr-only">{available ? ` disponible` : " agotada"}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-ink/50">
          {totalStock > 0 ? `${totalStock} unidades disponibles` : "Sin stock por ahora"}
        </p>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold tracking-[0.14em] text-ink/60 uppercase">Colores</h2>
        <ul className="mt-3 flex flex-wrap gap-3">
          {product.colors.map((color) => (
            <li key={color.name} className="flex items-center gap-2 text-sm text-ink/75">
              <span
                aria-hidden="true"
                className="size-5 rounded-full border border-ink/20"
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
            </li>
          ))}
        </ul>
      </div>

      {product.minQuantity ? (
        <p className="mt-6 border border-ink/15 bg-bone-dim/60 px-4 py-3 text-sm text-ink/75">
          Pedido mínimo: <strong>{product.minQuantity} unidades</strong>. Entrega en 8 a 12 días
          hábiles.
        </p>
      ) : null}

      <div className="mt-8">
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed bg-ink px-7 py-4 text-sm font-semibold tracking-[0.12em] text-bone uppercase opacity-60 sm:w-auto"
        >
          Agregar al carrito
        </button>
        <p className="mt-3 text-sm leading-relaxed text-ink/60">
          El carrito y el pago en línea se habilitan en la siguiente entrega del proyecto. Mientras
          tanto,{" "}
          <Link
            href="/contacto"
            className="underline decoration-accent decoration-2 underline-offset-4"
          >
            escríbenos
          </Link>{" "}
          y reservamos tu talla.
        </p>
      </div>

      <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        <details className="group py-4">
          <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold tracking-[0.12em] uppercase">
            Composición y cuidado
            <span aria-hidden="true" className="text-lg leading-none group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink/70">
            <p>{product.composition}</p>
            <ul className="list-disc space-y-1 pl-5">
              {product.care.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </details>

        <details className="group py-4">
          <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold tracking-[0.12em] uppercase">
            Envíos y cambios
            <span aria-hidden="true" className="text-lg leading-none group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink/70">
            <p>
              Enviamos a toda Colombia en 2 a 5 días hábiles después del despacho. La primera y la
              segunda compra pagan tarifa plana; desde la tercera, el envío es gratis.
            </p>
            <p>
              Cambios de talla dentro de los 5 días siguientes a la entrega, sin uso y con la
              etiqueta puesta.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: PageProps<"/productos/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <nav aria-label="Ruta de navegación" className="text-xs text-ink/50">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href="/productos" className="hover:text-ink">
          Camisetas
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-14">
        <div className="relative aspect-4/5 overflow-hidden border border-ink/10 bg-bone-dim">
          <Image
            src={product.image.src}
            alt={product.image.alt}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            unoptimized
            className="object-cover"
          />
        </div>

        <ProductDetails product={product} />
      </div>
    </div>
  );
}
