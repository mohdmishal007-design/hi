"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { scrollToY } from "@/components/SmoothScroll";
import type { Dictionary } from "@/content";
import { site, storyStills } from "@/content/site";
import { href, type Locale } from "@/lib/i18n";
import CustomsStamp from "./CustomsStamp";
import RouteLine from "./RouteLine";
import { STAMP_BEAT, activeStop, clamp01, easeOutCubic, routeProgress } from "./route";

type Props = { locale: Locale; t: Dictionary["story"] };

const BEATS = storyStills.length;

/**
 * The homepage opens on one consignment's journey: eight beats over seven
 * stills. Without script, or with reduced motion, the beats stack as full
 * screens. With motion, one sticky stage scrubs through them on scroll.
 */
export default function StoryHero({ locale, t }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    section.dataset.mode = "film";

    const beats = Array.from(section.querySelectorAll<HTMLElement>("[data-beat]"));
    const media = beats.map((b) => b.querySelector<HTMLElement>(".story-media")!);
    const images = beats.map((b) => b.querySelector<HTMLImageElement>("img")!);
    const captions = beats.map((b) => b.querySelector<HTMLElement>(".story-caption")!);
    const stamp = section.querySelector<HTMLElement>("[data-stamp]");
    const film = section.querySelector<HTMLElement>(".film-route")!;
    const fill = film.querySelector<HTMLElement>("[data-fill]")!;
    const stops = Array.from(film.querySelectorAll<HTMLElement>("[data-stop]"));
    const current = film.querySelector<HTMLElement>("[data-route-current]")!;

    const render = (progress: number) => {
      const time = progress * (BEATS - 1);
      let stampCaption = 0;

      beats.forEach((_, b) => {
        const d = time - b;
        if (b > 0) media[b].style.opacity = String(clamp01((time - (b - 0.6)) / 0.45));
        images[b].style.transform = `scale(${1 + 0.07 * clamp01((d + 0.6) / 1.6)})`;

        const fadeIn = b === 0 ? 1 : clamp01((d + 0.45) / 0.3);
        const fadeOut = b === BEATS - 1 ? 1 : clamp01((0.45 - d) / 0.3);
        const o = Math.min(fadeIn, fadeOut);
        const cap = captions[b];
        cap.style.opacity = String(o);
        cap.style.transform = `translate3d(0, ${-Math.max(-0.6, Math.min(0.6, d)) * 28}px, 0)`;
        cap.style.visibility = o < 0.01 ? "hidden" : "visible";
        cap.inert = o < 0.5;
        if (b === STAMP_BEAT) stampCaption = o;
      });

      if (stamp) {
        const k = easeOutCubic(clamp01((time - (STAMP_BEAT - 0.12)) / 0.22));
        stamp.style.opacity = String(k * stampCaption);
        stamp.style.transform = `rotate(-9deg) scale(${1.45 - 0.45 * k})`;
      }

      const along = routeProgress(time);
      const active = activeStop(along);
      fill.style.transform = `scaleX(${along})`;
      stops.forEach((s, i) => {
        s.dataset.state = i < active ? "passed" : i === active ? "current" : "ahead";
      });
      current.textContent = t.route[active];
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => render(self.progress),
    });
    render(trigger.progress);

    return () => {
      trigger.kill();
      section.dataset.mode = "stacked";
      [...media, ...images, ...captions, stamp].forEach((el) => el?.removeAttribute("style"));
      captions.forEach((c) => (c.inert = false));
    };
  }, [t.route]);

  const followShipment = () => {
    const section = root.current;
    if (!section) return;
    const next = section.querySelector<HTMLElement>('[data-beat="1"]');
    const top = section.dataset.mode === "film" ? section.offsetTop + window.innerHeight : (next?.offsetTop ?? 0) + section.offsetTop;
    scrollToY(top);
  };

  const rtl = locale === "ar";

  return (
    <section
      id="journey"
      ref={root}
      data-mode="stacked"
      aria-label={t.routeLabel}
      className="story relative"
      style={{ "--beats": BEATS } as React.CSSProperties}
    >
      <div className="story-stage">
        {storyStills.map((still, i) => {
          const along = routeProgress(i);
          const isIntro = i === 0;
          const isFinale = i === BEATS - 1;
          const beat = isIntro ? null : t.beats[i - 1];
          return (
            <div key={i} data-beat={i} className="story-beat">
              {/* Each frame carries its own scrim, so stacked frames never darken each other. */}
              <div className="story-media">
                <picture>
                  <source media="(max-aspect-ratio: 4/5)" srcSet={`/img/story/s${still}-portrait.webp`} />
                  <img
                    src={`/img/story/s${still}-1280.webp`}
                    srcSet={`/img/story/s${still}-1280.webp 1280w, /img/story/s${still}-2400.webp 2400w`}
                    sizes="100vw"
                    width={2400}
                    height={1350}
                    alt=""
                    loading={i < 2 ? "eager" : "lazy"}
                    fetchPriority={isIntro ? "high" : undefined}
                    decoding="async"
                  />
                </picture>
                <div aria-hidden className="story-scrim" />
              </div>

              {isIntro && (
                <p className="absolute end-5 top-[5.25rem] z-10 text-[0.8125rem] text-ice/70 sm:end-8">{t.imageNote}</p>
              )}

              {i === STAMP_BEAT && (
                <CustomsStamp
                  top={t.stamp.top}
                  bottom={t.stamp.bottom}
                  rtl={rtl}
                  className="absolute left-[18%] top-[17%] z-10 w-[clamp(150px,17vw,240px)] sm:left-[22%] sm:top-[21%]"
                />
              )}

              <div className="story-caption absolute inset-0 z-10 flex flex-col justify-end px-5 pb-28 sm:px-8 sm:pb-36">
                <div className="mx-auto w-full max-w-[90rem]">
                  {isIntro ? (
                    <div className="max-w-[52rem]">
                      <h1 className="tight text-[clamp(2.6rem,6.2vw,5.75rem)] font-semibold leading-[1.02]">{t.title}</h1>
                      <p className="mt-6 max-w-[38rem] text-lg leading-relaxed text-mist sm:text-xl">{t.lead}</p>
                      <div className="mt-9 flex flex-wrap items-center gap-3">
                        <Link href={href(locale, "/#quote")} className="btn btn-solid">
                          {t.ctaQuote}
                        </Link>
                        <button type="button" onClick={followShipment} className="btn btn-quiet">
                          {t.ctaFollow}
                          <ArrowDown aria-hidden size={18} />
                        </button>
                      </div>
                    </div>
                  ) : isFinale ? (
                    <div className="max-w-[48rem]">
                      <h2 className="tight text-[clamp(2.4rem,5.6vw,5.25rem)] font-semibold leading-[1.03]">{beat!.title}</h2>
                      <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-mist sm:text-xl">{beat!.body}</p>
                      <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link href={href(locale, "/#quote")} className="btn btn-solid">
                          {t.ctaQuote}
                        </Link>
                        <a href={site.whatsappHref} rel="noopener" className="btn btn-quiet">
                          {t.ctaWhatsApp}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[40rem]">
                      <h2 className="tight text-[clamp(2rem,4.4vw,4rem)] font-semibold leading-[1.05]">{beat!.title}</h2>
                      <p className="mt-4 max-w-[34rem] text-lg leading-relaxed text-mist">{beat!.body}</p>
                    </div>
                  )}
                </div>
              </div>

              <RouteLine
                className="beat-route"
                stops={t.route}
                label={t.routeLabel}
                fill={along}
                active={activeStop(along)}
              />
            </div>
          );
        })}

        <RouteLine className="film-route" stops={t.route} label={t.routeLabel} live />
      </div>
    </section>
  );
}
