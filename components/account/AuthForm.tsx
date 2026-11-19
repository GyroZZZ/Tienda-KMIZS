"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, registerAction, type AuthState } from "@/app/cuenta/actions";

const initialState: AuthState = {};

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const action = mode === "register" ? registerAction : loginAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 max-w-md space-y-5">
      {mode === "register" ? (
        <label className="block text-sm font-semibold">
          Nombre completo
          <input
            name="name"
            required
            autoComplete="name"
            maxLength={80}
            minLength={2}
            className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
          />
        </label>
      ) : null}

      <label className="block text-sm font-semibold">
        Correo electrónico
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          maxLength={254}
          className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
        />
      </label>

      <label className="block text-sm font-semibold">
        Contraseña
        <input
          type="password"
          name="password"
          required
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          minLength={8}
          maxLength={72}
          className="mt-2 min-h-11 w-full border border-ink/25 bg-bone px-3 font-normal"
        />
        {mode === "register" ? (
          <span className="mt-2 block text-xs font-normal text-ink/55">
            Mínimo 8 caracteres. La guardamos cifrada, nunca en texto plano.
          </span>
        ) : null}
      </label>

      {state.error ? (
        <p role="alert" className="border border-accent/40 bg-accent/5 p-4 text-sm">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full bg-ink px-6 py-3 text-sm font-semibold tracking-[0.12em] text-bone uppercase transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Un momento…"
          : mode === "register"
            ? "Crear mi cuenta"
            : "Iniciar sesión"}
      </button>

      <p className="text-sm text-ink/65">
        {mode === "register" ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/cuenta/ingresar" className="underline decoration-accent underline-offset-4">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿Primera vez aquí?{" "}
            <Link href="/cuenta/registro" className="underline decoration-accent underline-offset-4">
              Crea tu cuenta
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
