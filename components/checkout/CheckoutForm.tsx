"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import colombianLocations from "@/lib/colombian-locations.json";
import { freeShippingReason, qualifiesForFreeShipping } from "@/lib/free-shipping";
import { saveOrderSnapshot } from "@/lib/order-snapshot";
import { trackEvent } from "@/lib/analytics";
import { formatPrice } from "@/lib/products";
import type { ShippingOptions } from "@/lib/shipping";
import { getShippingZoneForAddress } from "@/lib/shipping-location";

type PaymentMethod = "mercado_pago" | "cash_on_delivery";

interface CheckoutFormProps {
  shippingOptions: ShippingOptions;
  onlinePaymentsAvailable: boolean;
  defaultCustomer: { name: string; email: string } | null;
  mpDemo: {
    email: string;
    password: string;
    loginUrl: string;
    cards: { result: string; card: string; holder: string }[];
  };
}

interface CheckoutTotals {
  subtotal: number;
  discount: number;
  shipping: number | null;
  total: number | null;
}

interface CheckoutResponse {
  orderId?: string;
  paymentUrl?: string;
  whatsappUrl?: string;
  totals?: CheckoutTotals;
  error?: string;
}

interface AppliedCoupon {
  code: string;
  percentOff: number;
  discount: number;
  description: string;
}

const paymentOptions: {
  id: PaymentMethod;
  title: string;
  description: string;
}[] = [
  {
    id: "cash_on_delivery",
    title: "Contraentrega",
    description: "Confirmaremos por WhatsApp si está disponible para tu destino.",
  },
  {
    id: "mercado_pago",
    title: "Pago digital · Mercado Pago",
    description: "Tarjeta, PSE o efectivo en el checkout seguro de Mercado Pago.",
  },
];

export function CheckoutForm({
  shippingOptions,
  onlinePaymentsAvailable,
  defaultCustomer,
  mpDemo,
}: CheckoutFormProps) {
  const router = useRouter();
  const { items, ready, clearCart, getProduct } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const lines = useMemo(
    () =>
      items.flatMap((item) => {
        const product = getProduct(item.slug);
        return product ? [{ ...item, product, total: product.price * item.quantity }] : [];
      }),
    [items, getProduct],
  );
  const subtotal = lines.reduce((total, item) => total + item.total, 0);
  const shippingLines = lines.map((line) => ({
    quantity: line.quantity,
    isCustom: line.product.type === "personalizada",
  }));
  const freeShipping = qualifiesForFreeShipping(shippingLines);
  const freeShippingNote = freeShippingReason(shippingLines);
  const municipalities =
    colombianLocations.departments.find((location) => location.name === department)
      ?.municipalities ?? [];
  const selectedZone = getShippingZoneForAddress(shippingOptions, city, department);
  const shippingRate = freeShipping ? 0 : (selectedZone?.rate ?? null);
  const discount = Math.min(coupon?.discount ?? 0, subtotal);
  const estimatedTotal = shippingRate === null ? null : subtotal - discount + shippingRate;

  async function copyDemo(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(`${label} copiado.`);
    } catch {
      setCopyMessage("No se pudo copiar. Está en docs/mercado-pago-sandbox.md.");
    }
  }

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    setCouponError("");
    setCouponMessage("");

    if (!code) {
      setCouponError("Escribe un código de descuento.");
      return;
    }

    setCheckingCoupon(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          items: lines.map(({ slug, size, color, quantity }) => ({ slug, size, color, quantity })),
        }),
      });
      const result = (await response.json()) as {
        valid?: boolean;
        code?: string;
        percentOff?: number;
        discount?: number;
        description?: string;
        reason?: string;
      };

      if (!response.ok || !result.valid) {
        setCoupon(null);
        setCouponError(result.reason ?? "Ese código no está disponible.");
        return;
      }

      setCoupon({
        code: result.code ?? code,
        percentOff: result.percentOff ?? 0,
        discount: result.discount ?? 0,
        description: result.description ?? "",
      });
      setCouponMessage(`Cupón aplicado: ${result.description ?? `−${result.percentOff}%`}`);
    } catch (requestError) {
      console.error("No se pudo validar el cupón.", requestError);
      setCouponError("No pudimos validar el cupón. Inténtalo de nuevo.");
    } finally {
      setCheckingCoupon(false);
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponInput("");
    setCouponMessage("");
    setCouponError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!ready || lines.length === 0) {
      setError("Tu carrito está vacío. Agrega al menos un producto para continuar.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      customer: {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        city: formData.get("city"),
        department: formData.get("department"),
        notes: formData.get("notes"),
      },
      items: lines.map(({ slug, size, color, quantity }) => ({ slug, size, color, quantity })),
      paymentMethod,
      couponCode: coupon?.code ?? null,
      acceptsPrivacy: formData.get("privacy") === "on",
    };

    setSubmitting(true);
    trackEvent("initiate_checkout", {
      value: estimatedTotal ?? subtotal - discount,
      currency: "COP",
      content_ids: lines.map((line) => line.slug),
      num_items: lines.reduce((count, line) => count + line.quantity, 0),
    });
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        setError(result.error ?? "No pudimos registrar el pedido. Inténtalo de nuevo.");
        return;
      }

      if (!result.orderId) {
        setError(
          "El servidor no devolvió el número del pedido. Contáctanos antes de volver a pagar.",
        );
        return;
      }

      const totals: CheckoutTotals = result.totals ?? {
        subtotal,
        discount,
        shipping: shippingRate,
        total: estimatedTotal,
      };

      saveOrderSnapshot({
        id: result.orderId,
        createdAt: new Date().toISOString(),
        paymentMethod,
        paymentLabel: paymentOptions.find((option) => option.id === paymentMethod)?.title ?? "Pago",
        whatsappUrl: result.whatsappUrl ?? null,
        customerName: String(formData.get("name") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        city,
        department,
        lines: lines.map((line) => ({
          name: line.product.name,
          color: line.color,
          size: line.size,
          quantity: line.quantity,
          total: line.total,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode: coupon?.code ?? null,
        shipping: totals.shipping,
        shippingZone: freeShipping ? "Envío gratis" : (selectedZone?.label ?? null),
        total: totals.total,
      });

      if (paymentMethod === "mercado_pago") {
        if (!result.paymentUrl) {
          setError("No recibimos el enlace de pago. No se realizó ningún cobro.");
          return;
        }
        window.location.assign(result.paymentUrl);
        return;
      }

      setRedirecting(true);
      clearCart();
      router.push(`/checkout/gracias?pedido=${encodeURIComponent(result.orderId)}`);
    } catch (requestError) {
      console.error("No se pudo enviar el pedido.", requestError);
      setError("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (redirecting) {
    return (
      <section className="mt-8 border border-ink/15 bg-bone-dim/40 p-6 sm:p-9" aria-live="polite">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">
          Pedido registrado
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Abriendo el resumen de tu pedido…
        </p>
      </section>
    );
  }

  if (ready && lines.length === 0) {
    return (
      <div className="mt-8 border border-ink/15 p-6">
        <p>Tu carrito está vacío.</p>
        <Link
          href="/productos"
          className="mt-4 inline-block underline decoration-accent underline-offset-4"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_21rem]">
      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-xl tracking-tight">Datos de envío</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold sm:col-span-2">
              Nombre completo
              <input
                name="name"
                required
                autoComplete="name"
                maxLength={80}
                defaultValue={defaultCustomer?.name ?? ""}
                className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
              />
            </label>
            <label className="text-sm font-semibold">
              Correo electrónico
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                maxLength={254}
                defaultValue={defaultCustomer?.email ?? ""}
                className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
              />
            </label>
            <label className="text-sm font-semibold">
              Celular
              <input
                type="tel"
                name="phone"
                required
                autoComplete="tel"
                maxLength={20}
                inputMode="tel"
                className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
              />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Dirección
              <input
                name="address"
                required
                autoComplete="street-address"
                maxLength={160}
                className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
              />
            </label>
            <label className="text-sm font-semibold">
              Departamento
              <select
                name="department"
                required
                value={department}
                onChange={(event) => {
                  setDepartment(event.target.value);
                  setCity("");
                }}
                className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
              >
                <option value="">Selecciona un departamento</option>
                {colombianLocations.departments.map((location) => (
                  <option key={location.name} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Ciudad o municipio
              <select
                name="city"
                required
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
                disabled={!department}
              >
                <option value="">
                  {department ? "Selecciona un municipio" : "Primero selecciona un departamento"}
                </option>
                {municipalities.map((municipality) => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Indicaciones adicionales <span className="font-normal text-ink/50">(opcional)</span>
              <textarea
                name="notes"
                rows={2}
                maxLength={300}
                className="mt-2 w-full border border-ink/25 bg-bone px-3 py-2 font-normal"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xl tracking-tight">Envío</legend>
          {freeShipping ? (
            <p className="border border-ink/15 bg-bone-dim/40 p-4 text-sm leading-relaxed text-ink/70">
              {freeShippingNote} El plazo de entrega se confirma según tu municipio antes de
              despachar.
              {city && department && !selectedZone
                ? ` Aún no tenemos cobertura confirmada para ${city}, ${department}: el equipo la valida por WhatsApp antes de despachar.`
                : ""}
            </p>
          ) : shippingOptions.confirmed ? (
            <p className="border border-ink/15 bg-bone-dim/40 p-4 text-sm leading-relaxed text-ink/70">
              {selectedZone
                ? `Zona: ${selectedZone.label}. Tarifa ${formatPrice(selectedZone.rate)} · ${selectedZone.eta} días hábiles.`
                : city && department
                  ? `No encontramos cobertura configurada para ${city}, ${department}. El equipo confirmará la tarifa y el plazo por WhatsApp antes de cualquier pago.`
                  : "Selecciona un municipio y departamento para consultar la cobertura y tarifa de envío."}
            </p>
          ) : (
            <p className="border border-ink/15 bg-bone-dim/40 p-4 text-sm leading-relaxed text-ink/70">
              {city && department
                ? `La tarifa y el tiempo para ${city}, ${department} aún no están confirmados con la transportadora. Registraremos el pedido y te confirmaremos ambos por WhatsApp antes de cualquier pago o despacho.`
                : "La tarifa y el tiempo para tu ciudad aún no están confirmados con la transportadora. Registraremos el pedido y te confirmaremos ambos por WhatsApp antes de cualquier pago o despacho."}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xl tracking-tight">Cupón de descuento</legend>
          {coupon ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border border-ink/15 bg-bone-dim/40 p-4 text-sm">
              <span>
                <strong>{coupon.code}</strong> · {coupon.description || `${coupon.percentOff}% de descuento`}
                <span className="block text-xs text-ink/60">
                  Se aplica sobre el subtotal de productos, no sobre el envío.
                </span>
              </span>
              <button
                type="button"
                onClick={removeCoupon}
                className="min-h-10 px-2 text-xs font-semibold tracking-wide text-ink/60 underline underline-offset-4 hover:text-accent"
              >
                Quitar cupón
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <label className="flex-1 text-sm font-semibold">
                Código
                <input
                  name="coupon"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  maxLength={32}
                  autoComplete="off"
                  placeholder="PRIMERA10"
                  className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal tracking-widest uppercase"
                />
              </label>
              <button
                type="button"
                onClick={applyCoupon}
                disabled={checkingCoupon}
                className="mt-7 min-h-11 self-start border border-ink/25 px-5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors hover:border-ink disabled:opacity-50"
              >
                {checkingCoupon ? "Revisando…" : "Aplicar"}
              </button>
            </div>
          )}
          {couponError ? (
            <p role="alert" className="text-sm text-accent">
              {couponError}
            </p>
          ) : null}
          {couponMessage ? (
            <p role="status" className="text-sm text-ink/70">
              {couponMessage}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-xl tracking-tight">Medio de pago</legend>
          {paymentOptions.map((option) => {
            const unavailable =
              option.id === "mercado_pago" &&
              (!shippingOptions.confirmed || !onlinePaymentsAvailable || !selectedZone);
            return (
              <label
                key={option.id}
                className={`flex gap-3 border border-ink/15 p-4 ${
                  unavailable ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={option.id}
                  checked={paymentMethod === option.id}
                  disabled={unavailable}
                  onChange={() => setPaymentMethod(option.id)}
                  className="mt-1 accent-accent"
                />
                <span className="text-sm">
                  <strong>{option.title}</strong>
                  <span className="mt-1 block text-xs leading-relaxed text-ink/60">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
          {!onlinePaymentsAvailable ? (
            <p className="text-xs leading-relaxed text-ink/55">
              El pago digital se activa cuando el equipo configure en Vercel las credenciales de
              Mercado Pago, la firma del webhook, Resend y las tarifas de envío confirmadas.
            </p>
          ) : null}
          {onlinePaymentsAvailable && !selectedZone ? (
            <p className="text-xs leading-relaxed text-ink/55">
              {city && department
                ? "No encontramos este municipio en las zonas configuradas. El pago digital estará disponible cuando el equipo confirme su cobertura."
                : "Elige tu departamento y municipio para habilitar el pago digital."}
            </p>
          ) : null}

          {paymentMethod === "mercado_pago" ? (
            <aside
              aria-label="Ayuda para la compra de prueba en Mercado Pago"
              className="border border-ink/15 bg-bone p-4"
            >
              <h3 className="text-sm font-semibold">Cómo pagar en la prueba</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink/70">
                Abre Mercado Pago en otra pestaña, entra con la cuenta de prueba y elige una tarjeta
                guardada. Usa un correo de ejemplo en el formulario de la tienda, no tu correo real
                de Mercado Pago.
              </p>

              <ul className="mt-3 space-y-1 text-xs">
                {mpDemo.cards.map((demoCard) => (
                  <li key={demoCard.card} className="flex flex-wrap gap-x-2">
                    <strong className="min-w-20">{demoCard.result}</strong>
                    <span>
                      {demoCard.card}
                      <span className="text-ink/55"> · titular {demoCard.holder}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-ink/55">CVV 123 si la pasarela lo solicita.</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyDemo(mpDemo.email, "Correo")}
                  className="min-h-10 border border-ink/25 px-3 text-xs font-semibold tracking-[0.06em] uppercase hover:border-ink"
                >
                  Copiar correo
                </button>
                <button
                  type="button"
                  onClick={() => copyDemo(mpDemo.password, "Clave")}
                  className="min-h-10 border border-ink/25 px-3 text-xs font-semibold tracking-[0.06em] uppercase hover:border-ink"
                >
                  Copiar clave
                </button>
                <a
                  href={mpDemo.loginUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center border border-ink/15 bg-ink px-3 text-xs font-semibold tracking-[0.06em] text-bone uppercase hover:bg-accent"
                >
                  Abrir Mercado Pago
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </a>
              </div>

              {copyMessage ? (
                <p role="status" className="mt-2 text-xs text-ink/60">
                  {copyMessage}
                </p>
              ) : null}
            </aside>
          ) : null}
        </fieldset>

        <label className="flex items-start gap-3 text-sm leading-relaxed text-ink/70">
          <input type="checkbox" name="privacy" required className="mt-1 accent-accent" />
          <span>
            Autorizo el tratamiento de mis datos para gestionar este pedido. Consulta la{" "}
            <Link
              href="/politicas/privacidad"
              target="_blank"
              className="underline decoration-accent underline-offset-4"
            >
              política de privacidad
            </Link>
            .
          </span>
        </label>

        {error ? (
          <p role="alert" className="border border-accent/40 bg-accent/5 p-4 text-sm">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!ready || submitting || lines.length === 0}
          className="min-h-12 w-full bg-ink px-6 py-4 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting
            ? "Registrando pedido…"
            : paymentMethod === "mercado_pago"
              ? "Ir a pagar"
              : "Registrar pedido"}
        </button>
      </form>

      <aside className="h-fit border border-ink/15 bg-bone-dim/40 p-5 sm:p-6">
        <h2 className="text-xl tracking-tight">Resumen del pedido</h2>
        <ul className="mt-5 space-y-4">
          {lines.map((item) => (
            <li
              key={`${item.slug}-${item.size}-${item.color}`}
              className="flex items-center gap-3 text-sm"
            >
              <div className="relative size-14 shrink-0 overflow-hidden bg-bone">
                <Image
                  src={item.product.image.src}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <span className="min-w-0 flex-1">
                {item.product.name}
                <span className="block text-xs text-ink/60">
                  {item.color} · {item.size} · {item.quantity}
                </span>
              </span>
              <strong className="shrink-0">{formatPrice(item.total)}</strong>
            </li>
          ))}
        </ul>
        <div className="mt-5 space-y-3 border-t border-ink/15 pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          {coupon ? (
            <div className="flex justify-between gap-3">
              <span>
                Descuento
                <span className="block text-xs text-ink/55">{coupon.code}</span>
              </span>
              <strong>−{formatPrice(discount)}</strong>
            </div>
          ) : null}
          {freeShipping ? (
            <div className="flex justify-between gap-3">
              <span>
                Envío
                <span className="block text-xs text-ink/55">
                  {freeShippingNote?.replace(/\.$/, "")}
                </span>
              </span>
              <strong>Gratis</strong>
            </div>
          ) : shippingOptions.confirmed ? (
            <div className="flex justify-between gap-3">
              <span>
                Envío{selectedZone ? ` · ${selectedZone.label}` : ""}
                {selectedZone ? (
                  <span className="block text-xs text-ink/55">{selectedZone.eta} hábiles</span>
                ) : null}
              </span>
              <strong>{selectedZone ? formatPrice(selectedZone.rate) : "Por confirmar"}</strong>
            </div>
          ) : (
            <div className="flex justify-between gap-3 text-ink/65">
              <span>Envío{city && department ? ` · ${city}, ${department}` : ""}</span>
              <span>{selectedZone ? formatPrice(selectedZone.rate) : "Por confirmar"}</span>
            </div>
          )}
          <div className="flex justify-between gap-3 border-t border-ink/15 pt-3 text-base">
            <strong>
              {freeShipping || (shippingOptions.confirmed && selectedZone) ? "Total" : "Por pagar"}
            </strong>
            <strong>{formatPrice(estimatedTotal ?? subtotal - discount)}</strong>
          </div>
          {freeShipping ? (
            <p className="text-xs leading-relaxed text-ink/55">
              El envío es gratis. El plazo de entrega se confirma según tu municipio.
            </p>
          ) : !shippingOptions.confirmed || !selectedZone ? (
            <p className="text-xs leading-relaxed text-ink/55">
              Este no es el total final. El envío se cotiza y comunica antes de pagar.
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
