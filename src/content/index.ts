import type { Locale } from "@/lib/i18n";
import { ar } from "./ar";
import { en } from "./en";
import type { Dictionary } from "./types";

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export const getDictionary = (locale: Locale) => dictionaries[locale];

export type { Dictionary, ServiceCopy } from "./types";
