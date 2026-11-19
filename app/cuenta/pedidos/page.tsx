import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/products";
import { listOrdersForUser } from "@/lib/orders";
import { orderStatusLabels, orderStatusTone, paymentMethodLabels } from "@/lib/order-status";

export const metadata: Metadata = {
  title: "Mis pedidos",
  robots: { index: false, follow: false },
};

// Lee la cookie de sesión y los pedidos: se renderiza en cada petición.
export const instant = false;

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "long",
  timeStyle: "short",
});

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/ingresar");

  const orders = await listOrdersForUser(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">Cuenta</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Mis pedidos</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
        Historial de los pedidos hechos con {user.email}.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 border border-ink/15 bg-bone-dim/40 p-8 text-center">
          <p className="font-display text-2xl tracking-tight">Aún no hay pedidos</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/65">
            Cuando compres con este correo, el pedido aparecerá aquí con su estado y su detalle.
          </p>
          <Link
            href="/productos"
            className="mt-6 inline-flex min-h-11 items-center justify-center bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase hover:bg-accent"
          >
            Ver camisetas
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="border border-ink/15">
              <details className="group">
                <summary className="flex cursor-pointer flex-wrap items-start justify-between gap-3 p-5">
                  <span className="min-w-0">
                    <span className="block font-mono text-xs break-all text-ink/60">
                      {order.code}
                    </span>
                    <span className="mt-1 block text-sm">
                      {dateFormatter.format(order.created_at)}
                    </span>
                    <span className="mt-1 block text-xs text-ink/60">
                      {paymentMethodLabels[order.payment_method]} ·{" "}
                      {order.items.reduce((count, item) => count + item.quantity, 0)}{" "}
                      {order.items.reduce((count, item) => count + item.quantity, 0) === 1
                        ? "prenda"
                        : "prendas"}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase ${orderStatusTone[order.status]}`}
                    >
                      {orderStatusLabels[order.status]}
                    </span>
                    <span className="text-base font-semibold">
                      {order.total === null ? "Por confirmar" : formatPrice(order.total)}
                    </span>
                  </span>
                </summary>

                <div className="border-t border-ink/10 px-5 py-4">
                  <ul className="divide-y divide-ink/10">
                    {order.items.map((item) => (
                      <li
                        key={`${order.id}-${item.product_name}-${item.size}-${item.color}`}
                        className="flex items-start justify-between gap-4 py-2 text-sm"
                      >
                        <span>
                          {item.product_name}
                          <span className="mt-0.5 block text-xs text-ink/60">
                            {item.color} · Talla {item.size} · {item.quantity}
                          </span>
                        </span>
                        <strong className="shrink-0">{formatPrice(item.total)}</strong>
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt>Subtotal</dt>
                      <dd>{formatPrice(order.subtotal)}</dd>
                    </div>
                    {order.discount > 0 ? (
                      <div className="flex justify-between gap-3">
                        <dt>Descuento{order.coupon_code ? ` · ${order.coupon_code}` : ""}</dt>
                        <dd>−{formatPrice(order.discount)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-3">
                      <dt>Envío</dt>
                      <dd>
                        {order.shipping === null
                          ? "Por confirmar"
                          : order.shipping === 0
                            ? "Gratis"
                            : formatPrice(order.shipping)}
                      </dd>
                    </div>
                  </dl>

                  <p className="mt-3 text-xs leading-relaxed text-ink/55">
                    Entrega en {order.address}, {order.city}, {order.department}.
                  </p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/cuenta"
        className="mt-8 inline-block text-sm underline decoration-accent underline-offset-4"
      >
        Volver a mi cuenta
      </Link>
    </div>
  );
}
