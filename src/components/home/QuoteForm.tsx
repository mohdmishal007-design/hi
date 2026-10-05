"use client";

import { ChevronDown, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Dictionary } from "@/content";
import { serviceSlugs, site, type ServiceSlug } from "@/content/site";
import { href, type Locale } from "@/lib/i18n";

type Props = { locale: Locale; t: Dictionary["quote"]; services: { slug: ServiceSlug; name: string }[]; whatsapp: string };

type Values = {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  mode: string;
  from: string;
  to: string;
  incoterm: string;
  cargo: string;
  weight: string;
  ready: string;
  needs: string[];
  message: string;
  consent: boolean;
};
type Field = Exclude<keyof Values, "needs">;
type Status = "idle" | "sending" | "sent" | "mailto" | "error";

const EMPTY: Values = {
  name: "",
  company: "",
  email: "",
  phone: "",
  service: "",
  mode: "",
  from: "",
  to: "",
  incoterm: "",
  cargo: "",
  weight: "",
  ready: "",
  needs: [],
  message: "",
  consent: false,
};
const REQUIRED: Field[] = ["name", "company", "email", "phone", "service", "from", "to", "consent"];
const INCOTERMS = ["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"];

const cell = "bg-deep px-4 pb-3 pt-3.5 transition-colors focus-within:bg-panel focus-within:shadow-[inset_0_0_0_2px_var(--color-sky)]";
const labelCls = "block text-[0.8125rem] font-medium text-mist";
const control = "mt-1 w-full bg-transparent py-1 text-base text-ice outline-none placeholder:text-dim";

const isSlug = (v: string | null): v is ServiceSlug => !!v && (serviceSlugs as readonly string[]).includes(v);

/** The quote request, laid out as a shipment brief in ruled cells. */
export default function QuoteForm({ locale, t, services, whatsapp }: Props) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [showSummary, setShowSummary] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const f = t.fields;

  const labels: Record<Field, string> = {
    name: f.name,
    company: f.company,
    email: f.email,
    phone: f.phone,
    service: f.service,
    mode: f.mode,
    from: f.from,
    to: f.to,
    incoterm: f.incoterm,
    cargo: f.cargo,
    weight: f.weight,
    ready: f.ready,
    message: f.message,
    consent: f.consentLink,
  };

  // Pre-select a service from ?service= or from any "#quote" link that names one.
  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("service");
    if (isSlug(fromQuery)) setValues((v) => ({ ...v, service: fromQuery }));
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest<HTMLElement>("[data-quote-service]");
      const slug = link?.dataset.quoteService ?? null;
      if (isSlug(slug)) setValues((v) => ({ ...v, service: slug }));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (showSummary) summary.current?.focus();
  }, [showSummary]);

  useEffect(() => {
    if (status === "sent" || status === "mailto") done.current?.focus();
  }, [status]);

  function check(field: Field, v: Values): string | undefined {
    const value = v[field];
    if (field === "consent") return v.consent ? undefined : t.errors.consent;
    if (REQUIRED.includes(field) && !String(value).trim()) return t.errors.required.replace("{field}", labels[field]);
    if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value))) return t.errors.email;
    if (field === "phone" && value && (String(value).replace(/\D/g, "").length < 7 || !/^[+()\d\s.-]+$/.test(String(value))))
      return t.errors.phone;
    return undefined;
  }

  const set = (field: Field, value: string | boolean) => {
    const next = { ...values, [field]: value } as Values;
    setValues(next);
    if (errors[field]) setErrors((e) => ({ ...e, [field]: check(field, next) }));
  };
  const blur = (field: Field) => setErrors((e) => ({ ...e, [field]: check(field, values) }));

  function briefText() {
    const svc = services.find((s) => s.slug === values.service)?.name ?? values.service;
    const lines: [string, string][] = [
      [f.name, values.name],
      [f.company, values.company],
      [f.email, values.email],
      [f.phone, values.phone],
      [f.service, svc],
      [f.mode, values.mode ? f.modes[values.mode as keyof typeof f.modes] : ""],
      [f.from, values.from],
      [f.to, values.to],
      [f.incoterm, values.incoterm],
      [f.cargo, values.cargo ? f.cargoTypes[values.cargo as keyof typeof f.cargoTypes] : ""],
      [f.weight, values.weight],
      [f.ready, values.ready],
      [f.needs, values.needs.map((n) => f.needsOptions[n as keyof typeof f.needsOptions]).join(", ")],
      [f.message, values.message],
    ];
    return { svc, body: lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n") };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: Partial<Record<Field, string>> = {};
    (Object.keys(labels) as Field[]).forEach((k) => {
      const err = check(k, values);
      if (err) found[k] = err;
    });
    setErrors(found);
    if (Object.keys(found).length) {
      setShowSummary(false);
      requestAnimationFrame(() => setShowSummary(true));
      return;
    }
    setShowSummary(false);
    const { svc, body } = briefText();

    if (site.formEndpoint) {
      setStatus("sending");
      try {
        const res = await fetch(site.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...values, service: svc, locale, _subject: `Shipment brief: ${svc}` }),
        });
        setStatus(res.ok ? "sent" : "error");
      } catch {
        setStatus("error");
      }
      return;
    }

    const subject = `Shipment brief: ${svc}, ${values.from} → ${values.to}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("mailto");
  }

  const errorList = (Object.keys(errors) as Field[]).filter((k) => errors[k]);
  const fieldProps = (field: Field) => ({
    id: `q-${field}`,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `q-${field}-error` : undefined,
    onBlur: () => blur(field),
  });
  const err = (field: Field) =>
    errors[field] ? (
      <p id={`q-${field}-error`} className="mt-1 text-[0.8125rem] text-alert">
        {errors[field]}
      </p>
    ) : null;

  if (status === "sent" || status === "mailto") {
    return (
      <div ref={done} tabIndex={-1} role="status" className="border border-hull bg-deep p-8 outline-none sm:p-10">
        <p className="font-display text-2xl font-semibold">{status === "sent" ? t.sentTitle : t.mailtoTitle}</p>
        <p className="mt-3 text-mist">{status === "sent" ? t.sentBody : t.mailtoBody}</p>
        <button type="button" className="btn btn-quiet mt-8" onClick={() => { setValues(EMPTY); setStatus("idle"); }}>
          {t.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={submit} aria-describedby="quote-lead">
      {showSummary && errorList.length > 0 && (
        <div ref={summary} tabIndex={-1} role="alert" aria-labelledby="quote-errors" className="mb-6 border border-alert/60 bg-alert/5 p-5 outline-none">
          <p id="quote-errors" className="font-semibold text-alert">
            {t.summaryTitle}
          </p>
          <ul className="mt-2 space-y-1 text-[0.9375rem]">
            {errorList.map((k) => (
              <li key={k}>
                <a href={`#q-${k}`} className="underline">
                  {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-px border border-hull bg-hull sm:grid-cols-2">
        {textCell({ field: "name", label: f.name, autoComplete: "name" })}
        {textCell({ field: "company", label: f.company, autoComplete: "organization" })}
        {textCell({ field: "email", label: f.email, type: "email", autoComplete: "email", ltr: true })}
        {textCell({ field: "phone", label: f.phone, type: "tel", autoComplete: "tel", placeholder: "+966", ltr: true })}

        <div className={`${cell} sm:col-span-2`}>
          <label htmlFor="q-service" className={labelCls}>
            {f.service}
          </label>
          {selectControl("service", f.servicePlaceholder, (
            <>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </>
          ))}
          {err("service")}
        </div>

        <fieldset className={`${cell} sm:col-span-2`}>
          <legend className={`${labelCls} float-start`}>
            {f.mode} <Optional t={t} />
          </legend>
          <div className="clear-both flex flex-wrap gap-2 pt-2">
            {(Object.keys(f.modes) as (keyof typeof f.modes)[]).map((m) => (
              <label key={m} className="cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={values.mode === m}
                  onChange={() => set("mode", m)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-[4px] px-3.5 py-2 text-[0.9375rem] shadow-[inset_0_0_0_1px_var(--color-hull)] transition-colors peer-checked:bg-signal peer-checked:text-white peer-checked:shadow-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-sky">
                  {f.modes[m]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {textCell({ field: "from", label: f.from, placeholder: f.placeHint })}
        {textCell({ field: "to", label: f.to, placeholder: f.placeHint })}

        <div className={cell}>
          <label htmlFor="q-incoterm" className={labelCls}>
            {f.incoterm} <Optional t={t} />
          </label>
          {selectControl("incoterm", f.unsure, (
            <>
            {INCOTERMS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </>
          ))}
        </div>
        <div className={cell}>
          <label htmlFor="q-cargo" className={labelCls}>
            {f.cargo} <Optional t={t} />
          </label>
          {selectControl("cargo", "—", (
            <>
            {(Object.keys(f.cargoTypes) as (keyof typeof f.cargoTypes)[]).map((c) => (
              <option key={c} value={c}>
                {f.cargoTypes[c]}
              </option>
            ))}
          </>
          ))}
        </div>

        {textCell({ field: "weight", label: f.weight, placeholder: f.weightHint, optional: true })}
        {textCell({ field: "ready", label: f.ready, type: "date", optional: true })}

        <fieldset className={`${cell} sm:col-span-2`}>
          <legend className={`${labelCls} float-start`}>
            {f.needs} <Optional t={t} />
          </legend>
          <div className="clear-both flex flex-col gap-2.5 pt-2 sm:flex-row sm:flex-wrap sm:gap-x-7">
            {(Object.keys(f.needsOptions) as (keyof typeof f.needsOptions)[]).map((n) => (
              <label key={n} className="flex cursor-pointer items-center gap-2.5 text-[0.9375rem]">
                <input
                  type="checkbox"
                  checked={values.needs.includes(n)}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, needs: e.target.checked ? [...v.needs, n] : v.needs.filter((x) => x !== n) }))
                  }
                  className="size-[18px] accent-[var(--color-signal)]"
                />
                {f.needsOptions[n]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className={`${cell} sm:col-span-2`}>
          <label htmlFor="q-message" className={labelCls}>
            {f.message} <Optional t={t} />
          </label>
          <textarea
            {...fieldProps("message")}
            rows={4}
            value={values.message}
            placeholder={f.messageHint}
            onChange={(e) => set("message", e.target.value)}
            className={`${control} resize-y`}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label className="flex max-w-[34rem] cursor-pointer items-start gap-3 text-[0.9375rem] leading-relaxed text-mist">
            <input
              {...fieldProps("consent")}
              type="checkbox"
              checked={values.consent}
              onChange={(e) => set("consent", e.target.checked)}
              className="mt-1 size-[18px] shrink-0 accent-[var(--color-signal)]"
            />
            <span>
              {f.consent}{" "}
              <Link href={href(locale, "/privacy/")} className="text-ice underline">
                {f.consentLink}
              </Link>
              .
            </span>
          </label>
          <div className="ps-[30px]">{err("consent")}</div>
        </div>
        <button type="submit" disabled={status === "sending"} className="btn btn-solid shrink-0 justify-center disabled:opacity-60">
          {status === "sending" ? t.sending : t.submit}
        </button>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-5 text-[0.9375rem] text-alert">
          <strong>{t.errorTitle}</strong> {t.errorBody}{" "}
          <a href={`mailto:${site.email}`} className="ltr underline">
            {site.email}
          </a>
          .
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-hull pt-6 text-[0.9375rem]">
        <a href={site.whatsappHref} rel="noopener" className="flex items-center gap-2 hover:underline">
          <MessageCircle aria-hidden size={18} className="text-sky" />
          {whatsapp}
        </a>
        <a href={site.phoneHref} className="flex items-center gap-2 hover:underline">
          <Phone aria-hidden size={18} className="text-sky" />
          <span className="ltr tabular">{site.phone}</span>
        </a>
      </div>
    </form>
  );

  function textCell(p: {
    field: Field;
    label: string;
    type?: string;
    autoComplete?: string;
    placeholder?: string;
    optional?: boolean;
    ltr?: boolean;
  }) {
    return (
      <div className={cell}>
        <label htmlFor={`q-${p.field}`} className={labelCls}>
          {p.label} {p.optional && <Optional t={t} />}
        </label>
        <input
          {...fieldProps(p.field)}
          type={p.type ?? "text"}
          autoComplete={p.autoComplete}
          placeholder={p.placeholder}
          value={String(values[p.field])}
          onChange={(e) => set(p.field, e.target.value)}
          dir={p.ltr ? "ltr" : undefined}
          className={`${control} ${p.ltr ? "rtl:text-right" : ""}`}
        />
        {err(p.field)}
      </div>
    );
  }

  function selectControl(field: Field, placeholder: string, children: ReactNode) {
    return (
      <div className="relative">
        <select
          {...fieldProps(field)}
          value={String(values[field])}
          onChange={(e) => set(field, e.target.value)}
          className={`${control} cursor-pointer appearance-none pe-8 [&>option]:bg-deep`}
        >
          <option value="">{placeholder}</option>
          {children}
        </select>
        <ChevronDown aria-hidden size={18} className="pointer-events-none absolute end-0 top-1/2 -translate-y-1/2 text-mist" />
      </div>
    );
  }
}

function Optional({ t }: { t: Dictionary["quote"] }) {
  return <span className="font-normal text-dim">({t.optional})</span>;
}
