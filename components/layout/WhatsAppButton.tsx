import { site } from "@/lib/site";

/**
 * Acceso rápido a WhatsApp desde cualquier página.
 *
 * El mensaje llega prellenado para que la conversación empiece con contexto y
 * podamos medir de dónde vienen los clics con la campaña `sitio`.
 */
export function WhatsAppButton() {
  const message = encodeURIComponent(
    "Hola, vengo de la tienda KMIZS y quiero hacer una pregunta sobre las camisetas.",
  );

  return (
    <a
      href={`https://wa.me/${site.whatsapp}?text=${message}`}
      target="_blank"
      rel="noreferrer"
      aria-label={`Escribir a ${site.name} por WhatsApp`}
      className="fixed right-4 bottom-4 z-40 flex min-h-12 items-center gap-2 rounded-full bg-ink px-4 py-3 text-xs font-semibold tracking-[0.12em] text-bone uppercase shadow-lg transition-colors hover:bg-accent sm:right-6 sm:bottom-6"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5"
        fill="currentColor"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.4 1.3-1.94 1.35-.54.06-1.03.08-1.78-.18-.75-.26-2.54-1.01-4.31-2.87-1.76-1.85-2.4-3.24-2.68-3.99-.28-.75-.03-1.15.22-1.51.22-.32.5-.62.75-.93.25-.31.33-.53.5-.88.17-.35.08-.66-.04-.92-.12-.26-1.08-2.6-1.48-3.56-.39-.94-.79-.81-1.08-.82h-.92c-.32 0-.83.12-1.27.6-.44.48-1.67 1.63-1.67 3.98s1.71 4.62 1.95 4.94c.24.32 3.36 5.13 8.14 7.19 1.14.49 2.03.78 2.72.99 1.14.36 2.18.31 3-.19.91-.54 1.45-1.33 1.62-1.86.17-.53.17-.98.12-1.08-.05-.1-.19-.16-.4-.27Z" />
      </svg>
      WhatsApp
    </a>
  );
}
