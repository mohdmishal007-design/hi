import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, Plane, Ship, Truck } from "lucide-react";
import Link from "next/link";
import { serviceIcons } from "@/components/serviceIcons";
import type { Dictionary } from "@/content";
import QuoteForm from "./QuoteForm";
import { memberships, serviceGroups, serviceSlugs as serviceSlugsInOrder, site } from "@/content/site";
import { href, type Locale } from "@/lib/i18n";

type Props = { locale: Locale; t: Dictionary };

const shell = "mx-auto w-full max-w-[90rem] px-5 sm:px-8";
const h2 = "tight text-[clamp(2.1rem,4vw,3.6rem)] font-semibold leading-[1.05]";

export function About({ t }: Props) {
  const c = t.intro;
  return (
    <section id="about" className="scroll-mt-20 py-24 sm:py-32">
      <div className={`${shell} grid gap-x-12 gap-y-10 lg:grid-cols-12`}>
        <h2 className={`${h2} lg:col-span-7 lg:text-[clamp(2.4rem,4.6vw,4.25rem)]`}>{c.title}</h2>
        <div className="space-y-5 text-lg leading-relaxed text-mist lg:col-span-5 lg:pt-2">
          {c.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <dl className="grid border-t border-hull sm:grid-cols-2 lg:col-span-12 lg:mt-6 lg:grid-cols-4">
          {c.facts.map((f) => (
            <div key={f.term} className="border-b border-hull py-6 sm:pe-8 lg:border-b-0">
              <dt className="text-sm text-dim">{f.term}</dt>
              <dd className="mt-2 font-display text-lg font-medium leading-snug">{f.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Services({ locale, t }: Props) {
  const s = t.services;
  return (
    <section id="services" className="scroll-mt-20 border-t border-hull bg-deep py-24 sm:py-32">
      <div className={shell}>
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
          <h2 className={`${h2} max-w-[18ch]`}>{s.title}</h2>
          <p className="max-w-[26rem] text-lg text-mist">{s.lead}</p>
        </div>

        <div className="mt-16 grid gap-x-12 gap-y-14 lg:grid-cols-3">
          {serviceGroups.map((g) => (
            <div key={g.id}>
              <h3 className="font-display text-base font-semibold text-sky">{s.groups[g.id]}</h3>
              <ul className="mt-5 divide-y divide-hull border-y border-hull">
                {g.slugs.map((slug) => {
                  const Icon = serviceIcons[slug];
                  const item = s.items[slug];
                  return (
                    <li key={slug}>
                      <Link
                        href={href(locale, `/services/${slug}/`)}
                        className="group grid grid-cols-[auto_1fr_auto] items-start gap-4 py-5"
                      >
                        <Icon aria-hidden size={22} strokeWidth={1.6} className="mt-0.5 text-sky" />
                        <span>
                          <span className="snug block font-display text-lg font-semibold leading-snug group-hover:underline">
                            {item.name}
                          </span>
                          <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-mist">{item.summary}</span>
                        </span>
                        <ArrowUpRight
                          aria-hidden
                          size={20}
                          className="flip-rtl mt-1 text-dim transition-colors group-hover:text-ice"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OilGas({ t }: Props) {
  const o = t.oilGas;
  return (
    <section id="oil-gas" className="scroll-mt-20 py-24 sm:py-32">
      <div className={`${shell} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
        <figure className="lg:col-span-5">
          <img
            src="/img/sections/topdrive.webp"
            alt=""
            width={1267}
            height={1584}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full object-cover"
          />
        </figure>

        <div className="lg:col-span-7 lg:pt-4">
          <h2 className={h2}>{o.title}</h2>
          <p className="mt-6 max-w-[40rem] text-lg leading-relaxed text-mist">{o.body}</p>

          <div className="mt-12 grid gap-8 border-t border-hull pt-8 sm:grid-cols-3">
            {o.capabilities.map((c) => (
              <div key={c.title}>
                <h3 className="snug font-display text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-mist">{c.body}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-14 font-display text-base font-semibold text-sky">{o.equipmentTitle}</h3>
          <ul className="mt-4 grid gap-x-10 sm:grid-cols-2">
            {o.equipment.map((e) => (
              <li key={e} className="flex gap-3 border-b border-hull py-3.5 text-[0.9375rem] leading-relaxed">
                <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 bg-sky" />
                {e}
              </li>
            ))}
          </ul>

          <a href="#quote" data-quote-service="oil-gas-projects" className="btn btn-solid mt-10">
            {o.cta}
          </a>
        </div>
      </div>
    </section>
  );
}

const modeIcons = { sea: Ship, air: Plane, land: Truck };

export function Coverage({ t }: Props) {
  const c = t.coverage;
  return (
    <section id="coverage" className="scroll-mt-20 border-t border-hull bg-deep">
      <div className="relative isolate flex min-h-[26rem] items-end overflow-hidden sm:min-h-[34rem]">
        <img
          src="/img/sections/port-arrival.webp"
          alt=""
          width={1400}
          height={787}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-deep via-deep/55 to-deep/10" />
        <div className={`${shell} pb-12 sm:pb-16`}>
          <h2 className={`${h2} max-w-[16ch]`}>{c.title}</h2>
          <p className="mt-4 max-w-[30rem] text-lg text-mist">{c.lead}</p>
        </div>
      </div>

      <div className={`${shell} pb-24 pt-14 sm:pb-32`}>
        <div className="grid gap-12 md:grid-cols-3">
          {c.columns.map((col) => {
            const Icon = modeIcons[col.mode];
            return (
              <div key={col.mode}>
                <h3 className="flex items-center gap-3 font-display text-xl font-semibold">
                  <Icon aria-hidden size={22} strokeWidth={1.6} className="text-sky" />
                  {col.title}
                </h3>
                <ul className="mt-5 divide-y divide-hull border-t border-hull">
                  {col.items.map((item) => (
                    <li key={item} className="py-3.5 text-[0.9375rem] leading-relaxed text-ice/90">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h3 className="font-display text-base font-semibold text-sky">{c.networkTitle}</h3>
            <ul className="mt-5 grid grid-cols-2 gap-px border border-hull bg-hull sm:grid-cols-3 lg:grid-cols-4">
              {c.offices.map((o) => (
                <li key={o.city} className="bg-deep px-4 py-4" data-home={o.home || undefined}>
                  <p className="flex items-center gap-2 font-display text-lg font-semibold">
                    {o.home && <MapPin aria-hidden size={16} className="text-sky" />}
                    {o.city}
                  </p>
                  <p className="text-sm text-mist">{o.country}</p>
                  {o.note && <p className="mt-1 text-sm text-dim">{o.note}</p>}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-4">
            <h3 className="font-display text-base font-semibold text-sky">{c.membershipsTitle}</h3>
            <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-3 font-display text-2xl font-semibold text-ice/85">
              {memberships.map((m) => (
                <li key={m} className="ltr">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact({ t }: Props) {
  const c = t.contact;
  const rows = [
    { icon: Phone, label: c.phone, value: site.phone, to: site.phoneHref, ltr: true },
    { icon: Mail, label: c.email, value: site.email, to: `mailto:${site.email}`, ltr: true },
    { icon: MessageCircle, label: c.whatsapp, value: c.whatsappAction, to: site.whatsappHref, ltr: false },
  ];
  return (
    <section id="contact" className="scroll-mt-20 border-t border-hull">
      <div className="grid lg:grid-cols-2">
        <div className="min-w-0 px-5 py-24 sm:px-8 sm:py-32 lg:ps-[max(2rem,calc((100vw_-_90rem)/2_+_2rem))] lg:pe-16">
          <h2 className={h2}>{c.title}</h2>
          <p className="mt-4 text-lg text-mist">{c.lead}</p>

          <address className="mt-10 not-italic">
            <p className="font-display text-xl font-semibold">{c.officeName}</p>
            {c.address.map((line) => (
              <p key={line} className="text-mist">
                {line}
              </p>
            ))}
            <p className="mt-3 text-mist">
              <span className="ltr">{c.person}</span>
            </p>
          </address>

          <ul className="mt-8 divide-y divide-hull border-y border-hull">
            {rows.map((r) => (
              <li key={r.label}>
                <a href={r.to} className="group flex items-center gap-4 py-4" rel={r.to.startsWith("http") ? "noopener" : undefined}>
                  <r.icon aria-hidden size={20} strokeWidth={1.6} className="text-sky" />
                  <span className="w-24 shrink-0 text-sm text-dim sm:w-28">{r.label}</span>
                  <span className={`min-w-0 text-base [overflow-wrap:anywhere] group-hover:underline sm:text-lg ${r.ltr ? "ltr tabular" : ""}`}>{r.value}</span>
                </a>
              </li>
            ))}
            <li className="flex items-center gap-4 py-4">
              <span aria-hidden className="w-5" />
              <span className="w-24 shrink-0 text-sm text-dim sm:w-28">{c.hours}</span>
              <span className="text-base sm:text-lg">{c.hoursValue}</span>
            </li>
          </ul>

          <a href={site.mapsHref} rel="noopener" className="btn btn-quiet mt-8">
            <MapPin aria-hidden size={18} />
            {c.maps}
          </a>
        </div>

        <figure className="relative min-h-[28rem] lg:min-h-full">
          <img
            src="/img/sections/rig-dusk.webp"
            alt=""
            width={1267}
            height={1584}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}

export function Quote({ locale, t }: Props) {
  const q = t.quote;
  const services = serviceSlugsInOrder.map((slug) => ({ slug, name: t.services.items[slug].name }));
  return (
    <section id="quote" className="scroll-mt-20 border-t border-hull bg-deep py-24 sm:py-32">
      <div className={`${shell} grid gap-12 lg:grid-cols-12`}>
        <div className="lg:col-span-4">
          <h2 className={h2}>{q.title}</h2>
          <p id="quote-lead" className="mt-5 max-w-[30rem] text-lg leading-relaxed text-mist">
            {q.lead}
          </p>
        </div>
        <div className="lg:col-span-8">
          <QuoteForm locale={locale} t={q} services={services} whatsapp={t.contact.whatsappAction} />
        </div>
      </div>
    </section>
  );
}
