"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";

import { formatPrice } from "@/lib/products";
import { readOrderSnapshot, type OrderSnapshot } from "@/lib/order-snapshot";
import { site } from "@/lib/site";

const policyLinks = [
  { href: "/politicas/envios", label: "Envíos y entregas" },
  { href: "/politicas/cambios", label: "Cambios y devoluciones" },
  { href: "/politicas/terminos", label: "Términos y condiciones" },
  { href: "/politicas/privacidad", label: "Tratamiento de datos" },
];

/** sessionStorage no emite eventos: la instantánea solo cambia al montar la página. */
const subscribeToSession = () => () => {};

function nextSteps(snapshot: OrderSnapshot | null): string {
  if (!snapshot) {
    return "Escríbenos por WhatsApp con tu número de pedido para confirmar disponibilidad, tarifa y plazo de envío antes de pagar o despachar.";
  }

  switch (snapshot.paymentMethod) {
    case "cash_on_delivery":
      return "Confirma el pedido por WhatsApp. Validamos la cobertura de contraentrega en tu municipio, la tarifa y el plazo del envío antes de despachar. No pagas nada hasta recibir.";
    case "bank_transfer":
      return "Confirma el pedido por WhatsApp. Después de cotizar el envío te compartimos los datos de Nequi, DaviPlata o Bancolombia y el valor exacto a transferir.";
    case "mercado_pago":
      return "El pago digital se procesa en Mercado Pago. Cuando se confirme, el equipo prepara el pedido y te contacta para coordinar la entrega.";
    default:
      return "Escríbenos por WhatsApp para confirmar los detalles del pedido.";
  }
}

export function OrderThankYou() {
  const orderId = useSearchParams().get("pedido")?.trim() ?? "";
  const snapshot = useSyncExternalStore(
    subscribeToSession,
    () => readOrderSnapshot(orderId),
    () => null,
  );
  const hydrated = useSyncExternalStore(
    subscribeToSession,
    () => true,
    () => false,
  );

  if (!orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 md:py-20">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">Pedido</p>
        <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">No encontramos el pedido</h1>
        <p className="mt-4 text-base leading-relaxed text-ink/70">
          Esta página necesita el número de pedido. Si acabas de comprar, revisa el enlace que te
          llevó aquí o escríbenos por WhatsApp y lo buscamos contigo.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/productos"
            className="inline-flex min-h-11 items-center justify-center bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase hover:bg-accent"
          >
            Volver al catálogo
          </Link>
          <a
            href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hola, necesito ayuda para encontrar mi pedido de KMIZS.")}`}
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

  const whatsappHref =
    snapshot?.whatsappUrl ??
    `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
      `Hola, quiero confirmar el pedido ${orderId} de KMIZS.`,
    )}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">
        Pedido registrado
      </p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Gracias por tu compra</h1>
      <p className="mt-4 text-base leading-relaxed text-ink/70">
        Tu pedido <strong className="font-semibold break-all text-ink">{orderId}</strong> quedó
        registrado y el equipo KMIZS recibió el detalle por correo. Guarda este número: lo necesitas
        para cualquier cambio, garantía o consulta.
      </p>

      <section
        aria-labelledby="siguientes-pasos"
        className="mt-8 border border-ink/15 bg-bone-dim/40 p-5 sm:p-6"
      >
        <h2 id="siguientes-pasos" className="text-xl tracking-tight">
          Qué sigue
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">{nextSteps(snapshot)}</p>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex min-h-12 items-center justify-center bg-ink px-6 py-3 text-center text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
        >
          Confirmar por WhatsApp
        </a>
        <p className="mt-3 text-xs text-ink/55">
          Si no se abre WhatsApp, escríbenos al {site.whatsappDisplay} o a {site.email}.
        </p>
      </section>

      {!hydrated ? (
        <p className="mt-8 text-sm text-ink/60" role="status">
          Cargando el resumen del pedido…
        </p>
      ) : snapshot ? (
        <section aria-labelledby="resumen-pedido" className="mt-8 border border-ink/15 p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="resumen-pedido" className="text-xl tracking-tight">
              Resumen del pedido
            </h2>
            <span className="text-xs text-ink/50">
              {new Date(snapshot.createdAt).toLocaleString("es-CO", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </span>
          </div>

          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {snapshot.lines.map((line) => (
              <li
                key={`${line.name}-${line.size}-${line.color}`}
                className="flex items-start justify-between gap-4 py-3 text-sm"
              >
                <span>
                  {line.name}
                  <span className="mt-0.5 block text-xs text-ink/60">
                    {line.color} · Talla {line.size} · {line.quantity}{" "}
                    {line.quantity === 1 ? "unidad" : "unidades"}
                  </span>
                </span>
                <strong className="shrink-0">{formatPrice(line.total)}</strong>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt>Subtotal</dt>
              <dd>{formatPrice(snapshot.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Envío{snapshot.shippingZone ? ` · ${snapshot.shippingZone}` : ""}</dt>
              <dd>
                {snapshot.shipping === null ? "Por confirmar" : formatPrice(snapshot.shipping)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-ink/15 pt-2 text-base">
              <dt className="font-semibold">
                {snapshot.total === null ? "Subtotal de productos" : "Total"}
              </dt>
              <dd className="font-semibold">{formatPrice(snapshot.total ?? snapshot.subtotal)}</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs leading-relaxed text-ink/55">
            {snapshot.shipping === null
              ? "Este no es el total final: el envío se cotiza y se comunica antes de pagar."
              : `Entrega en ${snapshot.city}, ${snapshot.department}.`}
          </p>

          <p className="mt-4 border-t border-ink/10 pt-3 text-xs leading-relaxed text-ink/55">
            El resumen se guarda solo en este dispositivo. Si recargas o cambias de navegador,
            conserva el número de pedido para que podamos ayudarte.
          </p>
        </section>
      ) : (
        <section className="mt-8 border border-ink/15 bg-bone-dim/40 p-5 sm:p-6">
          <h2 className="text-xl tracking-tight">No encontramos el resumen en este dispositivo</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            El pedido quedó registrado con el número{" "}
            <strong className="font-semibold break-all text-ink">{orderId}</strong>, pero el detalle
            no está disponible aquí. Por seguridad no almacenamos pedidos en el sitio.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            Escríbenos por WhatsApp con ese número y te reenviamos el resumen y las instrucciones de
            pago o entrega.
          </p>
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-11 items-center justify-center border border-ink/25 px-6 py-3 text-sm font-semibold tracking-[0.12em] uppercase hover:border-ink"
        >
          Imprimir o guardar comprobante
        </button>
        <Link
          href="/productos"
          className="inline-flex min-h-11 items-center justify-center border border-ink/25 px-6 py-3 text-sm font-semibold tracking-[0.12em] uppercase hover:border-ink"
        >
          Seguir comprando
        </Link>
      </div>

      <section aria-labelledby="politicas-pedido" className="mt-10 border-t border-ink/10 pt-6">
        <h2
          id="politicas-pedido"
          className="text-[11px] font-semibold tracking-[0.18em] text-ink/50 uppercase"
        >
          Conoce tus derechos
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {policyLinks.map((policy) => (
            <li key={policy.href}>
              <Link
                href={policy.href}
                className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
              >
                {policy.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-ink/55">
          Tienes 5 días hábiles para ejercer el retracto y la garantía legal cubre defectos de
          producción. Las condiciones completas están en las políticas.
        </p>
      </section>
    </div>
  );
}
