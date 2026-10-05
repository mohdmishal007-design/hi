import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { About, Contact, Coverage, OilGas, Quote, Services } from "@/components/home/Sections";
import StoryHero from "@/components/story/StoryHero";
import { getDictionary } from "@/content";
import { site } from "@/content/site";
import { isLocale, siteUrl } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    alternates: {
      canonical: `/${locale}/`,
      languages: { en: "/en/", ar: "/ar/", "x-default": "/en/" },
    },
  };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  const org = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#dammam`,
    name: "Lonestar Shipping Co. Ltd",
    alternateName: getDictionary("ar").contact.officeName,
    url: `${siteUrl}/${locale}/`,
    logo: `${siteUrl}/brand/mark.png`,
    image: `${siteUrl}/img/og.jpg`,
    telephone: site.phone.replace(/\s/g, ""),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Al Waha Downtown Mall, Office 12, 2nd Floor, Prince Mohammed Bin Fahad Road",
      addressLocality: "Dammam",
      addressCountry: "SA",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    },
    parentOrganization: { "@type": "Organization", name: "Lonestar Shipping", url: site.groupSite },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <StoryHero locale={locale} t={t.story} />
      <About locale={locale} t={t} />
      <Services locale={locale} t={t} />
      <OilGas locale={locale} t={t} />
      <Coverage locale={locale} t={t} />
      <Quote locale={locale} t={t} />
      <Contact locale={locale} t={t} />
    </>
  );
}
