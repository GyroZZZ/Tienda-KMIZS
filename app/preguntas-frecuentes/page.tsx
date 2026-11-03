import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Envíos, pagos, tallas, cambios y pedidos personalizados en KMIZS.",
};

const faqs = [
  {
    question: "¿Cuánto tarda el envío?",
    answer:
      "El plazo y el costo se confirman con la transportadora para tu ciudad y se muestran antes de cobrar o despachar el pedido.",
  },
  {
    question: "¿Puedo pagar contraentrega?",
    answer:
      "Puedes elegir contraentrega o transferencia y confirmar la disponibilidad por WhatsApp. Mercado Pago en modo de prueba se habilita cuando se configuren sus credenciales y se confirmen las tarifas de envío.",
  },
  {
    question: "¿Cómo elijo mi talla?",
    answer:
      "Revisa la guía de tallas: allí están las medidas exactas de cada referencia. Si estás entre dos tallas, te recomendamos la mayor para un ajuste holgado.",
  },
  {
    question: "¿Puedo cambiar la talla?",
    answer:
      "Sí, dentro de los 5 días siguientes a la entrega. La prenda debe estar sin uso, sin lavar y con la etiqueta puesta. El costo del envío de regreso corre por cuenta del cliente.",
  },
  {
    question: "¿Hacen camisetas personalizadas?",
    answer:
      "Sí. Trabajamos pedidos desde 6 unidades con estampado a una tinta. Nos envías el diseño, lo revisamos contigo y la entrega tarda entre 8 y 12 días hábiles.",
  },
  {
    question: "¿Cómo cuido la camiseta?",
    answer:
      "Lava a máquina con agua fría y del revés. No uses blanqueador ni secadora a temperatura alta y plancha por el revés, evitando la estampación.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-medium tracking-[0.24em] text-ink/50 uppercase">Ayuda</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Preguntas frecuentes</h1>

      <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold">
              {faq.question}
              <span aria-hidden="true" className="text-xl leading-none group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{faq.answer}</p>
          </details>
        ))}
      </div>

      <p className="mt-8 text-sm leading-relaxed text-ink/70">
        ¿No encontraste lo que buscabas?{" "}
        <Link
          href="/contacto"
          className="underline decoration-accent decoration-2 underline-offset-4"
        >
          Escríbenos
        </Link>
        .
      </p>
    </div>
  );
}
