type Props = {
  stops: readonly string[];
  label: string;
  /** 0–1 along the route. The film route is driven by script instead. */
  fill?: number;
  active?: number;
  className?: string;
  /** Film mode: the scrubber updates fill and stop states directly. */
  live?: boolean;
};

/**
 * The shipment's route as a line with five stops. Rendered statically inside
 * each beat (stacked mode) or once over the whole film (film mode).
 */
export default function RouteLine({ stops, label, fill = 0, active = 0, className = "", live = false }: Props) {
  const last = stops.length - 1;
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-6 sm:px-8 sm:pb-8 ${className}`}>
      <div className="mx-auto max-w-[90rem]">
        <ol aria-label={label} className="relative flex justify-between">
          {/* Track and fill run between the first and last stop centres. */}
          <span aria-hidden className="absolute inset-x-[5px] top-[5px] h-px bg-ice/25" />
          <span
            aria-hidden
            data-fill
            className="absolute inset-x-[5px] top-[4.5px] h-[2px] origin-left bg-sky rtl:origin-right"
            style={{ transform: `scaleX(${fill})` }}
          />
          {stops.map((stop, i) => {
            const state = i < active ? "passed" : i === active ? "current" : "ahead";
            const align = i === 0 ? "items-start" : i === last ? "items-end" : "items-center";
            return (
              <li
                key={stop}
                data-stop={i}
                data-state={state}
                aria-current={!live && i === active ? "step" : undefined}
                className={`group relative flex flex-col ${align}`}
              >
                <span
                  aria-hidden
                  className="relative size-[11px] rounded-full border-2 border-ice/40 bg-night transition-colors duration-300 group-data-[state=current]:border-sky group-data-[state=current]:bg-sky group-data-[state=passed]:border-sky"
                />
                <span className="mt-2.5 hidden whitespace-nowrap text-[0.8125rem] font-medium text-ice/60 transition-colors duration-300 group-data-[state=current]:text-ice group-data-[state=passed]:text-mist sm:block">
                  {stop}
                </span>
              </li>
            );
          })}
        </ol>
        {/* Phones have room for only the current stop's name. */}
        <p data-route-current aria-hidden className="mt-2.5 text-[0.8125rem] font-medium text-ice sm:hidden">
          {stops[active]}
        </p>
      </div>
    </div>
  );
}
