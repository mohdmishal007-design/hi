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

## Swapping the stills for video clips

The story runs on stills today. When the Flow drafts or Higgsfield final clips arrive, they replace the stills chapter by chapter; captions and timing stay as they are. The clip prompts and frame assignments are in `hero/STORYBOARD.md`.

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
