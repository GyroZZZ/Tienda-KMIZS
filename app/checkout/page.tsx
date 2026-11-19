import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { TrustSignals } from "@/components/trust/TrustSignals";
import { getCurrentUser } from "@/lib/auth";
import { getMercadoPagoAccessToken } from "@/lib/payments";
import { getShippingOptions } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Completa tus datos de envío y elige cómo quieres pagar.",
  robots: { index: false, follow: false },
};

// Prellena los datos con la sesión: la ruta se renderiza en cada petición.
export const instant = false;

export default async function CheckoutPage() {
  const shippingOptions = getShippingOptions();
  const user = await getCurrentUser();
  const onlinePaymentsAvailable =
    Boolean(getMercadoPagoAccessToken()) &&
    Boolean(process.env.MERCADO_PAGO_WEBHOOK_SECRET) &&
    Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) &&
    shippingOptions.confirmed;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="text-4xl tracking-tight sm:text-5xl">Finalizar compra</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
        Revisa tus productos, comparte tus datos de entrega y elige cómo pagar. El envío es gratis
        desde 2 prendas y en pedidos personalizados; si es una sola, te informamos el costo y el
        plazo antes de cobrar o despachar.
      </p>

      <TrustSignals context="checkout" />

      <CheckoutForm
        shippingOptions={shippingOptions}
        onlinePaymentsAvailable={onlinePaymentsAvailable}
        defaultCustomer={user ? { name: user.name, email: user.email } : null}
      />
    </div>
  );
}
