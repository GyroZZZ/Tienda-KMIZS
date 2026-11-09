import type { Metadata } from "next";
import Link from "next/link";

import { sizeGuides } from "@/lib/size-guide";

export const metadata: Metadata = {
  title: "Guía de tallas",
  description:
    "Medidas en centímetros de nuestras camisetas de corte recto y oversize para que elijas la talla correcta antes de comprar.",
};

const guides = [sizeGuides.regular, sizeGuides.oversize];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-medium tracking-[0.24em] text-ink/50 uppercase">Ayuda</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Guía de tallas</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
        Todas nuestras camisetas son unisex y vienen en dos cortes. Las medidas están tomadas
        sobre la prenda extendida en una superficie plana, en centímetros, y no sobre el cuerpo.
      </p>

      <div className="mt-10 space-y-12">
        {guides.map((guide) => (
          <section key={guide.fit} aria-labelledby={`guia-${guide.fit}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id={`guia-${guide.fit}`} className="text-2xl tracking-tight">
                {guide.label}
              </h2>
              <p className="text-xs font-medium tracking-[0.14em] text-ink/45 uppercase">
                Tallas S – XL
              </p>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/65">
              {guide.description}
            </p>

            <div className="mt-4 border border-ink/15">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <caption className="sr-only">
                  {guide.label}: ancho de pecho, largo total y largo de manga por talla
                </caption>
                <thead>
                  <tr className="bg-ink text-bone">
                    <th scope="col" className="px-2 py-3 text-left font-semibold uppercase sm:px-4">
                      Talla
                    </th>
                    <th scope="col" className="px-2 py-3 text-left font-semibold uppercase sm:px-4">
                      Pecho
                    </th>
                    <th scope="col" className="px-2 py-3 text-left font-semibold uppercase sm:px-4">
                      Largo
                    </th>
                    <th scope="col" className="px-2 py-3 text-left font-semibold uppercase sm:px-4">
                      Manga
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {guide.measurements.map((row) => (
                    <tr key={row.size} className="border-t border-ink/10">
                      <th scope="row" className="px-2 py-3 text-left font-display text-lg sm:px-4">
                        {row.size}
                      </th>
                      <td className="px-2 py-3 tabular-nums sm:px-4">{row.chest} cm</td>
                      <td className="px-2 py-3 tabular-nums sm:px-4">{row.length} cm</td>
                      <td className="px-2 py-3 tabular-nums sm:px-4">{row.sleeve} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink/50">
        Medidas de referencia del proveedor. Las validamos con la primera muestra física y
        actualizamos esta tabla si hay diferencias.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-lg tracking-tight">Cómo medirte</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/70">
            <li>Toma una camiseta que te quede bien y extiéndela sobre una mesa.</li>
            <li>Mide el ancho del pecho de costura a costura, justo debajo de la sisa.</li>
            <li>Mide el largo total desde el hombro hasta el ruedo inferior.</li>
            <li>Compara tus medidas con la tabla de tu corte y elige la más cercana.</li>
          </ol>
        </div>

        <div className="border border-ink/15 bg-bone-dim/50 p-6">
          <h2 className="text-lg tracking-tight">¿Estás entre dos tallas?</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            En corte recto, el algodón pesado cede un poco con el uso: si buscas un ajuste
            holgado, elige la talla mayor. En oversize la prenda ya cae suelta, así que conviene
            elegir la menor. Si tienes dudas,{" "}
            <Link
              href="/contacto"
              className="underline decoration-accent decoration-2 underline-offset-4"
            >
              escríbenos
            </Link>{" "}
            con tu estatura y peso y te ayudamos a elegir.
          </p>
        </div>
      </div>
    </div>
  );
}
