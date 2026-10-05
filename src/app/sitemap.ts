import type { MetadataRoute } from "next";
import { serviceSlugs } from "@/content/site";
import { locales, siteUrl } from "@/lib/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...serviceSlugs.map((s) => `/services/${s}/`), "/privacy/"];
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: { languages: { en: `${siteUrl}/en${path}`, ar: `${siteUrl}/ar${path}` } },
    })),
  );
}
