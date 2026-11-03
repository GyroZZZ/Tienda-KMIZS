import type { Metadata } from "next";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos para resolver dudas sobre tallas, pedidos o compras por volumen.",
};

const channels = [
  {
    title: "Correo",
    value: site.email,
    detail: "Respondemos en menos de un día hábil.",
    href: `mailto:${site.email}`,
  },
  {
    title: "WhatsApp",
    value: site.whatsappDisplay,
    detail: "Confirma aquí tu pedido, disponibilidad y tarifa de envío.",
    href: `https://wa.me/${site.whatsapp}`,
  },
  {
    title: "Pedidos por volumen",
    value: "Equipos y eventos",
    detail: "Mínimo 6 unidades, con precio especial y una sola fecha de entrega.",
    href: `mailto:${site.email}?subject=Cotizaci%C3%B3n%20por%20volumen`,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-medium tracking-[0.24em] text-ink/50 uppercase">Contacto</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Hablemos</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
        ¿Dudas con la talla, un pedido en curso o una compra para tu equipo? Escríbenos por
        cualquiera de estos canales.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {channels.map((channel) => (
          <li key={channel.title} className="border border-ink/15 p-6">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-ink/50 uppercase">
              {channel.title}
            </p>
            {channel.href ? (
              <a
                href={channel.href}
                className="mt-3 block font-display text-xl tracking-tight underline decoration-accent decoration-2 underline-offset-4"
              >
                {channel.value}
              </a>
            ) : (
              <p className="mt-3 font-display text-xl tracking-tight text-ink/60">
                {channel.value}
              </p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{channel.detail}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 border border-ink/15 bg-bone-dim/50 p-6">
        <h2 className="text-lg tracking-tight">Horario de atención</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          Lunes a viernes, 9:00 a 18:00 (hora Colombia). Los mensajes que lleguen fuera de ese
          horario se responden al día hábil siguiente.
        </p>
      </div>
    </div>
  );
}
