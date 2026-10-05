"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content";
import { href, otherLocale, switchLocalePath, type Locale } from "@/lib/i18n";

type Props = { locale: Locale; t: Dictionary["nav"] };

export default function SiteHeader({ locale, t }: Props) {
  const pathname = usePathname() ?? `/${locale}/`;
  const isHome = pathname.replace(/\/$/, "") === `/${locale}`;
  const [solid, setSolid] = useState(!isHome);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Over the shipment story the bar stays clear; it turns solid once the story has scrolled past.
  useEffect(() => {
    if (!isHome) {
      setSolid(true);
      return;
    }
    const story = document.getElementById("journey");
    const update = () => {
      const end = story ? story.offsetTop + story.offsetHeight - 72 : 40;
      setSolid(window.scrollY > end);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [isHome]);

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { label: t.services, to: href(locale, "/#services") },
    { label: t.oilGas, to: href(locale, "/#oil-gas") },
    { label: t.coverage, to: href(locale, "/#coverage") },
    { label: t.contact, to: href(locale, "/#contact") },
  ];
  const other = otherLocale(locale);
  const switchHref = switchLocalePath(pathname, other);

  return (
    <header
      data-solid={solid || open}
      className="fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 data-[solid=true]:bg-night/95 data-[solid=true]:shadow-[0_1px_0_var(--color-hull)]"
    >
      <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center gap-6 px-5 sm:px-8">
        <Link href={href(locale, "/")} aria-label={t.home} className="shrink-0">
          <img src="/brand/logo.png" alt="Lonestar Shipping" width={144} height={32} className="h-8 w-auto" />
        </Link>

        <nav aria-label={t.menu} className="ms-auto hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link key={l.to} href={l.to} className="text-[0.9375rem] font-medium text-mist transition-colors hover:text-ice">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-3 lg:ms-0">
          <a
            href={switchHref}
            hrefLang={other}
            lang={other}
            aria-label={t.switchAria}
            className="rounded-[4px] px-2.5 py-2 text-[0.9375rem] font-medium text-mist transition-colors hover:text-ice"
          >
            {t.switchLabel}
          </a>
          <Link href={href(locale, "/#quote")} className="btn btn-solid hidden sm:inline-flex">
            {t.quote}
          </Link>
          <button
            ref={menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 place-items-center rounded-[4px] text-ice lg:hidden"
          >
            {open ? <X aria-hidden size={22} /> : <Menu aria-hidden size={22} />}
            <span className="sr-only">{open ? t.close : t.menu}</span>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-hull bg-night px-5 pb-8 pt-4 sm:px-8 lg:hidden">
          <nav aria-label={t.menu}>
            <ul className="divide-y divide-hull">
              {links.map((l, i) => (
                <li key={l.to}>
                  <Link
                    ref={i === 0 ? firstLink : undefined}
                    href={l.to}
                    onClick={() => setOpen(false)}
                    className="block py-4 font-display text-xl font-semibold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href={href(locale, "/#quote")} onClick={() => setOpen(false)} className="btn btn-solid mt-6 w-full justify-center">
            {t.quote}
          </Link>
        </div>
      )}
    </header>
  );
}
