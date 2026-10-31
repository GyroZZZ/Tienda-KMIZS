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
    price: 79900,
    summary: "La camiseta de todos los días: algodón pesado y corte recto.",
    description:
      "Nuestra camiseta base en algodón peinado de 240 g. Cuello reforzado con cinta interna, costuras laterales y un corte recto que no se deforma con el lavado. Lleva el logotipo de KMIZS impreso en el pecho.",
    composition: "100% algodón peinado · 240 g/m²",
    care: cuidadoBase,
    image: {
      src: "/products/basica-tinta.svg",
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
    price: 79900,
    summary: "La misma base de 240 g en el tono hueso que pidió la encuesta.",
    description:
      "La versión clara de nuestra camiseta base. El hueso es un color cálido que no amarillea como el blanco puro y combina con todo. Mismo algodón peinado de 240 g, cuello reforzado y corte recto.",
    composition: "100% algodón peinado · 240 g/m²",
    care: cuidadoBase,
    image: {
      src: "/products/basica-hueso.svg",
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
    price: 89900,
    summary: "Corte amplio y hombro caído en algodón de 260 g.",
    description:
      "La básica en versión oversize: cuerpo más ancho, hombro caído y manga corta. Está confeccionada en algodón de 260 g para que caiga con peso y no se pegue al cuerpo. Si dudas entre dos tallas, elige la menor.",
    composition: "100% algodón peinado · 260 g/m²",
    care: cuidadoBase,
    image: {
      src: "/products/oversize-tinta.svg",
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
    price: 89900,
    summary: "Corte amplio en hueso, la combinación que más pidieron.",
    description:
      "Oversize en el tono hueso, el color que eligió el 31% de la encuesta. Cuerpo ancho, hombro caído y algodón de 260 g con caída pesada. Se lleva suelta y combina con jeans oscuros o deportivos.",
    composition: "100% algodón peinado · 260 g/m²",
    care: cuidadoBase,
    image: {
      src: "/products/oversize-hueso.svg",
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
    slug: "grafica-dragon-ball",
    name: "Gráfica Dragon Ball",
    type: "grafica",
    price: 99900,
    summary: "La esfera de cuatro estrellas, impresa en grande al frente.",
    description:
      "La pieza más grande de la cápsula anime: una esfera de cuatro estrellas de 24 cm impresa al frente sobre camiseta negra. Estampado de fan art no oficial, en tinta de base agua y producción limitada de 40 unidades.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a base de agua",
    care: cuidadoBase,
    image: {
      src: "/products/grafica-dragon-ball.svg",
      alt: "Camiseta negra con una esfera de cuatro estrellas naranja impresa en el pecho",
    },
    colors: [{ name: "Tinta", hex: "#0c0c0e" }],
    sizes: [
      { size: "S", stock: 1 },
      { size: "M", stock: 3 },
      { size: "L", stock: 2 },
      { size: "XL", stock: 1 },
    ],
  },
  {
    slug: "grafica-naruto",
    name: "Gráfica Naruto",
    type: "grafica",
    price: 94900,
    summary: "La espiral del clan, en bermellón sobre algodón hueso.",
    description:
      "La referencia más pedida de la cápsula: una espiral bermellón de 22 cm impresa al frente sobre camiseta hueso. Estampado de fan art no oficial con tinta de base agua, resistente al lavado y suave al tacto.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a base de agua",
    care: cuidadoBase,
    image: {
      src: "/products/grafica-naruto.svg",
      alt: "Camiseta color hueso con una espiral bermellón impresa en grande",
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
    slug: "grafica-one-piece",
    name: "Gráfica One Piece",
    type: "grafica",
    price: 94900,
    summary: "El sombrero de paja al frente, en hueso y bermellón.",
    description:
      "Sombrero de paja de ala ancha impreso al frente con cinta bermellón, sobre camiseta negra. Estampado de fan art no oficial en tinta de base agua, con acabado mate y producción de 50 unidades.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a base de agua",
    care: cuidadoBase,
    image: {
      src: "/products/grafica-one-piece.svg",
      alt: "Camiseta negra con un sombrero de paja de ala ancha impreso en el pecho",
    },
    colors: [{ name: "Tinta", hex: "#0c0c0e" }],
    sizes: [
      { size: "S", stock: 2 },
      { size: "M", stock: 4 },
      { size: "L", stock: 4 },
      { size: "XL", stock: 2 },
    ],
  },
  {
    slug: "grafica-demon-slayer",
    name: "Gráfica Demon Slayer",
    type: "grafica",
    price: 94900,
    summary: "El patrón de cuadros que cubre toda la prenda.",
    description:
      "La única referencia con estampado de cuerpo completo: el patrón de cuadros verdes y negros cubre el frente y la espalda. Estampado de fan art no oficial en tinta de base agua, producción de 45 unidades.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a base de agua",
    care: cuidadoBase,
    image: {
      src: "/products/grafica-demon-slayer.svg",
      alt: "Camiseta negra con patrón de cuadros verdes en toda la prenda",
    },
    colors: [{ name: "Tinta", hex: "#0c0c0e" }],
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
    price: 89900,
    summary: "Tu equipo con estampado a una tinta. Mínimo 6 unidades.",
    description:
      "Camiseta personalizada con el diseño que nos envíes: una tinta al frente o al reverso. Ideal para equipos, grupos de estudio y uniformes de trabajo. El pedido mínimo es de 6 unidades y la entrega tarda entre 8 y 12 días hábiles.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a una tinta",
    care: cuidadoBase,
    image: {
      src: "/products/personalizada-equipo.svg",
      alt: "Camiseta color hueso con un área de estampado delimitada para personalizar",
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
    price: 84900,
    summary: "Para eventos y celebraciones desde 12 unidades, con envío gratis.",
    description:
      "La versión por volumen de nuestra camiseta personalizada. Pensada para eventos, graduaciones y celebraciones: una tinta, una fecha de entrega y envío gratis desde la primera compra. Mínimo 12 unidades y entrega en 10 a 15 días hábiles.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a una tinta",
    care: cuidadoBase,
    image: {
      src: "/products/personalizada-evento.svg",
      alt: "Camiseta negra con área de estampado delimitada para un evento",
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
