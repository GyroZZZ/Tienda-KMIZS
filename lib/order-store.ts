/**
 * Registro local de pedidos para desarrollo.
 *
 * En producción los pedidos se registran por correo con Resend. Sin credenciales no
 * hay dónde guardarlos, así que el endpoint responde `503` en vez de aceptar un
 * pedido que se perdería.
 *
 * En desarrollo no hace falta esa infraestructura: este módulo escribe cada pedido
 * como una línea JSON en `.data/pedidos.jsonl`, que está fuera del repositorio. El
 * archivo sirve para revisar el flujo completo (carrito, envío, totales y medios de
 * pago) sin configurar nada.
 */

import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

export type LocalOrderPaymentMethod = "mercado_pago" | "cash_on_delivery";

export interface LocalOrderLine {
  name: string;
  color: string;
  size: string;
  quantity: number;
  total: number;
}

export interface LocalOrderRecord {
  orderId: string;
  createdAt: string;
  paymentMethod: LocalOrderPaymentMethod;
  status: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    department: string;
    notes: string;
  };
  lines: LocalOrderLine[];
  subtotal: number;
  shipping: number | null;
  shippingZone: string | null;
  total: number | null;
  paymentUrl?: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "pedidos.jsonl");

/** El registro local solo aplica fuera de producción: nunca en el sitio desplegado. */
export function isLocalOrderStoreEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/** Ruta absoluta del archivo, útil para mostrarla en la consola del servidor. */
export function getLocalOrderStorePath(): string {
  return ORDERS_FILE;
}

export async function saveLocalOrder(record: LocalOrderRecord): Promise<string> {
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(ORDERS_FILE, `${JSON.stringify(record)}\n`, "utf8");
  return ORDERS_FILE;
}

export async function listLocalOrders(): Promise<LocalOrderRecord[]> {
  let raw: string;
  try {
    raw = await readFile(ORDERS_FILE, "utf8");
  } catch {
    return [];
  }

  return raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as LocalOrderRecord];
      } catch {
        return [];
      }
    });
}
