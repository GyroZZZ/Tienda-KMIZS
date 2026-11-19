import { releaseExpiredOrders } from "@/lib/orders";

/**
 * Libera el stock y el cupón de los pedidos que llevan más de 72 horas sin
 * confirmarse. Lo llama un cron de Vercel protegido con `CRON_SECRET`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "El cron no está configurado." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${secret}`) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const released = await releaseExpiredOrders(72);
  return Response.json({ released });
}
