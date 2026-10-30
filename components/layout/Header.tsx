"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainNav, site } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-bone/90 backdrop-blur">
      <div className="bg-ink px-4 py-1.5 text-center text-[11px] font-medium tracking-[0.18em] text-bone/90 uppercase">
        Envíos a toda Colombia · Pago contraentrega
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-display text-2xl leading-none tracking-tight text-ink sm:text-3xl"
          aria-label={`${site.name} — inicio`}
        >
          {site.name}
          <span className="text-accent">.</span>
        </Link>

        <nav aria-label="Navegación principal" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-accent ${
                    isActive(pathname, item.href) ? "text-accent" : "text-ink/80"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carrito"
            aria-label="Carrito"
            className="flex min-h-11 items-center gap-2 rounded-card border border-ink/15 px-3 py-2 text-sm font-medium tracking-wide uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 7h12l-1 13H7L6 7Z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-card border border-ink/15 p-2 md:hidden"
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
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-movil"
          aria-label="Navegación móvil"
          className="border-t border-ink/10 bg-bone px-4 pt-2 pb-4 md:hidden"
        >
          <ul className="flex flex-col">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`block border-b border-ink/10 py-3 text-sm font-medium tracking-wide uppercase ${
                    isActive(pathname, item.href) ? "text-accent" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
