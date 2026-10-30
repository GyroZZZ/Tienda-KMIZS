import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PolicySlug = "envios" | "cambios" | "terminos" | "privacidad";

interface Policy {
  title: string;
  updatedAt: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

const policies: Record<PolicySlug, Policy> = {
  envios: {
    title: "Envíos y entregas",
    updatedAt: "30 de octubre de 2026",
    intro:
      "Despachamos a toda Colombia desde nuestras instalaciones en el país, con transportadoras aliadas y número de guía para seguir el pedido.",
    sections: [
      {
        heading: "Tiempos",
        body: [
          "Los pedidos se despachan entre 24 y 48 horas hábiles después de confirmar el pago.",
          "La entrega tarda entre 2 y 5 días hábiles en ciudades principales y hasta 7 días hábiles en zonas rurales.",
          "Los pedidos personalizados se producen sobre pedido: cuentan con 8 a 12 días hábiles adicionales antes del despacho.",
        ],
      },
      {
        heading: "Costos",
        body: [
          "El costo del envío se calcula según la ciudad y el peso del paquete, y se muestra antes de confirmar la compra.",
          "Los pedidos por volumen pueden acordar una tarifa de envío única con el equipo de KMIZS.",
        ],
      },
      {
        heading: "Seguimiento",
        body: [
          "Cuando el pedido sale, enviamos el número de guía al correo registrado.",
          "Si la transportadora no logra entregar tras dos intentos, el paquete vuelve a bodega y te contactamos para reprogramar.",
        ],
      },
    ],
  },
  cambios: {
    title: "Cambios y devoluciones",
    updatedAt: "30 de octubre de 2026",
    intro:
      "Queremos que la camiseta te quede bien. Si no es así, puedes solicitar un cambio dentro de los plazos que se describen a continuación.",
    sections: [
      {
        heading: "Cambio de talla",
        body: [
          "Tienes 5 días calendario después de la entrega para solicitar un cambio de talla.",
          "La prenda debe estar sin uso, sin lavar, sin olores y con la etiqueta original puesta.",
          "El envío de regreso corre por cuenta del cliente; el nuevo envío lo asume KMIZS una vez por pedido.",
        ],
      },
      {
        heading: "Producto defectuoso",
        body: [
          "Si la prenda llega con un defecto de confección o de estampado, escríbenos dentro de los 5 días siguientes a la entrega con fotos del producto.",
          "En ese caso cubrimos ambos envíos y reemplazamos la prenda o devolvemos el dinero.",
        ],
      },
      {
        heading: "Productos personalizados",
        body: [
          "Los pedidos personalizados no tienen cambio por talla, porque se producen con el diseño aprobado por el cliente.",
          "Sí cubrimos defectos de producción o diferencias frente al diseño aprobado.",
        ],
      },
    ],
  },
  terminos: {
    title: "Términos y condiciones",
    updatedAt: "30 de octubre de 2026",
    intro:
      "Al comprar en KMIZS aceptas las condiciones de uso de la tienda, descritas a continuación.",
    sections: [
      {
        heading: "Productos y precios",
        body: [
          "Los precios se expresan en pesos colombianos (COP) e incluyen IVA cuando aplica.",
          "Las fotografías son de referencia; pueden existir variaciones leves de tono entre lotes de tela.",
          "Nos reservamos el derecho de corregir errores evidentes de precio o de inventario y de cancelar el pedido, devolviendo el dinero pagado.",
        ],
      },
      {
        heading: "Pedidos",
        body: [
          "Un pedido se considera confirmado cuando recibes el correo de confirmación con el número de orden.",
          "El pago contraentrega está sujeto a disponibilidad de la transportadora en la zona.",
        ],
      },
      {
        heading: "Propiedad intelectual",
        body: [
          "Los diseños, el nombre KMIZS y los materiales de la tienda son de propiedad de sus autores.",
          "Al enviar un diseño para personalización, declaras tener los derechos para reproducirlo y autorizas su uso únicamente para producir tu pedido.",
        ],
      },
    ],
  },
  privacidad: {
    title: "Tratamiento de datos personales",
    updatedAt: "30 de octubre de 2026",
    intro:
      "Tratamos tus datos personales conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.",
    sections: [
      {
        heading: "Qué datos recolectamos",
        body: [
          "Datos de contacto y envío: nombre, correo, teléfono, dirección, ciudad y departamento.",
          "Información del pedido: productos, tallas, valores y estado del pago.",
          "Datos de navegación anónimos para medir el uso del sitio.",
        ],
      },
      {
        heading: "Para qué los usamos",
        body: [
          "Procesar y entregar tu pedido, y comunicarnos contigo sobre su estado.",
          "Atender cambios, devoluciones y solicitudes de soporte.",
          "Enviar novedades y promociones solo si diste tu autorización expresa.",
        ],
      },
      {
        heading: "Tus derechos",
        body: [
          "Puedes conocer, actualizar, rectificar y solicitar la eliminación de tus datos escribiendo a nuestro correo de contacto.",
          "También puedes revocar la autorización para el envío de comunicaciones comerciales en cualquier momento.",
        ],
      },
    ],
  },
};

const policySlugs = Object.keys(policies) as PolicySlug[];

export function generateStaticParams() {
  return policySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/politicas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies[slug as PolicySlug];

  if (!policy) {
    return { title: "Página no encontrada" };
  }

  return {
    title: policy.title,
    description: policy.intro,
  };
}

export default async function PolicyPage({ params }: PageProps<"/politicas/[slug]">) {
  const { slug } = await params;
  const policy = policies[slug as PolicySlug];

  if (!policy) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-medium tracking-[0.24em] text-ink/50 uppercase">Legal</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">{policy.title}</h1>
      <p className="mt-2 text-xs text-ink/50">Última actualización: {policy.updatedAt}</p>

      <p className="mt-6 text-base leading-relaxed text-ink/75">{policy.intro}</p>

      <div className="mt-10 space-y-8">
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl tracking-tight">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/70">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
