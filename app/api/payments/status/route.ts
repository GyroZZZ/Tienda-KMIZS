import { getMercadoPagoTestToken } from "@/lib/payments";
import { isRecord } from "@/lib/request";

export async function GET(request: Request) {
  const paymentId = new URL(request.url).searchParams.get("payment_id");
  if (!paymentId || !/^\d+$/.test(paymentId)) {
    return Response.json({ error: "Falta un identificador de pago válido." }, { status: 400 });
  }

  const accessToken = getMercadoPagoTestToken();
  if (!accessToken) {
    return Response.json(
      { error: "La verificación requiere un token TEST- de Mercado Pago." },
      { status: 503 },
    );
  }

  let response: Response;
  try {
    response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Falló la conexión con Mercado Pago al verificar el pago.", error);
    return Response.json(
      { error: "No pudimos verificar el pago con Mercado Pago." },
      { status: 502 },
    );
  }

  let payment: unknown;
  try {
    payment = await response.json();
  } catch (error) {
    console.error("Mercado Pago devolvió una respuesta inválida al verificar el pago.", error);
    return Response.json(
      { error: "Mercado Pago devolvió una respuesta inválida." },
      { status: 502 },
    );
  }

  if (
    !response.ok ||
    !isRecord(payment) ||
    typeof payment.status !== "string" ||
    typeof payment.external_reference !== "string" ||
    !payment.external_reference.startsWith("KM-")
  ) {
    console.error("Mercado Pago no pudo verificar el pago.", { status: response.status });
    return Response.json({ error: "No pudimos verificar el estado del pago." }, { status: 502 });
  }

  return Response.json({
    status: payment.status,
    statusDetail: typeof payment.status_detail === "string" ? payment.status_detail : "",
  });
}
