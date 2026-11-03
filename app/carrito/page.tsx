import type { Metadata } from "next";

import { CartContents } from "@/components/cart/CartContents";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisa las camisetas que quieres comprar en KMIZS.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <h1 className="text-4xl tracking-tight sm:text-5xl">Tu carrito</h1>

      <CartContents />
    </div>
  );
}
