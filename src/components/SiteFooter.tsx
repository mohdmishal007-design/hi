import Link from "next/link";
import type { Dictionary } from "@/content";
import { serviceSlugs, site } from "@/content/site";
import { href, type Locale } from "@/lib/i18n";

type Props = { locale: Locale; t: Dictionary };

export default function SiteFooter({ locale, t }: Props) {
  const year = new Date().getFullYear();
  const f = t.footer;

  return (
    <footer className="border-t border-hull bg-deep">
      <div className="mx-auto grid max-w-[90rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <img src="/brand/logo.png" alt="Lonestar Shipping" width={180} height={40} className="h-10 w-auto" />
          <p className="tight mt-6 font-display text-2xl font-semibold">{f.tagline}</p>
        </div>

        <nav aria-label={f.servicesTitle} className="lg:col-span-3">
          <h2 className="text-sm font-semibold text-mist">{f.servicesTitle}</h2>
          <ul className="mt-4 space-y-2.5">
            {serviceSlugs.map((slug) => (
              <li key={slug}>
                <Link href={href(locale, `/services/${slug}/`)} className="text-[0.9375rem] hover:underline">
                  {t.services.items[slug].name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={f.companyTitle} className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-mist">{f.companyTitle}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            <li>
              <Link href={href(locale, "/#about")} className="hover:underline">
                {f.about}
              </Link>
            </li>
            <li>
              <Link href={href(locale, "/#coverage")} className="hover:underline">
                {t.nav.coverage}
              </Link>
            </li>
            <li>
              <Link href={href(locale, "/privacy/")} className="hover:underline">
                {f.privacy}
              </Link>
            </li>
            <li>
              <a href={site.groupSite} className="hover:underline" rel="noopener">
                {f.group}
              </a>
            </li>
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="text-sm font-semibold text-mist">{f.contactTitle}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            <li>
              <a href={site.phoneHref} className="ltr tabular hover:underline">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="ltr hover:underline">
                {site.email}
              </a>
            </li>
            <li>
              <a href={site.whatsappHref} className="hover:underline" rel="noopener">
                {t.contact.whatsapp}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hull">
        <div className="mx-auto flex max-w-[90rem] flex-col gap-2 px-5 py-6 text-sm text-dim sm:px-8 md:flex-row md:items-center md:justify-between">
          <p>
            {f.rights.replace("{year}", String(year))}
            {site.crNumber && (
              <>
                {" "}
                {f.cr} <span className="ltr tabular">{site.crNumber}</span>
              </>
            )}
            {site.vatNumber && (
              <>
                {" "}
                {f.vat} <span className="ltr tabular">{site.vatNumber}</span>
              </>
            )}
          </p>
          <p>{f.imageNote}</p>
        </div>
      </div>
    </footer>
  );
}
