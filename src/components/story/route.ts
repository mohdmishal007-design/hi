/**
 * Story timeline maths, shared by the static (stacked) and scrubbed (film)
 * renderings. Time `t` runs from 0 (first beat) to beats-1 (last beat).
 */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeOutCubic = (v: number) => 1 - Math.pow(1 - v, 3);

/** Beat index at which the route reaches each stop: Houston, Dammam port, King Fahd Intl, FASAH, rig. */
const STOP_AT_BEAT = [1, 3, 4, 5, 7];
export const STOP_POSITIONS = [0, 0.25, 0.5, 0.75, 1];

/** How far along the route line (0–1) the shipment is at time t. */
export function routeProgress(t: number) {
  if (t <= STOP_AT_BEAT[0]) return 0;
  for (let i = 1; i < STOP_AT_BEAT.length; i++) {
    const a = STOP_AT_BEAT[i - 1];
    const b = STOP_AT_BEAT[i];
    if (t <= b) {
      const local = (t - a) / (b - a);
      return STOP_POSITIONS[i - 1] + local * (STOP_POSITIONS[i] - STOP_POSITIONS[i - 1]);
    }
  }
  return 1;
}

/** Index of the last stop the shipment has reached. */
export const activeStop = (fill: number) => STOP_POSITIONS.filter((p) => fill >= p - 0.001).length - 1;

/** The customs beat, where the FASAH stamp lands. */
export const STAMP_BEAT = 5;
