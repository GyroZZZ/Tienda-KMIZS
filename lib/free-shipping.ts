/**
 * Regla de envío gratis de KMIZS.
 *
 * - Un pedido con 2 o más prendas en total, sin importar modelo, talla, color
 *   ni si son iguales o distintas.
 * - Cualquier pedido que incluya un producto personalizado (equipos, eventos),
 *   porque se venden en paquetes.
 *
 * El módulo no depende del servidor: lo usan el carrito, el checkout y la API.
 */

export const FREE_SHIPPING_MIN_UNITS = 2;

export interface FreeShippingLine {
  quantity: number;
  /** true para productos personalizados, de eventos o de equipos. */
  isCustom: boolean;
}

function countUnits(lines: FreeShippingLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function qualifiesForFreeShipping(lines: FreeShippingLine[]): boolean {
  return countUnits(lines) >= FREE_SHIPPING_MIN_UNITS || lines.some((line) => line.isCustom);
}

/** Texto para explicar por qué el envío es gratis; null si no aplica. */
export function freeShippingReason(lines: FreeShippingLine[]): string | null {
  if (lines.some((line) => line.isCustom)) {
    return "Envío gratis en pedidos personalizados, de eventos y de equipos.";
  }
  if (countUnits(lines) >= FREE_SHIPPING_MIN_UNITS) {
    return "Envío gratis por 2 o más prendas.";
  }
  return null;
}
