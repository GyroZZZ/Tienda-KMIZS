import Link from "next/link";

import { site } from "@/lib/site";

interface TrustSignalsProps {
  /** Ajusta el texto según el momento de la compra. */
  context: "product" | "checkout";
}

interface Signal {
  title: string;
  detail: string;
}

const signalsByContext: Record<TrustSignalsProps["context"], Signal[]> = {
  product: [
    {
      title: "Contraentrega",
      detail: "Disponible según la cobertura de la transportadora en tu municipio.",
    },
    {
      title: "Envío sin sorpresas",
      detail: "El costo y el plazo se confirman antes de pagar o despachar.",
    },
    {
      title: "Cambios y retracto",
      detail: "5 días hábiles para cambio de talla o retracto, con garantía legal.",
    },
    {
      title: "Soporte directo",
      detail: "Escríbenos por WhatsApp o correo; respondemos de lunes a viernes.",
    },
  ],
  checkout: [
    {
      title: "Contraentrega",
      detail: "Confirmamos cobertura, tarifa y plazo por WhatsApp antes de cobrar.",
    },
    {
      title: "Envío transparente",
      detail: "No cobramos el envío sin confirmarlo contigo.",
    },
    {
      title: "Datos protegidos",
      detail: "Tratamos tus datos conforme a la Ley 1581 de 2012.",
    },
    {
      title: "Cambios y retracto",
      detail: "5 días hábiles para retracto y garantía legal de un año.",
    },
  ],
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}

export function TrustSignals({ context }: TrustSignalsProps) {
  const signals = signalsByContext[context];

  return (
    <section
      aria-labelledby={`confianza-${context}`}
      className="mt-8 border border-ink/15 bg-bone-dim/40 p-5 sm:p-6"
    >
      <h2
        id={`confianza-${context}`}
        className="text-[11px] font-semibold tracking-[0.18em] text-ink/60 uppercase"
      >
        Compra con confianza
      </h2>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {signals.map((signal) => (
          <li key={signal.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent/10 text-accent-dark"
            >
              <CheckIcon />
            </span>
            <span className="text-sm leading-relaxed">
              <strong className="block font-semibold text-ink">{signal.title}</strong>
              <span className="text-ink/65">{signal.detail}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-ink/10 pt-3 text-xs leading-relaxed text-ink/55">
        Consulta{" "}
        <Link
          href="/politicas/envios"
          className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
        >
          envíos
        </Link>
        ,{" "}
        <Link
          href="/politicas/cambios"
          className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
        >
          cambios y devoluciones
        </Link>{" "}
        y{" "}
        <Link
          href="/politicas/privacidad"
          className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
        >
          tratamiento de datos
        </Link>
        . Dudas: {site.email} o {site.whatsappDisplay}.
      </p>
    </section>
  );
}
