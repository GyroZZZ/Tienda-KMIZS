"use server";

import { redirect } from "next/navigation";

import { authenticate, createSession, destroySession, registerUser } from "@/lib/auth";

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

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
