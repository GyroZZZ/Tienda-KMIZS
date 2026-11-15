import { site } from "@/lib/site";

/**
 * Destinatarios internos de los pedidos.
 * `ORDER_NOTIFY_EMAIL` acepta una o varias direcciones separadas por coma.
 * Si no está configurado, el pedido se envía al correo publicado del sitio.
 */
function getOrderRecipients(): string[] {
  const configured = process.env.ORDER_NOTIFY_EMAIL?.trim();
  const raw = configured && configured.length > 0 ? configured : site.email;
  return raw
    .split(",")
    .map((address) => address.trim())
    .filter((address) => address.length > 0);
}

export async function sendOrderEmail(
  subject: string,
  html: string,
  idempotencyKey?: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("El registro de pedidos no está configurado.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({ from, to: getOrderRecipients(), subject, html }),
    });
  } catch (error) {
    console.error("Falló la conexión con Resend al registrar un pedido.", error);
    throw new Error("No pudimos conectar con el servicio de correo.");
  }

  if (!response.ok) {
    console.error("Resend rechazó el correo del pedido.", { status: response.status });
    throw new Error("El servicio de correo no pudo registrar el pedido.");
  }
}
