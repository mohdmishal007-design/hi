/**
 * Facts that do not change between languages. Everything here traces to the
 * company profile; values still to be supplied by Lonestar are empty and the
 * UI hides them until they are filled in.
 */
export const site = {
  phone: "+966 53 502 2995",
  phoneHref: "tel:+966535022995",
  whatsappHref: "https://wa.me/966535022995",
  email: "rayyan@lonestarshipping.com",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Al+Waha+Downtown+Mall+Prince+Mohammed+Bin+Fahad+Road+Dammam",
  groupSite: "https://www.lonestarshipping.com/",
  /** Commercial Registration and VAT numbers: shown in the footer once supplied. */
  crNumber: "",
  vatNumber: "",
  /** Optional form endpoint (e.g. a form service). Without it the form opens a pre-filled email. */
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
};

export const serviceSlugs = [
  "customs-clearance",
  "saber-certification",
  "import-export-agency",
  "sea-freight",
  "air-freight",
  "land-freight",
  "oil-gas-projects",
  "warehousing",
  "containers",
] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

/** How the services index groups them. */
export const serviceGroups: { id: "clearance" | "freight" | "projects"; slugs: ServiceSlug[] }[] = [
  { id: "clearance", slugs: ["customs-clearance", "saber-certification", "import-export-agency"] },
  { id: "freight", slugs: ["sea-freight", "air-freight", "land-freight"] },
  { id: "projects", slugs: ["oil-gas-projects", "warehousing", "containers"] },
];

export const memberships = ["WCA", "FIATA", "JC Trans", "IATA"] as const;

/**
 * Story beats in scroll order. `still` indexes public/img/story/s{n}-*.webp and is
 * the poster, the reduced-motion image and the data-saver image. `clip` names a
 * frame sequence in public/frames/ and the span of story time it plays across
 * (time runs 0 → beats-1+tail; beat b is centred at b).
 */
export type StoryBeat = { still: number; clip?: { id: string; from: number; to: number } };

const crossing = { id: "c2", from: 1.45, to: 3.55 };

export const storyBeats: StoryBeat[] = [
  { still: 1 },
  { still: 1, clip: { id: "c1", from: 0.5, to: 1.55 } },
  { still: 2, clip: crossing },
  { still: 3, clip: crossing },
  { still: 4, clip: { id: "c3", from: 3.45, to: 4.6 } },
  { still: 5, clip: { id: "c4", from: 4.45, to: 5.6 } },
  { still: 6, clip: { id: "c5", from: 5.45, to: 6.6 } },
  { still: 7, clip: { id: "c6", from: 6.45, to: 7.6 } },
];

/** Extra scroll after the last beat, in beats, so the finale clip and its call to action can breathe. */
export const STORY_TAIL = 0.6;
