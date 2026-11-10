import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Envíos, pagos, tallas, cambios, retracto, pedidos personalizados y tratamiento de datos en KMIZS.",
};

const faqGroups = [
  {
    title: "Pedidos",
    items: [
      {
        question: "¿Cómo hago un pedido?",
        answer:
          "Elige la camiseta, la talla y el color en el catálogo, agrégala al carrito y completa el checkout con tus datos de entrega. Al final verás el número de pedido y podrás confirmarlo por WhatsApp.",
      },
      {
        question: "¿Cómo sé que mi pedido quedó registrado?",
        answer:
          "Al enviar el formulario recibes un número de pedido (KM-…) y te llevamos a una página con el resumen. El equipo también recibe el detalle por correo. Si no ves el número, escríbenos por WhatsApp antes de volver a pagar.",
      },
      {
        question: "¿Puedo pedir por WhatsApp?",
        answer:
          "Sí, pero te pediremos registrar el pedido en la tienda para tener el número, el detalle y el valor. Así evitamos errores de talla, color o dirección.",
      },
    ],
  },
  {
    title: "Envíos",
    items: [
      {
        question: "¿Cuánto tarda el envío?",
        answer:
          "Despachamos entre 1 y 2 días hábiles después de confirmar el pago. El tiempo de transporte depende de tu municipio y se informa antes de pagar. Los pedidos personalizados tardan de 8 a 12 días hábiles de producción, más el transporte.",
      },
      {
        question: "¿Cuánto cuesta el envío?",
        answer:
          "El envío es gratis desde 2 prendas, sin importar si son del mismo modelo o de modelos distintos, y en todos los pedidos personalizados, de eventos y de equipos. Si compras una sola prenda, la tarifa depende del municipio y se muestra en el checkout antes de pagar cuando está confirmada.",
      },
      {
        question: "¿Cuándo me sale gratis el envío?",
        answer:
          "Siempre que el pedido sume 2 o más prendas, aunque sean de modelos distintos, y en cualquier pedido personalizado, de evento o de equipo. La regla se aplica automáticamente en el carrito y en el checkout: no necesitas escribirnos ni pedir el beneficio.",
      },
      {
        question: "¿Hacen envíos a todo el país?",
        answer:
          "Enviamos a los municipios con cobertura de la transportadora aliada. Si tu destino no tiene cobertura confirmada, te lo decimos antes de pagar y no se genera el cobro. Las zonas rurales pueden tener recargo o más plazo.",
      },
    ],
  },
  {
    title: "Tallas y cambios",
    items: [
      {
        question: "¿Cómo elijo mi talla?",
        answer:
          "Revisa la guía de tallas: tiene las medidas en centímetros del corte recto y del oversize. Si dudas entre dos tallas, en corte recto elige la mayor si buscas un ajuste holgado; en oversize elige la menor, porque la prenda ya cae suelta.",
      },
      {
        question: "¿Puedo cambiar la talla?",
        answer:
          "Sí, dentro de los 5 días hábiles siguientes a la entrega. La prenda debe estar sin uso, sin lavar y con la etiqueta puesta. El envío de regreso corre por tu cuenta y KMIZS asume el reenvío una vez por pedido, sujeto a disponibilidad.",
      },
      {
        question: "¿Qué pasa si la camiseta llega defectuosa?",
        answer:
          "Escríbenos dentro de los 5 días hábiles siguientes a la entrega con fotos y el número de pedido. Aplicamos la garantía legal: reparamos, reponemos o devolvemos el dinero, y cubrimos ambos envíos.",
      },
      {
        question: "¿Puedo devolverla y pedir mi dinero?",
        answer:
          "Sí. En compras a distancia tienes derecho de retracto dentro de los 5 días hábiles siguientes a la entrega (Ley 1480 de 2011). La prenda debe estar sin uso y con la etiqueta; el reembolso se hace dentro de los 30 días calendario siguientes a la solicitud.",
      },
      {
        question: "¿Los pedidos personalizados tienen cambio o retracto?",
        answer:
          "No tienen retracto ni cambio por talla, porque se confeccionan con tu diseño y no pueden revenderse. Sí cubrimos defectos de producción o diferencias frente al diseño aprobado.",
      },
    ],
  },
  {
    title: "Pagos",
    items: [
      {
        question: "¿Puedo pagar contraentrega?",
        answer:
          "Sí, siempre que la transportadora tenga cobertura en tu municipio. También puedes pagar por transferencia o billetera (Nequi, DaviPlata y Bancolombia).",
      },
      {
        question: "¿Es seguro pagar en línea?",
        answer:
          "No almacenamos números completos de tarjeta ni claves: el pago lo procesa Mercado Pago. En esta versión académica la pasarela funciona en modo de prueba (sandbox), así que no se realizan cobros reales.",
      },
    ],
  },
  {
    title: "Personalizados y datos",
    items: [
      {
        question: "¿Hacen camisetas personalizadas?",
        answer:
          "Sí, desde 6 unidades y con estampado a una tinta. Nos envías el diseño, lo revisamos contigo y la entrega tarda entre 8 y 12 días hábiles.",
      },
      {
        question: "¿Puedo pedir una talla XXL?",
        answer:
          "Sí, bajo pedido. Escríbenos por WhatsApp antes de comprar y confirmamos disponibilidad y plazo; el catálogo en línea maneja tallas S a XL.",
      },
      {
        question: "¿Qué hacen con mis datos?",
        answer:
          "Los usamos para gestionar el pedido, la entrega y el soporte. Puedes conocer, actualizar, rectificar o pedir la eliminación de tus datos escribiendo a nuestro correo. El detalle está en la política de tratamiento de datos.",
      },
      {
        question: "¿Cómo cuido la camiseta?",
        answer:
          "Lava a máquina con agua fría y del revés. No uses blanqueador ni secadora a temperatura alta y plancha por el revés, evitando la estampación.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-medium tracking-[0.24em] text-ink/50 uppercase">Ayuda</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Preguntas frecuentes</h1>
      <p className="mt-4 text-base leading-relaxed text-ink/70">
        Envíos, pagos, tallas, cambios y pedidos personalizados. Si no encuentras tu respuesta,
        escríbenos: contestamos de lunes a viernes, 9:00 a 18:00.
      </p>

      <div className="mt-10 space-y-10">
        {faqGroups.map((group) => (
          <section key={group.title} aria-labelledby={`faq-${group.title}`}>
            <h2
              id={`faq-${group.title}`}
              className="text-[11px] font-semibold tracking-[0.18em] text-ink/50 uppercase"
            >
              {group.title}
            </h2>
            <div className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
              {group.items.map((faq) => (
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
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm leading-relaxed text-ink/70">
        ¿No encontraste lo que buscabas?{" "}
        <Link
          href="/contacto"
          className="underline decoration-accent decoration-2 underline-offset-4"
        >
          Escríbenos
        </Link>{" "}
        o revisa las{" "}
        <Link
          href="/politicas/cambios"
          className="underline decoration-accent decoration-2 underline-offset-4"
        >
          políticas de cambios y devoluciones
        </Link>
        .
      </p>
    </div>
  );
}
