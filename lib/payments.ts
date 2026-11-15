/**
 * Credenciales de Mercado Pago.
 *
 * Mercado Pago no tiene un entorno separado de pruebas: se usa la misma API con
 * credenciales de prueba. La pestaña "Prueba" de la aplicación entrega tokens
 * `TEST-` (API de pagos, Bricks) o `APP_USR-` (Checkout Pro). Como `APP_USR-`
 * también identifica credenciales de producción, el entorno se declara en
 * `MERCADO_PAGO_ENVIRONMENT` y por defecto es `test`.
 *
 * En `test` se aceptan ambos prefijos: un `APP_USR-` solo es válido si se copió
 * de la pestaña "Prueba". En `production` solo se acepta `APP_USR-`, de modo que
 * un token de prueba no puede cobrar dinero real.
 */

export type MercadoPagoEnvironment = "test" | "production";

export function getMercadoPagoEnvironment(): MercadoPagoEnvironment {
  return process.env.MERCADO_PAGO_ENVIRONMENT?.trim() === "production" ? "production" : "test";
}

export function getMercadoPagoAccessToken(): string | null {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim();
  if (!token) return null;

  if (getMercadoPagoEnvironment() === "production") {
    return token.startsWith("APP_USR-") ? token : null;
  }

  return token.startsWith("TEST-") || token.startsWith("APP_USR-") ? token : null;
}
