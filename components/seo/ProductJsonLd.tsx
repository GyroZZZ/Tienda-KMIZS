import { getTotalStock, type Product } from "@/lib/products";
import { getSiteUrl, site } from "@/lib/site";

/**
 * Datos estructurados de la ficha de producto.
 *
 * Le dicen a Google el nombre, el precio y la disponibilidad reales para que
 * la referencia pueda aparecer con precio en los resultados de búsqueda.
 */
export function ProductJsonLd({ product }: { product: Product }) {
  const origin = getSiteUrl();
  const inStock = getTotalStock(product) > 0;

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.summary,
    image: [`${origin}${product.image.src}`],
    sku: product.slug,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      url: `${origin}/productos/${product.slug}`,
      priceCurrency: "COP",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <script
      type="application/ld+json"
      // El contenido es nuestro y no incluye entrada del usuario.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
