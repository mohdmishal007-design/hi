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

/** Story frames in scroll order. `still` indexes public/img/story/s{n}-*.webp. */
export const storyStills = [1, 1, 2, 3, 4, 5, 6, 7] as const;
