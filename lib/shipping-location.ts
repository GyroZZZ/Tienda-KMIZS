import type { ShippingOptions, ShippingZone } from "@/lib/shipping";

export function normalizeShippingLocation(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function getShippingZoneForAddress(
  options: ShippingOptions,
  city: string,
  department: string,
): ShippingZone | undefined {
  const location = normalizeShippingLocation(`${city}|${department}`);
  if (!city.trim() || !department.trim()) return undefined;

  const zoneId = options.mainMunicipalities.includes(location)
    ? "main"
    : options.extendedMunicipalities.includes(location)
      ? "extended"
      : undefined;
  return options.zones.find((zone) => zone.id === zoneId);
}
