"use client";

import { clearConsent } from "@/components/analytics/consent-store";

/** Vuelve a abrir el aviso de cookies desde el pie de página. */
export function ConsentPreferences() {
  return (
    <button
      type="button"
      onClick={clearConsent}
      className="text-left text-xs font-medium text-bone/80 underline underline-offset-4 transition-colors hover:text-accent"
    >
      Preferencias de cookies
    </button>
  );
}
