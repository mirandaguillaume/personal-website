// Génère les PDF du CV (FR et EN) à partir des pages construites, puis
// enregistre l'empreinte des sources que le build vérifie. À lancer en local
// après toute modification du CV : npm run cv:pdf. Jamais exécuté sur Vercel.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { preview } from 'astro';
import { chromium } from 'playwright';
import {
  calculerEmpreinte,
  FICHIER_EMPREINTE,
  listerSourcesCv,
} from '../src/cv/empreinte.ts';

const PORT = 4329;
const PAGES_MAX = 2;
const PAGES = [
  { lang: 'fr', chemin: '/cv/' },
  { lang: 'en', chemin: '/en/cv/' },
];

async function attendreServeur(url: string): Promise<void> {
  for (let essai = 0; essai < 60; essai++) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // le serveur démarre encore
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Serveur injoignable : ${url}`);
}

async function portLibre(url: string): Promise<boolean> {
  try {
    await fetch(url);
    return false;
  } catch {
    return true;
  }
}

/** Nombre de pages d'un PDF produit par Chromium (objets /Type /Page). */
function compterPages(pdf: Buffer): number {
  return (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
}

// Un serveur déjà présent sur le port (un aperçu resté ouvert, un autre
// clone) servirait un autre dist/ que celui qu'on certifie.
if (!(await portLibre(`http://127.0.0.1:${PORT}/`))) {
  throw new Error(
    `Le port ${PORT} est déjà occupé : arrêtez le serveur qui l'utilise.`,
  );
}

execFileSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, CV_PDF_GENERATION: '1' },
});

// Serveur d'aperçu dans ce même processus (API d'Astro) : `astro preview` en
// ligne de commande délègue à un processus qu'on ne peut plus arrêter.
const apercu = await preview({
  root: '.',
  logLevel: 'error',
  server: { port: PORT, host: '127.0.0.1' },
});

try {
  await attendreServeur(`http://127.0.0.1:${PORT}/cv/`);
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage();
  for (const { lang, chemin } of PAGES) {
    await page.goto(`http://127.0.0.1:${PORT}${chemin}`, {
      waitUntil: 'networkidle',
    });
    await page.emulateMedia({ media: 'print' });
    const fichier = `public/cv/guillaume-miranda-cv-${lang}.pdf`;
    const pdf = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
    });
    const pages = compterPages(pdf);
    if (pages > PAGES_MAX) {
      throw new Error(
        `${fichier} ferait ${pages} pages (${PAGES_MAX} au plus).`,
      );
    }
    writeFileSync(fichier, pdf);
    console.log(`PDF écrit : ${fichier} (${pages} pages)`);
  }
  await navigateur.close();
} finally {
  await apercu.stop();
}

const empreinte = calculerEmpreinte(listerSourcesCv(), (chemin) =>
  readFileSync(chemin, 'utf-8'),
);
writeFileSync(FICHIER_EMPREINTE, `${empreinte}\n`);
console.log(`Empreinte enregistrée : ${FICHIER_EMPREINTE}`);
