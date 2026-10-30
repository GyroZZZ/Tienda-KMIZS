import { products } from "@/data/products";

export type ProductType = "basica" | "grafica" | "personalizada";

export const productTypeLabels: Record<ProductType, string> = {
  basica: "Básica",
  grafica: "Gráfica",
  personalizada: "Personalizada",
};

export type Size = "S" | "M" | "L" | "XL";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductSize {
  size: Size;
  stock: number;
}

export interface Product {
  slug: string;
  name: string;
  type: ProductType;
  /** Precio unitario en pesos colombianos. */
  price: number;
  /** Precio anterior, solo si está en promoción. */
  compareAtPrice?: number;
  summary: string;
  description: string;
  composition: string;
  care: string[];
  image: { src: string; alt: string };
  colors: ProductColor[];
  sizes: ProductSize[];
  /** Cantidad mínima para pedidos personalizados. */
  minQuantity?: number;
  featured?: boolean;
}

const priceFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getTotalStock(product: Product): number {
  return product.sizes.reduce((total, item) => total + item.stock, 0);
}
