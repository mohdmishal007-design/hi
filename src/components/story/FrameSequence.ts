/**
 * A WebP frame sequence (public/frames/<clip>/<variant>/) scrubbed onto a canvas.
 * Compressed frames stay resident; decoded frames live only in a window around
 * the playhead. Adapted from the scroll-site-generator skill's useFrameSequence.
 */

type Frame = { kind: "bitmap"; img: ImageBitmap } | { kind: "element"; img: HTMLImageElement; url: string };

/**
 * createImageBitmap is the fast path but can throw in hidden tabs and some
 * webviews; an <img> decodes everywhere. drawImage accepts both.
 */
async function decodeBlob(blob: Blob): Promise<Frame> {
  try {
    return { kind: "bitmap", img: await createImageBitmap(blob) };
  } catch {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("frame decode failed"));
      img.src = url;
    });
    return { kind: "element", img, url };
  }
}

function release(f: Frame) {
  if (f.kind === "bitmap") f.img.close();
  else URL.revokeObjectURL(f.url);
}

const AHEAD = 10;
const KEEP = 24;

export class FrameSequence {
  private blobs: (Blob | null)[] = [];
  private frames = new Map<number, Frame>();
  private decoding = new Set<number>();
  private count = 0;
  private loading: Promise<void> | null = null;
  private disposed = false;
  /** Called when a newly decoded frame could change what is on screen. */
  onFrame: (() => void) | null = null;

  constructor(private readonly base: string) {}

  load() {
    if (this.loading) return this.loading;
    this.loading = (async () => {
      const manifest = await fetch(`${this.base}manifest.json`).then((r) => r.json());
      if (this.disposed) return;
      this.count = manifest.count;
      this.blobs = new Array(this.count).fill(null);
      const url = (i: number) => this.base + String(manifest.pattern).replace("%03d", String(i + 1).padStart(3, "0"));
      const fetchOne = async (i: number) => {
        try {
          const res = await fetch(url(i));
          if (res.ok && !this.disposed) this.blobs[i] = await res.blob();
        } catch {
          /* a missing frame falls back to its nearest neighbour */
        }
      };
      await fetchOne(0);
      this.decode(0);
      let next = 1;
      const worker = async () => {
        while (next < this.count && !this.disposed) await fetchOne(next++);
      };
      await Promise.all(Array.from({ length: 6 }, worker));
    })();
    return this.loading;
  }

  private decode(i: number) {
    if (this.frames.has(i) || this.decoding.has(i) || !this.blobs[i]) return;
    this.decoding.add(i);
    decodeBlob(this.blobs[i]!)
      .then((f) => {
        if (this.disposed) return release(f);
        this.frames.set(i, f);
        this.onFrame?.();
      })
      .catch(() => {})
      .finally(() => this.decoding.delete(i));
  }

  private window(center: number) {
    for (let d = 0; d <= AHEAD; d++) {
      if (center + d < this.count) this.decode(center + d);
      if (center - d >= 0) this.decode(center - d);
    }
    if (this.frames.size > KEEP * 2) {
      for (const [i, f] of this.frames) {
        if (Math.abs(i - center) > KEEP) {
          release(f);
          this.frames.delete(i);
        }
      }
    }
  }

  private nearest(i: number): Frame | null {
    if (this.frames.has(i)) return this.frames.get(i)!;
    for (let d = 1; d < this.count; d++) {
      if (this.frames.has(i - d)) return this.frames.get(i - d)!;
      if (this.frames.has(i + d)) return this.frames.get(i + d)!;
    }
    return null;
  }

  /** Draw the frame at progress 0–1, cover-fit. Returns false while nothing is decoded yet. */
  draw(canvas: HTMLCanvasElement, progress: number) {
    if (!this.count) return false;
    const i = Math.round(Math.min(1, Math.max(0, progress)) * (this.count - 1));
    this.window(i);
    const frame = this.nearest(i);
    if (!frame) return false;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(canvas.clientWidth * dpr);
    const ch = Math.round(canvas.clientHeight * dpr);
    if (!cw || !ch) return false;
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const src = frame.img;
    const s = Math.max(cw / src.width, ch / src.height);
    const w = src.width * s;
    const h = src.height * s;
    ctx.drawImage(src, (cw - w) / 2, (ch - h) / 2, w, h);
    return true;
  }

  dispose() {
    this.disposed = true;
    this.frames.forEach(release);
    this.frames.clear();
    this.blobs = [];
  }
}
