/**
 * Eventos del embudo.
 *
 * Se envían a Meta Pixel solo si la persona aceptó el consentimiento, y a
 * Vercel Web Analytics cuando está disponible. Nunca se envían datos
 * personales: solo nombres de producto, cantidades y valores.
 */

export type AnalyticsEvent = "view_item" | "add_to_cart" | "initiate_checkout" | "purchase";

export interface AnalyticsPayload {
  value?: number;
  currency?: "COP";
  content_ids?: string[];
  content_name?: string;
  contents?: { id: string; quantity: number; item_price: number }[];
  num_items?: number;
}

type MetaPixel = (...args: unknown[]) => void;

type VercelAnalytics = (
  event: "event",
  data: { name: string; data?: AnalyticsPayload },
) => void;

export function trackEvent(name: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const target = window as unknown as { fbq?: MetaPixel; va?: VercelAnalytics };

  if (typeof target.fbq === "function") {
    target.fbq("track", name, { currency: "COP", ...payload });
  }

  if (typeof target.va === "function") {
    target.va("event", { name, data: payload });
  }
}
