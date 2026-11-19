/**
 * Configuración central del sitio.
 * Todo lo que se repite en el layout (nombre, navegación, contacto) vive aquí.
 */

export const site = {
  name: "KMIZS",
  tagline: "Camisetas que se leen como se pronuncian",
  description:
    "Camisetas básicas, gráficas y personalizadas diseñadas e impresas en Colombia. Envío gratis desde 2 prendas y en pedidos personalizados.",
  url: "https://tienda-kmizs.vercel.app",
  locale: "es_CO",
  city: "Colombia",
  email: "kmizs@protonmail.com",
  whatsapp: "573150196386",
  whatsappDisplay: "+57 315 019 6386",
} as const;

export const currentYear = new Date().getFullYear();

/**
 * URL pública del sitio.
 * Prioridad: variable explícita → dominio de producción del proyecto en Vercel → localhost.
 *
 * `VERCEL_PROJECT_PRODUCTION_URL` va antes que `VERCEL_URL` a propósito: `VERCEL_URL` es el
 * hostname de este deployment y en Vercel queda detrás de Deployment Protection, así que el
 * comprador aterrizaría en un login de Vercel al volver de la pasarela y Mercado Pago no podría
 * entregar el webhook. El dominio de producción es público y estable.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return "http://localhost:3000";
}

export const mainNav = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Camisetas" },
  { href: "/guia-de-tallas", label: "Guía de tallas" },
  { href: "/contacto", label: "Contacto" },
  { href: "/cuenta", label: "Cuenta" },
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
