import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentResult } from "@/components/checkout/PaymentResult";

export const metadata: Metadata = {
  title: "Estado del pago",
  robots: { index: false, follow: false },
};

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 md:py-20" role="status">
          Verificando el pago…
        </div>
      }
    >
      <PaymentResult />
    </Suspense>
  );
}
