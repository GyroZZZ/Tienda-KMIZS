import type { Fit, Size } from "@/lib/products";

/**
 * Tablas de medidas de referencia.
 *
 * Origen: tabla del proveedor de confección para camiseta unisex de algodón
 * peinado. Las medidas están tomadas sobre la prenda extendida en plano y
 * expresadas en centímetros. Quedan pendientes de validar contra la primera
 * muestra física; ver docs/catalogo.md.
 */

export interface SizeMeasurement {
  size: Size;
  /** Ancho de pecho, de costura a costura, justo bajo la sisa. */
  chest: number;
  /** Largo total, del hombro al ruedo. */
  length: number;
  /** Largo de manga, del hombro a la costura del ruedo. */
  sleeve: number;
}

export interface FitGuide {
  fit: Fit;
  label: string;
  description: string;
  measurements: SizeMeasurement[];
}

export const sizeGuides: Record<Fit, FitGuide> = {
  regular: {
    fit: "regular",
    label: "Corte recto",
    description:
      "Cae recto desde el hombro, sin exceso de tela. Es el corte de las básicas y de las gráficas.",
    measurements: [
      { size: "S", chest: 50, length: 69, sleeve: 20 },
      { size: "M", chest: 53, length: 71, sleeve: 21 },
      { size: "L", chest: 56, length: 74, sleeve: 22 },
      { size: "XL", chest: 59, length: 76, sleeve: 23 },
    ],
  },
  oversize: {
    fit: "oversize",
    label: "Corte oversize",
    description:
      "Cuerpo más ancho y hombro caído. Se lleva suelto: si dudas entre dos tallas, elige la menor.",
    measurements: [
      { size: "S", chest: 57, length: 71, sleeve: 23 },
      { size: "M", chest: 60, length: 73, sleeve: 24 },
      { size: "L", chest: 63, length: 76, sleeve: 25 },
      { size: "XL", chest: 66, length: 78, sleeve: 26 },
    ],
  },
};

export function getSizeGuide(fit: Fit): FitGuide {
  return sizeGuides[fit];
}

export function getMeasurement(fit: Fit, size: Size): SizeMeasurement | undefined {
  return sizeGuides[fit].measurements.find((row) => row.size === size);
}
