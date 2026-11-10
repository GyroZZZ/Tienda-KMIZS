/**
 * Contenido de las páginas legales.
 *
 * Redactado con base en la Ley 1480 de 2011 (Estatuto del Consumidor) y la
 * Ley 1581 de 2012 con el Decreto 1377 de 2013 (compilado en el Decreto 1074
 * de 2015). Es un proyecto académico: no sustituye la revisión de un abogado.
 * Ver docs/confianza.md.
 */

export type PolicySlug = "envios" | "cambios" | "terminos" | "privacidad";

export interface PolicySection {
  heading: string;
  body: string[];
}

export interface Policy {
  title: string;
  updatedAt: string;
  intro: string;
  sections: PolicySection[];
}

export const policies: Record<PolicySlug, Policy> = {
  envios: {
    title: "Envíos y entregas",
    updatedAt: "10 de noviembre de 2026",
    intro:
      "Despachamos desde Colombia. El envío es gratis desde 2 prendas y en pedidos personalizados; para una sola prenda, la tarifa y el plazo dependen del municipio y te los confirmamos antes de cobrar o despachar.",
    sections: [
      {
        heading: "Cobertura",
        body: [
          "Enviamos a municipios de Colombia con cobertura de la transportadora aliada. Si tu destino no tiene cobertura confirmada, te lo informamos antes de cualquier pago y no se genera el cobro.",
          "Las direcciones en zonas rurales o de difícil acceso pueden tener un recargo o un plazo mayor; en ese caso te consultamos antes de despachar.",
        ],
      },
      {
        heading: "Tarifas",
        body: [
          "El envío es gratis cuando el pedido suma 2 o más prendas, sin importar si son del mismo modelo o de modelos distintos, y en todos los pedidos personalizados, de eventos y de equipos.",
          "Para un pedido de una sola prenda, la tarifa se calcula por zona y se muestra en el checkout antes de pagar cuando las condiciones con la transportadora están confirmadas.",
          "Mientras esas condiciones estén pendientes, el pedido se registra y la tarifa de una sola prenda se cotiza por WhatsApp antes de cualquier pago. No cobramos un valor de envío sin confirmarlo contigo.",
        ],
      },
      {
        heading: "Plazos",
        body: [
          "Despachamos entre 1 y 2 días hábiles después de confirmar el pago, o después de aprobar el diseño en los pedidos personalizados.",
          "El tiempo de transporte se suma al despacho y depende de la zona. El plazo estimado se informa antes de pagar.",
          "Los pedidos personalizados tienen una producción de 8 a 12 días hábiles, además del tiempo de transporte.",
        ],
      },
      {
        heading: "Envío gratis",
        body: [
          "El envío es gratis cuando el pedido suma 2 o más prendas en total, sin importar si son del mismo modelo o de modelos distintos, y en todos los pedidos personalizados, de eventos y de equipos.",
          "La regla se aplica automáticamente en el carrito y en el checkout: el pedido muestra “Gratis” antes de pagar y el total no incluye un cobro de envío. No requiere solicitud ni validación por WhatsApp.",
          "Un pedido de una sola prenda paga la tarifa de su zona cuando las condiciones con la transportadora están confirmadas.",
        ],
      },
      {
        heading: "Seguimiento e intentos de entrega",
        body: [
          "Cuando el pedido sale, enviamos el número de guía al correo registrado.",
          "La transportadora realiza hasta dos intentos de entrega. Si no logra entregar, el paquete vuelve a bodega y te contactamos para reprogramar.",
          "Si la devolución ocurre por una dirección errada o incompleta, el nuevo envío corre por cuenta del cliente.",
        ],
      },
      {
        heading: "Pedidos personalizados",
        body: [
          "Se producen sobre pedido y con el diseño aprobado. Una vez que el pedido entra a producción no se puede cambiar la dirección ni el diseño.",
          "Si necesitas modificar algo, escríbenos de inmediato: hacemos el cambio si la producción aún no ha comenzado.",
        ],
      },
    ],
  },

  cambios: {
    title: "Cambios y devoluciones",
    updatedAt: "9 de noviembre de 2026",
    intro:
      "Queremos que la camiseta te quede bien. Si no es así, o si llega con un problema, escríbenos dentro de los plazos de esta política.",
    sections: [
      {
        heading: "Cambio de talla",
        body: [
          "Tienes 5 días hábiles contados desde la entrega para solicitar un cambio de talla.",
          "La prenda debe estar sin uso, sin lavar, sin olores y con la etiqueta original puesta. Revisamos su estado antes de aceptar el cambio.",
          "El envío de regreso corre por cuenta del cliente y el reenvío lo asume KMIZS una vez por pedido. El cambio está sujeto a disponibilidad de la talla solicitada.",
        ],
      },
      {
        heading: "Garantía legal",
        body: [
          "Si la prenda llega con un defecto de confección o de estampado, o no corresponde a lo ofrecido, tienes derecho a la garantía legal de los artículos 7 a 11 de la Ley 1480 de 2011: reparación, reposición o devolución del dinero.",
          "Escríbenos dentro de los 5 días hábiles siguientes a la entrega con fotos del producto y el número de pedido. En estos casos cubrimos ambos envíos.",
          "La garantía legal de los productos nuevos es de un año, salvo que la ley disponga un término distinto.",
        ],
      },
      {
        heading: "Derecho de retracto",
        body: [
          "En las compras a distancia tienes derecho de retracto dentro de los 5 días hábiles siguientes a la entrega, conforme al artículo 47 de la Ley 1480 de 2011.",
          "Para ejercerlo, escríbenos a hola@kmizs.co o por WhatsApp con tu número de pedido y los datos de contacto. Te enviamos las instrucciones para devolver la prenda.",
          "La prenda debe estar en las mismas condiciones en que la recibiste: sin uso, sin lavar y con la etiqueta. El costo del envío de regreso corre por cuenta del cliente, salvo que la ley disponga lo contrario.",
          "Una vez recibida y verificada la prenda, devolvemos el dinero dentro de los 30 días calendario siguientes a la solicitud, por el mismo medio de pago utilizado.",
        ],
      },
      {
        heading: "Productos personalizados",
        body: [
          "Los pedidos confeccionados con el diseño o las especificaciones del cliente no tienen derecho de retracto ni cambio por talla, porque no pueden revenderse. Esta excepción está prevista en el parágrafo del artículo 47 de la Ley 1480 de 2011.",
          "Sí cubrimos los defectos de producción y las diferencias frente al diseño aprobado mediante la garantía legal.",
        ],
      },
      {
        heading: "Reembolsos",
        body: [
          "Los reembolsos se hacen por el mismo medio de pago de la compra. Los tiempos de abono dependen del banco o de la pasarela y pueden tardar algunos días hábiles adicionales.",
          "No se reembolsan los costos de envío, salvo que la devolución se deba a un error nuestro o a un producto defectuoso.",
        ],
      },
      {
        heading: "Cómo solicitar un cambio o una devolución",
        body: [
          "Escríbenos a hola@kmizs.co o al WhatsApp +57 310 389 8707 con: número de pedido, nombre, motivo y, si aplica, fotos del producto.",
          "Respondemos en un plazo máximo de 2 días hábiles con las instrucciones y la dirección de devolución.",
        ],
      },
    ],
  },

  terminos: {
    title: "Términos y condiciones",
    updatedAt: "9 de noviembre de 2026",
    intro:
      "Estas condiciones regulan el uso de la tienda y la compra de productos. Al confirmar un pedido las aceptas.",
    sections: [
      {
        heading: "Identificación del vendedor",
        body: [
          "KMIZS es un proyecto académico de comercio electrónico desarrollado en Colombia. No constituye una empresa constituida ni una sociedad comercial.",
          "Canal de atención: hola@kmizs.co y WhatsApp +57 310 389 8707. Domicilio: Colombia.",
        ],
      },
      {
        heading: "Productos y precios",
        body: [
          "Los precios se expresan en pesos colombianos (COP) e incluyen IVA cuando aplica.",
          "Las fotografías son de referencia y pueden existir variaciones leves de tono entre lotes de tela. Las medidas son referencia del proveedor y se validan con la primera muestra física.",
          "Podemos corregir errores evidentes de precio o de inventario y cancelar el pedido, devolviendo el dinero pagado.",
        ],
      },
      {
        heading: "Pedidos y aceptación",
        body: [
          "Al enviar el formulario registramos la solicitud y el equipo la recibe por correo. El pedido queda confirmado después de validar disponibilidad, envío y forma de pago por WhatsApp, o con el estado aprobado de la pasarela.",
          "El registro del pedido no equivale por sí solo a la aceptación de la compra: si no hay disponibilidad o no se confirma el pago, el pedido se cancela y se devuelve lo pagado.",
          "Podemos rechazar pedidos por sospecha de fraude, error evidente de precio o falta de cobertura de envío.",
        ],
      },
      {
        heading: "Medios de pago",
        body: [
          "Aceptamos contraentrega, transferencia o billetera (Nequi, DaviPlata y Bancolombia) y pago digital con Mercado Pago.",
          "En esta versión académica Mercado Pago funciona en modo de prueba (sandbox): no se procesan cobros reales.",
          "El pago contraentrega está sujeto a la cobertura de la transportadora en tu zona. No almacenamos números completos de tarjeta ni claves.",
        ],
      },
      {
        heading: "Envíos",
        body: [
          "Las condiciones de cobertura, tarifas, plazos y seguimiento están en la política de envíos y entregas, que forma parte de estos términos.",
        ],
      },
      {
        heading: "Derecho de retracto",
        body: [
          "Tienes derecho de retracto en las compras a distancia dentro de los 5 días hábiles siguientes a la entrega (artículo 47 de la Ley 1480 de 2011).",
          "El procedimiento, las condiciones de la prenda y los plazos de reembolso están en la política de cambios y devoluciones.",
        ],
      },
      {
        heading: "Garantía legal",
        body: [
          "Respondemos por la calidad, idoneidad y seguridad de los productos conforme a los artículos 7 a 11 de la Ley 1480 de 2011.",
          "Si el producto presenta un defecto o no corresponde a lo ofrecido, puedes solicitar reparación, reposición o devolución del dinero.",
        ],
      },
      {
        heading: "Reversión del pago",
        body: [
          "Si detectas un cobro no autorizado o un fraude en tu medio de pago, puedes solicitar la reversión del pago ante el emisor del instrumento, conforme al artículo 51 de la Ley 1480 de 2011.",
          "KMIZS colabora con la entidad emisora y con las autoridades para aclarar el caso.",
        ],
      },
      {
        heading: "Propiedad intelectual",
        body: [
          "Los diseños, el nombre KMIZS y los materiales de la tienda son de propiedad de sus autores.",
          "Al enviar un diseño para personalización declaras tener los derechos para reproducirlo y autorizas su uso únicamente para producir tu pedido. Podemos rechazar diseños con contenido ilegal o de terceros sin autorización.",
        ],
      },
      {
        heading: "Responsabilidad",
        body: [
          "No respondemos por interrupciones del sitio, de la pasarela de pagos o de la transportadora que estén fuera de nuestro control, sin perjuicio de las obligaciones que la ley nos impone.",
        ],
      },
      {
        heading: "Ley aplicable y autoridad",
        body: [
          "Estos términos se rigen por las leyes de la República de Colombia.",
          "Para asuntos de protección al consumidor puedes acudir a la Superintendencia de Industria y Comercio (SIC), www.sic.gov.co.",
        ],
      },
      {
        heading: "Vigencia y cambios",
        body: [
          "Estos términos rigen desde el 9 de noviembre de 2026. Cualquier cambio se publica en esta página con su fecha de actualización.",
          "Los pedidos se rigen por la versión vigente al momento de la compra.",
        ],
      },
    ],
  },

  privacidad: {
    title: "Tratamiento de datos personales",
    updatedAt: "9 de noviembre de 2026",
    intro:
      "KMIZS trata tus datos personales conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 y el Decreto 1074 de 2015. Aquí explicamos qué datos usamos, para qué y cómo ejercer tus derechos.",
    sections: [
      {
        heading: "Responsable del tratamiento",
        body: [
          "KMIZS, proyecto académico de comercio electrónico con domicilio en Colombia.",
          "Canal de atención y ejercicio de derechos: hola@kmizs.co y WhatsApp +57 310 389 8707.",
        ],
      },
      {
        heading: "Qué datos recolectamos",
        body: [
          "Datos de identificación y contacto: nombre, correo electrónico y teléfono.",
          "Datos de envío: dirección, ciudad y departamento.",
          "Información del pedido: productos, tallas, colores, cantidades, valores y estado del pago.",
          "Datos de navegación: páginas vistas, dispositivo y métricas agregadas del sitio.",
          "Comunicaciones: los mensajes que nos envías por correo o WhatsApp para soporte.",
        ],
      },
      {
        heading: "Para qué los usamos",
        body: [
          "Procesar, confirmar y entregar tu pedido.",
          "Confirmar disponibilidad, tarifa y plazo de envío antes de cobrar o despachar.",
          "Atender cambios, devoluciones, garantías y solicitudes de soporte.",
          "Prevenir fraudes y verificar la autenticidad de los pedidos.",
          "Medir el uso del sitio de forma agregada para mejorarlo.",
          "Enviar novedades y promociones solo si diste tu autorización previa, expresa e informada.",
        ],
      },
      {
        heading: "Autorización y aviso de privacidad",
        body: [
          "Antes de enviar el pedido te mostramos un aviso de privacidad y te pedimos autorizar el tratamiento para las finalidades descritas. La casilla del checkout no viene marcada por defecto.",
          "Puedes revocar la autorización en cualquier momento escribiendo a nuestro correo. La revocatoria no tiene efectos retroactivos sobre tratamientos ya realizados.",
        ],
      },
      {
        heading: "Tus derechos",
        body: [
          "Conocer, actualizar y rectificar tus datos personales.",
          "Solicitar prueba de la autorización otorgada.",
          "Ser informado sobre el uso que se ha dado a tus datos.",
          "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).",
          "Revocar la autorización y solicitar la supresión de tus datos, cuando no exista un deber legal de conservarlos.",
          "Acceder de forma gratuita a tus datos.",
        ],
      },
      {
        heading: "Cómo ejercerlos",
        body: [
          "Escríbenos a hola@kmizs.co o por WhatsApp con tu nombre, el número de pedido si aplica y la solicitud concreta.",
          "Las consultas se responden en un máximo de 10 días hábiles, prorrogables por 5 más. Los reclamos se responden en un máximo de 15 días hábiles, prorrogables por 8 más, conforme a la Ley 1581 de 2012.",
        ],
      },
      {
        heading: "Con quién compartimos los datos",
        body: [
          "Con Resend, para enviar el registro del pedido al equipo.",
          "Con Mercado Pago, cuando eliges pagar por su pasarela.",
          "Con la transportadora, para entregar el pedido.",
          "Con Vercel, que aloja el sitio y procesa métricas agregadas.",
          "Con WhatsApp, únicamente si decides continuar la conversación por ese canal.",
          "No vendemos ni alquilamos datos personales. No almacenamos números completos de tarjeta.",
        ],
      },
      {
        heading: "Transferencias y transmisiones",
        body: [
          "Algunos proveedores tecnológicos están ubicados fuera de Colombia. En esos casos la transmisión se limita a las finalidades descritas y se apoya en las condiciones contractuales del proveedor.",
        ],
      },
      {
        heading: "Seguridad",
        body: [
          "Aplicamos medidas técnicas y administrativas razonables: acceso limitado a la información, conexiones cifradas y revisión de los servicios que usamos.",
          "Ningún sistema es completamente seguro en internet; si detectas un incidente, escríbenos de inmediato.",
        ],
      },
      {
        heading: "Cookies y analítica",
        body: [
          "Usamos cookies necesarias para el carrito y la sesión. Si se activa la analítica, se usan métricas agregadas para entender el uso del sitio.",
          "Puedes bloquear o eliminar cookies desde tu navegador; algunas funciones de la tienda pueden dejar de funcionar.",
        ],
      },
      {
        heading: "Menores de edad",
        body: [
          "No recolectamos datos de menores de edad sin la autorización de sus representantes legales.",
        ],
      },
      {
        heading: "Vigencia",
        body: [
          "Esta política rige desde el 9 de noviembre de 2026. Cualquier cambio se publica en esta página con su fecha de actualización.",
        ],
      },
      {
        heading: "Autoridad de control",
        body: [
          "Puedes presentar quejas o consultas ante la Superintendencia de Industria y Comercio (SIC): www.sic.gov.co, Bogotá D.C., Colombia.",
        ],
      },
    ],
  },
};

export const policySlugs = Object.keys(policies) as PolicySlug[];

export function getPolicy(slug: string): Policy | undefined {
  return policies[slug as PolicySlug];
}
