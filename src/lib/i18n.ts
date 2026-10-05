export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

/** Visitors whose browser states no language preference land here. */
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const dir = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");

export const otherLocale = (locale: Locale): Locale => (locale === "ar" ? "en" : "ar");

/** Build an internal href for a locale, e.g. href("ar", "/services/sea-freight/"). */
export function href(locale: Locale, path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Swap the locale prefix of a pathname, keeping the rest of the route. */
export function switchLocalePath(pathname: string, to: Locale) {
  const parts = pathname.split("/");
  if (parts[1] && isLocale(parts[1])) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}/`;
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
