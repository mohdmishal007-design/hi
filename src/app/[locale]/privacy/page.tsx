import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/content";
import { isLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const p = getDictionary(locale).privacy;
  return {
    title: p.title,
    description: p.metaDescription,
    alternates: {
      canonical: `/${locale}/privacy/`,
      languages: { en: "/en/privacy/", ar: "/ar/privacy/", "x-default": "/en/privacy/" },
    },
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const p = getDictionary(locale).privacy;

  return (
    <article className="mx-auto max-w-[44rem] px-5 pb-28 pt-36 sm:px-8">
      <h1 className="tight text-[clamp(2.4rem,5vw,3.75rem)] font-semibold leading-[1.05]">{p.title}</h1>
      <p className="mt-4 text-[0.9375rem] text-dim">{p.updated}</p>
      <div className="mt-12 space-y-10">
        {p.sections.map((s) => (
          <section key={s.title}>
            <h2 className="snug font-display text-xl font-semibold">{s.title}</h2>
            {s.body.map((para) => (
              <p key={para} className="mt-3 text-lg leading-relaxed text-mist">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
