"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { site } from "@/lib/site";

interface PaymentStatus {
  status?: string;
  statusDetail?: string;
  orderId?: string;
  error?: string;
}

export function PaymentResult() {
  const paymentId = useSearchParams().get("payment_id") ?? "";
  const { clearCart } = useCart();
  const [status, setStatus] = useState<PaymentStatus | null>(
    paymentId ? null : { error: "No recibimos el identificador de pago." },
  );

  useEffect(() => {
    if (!paymentId) return;

    let active = true;
    fetch(`/api/payments/status?payment_id=${encodeURIComponent(paymentId)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = (await response.json()) as PaymentStatus;
        if (!response.ok) throw new Error(result.error ?? "No pudimos verificar el pago.");
        if (!active) return;
        setStatus(result);
        if (result.status === "approved") clearCart();
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("No se pudo verificar el resultado del pago.", error);
        setStatus({
          error: error instanceof Error ? error.message : "No pudimos verificar el pago.",
        });
      });

    return () => {
      active = false;
    };
  }, [clearCart, paymentId]);

  const isApproved = status?.status === "approved";
  const isPending = status?.status === "pending" || status?.status === "in_process";

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 md:py-20" aria-live="polite">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">
        Mercado Pago
      </p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">
        {isApproved
          ? "Pago aprobado"
          : isPending
            ? "Pago en proceso"
            : status?.status === "rejected"
              ? "Pago no aprobado"
              : "Verificando el pago"}
      </h1>
      {status?.error ? (
        <p role="alert" className="mt-5 border border-accent/40 bg-accent/5 p-4 text-sm">
          {status.error}
        </p>
      ) : (
        <p className="mt-5 text-sm leading-relaxed text-ink/70">
          {!status
            ? "Consultando el estado directamente con Mercado Pago…"
            : isApproved
              ? "Confirmamos el pago. El equipo KMIZS recibió el registro de tu pedido."
              : isPending
                ? "Mercado Pago todavía está procesando el pago. Puedes revisar el estado más tarde."
                : "No se confirmó el pago. No vuelvas a pagar si el banco muestra un débito; contáctanos para revisar el pedido."}
        </p>
      )}
      {status?.statusDetail ? (
        <p className="mt-3 text-xs text-ink/55">Detalle: {status.statusDetail}</p>
      ) : null}
      {status?.orderId ? (
        <p className="mt-3 text-sm text-ink/70">
          Pedido <strong className="font-semibold break-all text-ink">{status.orderId}</strong>
        </p>
      ) : null}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {status?.orderId && (isApproved || isPending) ? (
          <Link
            href={`/checkout/gracias?pedido=${encodeURIComponent(status.orderId)}`}
            className="inline-flex min-h-11 items-center justify-center bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase hover:bg-accent"
          >
            Ver resumen del pedido
          </Link>
        ) : null}
        <Link
          href="/productos"
          className="inline-flex min-h-11 items-center justify-center bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase hover:bg-accent"
        >
          Volver al catálogo
        </Link>
        <a
          href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hola, necesito ayuda con el estado de mi pago de KMIZS.")}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center border border-ink/25 px-6 py-3 text-sm font-semibold tracking-[0.12em] uppercase hover:border-ink"
        >
          Ayuda por WhatsApp
        </a>
      </div>
    </div>
  );
}
