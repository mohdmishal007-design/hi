import type { Metadata, Viewport } from "next";
import { Alexandria, Manrope, Noto_Sans_Arabic, Sora } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import SmoothScroll from "@/components/SmoothScroll";
import { getDictionary } from "@/content";
import { dir, isLocale, locales, siteUrl } from "@/lib/i18n";
import "../globals.css";

const sora = Sora({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-sora", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-manrope", display: "swap" });
// Arabic faces load only when Arabic glyphs are on the page (unicode-range), so they are not preloaded.
const alexandria = Alexandria({
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
  variable: "--font-alexandria",
  display: "swap",
  preload: false,
});
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-arabic",
  display: "swap",
  preload: false,
});

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.title, template: `%s | ${t.meta.siteName}` },
    description: t.meta.description,
    applicationName: t.meta.siteName,
    openGraph: {
      type: "website",
      siteName: t.meta.siteName,
      locale: locale === "ar" ? "ar_SA" : "en_SA",
      images: [{ url: "/img/og.jpg", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#050b16",
  colorScheme: "dark",
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${sora.variable} ${manrope.variable} ${alexandria.variable} ${notoArabic.variable}`}
    >
      <body className="min-h-svh bg-night text-ice">
        <a
          href="#main"
          className="btn btn-solid sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60]"
        >
          {t.nav.skip}
        </a>
        <SmoothScroll />
        <SiteHeader locale={locale} t={t.nav} />
        <main id="main">{children}</main>
        <SiteFooter locale={locale} t={t} />
      </body>
    </html>
  );
}
