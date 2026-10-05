import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    siteName: "Lonestar Shipping Saudi Arabia",
    title: "Lonestar Shipping Saudi Arabia: freight, customs clearance and project logistics",
    description:
      "Lonestar Shipping Co. Ltd in Dammam: sea, air and road freight, FASAH customs clearance, SABER certification and oil & gas project logistics across Saudi Arabia.",
  },
  nav: {
    services: "Services",
    oilGas: "Oil & gas",
    coverage: "Coverage",
    contact: "Contact",
    quote: "Request a quote",
    menu: "Menu",
    close: "Close menu",
    switchLabel: "العربية",
    switchAria: "Read this page in Arabic",
    skip: "Skip to content",
    home: "Lonestar Shipping, home",
  },
  story: {
    title: "Moving the Kingdom’s critical cargo.",
    lead: "Sea, air and road freight, customs clearance and oil & gas project logistics, run from Dammam with a group network in six countries.",
    ctaQuote: "Request a quote",
    ctaFollow: "Follow the shipment",
    beats: [
      {
        title: "Heavy, oversized, on schedule.",
        body: "A drilling top drive is lifted aboard a heavy-lift vessel in Houston: lashed, insured and tracked from the quay.",
      },
      {
        title: "Houston to Dammam.",
        body: "Weeks at sea, with 24/7 tracking and one team following it the whole way.",
      },
      {
        title: "Berthed at King Abdulaziz Port.",
        body: "Discharge, port handling and bonded storage are arranged before the vessel arrives.",
      },
      {
        title: "When it can’t wait, it flies.",
        body: "A critical spare skips the sea leg and lands at King Fahd International, on the next freighter or a charter.",
      },
      {
        title: "Cleared, not queued.",
        body: "FASAH declarations and SABER certificates are prepared in advance, so cargo isn’t left waiting at the gate.",
      },
      {
        title: "The last mile is the hardest. We drive it.",
        body: "Heavy-haul convoys, escorts and permits for out-of-gauge loads, across the Eastern Province to site.",
      },
      {
        title: "Delivered. Rig online.",
        body: "Sea, air, customs and road: one team in Dammam, from quote to site.",
      },
    ],
    ctaWhatsApp: "WhatsApp Dammam",
    route: ["Houston", "Dammam port", "King Fahd Intl", "FASAH", "Rig site"],
    routeLabel: "Shipment route",
    stamp: { top: "FASAH", bottom: "CLEARED" },
    imageNote: "Illustrative images",
  },
  intro: {
    title: "A desk in Dammam. A network in six countries.",
    body: [
      "Lonestar Shipping Co. Ltd is the Saudi company of the Lonestar Shipping group. From our office in Dammam we run freight, customs clearance and project logistics into, out of and across the Kingdom.",
      "Behind us are group offices in the U.A.E., Qatar, the U.S.A., Angola and Hong Kong, and the forwarder networks of WCA, FIATA and JC Trans.",
    ],
    facts: [
      { term: "Office", detail: "Al Waha Downtown Mall, Dammam" },
      { term: "Working week", detail: "Sunday to Thursday, Arabia Standard Time" },
      { term: "Group", detail: "Seven offices in six countries, headquartered in Dubai" },
      { term: "Agency", detail: "Agents in Saudi Arabia, the U.A.E. and Qatar" },
    ],
  },
  services: {
    title: "What we move, clear and store",
    lead: "Nine services, run by one team in Dammam.",
    groups: {
      clearance: "Clearance and compliance",
      freight: "Freight",
      projects: "Projects and equipment",
    },
    more: "Details",
    items: {
      "customs-clearance": {
        name: "Customs clearance",
        summary: "Import and export declarations through FASAH, general or bonded.",
        intro:
          "We prepare and file your import and export declarations on FASAH, the Saudi customs single window, and see the shipment through inspection, duties and release. General and bonded clearance, for full containers, breakbulk and air cargo.",
        handles: [
          "Import and export declarations on FASAH",
          "HS classification and duty estimates before you ship",
          "Inspection and release at ports, airports and land borders",
          "Bonded clearance and transfers between bonded areas",
          "SABER and other product requirements, lined up with the declaration",
          "Freight-collect shipments for overseas agents",
        ],
        steps: [
          "Send us the commercial invoice, packing list and bill of lading or air waybill.",
          "We classify the goods and file the declaration on FASAH.",
          "Inspection, duties and any required certificates are settled with customs.",
          "The cargo is released and delivered to your site or warehouse.",
        ],
        metaDescription:
          "Customs clearance in Saudi Arabia through FASAH: import and export declarations, inspection, duties and release, general and bonded. Lonestar Shipping, Dammam.",
      },
      "saber-certification": {
        name: "SABER certification",
        summary: "Product and shipment certificates for regulated goods entering the Kingdom.",
        intro:
          "Regulated products need SABER certificates before they can clear Saudi customs. We register your products on the SABER platform, work with the conformity assessment bodies, and line up the shipment certificate so it is ready when the cargo arrives.",
        handles: [
          "Product registration on SABER",
          "Product Certificates of Conformity (PCoC)",
          "Shipment Certificates of Conformity (SCoC) for each consignment",
          "Checking which technical regulations apply to your goods",
          "Linking certificates to the FASAH declaration",
        ],
        steps: [
          "Tell us what you are shipping, with HS codes and product details.",
          "We check which regulations apply and register the products on SABER.",
          "The product certificate is issued through a conformity assessment body.",
          "A shipment certificate is issued for each consignment before clearance.",
        ],
        metaDescription:
          "SABER certification for goods entering Saudi Arabia: product registration, PCoC and SCoC certificates, linked to your customs clearance. Lonestar Shipping, Dammam.",
      },
      "import-export-agency": {
        name: "Import and export on your behalf",
        summary: "We act as your agent when you don’t hold a Saudi trading licence.",
        intro:
          "As agents in Saudi Arabia, the U.A.E. and Qatar, we import and export for companies that don’t hold the required trading licence, and handle freight-collect shipments for overseas partners. You get your goods; the paperwork runs through us.",
        handles: [
          "Imports for companies without a Saudi trading licence",
          "Freight-collect shipments for overseas agents",
          "Duties and charges settled at destination",
          "One point of contact from origin to delivery",
        ],
        metaDescription:
          "Import and export in Saudi Arabia without your own trading licence: Lonestar Shipping acts as your agent and handles freight-collect shipments for overseas partners.",
      },
      "sea-freight": {
        name: "Sea freight",
        summary: "Full containers, shared containers and consolidation, into and out of Saudi ports.",
        intro:
          "Full containers, shared containers and consolidated cargo, booked with the lines serving Saudi ports and tied to road delivery at both ends. Commercial, personal and project cargo, at rates we negotiate on volume.",
        handles: [
          "Full container loads (FCL) and less-than-container loads (LCL)",
          "Export and import consolidation",
          "Breakbulk, flat-rack and open-top cargo",
          "Reefer containers for temperature-controlled cargo",
          "Insurance cover on request",
          "Door-to-door delivery, including ex-works pickup",
        ],
        metaDescription:
          "Sea freight to and from Saudi Arabia: FCL, LCL, consolidation, breakbulk and reefer, with door-to-door delivery. Lonestar Shipping, Dammam.",
      },
      "air-freight": {
        name: "Air freight and charter",
        summary: "Consolidation, back-to-back shipments and charters when time matters.",
        intro:
          "Air freight for urgent cargo and spares: consolidated, back-to-back, or on a chartered aircraft when nothing else will make the deadline. Volume shipments move at discounted rates.",
        handles: [
          "Consolidated and back-to-back air freight",
          "Full and part aircraft charters",
          "Urgent spares for rigs and plants",
          "Dangerous goods by air, handled by certified staff",
          "Delivery from the airport to site",
        ],
        metaDescription:
          "Air freight and air charter into Saudi Arabia: consolidation, back-to-back shipments, urgent spares and dangerous goods. Lonestar Shipping, Dammam.",
      },
      "land-freight": {
        name: "Land freight: GCC and Iraq",
        summary: "Trucking across the Kingdom and over the border to neighbouring countries.",
        intro:
          "Road transport inside Saudi Arabia and across borders to the GCC and Iraq, from a single pallet to heavy-haul convoys with escorts and permits for out-of-gauge loads.",
        handles: [
          "Full and part truckloads within the Kingdom",
          "Cross-border road freight to GCC countries and Iraq",
          "Heavy haul with lowbed trailers, escorts and permits",
          "Door-to-door delivery joined to sea and air legs",
        ],
        metaDescription:
          "Road freight in Saudi Arabia and to the GCC and Iraq: full and part loads, heavy haul and out-of-gauge permits. Lonestar Shipping, Dammam.",
      },
      "oil-gas-projects": {
        name: "Oil, gas and project logistics",
        summary: "Rig equipment, heavy lifts and out-of-gauge cargo, planned to the drilling schedule.",
        intro:
          "From a courier shipment to a complete rig move, we plan and run project cargo for upstream, midstream and downstream operations, with heavy-lift carriers, permits for oversize loads, and a team that knows the deadline is a drilling date.",
        handles: [
          "Rig moves and rig components",
          "Heavy-lift and out-of-gauge cargo",
          "OCTG pipe, valves, compressors and pressure equipment",
          "Offshore equipment and subsea components",
          "Exhibition cargo",
        ],
        steps: [
          "A survey and transport plan for each item.",
          "Permits and route checks for oversize loads.",
          "Lift, lash and move by sea, air or road.",
          "Delivery to site, rig or yard, tracked throughout.",
        ],
        metaDescription:
          "Oil and gas project logistics in Saudi Arabia: rig moves, heavy lift and out-of-gauge cargo planned to the drilling schedule. Lonestar Shipping, Dammam.",
      },
      warehousing: {
        name: "Warehousing and port handling",
        summary: "Bonded and duty-paid storage, and handling inside the port area.",
        intro:
          "Indoor and outdoor storage inside the port area before, during and after the vessel call, bonded or duty-paid, and liaison with customs for free-zone areas when spares need a logistics base.",
        handles: [
          "Bonded and duty-paid warehousing",
          "Open yard storage for project cargo",
          "Port handling, discharge and loading",
          "Free-zone areas for spares, arranged with customs",
          "Packing, crating and moving",
        ],
        metaDescription:
          "Bonded and duty-paid warehousing and port handling in Saudi Arabia, with yard storage for project cargo. Lonestar Shipping, Dammam.",
      },
      containers: {
        name: "Container trading and leasing",
        summary: "New and used DNV offshore units, reefers and special equipment.",
        intro:
          "New and used DNV containers and CCUs, reefers, baskets and specialist units for sale or lease, for drilling campaigns, offshore supply and storage.",
        handles: [
          "DNV containers and cargo-carrying units (CCUs)",
          "Reefer and DNV reefer containers",
          "DNV baskets and MudSkips",
          "Flat-racks and open tops",
          "Turbine transfer baskets",
          "Bespoke units, storage and shipping containers",
          "Specialist lifting equipment",
        ],
        metaDescription:
          "DNV offshore containers, CCUs, reefers, baskets and flat-racks for sale or lease in Saudi Arabia. Lonestar Shipping, Dammam.",
      },
    },
  },
  oilGas: {
    title: "Built around the drilling schedule",
    body: "Our core work is oil, gas and industrial project cargo: rig components, pipe, pressure equipment and modules, moved to deadlines set by the rig, not the carrier. The team runs regular moves to rigs and has taken on difficult projects into Iraq.",
    equipmentTitle: "Equipment we move",
    equipment: [
      "Drilling rigs and components: BOPs, top drives, iron roughnecks",
      "OCTG pipe and casing",
      "Valves, flanges and fittings",
      "Compressors, generators and turbines",
      "Pumps and pressure vessels",
      "Offshore equipment and subsea components",
      "Refinery and petrochemical machinery",
      "Skids, modules and fabricated structures",
    ],
    capabilities: [
      { title: "Heavy haul and heavy lift", body: "Oversized, high-value cargo, with permits for out-of-gauge loads." },
      { title: "Tight deadlines", body: "Moves planned to the drilling date and followed on a 24/7 tracking portal." },
      {
        title: "Certified handling",
        body: "Staff certified for hazardous containers and dangerous goods, with full import and export control compliance.",
      },
    ],
    cta: "Plan a project move",
  },
  coverage: {
    title: "Every way into the Kingdom",
    lead: "Sea, air and road, joined up by one team.",
    columns: [
      {
        mode: "sea",
        title: "By sea",
        items: ["King Abdulaziz Port, Dammam", "Jubail Commercial Port", "Jeddah Islamic Port"],
      },
      {
        mode: "air",
        title: "By air",
        items: [
          "King Fahd International Airport, Dammam",
          "King Khalid International Airport, Riyadh",
          "King Abdulaziz International Airport, Jeddah",
        ],
      },
      {
        mode: "land",
        title: "By road",
        items: ["Across the Kingdom, door to door", "To the U.A.E., Qatar and Kuwait", "Project cargo into Iraq"],
      },
    ],
    networkTitle: "Group offices",
    offices: [
      { city: "Dammam", country: "Saudi Arabia", note: "Lonestar Shipping Co. Ltd", home: true },
      { city: "Dubai", country: "U.A.E.", note: "Group headquarters" },
      { city: "Abu Dhabi", country: "U.A.E." },
      { city: "Doha", country: "Qatar" },
      { city: "Houston", country: "U.S.A." },
      { city: "Hong Kong", country: "China" },
      { city: "Luanda", country: "Angola" },
    ],
    membershipsTitle: "Memberships",
  },
  quote: {
    title: "Send us a shipment brief",
    lead: "Tell us what’s moving and where. The Dammam team replies with a quote, or with the questions it needs answered first.",
    fields: {
      name: "Your name",
      company: "Company",
      email: "Email",
      phone: "Phone",
      service: "Service",
      servicePlaceholder: "Choose a service",
      mode: "Mode",
      modes: { sea: "Sea", air: "Air", land: "Road", unsure: "Not sure" },
      from: "From",
      to: "To",
      placeHint: "City and country",
      incoterm: "Incoterm",
      unsure: "Not sure",
      cargo: "Cargo",
      cargoTypes: {
        general: "General cargo",
        dg: "Dangerous goods",
        oog: "Out-of-gauge or heavy lift",
        reefer: "Temperature-controlled",
        personal: "Personal effects",
      },
      weight: "Weight and dimensions",
      weightHint: "For example: 2 crates, 12 t, 6 × 2.5 × 3 m",
      ready: "Ready to ship",
      needs: "We also need",
      needsOptions: {
        saber: "A SABER certificate",
        clearance: "Customs clearance in Saudi Arabia",
        importer: "An importer on our behalf",
      },
      message: "Anything else",
      messageHint: "Details that help us price it",
      consent: "I agree that Lonestar Shipping may use these details to reply to this request, as described in the",
      consentLink: "privacy notice",
    },
    optional: "optional",
    submit: "Send shipment brief",
    sending: "Sending…",
    sentTitle: "Shipment brief sent.",
    sentBody: "The Dammam team will reply by email or phone.",
    errorTitle: "The brief didn’t send.",
    errorBody: "Try again, or email it to",
    mailtoTitle: "Your email app has the brief ready.",
    mailtoBody: "We opened a pre-filled email with your shipment details. Press send there to finish.",
    sendAnother: "Send another brief",
    summaryTitle: "Check these fields",
    errors: {
      required: "{field} is required.",
      email: "Enter an email address like name@company.com.",
      phone: "Enter a phone number we can call, with the country code.",
      consent: "Tick the box so we can reply to your request.",
    },
  },
  contact: {
    title: "Talk to Dammam",
    lead: "Call, write or message us on WhatsApp.",
    officeName: "Lonestar Shipping Co. Ltd",
    address: ["Al Waha Downtown Mall, Office 12, 2nd Floor", "Prince Mohammed Bin Fahad Road", "Dammam, Saudi Arabia"],
    person: "Rayyan Rassal",
    phone: "Phone",
    email: "Email",
    whatsapp: "WhatsApp",
    whatsappAction: "Message us on WhatsApp",
    hours: "Working week",
    hoursValue: "Sunday to Thursday",
    maps: "Open in Google Maps",
  },
  footer: {
    tagline: "Experience the difference.",
    servicesTitle: "Services",
    companyTitle: "Company",
    contactTitle: "Contact",
    about: "About us",
    privacy: "Privacy notice",
    group: "Lonestar Shipping group",
    rights: "© {year} Lonestar Shipping Co. Ltd. All rights reserved.",
    cr: "CR",
    vat: "VAT",
    imageNote: "Images in the shipment story are illustrations.",
  },
  servicePage: {
    handles: "What we handle",
    steps: "How it runs",
    related: "Related services",
    ctaTitle: "Have a shipment in mind?",
    ctaBody: "Send the details and the Dammam team will come back with a quote.",
    ctaButton: "Request a quote",
    allServices: "All services",
  },
  privacy: {
    title: "Privacy notice",
    metaDescription: "How Lonestar Shipping Co. Ltd uses the personal data you send through this website, and your rights under Saudi Arabia’s Personal Data Protection Law.",
    updated: "Last updated 5 October 2026",
    sections: [
      {
        title: "Who we are",
        body: [
          "Lonestar Shipping Co. Ltd, Al Waha Downtown Mall, Office 12, Prince Mohammed Bin Fahad Road, Dammam, Saudi Arabia, is responsible for the personal data collected on this website. You can reach us at rayyan@lonestarshipping.com.",
        ],
      },
      {
        title: "What we collect",
        body: [
          "When you send a shipment brief or contact us, we receive your name, company, email address, phone number and the shipment details you choose to give.",
          "This website does not use advertising or tracking cookies.",
        ],
      },
      {
        title: "Why we use it",
        body: [
          "To answer your request, prepare a quote, and arrange any shipment you book with us. We use your details on the basis of the consent you give when you send the form.",
        ],
      },
      {
        title: "Who sees it",
        body: [
          "Our Dammam team and, where your shipment needs them, other Lonestar Shipping group offices and the carriers, agents and authorities involved in moving and clearing it.",
        ],
      },
      {
        title: "Transfers outside the Kingdom",
        body: [
          "Some shipments involve group offices or partners outside Saudi Arabia. We send your data abroad only when your shipment needs it, and in line with the Personal Data Protection Law and its regulations.",
        ],
      },
      {
        title: "How long we keep it",
        body: [
          "We keep enquiry details for as long as we need them to answer you. If you ship with us, we keep shipment records for as long as Saudi law requires, then delete them.",
        ],
      },
      {
        title: "Your rights",
        body: [
          "Under the Personal Data Protection Law you can ask how we use your data, get a copy of it, have it corrected or deleted, and withdraw your consent. Write to rayyan@lonestarshipping.com and we will reply within the period the law sets.",
        ],
      },
      {
        title: "Changes to this notice",
        body: ["We post any change to this notice on this page, with a new date."],
      },
    ],
  },
  notFound: {
    title: "This page isn’t here.",
    body: "The link may be old, or the address mistyped.",
    home: "Go to the home page",
  },
};
