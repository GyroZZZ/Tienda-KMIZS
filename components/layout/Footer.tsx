import Link from "next/link";

import { currentYear, footerNav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 bg-ink text-bone">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="font-display text-3xl leading-none">
            {site.name}
            <span className="text-accent">.</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-bone/70">{site.description}</p>
          <p className="mt-4 text-xs tracking-[0.18em] text-bone/60 uppercase">
            Hecho en {site.city}
          </p>
        </div>

        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-display text-sm tracking-[0.12em] text-bone/60">{group.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bone/80 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-bone/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-bone/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {currentYear} {site.name}. Todos los derechos reservados.
          </p>
          <p>Proyecto académico · Comercio electrónico</p>
        </div>
      </div>
    </footer>
  );
}
