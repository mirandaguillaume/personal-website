import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Empreinte des sources du CV, enregistrée à côté des PDF générés : le build
 * la recalcule et refuse un PDF qui ne correspond plus aux données. Elle porte
 * sur les contenus et non sur les dates, qu'un clone (Vercel) réinitialise.
 */
export function calculerEmpreinte(
  chemins: string[],
  lire: (chemin: string) => string,
): string {
  const hash = createHash('sha256');
  for (const chemin of [...chemins].sort()) {
    hash.update(`${chemin}\0${lire(chemin)}\0`);
  }
  return hash.digest('hex');
}

const COMPOSANTS_CV = 'src/components/cv';

/** Toutes les sources qui changent le contenu ou la mise en page du CV. */
export function listerSourcesCv(): string[] {
  return [
    'src/data/experience.json',
    'src/data/offers.json',
    'src/data/skills.json',
    'src/data/education.json',
    'src/data/engagements.json',
    'src/components/TimelineItem.astro',
    'src/pages/cv.astro',
    'src/pages/en/cv.astro',
    'src/i18n/ui.ts',
    'src/styles/cv.css',
    'src/styles/cv-print.css',
    'src/cv/periode.ts',
    ...readdirSync(COMPOSANTS_CV).map((nom) => join(COMPOSANTS_CV, nom)),
  ];
}

export const FICHIER_EMPREINTE = 'public/cv/empreinte.txt';
