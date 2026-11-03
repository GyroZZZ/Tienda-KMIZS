import { normalizeShippingLocation } from "@/lib/shipping-location";

export type ShippingZoneId = "main" | "extended";

export interface ShippingZone {
  id: ShippingZoneId;
  label: string;
  rate: number;
  eta: string;
}

export interface ShippingOptions {
  confirmed: boolean;
  zones: ShippingZone[];
  mainMunicipalities: string[];
  extendedMunicipalities: string[];
}

function readPositiveNumber(name: string): number | undefined {
  const value = process.env[name];
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function readEta(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length <= 40 ? value : undefined;
}

function readMunicipalities(name: string): string[] | undefined {
  const value = process.env[name];
  if (!value) return undefined;
  const municipalities = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const parts = entry.split("|").map((part) => part.trim());
      if (parts.length !== 2 || parts.some((part) => !part)) return "";
      return normalizeShippingLocation(`${parts[0]}|${parts[1]}`);
    });
  if (
    municipalities.length === 0 ||
    municipalities.length > 250 ||
    municipalities.some((entry) => !entry) ||
    new Set(municipalities).size !== municipalities.length
  ) {
    return undefined;
  }
  return municipalities;
}

export function getShippingOptions(): ShippingOptions {
  if (process.env.SHIPPING_RATES_CONFIRMED !== "true") {
    return {
      confirmed: false,
      zones: [],
      mainMunicipalities: [],
      extendedMunicipalities: [],
    };
  }

  const cityRate = readPositiveNumber("SHIPPING_MAIN_RATE");
  const extendedRate = readPositiveNumber("SHIPPING_EXTENDED_RATE");
  const cityEta = readEta("SHIPPING_MAIN_ETA");
  const extendedEta = readEta("SHIPPING_EXTENDED_ETA");
  const mainMunicipalities = readMunicipalities("SHIPPING_MAIN_MUNICIPALITIES");
  const extendedMunicipalities = readMunicipalities("SHIPPING_EXTENDED_MUNICIPALITIES");

  if (
    !cityRate ||
    !extendedRate ||
    !cityEta ||
    !extendedEta ||
    !mainMunicipalities ||
    !extendedMunicipalities ||
    mainMunicipalities.some((city) => extendedMunicipalities.includes(city))
  ) {
    throw new Error(
      "SHIPPING_RATES_CONFIRMED requiere tarifas, tiempos y municipios válidos para ambas zonas.",
    );
  }

  return {
    confirmed: true,
    zones: [
      { id: "main", label: "Ciudad principal", rate: cityRate, eta: cityEta },
      { id: "extended", label: "Zona extendida o rural", rate: extendedRate, eta: extendedEta },
    ],
    mainMunicipalities,
    extendedMunicipalities,
  };
}
