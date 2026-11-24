import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/cuenta/actions";
import { getCurrentUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";
import { orderStatusLabels } from "@/lib/order-status";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false, follow: false },
};

// Lee la cookie de sesión y los pedidos: se renderiza en cada petición.
export const instant = false;

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cuenta/ingresar");

  const orders = await listOrdersForUser(user.id);
  // Un pedido de Mercado Pago aprobado y uno de contraentrega confirmado
  // cuentan igual: la compra quedó en firme.
  const confirmed = orders.filter(
    (order) => order.status === "approved" || order.status === "confirmed",
  ).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">Cuenta</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Hola, {user.name}</h1>
      <p className="mt-4 text-base leading-relaxed text-ink/70">{user.email}</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="border border-ink/15 bg-bone-dim/40 p-5">
          <dt className="text-xs font-semibold tracking-[0.14em] text-ink/55 uppercase">Pedidos</dt>
          <dd className="mt-2 text-3xl font-semibold">{orders.length}</dd>
        </div>
        <div className="border border-ink/15 bg-bone-dim/40 p-5">
          <dt className="text-xs font-semibold tracking-[0.14em] text-ink/55 uppercase">
            Confirmados
          </dt>
          <dd className="mt-2 text-3xl font-semibold">{confirmed}</dd>
        </div>
      </dl>

      {orders.length > 0 ? (
        <p className="mt-6 text-sm text-ink/65">
          Último pedido: {orders[0].code} · {orderStatusLabels[orders[0].status].toLowerCase()}.
        </p>
      ) : (
        <p className="mt-6 text-sm text-ink/65">
          Todavía no tienes pedidos con este correo. Si compraste como invitado, aparecerán aquí
          automáticamente.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/cuenta/pedidos"
          className="inline-flex min-h-12 items-center justify-center bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/productos"
          className="inline-flex min-h-12 items-center justify-center border border-ink/25 px-6 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition-colors hover:border-ink"
        >
          Seguir comprando
        </Link>
      </div>

      <form action={logoutAction} className="mt-10 border-t border-ink/10 pt-6">
        <button
          type="submit"
          className="text-sm text-ink/60 underline decoration-accent underline-offset-4 hover:text-accent"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
