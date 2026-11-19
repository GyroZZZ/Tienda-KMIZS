import type { Size } from "@/lib/products";
import { previewCoupon, type OrderItemInput } from "@/lib/orders";
import { isRecord } from "@/lib/request";

/**
 * Vista previa del cupón.
 *
 * Recalcula el subtotal con los precios de la base y no registra nada: el
 * consumo real del cupón se valida dentro de `place_order`.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ valid: false, reason: "Solicitud inválida." }, { status: 400 });
  }

  if (!isRecord(body) || typeof body.code !== "string" || !Array.isArray(body.items)) {
    return Response.json(
      { valid: false, reason: "Faltan el código o los productos." },
      { status: 400 },
    );
  }

  const items: OrderItemInput[] = [];
  for (const rawItem of body.items) {
    if (!isRecord(rawItem)) {
      return Response.json(
        { valid: false, reason: "Hay un producto con datos inválidos." },
        { status: 400 },
      );
    }
    const { slug, size, color, quantity } = rawItem;
    if (
      typeof slug !== "string" ||
      typeof size !== "string" ||
      typeof color !== "string" ||
      !Number.isInteger(quantity) ||
      typeof quantity !== "number" ||
      quantity <= 0
    ) {
      return Response.json(
        { valid: false, reason: "Hay un producto con datos inválidos." },
        { status: 400 },
      );
    }
    items.push({ slug, size: size as Size, color, quantity });
  }

  if (items.length === 0) {
    return Response.json(
      { valid: false, reason: "Agrega productos antes de aplicar el cupón." },
      { status: 400 },
    );
  }

  const preview = await previewCoupon(body.code, items);
  return Response.json(preview, { status: preview.valid ? 200 : 422 });
}
