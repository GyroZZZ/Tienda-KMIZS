"use client";

/**
 * Consentimiento de cookies publicitarias.
 *
 * Es un almacén externo mínimo para que React lo lea con
 * `useSyncExternalStore`: así el aviso y el pixel se sincronizan sin efectos
 * que disparen renders en cascada.
 */

export const CONSENT_KEY = "kmizs-consent-v1";
export const CONSENT_EVENT = "kmizs-consent-change";

export type ConsentValue = "granted" | "denied";

const listeners = new Set<() => void>();
let cached: ConsentValue | null | undefined;

export function getConsent(): ConsentValue | null {
  if (cached !== undefined) return cached;

  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    cached = stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    cached = null;
  }
  return cached;
}

export function setConsent(value: ConsentValue): void {
  cached = value;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Sin almacenamiento el aviso vuelve a aparecer; la compra no se rompe.
  }
  for (const listener of listeners) listener();
}

/** Borra la decisión para que el aviso vuelva a aparecer. */
export function clearConsent(): void {
  cached = null;
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // Sin almacenamiento no hay nada que borrar.
  }
  for (const listener of listeners) listener();
}

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** En el servidor no hay decisión guardada. */
export function getServerConsent(): ConsentValue | null {
  return null;
}
