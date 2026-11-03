"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import colombianLocations from "@/lib/colombian-locations.json";
import { formatPrice, getProductBySlug } from "@/lib/products";
import type { ShippingOptions } from "@/lib/shipping";
import { getShippingZoneForAddress } from "@/lib/shipping-location";
import { site } from "@/lib/site";

type PaymentMethod = "mercado_pago" | "cash_on_delivery" | "bank_transfer";

interface CheckoutFormProps {
  shippingOptions: ShippingOptions;
  onlinePaymentsAvailable: boolean;
}

interface CheckoutResponse {
  orderId?: string;
  paymentUrl?: string;
  whatsappUrl?: string;
  error?: string;
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
    id: "bank_transfer",
    title: "Transferencia o billetera",
    description: "Te enviaremos los datos para pagar por WhatsApp después de cotizar el envío.",
  },
  {
    id: "mercado_pago",
    title: "Pago digital · Mercado Pago",
    description: "Sandbox para pruebas; se habilita al configurar las credenciales y el envío.",
  },
];

export function CheckoutForm({ shippingOptions, onlinePaymentsAvailable }: CheckoutFormProps) {
  const { items, ready, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registeredOrder, setRegisteredOrder] = useState<{
    id: string;
    whatsappUrl: string;
  } | null>(null);

  const lines = useMemo(
    () =>
      items.flatMap((item) => {
        const product = getProductBySlug(item.slug);
        return product ? [{ ...item, product, total: product.price * item.quantity }] : [];
      }),
    [items],
  );
  const subtotal = lines.reduce((total, item) => total + item.total, 0);
  const municipalities =
    colombianLocations.departments.find((location) => location.name === department)
      ?.municipalities ?? [];
  const selectedZone = getShippingZoneForAddress(shippingOptions, city, department);
  const estimatedTotal = subtotal + (selectedZone?.rate ?? 0);

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
      acceptsPrivacy: formData.get("privacy") === "on",
    };

    setSubmitting(true);
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

      if (paymentMethod === "mercado_pago") {
        if (!result.paymentUrl) {
          setError("No recibimos el enlace de pago. No se realizó ningún cobro.");
          return;
        }
        window.location.assign(result.paymentUrl);
        return;
      }

      if (!result.whatsappUrl) {
        setError("El pedido se registró, pero faltó el enlace para confirmarlo por WhatsApp.");
        return;
      }

      clearCart();
      setRegisteredOrder({ id: result.orderId, whatsappUrl: result.whatsappUrl });
    } catch (requestError) {
      console.error("No se pudo enviar el pedido.", requestError);
      setError("No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (registeredOrder) {
    return (
      <section className="mt-8 border border-ink/15 bg-bone-dim/40 p-6 sm:p-9" aria-live="polite">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">
          Pedido registrado
        </p>
        <h2 className="mt-2 text-3xl tracking-tight">Pedido {registeredOrder.id}</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/70">
          Enviamos el detalle al equipo. Abre WhatsApp y envía el mensaje para confirmar
          disponibilidad, tarifa y plazo del envío antes de pagar o despachar.
        </p>
        <a
          href={registeredOrder.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex min-h-12 items-center justify-center bg-ink px-6 py-3 text-center text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
        >
          Confirmar por WhatsApp
        </a>
        <p className="mt-3 text-xs text-ink/55">
          Si no se abre WhatsApp, escríbenos al {site.whatsappDisplay}.
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
          {shippingOptions.confirmed ? (
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
                  {option.id === "bank_transfer" ? (
                    <span
                      className="mt-3 grid max-w-md grid-cols-2 gap-2"
                      aria-label="Medios de pago"
                    >
                      <span className="flex min-h-12 items-center gap-2 border border-ink/10 bg-white px-3">
                        <span
                          aria-hidden="true"
                          className="grid size-7 place-items-center rounded-lg bg-[#4b168c] text-sm font-black text-white"
                        >
                          N
                        </span>
                        <span className="text-base font-extrabold tracking-tight text-[#4b168c]">
                          nequi
                        </span>
                      </span>
                      <span className="flex min-h-12 items-center gap-2 border border-ink/10 bg-white px-3">
                        <span
                          aria-hidden="true"
                          className="grid size-7 place-items-center rounded-full bg-[#e3212b] text-sm font-black text-white"
                        >
                          D
                        </span>
                        <span className="text-sm font-extrabold tracking-tight text-[#d91f2b]">
                          DaviPlata
                        </span>
                      </span>
                      <span className="flex min-h-12 items-center gap-2 border border-ink/10 bg-white px-3">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 28 28"
                          className="size-7 shrink-0"
                          fill="none"
                        >
                          <path d="M5 8.5 14 4l9 4.5-9 4.5L5 8.5Z" fill="#F7C600" />
                          <path d="M5 8.5v10L14 23V13L5 8.5Z" fill="#D52B1E" />
                          <path d="m23 8.5-9 4.5v10l9-4.5v-10Z" fill="#B71C1C" />
                        </svg>
                        <span className="text-[11px] leading-tight font-extrabold tracking-tight text-[#c62828] sm:text-xs">
                          Bancolombia
                        </span>
                      </span>
                      <span className="flex min-h-12 items-center justify-between gap-2 border border-dashed border-ink/20 bg-white px-3 opacity-60">
                        <span className="text-lg font-black tracking-[-0.08em] text-ink">addi</span>
                        <span className="text-[9px] leading-tight font-semibold tracking-wide text-ink/60 uppercase">
                          Próximamente
                        </span>
                      </span>
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
          {!onlinePaymentsAvailable ? (
            <p className="text-xs leading-relaxed text-ink/55">
              El sandbox se activa cuando el equipo configure en Vercel el token TEST- y la firma de
              Mercado Pago, Resend y las tarifas de envío confirmadas.
            </p>
          ) : null}
          {shippingOptions.confirmed && !selectedZone ? (
            <p className="text-xs leading-relaxed text-ink/55">
              No encontramos este municipio en las zonas configuradas. El pago digital estará
              disponible cuando el equipo confirme su cobertura.
            </p>
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
                  unoptimized
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
          {shippingOptions.confirmed ? (
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
              {shippingOptions.confirmed && selectedZone ? "Total" : "Subtotal de productos"}
            </strong>
            <strong>
              {formatPrice(shippingOptions.confirmed && selectedZone ? estimatedTotal : subtotal)}
            </strong>
          </div>
          {!shippingOptions.confirmed || !selectedZone ? (
            <p className="text-xs leading-relaxed text-ink/55">
              Este no es el total final. El envío se cotiza y comunica antes de pagar.
            </p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
