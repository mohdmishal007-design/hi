"""Email copy for the Eastern Province outreach sequence.

Three steps: an introduction, a short follow-up, and a last note. Each
sector gets its own opening line so the email reads as written for that
buyer; everything else is shared. Placeholders: {company}, {greeting},
{city}, plus the sender fields from the config.
"""

SECTOR_HOOKS = {
    "Oil & gas services": (
        "We move rig equipment, oversized (OOG) cargo and urgent oilfield spares into Dammam, Jubail and "
        "Ras Al-Khair, including the U.S. → KSA lane through our group office in Houston."
    ),
    "Industrial equipment & trading": (
        "We clear pumps, valves, pipe, fittings and machinery through Dammam and Jubail ports, "
        "and handle the SABER certificates that industrial imports now need."
    ),
    "Chemicals & petrochemicals": (
        "We ship chemicals and dangerous goods (DG) by sea and air into Jubail and Dammam, with the "
        "documentation, SABER and FASAH clearance handled in-house."
    ),
    "General trading": (
        "We help trading houses bring mixed consignments into the Kingdom by sea, air and road, with customs "
        "clearance, SABER certificates and door delivery handled by one team in Dammam."
    ),
    "Building materials & construction": (
        "We bring building materials, finishing products and site equipment into the Eastern Province by FCL, "
        "LCL and breakbulk, and deliver to site across the Kingdom."
    ),
    "Electrical & power": (
        "We import cables, switchgear, transformers and lighting for contractors and distributors, including "
        "the SABER conformity certificates these products require."
    ),
    "Safety & fire protection": (
        "We clear PPE, fire-fighting and safety equipment through Dammam and Jubail, with SABER certificates "
        "arranged before the cargo lands so it does not sit at the port."
    ),
    "Food & FMCG": (
        "We handle reefer and dry food imports into Dammam port, with customs clearance and "
        "temperature-controlled delivery to your warehouse."
    ),
}
DEFAULT_HOOK = (
    "We handle sea, air and land freight into the Eastern Province, with customs clearance, SABER "
    "certificates and delivery handled by our own team in Dammam."
)

SIGNATURE = """{sender_name}
{sender_title}
{sender_company}
{sender_address}
Mobile / WhatsApp: {sender_phone}
{sender_email} | {sender_website}"""

OPT_OUT = "If you'd rather not hear from us, just reply \"remove\" and we won't email you again."

STEPS = {
    1: {
        "subject": "Freight & customs clearance for {company}, from a Dammam forwarder",
        "body": """{greeting}

I'm writing from Lonestar Shipping in Dammam. {hook}

What we do for importers in {city}:
- Sea, air and land freight (FCL, LCL, breakbulk, air charter)
- Customs clearance through FASAH, at Dammam, Jubail and King Fahd Airport
- SABER certificates arranged before your cargo arrives
- Acting as importer of record if a supplier or project lacks a Saudi licence
- Bonded and duty-paid warehousing

If you have a shipment coming up, send me the origin, cargo and Incoterms and I'll come back with a quote promptly. Or tell me who handles logistics or procurement for {company} and I'll contact them directly.

Best regards,
{signature}

{opt_out}""",
    },
    2: {
        "subject": "Re: Freight & customs clearance for {company}, from a Dammam forwarder",
        "body": """{greeting}

Following up on my note last week. If you have any imports coming into Dammam or Jubail in the next few weeks, I'd be glad to quote one of them. That's the easiest way to compare us with your current forwarder.

A quick reply with the origin and cargo type is enough for me to start.

Best regards,
{signature}

{opt_out}""",
    },
    3: {
        "subject": "Re: Freight & customs clearance for {company}, from a Dammam forwarder",
        "body": """{greeting}

This is my last note for now. If freight, customs clearance or SABER certificates ever come up at {company}, you can reach me directly on WhatsApp at {sender_phone}.

Wishing you a good week,
{signature}

{opt_out}""",
    },
}
