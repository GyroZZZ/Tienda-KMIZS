import type { MetadataRoute } from "next";

import { getCatalogSlugs } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();
  const slugs = await getCatalogSlugs();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${origin}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/productos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${origin}/guia-de-tallas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    { url: `${origin}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    {
      url: `${origin}/preguntas-frecuentes`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${origin}/politicas/envios`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/politicas/cambios`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    {
      url: `${origin}/politicas/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${origin}/politicas/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${origin}/productos/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
