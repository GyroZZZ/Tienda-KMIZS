import type { Product } from "@/lib/products";

/**
 * Catálogo inicial de ejemplo (Sprint 1).
 * Los datos reales de la investigación de mercado se cargan en el Sprint 2.
 */
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
    care: [
      "Lavar a máquina con agua fría y del revés.",
      "No usar blanqueador ni secadora a temperatura alta.",
      "Planchar por el revés, evitando la estampación.",
    ],
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
      { size: "M", stock: 12 },
      { size: "L", stock: 9 },
      { size: "XL", stock: 4 },
    ],
    featured: true,
  },
  {
    slug: "grafica-ruido",
    name: "Gráfica Ruido",
    type: "grafica",
    price: 94900,
    compareAtPrice: 109900,
    summary: "Diseño propio impreso en serie corta, con tinta de base agua.",
    description:
      "Pieza de nuestra primera cápsula gráfica. La estampación va al frente y al centro, con tinta de base agua que se siente suave al tacto y resiste el lavado. Producción limitada de 60 unidades.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a base de agua",
    care: [
      "Lavar a máquina con agua fría y del revés.",
      "No usar blanqueador ni secadora a temperatura alta.",
      "No planchar directamente sobre la estampación.",
    ],
    image: {
      src: "/products/grafica-ruido.svg",
      alt: "Camiseta color hueso con gráfica geométrica en bermellón",
    },
    colors: [{ name: "Hueso", hex: "#f5f2ea" }],
    sizes: [
      { size: "S", stock: 3 },
      { size: "M", stock: 8 },
      { size: "L", stock: 7 },
      { size: "XL", stock: 0 },
    ],
    featured: true,
  },
  {
    slug: "personalizada-equipo",
    name: "Personalizada Equipo",
    type: "personalizada",
    price: 89900,
    summary: "Tu equipo, tu evento o tu marca, con estampado a una tinta.",
    description:
      "Camiseta personalizada con el diseño que nos envíes: una tinta al frente o al reverso. Ideal para equipos, eventos y uniformes de trabajo. El pedido mínimo es de 6 unidades y la entrega tarda entre 8 y 12 días hábiles.",
    composition: "100% algodón peinado · 240 g/m² · Estampado a una tinta",
    care: [
      "Lavar a máquina con agua fría y del revés.",
      "No usar blanqueador ni secadora a temperatura alta.",
      "No planchar directamente sobre la estampación.",
    ],
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
];
