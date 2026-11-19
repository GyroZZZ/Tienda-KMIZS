import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/account/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Entra a tu cuenta KMIZS para ver tus pedidos.",
  robots: { index: false, follow: false },
};

// Lee la cookie de sesión: la ruta se renderiza en cada petición.
export const instant = false;

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/cuenta");

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-accent uppercase">Cuenta</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">Iniciar sesión</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
        Entra con tu correo y tu contraseña para ver el historial de tus pedidos.
      </p>

      <AuthForm mode="login" />
    </div>
  );
}
