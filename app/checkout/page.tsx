import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Completa tus datos de envío y elige cómo quieres pagar.",
  robots: { index: false, follow: false },
};

const steps = [
  {
    title: "Datos de envío",
    detail: "Nombre, teléfono, correo y dirección con ciudad y departamento.",
  },
  {
    title: "Método de pago",
    detail: "Mercado Pago en modo de prueba (tarjeta, PSE, Nequi) o pago contraentrega.",
  },
  {
    title: "Confirmación",
    detail: "Recibes el resumen del pedido por correo y coordinamos la entrega.",
  },
];

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="text-4xl tracking-tight sm:text-5xl">Finalizar compra</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
        El checkout entra en funcionamiento en el Sprint 3, junto con el carrito y la pasarela de
        pagos. Así va a funcionar:
      </p>

      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="border border-ink/15 p-6">
            <span className="font-display text-xs tracking-[0.2em] text-accent">0{index + 1}</span>
            <p className="mt-3 font-display text-xl tracking-tight">{step.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{step.detail}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/productos"
          className="inline-flex items-center justify-center bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent"
        >
          Volver al catálogo
        </Link>
        <Link
          href="/contacto"
          className="inline-flex items-center justify-center border border-ink/25 px-6 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition-colors hover:border-ink"
        >
          Comprar por WhatsApp
        </Link>
      </div>
    </div>
  );
}
