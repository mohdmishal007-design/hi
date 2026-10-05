import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serviceIcons } from "@/components/serviceIcons";
import { getDictionary } from "@/content";
import { serviceGroups, serviceSlugs, site, type ServiceSlug } from "@/content/site";
import { href, isLocale, locales } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string; slug: string }> };

const isSlug = (s: string): s is ServiceSlug => (serviceSlugs as readonly string[]).includes(s);

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => serviceSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSlug(slug)) return {};
  const item = getDictionary(locale).services.items[slug];
  return {
    title: item.name,
    description: item.metaDescription,
    alternates: {
      canonical: `/${locale}/services/${slug}/`,
      languages: { en: `/en/services/${slug}/`, ar: `/ar/services/${slug}/`, "x-default": `/en/services/${slug}/` },
    },
    openGraph: { title: item.name, description: item.metaDescription, images: [{ url: `/img/services/${slug}.webp` }] },
  };
}

export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isSlug(slug)) notFound();
  const t = getDictionary(locale);
  const item = t.services.items[slug];
  const p = t.servicePage;
  const Icon = serviceIcons[slug];
  const related = serviceGroups.find((g) => g.slugs.includes(slug))!.slugs.filter((s) => s !== slug);
  const quoteHref = href(locale, `/?service=${slug}#quote`);

  return (
    <article>
      <header className="border-b border-hull pt-[4.5rem]">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-end px-5 py-16 sm:px-8 lg:py-24 lg:ps-[max(2rem,calc((100vw_-_90rem)/2_+_2rem))] lg:pe-16">
            <nav aria-label="Breadcrumb">
              <Link href={href(locale, "/#services")} className="text-[0.9375rem] text-mist hover:text-ice hover:underline">
                {p.allServices}
              </Link>
            </nav>
            <Icon aria-hidden size={30} strokeWidth={1.5} className="mt-10 text-sky" />
            <h1 className="tight mt-5 text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[1.04]">{item.name}</h1>
            <p className="mt-6 max-w-[40rem] text-lg leading-relaxed text-mist sm:text-xl">{item.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={quoteHref} className="btn btn-solid">
                {p.ctaButton}
              </Link>
              <a href={site.whatsappHref} rel="noopener" className="btn btn-quiet">
                {t.contact.whatsappAction}
              </a>
            </div>
          </div>
          <figure className="relative min-h-[18rem] sm:min-h-[26rem]">
            <img
              src={`/img/services/${slug}.webp`}
              alt=""
              width={1400}
              height={933}
              fetchPriority="high"
              className="absolute inset-0 size-full object-cover"
            />
          </figure>
        </div>
      </header>

      <div className="mx-auto grid max-w-[90rem] gap-16 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12">
        <section className={item.steps ? "lg:col-span-6" : "lg:col-span-8"}>
          <h2 className="snug font-display text-2xl font-semibold">{p.handles}</h2>
          <ul className="mt-6 border-t border-hull">
            {item.handles.map((h) => (
              <li key={h} className="flex gap-3 border-b border-hull py-4 text-lg leading-relaxed">
                <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 bg-sky" />
                {h}
              </li>
            ))}
          </ul>
        </section>

        {item.steps && (
          <section className="lg:col-span-5 lg:col-start-8">
            <h2 className="snug font-display text-2xl font-semibold">{p.steps}</h2>
            <ol className="mt-6 space-y-0 border-s border-hull">
              {item.steps.map((s, i) => (
                <li key={s} className="relative ps-8 pb-8 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -start-[0.8rem] top-0 grid size-6 place-items-center rounded-full bg-night font-display text-sm font-semibold text-sky shadow-[inset_0_0_0_1.5px_var(--color-sky)]"
                  >
                    {i + 1}
                  </span>
                  <p className="text-lg leading-relaxed">{s}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <section className="border-t border-hull bg-deep">
        <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8">
          <h2 className="font-display text-base font-semibold text-sky">{p.related}</h2>
          <ul className="mt-5 grid gap-px border border-hull bg-hull md:grid-cols-2">
            {related.map((r) => {
              const RIcon = serviceIcons[r];
              return (
                <li key={r} className="bg-deep">
                  <Link href={href(locale, `/services/${r}/`)} className="group flex items-start gap-4 p-6">
                    <RIcon aria-hidden size={22} strokeWidth={1.6} className="mt-0.5 text-sky" />
                    <span className="flex-1">
                      <span className="snug block font-display text-lg font-semibold group-hover:underline">
                        {t.services.items[r].name}
                      </span>
                      <span className="mt-1 block text-[0.9375rem] text-mist">{t.services.items[r].summary}</span>
                    </span>
                    <ArrowUpRight aria-hidden size={20} className="flip-rtl mt-1 text-dim group-hover:text-ice" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-t border-hull">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-8 px-5 py-20 sm:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="tight text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.05]">{p.ctaTitle}</h2>
            <p className="mt-3 max-w-[32rem] text-lg text-mist">{p.ctaBody}</p>
          </div>
          <Link href={quoteHref} className="btn btn-solid self-start md:self-auto">
            {p.ctaButton}
          </Link>
        </div>
      </section>
    </article>
  );
}
