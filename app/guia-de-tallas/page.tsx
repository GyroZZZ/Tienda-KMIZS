import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guía de tallas",
  description:
    "Medidas de nuestras camisetas en centímetros para que elijas la talla correcta antes de comprar.",
};

const sizes = [
  { size: "S", chest: 50, length: 69, sleeve: 20 },
  { size: "M", chest: 53, length: 71, sleeve: 21 },
  { size: "L", chest: 56, length: 74, sleeve: 22 },
  { size: "XL", chest: 59, length: 76, sleeve: 23 },
];

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-medium tracking-[0.24em] text-ink/50 uppercase">Ayuda</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Guía de tallas</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
        Todas nuestras camisetas son unisex y de corte recto. Las medidas están tomadas sobre la
        prenda extendida en una superficie plana, en centímetros.
      </p>

      <div className="mt-8 overflow-x-auto border border-ink/15">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <caption className="sr-only">
            Medidas por talla: ancho de pecho, largo total y largo de manga
          </caption>
          <thead>
            <tr className="bg-ink text-bone">
              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase"
              >
                Talla
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase"
              >
                Ancho de pecho
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase"
              >
                Largo total
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-semibold tracking-[0.12em] uppercase"
              >
                Largo de manga
              </th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((row) => (
              <tr key={row.size} className="border-t border-ink/10">
                <th scope="row" className="px-4 py-3 text-left font-display text-lg">
                  {row.size}
                </th>
                <td className="px-4 py-3">{row.chest} cm</td>
                <td className="px-4 py-3">{row.length} cm</td>
                <td className="px-4 py-3">{row.sleeve} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-lg tracking-tight">Cómo medirte</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink/70">
            <li>Toma una camiseta que te quede bien y extiéndela sobre una mesa.</li>
            <li>Mide el ancho del pecho de costura a costura, justo debajo de la sisa.</li>
            <li>Mide el largo total desde el hombro hasta el ruedo inferior.</li>
            <li>Compara tus medidas con la tabla y elige la más cercana.</li>
          </ol>
        </div>

        <div className="border border-ink/15 bg-bone-dim/50 p-6">
          <h2 className="text-lg tracking-tight">¿Estás entre dos tallas?</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            El algodón pesado cede un poco con el uso. Si buscas un ajuste holgado, elige la talla
            mayor. Si tienes dudas,{" "}
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
