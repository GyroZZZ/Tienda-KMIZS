/**
 * Comprobante del pedido que se guarda en el navegador.
 *
 * El sitio no tiene base de datos de pedidos, así que la página de gracias
 * reconstruye el resumen desde `sessionStorage`. Si el cliente borra los datos
 * del navegador, la página muestra un respaldo genérico con el número de pedido.
 */

export type OrderPaymentMethod = "mercado_pago" | "cash_on_delivery" | "bank_transfer";

export interface OrderSnapshotLine {
  name: string;
  color: string;
  size: string;
  quantity: number;
  total: number;
}

export interface OrderSnapshot {
  id: string;
  createdAt: string;
  paymentMethod: OrderPaymentMethod;
  paymentLabel: string;
  whatsappUrl: string | null;
  customerName: string;
  email: string;
  city: string;
  department: string;
  lines: OrderSnapshotLine[];
  subtotal: number;
  shipping: number | null;
  shippingZone: string | null;
  total: number | null;
}

const STORAGE_PREFIX = "kmizs:pedido:";
const snapshotCache = new Map<string, OrderSnapshot | null>();

function isOrderSnapshot(value: unknown): value is OrderSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const snapshot = value as Record<string, unknown>;
  return (
    typeof snapshot.id === "string" &&
    typeof snapshot.paymentMethod === "string" &&
    Array.isArray(snapshot.lines) &&
    typeof snapshot.subtotal === "number"
  );
}

export function saveOrderSnapshot(snapshot: OrderSnapshot): void {
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + snapshot.id, JSON.stringify(snapshot));
  } catch {
    // sessionStorage puede estar bloqueado; la página de gracias usa el respaldo.
  }
}

export function readOrderSnapshot(orderId: string): OrderSnapshot | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + orderId);
    if (raw === null) return null;

    // `useSyncExternalStore` exige que la instantánea sea estable entre llamadas.
    const cached = snapshotCache.get(raw);
    if (cached !== undefined) return cached;

    const parsed: unknown = JSON.parse(raw);
    const snapshot = isOrderSnapshot(parsed) ? parsed : null;
    snapshotCache.set(raw, snapshot);
    return snapshot;
  } catch {
    return null;
  }
}
