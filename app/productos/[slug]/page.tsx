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
import { AddToCart } from "@/components/cart/AddToCart";
import { SizeAvailability } from "@/components/product/SizeAvailability";
import { TrustSignals } from "@/components/trust/TrustSignals";
import { getShippingOptions } from "@/lib/shipping";

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

function ProductDetails({
  product,
  shippingOptions,
}: {
  product: Product;
  shippingOptions: ReturnType<typeof getShippingOptions>;
}) {
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

      {product.minQuantity ? (
        <p className="mt-6 border border-ink/15 bg-bone-dim/60 px-4 py-3 text-sm text-ink/75">
          Pedido mínimo: <strong>{product.minQuantity} unidades</strong>. Consulta el tiempo de
          producción indicado en la descripción del producto.
        </p>
      ) : null}

      <AddToCart product={product} />

      <SizeAvailability product={product} />

      <TrustSignals context="product" />

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
              Envío gratis desde 2 prendas, del mismo modelo o de modelos distintos, y en todos los
              pedidos personalizados, de eventos y de equipos.
            </p>
            <p>
              {shippingOptions.confirmed
                ? `Para una sola prenda, envío: ${shippingOptions.zones
                    .map(
                      (zone) =>
                        `${zone.label}, ${zone.eta} (${new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(zone.rate)})`,
                    )
                    .join("; ")}.`
                : "Para una sola prenda, el costo y el tiempo de envío están pendientes de confirmación con la transportadora. Te los informaremos antes de pagar."}
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
  const shippingOptions = getShippingOptions();

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
            preload
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <ProductDetails product={product} shippingOptions={shippingOptions} />
      </div>
    </div>
  );
}
