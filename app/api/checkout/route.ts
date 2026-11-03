import { randomUUID } from "node:crypto";

import { formatPrice, getProductBySlug, type Product, type Size } from "@/lib/products";
import { sendOrderEmail } from "@/lib/order-email";
import { getMercadoPagoTestToken } from "@/lib/payments";
import { isRecord } from "@/lib/request";
import { getShippingOptions } from "@/lib/shipping";
import { getShippingZoneForAddress } from "@/lib/shipping-location";
import { getSiteUrl, site } from "@/lib/site";

type PaymentMethod = "mercado_pago" | "cash_on_delivery" | "bank_transfer";

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  notes: string;
}

interface OrderLine {
  product: Product;
  size: Size;
  color: string;
  quantity: number;
  total: number;
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function orderEmailHtml({
  orderId,
  customer,
  lines,
  paymentMethod,
  shipping,
  shippingZone,
  orderStatus,
  subtotal,
  total,
  paymentUrl,
}: {
  orderId: string;
  customer: Customer;
  lines: OrderLine[];
  paymentMethod: PaymentMethod;
  shipping: number | null;
  shippingZone: string | null;
  orderStatus: string;
  subtotal: number;
  total: number | null;
  paymentUrl: string | null;
}): string {
  const methodLabels: Record<PaymentMethod, string> = {
    mercado_pago: "Mercado Pago",
    cash_on_delivery: "Contraentrega",
    bank_transfer: "Transferencia o billetera",
  };
  const lineRows = lines
    .map(
      (line) =>
        `<li>${escapeHtml(line.product.name)} · ${escapeHtml(line.color)} · talla ${escapeHtml(line.size)} · ${line.quantity} × ${formatPrice(line.product.price)} = ${formatPrice(line.total)}</li>`,
    )
    .join("");

  return `<h1>Pedido ${escapeHtml(orderId)}</h1>
    <p><strong>Estado:</strong> ${escapeHtml(orderStatus)}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(customer.name)}<br>
    <strong>Correo:</strong> ${escapeHtml(customer.email)}<br>
    <strong>Teléfono:</strong> ${escapeHtml(customer.phone)}<br>
    <strong>Dirección:</strong> ${escapeHtml(customer.address)}, ${escapeHtml(customer.city)}, ${escapeHtml(customer.department)}</p>
    ${customer.notes ? `<p><strong>Indicaciones:</strong> ${escapeHtml(customer.notes)}</p>` : ""}
    <h2>Productos</h2><ul>${lineRows}</ul>
    <p><strong>Pago:</strong> ${methodLabels[paymentMethod]}</p>
    <p><strong>Subtotal:</strong> ${formatPrice(subtotal)}<br>
    <strong>Envío:</strong> ${shipping === null ? "Pendiente de cotización" : `${formatPrice(shipping)} (${escapeHtml(shippingZone ?? "")})`}<br>
    <strong>Total:</strong> ${total === null ? "Pendiente de cotización de envío" : formatPrice(total)}</p>
    ${paymentUrl ? `<p><a href="${escapeHtml(paymentUrl)}">Abrir enlace de pago</a></p>` : ""}
    <p>KMIZS · ${escapeHtml(site.email)}</p>`;
}

async function createPaymentPreference({
  orderId,
  customer,
  lines,
  shippingRate,
  total,
}: {
  orderId: string;
  customer: Customer;
  lines: OrderLine[];
  shippingRate: number;
  total: number;
}): Promise<string> {
  const accessToken = getMercadoPagoTestToken();
  if (!accessToken) throw new Error("Configura en Vercel un token TEST- de Mercado Pago.");
  if (!process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    throw new Error("Configura en Vercel la firma de webhook de Mercado Pago.");
  }

  const origin = getSiteUrl();
  const payload = {
    items: [
      ...lines.map((line) => ({
        id: line.product.slug,
        title: `${line.product.name} · ${line.color} · ${line.size}`,
        quantity: line.quantity,
        currency_id: "COP",
        unit_price: line.product.price,
      })),
      {
        id: "envio",
        title: "Envío",
        quantity: 1,
        currency_id: "COP",
        unit_price: shippingRate,
      },
    ],
    payer: {
      name: customer.name,
      email: customer.email,
      phone: { number: customer.phone.replace(/\D/g, "").slice(-10) },
      address: { street_name: customer.address },
    },
    external_reference: orderId,
    back_urls: {
      success: `${origin}/checkout/resultado`,
      pending: `${origin}/checkout/resultado`,
      failure: `${origin}/checkout/resultado`,
    },
    notification_url: `${origin}/api/payments/webhook`,
    auto_return: "approved",
    statement_descriptor: "KMIZS",
    metadata: { order_id: orderId, calculated_total: total },
  };

  let response: Response;
  try {
    response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Falló la conexión con Mercado Pago al crear el checkout.", error);
    throw new Error("No pudimos conectar con Mercado Pago.");
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch (error) {
    console.error("Mercado Pago devolvió una respuesta inválida.", error);
    throw new Error("Mercado Pago devolvió una respuesta inválida.");
  }

  if (!response.ok || !isRecord(result)) {
    console.error("Mercado Pago rechazó la preferencia.", { status: response.status });
    throw new Error("Mercado Pago no pudo preparar el pago.");
  }

  const paymentUrl = result.sandbox_init_point;
  if (typeof paymentUrl !== "string" || !paymentUrl.startsWith("https://")) {
    console.error("La preferencia de Mercado Pago no incluyó un enlace válido.");
    throw new Error("Mercado Pago no devolvió un enlace de pago válido.");
  }
  return paymentUrl;
}

function buildWhatsAppUrl(
  orderId: string,
  customer: Customer,
  lines: OrderLine[],
  paymentMethod: PaymentMethod,
  subtotal: number,
  shipping: number | null,
  total: number | null,
  zoneLabel: string | null,
): string {
  const summary = lines
    .map((line) => `- ${line.product.name} (${line.color}, talla ${line.size}) x${line.quantity}`)
    .join("\n");
  const message = [
    `Hola, quiero confirmar el pedido ${orderId}.`,
    `Nombre: ${customer.name}`,
    `Destino: ${customer.city}, ${customer.department}`,
    `Pago elegido: ${paymentMethod === "cash_on_delivery" ? "contraentrega" : "transferencia o billetera"}`,
    summary,
    `Subtotal: ${formatPrice(subtotal)}`,
    `Envío${zoneLabel ? ` (${zoneLabel})` : ""}: ${shipping === null ? "por cotizar" : formatPrice(shipping)}`,
    `Total: ${total === null ? "pendiente de cotizar el envío" : formatPrice(total)}`,
    "Por favor confirmen disponibilidad contraentrega (si aplica), tarifa y tiempo de envío antes del pago.",
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "El contenido del pedido no es JSON válido." }, { status: 400 });
  }

  if (!isRecord(body) || !isRecord(body.customer) || !Array.isArray(body.items)) {
    return Response.json({ error: "Faltan datos válidos para crear el pedido." }, { status: 400 });
  }

  const customerInput = body.customer;
  const customer: Customer = {
    name: readText(customerInput.name, 80) ?? "",
    email: readText(customerInput.email, 254) ?? "",
    phone: readText(customerInput.phone, 20) ?? "",
    address: readText(customerInput.address, 160) ?? "",
    city: readText(customerInput.city, 80) ?? "",
    department: readText(customerInput.department, 80) ?? "",
    notes: typeof customerInput.notes === "string" ? customerInput.notes.trim().slice(0, 300) : "",
  };

  if (
    !customer.name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
    customer.phone.replace(/\D/g, "").length < 10 ||
    !customer.address ||
    !customer.city ||
    !customer.department
  ) {
    return Response.json(
      { error: "Revisa nombre, correo, teléfono y dirección de entrega." },
      { status: 400 },
    );
  }
  if (body.acceptsPrivacy !== true) {
    return Response.json(
      { error: "Debes aceptar la política de tratamiento de datos." },
      { status: 400 },
    );
  }
  if (body.items.length === 0 || body.items.length > 20) {
    return Response.json(
      { error: "El pedido debe tener entre 1 y 20 referencias." },
      { status: 400 },
    );
  }

  const paymentMethod = body.paymentMethod;
  if (
    paymentMethod !== "mercado_pago" &&
    paymentMethod !== "cash_on_delivery" &&
    paymentMethod !== "bank_transfer"
  ) {
    return Response.json({ error: "Selecciona un medio de pago válido." }, { status: 400 });
  }

  const shippingOptions = getShippingOptions();
  const zone = shippingOptions.confirmed
    ? getShippingZoneForAddress(shippingOptions, customer.city, customer.department)
    : undefined;
  if (paymentMethod === "mercado_pago" && !zone) {
    return Response.json(
      {
        error:
          "El pago en línea requiere una tarifa y un plazo confirmados para la ciudad ingresada.",
      },
      { status: 409 },
    );
  }

  const lines: OrderLine[] = [];
  const seenItems = new Set<string>();
  for (const rawItem of body.items) {
    if (!isRecord(rawItem)) {
      return Response.json({ error: "Hay un producto con datos inválidos." }, { status: 400 });
    }
    const product = typeof rawItem.slug === "string" ? getProductBySlug(rawItem.slug) : undefined;
    const size = rawItem.size;
    const color = rawItem.color;
    const quantity = rawItem.quantity;
    if (
      !product ||
      typeof size !== "string" ||
      typeof color !== "string" ||
      !Number.isInteger(quantity) ||
      typeof quantity !== "number" ||
      quantity < (product.minQuantity ?? 1) ||
      !product.sizes.some((entry) => entry.size === size && entry.stock >= quantity) ||
      !product.colors.some((entry) => entry.name === color)
    ) {
      return Response.json(
        { error: "Un producto, talla o cantidad ya no está disponible. Actualiza el carrito." },
        { status: 400 },
      );
    }
    const key = `${product.slug}:${size}:${color}`;
    if (seenItems.has(key)) {
      return Response.json({ error: "El carrito contiene productos duplicados." }, { status: 400 });
    }
    seenItems.add(key);
    lines.push({
      product,
      size: size as Size,
      color,
      quantity: quantity as number,
      total: product.price * (quantity as number),
    });
  }

  const subtotal = lines.reduce((total, line) => total + line.total, 0);
  const shippingRate = zone?.rate ?? null;
  const total = shippingRate === null ? null : subtotal + shippingRate;
  const orderId = `KM-${randomUUID().toUpperCase()}`;
  if (
    paymentMethod === "mercado_pago" &&
    (!getMercadoPagoTestToken() || !process.env.MERCADO_PAGO_WEBHOOK_SECRET)
  ) {
    return Response.json(
      { error: "El pago sandbox requiere el token TEST- y la firma de webhook en Vercel." },
      { status: 503 },
    );
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return Response.json(
      {
        error:
          "El registro de pedidos no está configurado. El equipo debe completar Resend en Vercel.",
      },
      { status: 503 },
    );
  }

  if (paymentMethod === "mercado_pago") {
    if (shippingRate === null || total === null) {
      return Response.json(
        { error: "Falta confirmar el costo de envío antes del pago." },
        { status: 409 },
      );
    }

    try {
      await sendOrderEmail(
        `Pedido ${orderId} · pago sandbox solicitado`,
        orderEmailHtml({
          orderId,
          customer,
          lines,
          paymentMethod,
          shipping: shippingRate,
          shippingZone: zone?.label ?? null,
          orderStatus: "Pedido registrado; preparando pago en sandbox",
          subtotal,
          total,
          paymentUrl: null,
        }),
        `order-${orderId}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No pudimos registrar el pedido por correo.";
      console.error("No se pudo registrar el pedido de Mercado Pago.", error);
      return Response.json({ error: message }, { status: 502 });
    }

    try {
      const paymentUrl = await createPaymentPreference({
        orderId,
        customer,
        lines,
        shippingRate,
        total,
      });
      return Response.json({ orderId, paymentUrl });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No pudimos preparar el pago digital.";
      console.error("No se pudo crear el pago de Mercado Pago.", error);
      return Response.json({ error: message }, { status: 502 });
    }
  }

  try {
    await sendOrderEmail(
      `Pedido ${orderId} · requiere confirmación`,
      orderEmailHtml({
        orderId,
        customer,
        lines,
        paymentMethod,
        shipping: shippingRate,
        shippingZone: zone?.label ?? null,
        orderStatus:
          shippingRate === null
            ? "Pendiente de cotizar envío y confirmar por WhatsApp"
            : "Pendiente de confirmación por WhatsApp",
        subtotal,
        total,
        paymentUrl: null,
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No pudimos registrar el pedido por correo.";
    console.error("No se pudo registrar el pedido.", error);
    return Response.json({ error: message }, { status: 502 });
  }

  const whatsappUrl = buildWhatsAppUrl(
    orderId,
    customer,
    lines,
    paymentMethod,
    subtotal,
    shippingRate,
    total,
    zone?.label ?? null,
  );
  return Response.json({ orderId, whatsappUrl });
}
