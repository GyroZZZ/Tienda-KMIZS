/**
 * Configuración central del sitio.
 * Todo lo que se repite en el layout (nombre, navegación, contacto) vive aquí.
 */

export const site = {
  name: "KMIZS",
  tagline: "Camisetas que se leen como se pronuncian",
  description:
    "Camisetas básicas, gráficas y personalizadas diseñadas e impresas en Colombia. Envíos a todo el país y pago contraentrega.",
  url: "https://tienda-kmizs.vercel.app",
  locale: "es_CO",
  city: "Colombia",
  email: "hola@kmizs.co",
} as const;

/**
 * Año del build. Se evalúa una sola vez al compilar, así que es estable
 * durante el prerenderizado (Cache Components no permite `new Date()` en render).
 */
export const shipping = {
  /** A partir de esta compra del mismo cliente el envío es gratis. */
  freeFromOrder: 3,
  standardRate: 15900,
  extendedRate: 18900,
} as const;

export const currentYear = new Date().getFullYear();

/**
 * URL pública del sitio.
 * Prioridad: variable explícita → dominio del proyecto en Vercel → valor por defecto.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return site.url;
}

export const mainNav = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Camisetas" },
  { href: "/guia-de-tallas", label: "Guía de tallas" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const footerNav = [
  {
    title: "Tienda",
    links: [
      { href: "/productos", label: "Todas las camisetas" },
      { href: "/guia-de-tallas", label: "Guía de tallas" },
      { href: "/carrito", label: "Carrito" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
      { href: "/politicas/envios", label: "Envíos y entregas" },
      { href: "/politicas/cambios", label: "Cambios y devoluciones" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/politicas/terminos", label: "Términos y condiciones" },
      { href: "/politicas/privacidad", label: "Tratamiento de datos" },
    ],
  },
] as const;
