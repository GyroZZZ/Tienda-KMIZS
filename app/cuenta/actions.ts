"use server";

import { redirect } from "next/navigation";

import { authenticate, createSession, destroySession, registerUser, type AccountUser } from "@/lib/auth";
import { DEMO_ACCOUNT } from "@/lib/demo";

export interface AuthState {
  error?: string;
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const result = await registerUser({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!result.ok || !result.user) {
    return { error: result.error ?? "No pudimos crear la cuenta." };
  }

  await createSession(result.user.id);
  redirect("/cuenta");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const result = await authenticate(
    String(formData.get("email") ?? ""),
    String(formData.get("password") ?? ""),
  );

  if (!result.ok || !result.user) {
    return { error: result.error ?? "Correo o contraseña incorrectos." };
  }

  await createSession(result.user.id);
  redirect("/cuenta");
}

/**
 * Acceso de un solo clic para la demostración en clase. La cuenta se crea la
 * primera vez; si ya existe, se usa la contraseña fija del entorno de prueba.
 */
export async function demoLoginAction(): Promise<{ ok: boolean; user?: AccountUser }> {
  const registered = await registerUser({
    name: DEMO_ACCOUNT.name,
    email: DEMO_ACCOUNT.email,
    password: DEMO_ACCOUNT.password,
  });
  let user = registered.user;

  if (!user) {
    const existing = await authenticate(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
    if (!existing.user) return { ok: false };
    user = existing.user;
  }

  await createSession(user.id);
  return { ok: true, user };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
