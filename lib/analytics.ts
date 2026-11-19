/**
 * Eventos del embudo y de contacto.
 *
 * Se envían a Meta Pixel solo si la persona aceptó el consentimiento, y a
 * Vercel Web Analytics cuando está disponible. Nunca se envían datos
 * personales: solo nombres de producto, cantidades y valores.
 */

export type AnalyticsEvent =
  | "view_item"
  | "add_to_cart"
  | "initiate_checkout"
  | "purchase"
  | "whatsapp_click";

export interface AnalyticsPayload {
  value?: number;
  currency?: "COP";
  content_ids?: string[];
  content_name?: string;
  contents?: { id: string; quantity: number; item_price: number }[];
  num_items?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

type MetaPixel = (...args: unknown[]) => void;

type VercelAnalytics = (
  event: "event",
  data: { name: string; data?: AnalyticsPayload },
) => void;

/** Eventos que Meta reconoce por su nombre; el resto se manda como custom. */
const META_EVENT_NAMES: Partial<Record<AnalyticsEvent, string>> = {
  whatsapp_click: "Contact",
};

export function trackEvent(name: AnalyticsEvent, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const target = window as unknown as { fbq?: MetaPixel; va?: VercelAnalytics };

  if (typeof target.fbq === "function") {
    target.fbq("track", META_EVENT_NAMES[name] ?? name, { currency: "COP", ...payload });
  }

  if (typeof target.va === "function") {
    target.va("event", { name, data: payload });
  }
}
