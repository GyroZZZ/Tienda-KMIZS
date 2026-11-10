import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPolicy, policies, policySlugs } from "@/data/policies";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return policySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/politicas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);

  if (!policy) {
    return { title: "Página no encontrada" };
  }

  return {
    title: policy.title,
    description: policy.intro,
  };
}

export default async function PolicyPage({ params }: PageProps<"/politicas/[slug]">) {
  const { slug } = await params;
  const policy = getPolicy(slug);

  if (!policy) {
    notFound();
  }

  const otherPolicies = policySlugs
    .filter((entry) => entry !== slug)
    .map((entry) => ({ slug: entry, title: policies[entry].title }));

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[11px] font-medium tracking-[0.24em] text-ink/50 uppercase">Legal</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">{policy.title}</h1>
      <p className="mt-2 text-xs text-ink/50">Última actualización: {policy.updatedAt}</p>

      <p className="mt-6 text-base leading-relaxed text-ink/75">{policy.intro}</p>

      <div className="mt-10 space-y-8">
        {policy.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl tracking-tight">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/70">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 border border-ink/15 bg-bone-dim/40 p-5 text-sm leading-relaxed text-ink/70">
        <p className="font-semibold text-ink">¿Necesitas ayuda con tu pedido?</p>
        <p className="mt-2">
          Escríbenos a{" "}
          <a
            href={`mailto:${site.email}`}
            className="underline decoration-accent decoration-2 underline-offset-4"
          >
            {site.email}
          </a>{" "}
          o al WhatsApp{" "}
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-accent decoration-2 underline-offset-4"
          >
            {site.whatsappDisplay}
          </a>
          . Atendemos de lunes a viernes, 9:00 a 18:00 (hora Colombia).
        </p>
      </div>

      <nav aria-label="Otras políticas" className="mt-10 border-t border-ink/10 pt-6">
        <h2 className="text-[11px] font-semibold tracking-[0.18em] text-ink/50 uppercase">
          Otras políticas
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {otherPolicies.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/politicas/${entry.slug}`}
                className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
              >
                {entry.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}
