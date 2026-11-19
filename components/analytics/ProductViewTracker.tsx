"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

/**
 * Registra la vista de una ficha de producto.
 * Se monta en la página del producto, que sigue siendo estática.
 */
export function ProductViewTracker({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: number;
}) {
  useEffect(() => {
    trackEvent("view_item", {
      content_ids: [slug],
      content_name: name,
      value: price,
      currency: "COP",
    });
  }, [slug, name, price]);

  return null;
}
