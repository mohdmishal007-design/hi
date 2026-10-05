# Lonestar Shipping KSA — Website Plan

Status: **draft for review**. Nothing is built yet. Section 3 lists the decisions to make before we start.

---

## 1. Goal

Build a Saudi website for **Lonestar Shipping Co. Ltd (Dammam)** that brings in Saudi B2B logistics enquiries.

It should not be a copy of the group site with a new address. It should lead with what is specific to Saudi Arabia:

- customs clearance through FASAH (ZATCA)
- SABER certification for regulated products
- importing on behalf of clients who don't hold a trading licence
- Eastern Province oil & gas project cargo
- GCC land freight

It should be fully bilingual (Arabic + English, RTL done properly) and keep the group's look and feel.

## 2. What we're starting from

### Company profile (PDF, 8 pages)
- **15 services:** agency representation, sea/air freight, air charter, break bulk, customs clearance (general/bonded), door-to-door, road transport, freight forwarding, freight consultancy, port handling, project movement, packing & moving, reefer, warehousing (bonded & duty paid), oil & gas project handling.
- **Oil & gas scope:** rigs, BOPs, top drives, OCTG, valves, compressors, turbines, subsea, skids/modules, plus heavy-lift and out-of-gauge (OOG) cargo.
- **Container trading & leasing:** DNV containers/CCUs, reefers, baskets, MudSkips, flatracks, turbine transfer baskets, bespoke units.
- **Points that apply to Saudi:**
  - SABER certification handling
  - "acting as agents in the U.A.E., Qatar and Saudi Arabia" for clients without trading licences
  - Iraq project experience
  - exhibition cargo
- **Values:** Integrity, Honesty, Transparency, Communication.
- **Memberships / claims:** WCA, FIATA, JC Trans, IATA agent, "ISO quality".
- **KSA office:** Lonestar Shipping Co Ltd, Al Waha Downtown Mall, Office 12, 2nd Floor, Prince Mohammed Bin Fahad Road, Dammam. Contact: Rayyan Rassal, +966 53 502 2995, rayyan@lonestarshipping.com.

### Current group site (lonestarshipping.com)
- **Stack:** Next.js (App Router).
- **Brand colours:** dark navy `#050b16` / `#081226`, blue `#2f80e0` / `#4fa8ff`, light `#eaf1fb`.
- **Fonts:** Manrope (body) and Sora (headings).
- **Homepage:** hero video → stats → air/sea/land → who we are → 9 services → oil & gas division → global footprint → "Lonestar Advantage" → quote form. Also has WhatsApp, a careers page and an EN/العربي toggle.
- **Arabic has no URL of its own** (`/ar` returns 404). Search engines probably only index the English site. The Saudi site needs to fix this, because Arabic search traffic matters in KSA.

### Content conflicts to settle before we write copy

| Item | Profile PDF | Live site |
|---|---|---|
| Experience | "15+ years" | "20+ years" |
| Dubai HQ address | Office 1203, Mai Tower, Al Nahda 2 | Suite 1511, Mai Tower, Al Nahda 1 |
| Memberships | WCA, FIATA, JC Trans, IATA, ISO | WCA, JC Trans, IAF, ICV logos |
| Footprint | "6 countries" | "7 regional hubs" (7 offices in 6 countries: these agree) |

We should only show a certification on the Saudi site if Lonestar can send the certificate or member ID. This applies especially to ISO, FIATA, IATA and any customs-broker licence.

## 3. Decisions needed (my recommendation first)

1. **Domain**
   - **Recommended:** a separate Saudi domain (`lonestarshipping.sa` or `.com.sa`). Registering one needs the Saudi CR.
   - Fallback: `ksa.lonestarshipping.com`.
   - Either way, the two sites link to each other ("Part of Lonestar Shipping group" ↔ "Saudi Arabia office").
2. **Language**
   - **Recommended:** Arabic and English both at full quality from launch, each on its own URL (`/ar/...`, `/en/...`), with `/` redirecting by browser language.
   - Open question: which language is the default? I lean **Arabic default** on a `.sa` domain. Many oil & gas procurement teams work in English, though, so English is a fair choice too.
   - The Arabic must be a professional translation, reviewed by a native speaker. No machine translation.
3. **Stack and hosting**
   - **Recommended:** Next.js + TypeScript + Tailwind, statically exported. This matches the group site, so components and the brand can be shared, and it's cheap and fast to host.
   - Host on Vercel or Cloudflare Pages.
   - If Lonestar wants enquiry data kept in the Kingdom (see the PDPL note in §6), host in a KSA region instead.
4. **Visual direction**
   - **Recommended:** the same brand system as the group site (navy/blue, Manrope/Sora) with an Arabic font pair (e.g. IBM Plex Sans Arabic or Noto Kufi Arabic).
   - Use Saudi imagery: Dammam port, Eastern Province, GCC road freight. Avoid generic stock photos.
5. **Scope of v1**
   - **Recommended:** a marketing site plus a quote form and WhatsApp.
   - The profile mentions a "24/7 cargo tracking portal". If one exists we link to it. Building one is out of scope for v1.

## 4. How the Saudi site will stand out

The Saudi angle shows up in the services list, the copy and the SEO keywords:

- **Customs clearance (FASAH):** import/export, bonded and duty-paid, at Dammam, Jubail, Riyadh and Jeddah. *Need to confirm whether the KSA entity holds its own ZATCA customs-broker licence or uses partners.*
- **SABER certification support:** product and shipment certificates of conformity (PCoC / SCoC). This is a common pain point for anyone importing into KSA, so it gets a strong page of its own and good search traffic.
- **Import/export on behalf:** for foreign suppliers and companies without a Saudi trading licence. This is a real differentiator in the profile.
- **Oil & gas / project logistics:** Eastern Province focus (Dammam, Jubail, Ras Tanura, Khobar), OOG and heavy-lift cargo, rig moves, offshore container units.
- **GCC & Iraq land freight:** UAE (Al Batha), Qatar (Salwa), Bahrain (King Fahd Causeway), Kuwait, Iraq (Arar). *Ops to confirm which crossings they actually run.*
- **Ports & airports map:** King Abdulaziz Port Dammam, Jubail, Ras Al-Khair, Jeddah Islamic Port, plus the DMM, RUH and JED airports. The group's 7 offices are shown as the wider network.
- **Containers (trading & leasing):** DNV CCUs, baskets and reefers for offshore work.
- **Exhibition & event cargo:** relevant given the events calendar in Riyadh (if they want to pursue it).
- **Trust signals buyers in KSA look for:**
  - CR and VAT numbers in the footer
  - official Arabic trade name, exactly as on the CR
  - Aramco vendor / IKTVA status, if they have it
  - Asharqia Chamber membership, if any
  - real KSA team photos

## 5. Sitemap (v1)

```
/ar  and  /en  (same structure in both)
├── Home
├── About (the KSA company, group & network, values)
├── Services
│   ├── Customs Clearance (FASAH, general & bonded)
│   ├── SABER Certification
│   ├── Import / Export on Behalf (agency)
│   ├── Sea Freight (FCL / LCL / consolidation)
│   ├── Air Freight & Air Charter
│   ├── Land Freight — GCC & Iraq
│   ├── Oil & Gas and Project Logistics (break bulk, OOG, heavy lift)
│   ├── Warehousing & Port Handling (bonded & duty paid)
│   └── Containers — Trading & Leasing
├── Industries (Oil & Gas · Industrial & Construction · Exhibitions · Reefer/Food, only those they serve)
├── Coverage (KSA ports/borders map + global network + memberships)
├── Request a Quote
├── Contact (Dammam office, map, WhatsApp, Sun–Thu hours, AST)
├── Privacy Policy (PDPL) · Terms
└── (Careers → link to group careers page)
```

The 15 services in the PDF fold into 9 pages. Door-to-door, packing & moving, reefer, road transport, consultancy and agency become sections inside those pages.

**Quote form fields:**
- name, company, email, phone (+966 default)
- service and mode
- origin and destination
- Incoterm
- cargo type: general / DG / OOG / reefer
- weight/volume
- checkboxes: "Need SABER?" and "Need customs clearance?"
- message and attachment
- PDPL consent checkbox

## 6. Saudi-specific requirements

- **Proper RTL:** mirrored layout, CSS logical properties, mirrored icons/arrows where direction matters. Numbers, phone numbers and emails must stay readable left-to-right inside Arabic text.
- **Local conventions:**
  - Sun–Thu working week, times in AST (UTC+3)
  - +966 phone format
  - WhatsApp as the main contact button
  - Western digits are fine for business use
- **Maps:** use maps that show official Saudi boundaries. This is a sensitive point in the region.
- **PDPL (Saudi Personal Data Protection Law):**
  - a privacy notice in both languages
  - explicit consent on the forms
  - a stated retention period for enquiries
  - a check on cross-border transfer rules if form data is stored or processed outside KSA
- **Cultural fit:** check every image and piece of copy for local appropriateness.
- **Local SEO:**
  - Arabic keyword targets (e.g. شركة شحن في الدمام، تخليص جمركي، شهادة سابر)
  - `hreflang` tags for ar-SA / en-SA
  - schema.org `LocalBusiness` with both company names
  - Google Business Profile for the Dammam office
  - Google Search Console

## 7. Technical plan

- **Framework:** Next.js (App Router, static export), TypeScript, Tailwind using logical utilities (`ms-*`, `pe-*`, `start-*`).
- **i18n:** `next-intl` with locale routes. Content lives in typed per-locale files (JSON/MDX), so copy edits never touch components.
- **Components:** header with language switcher (switches to the same page in the other language), hero, stats, service cards, service detail template, coverage map, membership strip, quote form, WhatsApp button, footer with CR/VAT.
- **Forms:** a serverless function or form service, sending email to the KSA sales inbox. Spam protection with Cloudflare Turnstile.
- **SEO:**
  - per-locale metadata and OG images
  - `sitemap.xml` with alternate-language links
  - `robots.txt`
  - JSON-LD structured data
- **Quality bar:**
  - Lighthouse ≥ 90 on mobile
  - WCAG 2.2 AA in both directions
  - subset Arabic fonts and AVIF/WebP images
  - hero video with a poster image and a reduced-motion fallback
- **Analytics:** GA4 or Plausible, behind a consent banner.
- **CI:** lint, typecheck, build and link-check on every push. Preview deploys for review.

## 8. What we need from Lonestar

- [ ] Logo as SVG (EN + AR versions if they exist) and brand guidelines
- [ ] Official Arabic trade name, CR number, VAT number
- [ ] Confirmation of KSA services, the ports and border crossings they cover, and their customs-broker licence status
- [ ] Certificates / member IDs: WCA, FIATA, JC Trans, IATA, ISO, IAF/ICV, Aramco/IKTVA
- [ ] Final figures: years of experience, offices, team size, shipments/TEUs (if they want to show any)
- [ ] KSA photos: office, team, warehouse, operations, project cargo
- [ ] 2–4 case studies, plus permission to name clients or show their logos
- [ ] Who receives website leads (email routing) and WhatsApp number(s)
- [ ] Tracking portal URL, if one exists
- [ ] Domain choice, and who owns the DNS

## 9. Phases

1. **Discovery:** agree the decisions in §3, collect the content in §8, settle the conflicts in §2.
2. **Structure & design:** final sitemap, wireframes for Home, Service and Quote, and a design direction shown in both LTR and RTL.
3. **Build (EN first):**
   - scaffold, i18n/RTL foundation, components, all pages
   - quote form
   - preview deploy
4. **Arabic:**
   - professional translation, then native review
   - full RTL QA on mobile and desktop
5. **Hardening:** SEO, structured data, PDPL privacy page and consent, analytics, accessibility and performance passes, cross-browser QA.
6. **Launch:**
   - domain/DNS/SSL
   - Search Console, sitemap, Google Business Profile
   - cross-links with the group site
   - handover notes for editing content

**Later (not v1):** tracking portal integration, rate calculator / online booking, news/blog, careers listings for KSA.
