import type { Lang } from '../i18n/ui';

export interface Periode {
  startDate?: Date;
  endDate?: Date;
  year?: number;
}

const FORMAT: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };

/** « janvier 2016 – novembre 2018 », « 2024 », ou null sans aucune date. */
export function formaterPeriode(lang: Lang, periode: Periode): string | null {
  if (periode.year !== undefined) return String(periode.year);
  if (periode.startDate === undefined) return null;
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  const debut = periode.startDate.toLocaleDateString(locale, FORMAT);
  const fin = periode.endDate
    ? periode.endDate.toLocaleDateString(locale, FORMAT)
    : lang === 'fr'
      ? "Aujourd'hui"
      : 'Present';
  return `${debut} – ${fin}`;
}
