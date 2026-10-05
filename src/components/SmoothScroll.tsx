"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Lenis smooth scrolling on GSAP's ticker, so the shipment story scrubs on the
 * same clock as the scroll. Skipped entirely for reduced-motion visitors.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, anchors: { offset: -80 } });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

/** Scroll to a y position, through Lenis when it is running. */
export function scrollToY(top: number) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.__lenis) window.__lenis.scrollTo(top, { duration: 1.4 });
  else window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}
