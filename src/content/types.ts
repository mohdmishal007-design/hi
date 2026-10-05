import type { ServiceSlug } from "./site";

export type ServiceCopy = {
  name: string;
  summary: string;
  intro: string;
  handles: string[];
  /** Only for services whose work really runs in steps. */
  steps?: string[];
  metaDescription: string;
};

export type Dictionary = {
  meta: { siteName: string; title: string; description: string };
  nav: {
    services: string;
    oilGas: string;
    coverage: string;
    contact: string;
    quote: string;
    menu: string;
    close: string;
    switchLabel: string;
    switchAria: string;
    skip: string;
    home: string;
  };
  story: {
    title: string;
    lead: string;
    ctaQuote: string;
    ctaFollow: string;
    /** Captions for stills S1–S7, in order. The last one is the finale. */
    beats: { title: string; body: string }[];
    ctaWhatsApp: string;
    route: [string, string, string, string, string];
    routeLabel: string;
    stamp: { top: string; bottom: string };
    imageNote: string;
  };
  intro: { title: string; body: string[]; facts: { term: string; detail: string }[] };
  services: {
    title: string;
    lead: string;
    groups: Record<"clearance" | "freight" | "projects", string>;
    more: string;
    items: Record<ServiceSlug, ServiceCopy>;
  };
  oilGas: {
    title: string;
    body: string;
    equipmentTitle: string;
    equipment: string[];
    capabilities: { title: string; body: string }[];
    cta: string;
  };
  coverage: {
    title: string;
    lead: string;
    columns: { mode: "sea" | "air" | "land"; title: string; items: string[] }[];
    networkTitle: string;
    offices: { city: string; country: string; note?: string; home?: boolean }[];
    membershipsTitle: string;
  };
  quote: {
    title: string;
    lead: string;
    fields: {
      name: string;
      company: string;
      email: string;
      phone: string;
      service: string;
      servicePlaceholder: string;
      mode: string;
      modes: Record<"sea" | "air" | "land" | "unsure", string>;
      from: string;
      to: string;
      placeHint: string;
      incoterm: string;
      unsure: string;
      cargo: string;
      cargoTypes: Record<"general" | "dg" | "oog" | "reefer" | "personal", string>;
      weight: string;
      weightHint: string;
      ready: string;
      needs: string;
      needsOptions: Record<"saber" | "clearance" | "importer", string>;
      message: string;
      messageHint: string;
      consent: string;
      consentLink: string;
    };
    optional: string;
    submit: string;
    sending: string;
    sentTitle: string;
    sentBody: string;
    errorTitle: string;
    errorBody: string;
    mailtoTitle: string;
    mailtoBody: string;
    sendAnother: string;
    summaryTitle: string;
    errors: { required: string; email: string; phone: string; consent: string };
  };
  contact: {
    title: string;
    lead: string;
    officeName: string;
    address: string[];
    person: string;
    phone: string;
    email: string;
    whatsapp: string;
    whatsappAction: string;
    hours: string;
    hoursValue: string;
    maps: string;
  };
  footer: {
    tagline: string;
    servicesTitle: string;
    companyTitle: string;
    contactTitle: string;
    about: string;
    privacy: string;
    group: string;
    rights: string;
    cr: string;
    vat: string;
    imageNote: string;
  };
  servicePage: {
    handles: string;
    steps: string;
    related: string;
    ctaTitle: string;
    ctaBody: string;
    ctaButton: string;
    allServices: string;
  };
  privacy: {
    title: string;
    metaDescription: string;
    updated: string;
    sections: { title: string; body: string[] }[];
  };
  notFound: { title: string; body: string; home: string };
};
