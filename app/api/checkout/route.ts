import { formatPrice, type Size } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { qualifiesForFreeShipping } from "@/lib/free-shipping";
import { sendOrderEmail } from "@/lib/order-email";
import {
  createOrder,
  describeOrderError,
  generateOrderCode,
  savePreferenceId,
  settlePayment,
  type OrderCustomer,
  type OrderItemInput,
} from "@/lib/orders";
import { getMercadoPagoAccessToken, getMercadoPagoCheckoutUrl } from "@/lib/payments";
import { isRecord } from "@/lib/request";
import { getShippingOptions } from "@/lib/shipping";
import { getShippingZoneForAddress } from "@/lib/shipping-location";
import { getSiteUrl, site } from "@/lib/site";

type PaymentMethod = "mercado_pago" | "cash_on_delivery";

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "mercado_pago" || value === "cash_on_delivery";
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

interface EmailLine {
  name: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

function orderEmailHtml({
  orderCode,
  customer,
  lines,
  paymentMethod,
  shipping,
  shippingZone,
  orderStatus,
  subtotal,
  discount,
  couponCode,
  total,
}: {
  orderCode: string;
  customer: OrderCustomer;
  lines: EmailLine[];
  paymentMethod: PaymentMethod;
  shipping: number | null;
  shippingZone: string | null;
  orderStatus: string;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number | null;
}): string {
  const methodLabels: Record<PaymentMethod, string> = {
    mercado_pago: "Mercado Pago",
    cash_on_delivery: "Contraentrega",
  };
  const lineRows = lines
    .map(
      (line) =>
        `<li>${escapeHtml(line.name)} · ${escapeHtml(line.color)} · talla ${escapeHtml(line.size)} · ${line.quantity} × ${formatPrice(line.unitPrice)} = ${formatPrice(line.total)}</li>`,
    )
    .join("");

  return `<h1>Pedido ${escapeHtml(orderCode)}</h1>
    <p><strong>Estado:</strong> ${escapeHtml(orderStatus)}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(customer.name)}<br>
    <strong>Correo:</strong> ${escapeHtml(customer.email)}<br>
    <strong>Teléfono:</strong> ${escapeHtml(customer.phone)}<br>
    <strong>Dirección:</strong> ${escapeHtml(customer.address)}, ${escapeHtml(customer.city)}, ${escapeHtml(customer.department)}</p>
    ${customer.notes ? `<p><strong>Indicaciones:</strong> ${escapeHtml(customer.notes)}</p>` : ""}
    <h2>Productos</h2><ul>${lineRows}</ul>
    <p><strong>Pago:</strong> ${methodLabels[paymentMethod]}</p>
    <p><strong>Subtotal:</strong> ${formatPrice(subtotal)}<br>
    ${discount > 0 ? `<strong>Descuento${couponCode ? ` (${escapeHtml(couponCode)})` : ""}:</strong> −${formatPrice(discount)}<br>` : ""}
    <strong>Envío:</strong> ${shipping === null ? "Pendiente de cotización" : shipping === 0 ? "Gratis" : `${formatPrice(shipping)} (${escapeHtml(shippingZone ?? "")})`}<br>
    <strong>Total:</strong> ${total === null ? "Pendiente de cotización de envío" : formatPrice(total)}</p>
    <p>KMIZS · ${escapeHtml(site.email)}</p>`;
}

async function createPaymentPreference({
  orderCode,
  customer,
  lines,
  shippingRate,
  total,
}: {
  orderCode: string;
  customer: OrderCustomer;
  lines: EmailLine[];
  shippingRate: number;
  total: number;
}): Promise<{ paymentUrl: string; preferenceId: string | null }> {
  const accessToken = getMercadoPagoAccessToken();
  if (!accessToken)
    throw new Error("Configura en Vercel las credenciales de prueba de Mercado Pago.");
  if (!process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    throw new Error("Configura en Vercel la firma de webhook de Mercado Pago.");
  }

  const origin = getSiteUrl();
  const payload = {
    items: [
      ...lines.map((line) => ({
        id: line.name,
        title: `${line.name} · ${line.color} · ${line.size}`,
        quantity: line.quantity,
        currency_id: "COP",
        unit_price: line.unitPrice,
      })),
      ...(shippingRate > 0
        ? [
            {
              id: "envio",
              title: "Envío",
              quantity: 1,
              currency_id: "COP",
              unit_price: shippingRate,
            },
          ]
        : []),
    ],
    payer: {
      name: customer.name,
      email: customer.email,
      phone: { number: customer.phone.replace(/\D/g, "").slice(-10) },
      address: { street_name: customer.address },
    },
    external_reference: orderCode,
    back_urls: {
      success: `${origin}/checkout/resultado`,
      pending: `${origin}/checkout/resultado`,
      failure: `${origin}/checkout/resultado`,
    },
    notification_url: `${origin}/api/payments/webhook`,
    auto_return: "approved",
    statement_descriptor: "KMIZS",
    metadata: { order_id: orderCode, calculated_total: total },
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

  const paymentUrl = getMercadoPagoCheckoutUrl(result);
  if (!paymentUrl) {
    console.error("La preferencia de Mercado Pago no incluyó un enlace válido.");
    throw new Error("Mercado Pago no devolvió un enlace de pago válido.");
  }

  return {
    paymentUrl,
    preferenceId: typeof result.id === "string" ? result.id : null,
  };
}

function buildWhatsAppUrl(
  orderCode: string,
  customer: OrderCustomer,
  lines: EmailLine[],
  paymentMethod: PaymentMethod,
  subtotal: number,
  discount: number,
  shipping: number | null,
  total: number | null,
  zoneLabel: string | null,
): string {
  const summary = lines
    .map((line) => `- ${line.name} (${line.color}, talla ${line.size}) x${line.quantity}`)
    .join("\n");
  const shippingText =
    shipping === null ? "por cotizar" : shipping === 0 ? "gratis" : formatPrice(shipping);
  const message = [
    `Hola, quiero confirmar el pedido ${orderCode}.`,
    `Nombre: ${customer.name}`,
    `Destino: ${customer.city}, ${customer.department}`,
    `Pago elegido: ${paymentMethod === "cash_on_delivery" ? "contraentrega" : "Mercado Pago"}`,
    summary,
    `Subtotal: ${formatPrice(subtotal)}`,
    ...(discount > 0 ? [`Descuento: −${formatPrice(discount)}`] : []),
    `Envío${zoneLabel && shipping !== 0 ? ` (${zoneLabel})` : ""}: ${shippingText}`,
    `Total: ${total === null ? "pendiente de cotizar el envío" : formatPrice(total)}`,
    shipping === 0
      ? "Por favor confirmen disponibilidad contraentrega (si aplica) y el tiempo de envío antes del pago."
      : "Por favor confirmen disponibilidad contraentrega (si aplica), tarifa y tiempo de envío antes del pago.",
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
  const customer: OrderCustomer = {
    name: readText(customerInput.name, 80) ?? "",
    email: (readText(customerInput.email, 254) ?? "").toLowerCase(),
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
  if (!isPaymentMethod(paymentMethod)) {
    return Response.json({ error: "Selecciona un medio de pago válido." }, { status: 400 });
  }

  const couponCode =
    typeof body.couponCode === "string" && body.couponCode.trim().length > 0
      ? body.couponCode.trim().toUpperCase()
      : null;

  const catalog = new Map((await getCatalog()).map((product) => [product.slug, product]));

  const items: OrderItemInput[] = [];
  const emailLines: EmailLine[] = [];
  const seenItems = new Set<string>();

  for (const rawItem of body.items) {
    if (!isRecord(rawItem)) {
      return Response.json({ error: "Hay un producto con datos inválidos." }, { status: 400 });
    }

    const product = typeof rawItem.slug === "string" ? catalog.get(rawItem.slug) : undefined;
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
      !product.sizes.some((entry) => entry.size === size) ||
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

    items.push({ slug: product.slug, size: size as Size, color, quantity });
    emailLines.push({
      name: product.name,
      color,
      size,
      quantity,
      unitPrice: product.price,
      total: product.price * quantity,
    });
  }

  const freeShipping = qualifiesForFreeShipping(
    items.map((item) => ({
      quantity: item.quantity,
      isCustom: catalog.get(item.slug)?.type === "personalizada",
    })),
  );

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

  if (paymentMethod === "mercado_pago") {
    if (!getMercadoPagoAccessToken() || !process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
      return Response.json(
        {
          error:
            "El pago en línea requiere las credenciales de Mercado Pago y la firma de webhook en Vercel.",
        },
        { status: 503 },
      );
    }
  }

  const shippingRate = freeShipping ? 0 : (zone?.rate ?? null);
  const shippingZoneLabel = freeShipping ? "Envío gratis" : (zone?.label ?? null);

  const user = await getCurrentUser();
  const code = generateOrderCode();

  let order;
  try {
    order = await createOrder({
      code,
      customer,
      items,
      paymentMethod,
      shipping: shippingRate,
      shippingZone: shippingZoneLabel,
      userId: user?.id ?? null,
      couponCode,
    });
  } catch (error) {
    console.error("No se pudo registrar el pedido.", error);
    return Response.json({ error: describeOrderError(error) }, { status: 409 });
  }

  const totals = {
    subtotal: order.subtotal,
    discount: order.discount,
    shipping: order.shipping,
    total: order.total,
  };

  const canEmail = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);

  if (paymentMethod === "mercado_pago") {
    if (shippingRate === null || order.total === null) {
      await settlePayment(code, null, "cancelled");
      return Response.json(
        { error: "Falta confirmar el costo de envío antes del pago." },
        { status: 409 },
      );
    }

    let preference: { paymentUrl: string; preferenceId: string | null };
    try {
      preference = await createPaymentPreference({
        orderCode: code,
        customer,
        lines: emailLines,
        shippingRate,
        total: order.total,
      });
    } catch (error) {
      // Si el pago no se puede iniciar, el pedido no debe retener stock ni cupón.
      await settlePayment(code, null, "cancelled").catch(() => undefined);
      const message =
        error instanceof Error ? error.message : "No pudimos preparar el pago digital.";
      console.error("No se pudo crear el pago de Mercado Pago.", error);
      return Response.json({ error: message }, { status: 502 });
    }

    if (preference.preferenceId) {
      await savePreferenceId(code, preference.preferenceId).catch(() => undefined);
    }

    if (canEmail) {
      try {
        await sendOrderEmail(
          `Pedido ${code} · pago en Mercado Pago iniciado`,
          orderEmailHtml({
            orderCode: code,
            customer,
            lines: emailLines,
            paymentMethod,
            shipping: order.shipping,
            shippingZone: order.shipping_zone,
            orderStatus: "Pedido registrado; esperando confirmación del pago",
            subtotal: order.subtotal,
            discount: order.discount,
            couponCode: order.coupon_code,
            total: order.total,
          }),
          `order-${code}`,
        );
      } catch (error) {
        console.error("No se pudo notificar el pedido de Mercado Pago.", error);
      }
    }

    return Response.json({ orderId: code, paymentUrl: preference.paymentUrl, totals });
  }

  const orderStatus =
    order.shipping === null
      ? "Pendiente de cotizar envío y confirmar por WhatsApp"
      : "Pendiente de confirmación por WhatsApp";

  if (canEmail) {
    try {
      await sendOrderEmail(
        `Pedido ${code} · requiere confirmación`,
        orderEmailHtml({
          orderCode: code,
          customer,
          lines: emailLines,
          paymentMethod,
          shipping: order.shipping,
          shippingZone: order.shipping_zone,
          orderStatus,
          subtotal: order.subtotal,
          discount: order.discount,
          couponCode: order.coupon_code,
          total: order.total,
        }),
        `order-${code}`,
      );
    } catch (error) {
      // El pedido ya existe en la base: el correo es solo una notificación.
      console.error("No se pudo notificar el pedido por correo.", error);
    }
  }

  const whatsappUrl = buildWhatsAppUrl(
    code,
    customer,
    emailLines,
    paymentMethod,
    order.subtotal,
    order.discount,
    order.shipping,
    order.total,
    order.shipping_zone,
  );

  return Response.json({ orderId: code, whatsappUrl, totals });
}
