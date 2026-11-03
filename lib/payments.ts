export function getMercadoPagoTestToken(): string | null {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  return token?.startsWith("TEST-") ? token : null;
}
