import { createHmac, timingSafeEqual } from "node:crypto";

import { sendOrderEmail } from "@/lib/order-email";
import { getMercadoPagoTestToken } from "@/lib/payments";
import { isRecord } from "@/lib/request";
import { formatPrice } from "@/lib/products";
import { site } from "@/lib/site";

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

export async function POST(request: Request) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const accessToken = getMercadoPagoTestToken();
  if (!secret || !accessToken) {
    return Response.json({ error: "El webhook de pagos no está configurado." }, { status: 503 });
  }

  const url = new URL(request.url);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Notificación inválida." }, { status: 400 });
  }
  if (!isRecord(body)) {
    return Response.json({ error: "Notificación inválida." }, { status: 400 });
  }

  const eventType = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? body.type;
  if (eventType !== "payment") {
    return Response.json({ received: true });
  }

  const data = isRecord(body.data) ? body.data : null;
  const dataId = url.searchParams.get("data.id") ?? data?.id;
  const paymentId = typeof dataId === "number" ? String(dataId) : dataId;
  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (typeof paymentId !== "string" || !/^\d+$/.test(paymentId) || !signature || !requestId) {
    return Response.json({ error: "Faltan datos de firma para la notificación." }, { status: 401 });
  }

  const signatureParts = new Map(
    signature.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );
  const timestamp = signatureParts.get("ts");
  const receivedHash = signatureParts.get("v1");
  if (
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    !receivedHash ||
    !/^[a-f\d]{64}$/i.test(receivedHash)
  ) {
    return Response.json({ error: "La firma de la notificación no es válida." }, { status: 401 });
  }

  const manifest = `id:${paymentId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
  const expectedHash = createHmac("sha256", secret).update(manifest).digest();
  const suppliedHash = Buffer.from(receivedHash, "hex");
  if (suppliedHash.length !== expectedHash.length || !timingSafeEqual(suppliedHash, expectedHash)) {
    return Response.json({ error: "La firma de la notificación no coincide." }, { status: 401 });
  }

  let response: Response;
  try {
    response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Falló la conexión con Mercado Pago al consultar el webhook.", error);
    return Response.json({ error: "No pudimos consultar el pago." }, { status: 502 });
  }

  let payment: unknown;
  try {
    payment = await response.json();
  } catch (error) {
    console.error("Mercado Pago devolvió una respuesta inválida al procesar el webhook.", error);
    return Response.json(
      { error: "Mercado Pago devolvió una respuesta inválida." },
      { status: 502 },
    );
  }

  if (!response.ok || !isRecord(payment)) {
    console.error("No se pudo asociar la notificación con un pedido KMIZS.", {
      status: response.status,
    });
    return Response.json({ error: "No pudimos verificar el pago." }, { status: 502 });
  }
  if (
    typeof payment.status !== "string" ||
    typeof payment.external_reference !== "string" ||
    !payment.external_reference.startsWith("KM-")
  ) {
    return Response.json({ received: true });
  }

  const amount =
    typeof payment.transaction_amount === "number" && Number.isFinite(payment.transaction_amount)
      ? formatPrice(payment.transaction_amount)
      : "No disponible";
  const paymentMethod =
    typeof payment.payment_method_id === "string"
      ? escapeHtml(payment.payment_method_id)
      : "No disponible";
  const detail =
    typeof payment.status_detail === "string"
      ? escapeHtml(payment.status_detail)
      : "Sin detalle adicional";
  const status = escapeHtml(payment.status);
  const orderId = escapeHtml(payment.external_reference);

  try {
    await sendOrderEmail(
      `Actualización de pago · ${payment.external_reference} · ${payment.status}`,
      `<h1>Actualización del pago</h1>
      <p><strong>Pedido:</strong> ${orderId}</p>
      <p><strong>Estado:</strong> ${status}</p>
      <p><strong>Detalle:</strong> ${detail}</p>
      <p><strong>Valor:</strong> ${amount}</p>
      <p><strong>Medio:</strong> ${paymentMethod}</p>
      <p>Verifica el pago en la cuenta de Mercado Pago antes de despachar el pedido.</p>
      <p>${escapeHtml(site.name)}</p>`,
      `mercadopago-${paymentId}-${payment.status}`,
    );
  } catch (error) {
    console.error("No se pudo enviar al equipo la actualización del pago.", error);
    return Response.json(
      { error: "No pudimos registrar la actualización del pago." },
      { status: 502 },
    );
  }

  return Response.json({ received: true });
}
