"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  getConsent,
  getServerConsent,
  setConsent,
  subscribeConsent,
  type ConsentValue,
} from "@/components/analytics/consent-store";

/**
 * Aviso de cookies publicitarias.
 *
 * El pixel de Meta no se carga hasta que la persona acepta. La decisión se
 * guarda en este dispositivo y se puede cambiar desde el pie de página.
 */
export function ConsentBanner() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);

  if (consent !== null) return null;

  function decide(value: ConsentValue) {
    setConsent(value);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
      className="fixed inset-x-3 bottom-3 z-50 border border-ink/20 bg-bone p-4 shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md"
    >
      <h2 id="consent-title" className="font-display text-lg tracking-tight">
        ¿Nos ayudas a medir?
      </h2>
      <p id="consent-description" className="mt-2 text-xs leading-relaxed text-ink/70">
        Usamos analítica propia para saber qué camisetas se ven y para medir campañas en Meta. No
        compartimos tus datos de compra. Puedes seguir comprando sin aceptar.{" "}
        <Link href="/politicas/privacidad" className="underline decoration-accent underline-offset-4">
          Política de privacidad
        </Link>
        .
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="min-h-10 flex-1 bg-ink px-4 text-xs font-semibold tracking-[0.12em] text-bone uppercase hover:bg-accent"
        >
          Aceptar
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="min-h-10 flex-1 border border-ink/25 px-4 text-xs font-semibold tracking-[0.12em] uppercase hover:border-ink"
        >
          Solo lo necesario
        </button>
      </div>
    </div>
  );
}
