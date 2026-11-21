"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { demoLoginAction, logoutAction } from "@/app/cuenta/actions";

interface MenuUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Botón de cuenta y panel lateral. Se usa <dialog> nativo: gestiona el foco,
 * la tecla Escape y el cierre por backdrop sin plugins adicionales.
 */
export function AccountMenu() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<MenuUser | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    try {
      const response = await fetch("/api/account/me", { cache: "no-store" });
      const data = (await response.json()) as { user?: MenuUser | null };
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  function handleOpen() {
    setError("");
    setOpen(true);
    void loadUser();
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  async function handleDemoLogin() {
    setBusy(true);
    setError("");
    try {
      const result = await demoLoginAction();
      if (!result.ok || !result.user) {
        setError("No se pudo iniciar la sesión demo. Inténtalo de nuevo.");
        return;
      }
      setUser(result.user);
      router.refresh();
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        aria-label="Abrir mi cuenta"
        aria-expanded={open}
        aria-controls="panel-cuenta"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-card border border-ink/15 p-2 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bone"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      </button>

      <dialog
        id="panel-cuenta"
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
        aria-label="Mi cuenta"
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[90vw] max-w-sm bg-bone p-0 text-ink shadow-2xl backdrop:bg-ink/60"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-xl tracking-tight">Mi cuenta</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar panel de cuenta"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-card border border-ink/15 p-2 hover:border-ink"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            {user === undefined ? (
              <p className="text-sm text-ink/60" role="status">
                Cargando…
              </p>
            ) : user ? (
              <>
                <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
                  Hola
                </p>
                <p className="mt-2 text-2xl tracking-tight">{user.name}</p>
                <p className="mt-1 text-sm break-all text-ink/65">{user.email}</p>

                <nav aria-label="Opciones de cuenta" className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/cuenta"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="min-h-11 border border-ink/15 px-4 py-3 text-sm font-semibold tracking-[0.08em] uppercase hover:border-ink"
                  >
                    Ver mi cuenta
                  </Link>
                  <Link
                    href="/cuenta/pedidos"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="min-h-11 border border-ink/15 px-4 py-3 text-sm font-semibold tracking-[0.08em] uppercase hover:border-ink"
                  >
                    Mis pedidos
                  </Link>
                </nav>

                <form action={logoutAction} className="mt-8 border-t border-ink/10 pt-5">
                  <button
                    type="submit"
                    className="min-h-11 text-sm text-ink/70 underline decoration-accent underline-offset-4 hover:text-accent"
                  >
                    Cerrar sesión
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-ink/70">
                  Entra para ver el historial de tus pedidos. Si compraste como invitado, se asignan
                  solos a tu cuenta.
                </p>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={busy}
                  className="mt-6 min-h-12 w-full bg-ink px-4 py-3 text-sm font-semibold tracking-[0.08em] text-bone uppercase transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Entrando…" : "Entrar con cuenta demo"}
                </button>
                <p className="mt-2 text-xs leading-relaxed text-ink/55">
                  Cuenta de prueba para la demostración en clase. No necesitas correo ni contraseña.
                </p>

                {error ? (
                  <p role="alert" className="mt-4 border border-accent/40 bg-accent/5 p-3 text-sm">
                    {error}
                  </p>
                ) : null}

                <nav aria-label="Acceso a cuenta" className="mt-8 flex flex-col gap-3 border-t border-ink/10 pt-5">
                  <Link
                    href="/cuenta/ingresar"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="min-h-11 text-sm font-semibold tracking-[0.08em] text-ink uppercase underline decoration-accent underline-offset-4"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/cuenta/registro"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="min-h-11 text-sm font-semibold tracking-[0.08em] text-ink uppercase underline decoration-accent underline-offset-4"
                  >
                    Crear cuenta
                  </Link>
                </nav>
              </>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
