import type { Metadata } from "next";
import { Suspense } from "react";

import { OrderThankYou } from "@/components/checkout/OrderThankYou";

export const metadata: Metadata = {
  title: "Pedido registrado",
  description: "Resumen y próximos pasos de tu pedido en KMIZS.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 md:py-20" role="status">
          Cargando el pedido…
        </div>
      }
    >
      <OrderThankYou />
    </Suspense>
  );
}
