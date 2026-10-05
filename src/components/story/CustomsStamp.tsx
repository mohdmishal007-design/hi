import { useId } from "react";

type Props = { top: string; bottom: string; rtl: boolean; className?: string };

/** A blue-ink customs stamp. The ink texture is an SVG filter, so it stays crisp at any size. */
export default function CustomsStamp({ top, bottom, rtl, className = "" }: Props) {
  const id = useId().replace(/:/g, "");
  const ink = `ink-${id}`;
  const letter = rtl ? 0 : 0.14;

  return (
    <div data-stamp className={`stamp ${className}`} aria-hidden>
      <svg viewBox="0 0 240 150" className="h-auto w-full" role="presentation">
        <defs>
          <filter id={ink} x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grain" />
            <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="rough" />
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="11" result="blots" />
            <feColorMatrix in="blots" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.5 0 0 0 1.55" result="wear" />
            <feComposite in="rough" in2="wear" operator="in" />
          </filter>
        </defs>
        <g filter={`url(#${ink})`} fill="none" stroke="currentColor">
          <rect x="6" y="6" width="228" height="138" rx="12" strokeWidth="7" />
          <rect x="17" y="17" width="206" height="116" rx="7" strokeWidth="1.8" />
          <line x1="40" x2="200" y1="80" y2="80" strokeWidth="1.8" />
          <g fill="currentColor" stroke="none" fontFamily="var(--font-display)" textAnchor="middle" direction={rtl ? "rtl" : "ltr"}>
            <text x="120" y={rtl ? 66 : 64} fontSize={rtl ? 40 : 38} fontWeight="700" letterSpacing={`${letter}em`}>
              {top}
            </text>
            <text x="120" y={rtl ? 116 : 114} fontSize={rtl ? 28 : 25} fontWeight="700" letterSpacing={`${letter}em`}>
              {bottom}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
