# Lonestar Shipping — Saudi Arabia website

Bilingual (English / Arabic RTL) marketing site for **Lonestar Shipping Co. Ltd, Dammam**.

The homepage opens with a scroll-driven shipment story, "Houston to the Rig": a top drive travels by sea to Dammam, an urgent spare flies in, customs clears it through FASAH, and a convoy delivers it to a rig. Below the story are the homepage sections.

- **Stack:** Next.js (App Router, static export), TypeScript, Tailwind CSS v4, GSAP ScrollTrigger, Lenis.
- **Planning documents:** `PLAN.md` (site plan) and `hero/STORYBOARD.md` (story and video prompts).

## Run

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /en/ or /ar/
npm run build        # static site in out/
npm start            # serve out/ locally
npm run images       # rebuild public/img from hero/stills after changing a still
npm run typecheck
```

`/` routes to `/ar/` or `/en/` from the browser's language. Visitors with no preference get **English**; to change that, edit `defaultLocale` in `src/lib/i18n.ts`.

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public origin, for canonical URLs, `hreflang` links, the sitemap and social cards. Set it once the domain is chosen. |
| `NEXT_PUBLIC_FORM_ENDPOINT` | Optional URL that receives the quote form as JSON (for example a form service). Without it, the form opens a pre-filled email to the Dammam inbox. |

## Where things live

| Path | What |
|---|---|
| `src/content/en.ts`, `src/content/ar.ts` | All copy, in both languages (typed by `src/content/types.ts`) |
| `src/content/site.ts` | Phone, email, WhatsApp, maps link, CR/VAT numbers, service list, memberships |
| `src/components/story/` | The scroll story: frames, route line, FASAH stamp, timing maths |
| `src/components/home/` | Homepage sections and the quote form |
| `src/app/[locale]/` | Pages: home, `services/[slug]`, `privacy` |
| `hero/stills/` | The 7 story stills (Higgsfield, Seedream 5.0 Flash) and reused candidates; job IDs in `manifest.json` |
| `scripts/build_images.py` | Crops and compresses stills into `public/img` |

## Story clips

Each chapter of the story plays a short clip as a scroll-scrubbed WebP frame sequence. The still stays underneath as the poster, the reduced-motion image and the data-saver image.

| Beat | Clip | Used span | Notes |
|---|---|---|---|
| Sea: loading | C1 | 0–2.25 s | Lightning appears from ~2.3 s (a lift during lightning reads as a safety breach), so it's cut |
| Crossing → Dammam port | C2 | full 8 s | Spans two beats (S2 → S3) |
| Air | C3 | full 8 s | |
| Customs | C4 | full 8 s | Barrier lifts, truck drives through; the FASAH stamp lands on the caption |
| Road | C5 | full 8 s | |
| Finale | C6 | 0–2.7 s | From ~2.8 s the rig turns into a column of light, so it's cut. Worth a re-roll. |

- **Sources:** Google Flow (Veo 3.1 Fast) drafts in `hero/drafts/C1.mp4` … `C6.mp4`. They are git-ignored (keep the originals). Prompts are in `hero/clips.json` and `hero/STORYBOARD.md`. No visible watermark was found in the frames checked.
- **Rebuild:** `python3 scripts/build_frames.py` writes `public/frames/<clip>/wide|tall/` at 10 fps:
  - 1280 px wide for landscape screens
  - a 608×1080 crop that follows the subject, for phones
- **Timing:** which beat plays which clip, and over which stretch of scroll, is set in `storyBeats` in `src/content/site.ts`.
- **Weight:** about 17 MB of frames on desktop and 12 MB on phones, fetched chapter by chapter as the visitor approaches. Visitors with data saver on get stills only.

## Artifact preview (claude.ai)

`npx next build && python3 scripts/build_artifact.py` packages the site into `artifact/` for the claude.ai preview.
- **Branding:** claude.ai artifacts can't carry a real company's identity, so the script swaps the company name, logo and contact details for placeholders. It fails if any real detail survives.
- **Runtime:** Next's runtime is dropped. `scripts/artifact/site.js` runs the story, header, menu and form instead.
- **Clips:** phones use the wide frames, cropped to fit.

## Before launch: still needed from Lonestar

- [ ] Official Arabic trade name, as on the CR (`لون ستار للشحن` is a working name), plus the CR and VAT numbers (`src/content/site.ts`; the footer shows them once filled in)
- [ ] Native Arabic review of `src/content/ar.ts`, and the Arabic spelling of the contact person's name
- [ ] Member numbers for WCA, FIATA, JC Trans and IATA. Remove any membership that can't be shown.
- [ ] Confirm the ports, airports and border routes listed under Coverage, and whether the KSA entity holds its own customs-broker licence
- [ ] Years of experience: the profile says 15+, the group site says 20+. The site currently states no figure.
- [ ] Legal review of the PDPL privacy notice (`privacy` in both content files)
- [ ] Real operations photos to replace or sit beside the illustrative stills (labelled "Illustrative images" on the site)
- [ ] SVG version of the logo
- [ ] Domain, hosting, and a form endpoint (or keep the email fallback)
