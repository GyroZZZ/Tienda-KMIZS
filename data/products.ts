import type { Product } from "@/lib/products";

/**
 * Catálogo definitivo (Sprint 1).
 * Costos, precios y márgenes: ver docs/catalogo.md y docs/costos-camisetas.csv
 */

const cuidadoBase = [
  "Lavar a máquina con agua fría y del revés.",
  "No usar blanqueador ni secadora a temperatura alta.",
  "Planchar por el revés, evitando la estampación.",
];

export const products: Product[] = [
  {
    slug: "basica-tinta",
    name: "Básica Tinta",
    type: "basica",
    fit: "regular",
    price: 79900,
    summary: "La camiseta de todos los días: algodón pesado y corte recto.",
    description:
      "Nuestra camiseta base en algodón peinado de 240 g. Cuello reforzado con cinta interna, costuras laterales y un corte recto que no se deforma con el lavado. Lleva el logotipo de KMIZS impreso en el pecho.",
    composition: "100% algodón peinado · 240 g/m²",
    care: cuidadoBase,
    image: {
      src: "/products/basica-tinta.webp",
      alt: "Camiseta negra de corte recto con el logotipo de KMIZS en el pecho",
    },
    colors: [
      { name: "Tinta", hex: "#0c0c0e" },
      { name: "Hueso", hex: "#f5f2ea" },
    ],
    sizes: [
      { size: "S", stock: 6 },
      { size: "M", stock: 10 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 4 },
    ],
    featured: true,
  },
  {
    slug: "basica-hueso",
    name: "Básica Hueso",
    type: "basica",
    fit: "regular",
    price: 79900,
    summary: "La misma base de 240 g en el tono hueso que pidió la encuesta.",
    description:
      "La versión clara de nuestra camiseta base. El hueso es un color cálido que no amarillea como el blanco puro y combina con todo. Mismo algodón peinado de 240 g, cuello reforzado y corte recto.",
    composition: "100% algodón peinado · 240 g/m²",
    care: cuidadoBase,
    image: {
      src: "/products/basica-hueso.webp",
      alt: "Camiseta color hueso de corte recto con el logotipo de KMIZS en el pecho",
    },
    colors: [{ name: "Hueso", hex: "#f5f2ea" }],
    sizes: [
      { size: "S", stock: 5 },
      { size: "M", stock: 9 },
      { size: "L", stock: 7 },
      { size: "XL", stock: 3 },
    ],
    featured: true,
  },
  {
    slug: "oversize-tinta",
    name: "Básica Oversize Tinta",
    type: "basica",
    fit: "oversize",
    price: 89900,
    summary: "Corte amplio y hombro caído en algodón de 260 g.",
    description:
      "La básica en versión oversize: cuerpo más ancho, hombro caído y manga corta. Está confeccionada en algodón de 260 g para que caiga con peso y no se pegue al cuerpo. Si dudas entre dos tallas, elige la menor.",
    composition: "100% algodón peinado · 260 g/m²",
    care: cuidadoBase,
    image: {
      src: "/products/oversize-tinta.webp",
      alt: "Camiseta oversize negra con logotipo pequeño en el pecho",
    },
    colors: [{ name: "Tinta", hex: "#0c0c0e" }],
    sizes: [
      { size: "S", stock: 3 },
      { size: "M", stock: 6 },
      { size: "L", stock: 5 },
      { size: "XL", stock: 2 },
    ],
  },
  {
    slug: "oversize-hueso",
    name: "Básica Oversize Hueso",
    type: "basica",
    fit: "oversize",
    price: 89900,
    summary: "Corte amplio en hueso, la combinación que más pidieron.",
    description:
      "Oversize en el tono hueso, el color que eligió el 31% de la encuesta. Cuerpo ancho, hombro caído y algodón de 260 g con caída pesada. Se lleva suelta y combina con jeans oscuros o deportivos.",
    composition: "100% algodón peinado · 260 g/m²",
    care: cuidadoBase,
    image: {
      src: "/products/oversize-hueso.webp",
      alt: "Camiseta oversize color hueso con logotipo pequeño en el pecho",
    },
    colors: [{ name: "Hueso", hex: "#f5f2ea" }],
    sizes: [
      { size: "S", stock: 3 },
      { size: "M", stock: 5 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 2 },
    ],
  },
  {
    slug: "grafica-ruido",
    name: "Gráfica Ruido",
    type: "grafica",
    fit: "regular",
    price: 94900,
    summary: "Diseño propio impreso en serie corta, con tinta de base agua.",
    description:
      "Pieza de nuestra primera cápsula gráfica. La estampación va al frente y al centro, con tinta de base agua que se siente suave al tacto y resiste el lavado. Producción limitada de 60 unidades.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a base de agua",
    care: cuidadoBase,
    image: {
      src: "/products/grafica-ruido.webp",
      alt: "Camiseta color hueso con gráfica geométrica de bloques en tinta y bermellón",
    },
    colors: [{ name: "Hueso", hex: "#f5f2ea" }],
    sizes: [
      { size: "S", stock: 2 },
      { size: "M", stock: 5 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 1 },
    ],
    featured: true,
  },
  {
    slug: "grafica-serie-01",
    name: "Gráfica Serie 01",
    type: "grafica",
    fit: "regular",
    price: 94900,
    summary: "El número de la cápsula, impreso en grande al frente.",
    description:
      "La pieza que abre la serie: un 01 de 21 cm impreso a una tinta, con una barra bermellón en el pecho. Cada referencia de la cápsula lleva su número y no se repite en la siguiente temporada.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a base de agua",
    care: cuidadoBase,
    image: {
      src: "/products/grafica-serie-01.webp",
      alt: "Camiseta color hueso con el número 01 en grande y una barra bermellón",
    },
    colors: [{ name: "Hueso", hex: "#f5f2ea" }],
    sizes: [
      { size: "S", stock: 2 },
      { size: "M", stock: 4 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 1 },
    ],
  },
  {
    slug: "grafica-bogota",
    name: "Gráfica Bogotá",
    type: "grafica",
    fit: "regular",
    price: 99900,
    summary: "La silueta de la ciudad en bermellón sobre algodón negro.",
    description:
      "Un homenaje a la ciudad donde nace KMIZS: silueta urbana impresa en bermellón y hueso sobre camiseta negra. Es la referencia con el estampado más grande del catálogo y la de menor inventario.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a base de agua",
    care: cuidadoBase,
    image: {
      src: "/products/grafica-bogota.webp",
      alt: "Camiseta negra con silueta urbana de Bogotá en hueso y bermellón",
    },
    colors: [{ name: "Tinta", hex: "#0c0c0e" }],
    sizes: [
      { size: "S", stock: 1 },
      { size: "M", stock: 3 },
      { size: "L", stock: 2 },
      { size: "XL", stock: 0 },
    ],
  },
  {
    slug: "grafica-linea",
    name: "Gráfica Línea",
    type: "grafica",
    fit: "regular",
    price: 94900,
    summary: "Minimalismo de líneas finas para quien no grita con la camiseta.",
    description:
      "Cinco líneas finas impresas en el pecho, con una sola en bermellón. Es la referencia más discreta de la cápsula y la que mejor funciona para uso diario o debajo de una chaqueta.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a base de agua",
    care: cuidadoBase,
    image: {
      src: "/products/grafica-linea.webp",
      alt: "Camiseta color hueso con cinco líneas finas, una de ellas en bermellón",
    },
    colors: [{ name: "Hueso", hex: "#f5f2ea" }],
    sizes: [
      { size: "S", stock: 2 },
      { size: "M", stock: 4 },
      { size: "L", stock: 3 },
      { size: "XL", stock: 1 },
    ],
  },
  {
    slug: "personalizada-equipo",
    name: "Personalizada Equipo",
    type: "personalizada",
    fit: "regular",
    price: 89900,
    summary: "Tu equipo con estampado a una tinta. Mínimo 6 unidades.",
    description:
      "Camiseta personalizada con el diseño que nos envíes: una tinta al frente o al reverso. Ideal para equipos, grupos de estudio y uniformes de trabajo. El pedido mínimo es de 6 unidades y la entrega tarda entre 8 y 12 días hábiles.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a una tinta",
    care: cuidadoBase,
    image: {
      src: "/products/personalizada-equipo.webp",
      alt: "Camiseta color hueso con escudo bermellón y el número 01, diseño de muestra personalizable",
    },
    colors: [
      { name: "Tinta", hex: "#0c0c0e" },
      { name: "Hueso", hex: "#f5f2ea" },
      { name: "Bermellón", hex: "#ff3b1f" },
    ],
    sizes: [
      { size: "S", stock: 20 },
      { size: "M", stock: 20 },
      { size: "L", stock: 20 },
      { size: "XL", stock: 20 },
    ],
    minQuantity: 6,
  },
  {
    slug: "personalizada-evento",
    name: "Personalizada Evento",
    type: "personalizada",
    fit: "regular",
    price: 84900,
    summary: "Para eventos y celebraciones desde 12 unidades, con envío gratis.",
    description:
      "La versión por volumen de nuestra camiseta personalizada. Pensada para eventos, graduaciones y celebraciones: una tinta, una fecha de entrega y envío gratis desde la primera compra. Mínimo 12 unidades y entrega en 10 a 15 días hábiles.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a una tinta",
    care: cuidadoBase,
    image: {
      src: "/products/personalizada-evento.webp",
      alt: "Camiseta negra con el año 2026 y confeti geométrico, diseño de muestra para eventos",
    },
    colors: [
      { name: "Tinta", hex: "#0c0c0e" },
      { name: "Hueso", hex: "#f5f2ea" },
    ],
    sizes: [
      { size: "S", stock: 20 },
      { size: "M", stock: 20 },
      { size: "L", stock: 20 },
      { size: "XL", stock: 20 },
    ],
    minQuantity: 12,
  },
];
